import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Layers, Box, Settings, Database, Zap, GitBranch,
  Activity, Gauge, Clock, ShieldAlert, CheckCircle, Target,
  BarChart3, Scale, AlertTriangle, FileText, Workflow, Beaker,
  Thermometer, Droplets, Wind, Zap as ZapIcon, Package, TrendingUp
} from 'lucide-react';
import { ATOMIC_ONTOLOGY_LIBRARY } from '../constants';
import { AtomicOntology } from '../types';

// 场景原子业务语义分类
interface PrincipleCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  atomIds: string[];
}

// 定义支撑业务流程图谱场景的原子业务语义分类
const PRINCIPLE_CATEGORIES: PrincipleCategory[] = [
  {
    id: 'scenario_core',
    name: '场景核心原子业务语义',
    description: '定义业务场景的基础属性，包括场景标识、状态、版本等信息',
    icon: Layers,
    atomIds: ['scenario_status', 'scenario_version', 'data_readiness', 'industry_type', 'domain_scope']
  },
  {
    id: 'hierarchy_structure',
    name: '层级结构原子业务语义',
    description: '支撑推演节点和数据节点定义的核心原子业务语义，用于构建场景的分子结构',
    icon: Box,
    atomIds: ['subsystem_type', 'process_type', 'param_category', 'skill_capability', 'node_level']
  },
  {
    id: 'relation_logic',
    name: '关系逻辑原子业务语义',
    description: '定义节点间关系的语义，包括依赖、触发、控制等关系类型',
    icon: GitBranch,
    atomIds: ['relation_type', 'dependency_strength', 'trigger_condition', 'control_authority']
  },
  {
    id: 'decision_support',
    name: '决策支撑原子业务语义',
    description: '支撑场景决策分析的原子原子业务语义，包括权重、阈值、规则等',
    icon: Target,
    atomIds: ['decision_weight', 'threshold_value', 'rule_type', 'influence_factor', 'priority_level']
  },
  {
    id: 'execution_metrics',
    name: '执行度量原子业务语义',
    description: '衡量场景执行效果的核心指标，包括成本、延迟、准确率等',
    icon: BarChart3,
    atomIds: ['execution_cost', 'latency_ms', 'accuracy_score', 'success_rate', 'throughput']
  },
  {
    id: 'quality_governance',
    name: '质量治理原子业务语义',
    description: '保障数据质量和场景可靠性的原子原子业务语义',
    icon: ShieldAlert,
    atomIds: ['data_quality_score', 'reliability_index', 'confidence_level', 'validation_status', 'risk_level']
  }
];

// 锂电制造场景专用原子业务语义
const LITHIUM_SPECIFIC_PRINCIPLES: PrincipleCategory[] = [
  {
    id: 'coating_process',
    name: '涂布工艺原子业务语义',
    description: '涂布工序场景构建必需的核心参数原子业务语义',
    icon: Beaker,
    atomIds: ['coating_speed', 'coating_thickness', 'slurry_viscosity', 'coating_width', 'coating_temperature']
  },
  {
    id: 'rolling_process',
    name: '辊压工艺原子业务语义',
    description: '辊压工序场景构建必需的核心参数原子业务语义',
    icon: Scale,
    atomIds: ['rolling_pressure', 'rolling_thickness', 'thickness_uniformity', 'surface_density', 'pole_piece_density']
  },
  {
    id: 'electrical_performance',
    name: '电性能原子业务语义',
    description: '电池电性能评估场景的核心指标原子业务语义',
    icon: ZapIcon,
    atomIds: ['voltage', 'current', 'resistance', 'capacity', 'energy_density', 'power_density']
  },
  {
    id: 'environment_control',
    name: '环境控制原子业务语义',
    description: '制造环境监控场景必需的环境参数原子业务语义',
    icon: Wind,
    atomIds: ['dew_point', 'cleanliness', 'ambient_temperature', 'humidity', 'pressure']
  },
  {
    id: 'safety_monitoring',
    name: '安全监控原子业务语义',
    description: '生产安全监控场景必需的安全参数原子业务语义',
    icon: AlertTriangle,
    atomIds: ['temperature_rise', 'gas_concentration', 'smoke_density', 'emergency_status', 'safety_interlock']
  },
  {
    id: 'material_properties',
    name: '材料特性原子业务语义',
    description: '材料质量评估场景必需的材料参数原子业务语义',
    icon: Package,
    atomIds: ['particle_size', 'specific_surface_area', 'tap_density', 'moisture_content', 'purity']
  }
];

const ScenarioAtomsModule: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'lithium'>('general');

  const currentCategories = activeTab === 'general' ? PRINCIPLE_CATEGORIES : LITHIUM_SPECIFIC_PRINCIPLES;

  // 获取原子详情
  const getAtomDetails = (atomId: string): AtomicOntology | undefined => {
    return ATOMIC_ONTOLOGY_LIBRARY.find(atom => atom.id === atomId);
  };

  const selectedCategoryData = currentCategories.find(c => c.id === selectedCategory);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/atoms')}
            className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">场景原子业务语义</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              支撑业务流程图谱场景构建的核心原子业务语义集合
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab('general'); setSelectedCategory(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            通用语义
          </button>
          <button
            onClick={() => { setActiveTab('lithium'); setSelectedCategory(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'lithium'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            锂电制造专用
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Category Cards */}
        <div className="w-1/2 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            {currentCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-gray-500" />
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {category.atomIds.length} 个语义
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>

                  {/* Preview Atoms */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {category.atomIds.slice(0, 3).map(atomId => {
                      const atom = getAtomDetails(atomId);
                      return atom ? (
                        <span
                          key={atomId}
                          className="text-[10px] px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-600"
                        >
                          {atom.name}
                        </span>
                      ) : null;
                    })}
                    {category.atomIds.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 text-gray-400">
                        +{category.atomIds.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Workflow className="text-gray-500" size={20} />
              <h3 className="font-medium text-gray-900 text-sm">场景构建指南</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <p>
                <span className="font-medium text-gray-700">推演节点：</span>
                负责分析、评估、预测、决策的节点，整合数据节点输入并输出决策建议
              </p>
              <p>
                <span className="font-medium text-gray-700">数据节点：</span>
                提供原始数据、参数、指标的节点，为推演节点提供分析所需的数据支撑
              </p>
              <p>
                <span className="font-medium text-gray-700">关系连接：</span>
                使用关系逻辑原子业务语义定义节点间的语义关联，形成完整的知识图谱
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Atom Details */}
        <div className="w-1/2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {selectedCategoryData ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <selectedCategoryData.icon size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{selectedCategoryData.name}</h3>
                    <p className="text-xs text-gray-500">{selectedCategoryData.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {selectedCategoryData.atomIds.map(atomId => {
                    const atom = getAtomDetails(atomId);
                    if (!atom) return null;

                    return (
                      <div
                        key={atomId}
                        className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 bg-white shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="font-medium text-gray-900 text-sm">{atom.name}</span>
                            {atom.unit && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {atom.unit}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{atom.dataType}</span>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 ml-3.5">{atom.description}</p>

                        {atom.constraints && (
                          <div className="mt-2 ml-3.5 flex flex-wrap gap-2">
                            {atom.constraints.min !== undefined && (
                              <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                                最小: {atom.constraints.min}
                              </span>
                            )}
                            {atom.constraints.max !== undefined && (
                              <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                                最大: {atom.constraints.max}
                              </span>
                            )}
                            {atom.constraints.enum && (
                              <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                                枚举: {atom.constraints.enum.join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-2 ml-3.5 flex flex-wrap gap-1">
                          {atom.tags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] text-gray-400">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Usage Context */}
                        <div className="mt-3 ml-3.5 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-500">
                          <span className="font-medium">应用场景: </span>
                          {activeTab === 'general'
                            ? `适用于${selectedCategoryData.name}的业务流程图谱构建`
                            : `适用于锂电制造${selectedCategoryData.name.split('原子业务语义')[0]}场景`
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">选择左侧分类查看原子业务语义详情</p>
                <p className="text-xs text-gray-400 mt-1">这些原子业务语义是构建业务流程图谱场景的基础</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioAtomsModule;
