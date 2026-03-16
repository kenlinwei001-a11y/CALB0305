import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Network, Zap, Settings, Box, Atom, Layers, Database,
  Command, Bell, Search, ChevronDown, Sparkles, Cpu
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

// 导航项配置
const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/skills', icon: Zap, label: '技能中心' },
  { path: '/mcp-tools', icon: Cpu, label: 'MCP工具' },
  { path: '/atoms', icon: Atom, label: '业务释义' },
  { path: '/ontology', icon: Network, label: '场景推演' },
  { path: '/business-semantic', icon: Layers, label: '业务语义' },
  { path: '/data-sources', icon: Database, label: '数据源' },
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

// 右侧快捷面板
const RightPanel: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const quickCommands = [
    { id: 'analyze', label: '分析洞察', desc: '深度分析当前数据' },
    { id: 'prep', label: '会议准备', desc: '生成会议摘要和待办' },
    { id: 'recap', label: '今日回顾', desc: '总结今日工作进展' },
  ];

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
              onClick={() => setActiveCommand(cmd.id)}
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
    for (const [path, t] of Object.entries(titles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        title = t;
        break;
      } else if (location.pathname === '/') {
        title = '仪表盘';
        break;
      }
    }
    setPageTitle(title);
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
          <Route path="/settings" element={<><TopBar title="设置" /><div className="flex-1 overflow-auto p-6"><div className="bg-white rounded-2xl p-6 shadow-sm">设置页面</div></div></>} />
          <Route path="*" element={<div className="flex-1 flex items-center justify-center"><h1 className="text-2xl text-gray-400">404 - Page Not Found</h1></div>} />
        </Routes>
      </div>

      {/* 右侧快捷面板 */}
      <RightPanel />
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