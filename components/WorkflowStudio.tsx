import React, { useState, useRef, useCallback } from 'react';
import {
  Play, Pause, Square, Save, Plus, Trash2, Copy, Settings,
  Database, GitBranch, Calculator, Target, Zap, AlertTriangle,
  CheckCircle, X, ChevronRight, MoreHorizontal, Clock, RotateCcw,
  LayoutGrid, List, Search, Filter, Download, Upload, GripHorizontal
} from 'lucide-react';
import { MOCK_WORKFLOWS, WORKFLOW_NODE_TEMPLATES } from '../constants';
import type { Workflow, WorkflowNode, WorkflowEdge, WorkflowNodeCategory } from '../types';

// Node Card Component
const NodeCard: React.FC<{
  node: WorkflowNode;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}> = ({ node, isSelected, onClick, onDelete }) => {
  const categoryColors: Record<string, string> = {
    data: 'bg-blue-50 border-blue-200 text-blue-700',
    semantic: 'bg-purple-50 border-purple-200 text-purple-700',
    reasoning: 'bg-amber-50 border-amber-200 text-amber-700',
    decision: 'bg-green-50 border-green-200 text-green-700',
    simulation: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    execution: 'bg-red-50 border-red-200 text-red-700',
    control: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  const categoryIcons: Record<string, React.ElementType> = {
    data: Database,
    semantic: Calculator,
    reasoning: GitBranch,
    decision: Target,
    simulation: Clock,
    execution: Zap,
    control: LayoutGrid
  };

  const Icon = categoryIcons[node.category] || Database;
  const statusIcons = {
    pending: <div className="w-2 h-2 rounded-full bg-gray-300" />,
    running: <RotateCcw size={12} className="animate-spin text-blue-500" />,
    success: <CheckCircle size={12} className="text-green-500" />,
    failed: <AlertTriangle size={12} className="text-red-500" />,
    skipped: <div className="w-2 h-2 rounded-full bg-gray-200" />
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all min-w-[200px] ${
        isSelected ? 'ring-2 ring-offset-2 ring-blue-500 ' + categoryColors[node.category] : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/50' : 'bg-gray-50'}`}>
          <Icon size={20} className={isSelected ? '' : 'text-gray-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70">{node.category}</span>
            {node.runtime && statusIcons[node.runtime.status]}
          </div>
          <h4 className="font-medium text-gray-900 mt-1">{node.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{node.description}</p>
        </div>
      </div>

      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// Node Palette Component
const NodePalette: React.FC<{
  onDragStart: (nodeType: string) => void;
}> = ({ onDragStart }) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkflowNodeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: WorkflowNodeCategory | 'all'; label: string; color: string }[] = [
    { id: 'all', label: '全部', color: 'bg-gray-100 text-gray-700' },
    { id: 'data', label: '数据', color: 'bg-blue-100 text-blue-700' },
    { id: 'semantic', label: '语义', color: 'bg-purple-100 text-purple-700' },
    { id: 'reasoning', label: '推理', color: 'bg-amber-100 text-amber-700' },
    { id: 'decision', label: '决策', color: 'bg-green-100 text-green-700' },
    { id: 'simulation', label: '仿真', color: 'bg-cyan-100 text-cyan-700' },
    { id: 'execution', label: '执行', color: 'bg-red-100 text-red-700' },
    { id: 'control', label: '控制', color: 'bg-gray-100 text-gray-700' }
  ];

  const filteredNodes = WORKFLOW_NODE_TEMPLATES.filter(node => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">节点库</h3>
        <p className="text-sm text-gray-500 mt-1">拖拽节点到画布</p>
      </div>

      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-2 border-b border-gray-100">
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat.id ? cat.color : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNodes.map((node, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => onDragStart(node.type)}
            className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={16} className="text-gray-300 group-hover:text-gray-500" />
              <span className="font-medium text-gray-900 text-sm">{node.name}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Property Panel Component
const PropertyPanel: React.FC<{
  selectedNode: WorkflowNode | null;
  onUpdate: (node: WorkflowNode) => void;
}> = ({ selectedNode, onUpdate }) => {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-400 mt-20">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p>选择节点查看属性</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">节点属性</h3>
        <p className="text-sm text-gray-500 mt-1">{selectedNode.type}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
          <input
            type="text"
            value={selectedNode.name}
            onChange={(e) => onUpdate({ ...selectedNode, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={selectedNode.description}
            onChange={(e) => onUpdate({ ...selectedNode, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">执行配置</label>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">超时时间 (秒)</span>
              <input
                type="number"
                value={selectedNode.execution.timeout}
                onChange={(e) => onUpdate({
                  ...selectedNode,
                  execution: { ...selectedNode.execution, timeout: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
              />
            </div>
            <div>
              <span className="text-xs text-gray-500">重试次数</span>
              <input
                type="number"
                value={selectedNode.execution.retry}
                onChange={(e) => onUpdate({
                  ...selectedNode,
                  execution: { ...selectedNode.execution, retry: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入</label>
          {selectedNode.input.map((input, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{input.name}</span>
                <span className="text-xs text-gray-500">{input.type}</span>
                {input.required && <span className="text-xs text-red-500">*</span>}
              </div>
              <p className="text-xs text-gray-500">{input.description}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出</label>
          {selectedNode.output.map((output, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{output.name}</span>
                <span className="text-xs text-gray-500">{output.type}</span>
              </div>
              <p className="text-xs text-gray-500">{output.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Workflow Studio Component
const WorkflowStudio: React.FC = () => {
  const [workflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(MOCK_WORKFLOWS[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'design' | 'debug' | 'monitor'>('design');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((nodeType: string) => {
    // Handle drag start
    console.log('Dragging:', nodeType);
  }, []);

  const handleNodeUpdate = useCallback((updatedNode: WorkflowNode) => {
    setSelectedWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    }));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setSelectedWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId)
    }));
    setSelectedNodeId(null);
  }, []);

  const selectedNode = selectedNodeId
    ? selectedWorkflow.nodes.find(n => n.id === selectedNodeId)
    : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Workflow Studio</h1>
              <p className="text-sm text-gray-500">编排工作流与业务逻辑</p>
            </div>
            <select
              value={selectedWorkflow.id}
              onChange={(e) => {
                const wf = workflows.find(w => w.id === e.target.value);
                if (wf) setSelectedWorkflow(wf);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {workflows.map(wf => (
                <option key={wf.id} value={wf.id}>{wf.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['design', 'debug', 'monitor'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'design' ? '设计' : mode === 'debug' ? '调试' : '监控'}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
              <Save size={18} /> 保存
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
              <Play size={18} /> 运行
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <NodePalette onDragStart={handleDragStart} />

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 bg-gray-50 relative overflow-auto"
        >
          <div className="min-w-[800px] min-h-[600px] p-8">
            {/* Workflow Info */}
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900">{selectedWorkflow.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedWorkflow.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>节点: {selectedWorkflow.nodes.length}</span>
                <span>边: {selectedWorkflow.edges.length}</span>
                <span>版本: {selectedWorkflow.version}</span>
                <span>运行: {selectedWorkflow.stats?.totalRuns || 0} 次</span>
              </div>
            </div>

            {/* Node Flow */}
            <div className="flex flex-col items-center gap-6">
              {selectedWorkflow.nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <NodeCard
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onDelete={() => handleNodeDelete(node.id)}
                  />
                  {idx < selectedWorkflow.nodes.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gray-300" />
                      <ChevronRight size={16} className="text-gray-400 -rotate-90" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <PropertyPanel
          selectedNode={selectedNode}
          onUpdate={handleNodeUpdate}
        />
      </div>
    </div>
  );
};

export default WorkflowStudio;
