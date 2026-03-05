import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SKILLS, getAllScenarios } from '../constants';
import { Skill } from '../types';
import { Search, Filter, Cpu, Code, Database, Zap, Network, Plus, Atom, Box, Grid, Layers, Activity, TrendingUp, Factory, Package, CheckCircle, DollarSign, Truck, Users, Calendar, Settings, AlertCircle, BarChart3, Cog, GitBranch, Calculator, Clock, Wrench, AlertTriangle, Shield, GitMerge, Target, Hammer } from 'lucide-react';

// 技能层级定义
type SkillLevel = 'atomic' | 'domain' | 'scenario' | 'business';

// 技能业务分类
type SkillBusinessCategory = 'production' | 'maintenance' | 'planning' | 'quality' | 'finance' | 'logistics' | 'general';

// 技能分类定义
type SkillCategory = 'all' | SkillLevel | SkillBusinessCategory;

interface CategoryConfig {
  id: SkillCategory;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'all', name: '全部技能', icon: <Grid size={18} />, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  { id: 'atomic', name: '原子层算法', icon: <Atom size={18} />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  { id: 'domain', name: '领域层技能', icon: <Layers size={18} />, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'scenario', name: '场景层技能', icon: <Activity size={18} />, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { id: 'production', name: '生产制造', icon: <Factory size={18} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  { id: 'maintenance', name: '设备维护', icon: <Settings size={18} />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'planning', name: '计划排程', icon: <Calendar size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'quality', name: '质量管理', icon: <CheckCircle size={18} />, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'finance', name: '财务成本', icon: <DollarSign size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'logistics', name: '供应链物流', icon: <Truck size={18} />, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
];

// 判断技能层级
const getSkillLevel = (skill: Skill): SkillLevel => {
  if (skill.skill_id.startsWith('atom_')) return 'atomic';
  if (skill.skill_id.startsWith('domain_')) return 'domain';
  if (skill.skill_id.startsWith('scenario_')) return 'scenario';
  return 'business';
};

// 判断技能业务分类
const getSkillBusinessCategory = (skill: Skill): SkillBusinessCategory => {
  const tags = skill.capability_tags.map(t => t.toLowerCase());
  const domain = skill.domain.map(d => d.toLowerCase());
  const name = skill.name.toLowerCase();

  if (domain.some(d => d.includes('maintenance')) || tags.some(t => ['maintenance', 'repair', 'rul', 'predictive'].includes(t)) || name.includes('维修') || name.includes('维护')) return 'maintenance';
  if (domain.some(d => d.includes('quality')) || tags.some(t => ['quality', 'purity', 'defect', 'inspection'].includes(t)) || name.includes('质量') || name.includes('检测')) return 'quality';
  if (domain.some(d => d.includes('planning') || d.includes('schedule')) || tags.some(t => ['planning', 'scheduling', 'forecast'].includes(t)) || name.includes('计划') || name.includes('排程') || name.includes('预测')) return 'planning';
  if (domain.some(d => d.includes('cost') || d.includes('finance')) || tags.some(t => ['cost', 'finance', 'investment', 'capex'].includes(t)) || name.includes('成本') || name.includes('财务') || name.includes('投资')) return 'finance';
  if (domain.some(d => d.includes('logistics') || d.includes('supply')) || tags.some(t => ['logistics', 'supply_chain', 'inventory'].includes(t)) || name.includes('物流') || name.includes('库存') || name.includes('供应链')) return 'logistics';
  if (domain.some(d => d.includes('production') || d.includes('manufacturing') || d.includes('mixing') || d.includes('coating') || d.includes('winding')) || tags.some(t => ['production', 'process_control', 'manufacturing'].includes(t)) || name.includes('生产') || name.includes('制造') || name.includes('涂布') || name.includes('卷绕') || name.includes('辊压')) return 'production';

  return 'general';
};

// 判断技能分类（综合层级和业务）
const getSkillCategory = (skill: Skill): SkillCategory => {
  const level = getSkillLevel(skill);
  if (level === 'atomic' || level === 'domain' || level === 'scenario') {
    return level;
  }
  return getSkillBusinessCategory(skill);
};

// 获取技能图标
const getSkillIcon = (skill: Skill) => {
  const level = getSkillLevel(skill);

  // 原子层图标
  if (level === 'atomic') {
    if (skill.skill_id.includes('forecast')) return <TrendingUp size={20} />;
    if (skill.skill_id.includes('optimization')) return <BarChart3 size={20} />;
    if (skill.skill_id.includes('simulation')) return <Activity size={20} />;
    if (skill.skill_id.includes('clustering') || skill.skill_id.includes('classification')) return <Layers size={20} />;
    if (skill.skill_id.includes('graph') || skill.skill_id.includes('path')) return <GitBranch size={20} />;
    if (skill.skill_id.includes('programming') || skill.skill_id.includes('linear')) return <Calculator size={20} />;
    return <Atom size={20} />;
  }

  // 领域层图标
  if (level === 'domain') {
    if (skill.skill_id.includes('health') || skill.skill_id.includes('oee')) return <Activity size={20} />;
    if (skill.skill_id.includes('rul')) return <Clock size={20} />;
    if (skill.skill_id.includes('mttr') || skill.skill_id.includes('repair')) return <Hammer size={20} />;
    if (skill.skill_id.includes('spare')) return <Package size={20} />;
    if (skill.skill_id.includes('cycle') || skill.skill_id.includes('process')) return <Cog size={20} />;
    if (skill.skill_id.includes('scheduling')) return <Calendar size={20} />;
    if (skill.skill_id.includes('bottleneck') || skill.skill_id.includes('balance')) return <GitBranch size={20} />;
    if (skill.skill_id.includes('yield')) return <TrendingUp size={20} />;
    if (skill.skill_id.includes('supply')) return <Truck size={20} />;
    return <Layers size={20} />;
  }

  // 场景层图标
  if (level === 'scenario') {
    if (skill.skill_id.includes('maintenance')) return <Settings size={20} />;
    if (skill.skill_id.includes('repair')) return <Wrench size={20} />;
    if (skill.skill_id.includes('downtime') || skill.skill_id.includes('impact')) return <AlertCircle size={20} />;
    if (skill.skill_id.includes('demand') || skill.skill_id.includes('capacity')) return <BarChart3 size={20} />;
    if (skill.skill_id.includes('inventory')) return <Package size={20} />;
    if (skill.skill_id.includes('deviation') || skill.skill_id.includes('alert')) return <AlertTriangle size={20} />;
    if (skill.skill_id.includes('investment') || skill.skill_id.includes('expansion')) return <DollarSign size={20} />;
    if (skill.skill_id.includes('risk')) return <Shield size={20} />;
    if (skill.skill_id.includes('comparison') || skill.skill_id.includes('decision')) return <GitMerge size={20} />;
    return <Target size={20} />;
  }

  return <Cpu size={20} />;
};

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  const navigate = useNavigate();
  const category = getSkillCategory(skill);
  const categoryConfig = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  // Find readable domain name from all scenarios (including dynamic ones)
  const allScenarios = getAllScenarios();
  const domainName = allScenarios.find(s => s.id === skill.domain[0])?.name || skill.domain[0];

  const skillLevel = getSkillLevel(skill);

  // 获取层级标签样式
  const getLevelBadgeStyle = (level: SkillLevel) => {
    switch (level) {
      case 'atomic':
        return 'bg-violet-100 text-violet-600';
      case 'domain':
        return 'bg-indigo-100 text-indigo-600';
      case 'scenario':
        return 'bg-rose-100 text-rose-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // 获取层级名称
  const getLevelName = (level: SkillLevel) => {
    switch (level) {
      case 'atomic':
        return '原子层';
      case 'domain':
        return '领域层';
      case 'scenario':
        return '场景层';
      default:
        return '业务层';
    }
  };

  // 获取边框样式
  const getBorderStyle = (level: SkillLevel) => {
    switch (level) {
      case 'atomic':
        return 'border-violet-100';
      case 'domain':
        return 'border-indigo-100';
      case 'scenario':
        return 'border-rose-100';
      default:
        return 'border-slate-100';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 ${getBorderStyle(skillLevel)} p-5 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer`}
      onClick={() => navigate(`/skills/${skill.skill_id}`)}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${categoryConfig.bgColor} ${categoryConfig.color} group-hover:scale-110`}>
              {getSkillIcon(skill)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800 truncate">{skill.name}</h4>
              <div className="text-xs text-slate-400 font-mono truncate">{skill.skill_id}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">v{skill.version}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getLevelBadgeStyle(skillLevel)}`}>
              {getLevelName(skillLevel)}
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{skill.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}>
            {domainName}
          </span>
          {skill.capability_tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
              #{tag}
            </span>
          ))}
          {skill.capability_tags.length > 3 && (
            <span className="text-xs text-slate-400 px-1">+{skill.capability_tags.length - 3}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-3 mb-3">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Zap size={12} className="text-amber-500" />
          <span className="font-medium">{skill.latency}ms</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Database size={12} className="text-blue-500" />
          <span className="font-medium">{(skill.accuracy_score * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Code size={12} className="text-emerald-500" />
          <span className="font-medium">{skill.cost}</span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/ontology?scenario=${skill.domain[0]}`);
        }}
        className="w-full mt-auto py-2.5 flex items-center justify-center text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
      >
        <Network size={14} className="mr-2" />
        查看业务图谱关联
      </button>
    </div>
  );
};

const SkillsRegistry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('all');
  const navigate = useNavigate();

  // 按层级统计技能数量
  const levelStats = useMemo(() => {
    const stats = { atomic: 0, domain: 0, scenario: 0, business: 0 };
    MOCK_SKILLS.forEach(skill => {
      const level = getSkillLevel(skill);
      stats[level]++;
    });
    return stats;
  }, []);

  // 按分类统计技能数量
  const categoryStats = useMemo(() => {
    const stats: Record<SkillCategory, number> = {
      all: MOCK_SKILLS.length,
      atomic: 0,
      domain: 0,
      scenario: 0,
      production: 0,
      maintenance: 0,
      planning: 0,
      quality: 0,
      finance: 0,
      logistics: 0,
      general: 0,
    };
    MOCK_SKILLS.forEach(skill => {
      const category = getSkillCategory(skill);
      stats[category]++;
    });
    // 原子层、领域层、场景层使用层级统计
    stats.atomic = levelStats.atomic;
    stats.domain = levelStats.domain;
    stats.scenario = levelStats.scenario;
    return stats;
  }, [levelStats]);

  // 筛选技能
  const filteredSkills = useMemo(() => {
    return MOCK_SKILLS.filter(skill => {
      // 搜索过滤
      const matchesSearch =
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.skill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.capability_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // 分类过滤
      const category = getSkillCategory(skill);
      const level = getSkillLevel(skill);
      const matchesCategory = activeCategory === 'all' ||
        category === activeCategory ||
        level === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  // 按三层架构分组展示
  const groupedSkills = useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filteredSkills };
    }

    const groups: Record<string, Skill[]> = {
      '原子层算法': [],
      '领域层技能': [],
      '场景层技能': [],
      '生产制造': [],
      '计划排程': [],
      '设备维护': [],
      '质量管理': [],
      '供应链物流': [],
      '财务成本': [],
      '其他业务': [],
    };

    filteredSkills.forEach(skill => {
      const level = getSkillLevel(skill);
      const category = getSkillBusinessCategory(skill);

      // 首先按三层架构分层
      if (level === 'atomic') {
        groups['原子层算法'].push(skill);
      } else if (level === 'domain') {
        groups['领域层技能'].push(skill);
      } else if (level === 'scenario') {
        groups['场景层技能'].push(skill);
      } else {
        // 业务层再细分
        switch (category) {
          case 'production':
            groups['生产制造'].push(skill);
            break;
          case 'planning':
            groups['计划排程'].push(skill);
            break;
          case 'maintenance':
            groups['设备维护'].push(skill);
            break;
          case 'quality':
            groups['质量管理'].push(skill);
            break;
          case 'logistics':
            groups['供应链物流'].push(skill);
            break;
          case 'finance':
            groups['财务成本'].push(skill);
            break;
          default:
            groups['其他业务'].push(skill);
        }
      }
    });

    // 过滤空分组
    return Object.fromEntries(Object.entries(groups).filter(([, skills]) => skills.length > 0));
  }, [filteredSkills, activeCategory]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">技能注册中心</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-slate-500">三层架构技能体系</span>
            <span className="text-xs px-2 py-1 bg-violet-100 text-violet-600 rounded-full">原子层 {levelStats.atomic}</span>
            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">领域层 {levelStats.domain}</span>
            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-600 rounded-full">场景层 {levelStats.scenario}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">业务层 {levelStats.business}</span>
            <span className="text-slate-400">| 共 {MOCK_SKILLS.length} 个</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/skills/new')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center shadow-sm hover:shadow-md"
          >
            <Plus size={18} className="mr-1.5" />
            注册新技能
          </button>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? `${category.bgColor} ${category.color} ${category.borderColor} border-2 shadow-sm`
                  : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeCategory === category.id ? 'bg-white/60' : 'bg-slate-200 text-slate-600'
              }`}>
                {categoryStats[category.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="按名称、ID 或能力标签搜索..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <Filter size={18} />
          <span>高级筛选</span>
        </button>
      </div>

      {/* 技能列表 */}
      <div className="space-y-8">
        {Object.entries(groupedSkills).map(([groupName, skills]) => (
          <div key={groupName} className="space-y-4">
            {/* 分组标题 */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                groupName === '原子层算法' ? 'bg-violet-50' :
                groupName === '领域层技能' ? 'bg-indigo-50' :
                groupName === '场景层技能' ? 'bg-rose-50' :
                'bg-slate-50'
              }`}>
                {groupName === '原子层算法' && <Atom size={16} className="text-violet-500" />}
                {groupName === '领域层技能' && <Layers size={16} className="text-indigo-500" />}
                {groupName === '场景层技能' && <Activity size={16} className="text-rose-500" />}
                {groupName === '生产制造' && <Factory size={16} className="text-cyan-500" />}
                {groupName === '计划排程' && <Calendar size={16} className="text-emerald-500" />}
                {groupName === '设备维护' && <Settings size={16} className="text-orange-500" />}
                {groupName === '质量管理' && <CheckCircle size={16} className="text-red-500" />}
                {groupName === '供应链物流' && <Truck size={16} className="text-purple-500" />}
                {groupName === '财务成本' && <DollarSign size={16} className="text-amber-500" />}
                {groupName === '其他业务' && <Box size={16} className="text-blue-500" />}
                <span className={`font-semibold ${
                  groupName === '原子层算法' ? 'text-violet-700' :
                  groupName === '领域层技能' ? 'text-indigo-700' :
                  groupName === '场景层技能' ? 'text-rose-700' :
                  'text-slate-700'
                }`}>{groupName}</span>
                <span className="text-xs text-slate-400">({skills.length})</span>
              </div>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* 技能卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {skills.map(skill => (
                <SkillCard key={skill.skill_id} skill={skill} />
              ))}
            </div>
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">未找到匹配的技能</p>
            <p className="text-slate-400 text-sm mt-1">请尝试调整搜索条件或筛选分类</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsRegistry;