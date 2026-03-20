import React, { useState, useEffect } from 'react';
import {
  Brain, Activity, AlertTriangle, CheckCircle, ChevronRight,
  Clock, Cpu, GitBranch, Lightbulb, Play, Shield, Zap,
  Target, TrendingUp, Users, X, ArrowRight, Sparkles,
  BarChart3, Workflow, Bot, FileText, Settings, RefreshCw
} from 'lucide-react';
import { MOCK_DECISION_SPACES, MOCK_AGENTS, MOCK_REASONING_CHAINS } from '../constants';
import type {
  DecisionSpace as DecisionSpaceType, ReasoningNode, Recommendation,
  DecisionAction, Agent, RiskFactor
} from '../types';

// Reasoning Chain Visualization Component
const ReasoningChainView: React.FC<{
  nodes: ReasoningNode[];
  onNodeClick?: (node: ReasoningNode) => void;
  selectedNode?: string;
}> = ({ nodes, onNodeClick, selectedNode }) => {
  const nodeColors: Record<string, string> = {
    anomaly: 'bg-red-500',
    object: 'bg-blue-500',
    metric: 'bg-cyan-500',
    causal: 'bg-purple-500',
    decision: 'bg-green-500',
    action: 'bg-orange-500',
    evidence: 'bg-gray-500',
    hypothesis: 'bg-yellow-500'
  };

  const nodeIcons: Record<string, React.ElementType> = {
    anomaly: AlertTriangle,
    object: Target,
    metric: BarChart3,
    causal: GitBranch,
    decision: Lightbulb,
    action: Play,
    evidence: FileText,
    hypothesis: Sparkles
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {nodes.map((node, index) => {
          const Icon = nodeIcons[node.type] || Brain;
          const isSelected = selectedNode === node.id;
          const isCompleted = node.status === 'completed';

          return (
            <div
              key={node.id}
              onClick={() => onNodeClick?.(node)}
              className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50 ring-2 ring-blue-500'
                  : 'bg-white hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {/* Node indicator */}
              <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center ${
                isCompleted ? nodeColors[node.type] : 'bg-gray-300'
              }`}>
                <Icon size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">{node.type}</span>
                  {isCompleted && <CheckCircle size={14} className="text-green-500" />}
                  <span className="text-xs text-gray-400">
                    置信度: {(node.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{node.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{node.description}</p>

                {node.evidence && node.evidence.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {node.evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs bg-gray-50 p-2 rounded">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{ev.type}</span>
                        <span className="text-gray-600 flex-1">{ev.content}</span>
                        <span className="text-gray-400">{(ev.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ChevronRight size={16} className="text-gray-400 mt-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Agent Status Card
const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const statusColors: Record<string, string> = {
    idle: 'bg-gray-100 text-gray-600',
    perceiving: 'bg-blue-100 text-blue-600',
    understanding: 'bg-cyan-100 text-cyan-600',
    reasoning: 'bg-purple-100 text-purple-600',
    deciding: 'bg-yellow-100 text-yellow-600',
    executing: 'bg-green-100 text-green-600',
    learning: 'bg-pink-100 text-pink-600',
    error: 'bg-red-100 text-red-600'
  };

  const agentIcons: Record<string, React.ElementType> = {
    planner: Target,
    analyst: BarChart3,
    reasoner: Brain,
    executor: Play,
    auditor: Shield,
    coordinator: Users,
    learner: Sparkles
  };

  const Icon = agentIcons[agent.type] || Bot;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[agent.status].split(' ')[0]}`}>
            <Icon size={20} className={statusColors[agent.status].split(' ')[1].replace('text-', '') === 'gray-600' ? 'text-gray-600' : statusColors[agent.status].split(' ')[1].replace('text-', '') === 'blue-600' ? 'text-blue-600' : statusColors[agent.status].split(' ')[1].replace('text-', '') === 'purple-600' ? 'text-purple-600' : 'text-green-600'} style={{ color: statusColors[agent.status].includes('blue') ? '#2563eb' : statusColors[agent.status].includes('purple') ? '#9333ea' : statusColors[agent.status].includes('green') ? '#16a34a' : statusColors[agent.status].includes('yellow') ? '#ca8a04' : statusColors[agent.status].includes('red') ? '#dc2626' : statusColors[agent.status].includes('pink') ? '#db2777' : statusColors[agent.status].includes('cyan') ? '#0891b2' : '#4b5563' }} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{agent.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[agent.status]}`}>
              {agent.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-gray-900">
            {(agent.metrics.successRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">成功率</div>
        </div>
      </div>

      {agent.currentTask && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Activity size={14} className="text-blue-600" />
            <span className="text-blue-900 font-medium">执行中:</span>
            <span className="text-blue-700">{agent.currentTask.description}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-900">{agent.metrics.totalTasks}</div>
          <div className="text-xs text-gray-500">任务数</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-900">{agent.metrics.averageLatency}ms</div>
          <div className="text-xs text-gray-500">平均延迟</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-900">{(agent.metrics.averageConfidence * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-500">置信度</div>
        </div>
      </div>
    </div>
  );
};

// Risk Assessment Panel
const RiskAssessmentPanel: React.FC<{
  riskAssessment: DecisionSpaceType['riskAssessment'];
}> = ({ riskAssessment }) => {
  const riskColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${riskColors[riskAssessment.overallRisk]}`}>
          <Shield size={28} className="text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-500">总体风险</div>
          <div className="text-xl font-semibold text-gray-900 capitalize">
            {riskAssessment.overallRisk === 'low' ? '低风险' :
             riskAssessment.overallRisk === 'medium' ? '中等风险' :
             riskAssessment.overallRisk === 'high' ? '高风险' : '极高风险'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {riskAssessment.factors.map((factor, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{factor.category}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                factor.riskScore > 0.5 ? 'bg-red-100 text-red-700' :
                factor.riskScore > 0.3 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                风险分: {(factor.riskScore * 100).toFixed(0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>影响: {(factor.impact * 100).toFixed(0)}%</span>
              <span>概率: {(factor.probability * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      {riskAssessment.mitigationSuggestions.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-blue-600" />
            <span className="font-medium text-blue-900">缓解建议</span>
          </div>
          <ul className="space-y-1">
            {riskAssessment.mitigationSuggestions.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main Decision Space Component
const DecisionSpace: React.FC = () => {
  const [activeSpace] = useState<DecisionSpaceType>(MOCK_DECISION_SPACES[0]);
  const [selectedNode, setSelectedNode] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'reasoning' | 'recommendations' | 'actions' | 'agents'>('reasoning');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteAction = (action: DecisionAction) => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {activeSpace.currentFocus.type === 'anomaly' ? '异常检测' :
                 activeSpace.currentFocus.type === 'opportunity' ? '机会识别' :
                 activeSpace.currentFocus.type === 'task' ? '任务执行' : '查询分析'}
              </span>
              <span className="text-sm text-gray-500">{activeSpace.id}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{activeSpace.currentFocus.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{activeSpace.currentFocus.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">推理置信度</div>
              <div className="text-2xl font-semibold text-blue-600">
                {(activeSpace.reasoningChain.result?.confidence || 0) * 100}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Brain size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Navigation */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
            {[
              { id: 'reasoning', icon: GitBranch, label: '推理链' },
              { id: 'recommendations', icon: Lightbulb, label: '建议' },
              { id: 'actions', icon: Play, label: '动作' },
              { id: 'agents', icon: Bot, label: 'Agent' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Center Panel - Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'reasoning' && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">推理链分析</h2>
                  <p className="text-sm text-gray-600">{activeSpace.reasoningChain.description}</p>
                </div>
                <ReasoningChainView
                  nodes={activeSpace.reasoningChain.nodes}
                  onNodeClick={setSelectedNode}
                  selectedNode={selectedNode}
                />

                {activeSpace.reasoningChain.result && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={20} className="text-green-600" />
                      <h3 className="font-semibold text-gray-900">推理结论</h3>
                    </div>
                    <p className="text-gray-700">{activeSpace.reasoningChain.result.conclusion}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">决策建议</h2>
                {activeSpace.recommendations.map((rec, idx) => (
                  <div key={rec.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rec.priority === 'high' ? 'bg-red-100' :
                          rec.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <Lightbulb size={20} className={`${
                            rec.priority === 'high' ? 'text-red-600' :
                            rec.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority === 'high' ? '高优先级' :
                             rec.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">建议 #{idx + 1}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    <div className="p-3 bg-green-50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="text-green-900 font-medium">预期效果:</span>
                        <span className="text-green-700">{rec.expectedOutcome}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rec.supportingEvidence.map((evidence, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {evidence}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">可用动作</h2>
                {activeSpace.availableActions.map((action, idx) => (
                  <div key={action.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          action.type === 'auto' ? 'bg-green-100' :
                          action.type === 'approval_required' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <Play size={20} className={`${
                            action.type === 'auto' ? 'text-green-600' :
                            action.type === 'approval_required' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{action.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            action.type === 'auto' ? 'bg-green-100 text-green-700' :
                            action.type === 'approval_required' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {action.type === 'auto' ? '自动执行' :
                             action.type === 'approval_required' ? '需要审批' : '手动执行'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExecuteAction(action)}
                        disabled={isExecuting || action.type === 'approval_required'}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                          action.type === 'auto'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : action.type === 'approval_required'
                            ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isExecuting ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Play size={16} />
                        )}
                        {action.type === 'auto' ? '执行' :
                         action.type === 'approval_required' ? '待审批' : '执行'}
                      </button>
                    </div>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="text-gray-500">预期影响:</span>
                        <p className="text-gray-900 font-medium">{action.estimatedImpact}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="text-gray-500">风险评估:</span>
                        <p className={`font-medium ${
                          action.riskLevel === 'low' ? 'text-green-600' :
                          action.riskLevel === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {action.riskLevel === 'low' ? '低风险' :
                           action.riskLevel === 'medium' ? '中等风险' : '高风险'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent 执行监控</h2>
                <div className="grid gap-4">
                  {MOCK_AGENTS.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Risk & Summary */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4">
            <RiskAssessmentPanel riskAssessment={activeSpace.riskAssessment} />

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">执行统计</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">推理节点</span>
                  <span className="font-semibold text-gray-900">{activeSpace.reasoningChain.nodes.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">推荐方案</span>
                  <span className="font-semibold text-gray-900">{activeSpace.recommendations.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">待执行动作</span>
                  <span className="font-semibold text-gray-900">{activeSpace.availableActions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">活跃Agent</span>
                  <span className="font-semibold text-gray-900">
                    {MOCK_AGENTS.filter(a => a.status !== 'idle').length}/{MOCK_AGENTS.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionSpace;
