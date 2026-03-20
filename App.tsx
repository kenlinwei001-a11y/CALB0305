import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Network, Zap, Settings, Box, Atom, Layers, Database,
  Command, Bell, Search, ChevronDown, Sparkles, Cpu, ChevronLeft, X, ArrowRight,
  GitBranch, Brain, Target
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillsRegistry from './components/SkillsRegistry';
import SkillDetail from './components/SkillDetail';
import SkillRegistration from './components/SkillRegistration';
import OntologyGraph from './components/OntologyGraph';
import AtomicOntologyModule from './components/AtomicOntologyModule';
import ScenarioAtomsModule from './components/ScenarioAtomsModule';
import BusinessSemanticCreator from './components/BusinessSemanticCreator';
import MCPTools from './components/MCPTools';
import DataSourceManager from './components/DataSourceManager';
import DecisionRepository from './components/DecisionRepository';
import DecisionSpace from './components/DecisionSpace';
import BusinessObjectBrowser from './components/BusinessObjectBrowser';

// 导航项配置 - 智能体中台层级结构
const navItems = [
  { path: '/decision-space', icon: Brain, label: '决策空间' },
  { path: '/objects', icon: Target, label: '业务对象' },
  { path: '/skills', icon: Zap, label: '技能中心' },
  { path: '/mcp-tools', icon: Cpu, label: 'MCP工具' },
  { path: '/atoms', icon: Atom, label: '业务释义' },
  { path: '/ontology', icon: Network, label: '场景推演' },
  { path: '/business-semantic', icon: Layers, label: '业务语义' },
  { path: '/data-sources', icon: Database, label: '数据源' },
  { path: '/decision-repository', icon: GitBranch, label: '决策资产' },
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
];

// 左侧图标导航
const IconNav: React.FC<{ activePath: string }> = ({ activePath }) => {
  return (
    <div className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center mb-8 shadow-sm">
        <Box className="text-white" size={20} />
      </div>

      {/* 主导航 */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path ||
            (item.path !== '/' && activePath.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              title={item.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 rounded-r-full -ml-4" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 底部设置 */}
      <div className="mt-auto">
        <Link
          to="/settings"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          title="设置"
        >
          <Settings size={20} />
        </Link>
      </div>
    </div>
  );
};

// 消息类型定义
type MessageRole = 'user' | 'assistant';
interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface QuickCommand {
  id: string;
  label: string;
  desc: string;
}

// 页面特定的快捷命令配置
const PAGE_COMMANDS: Record<string, QuickCommand[]> = {
  dashboard: [
    { id: 'overview', label: '查看今日概览', desc: '系统运行状态总结' },
    { id: 'trends', label: '分析性能趋势', desc: '执行成功率和时延分析' },
    { id: 'alerts', label: '检查异常预警', desc: '查看待处理告警事项' },
  ],
  skills: [
    { id: 'recommend', label: '技能推荐', desc: '根据场景推荐适合技能' },
    { id: 'search', label: '智能搜索', desc: '用自然语言查找技能' },
    { id: 'compare', label: '技能对比', desc: '比较多个技能参数' },
  ],
  ontology: [
    { id: 'explore', label: '探索场景', desc: '了解场景节点关系' },
    { id: 'simulate', label: '启动推演', desc: '开始多轮模拟分析' },
    { id: 'optimize', label: '优化建议', desc: '获取节点优化方案' },
  ],
  datasource: [
    { id: 'sync', label: '同步数据', desc: '手动触发数据同步' },
    { id: 'quality', label: '检查质量', desc: '数据质量检测报告' },
    { id: 'mapping', label: '映射检查', desc: '验证本体映射关系' },
  ],
  default: [
    { id: 'help', label: '使用帮助', desc: '了解系统功能' },
    { id: 'feedback', label: '反馈建议', desc: '提交产品建议' },
    { id: 'support', label: '技术支持', desc: '联系技术团队' },
  ],
};

// 右侧快捷面板
const RightPanel: React.FC<{ commands?: QuickCommand[] }> = ({ commands }) => {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = commands || PAGE_COMMANDS.default;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCommandClick = (cmdId: string) => {
    setActiveCommand(cmdId);
    setShowChat(true);
    const cmd = quickCommands.find(c => c.id === cmdId);

    // 添加欢迎消息
    const welcomeMessages: Record<string, string> = {
      analyze: '我是您的数据分析助手。我可以帮您分析产能利用率、库存周转、质量指标等数据。请问您想分析哪个方面？',
      prep: '我来帮您准备会议。请告诉我会议主题，我将为您生成会议摘要和相关待办事项。',
      recap: '让我帮您回顾今天的工作。以下是今日系统运行的关键指标和待处理事项总结。',
    };

    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: welcomeMessages[cmdId] || '您好，有什么可以帮助您的？',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // 模拟助手回复
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        analyze: [
          '根据最新数据，当前产能利用率为87.5%，较上周提升3.2%。主要提升来自B产线的效率优化。',
          '库存周转天数目前为28天，处于健康范围。建议关注原材料库存，预计下周需要补充。',
          '质量检测显示良品率为98.2%，符合目标。但C工序的不良率略有上升，建议关注。',
        ],
        prep: [
          '已生成会议摘要：上周完成产能提升项目，达成预期目标。下周重点推进质量优化。',
          '待办事项已整理：1)审批采购申请 2)确认供应商交期 3)review新订单排程',
          '相关文档已准备完毕，包括生产报表、质量分析、库存状态等资料。',
        ],
        recap: [
          '今日概览：系统运行正常，完成订单处理156笔，生产效率达标。',
          '异常处理：处理了3个设备预警，均已恢复正常。无重大质量问题。',
          '明日提醒：有2个订单需优先排程，建议上午安排产线准备。',
        ],
      };

      const cmdResponses = responses[activeCommand || 'analyze'] || ['收到，我来帮您处理。'];
      const randomResponse = cmdResponses[Math.floor(Math.random() * cmdResponses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveCommand(null);
    setMessages([]);
  };

  if (showChat) {
    const activeCmd = quickCommands.find(c => c.id === activeCommand);
    return (
      <div className="w-96 bg-white border-l border-gray-100 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseChat}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <div className="font-medium text-sm text-gray-900">{activeCmd?.label}</div>
              <div className="text-xs text-gray-400">AI 助手</div>
            </div>
          </div>
          <button
            onClick={handleCloseChat}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            AI 生成内容仅供参考
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-100 flex flex-col">
      {/* 顶部命令输入 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          <Command size={16} />
          <span className="text-sm">输入命令或搜索...</span>
        </div>
      </div>

      {/* 快捷命令 */}
      <div className="flex-1 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          快捷命令
        </h3>
        <div className="space-y-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => handleCommandClick(cmd.id)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                activeCommand === cmd.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium text-sm">{cmd.label}</div>
              <div className={`text-xs mt-0.5 ${activeCommand === cmd.id ? 'text-gray-400' : 'text-gray-500'}`}>
                {cmd.desc}
              </div>
            </button>
          ))}
        </div>

        {/* 最近使用 */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">
          最近使用
        </h3>
        <div className="space-y-1">
          {['产能利用率分析', '库存周转优化', '需求预测'].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <Sparkles size={14} className="text-gray-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部用户信息 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-sm font-medium">
            AD
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Admin</div>
            <div className="text-xs text-gray-500">Production</div>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// 顶部搜索栏
const TopBar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* 搜索 */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-gray-400"
          />
        </div>

        {/* 通知 */}
        <button className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};

// 业务语义页面包装组件
const BusinessSemanticPage: React.FC = () => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedSemantic) {
      setIsCreatorOpen(true);
    }
  }, [location.state]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <TopBar title="业务语义管理" />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* 页面内容 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">原子业务语义</h2>
                <p className="text-sm text-gray-500 mt-1">定义锂电行业产销协同的基础业务概念</p>
              </div>
              <button
                onClick={() => setIsCreatorOpen(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
              >
                查看释义库
              </button>
            </div>

            {/* 分类卡片 */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: '销售类', count: 5, desc: '订单、预测、价格、交期' },
                { name: '生产类', count: 5, desc: '产能、OEE、工单、周期' },
                { name: '库存类', count: 5, desc: '库存量、安全库存、周转' },
                { name: '质量类', count: 4, desc: '良品率、不良率、合格率' },
              ].map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setIsCreatorOpen(true)}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat.count}</span>
                  </div>
                  <p className="text-xs text-gray-500">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isCreatorOpen && (
        <BusinessSemanticCreator
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('仪表盘');
  const [pageCommands, setPageCommands] = useState<QuickCommand[]>(PAGE_COMMANDS.default);

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': '仪表盘',
      '/skills': '技能中心',
      '/mcp-tools': 'MCP工具',
      '/atoms': '业务释义库',
      '/ontology': '业务场景推演',
      '/business-semantic': '业务语义',
      '/data-sources': '数据源管理',
      '/settings': '设置',
    };

    // 处理子路由
    let title = '仪表盘';
    let commands = PAGE_COMMANDS.default;

    for (const [path, t] of Object.entries(titles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        title = t;
        break;
      } else if (location.pathname === '/') {
        title = '仪表盘';
        break;
      }
    }

    // 根据路由设置对应的快捷命令
    if (location.pathname === '/') {
      commands = PAGE_COMMANDS.dashboard;
    } else if (location.pathname.startsWith('/skills')) {
      commands = PAGE_COMMANDS.skills;
    } else if (location.pathname.startsWith('/ontology')) {
      commands = PAGE_COMMANDS.ontology;
    } else if (location.pathname.startsWith('/data-sources')) {
      commands = PAGE_COMMANDS.datasource;
    } else if (location.pathname.startsWith('/atoms')) {
      commands = [
        { id: 'explain', label: '解释语义', desc: '解释原子业务语义概念' },
        { id: 'relate', label: '查看关联', desc: '查看关联的场景和技能' },
        { id: 'apply', label: '应用场景', desc: '应用到具体业务场景' },
      ];
    } else if (location.pathname.startsWith('/mcp-tools')) {
      commands = [
        { id: 'solve', label: '运行求解器', desc: '执行约束求解计算' },
        { id: 'config', label: '配置参数', desc: '调整求解器参数' },
        { id: 'result', label: '查看结果', desc: '分析求解结果' },
      ];
    }

    setPageTitle(title);
    setPageCommands(commands);
  }, [location]);

  return (
    <div className="flex h-screen bg-[#F9F9FB] overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* 左侧图标导航 */}
      <IconNav activePath={location.pathname} />

      {/* 中间内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<><TopBar title="仪表盘" /><div className="flex-1 overflow-auto p-6"><Dashboard /></div></>} />
          <Route path="/skills" element={<><TopBar title="技能中心" /><div className="flex-1 overflow-auto p-6"><SkillsRegistry /></div></>} />
          <Route path="/skills/new" element={<><TopBar title="注册技能" /><div className="flex-1 overflow-auto p-6"><SkillRegistration /></div></>} />
          <Route path="/skills/:skillId" element={<><TopBar title="技能详情" /><div className="flex-1 overflow-auto p-6"><SkillDetail /></div></>} />
          <Route path="/ontology" element={<><TopBar title="业务场景推演" /><div className="flex-1 overflow-auto p-6"><OntologyGraph /></div></>} />
          <Route path="/atoms/scenario" element={<><TopBar title="场景原子管理" /><div className="flex-1 overflow-auto p-6"><ScenarioAtomsModule /></div></>} />
          <Route path="/atoms" element={<><TopBar title="业务释义库" /><div className="flex-1 overflow-auto p-6"><AtomicOntologyModule /></div></>} />
          <Route path="/business-semantic" element={<BusinessSemanticPage />} />
          <Route path="/mcp-tools" element={<><TopBar title="MCP工具" /><div className="flex-1 overflow-auto p-6"><MCPTools /></div></>} />
          <Route path="/mcp-tools/:solverType" element={<><TopBar title="MCP工具" /><div className="flex-1 overflow-auto p-6"><MCPTools /></div></>} />
          <Route path="/mcp-tools/constraints/:view?" element={<><TopBar title="MCP工具" /><div className="flex-1 overflow-auto p-6"><MCPTools /></div></>} />
          <Route path="/mcp-tools/ontology/:ontologyToolId" element={<><TopBar title="MCP工具" /><div className="flex-1 overflow-auto p-6"><MCPTools /></div></>} />
          <Route path="/data-sources" element={<><TopBar title="数据源管理" /><div className="flex-1 overflow-auto p-6"><DataSourceManager /></div></>} />
          <Route path="/decision-repository" element={<><TopBar title="决策资产库" /><div className="flex-1 overflow-auto p-6"><DecisionRepository /></div></>} />
          <Route path="/decision-space" element={<DecisionSpace />} />
          <Route path="/objects" element={<><TopBar title="业务对象模型" /><div className="flex-1 overflow-auto"><BusinessObjectBrowser /></div></>} />
          <Route path="/settings" element={<><TopBar title="设置" /><div className="flex-1 overflow-auto p-6"><div className="bg-white rounded-2xl p-6 shadow-sm">设置页面</div></div></>} />
          <Route path="*" element={<div className="flex-1 flex items-center justify-center"><h1 className="text-2xl text-gray-400">404 - Page Not Found</h1></div>} />
        </Routes>
      </div>

      {/* 右侧快捷面板 */}
      <RightPanel commands={pageCommands} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;