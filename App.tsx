import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, Zap, Settings, Menu, Box, Atom, Layers, Plus, TrendingUp, Factory, Package, CheckCircle, DollarSign, Truck, Users, Calendar, Info, Cpu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillsRegistry from './components/SkillsRegistry';
import SkillDetail from './components/SkillDetail';
import SkillRegistration from './components/SkillRegistration';
import OntologyGraph from './components/OntologyGraph';
import AtomicOntologyModule from './components/AtomicOntologyModule';
import ScenarioAtomsModule from './components/ScenarioAtomsModule';
import BusinessSemanticCreator from './components/BusinessSemanticCreator';
import MCPTools from './components/MCPTools';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
      active
        ? 'bg-[#007AFF]/10 text-[#007AFF]'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

// 业务语义创建页面包装组件
const BusinessSemanticPage: React.FC = () => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const location = useLocation();

  // 接收来自关联性分析的跳转
  useEffect(() => {
    if (location.state?.selectedSemantic) {
      setIsCreatorOpen(true);
    }
  }, [location.state]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">原子业务语义管理</h2>
          <p className="text-gray-500 mt-1">定义锂电行业产销协同的不可再分基础业务概念（共36个业务释义）</p>
        </div>
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <Plus size={20} />
          查看业务释义库
        </button>
      </div>

      {/* 原子业务语义分类展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { id: 'sales', name: '销售类', count: 5, desc: '订单、预测、价格、交期、履约', color: 'bg-blue-100 text-blue-600', icon: TrendingUp },
          { id: 'production', name: '生产类', count: 5, desc: '产能、利用率、OEE、工单、周期', color: 'bg-cyan-100 text-cyan-600', icon: Factory },
          { id: 'inventory', name: '库存类', count: 5, desc: '库存量、安全库存、补货点、周转、VMI', color: 'bg-green-100 text-green-600', icon: Package },
          { id: 'quality', name: '质量类', count: 4, desc: '良品率、不良率、交付合格率、直通率', color: 'bg-red-100 text-red-600', icon: CheckCircle },
          { id: 'finance', name: '财务类', count: 5, desc: '成本、毛利、库存成本、应收、逾期', color: 'bg-amber-100 text-amber-600', icon: DollarSign },
          { id: 'logistics', name: '物流类', count: 4, desc: '交付周期、物流成本、在途、准确率', color: 'bg-purple-100 text-purple-600', icon: Truck },
          { id: 'customer', name: '客户类', count: 4, desc: '信用评分、额度、等级、满意度', color: 'bg-pink-100 text-pink-600', icon: Users },
          { id: 'planning', name: '计划类', count: 4, desc: 'MPS、物料需求、交货周期、达成率', color: 'bg-emerald-100 text-emerald-600', icon: Calendar },
        ].map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              onClick={() => setIsCreatorOpen(true)}
              className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-xs text-gray-400">{category.count} 个定义</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{category.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 什么是原子业务语义说明 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={20} className="text-[#007AFF]" />
          什么是原子业务语义？
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">不可再分</h4>
            <p>原子业务语义是业务领域中最基础的、不可再分解的概念，如"订单量"、"库存量"、"良品率"等。</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">标准化定义</h4>
            <p>每个业务释义都有统一的编码、定义、数据类型、计量单位和计算规则，确保跨系统一致性。</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">业务规则绑定</h4>
            <p>每个业务释义关联特定的业务规则，如"良品率低于95%触发预警"、"库存低于安全库存补货"。</p>
          </div>
        </div>
      </div>

      {/* 业务语义创建器弹窗 */}
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Debug: log current path
  React.useEffect(() => {
    console.log('Current pathname:', location.pathname);
  }, [location]);

  // Determine if a path is active (handling sub-routes like /skills/:id)
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/atoms') return location.pathname.startsWith('/atoms');
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } bg-white/80 backdrop-blur-xl transition-all duration-300 flex flex-col border-r border-gray-200/50 z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 text-gray-900 font-semibold text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-lg flex items-center justify-center">
                <Box className="text-white" size={18} />
              </div>
              <span>Nexus<span className="text-gray-400"> Platform</span></span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-lg flex items-center justify-center mx-auto">
              <Box className="text-white" size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label={sidebarOpen ? "仪表盘" : ""} active={isActive('/')} />
          <NavLink to="/skills" icon={<Zap size={20} />} label={sidebarOpen ? "技能中心" : ""} active={isActive('/skills')} />
          <NavLink to="/mcp-tools" icon={<Cpu size={20} />} label={sidebarOpen ? "MCP工具" : ""} active={isActive('/mcp-tools')} />
          <NavLink to="/atoms" icon={<Atom size={20} />} label={sidebarOpen ? "业务释义库" : ""} active={isActive('/atoms')} />
          <NavLink to="/ontology" icon={<Network size={20} />} label={sidebarOpen ? "业务场景推演" : ""} active={isActive('/ontology')} />
          <NavLink to="/business-semantic" icon={<Layers size={20} />} label={sidebarOpen ? "业务语义" : ""} active={isActive('/business-semantic')} />
        </nav>

        <div className="p-4 border-t border-gray-200/50">
           <NavLink to="/settings" icon={<Settings size={20} />} label={sidebarOpen ? "设置" : ""} active={isActive('/settings')} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-16 flex items-center justify-between px-6 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {sidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500"><span className="font-medium text-[#34C759]">●</span> Production</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-semibold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="w-full h-full max-w-[1920px] mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/skills" element={<SkillsRegistry />} />
              <Route path="/skills/new" element={<SkillRegistration />} />
              <Route path="/skills/:skillId" element={<SkillDetail />} />
              <Route path="/ontology" element={<OntologyGraph />} />
              <Route path="/atoms/scenario" element={<ScenarioAtomsModule />} />
              <Route path="/atoms" element={<AtomicOntologyModule />} />
              <Route path="/business-semantic" element={<BusinessSemanticPage />} />
              <Route path="/mcp-tools" element={<MCPTools />} />
              <Route path="/mcp-tools/:solverType" element={<MCPTools />} />
              <Route path="/mcp-tools/constraints/:view?" element={<MCPTools />} />
              <Route path="/mcp-tools/ontology/:ontologyToolId" element={<MCPTools />} />
              <Route path="*" element={<div className="p-10 text-center"><h1 className="text-2xl text-[#FF3B30]">404 - Page Not Found</h1><p className="text-gray-500">Path: {location.pathname}</p></div>} />
            </Routes>
          </div>
        </main>
      </div>
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