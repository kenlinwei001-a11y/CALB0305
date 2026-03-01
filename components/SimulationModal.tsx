import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X, Box, FileText, Upload, FileUp, CheckCircle, Zap,
  MessageCircle, ChevronRight, Loader2, Lightbulb, Database,
  Maximize2, Minimize2, Plus, Search
} from 'lucide-react';
import type { OntologyNode, OntologyLink, SimulationNodeConfig } from '../types';
import { MOCK_SKILLS, isSimulationNode, getSimulationConfig } from '../constants';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: OntologyNode;
  config: SimulationNodeConfig;
  allNodes?: OntologyNode[];
  allLinks?: OntologyLink[];
}

interface Solution {
  id: string;
  name: string;
  description: string;
  metrics: Record<string, number>;
  confidence: number;
  cost?: number;
  timeline?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  solutionId?: string; // 关联到特定方案
}

interface ParamDataStatus {
  paramId: string;
  hasData: boolean;
  value?: any;
  importedFiles: string[];
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, node, config, allNodes = [], allLinks = [] }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'report'>('analysis');
  const [selectedParamId, setSelectedParamId] = useState<string | null>(null);
  const [paramDataStatus, setParamDataStatus] = useState<Record<string, ParamDataStatus>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [showSkillPanel, setShowSkillPanel] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSolutionChat, setShowSolutionChat] = useState(false);
  const [solutionChatInput, setSolutionChatInput] = useState('');
  const [solutionMessages, setSolutionMessages] = useState<ChatMessage[]>([]);
  const [solutionAdditionalNodes, setSolutionAdditionalNodes] = useState<Record<string, string[]>>({});
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [selectedNodesForSolution, setSelectedNodesForSolution] = useState<string[]>([]);
  const [childSimulationResults, setChildSimulationResults] = useState<Record<string, Solution[]>>({});
  const [activeChildSimulation, setActiveChildSimulation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取当前推演节点的下级推演节点
  const childSimulationNodes = useMemo(() => {
    if (!allNodes.length || !allLinks.length) return [];

    // 通过连接关系找到下级节点（当前节点是source的链接）
    const childNodeIds = allLinks
      .filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        return sourceId === node.id;
      })
      .map(link => typeof link.target === 'string' ? link.target : (link.target as any).id);

    // 过滤出也是推演节点的下级节点
    const childSims = allNodes.filter(n =>
      childNodeIds.includes(n.id) &&
      isSimulationNode(n.id)
    );

    return childSims;
  }, [allNodes, allLinks, node.id]);

  // 获取所有下级节点（用于数据引用）
  const allChildNodes = useMemo(() => {
    if (!allNodes.length || !allLinks.length) return [];

    const childNodeIds = allLinks
      .filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        return sourceId === node.id;
      })
      .map(link => typeof link.target === 'string' ? link.target : (link.target as any).id);

    return allNodes.filter(n => childNodeIds.includes(n.id));
  }, [allNodes, allLinks, node.id]);

  // 初始化参数数据状态
  useEffect(() => {
    if (config?.inputParams?.length > 0) {
      const initialStatus: Record<string, ParamDataStatus> = {};
      config.inputParams.forEach(param => {
        initialStatus[param.id] = {
          paramId: param.id,
          hasData: false,
          value: undefined,
          importedFiles: []
        };
      });
      setParamDataStatus(initialStatus);
      setSelectedParamId(config.inputParams[0]?.id || null);
    }
  }, [config]);

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      const childSimNodes = childSimulationNodes.map(n => `• ${n.label} (推演节点)`).join('\n');
      const childBizNodes = allChildNodes
        .filter(n => !isSimulationNode(n.id))
        .slice(0, 5)
        .map(n => `• ${n.label}`)
        .join('\n');

      let content = `欢迎使用"${node?.label}"推演分析！\n\n`;

      if (childSimulationNodes.length > 0) {
        content += `该推演需要以下下级推演节点的结果：\n${childSimNodes}\n\n`;
      }

      if (allChildNodes.length > childSimulationNodes.length) {
        content += `关联的业务节点：\n${childBizNodes}${allChildNodes.length > 5 ? '\n...' : ''}\n\n`;
      }

      content += `请先点击左侧的关联节点导入数据或推演结果，然后选择需要的技能，最后通过对话框与我交互。`;

      setMessages([{
        id: 'welcome',
        role: 'ai',
        content,
        timestamp: new Date()
      }]);
    }
  }, [node, config, childSimulationNodes, allChildNodes]);

  if (!isOpen || !node || !config) return null;

  const handleParamFileUpload = (paramId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setUploadedFiles(prev => ({
        ...prev,
        [paramId]: [...(prev[paramId] || []), ...fileArray]
      }));
      setParamDataStatus(prev => ({
        ...prev,
        [paramId]: {
          ...prev[paramId],
          hasData: true,
          importedFiles: [...(prev[paramId]?.importedFiles || []), ...fileArray.map(f => f.name)]
        }
      }));
    }
  };

  const removeParamFile = (paramId: string, fileIndex: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [paramId]: prev[paramId]?.filter((_, i) => i !== fileIndex) || []
    }));
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // 发送方案级对话消息
  const sendSolutionMessage = () => {
    if (!solutionChatInput.trim() || !selectedSolution) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: solutionChatInput,
      timestamp: new Date(),
      solutionId: selectedSolution
    };

    setSolutionMessages(prev => [...prev, userMessage]);
    setSolutionChatInput('');

    // 获取已关联的节点信息
    const linkedNodes = solutionAdditionalNodes[selectedSolution] || [];
    const linkedNodesInfo = linkedNodes.map(nodeId => {
      const nodeItem = allNodes.find(n => n.id === nodeId);
      return nodeItem ? `• ${nodeItem.label} (${getNodeLevelName(nodeItem.group)})` : '';
    }).filter(Boolean).join('\n');

    // 模拟AI回复
    setTimeout(() => {
      const solution = solutions.find(s => s.id === selectedSolution);
      let aiContent = `关于"${solution?.name}"方案：\n\n${solution?.description}\n\n该方案的置信度为${(solution?.confidence || 0) * 100}%，风险等级为${getRiskText(solution?.riskLevel || 'medium')}。`;

      // 如果有已关联节点，在回复中包含
      if (linkedNodesInfo) {
        aiContent += `\n\n【已关联节点】\n${linkedNodesInfo}\n\n这些节点将为方案提供更详细的数据支持。`;
      }

      aiContent += '\n\n您可以进一步询问该方案的实施细节、风险控制措施或优化建议。';

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiContent,
        timestamp: new Date(),
        solutionId: selectedSolution
      };
      setSolutionMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  // 基于新增节点重新推演
  const reRunSimulation = (solutionId: string) => {
    const linkedNodes = solutionAdditionalNodes[solutionId] || [];

    // 添加系统消息
    setSolutionMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'ai',
      content: linkedNodes.length > 0
        ? `正在基于新增的 ${linkedNodes.length} 个节点重新推演...\n\n已关联节点：\n${linkedNodes.map(id => {
          const nodeItem = allNodes.find(n => n.id === id);
          return nodeItem ? `• ${nodeItem.label}` : '';
        }).filter(Boolean).join('\n')}\n\n分析中，请稍候...`
        : '正在重新推演分析，请稍候...',
      timestamp: new Date(),
      solutionId: solutionId
    }]);

    setIsAnalyzing(true);

    // 模拟推演过程
    setTimeout(() => {
      setIsAnalyzing(false);

      // 基于关联节点数量调整方案指标
      const baseSolution = solutions.find(s => s.id === solutionId);
      if (baseSolution && linkedNodes.length > 0) {
        // 创建优化后的方案
        const confidenceBoost = Math.min(linkedNodes.length * 0.05, 0.15);
        const updatedSolution = {
          ...baseSolution,
          confidence: Math.min(baseSolution.confidence + confidenceBoost, 0.95),
          description: baseSolution.description + `\n\n【已优化】基于 ${linkedNodes.length} 个新增关联节点的数据分析，方案置信度提升 ${(confidenceBoost * 100).toFixed(0)}%。`
        };

        setSolutions(prev => prev.map(s => s.id === solutionId ? updatedSolution : s));

        setSolutionMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: `✅ 推演完成！\n\n基于新增的 ${linkedNodes.length} 个节点，方案置信度从 ${((baseSolution.confidence) * 100).toFixed(0)}% 提升至 ${((updatedSolution.confidence) * 100).toFixed(0)}%。\n\n优化内容：\n• 数据维度更丰富\n• 风险评估更精准\n• 实施路径更清晰\n\n您可以继续咨询或添加更多节点进行深入分析。`,
          timestamp: new Date(),
          solutionId: solutionId
        }]);
      } else {
        setSolutionMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: '✅ 推演完成！\n\n方案分析已更新。建议添加更多业务节点以获得更深入的洞察。',
          timestamp: new Date(),
          solutionId: solutionId
        }]);
      }
    }, 2000);
  };

  // 打开节点选择器
  const openNodeSelector = (solutionId: string) => {
    setSelectedSolution(solutionId);
    setSelectedNodesForSolution(solutionAdditionalNodes[solutionId] || []);
    setShowNodeSelector(true);
  };

  // 保存方案关联的节点
  const saveSolutionNodes = () => {
    if (selectedSolution) {
      setSolutionAdditionalNodes(prev => ({
        ...prev,
        [selectedSolution]: selectedNodesForSolution
      }));
      setShowNodeSelector(false);

      // 添加系统消息通知用户节点已添加
      const nodeNames = selectedNodesForSolution.map(id => {
        const nodeItem = allNodes.find(n => n.id === id);
        return nodeItem?.label || id;
      }).join('、');

      setSolutionMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: `✅ 已成功添加 ${selectedNodesForSolution.length} 个节点到本方案：\n${selectedNodesForSolution.map(id => {
          const nodeItem = allNodes.find(n => n.id === id);
          return `• ${nodeItem?.label || id} (${getNodeLevelName(nodeItem?.group)})`;
        }).join('\n')}\n\n您现在可以：\n1. 继续与我对话咨询方案详情\n2. 点击"重新推演"基于新增节点优化方案`,
        timestamp: new Date(),
        solutionId: selectedSolution
      }]);

      // 自动打开方案咨询对话框
      setShowSolutionChat(true);
    }
  };

  // 切换节点选择
  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodesForSolution(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // 导入下级推演节点的结果
  const importChildSimulationResults = (childNodeId: string) => {
    const childResults = childSimulationResults[childNodeId];
    if (!childResults || childResults.length === 0) {
      // 模拟生成下级推演结果
      const mockChildSolutions: Solution[] = [
        {
          id: `child_${childNodeId}_1`,
          name: '子级保守方案',
          description: '基于下级推演节点的保守分析结果',
          metrics: { '子级指标1': 80, '子级指标2': 75 },
          confidence: 0.85,
          riskLevel: 'low'
        },
        {
          id: `child_${childNodeId}_2`,
          name: '子级平衡方案',
          description: '基于下级推演节点的平衡分析结果',
          metrics: { '子级指标1': 90, '子级指标2': 85 },
          confidence: 0.78,
          riskLevel: 'medium'
        }
      ];
      setChildSimulationResults(prev => ({ ...prev, [childNodeId]: mockChildSolutions }));

      // 添加系统消息
      const childNode = allNodes.find(n => n.id === childNodeId);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: `📥 已导入下级推演节点「${childNode?.label || childNodeId}」的分析结果：\n\n• 子级保守方案：置信度 85%，风险等级 低\n• 子级平衡方案：置信度 78%，风险等级 中\n\n这些结果将作为当前推演的数据参考。`,
        timestamp: new Date()
      }]);
    }
    setActiveChildSimulation(childNodeId);
  };

  // 将下级推演结果应用到当前方案
  const applyChildResultToSolution = (childSolution: Solution) => {
    if (!selectedSolution) return;

    setSolutions(prev => prev.map(sol => {
      if (sol.id === selectedSolution) {
        return {
          ...sol,
          confidence: Math.min(sol.confidence + 0.05, 0.95),
          description: sol.description + `\n\n【已集成下级推演结果】\n引用方案：${childSolution.name}\n参考置信度：${(childSolution.confidence * 100).toFixed(0)}%`
        };
      }
      return sol;
    }));

    setSolutionMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'ai',
      content: `✅ 已将下级推演结果「${childSolution.name}」集成到当前方案「${solutions.find(s => s.id === selectedSolution)?.name}」。\n\n方案置信度已更新。`,
      timestamp: new Date(),
      solutionId: selectedSolution
    }]);
  };

  // 获取节点类型名称
  const getNodeLevelName = (group?: 'simulation' | 'data') => {
    switch (group) {
      case 'simulation': return '推演节点';
      case 'data': return '数据节点';
      default: return '节点';
    }
  };

  // 获取节点类型徽章颜色
  const getNodeLevelBadgeColor = (group?: 'simulation' | 'data') => {
    switch (group) {
      case 'simulation': return 'bg-purple-100 text-purple-700';
      case 'data': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // 获取节点层级颜色
  // 打开方案咨询对话框
  const openSolutionChat = (solutionId: string) => {
    setSelectedSolution(solutionId);
    setShowSolutionChat(true);

    // 获取已关联节点信息
    const linkedNodes = solutionAdditionalNodes[solutionId] || [];
    const solution = solutions.find(s => s.id === solutionId);

    if (solution && !solutionMessages.find(m => m.solutionId === solutionId)) {
      let welcomeContent = `您好！我是您的方案咨询助手。\n\n您正在查看"${solution.name}"方案，我可以为您解答：\n• 方案的具体实施步骤\n• 风险应对措施\n• 资源需求评估\n• 与其他方案的对比分析`;

      // 如果有已关联节点，在欢迎消息中显示
      if (linkedNodes.length > 0) {
        welcomeContent += `\n\n【已关联节点】\n${linkedNodes.map(id => {
          const nodeItem = allNodes.find(n => n.id === id);
          return `• ${nodeItem?.label || id} (${getNodeLevelName(nodeItem?.group)})`;
        }).join('\n')}\n\n点击"重新推演"可基于这些节点优化方案。`;
      } else {
        welcomeContent += '\n\n💡 提示：点击"添加节点"可从业务流程图谱中选择相关节点，获得更精准的分析。';
      }

      welcomeContent += '\n\n请问您想了解哪方面的信息？';

      setSolutionMessages(prev => [...prev, {
        id: `welcome-${solutionId}`,
        role: 'ai',
        content: welcomeContent,
        timestamp: new Date(),
        solutionId: solutionId
      }]);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `已收到您的推演需求。我已分析了${allChildNodes.length}个关联节点，准备基于您选择的${selectedSkills.length}个技能进行推演分析。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const runSimulation = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 根据配置生成不同的方案
    const mockSolutions: Solution[] = generateSolutionsByCategory(config.category);

    setSolutions(mockSolutions);
    setSelectedSolution(mockSolutions[1]?.id || mockSolutions[0]?.id);
    setIsAnalyzing(false);
    setActiveTab('report');

    const completionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: `推演分析完成！基于${Object.keys(uploadedFiles).length}个节点数据和${Object.keys(childSimulationResults).length}个推演结果，生成了${mockSolutions.length}个备选方案。`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, completionMessage]);
  };

  // 根据推演类别和关联节点生成不同的方案
  const generateSolutionsByCategory = (category: string): Solution[] => {
    // 获取决策维度节点（非推演类型的子节点）
    const decisionNodes = allChildNodes.filter(n => !isSimulationNode(n.id));

    // 根据决策维度生成方案描述
    const generateDecisionDescription = (nodeLabels: string[], choices: string[]): string => {
      if (nodeLabels.length === 0) return '基于综合分析生成的方案';

      // 选取前3个关键决策维度
      const keyDecisions = nodeLabels.slice(0, 3);
      const keyChoices = choices.slice(0, 3);

      const decisionText = keyDecisions.map((label, i) => {
        const choice = keyChoices[i] || '综合评估';
        return `${label}:${choice}`;
      }).join(' + ');

      return decisionText;
    };

    // 决策选项模板
    const decisionOptions: Record<string, string[]> = {
      '是否使用现有产线': ['使用现有产线', '新建产线'],
      '是否需要新增产能': ['利用现有产能', '新增产能'],
      '扩建还是新建': ['扩建方案', '新建方案'],
      '新建地址选择': ['原址扩建', '异地新建'],
      '技术路线升级': ['技术升级', '保持现有'],
      '是否分阶段投建': ['一次性投建', '分阶段投建'],
      '是否与客户共建': ['与客户共建', '独立建设'],
      '政府政策支持': ['充分利用政策', '市场化运作']
    };

    switch (category) {
      case 'investment_decision':
        return [
          {
            id: 'sol_1',
            name: '保守投资方案',
            description: generateDecisionDescription(
              decisionNodes.map(n => n.label),
              ['使用现有产线', '利用现有产能', '扩建方案', '技术升级', '独立建设']
            ),
            metrics: { '预期收益': 850, '投资回报率': 12.5, '风险指数': 25, '战略匹配度': 75 },
            confidence: 0.88,
            cost: 1200,
            timeline: '24个月',
            riskLevel: 'low'
          },
          {
            id: 'sol_2',
            name: '平衡投资方案',
            description: generateDecisionDescription(
              decisionNodes.map(n => n.label),
              ['新建产线', '新增产能', '分阶段投建', '与客户共建', '充分利用政策']
            ),
            metrics: { '预期收益': 1200, '投资回报率': 18.2, '风险指数': 45, '战略匹配度': 85 },
            confidence: 0.75,
            cost: 1500,
            timeline: '18个月',
            riskLevel: 'medium'
          },
          {
            id: 'sol_3',
            name: '积极投资方案',
            description: generateDecisionDescription(
              decisionNodes.map(n => n.label),
              ['异地新建', '新增产能', '一次性投建', '技术升级', '独立建设']
            ),
            metrics: { '预期收益': 1800, '投资回报率': 25.8, '风险指数': 72, '战略匹配度': 95 },
            confidence: 0.62,
            cost: 2200,
            timeline: '12个月',
            riskLevel: 'high'
          }
        ];
      case 'capacity_planning':
        return [
          { id: 'sol_1', name: '渐进扩产方案', description: '分阶段扩展产能，降低投资风险', metrics: { '新增产能': 5, '投资成本': 800, '产能利用率': 85, '投资回收期': 36 }, confidence: 0.85, cost: 800, timeline: '36个月', riskLevel: 'low' },
          { id: 'sol_2', name: '同步扩产方案', description: '与市场增长同步扩产，平衡供需', metrics: { '新增产能': 10, '投资成本': 1500, '产能利用率': 90, '投资回收期': 30 }, confidence: 0.78, cost: 1500, timeline: '24个月', riskLevel: 'medium' },
          { id: 'sol_3', name: '领先扩产方案', description: '提前布局产能，抢占市场先机', metrics: { '新增产能': 20, '投资成本': 2800, '产能利用率': 78, '投资回收期': 42 }, confidence: 0.65, cost: 2800, timeline: '18个月', riskLevel: 'high' }
        ];
      case 'risk_assessment':
        return [
          { id: 'sol_1', name: '风险规避方案', description: '采取保守策略，优先规避风险', metrics: { '综合风险指数': 25, '市场风险': 30, '技术风险': 20, '财务风险': 25 }, confidence: 0.88, cost: 200, timeline: '6个月', riskLevel: 'low' },
          { id: 'sol_2', name: '风险平衡方案', description: '风险与收益平衡，稳健推进', metrics: { '综合风险指数': 45, '市场风险': 50, '技术风险': 40, '财务风险': 45 }, confidence: 0.76, cost: 350, timeline: '9个月', riskLevel: 'medium' },
          { id: 'sol_3', name: '风险承受方案', description: '在可控范围内承担风险，追求高回报', metrics: { '综合风险指数': 70, '市场风险': 75, '技术风险': 65, '财务风险': 70 }, confidence: 0.63, cost: 500, timeline: '12个月', riskLevel: 'high' }
        ];
      default:
        return [
          { id: 'sol_1', name: '保守方案', description: '风险可控，稳健推进', metrics: { '预期收益': 850, '投资回报率': 12.5, '风险指数': 25, '实施难度': 30 }, confidence: 0.88, cost: 1200, timeline: '18个月', riskLevel: 'low' },
          { id: 'sol_2', name: '平衡方案', description: '风险与收益平衡，推荐采用', metrics: { '预期收益': 1200, '投资回报率': 18.2, '风险指数': 45, '实施难度': 55 }, confidence: 0.75, cost: 1500, timeline: '14个月', riskLevel: 'medium' },
          { id: 'sol_3', name: '激进方案', description: '最大化收益，承担较高风险', metrics: { '预期收益': 1800, '投资回报率': 25.8, '风险指数': 72, '实施难度': 80 }, confidence: 0.62, cost: 2200, timeline: '10个月', riskLevel: 'high' }
        ];
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return '未知';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isMaximized ? '' : 'p-4'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full overflow-hidden flex flex-col ${isMaximized ? 'fixed inset-0 rounded-none' : 'max-w-7xl max-h-[90vh]'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">推演分析</h2>
              <p className="text-sm text-indigo-100">{node.label} - {config.description}</p>
              <p className="text-xs text-indigo-200 mt-0.5">
                关联节点: {allChildNodes.length} 个 | 下级推演节点: {childSimulationNodes.length} 个
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
              title={isMaximized ? '还原' : '最大化'}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'analysis', label: '推演分析', icon: Box },
            { id: 'report', label: '分析结果', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'analysis' && (
                <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {Object.keys(uploadedFiles).length}/{allChildNodes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'analysis' && (
            <div className="h-full flex">
              {/* Left Panel: Data Nodes (Child Nodes from Graph) */}
              <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Database size={16} />数据需求项
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">点击关联节点导入数据</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* 下级推演节点 */}
                  {childSimulationNodes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-purple-600 uppercase mb-2 font-medium">下级推演节点</p>
                      {childSimulationNodes.map(childNode => {
                        const hasResults = childSimulationResults[childNode.id]?.length > 0;
                        const isSelected = selectedParamId === childNode.id;
                        return (
                          <div
                            key={childNode.id}
                            onClick={() => setSelectedParamId(childNode.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all mb-2 ${
                              isSelected ? 'border-purple-500 bg-purple-50' : hasResults ? 'border-green-300 bg-green-50' : 'border-purple-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700">推演</span>
                              {hasResults && <CheckCircle size={14} className="text-green-600" />}
                            </div>
                            <h4 className="text-sm font-medium text-slate-900 truncate">{childNode.label}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{getNodeLevelName(childNode.group)}</p>
                            {hasResults && (
                              <p className="text-[10px] text-green-600 mt-1">已导入 {childSimulationResults[childNode.id].length} 个方案</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* 关联业务节点 */}
                  {allChildNodes.filter(n => !isSimulationNode(n.id)).length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-2">关联业务节点</p>
                      {allChildNodes
                        .filter(n => !isSimulationNode(n.id))
                        .map(childNode => {
                          const isSelected = selectedParamId === childNode.id;
                          return (
                            <div
                              key={childNode.id}
                              onClick={() => setSelectedParamId(childNode.id)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all mb-2 ${
                                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className={`px-1.5 py-0.5 text-[10px] rounded ${getNodeLevelBadgeColor(childNode.group)}`}>
                                  {getNodeLevelName(childNode.group)}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-slate-900 truncate">{childNode.label}</h4>
                              {childNode.responsibility && (
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{childNode.responsibility}</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                  {/* 无关联节点提示 */}
                  {allChildNodes.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Box size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">该推演节点暂无<br/>直接关联的下级节点</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Panel: Selected Node Data Input */}
              <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                {selectedParamId ? (
                  (() => {
                    const selectedNode = allNodes.find(n => n.id === selectedParamId);
                    const isSimNode = selectedNode ? isSimulationNode(selectedNode.id) : false;
                    const hasResults = selectedNode ? childSimulationResults[selectedNode.id]?.length > 0 : false;

                    return (
                      <>
                        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                          {isSimNode ? (
                            <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">推演节点</span>
                          ) : (
                            <span className={`px-2 py-0.5 text-xs rounded ${getNodeLevelBadgeColor(selectedNode?.group)}`}>
                              {getNodeLevelName(selectedNode?.group)}
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-900 mt-2">{selectedNode?.label}</h3>
                          <p className="text-xs text-slate-500 mt-1">{selectedNode?.responsibility || '暂无描述'}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {/* Node Info */}
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <h4 className="text-xs font-semibold text-slate-700 mb-2">节点信息</h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">节点ID:</span>
                                <span className="text-slate-700 font-mono">{selectedNode?.id}</span>
                              </div>
                              {selectedNode?.owner && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">负责人:</span>
                                  <span className="text-slate-700">{selectedNode.owner}</span>
                                </div>
                              )}
                              {selectedNode?.dataSource && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">数据源:</span>
                                  <span className="text-slate-700">{selectedNode.dataSource}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 推演节点：导入推演结果 */}
                          {isSimNode && (
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                              <h4 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-2">
                                <Database size={14} />推演结果
                              </h4>
                              {hasResults ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-slate-600">已导入 {childSimulationResults[selectedNode!.id].length} 个方案：</p>
                                  {childSimulationResults[selectedNode!.id].map((sol, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-purple-200">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-700">{sol.name}</span>
                                        <span className="text-[10px] text-slate-500">{(sol.confidence * 100).toFixed(0)}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  onClick={() => selectedNode && importChildSimulationResults(selectedNode.id)}
                                  className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                                >
                                  导入推演结果
                                </button>
                              )}
                            </div>
                          )}

                          {/* File Import */}
                          <div className="bg-white rounded-lg p-3 border border-indigo-200">
                            <h4 className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                              <Upload size={14} />文件导入
                            </h4>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-indigo-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                              <input ref={fileInputRef} type="file" multiple onChange={(e) => handleParamFileUpload(selectedParamId, e)} className="hidden" accept=".csv,.json,.xml,.xlsx,.xls" />
                              <Upload size={20} className="text-indigo-400 mx-auto mb-1" />
                              <p className="text-xs text-indigo-600">点击上传数据文件</p>
                            </div>
                            {uploadedFiles[selectedParamId]?.length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                {uploadedFiles[selectedParamId].map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-indigo-50 p-2 rounded text-xs">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <FileUp size={12} className="text-indigo-500 flex-shrink-0" />
                                      <span className="truncate">{file.name}</span>
                                    </div>
                                    <button onClick={() => removeParamFile(selectedParamId, idx)} className="p-1 hover:bg-red-50 rounded text-red-500"><X size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Database size={48} className="mx-auto mb-2" />
                      <p className="text-sm">点击左侧关联节点<br/>查看详情并导入数据</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: Skills + Chat + Run */}
              <div className="flex-1 flex flex-col bg-slate-50">
                <div className="border-b border-slate-200 bg-white">
                  <button onClick={() => setShowSkillPanel(!showSkillPanel)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" />
                      <span className="text-sm font-medium text-slate-700">技能选择</span>
                      {selectedSkills.length > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">已选 {selectedSkills.length} 个</span>}
                    </div>
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${showSkillPanel ? 'rotate-90' : ''}`} />
                  </button>
                  {showSkillPanel && (
                    <div className="px-4 pb-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mt-3 mb-2">推荐技能（可多选）</p>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {config.supportedSkills.map(skillId => {
                          const skill = MOCK_SKILLS.find(s => s.skill_id === skillId);
                          if (!skill) return null;
                          return (
                            <div
                              key={skillId}
                              onClick={() => toggleSkill(skillId)}
                              className={`p-2 rounded-lg border cursor-pointer transition-all ${selectedSkills.includes(skillId) ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                              <div className="flex items-start justify-between">
                                <h4 className="text-xs font-medium text-slate-900 truncate flex-1">{skill.name}</h4>
                                {selectedSkills.includes(skillId) && <CheckCircle size={12} className="text-amber-500 ml-1" />}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{skill.description}</p>
                            </div>
                          );
                        })}
                        {/* Other available skills */}
                        {MOCK_SKILLS.filter(s => !config.supportedSkills.includes(s.skill_id)).map(skill => (
                          <div
                            key={skill.skill_id}
                            onClick={() => toggleSkill(skill.skill_id)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all opacity-60 ${selectedSkills.includes(skill.skill_id) ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <div className="flex items-start justify-between">
                              <h4 className="text-xs font-medium text-slate-900 truncate flex-1">{skill.name}</h4>
                              {selectedSkills.includes(skill.skill_id) && <CheckCircle size={12} className="text-amber-500 ml-1" />}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{skill.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 下级推演节点 */}
                {childSimulationNodes.length > 0 && (
                  <div className="border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <button
                      onClick={() => setActiveChildSimulation(activeChildSimulation ? null : childSimulationNodes[0]?.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50"
                    >
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-purple-600" />
                        <span className="text-sm font-medium text-slate-700">下级推演节点</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {childSimulationNodes.length}个
                        </span>
                        {Object.keys(childSimulationResults).length > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            已导入{Object.keys(childSimulationResults).length}个
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className={`text-slate-400 transition-transform ${activeChildSimulation ? 'rotate-90' : ''}`} />
                    </button>

                    {activeChildSimulation && (
                      <div className="px-4 pb-4 border-t border-purple-100">
                        <p className="text-xs text-slate-500 mt-3 mb-2">点击导入下级推演节点的分析结果，可作为当前推演的输入数据</p>
                        <div className="space-y-2">
                          {childSimulationNodes.map(childNode => {
                            const hasResults = childSimulationResults[childNode.id]?.length > 0;
                            return (
                              <div
                                key={childNode.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  hasResults ? 'border-green-300 bg-green-50' : 'border-purple-200 bg-white hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span className="text-sm font-medium text-slate-900">{childNode.label}</span>
                                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700">推演节点</span>
                                  </div>
                                  <button
                                    onClick={() => importChildSimulationResults(childNode.id)}
                                    disabled={hasResults}
                                    className={`px-3 py-1 rounded text-xs transition-colors ${
                                      hasResults
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                    }`}
                                  >
                                    {hasResults ? '已导入' : '导入结果'}
                                  </button>
                                </div>

                                {/* 显示已导入的结果 */}
                                {hasResults && (
                                  <div className="mt-2 pl-4 border-l-2 border-green-200">
                                    <p className="text-[10px] text-slate-500 mb-1">可引用的方案（点击应用到当前方案）：</p>
                                    <div className="space-y-1">
                                      {childSimulationResults[childNode.id].map((childSol, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => applyChildResultToSolution(childSol)}
                                          className="w-full text-left px-2 py-1 bg-white rounded border border-green-200 hover:border-green-400 text-xs transition-colors"
                                        >
                                          <span className="font-medium text-slate-700">{childSol.name}</span>
                                          <span className="text-slate-500 ml-2">置信度 {(childSol.confidence * 100).toFixed(0)}%</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 关联下级节点（数据支持） */}
                {allChildNodes.length > childSimulationNodes.length && (
                  <div className="border-b border-slate-200 bg-slate-50">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <Box size={14} className="text-slate-500" />
                      <span className="text-xs text-slate-600">关联下级节点</span>
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded">
                        {allChildNodes.length - childSimulationNodes.length}个
                      </span>
                    </div>
                    <div className="px-4 pb-3">
                      <p className="text-[10px] text-slate-400 mb-2">以下节点与当前推演节点关联，可提供数据支持</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allChildNodes
                          .filter(n => !isSimulationNode(n.id))
                          .map(childNode => (
                            <div
                              key={childNode.id}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-1"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                childNode.group === 'simulation' ? 'bg-purple-400' :
                                childNode.group === 'data' ? 'bg-blue-400' : 'bg-slate-400'
                              }`} />
                              {childNode.label}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-xs">AI正在分析数据并生成方案...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${Object.keys(uploadedFiles).length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                      已导入节点数据: {Object.keys(uploadedFiles).length}/{allChildNodes.length}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${Object.keys(childSimulationResults).length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                      已导入推演结果: {Object.keys(childSimulationResults).length}/{childSimulationNodes.length}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${selectedSkills.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                      技能: {selectedSkills.length}个
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && sendMessage()} placeholder="输入您的推演需求，与AI助手对话..." disabled={isAnalyzing} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100" />
                    <button onClick={sendMessage} disabled={!chatInput.trim() || isAnalyzing} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"><MessageCircle size={18} /></button>
                    <button onClick={runSimulation} disabled={isAnalyzing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2">
                      {isAnalyzing ? (<><Loader2 size={16} className="animate-spin" />分析中</>) : (<><Zap size={16} />运行推演</>)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="h-full flex">
              {solutions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileText size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">请先完成推演分析</p>
                    <button onClick={() => setActiveTab('analysis')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">前往推演分析</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-72 border-r border-slate-200 overflow-y-auto bg-slate-50">
                    <div className="p-4 border-b border-slate-200"><h3 className="text-sm font-semibold text-slate-700">分析方案 ({solutions.length})</h3></div>
                    <div className="p-3 space-y-2">
                      {solutions.map(solution => (
                        <div key={solution.id} onClick={() => setSelectedSolution(solution.id)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedSolution === solution.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="flex items-center justify-between mb-1"><h4 className="text-sm font-medium text-slate-900">{solution.name}</h4></div>
                          <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getRiskColor(solution.riskLevel)}`}>{getRiskText(solution.riskLevel)}</span>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{solution.description}</p>

                          {/* 已关联节点显示 */}
                          {solutionAdditionalNodes[solution.id]?.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600">
                              <Box size={10} />
                              <span>已关联 {solutionAdditionalNodes[solution.id].length} 个节点</span>
                            </div>
                          )}

                          <div className="mt-2 flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openSolutionChat(solution.id); }}
                              className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <MessageCircle size={12} />
                              咨询
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openNodeSelector(solution.id); }}
                              className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus size={12} />
                              添加节点
                            </button>
                            {solutionAdditionalNodes[solution.id]?.length > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); reRunSimulation(solution.id); }}
                                disabled={isAnalyzing}
                                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                              >
                                {isAnalyzing && selectedSolution === solution.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Zap size={12} />
                                )}
                                推演
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {selectedSolution && (
                      <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{solutions.find(s => s.id === selectedSolution)?.name}</h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openNodeSelector(selectedSolution)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-sm rounded flex items-center gap-1 transition-colors"
                              >
                                <Plus size={14} />
                                添加节点
                              </button>
                              <button
                                onClick={() => openSolutionChat(selectedSolution)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm rounded flex items-center gap-1 transition-colors"
                              >
                                <MessageCircle size={14} />
                                咨询此方案
                              </button>
                              <span className={`px-3 py-1 text-sm rounded-full border ${getRiskColor(solutions.find(s => s.id === selectedSolution)?.riskLevel || 'medium')}`}>{getRiskText(solutions.find(s => s.id === selectedSolution)?.riskLevel || 'medium')}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            {Object.entries(solutions.find(s => s.id === selectedSolution)?.metrics || {}).map(([key, value]) => (
                              <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200"><p className="text-xs text-slate-500 mb-1">{key}</p><p className="text-xl font-bold text-indigo-600">{value}</p></div>
                            ))}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200"><p className="text-xs text-slate-500 mb-1">置信度</p><p className="text-xl font-bold text-green-600">{((solutions.find(s => s.id === selectedSolution)?.confidence || 0) * 100).toFixed(0)}%</p></div>
                          </div>
                          <p className="text-sm text-slate-600">{solutions.find(s => s.id === selectedSolution)?.description}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                          <h3 className="text-sm font-semibold text-slate-700 mb-4">方案量化对比</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead><tr className="border-b border-slate-200"><th className="text-left py-3 px-2 font-medium text-slate-600">指标</th>{solutions.map(sol => (<th key={sol.id} className={`text-center py-3 px-2 font-medium ${sol.id === selectedSolution ? 'text-indigo-600' : 'text-slate-600'}`}>{sol.name}</th>))}</tr></thead>
                              <tbody>
                                {Object.keys(solutions[0]?.metrics || {}).map((metric, idx) => (
                                  <tr key={metric} className={idx % 2 === 0 ? 'bg-slate-50' : ''}><td className="py-3 px-2 font-medium text-slate-700">{metric}</td>{solutions.map(sol => (<td key={sol.id} className={`text-center py-3 px-2 ${sol.id === selectedSolution ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{sol.metrics[metric]}</td>))}</tr>
                                ))}
                                <tr className="border-t border-slate-200"><td className="py-3 px-2 font-medium text-slate-700">置信度</td>{solutions.map(sol => (<td key={sol.id} className={`text-center py-3 px-2 ${sol.id === selectedSolution ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{(sol.confidence * 100).toFixed(0)}%</td>))}</tr>
                                <tr className="border-t border-slate-200"><td className="py-3 px-2 font-medium text-slate-700">预估成本</td>{solutions.map(sol => (<td key={sol.id} className={`text-center py-3 px-2 ${sol.id === selectedSolution ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{sol.cost ? `${sol.cost}万` : '-'}</td>))}</tr>
                                <tr className="border-t border-slate-200"><td className="py-3 px-2 font-medium text-slate-700">预计周期</td>{solutions.map(sol => (<td key={sol.id} className={`text-center py-3 px-2 ${sol.id === selectedSolution ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{sol.timeline || '-'}</td>))}</tr>
                                <tr className="border-t border-slate-200"><td className="py-3 px-2 font-medium text-slate-700">风险等级</td>{solutions.map(sol => (<td key={sol.id} className="text-center py-3 px-2"><span className={`px-2 py-0.5 text-xs rounded border ${getRiskColor(sol.riskLevel)}`}>{getRiskText(sol.riskLevel)}</span></td>))}</tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                          <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2"><Lightbulb size={16} />分析建议</h3>
                          <p className="text-sm text-indigo-600">基于当前输入数据和多维度分析，<strong>{solutions.find(s => s.id === selectedSolution)?.name}</strong>在当前条件下综合表现最优。该方案在控制风险的前提下，能够实现较好的预期目标。</p>
                        </div>

                        {/* 方案咨询对话框 */}
                        {showSolutionChat && selectedSolution && (
                          <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                <MessageCircle size={16} />
                                方案咨询 - {solutions.find(s => s.id === selectedSolution)?.name}
                              </h3>
                              <button
                                onClick={() => setShowSolutionChat(false)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {/* 聊天记录 */}
                            <div className="h-48 overflow-y-auto space-y-3 mb-4 bg-slate-50 p-3 rounded-lg">
                              {solutionMessages
                                .filter(m => m.solutionId === selectedSolution)
                                .map(msg => (
                                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                      msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                      {msg.content}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* 输入框 */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={solutionChatInput}
                                onChange={(e) => setSolutionChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendSolutionMessage()}
                                placeholder="输入您想了解的问题..."
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={sendSolutionMessage}
                                disabled={!solutionChatInput.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                              >
                                发送
                              </button>
                            </div>

                            {/* 快捷问题 */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {['实施步骤是什么？', '有哪些风险？', '需要什么资源？', '如何优化？'].map((q, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setSolutionChatInput(q);
                                    setTimeout(() => sendSolutionMessage(), 100);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded transition-colors"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>

                            {/* 重新推演按钮 */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <button
                                onClick={() => reRunSimulation(selectedSolution)}
                                disabled={isAnalyzing}
                                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {isAnalyzing ? (
                                  <><Loader2 size={16} className="animate-spin" />推演中...</>
                                ) : (
                                  <><Zap size={16} />基于新增节点重新推演</>
                                )}
                              </button>
                              <p className="text-[10px] text-slate-400 mt-1 text-center">
                                {solutionAdditionalNodes[selectedSolution]?.length > 0
                                  ? `已关联 ${solutionAdditionalNodes[selectedSolution].length} 个节点，可优化方案置信度`
                                  : '添加节点后进行重新推演以获得更精准的分析'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 已关联节点展示 */}
                        {solutionAdditionalNodes[selectedSolution]?.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <Box size={16} />
                              已关联节点 ({solutionAdditionalNodes[selectedSolution].length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {solutionAdditionalNodes[selectedSolution].map(nodeId => {
                                const nodeItem = allNodes.find(n => n.id === nodeId);
                                if (!nodeItem) return null;
                                return (
                                  <div key={nodeId} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs">
                                    <span className={`w-2 h-2 rounded-full ${
                                      nodeItem.group === 'simulation' ? 'bg-purple-500' :
                                      nodeItem.group === 'data' ? 'bg-blue-500' :
                                      'bg-slate-500'
                                    }`} />
                                    <span className="text-slate-700">{nodeItem.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 节点选择器对话框 */}
      {showNodeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">选择节点</h3>
                <p className="text-sm text-amber-100">从业务流程图谱中选择要添加到方案的节点</p>
              </div>
              <button onClick={() => setShowNodeSelector(false)} className="p-2 hover:bg-white/20 rounded-lg text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* 左侧：节点列表 */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索节点..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">已选择 {selectedNodesForSolution.length} 个节点</p>
                  {allNodes.filter(n => n.id !== node.id).map(nodeItem => {
                    const isSelected = selectedNodesForSolution.includes(nodeItem.id);
                    return (
                      <div
                        key={nodeItem.id}
                        onClick={() => toggleNodeSelection(nodeItem.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getNodeLevelColor(nodeItem.group)}`}>
                                {getNodeLevelName(nodeItem.group)}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-slate-900">{nodeItem.label}</h4>
                            {nodeItem.responsibility && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{nodeItem.responsibility}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 右侧：已选择 */}
              <div className="w-64 border-l border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">已选择节点</h4>
                {selectedNodesForSolution.length === 0 ? (
                  <p className="text-xs text-slate-400">尚未选择任何节点</p>
                ) : (
                  <div className="space-y-2">
                    {selectedNodesForSolution.map(nodeId => {
                      const nodeItem = allNodes.find(n => n.id === nodeId);
                      if (!nodeItem) return null;
                      return (
                        <div key={nodeId} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                          <span className="text-xs text-slate-700 truncate flex-1">{nodeItem.label}</span>
                          <button
                            onClick={() => toggleNodeSelection(nodeId)}
                            className="p-1 hover:bg-red-50 rounded text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNodeSelector(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveSolutionNodes}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                保存 ({selectedNodesForSolution.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationModal;
