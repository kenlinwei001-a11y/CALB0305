import React, { useState, useCallback, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  X,
  MousePointer2,
  GitBranch,
  Database,
  Box,
  Zap,
  Move,
} from 'lucide-react';
import { OntologyNode, OntologyLink, OntologyData } from '../types';

// 节点类型定义 - 只有两种：推演节点和数据节点
const NODE_TYPES = [
  {
    type: 'simulation' as const,
    name: '推演节点',
    color: '#6b46c1',
    bgColor: '#f3e8ff',
    icon: Zap,
    description: '负责推演分析，输出决策建议'
  },
  {
    type: 'data' as const,
    name: '数据节点',
    color: '#2b6cb0',
    bgColor: '#dbeafe',
    icon: Database,
    description: '提供数据支持推演分析'
  }
];

// 关系类型定义
const RELATION_TYPES = [
  { value: 'contains', label: '包含', description: '父级包含子级' },
  { value: 'depends_on', label: '依赖于', description: 'A依赖B' },
  { value: 'produces', label: '产出', description: 'A产生B' },
  { value: 'consumes', label: '消耗', description: 'A消耗B' },
  { value: 'controls', label: '控制', description: 'A控制B' },
  { value: 'measures', label: '测量', description: 'A测量B' },
  { value: 'triggers', label: '触发', description: 'A触发B' },
  { value: 'enables', label: '使能', description: 'A使能B' },
  { value: 'influences', label: '影响', description: 'A影响B' },
  { value: 'associates', label: '关联', description: 'A关联B' }
];

interface GraphNode extends OntologyNode {
  x: number;
  y: number;
  description?: string;
  properties?: Record<string, any>;
}

interface GraphLink extends OntologyLink {
  id: string;
}

interface OntologyGraphEditorProps {
  scenarioId: string;
  initialData: OntologyData;
  onSave: (data: OntologyData) => void;
  onClose: () => void;
}

const OntologyGraphEditor: React.FC<OntologyGraphEditorProps> = ({
  scenarioId,
  initialData,
  onSave,
  onClose
}) => {
  // 节点和连线状态
  const [nodes, setNodes] = useState<GraphNode[]>(
    initialData.nodes.map((n, i) => ({
      ...n,
      x: 100 + (i % 5) * 200,
      y: 100 + Math.floor(i / 5) * 150,
      description: '',
      properties: {}
    }))
  );
  const [links, setLinks] = useState<GraphLink[]>(
    initialData.links.map((l, i) => ({ ...l, id: `link_${i}` }))
  );

  // 选中的节点和连线
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // 编辑模式
  const [mode, setMode] = useState<'select' | 'connect' | 'pan'>('select');
  const [connectingSource, setConnectingSource] = useState<string | null>(null);

  // 画布状态
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // 添加新节点
  const addNode = (nodeType: 'simulation' | 'data') => {
    const typeConfig = NODE_TYPES.find(t => t.type === nodeType);
    if (!typeConfig) return;

    const newNode: GraphNode = {
      id: `node_${Date.now()}`,
      label: `${typeConfig.name}_${nodes.filter(n => n.group === nodeType).length + 1}`,
      type: nodeType,
      group: nodeType,
      x: 400 - offset.x,
      y: 300 - offset.y,
      description: '',
      properties: {},
      data_readiness: 80
    };

    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedLinkId(null);
  };

  // 删除节点
  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setLinks(links.filter(l => l.source !== nodeId && l.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // 删除连线
  const deleteLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
    if (selectedLinkId === linkId) setSelectedLinkId(null);
  };

  // 开始连线
  const startConnection = (nodeId: string) => {
    if (connectingSource === nodeId) {
      setConnectingSource(null);
    } else if (connectingSource) {
      // 创建连线
      const existingLink = links.find(
        l => l.source === connectingSource && l.target === nodeId
      );
      if (!existingLink && connectingSource !== nodeId) {
        const newLink: GraphLink = {
          id: `link_${Date.now()}`,
          source: connectingSource,
          target: nodeId,
          relation: 'associates'
        };
        setLinks([...links, newLink]);
        setSelectedLinkId(newLink.id);
      }
      setConnectingSource(null);
      setMode('select');
    } else {
      setConnectingSource(nodeId);
    }
  };

  // 更新节点属性
  const updateNode = (nodeId: string, updates: Partial<GraphNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  // 更新连线关系
  const updateLinkRelation = (linkId: string, relation: string) => {
    setLinks(links.map(l => l.id === linkId ? { ...l, relation } : l));
  };

  // 节点拖拽
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (mode !== 'select') return;
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setSelectedLinkId(null);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialNodeX = node.x;
    const initialNodeY = node.y;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;
      updateNode(nodeId, { x: initialNodeX + dx, y: initialNodeY + dy });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 画布拖拽
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && (e.target as HTMLElement).dataset.role !== 'grid-bg') return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // 缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.max(0.5, Math.min(2, s * delta)));
  };

  // 保存
  const handleSave = () => {
    onSave({
      nodes: nodes.map(({ id, label, type, group, data_readiness }) => ({
        id, label, type, group, data_readiness
      })),
      links: links.map(({ source, target, relation }) => ({
        source, target, relation
      }))
    });
  };

  // 获取选中节点
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedLink = links.find(l => l.id === selectedLinkId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <GitBranch className="text-gray-600" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">低代码图谱编辑器</h2>
              <p className="text-xs text-slate-500">拖拽组件构建业务语义知识图谱</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 模式切换 */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 mr-4">
              <button
                onClick={() => { setMode('select'); setConnectingSource(null); }}
                className={`p-2 rounded ${mode === 'select' ? 'bg-indigo-100 text-gray-600' : 'text-slate-500 hover:bg-slate-100'}`}
                title="选择模式"
              >
                <MousePointer2 size={18} />
              </button>
              <button
                onClick={() => { setMode('connect'); setConnectingSource(null); }}
                className={`p-2 rounded ${mode === 'connect' ? 'bg-indigo-100 text-gray-600' : 'text-slate-500 hover:bg-slate-100'}`}
                title="连线模式"
              >
                <GitBranch size={18} />
              </button>
              <button
                onClick={() => { setMode('pan'); setConnectingSource(null); }}
                className={`p-2 rounded ${mode === 'pan' ? 'bg-indigo-100 text-gray-600' : 'text-slate-500 hover:bg-slate-100'}`}
                title="拖拽画布"
              >
                <Move size={18} />
              </button>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm font-medium"
            >
              <Save size={16} className="mr-2" />
              保存
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Library */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm">组件库</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {NODE_TYPES.map(nodeType => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className="w-full flex items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: nodeType.bgColor }}
                    >
                      <Icon size={20} style={{ color: nodeType.color }} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-slate-700 text-sm">{nodeType.name}</div>
                      <div className="text-xs text-slate-400">{nodeType.description}</div>
                    </div>
                    <Plus size={16} className="text-slate-300 group-hover:text-indigo-500" />
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="p-3 border-t border-slate-200 bg-slate-100">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>推演节点:</span>
                  <span className="font-medium">{nodes.filter(n => n.group === 'simulation').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>数据节点:</span>
                  <span className="font-medium">{nodes.filter(n => n.group === 'data').length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                  <span>连线数量:</span>
                  <span className="font-medium">{links.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 relative overflow-hidden bg-slate-100">
            {/* Grid Background */}
            <div
              ref={canvasRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                  linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                `,
                backgroundSize: `${20 * scale}px ${20 * scale}px`,
                backgroundPosition: `${offset.x}px ${offset.y}px`
              }}
              data-role="grid-bg"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleWheel}
            >
              {/* Canvas Content */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: '0 0'
                }}
              >
                {/* Links */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                    <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                    </marker>
                  </defs>
                  {links.map(link => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;
                    const isSelected = link.id === selectedLinkId;
                    return (
                      <g key={link.id}>
                        <line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={isSelected ? '#6366f1' : '#94a3b8'}
                          strokeWidth={isSelected ? 3 : 2}
                          markerEnd={isSelected ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                          className="pointer-events-auto cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLinkId(link.id);
                            setSelectedNodeId(null);
                          }}
                        />
                        {/* Relation Label */}
                        <foreignObject
                          x={(source.x + target.x) / 2 - 40}
                          y={(source.y + target.y) / 2 - 12}
                          width="80"
                          height="24"
                        >
                          <div className="bg-white px-2 py-1 rounded text-xs text-center border border-slate-200 text-slate-600 shadow-sm">
                            {link.relation}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const nodeType = NODE_TYPES.find(t => t.type === node.group);
                  const Icon = nodeType?.icon || Box;
                  const isSelected = node.id === selectedNodeId;
                  const isConnecting = node.id === connectingSource;

                  return (
                    <div
                      key={node.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                        mode === 'select' ? 'cursor-move' : mode === 'connect' ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{ left: node.x, top: node.y }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mode === 'connect') {
                          startConnection(node.id);
                        } else {
                          setSelectedNodeId(node.id);
                          setSelectedLinkId(null);
                        }
                      }}
                    >
                      <div
                        className={`relative px-4 py-3 rounded-xl border-2 shadow-lg transition-all ${
                          isSelected
                            ? 'border-indigo-500 shadow-indigo-200'
                            : isConnecting
                            ? 'border-amber-400 shadow-amber-200'
                            : 'border-white hover:shadow-xl'
                        }`}
                        style={{ backgroundColor: nodeType?.bgColor || '#f1f5f9', minWidth: '140px' }}
                      >
                        {/* Delete Button */}
                        {isSelected && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {/* Connecting Indicator */}
                        {isConnecting && (
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center shadow-md">
                            <GitBranch size={14} />
                          </div>
                        )}

                        {/* Icon & Label */}
                        <div className="flex items-center space-x-2">
                          <Icon size={18} style={{ color: nodeType?.color }} />
                          <span className="font-semibold text-slate-700 text-sm truncate max-w-[100px]">
                            {node.label}
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: nodeType?.color, color: 'white' }}
                        >
                          {nodeType?.name}
                        </div>

                        {/* Data Readiness Badge */}
                        <div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            backgroundColor: (node.data_readiness || 0) >= 85 ? '#22c55e' :
                                            (node.data_readiness || 0) >= 60 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {node.data_readiness || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow border border-slate-200 text-sm text-slate-600">
                {mode === 'connect' && connectingSource ? (
                  <span className="text-gray-600">请选择目标节点完成连接...</span>
                ) : mode === 'connect' ? (
                  <span className="text-gray-600">点击节点开始连接</span>
                ) : (
                  <span>选中节点拖拽移动，点击配置属性</span>
                )}
              </div>
              <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow border border-slate-200 text-xs text-slate-500">
                缩放: {Math.round(scale * 100)}%
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            {!selectedNode && !selectedLink ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MousePointer2 size={48} className="mx-auto mb-3 opacity-30" />
                  <p>选择节点或连线编辑属性</p>
                </div>
              </div>
            ) : selectedNode ? (
              <>
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">节点属性</h3>
                  <p className="text-xs text-slate-500">ID: {selectedNode.id}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Label */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">名称</label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Node Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">节点类型</label>
                    <select
                      value={selectedNode.group}
                      onChange={(e) => {
                        const nodeType = e.target.value as 'simulation' | 'data';
                        updateNode(selectedNode.id, {
                          group: nodeType,
                          type: nodeType
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {NODE_TYPES.map(t => (
                        <option key={t.type} value={t.type}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">描述</label>
                    <textarea
                      value={selectedNode.description || ''}
                      onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                      placeholder="输入节点的业务描述..."
                    />
                  </div>

                  {/* Data Readiness */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      数据完备度: {selectedNode.data_readiness || 0}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedNode.data_readiness || 0}
                      onChange={(e) => updateNode(selectedNode.id, { data_readiness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Decision Properties */}
                  <div className="border-t border-slate-200 pt-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">决策属性</label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400">影响权重 (0-1)</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={selectedNode.properties?.weight || 0.5}
                          onChange={(e) => updateNode(selectedNode.id, {
                            properties: { ...selectedNode.properties, weight: parseFloat(e.target.value) }
                          })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">决策规则</label>
                        <select
                          value={selectedNode.properties?.rule || 'none'}
                          onChange={(e) => updateNode(selectedNode.id, {
                            properties: { ...selectedNode.properties, rule: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                        >
                          <option value="none">无</option>
                          <option value="must">必须满足</option>
                          <option value="should">建议满足</option>
                          <option value="if">条件触发</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">阈值条件</label>
                        <input
                          type="text"
                          value={selectedNode.properties?.threshold || ''}
                          onChange={(e) => updateNode(selectedNode.id, {
                            properties: { ...selectedNode.properties, threshold: e.target.value }
                          })}
                          placeholder="例如: > 100"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : selectedLink && (
              <>
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">连线属性</h3>
                  <p className="text-xs text-slate-500">ID: {selectedLink.id}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">关系类型</label>
                    <select
                      value={selectedLink.relation}
                      onChange={(e) => updateLinkRelation(selectedLink.id, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {RELATION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label} - {type.description}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 space-y-1">
                      <div><span className="font-medium">源节点:</span> {nodes.find(n => n.id === selectedLink.source)?.label}</div>
                      <div><span className="font-medium">目标节点:</span> {nodes.find(n => n.id === selectedLink.target)?.label}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteLink(selectedLink.id)}
                    className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                  >
                    删除连线
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OntologyGraphEditor;
