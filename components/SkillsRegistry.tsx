import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SKILLS, getAllScenarios } from '../constants';
import { Skill, SkillCategory as SkillCategoryType, SKILL_CATEGORIES } from '../types';
import { Search, Filter, Cpu, Code, Database, Zap, Network, Plus, Atom, Box, Grid, Layers, Activity, TrendingUp, Factory, Package, CheckCircle, DollarSign, Truck, Users, Calendar, Settings, AlertCircle, BarChart3, Cog, GitBranch, Calculator, Clock, Wrench, AlertTriangle, Shield, GitMerge, Target, Hammer, Library, Workflow, FileCode, BookOpen, Server, Leaf } from 'lucide-react';

// 技能层级定义
type SkillLevel = 'atomic' | 'domain' | 'scenario' | 'business';

// 技能业务分类
type SkillBusinessCategory = 'production' | 'maintenance' | 'planning' | 'quality' | 'finance' | 'logistics' | 'general';

// 技能分类定义 - 包含Claude Code 10大分类
 type SkillFilterCategory = 'all' | SkillLevel | SkillBusinessCategory | SkillCategoryType;

 interface CategoryConfig {
  id: SkillFilterCategory;
  name: string;
  icon: React.ReactNode;
  type: 'system' | 'claude';
}

// Claude Code 10大分类图标映射
const categoryIconMap: Record<string, React.ReactNode> = {
  'library-api': <Library size={16} />,
  'validation': <CheckCircle size={16} />,
  'data-analysis': <BarChart3 size={16} />,
  'workflow': <Workflow size={16} />,
  'scaffolding': <FileCode size={16} />,
  'code-quality': <Shield size={16} />,
  'cicd': <GitBranch size={16} />,
  'runbook': <BookOpen size={16} />,
  'infrastructure': <Server size={16} />,
  'carbon-energy': <Leaf size={16} />
};

// 完整的分类列表 - 系统层级 + Claude Code 10大分类
const CATEGORIES: CategoryConfig[] = [
  // 系统层级分类
  { id: 'all', name: '全部技能', icon: <Grid size={16} />, type: 'system' },
  { id: 'atomic', name: '原子层算法', icon: <Atom size={16} />, type: 'system' },
  { id: 'domain', name: '领域层技能', icon: <Layers size={16} />, type: 'system' },
  { id: 'scenario', name: '场景层技能', icon: <Activity size={16} />, type: 'system' },
  // Claude Code 10大分类
  ...SKILL_CATEGORIES.map(cat => ({
    id: cat.id as SkillFilterCategory,
    name: cat.name,
    icon: categoryIconMap[cat.id] || <Box size={16} />,
    type: 'claude' as const
  }))
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
    if (skill.skill_id.includes('forecast')) return <TrendingUp size={18} />;
    if (skill.skill_id.includes('optimization')) return <BarChart3 size={18} />;
    if (skill.skill_id.includes('simulation')) return <Activity size={18} />;
    if (skill.skill_id.includes('clustering') || skill.skill_id.includes('classification')) return <Layers size={18} />;
    if (skill.skill_id.includes('graph') || skill.skill_id.includes('path')) return <GitBranch size={18} />;
    if (skill.skill_id.includes('programming') || skill.skill_id.includes('linear')) return <Calculator size={18} />;
    return <Atom size={18} />;
  }

  // 领域层图标
  if (level === 'domain') {
    if (skill.skill_id.includes('health') || skill.skill_id.includes('oee')) return <Activity size={18} />;
    if (skill.skill_id.includes('rul')) return <Clock size={18} />;
    if (skill.skill_id.includes('mttr') || skill.skill_id.includes('repair')) return <Hammer size={18} />;
    if (skill.skill_id.includes('spare')) return <Package size={18} />;
    if (skill.skill_id.includes('cycle') || skill.skill_id.includes('process')) return <Cog size={18} />;
    if (skill.skill_id.includes('scheduling')) return <Calendar size={18} />;
    if (skill.skill_id.includes('bottleneck') || skill.skill_id.includes('balance')) return <GitBranch size={18} />;
    if (skill.skill_id.includes('yield')) return <TrendingUp size={18} />;
    if (skill.skill_id.includes('supply')) return <Truck size={18} />;
    return <Layers size={18} />;
  }

  // 场景层图标
  if (level === 'scenario') {
    if (skill.skill_id.includes('maintenance')) return <Settings size={18} />;
    if (skill.skill_id.includes('repair')) return <Wrench size={18} />;
    if (skill.skill_id.includes('downtime') || skill.skill_id.includes('impact')) return <AlertCircle size={18} />;
    if (skill.skill_id.includes('demand') || skill.skill_id.includes('capacity')) return <BarChart3 size={18} />;
    if (skill.skill_id.includes('inventory')) return <Package size={18} />;
    if (skill.skill_id.includes('deviation') || skill.skill_id.includes('alert')) return <AlertTriangle size={18} />;
    if (skill.skill_id.includes('investment') || skill.skill_id.includes('expansion')) return <DollarSign size={18} />;
    if (skill.skill_id.includes('risk')) return <Shield size={18} />;
    if (skill.skill_id.includes('comparison') || skill.skill_id.includes('decision')) return <GitMerge size={18} />;
    return <Target size={18} />;
  }

  return <Cpu size={18} />;
};

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  const navigate = useNavigate();
  const skillLevel = getSkillLevel(skill);

  // Find readable domain name from all scenarios
  const allScenarios = getAllScenarios();
  const domainName = allScenarios.find(s => s.id === skill.domain[0])?.name || skill.domain[0];

  // 获取层级标签样式 - 使用灰度设计
  const getLevelBadgeStyle = (level: SkillLevel) => {
    switch (level) {
      case 'atomic':
        return 'bg-gray-100 text-gray-600';
      case 'domain':
        return 'bg-gray-100 text-gray-600';
      case 'scenario':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
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

  // 获取来源标签样式
  const getSourceBadge = () => {
    if (!skill.source) return null;
    const isPreset = skill.source.type === 'preset';
    return {
      text: isPreset ? '系统预设' : '对话沉淀',
      className: isPreset
        ? 'bg-gray-50 text-gray-500 border border-gray-200'
        : 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      creator: skill.source.creator,
      date: skill.source.createdAt ? new Date(skill.source.createdAt).toLocaleDateString('zh-CN') : null,
    };
  };

  const sourceBadge = getSourceBadge();

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/skills/${skill.skill_id}`)}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-gray-100 transition-colors">
              {getSkillIcon(skill)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate text-sm">{skill.name}</h4>
              <div className="text-xs text-gray-400 font-mono truncate">{skill.skill_id}</div>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getLevelBadgeStyle(skillLevel)}`}>
            {getLevelName(skillLevel)}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{skill.description}</p>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skill.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium border border-indigo-100">
              {SKILL_CATEGORIES.find(c => c.id === skill.category)?.name || skill.category}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
            {domainName}
          </span>
        </div>

        {/* 能力标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.capability_tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-gray-400 px-1.5 py-0.5">
              #{tag}
            </span>
          ))}
          {skill.capability_tags.length > 3 && (
            <span className="text-xs text-gray-300">+{skill.capability_tags.length - 3}</span>
          )}
        </div>

        {/* 来源信息 */}
        {sourceBadge && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${sourceBadge.className}`}>
              {sourceBadge.text}
            </span>
            <span className="text-[10px] text-gray-400">
              {sourceBadge.creator}
              {sourceBadge.date && ` · ${sourceBadge.date}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap size={12} />
            {skill.latency}ms
          </span>
          <span className="flex items-center gap-1">
            <Database size={12} />
            {(skill.accuracy_score * 100).toFixed(0)}%
          </span>
        </div>
        <span className="text-gray-300">v{skill.version}</span>
      </div>
    </div>
  );
};

const SkillsRegistry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SkillFilterCategory>('all');
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
    const stats: Record<SkillFilterCategory, number> = {
      all: MOCK_SKILLS.length,
      atomic: levelStats.atomic,
      domain: levelStats.domain,
      scenario: levelStats.scenario,
      production: 0,
      maintenance: 0,
      planning: 0,
      quality: 0,
      finance: 0,
      logistics: 0,
      general: 0,
      // Claude Code 10大分类
      'library-api': 0,
      'validation': 0,
      'data-analysis': 0,
      'workflow': 0,
      'scaffolding': 0,
      'code-quality': 0,
      'cicd': 0,
      'runbook': 0,
      'infrastructure': 0,
      'carbon-energy': 0
    };

    MOCK_SKILLS.forEach(skill => {
      // 统计业务分类
      const businessCategory = getSkillBusinessCategory(skill);
      if (businessCategory in stats) {
        stats[businessCategory as SkillFilterCategory]++;
      }
      // 统计Claude Code分类
      if (skill.category) {
        if (skill.category in stats) {
          stats[skill.category as SkillFilterCategory]++;
        }
      }
    });

    return stats;
  }, [levelStats]);

  // 筛选技能
  const filteredSkills = useMemo(() => {
    return MOCK_SKILLS.filter(skill => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.skill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.capability_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (activeCategory === 'all') return matchesSearch;

      // 检查是否是系统层级分类
      const level = getSkillLevel(skill);
      if (activeCategory === level) return matchesSearch;

      // 检查是否是Claude Code分类
      if (skill.category === activeCategory) return matchesSearch;

      // 检查是否是业务分类
      const businessCategory = getSkillBusinessCategory(skill);
      if (businessCategory === activeCategory) return matchesSearch;

      return false;
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

      if (level === 'atomic') {
        groups['原子层算法'].push(skill);
      } else if (level === 'domain') {
        groups['领域层技能'].push(skill);
      } else if (level === 'scenario') {
        groups['场景层技能'].push(skill);
      } else {
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

    return Object.fromEntries(Object.entries(groups).filter(([, skills]) => skills.length > 0));
  }, [filteredSkills, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">技能注册中心</h2>
          <p className="text-sm text-gray-500 mt-1">共 {MOCK_SKILLS.length} 个技能 · 原子层 {levelStats.atomic} · 领域层 {levelStats.domain} · 场景层 {levelStats.scenario} · 业务层 {levelStats.business}</p>
        </div>
        <button
          onClick={() => navigate('/skills/new')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          注册新技能
        </button>
      </div>

      {/* 分类筛选 - 系统层级 + Claude Code 10大分类 */}
      <div className="space-y-3">
        {/* 系统层级分类 */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => c.type === 'system').map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === category.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
              }`}>
                {categoryStats[category.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Claude Code 10大分类 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 py-1.5 mr-1">分类:</span>
          {CATEGORIES.filter(c => c.type === 'claude').map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === category.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-500'
              }`}>
                {categoryStats[category.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 搜索栏 - 简化设计 */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索技能名称、ID或标签..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white text-sm transition-colors bg-white">
          <Filter size={16} />
          <span>筛选</span>
        </button>
      </div>

      {/* 技能列表 */}
      <div className="space-y-8">
        {Object.entries(groupedSkills).map(([groupName, skills]) => (
          <div key={groupName} className="space-y-4">
            {/* 分组标题 - 简化 */}
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-gray-900">{groupName}</h3>
              <span className="text-xs text-gray-400">({skills.length})</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            {/* 技能卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {skills.map(skill => (
                <SkillCard key={skill.skill_id} skill={skill} />
              ))}
            </div>
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3">
              <Search size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">未找到匹配的技能</p>
            <p className="text-gray-400 text-xs mt-1">请尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsRegistry;
