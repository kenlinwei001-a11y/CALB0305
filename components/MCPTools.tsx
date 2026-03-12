import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cpu, Settings, Play, Save, RotateCcw, ChevronLeft, Check, AlertCircle, Clock, BarChart3, FileText, Terminal, Database, Shield, History, Plus, Trash2, Copy, Download, Calculator, Layers, Zap, Box, BookOpen, Filter, Search, Edit3, ToggleLeft, ToggleRight, GripVertical, Truck, Factory, Package, CheckCircle, Target, Tag, Grid3X3, Sliders, GitBranch, AlertTriangle, PlusCircle, ArrowRight, RefreshCw, LineChart, Move, Activity, DollarSign, Smile, Percent, AlertOctagon, Brain, Shuffle, Table, Lock, CheckSquare, UserCheck, GitCommit, Undo, ShieldAlert, BarChart2, Network, TrendingUp } from 'lucide-react';

// 求解器类型定义
export interface SolverType {
  id: string;
  name: string;
  fullName: string;
  description: string;
  applicableScenarios: string[];
  exampleSolvers: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

// 约束规则定义
export interface ConstraintRule {
  id: string;
  name: string;
  category: string;
  ontologyObject: string;
  constraintType: 'Hard' | 'Soft';
  expression: string;
  parameters: {
    name: string;
    value: number | string | boolean;
    unit?: string;
  }[];
  enabled: boolean;
  version: string;
  applicableScope: string[];
  riskWeight: number;
  description: string;
}

// 约束规则分类
export const CONSTRAINT_CATEGORIES = [
  { id: 'order', name: '订单与客户维度', icon: FileText, color: 'blue', count: 10 },
  { id: 'logistics', name: '基地与物流维度', icon: Truck, color: 'cyan', count: 7 },
  { id: 'capacity', name: '产线与产能维度', icon: Factory, color: 'indigo', count: 8 },
  { id: 'inventory', name: '物料与库存维度', icon: Package, color: 'green', count: 7 },
  { id: 'supplier', name: '供应商与质量维度', icon: CheckCircle, color: 'amber', count: 6 },
  { id: 'strategy', name: '经营目标与策略权重', icon: Target, color: 'purple', count: 5 }
];

// 推理模型工具定义
export interface OntologyModelingTool {
  id: string;
  name: string;
  function: string;
  modelingObject: string;
  keyFields: string[];
  output: string;
  category: string;
  icon: React.ReactNode;
}

// 推理模型域分类
export const ONTOLOGY_DOMAINS = [
  { id: 'order', name: '订单域建模', icon: FileText, color: 'blue', desc: '订单结构、生命周期、拆分规则' },
  { id: 'customer', name: '客户域建模', icon: Box, color: 'cyan', desc: '客户分层、弹性、风险评分' },
  { id: 'network', name: '基地与网络', icon: Truck, color: 'indigo', desc: '基地拓扑、物流时效、调拨规则' },
  { id: 'line', name: '产线与工艺', icon: Factory, color: 'violet', desc: '产线能力、OEE、切换规则' },
  { id: 'inventory', name: '物料与库存', icon: Package, color: 'green', desc: 'BOM、齐套率、安全库存' },
  { id: 'supplier', name: '供应商域', icon: CheckCircle, color: 'amber', desc: '供货周期、稳定性、加急能力' },
  { id: 'quality', name: '质量与良率', icon: Shield, color: 'rose', desc: '良率模型、异常频率、返工报废' },
  { id: 'objective', name: '经营目标', icon: Target, color: 'purple', desc: '目标函数、权重管理、策略标签' },
  { id: 'decision', name: '优化与决策', icon: Cpu, color: 'orange', desc: '目标函数、求解器编排、冲突解释' },
  { id: 'simulation', name: '推演与仿真', icon: Activity, color: 'teal', desc: 'What-if沙盘、时间滚动、资源轨迹' },
  { id: 'risk', name: '风险与概率', icon: AlertTriangle, color: 'red', desc: '概率分布、蒙特卡洛、敏感性分析' },
  { id: 'governance', name: '执行与治理', icon: Lock, color: 'slate', desc: '冻结变更、审计版本、组织协同' }
];

// 推理模型工具数据
export const ONTOLOGY_MODELING_TOOLS: OntologyModelingTool[] = [
  // ① 订单域建模工具
  {
    id: 'order_structure_modeler',
    name: '订单结构建模器',
    function: '定义订单层级结构',
    modelingObject: 'Order / SubOrder',
    keyFields: ['客户', '型号', '数量', '交期'],
    output: '标准订单对象',
    category: 'order',
    icon: React.createElement(FileText, { size: 16 })
  },
  {
    id: 'order_lifecycle_fsm',
    name: '订单生命周期状态机',
    function: '建模订单状态流转',
    modelingObject: 'OrderState',
    keyFields: ['待排产', '冻结', '已交付'],
    output: '状态转移图',
    category: 'order',
    icon: React.createElement(Layers, { size: 16 })
  },
  {
    id: 'order_split_rule_modeler',
    name: '订单拆分规则建模器',
    function: '建模拆单逻辑',
    modelingObject: 'OrderSplitRule',
    keyFields: ['最大拆分比例'],
    output: '可拆分映射表',
    category: 'order',
    icon: React.createElement(Box, { size: 16 })
  },
  {
    id: 'order_priority_scorer',
    name: '订单优先级评分模型',
    function: '计算优先级',
    modelingObject: 'PriorityModel',
    keyFields: ['毛利', '战略客户标识'],
    output: 'PriorityScore',
    category: 'order',
    icon: React.createElement(Target, { size: 16 })
  },
  {
    id: 'delay_cost_modeler',
    name: '延期成本函数建模器',
    function: '违约成本建模',
    modelingObject: 'PenaltyFunction',
    keyFields: ['延期天数', '单日罚则'],
    output: '成本曲线',
    category: 'order',
    icon: React.createElement(BarChart3, { size: 16 })
  },

  // ② 客户域建模工具
  {
    id: 'customer_tier_modeler',
    name: '客户分层建模器',
    function: '客户等级划分',
    modelingObject: 'Customer',
    keyFields: ['战略客户', '普通客户'],
    output: 'Level',
    category: 'customer',
    icon: React.createElement(Box, { size: 16 })
  },
  {
    id: 'customer_elasticity_model',
    name: '客户弹性模型',
    function: '客户交期容忍度建模',
    modelingObject: 'ElasticityModel',
    keyFields: ['容忍天数'],
    output: '弹性系数',
    category: 'customer',
    icon: React.createElement(Filter, { size: 16 })
  },
  {
    id: 'customer_risk_scorer',
    name: '客户风险评分器',
    function: '投诉/违约风险建模',
    modelingObject: 'RiskModel',
    keyFields: ['历史投诉率'],
    output: 'RiskScore',
    category: 'customer',
    icon: React.createElement(AlertCircle, { size: 16 })
  },
  {
    id: 'customer_margin_contributor',
    name: '客户利润贡献建模器',
    function: '利润权重分配',
    modelingObject: 'MarginContribution',
    keyFields: ['客户利润占比'],
    output: '权重值',
    category: 'customer',
    icon: React.createElement(BarChart3, { size: 16 })
  },

  // ③ 基地与网络结构建模工具
  {
    id: 'base_network_topology',
    name: '基地网络拓扑建模器',
    function: '建立基地间关系',
    modelingObject: 'BaseNetwork',
    keyFields: ['距离', '调拨周期'],
    output: '网络图',
    category: 'network',
    icon: React.createElement(Layers, { size: 16 })
  },
  {
    id: 'logistics_time_modeler',
    name: '物流时效建模器',
    function: '计算交付时间',
    modelingObject: 'LogisticsModel',
    keyFields: ['距离', '运输方式'],
    output: 'LeadTime',
    category: 'network',
    icon: React.createElement(Truck, { size: 16 })
  },
  {
    id: 'cross_base_transfer_rule',
    name: '跨基地调拨规则器',
    function: '定义跨基地约束',
    modelingObject: 'TransferRule',
    keyFields: ['是否允许'],
    output: '调拨矩阵',
    category: 'network',
    icon: React.createElement(Filter, { size: 16 })
  },
  {
    id: 'base_stability_model',
    name: '基地稳定性模型',
    function: '交付稳定性评分',
    modelingObject: 'StabilityIndex',
    keyFields: ['准交率'],
    output: '稳定指数',
    category: 'network',
    icon: React.createElement(CheckCircle, { size: 16 })
  },
  {
    id: 'base_bottleneck_probability',
    name: '基地瓶颈概率模型',
    function: '历史瓶颈概率',
    modelingObject: 'BottleneckModel',
    keyFields: ['负载率'],
    output: '概率值',
    category: 'network',
    icon: React.createElement(BarChart3, { size: 16 })
  },

  // ④ 产线与工艺建模工具
  {
    id: 'line_capacity_modeler',
    name: '产线能力建模器',
    function: '定义理论产能',
    modelingObject: 'Line',
    keyFields: ['理论产能'],
    output: 'BaseCapacity',
    category: 'line',
    icon: React.createElement(Factory, { size: 16 })
  },
  {
    id: 'oee_modeler',
    name: 'OEE建模器',
    function: '修正有效产能',
    modelingObject: 'OEEModel',
    keyFields: ['稼动率'],
    output: 'EffectiveCapacity',
    category: 'line',
    icon: React.createElement(BarChart3, { size: 16 })
  },
  {
    id: 'line_substitution_matrix',
    name: '产线替代矩阵建模器',
    function: '定义可替代关系',
    modelingObject: 'LineSubMatrix',
    keyFields: ['型号-产线映射'],
    output: '替代矩阵',
    category: 'line',
    icon: React.createElement(Layers, { size: 16 })
  },
  {
    id: 'model_switch_modeler',
    name: '型号切换建模器',
    function: '建模切换时间/成本',
    modelingObject: 'SetupModel',
    keyFields: ['切换时间'],
    output: 'SetupCost',
    category: 'line',
    icon: React.createElement(RotateCcw, { size: 16 })
  },
  {
    id: 'continuous_production_constraint',
    name: '连续生产约束建模器',
    function: '限制频繁切换',
    modelingObject: 'ContinuityRule',
    keyFields: ['最少连续批次'],
    output: '约束表达',
    category: 'line',
    icon: React.createElement(Filter, { size: 16 })
  },
  {
    id: 'ramp_curve_modeler',
    name: '爬坡曲线建模器',
    function: '产线爬坡函数',
    modelingObject: 'RampCurve',
    keyFields: ['斜率'],
    output: '产能曲线',
    category: 'line',
    icon: React.createElement(BarChart3, { size: 16 })
  },

  // ⑤ 物料与库存建模工具
  {
    id: 'bom_modeler',
    name: '物料清单建模器',
    function: 'BOM结构建模',
    modelingObject: 'BOM',
    keyFields: ['组件层级'],
    output: '结构树',
    category: 'inventory',
    icon: React.createElement(Layers, { size: 16 })
  },
  {
    id: 'kit_rate_calculator',
    name: '齐套率计算器',
    function: '判断物料可生产性',
    modelingObject: 'KitCalculator',
    keyFields: ['到料时间'],
    output: 'KitRate',
    category: 'inventory',
    icon: React.createElement(Calculator, { size: 16 })
  },
  {
    id: 'safety_stock_modeler',
    name: '安全库存建模器',
    function: '库存红线管理',
    modelingObject: 'SafetyStock',
    keyFields: ['最低库存'],
    output: '下限值',
    category: 'inventory',
    icon: React.createElement(Package, { size: 16 })
  },
  {
    id: 'alt_material_modeler',
    name: '替代料建模器',
    function: '等效料规则',
    modelingObject: 'AltMaterialMatrix',
    keyFields: ['替代等级'],
    output: '替代表',
    category: 'inventory',
    icon: React.createElement(Filter, { size: 16 })
  },
  {
    id: 'in_transit_inventory_model',
    name: '在途库存模型',
    function: '在途风险建模',
    modelingObject: 'InTransit',
    keyFields: ['ETA'],
    output: '可用时间',
    category: 'inventory',
    icon: React.createElement(Truck, { size: 16 })
  },
  {
    id: 'inventory_aging_curve',
    name: '库存老化曲线建模器',
    function: '老化风险函数',
    modelingObject: 'AgingModel',
    keyFields: ['天数'],
    output: '风险系数',
    category: 'inventory',
    icon: React.createElement(BarChart3, { size: 16 })
  },

  // ⑥ 供应商域建模工具
  {
    id: 'supplier_leadtime_model',
    name: '供应商供货周期模型',
    function: '定义LT',
    modelingObject: 'Supplier',
    keyFields: ['LT天数'],
    output: 'ArrivalDate',
    category: 'supplier',
    icon: React.createElement(Clock, { size: 16 })
  },
  {
    id: 'supplier_stability_model',
    name: '供货稳定性模型',
    function: '波动分析',
    modelingObject: 'VarianceModel',
    keyFields: ['标准差'],
    output: '稳定指数',
    category: 'supplier',
    icon: React.createElement(CheckCircle, { size: 16 })
  },
  {
    id: 'expedite_capacity_modeler',
    name: '加急能力建模器',
    function: '定义最大弹性',
    modelingObject: 'ExpediteModel',
    keyFields: ['最大加急量'],
    output: 'ExtraCap',
    category: 'supplier',
    icon: React.createElement(Zap, { size: 16 })
  },
  {
    id: 'multi_source_matrix',
    name: '多源替代矩阵',
    function: '多供应商能力',
    modelingObject: 'MultiSourceMatrix',
    keyFields: ['优先级'],
    output: '供应组合',
    category: 'supplier',
    icon: React.createElement(Layers, { size: 16 })
  },

  // ⑦ 质量与良率建模工具
  {
    id: 'current_yield_model',
    name: '当前良率模型',
    function: '生产合格率',
    modelingObject: 'YieldModel',
    keyFields: ['当前良率'],
    output: '实际产出',
    category: 'quality',
    icon: React.createElement(CheckCircle, { size: 16 })
  },
  {
    id: 'yield_trend_modeler',
    name: '良率趋势建模器',
    function: '斜率预测',
    modelingObject: 'YieldTrend',
    keyFields: ['斜率'],
    output: '风险',
    category: 'quality',
    icon: React.createElement(BarChart3, { size: 16 })
  },
  {
    id: 'quality_event_frequency',
    name: '质量异常频率模型',
    function: '统计异常次数',
    modelingObject: 'QualityEvent',
    keyFields: ['次数'],
    output: '频率',
    category: 'quality',
    icon: React.createElement(AlertCircle, { size: 16 })
  },
  {
    id: 'rework_scrap_model',
    name: '返工报废模型',
    function: '报废概率',
    modelingObject: 'ScrapModel',
    keyFields: ['概率'],
    output: '有效产能修正',
    category: 'quality',
    icon: React.createElement(Filter, { size: 16 })
  },

  // ⑧ 经营目标建模工具
  {
    id: 'objective_combiner',
    name: '目标函数组合器',
    function: '构建多目标函数',
    modelingObject: 'Objective',
    keyFields: ['权重'],
    output: 'Z函数',
    category: 'objective',
    icon: React.createElement(Target, { size: 16 })
  },
  {
    id: 'weight_manager',
    name: '权重管理器',
    function: '管理交付/毛利权重',
    modelingObject: 'WeightConfig',
    keyFields: ['W1/W2/W3'],
    output: '动态权重',
    category: 'objective',
    icon: React.createElement(Filter, { size: 16 })
  },
  {
    id: 'strategy_tag_modeler',
    name: '策略标签建模器',
    function: '保守/激进策略',
    modelingObject: 'StrategyTag',
    keyFields: ['风险系数'],
    output: '策略参数',
    category: 'objective',
    icon: React.createElement(Tag, { size: 16 })
  },

  // ==================== 新增4个工具类型 ====================

  // 一、优化与决策层（Decision Layer）
  // ① 目标函数建模与组合工具
  {
    id: 'multi_objective_combiner',
    name: '多目标组合器',
    function: '组合交付率/毛利/现金流',
    modelingObject: 'ObjectiveFunction',
    keyFields: ['W1', 'W2', 'W3', 'W4', 'Delivery', 'Margin', 'Cost', 'Risk'],
    output: 'Z函数',
    category: 'decision',
    icon: React.createElement(Target, { size: 16 })
  },
  {
    id: 'weight_dynamic_adjuster',
    name: '权重动态调节器',
    function: '根据策略调整权重',
    modelingObject: 'WeightAdjustment',
    keyFields: ['StrategyFactor', 'BaseWeight'],
    output: '动态权重',
    category: 'decision',
    icon: React.createElement(Sliders, { size: 16 })
  },
  {
    id: 'hierarchical_objective_builder',
    name: '分层目标构建器',
    function: '总部与基地目标拆分',
    modelingObject: 'HierarchicalObjective',
    keyFields: ['GlobalZ', 'BaseZ'],
    output: '分层目标',
    category: 'decision',
    icon: React.createElement(Layers, { size: 16 })
  },
  {
    id: 'order_margin_contributor',
    name: '订单边际贡献计算器',
    function: '单订单贡献计算',
    modelingObject: 'MarginContribution',
    keyFields: ['Margin', 'OpportunityCost'],
    output: 'ContributionScore',
    category: 'decision',
    icon: React.createElement(Calculator, { size: 16 })
  },

  // ② 求解器编排工具
  {
    id: 'solver_scheduler',
    name: 'Solver调度器',
    function: '调用MILP/CP-SAT',
    modelingObject: 'SolverScheduler',
    keyFields: ['ProblemSize', 'Algorithm'],
    output: '排产结果',
    category: 'decision',
    icon: React.createElement(Cpu, { size: 16 })
  },
  {
    id: 'solver_strategy_selector',
    name: '求解策略选择器',
    function: '精确解/启发式选择',
    modelingObject: 'SolverStrategy',
    keyFields: ['Scale', 'AlgorithmType'],
    output: '求解方案',
    category: 'decision',
    icon: React.createElement(GitBranch, { size: 16 })
  },
  {
    id: 'segmented_solver',
    name: '分段求解器',
    function: '分周期分产品求解',
    modelingObject: 'RollingSolver',
    keyFields: ['Horizon', 'Period'],
    output: '局部最优解',
    category: 'decision',
    icon: React.createElement(Clock, { size: 16 })
  },
  {
    id: 'warm_start_manager',
    name: 'Warm Start管理器',
    function: '基于历史解初始化',
    modelingObject: 'WarmStart',
    keyFields: ['PreviousSolution'],
    output: '加速收敛',
    category: 'decision',
    icon: React.createElement(Play, { size: 16 })
  },

  // ③ 决策冲突解释工具
  {
    id: 'conflict_root_analyzer',
    name: '冲突根因分析器',
    function: '找出违约原因',
    modelingObject: 'ConflictAnalysis',
    keyFields: ['Penalty', 'Constraint'],
    output: '冲突路径',
    category: 'decision',
    icon: React.createElement(AlertCircle, { size: 16 })
  },
  {
    id: 'constraint_priority_explainer',
    name: '约束优先级解释器',
    function: '解释为何某订单延期',
    modelingObject: 'PriorityExplanation',
    keyFields: ['SoftConstraint', 'Weight'],
    output: '解释报告',
    category: 'decision',
    icon: React.createElement(FileText, { size: 16 })
  },
  {
    id: 'decision_comparison_analyzer',
    name: '决策对比分析器',
    function: '两个方案差异分析',
    modelingObject: 'DecisionComparison',
    keyFields: ['DeltaDelivery', 'DeltaProfit'],
    output: '对比表',
    category: 'decision',
    icon: React.createElement(BarChart2, { size: 16 })
  },
  {
    id: 'decision_graph_visualizer',
    name: '可视化决策图生成器',
    function: '输出因果路径图',
    modelingObject: 'DecisionGraph',
    keyFields: ['Constraint', 'Result'],
    output: '图谱',
    category: 'decision',
    icon: React.createElement(Network, { size: 16 })
  },

  // 二、推演与仿真层（Simulation Layer）
  // ① What-if 沙盘工具
  {
    id: 'demand_fluctuation_simulator',
    name: '需求波动模拟器',
    function: '模拟需求±x%',
    modelingObject: 'DemandSimulation',
    keyFields: ['Demand', 'Delta'],
    output: '新订单集',
    category: 'simulation',
    icon: React.createElement(TrendingUp, { size: 16 })
  },
  {
    id: 'yield_fluctuation_simulator',
    name: '良率波动模拟器',
    function: '模拟良率变化',
    modelingObject: 'YieldSimulation',
    keyFields: ['Yield', 'Epsilon'],
    output: '有效产能变化',
    category: 'simulation',
    icon: React.createElement(Percent, { size: 16 })
  },
  {
    id: 'supply_disruption_simulator',
    name: '供应中断模拟器',
    function: '供应商停供模拟',
    modelingObject: 'SupplyDisruption',
    keyFields: ['MaterialAvailable'],
    output: '风险结果',
    category: 'simulation',
    icon: React.createElement(AlertTriangle, { size: 16 })
  },
  {
    id: 'capacity_expansion_simulator',
    name: '产能扩张模拟器',
    function: '新增产线',
    modelingObject: 'CapacityExpansion',
    keyFields: ['Capacity', 'DeltaCap'],
    output: '新产能状态',
    category: 'simulation',
    icon: React.createElement(PlusCircle, { size: 16 })
  },

  // ② 时间滚动推演工具
  {
    id: 'rolling_window_advancer',
    name: '滚动窗口推进器',
    function: '周期向前推进',
    modelingObject: 'RollingWindow',
    keyFields: ['t', 't+1'],
    output: '新周期状态',
    category: 'simulation',
    icon: React.createElement(ArrowRight, { size: 16 })
  },
  {
    id: 'dynamic_reoptimization_trigger',
    name: '动态再优化触发器',
    function: '条件触发再求解',
    modelingObject: 'ReoptimizationTrigger',
    keyFields: ['RiskScore', 'Threshold'],
    output: '重新排产',
    category: 'simulation',
    icon: React.createElement(RefreshCw, { size: 16 })
  },
  {
    id: 'future_inventory_predictor',
    name: '未来库存预测器',
    function: '预测库存轨迹',
    modelingObject: 'InventoryPrediction',
    keyFields: ['I_t', 'In', 'Out'],
    output: '库存曲线',
    category: 'simulation',
    icon: React.createElement(LineChart, { size: 16 })
  },
  {
    id: 'bottleneck_migration_simulator',
    name: '瓶颈迁移模拟器',
    function: '瓶颈工序变化',
    modelingObject: 'BottleneckMigration',
    keyFields: ['LoadRate'],
    output: '新瓶颈',
    category: 'simulation',
    icon: React.createElement(Move, { size: 16 })
  },

  // ③ 资源占用轨迹模拟器
  {
    id: 'line_load_trajectory_generator',
    name: '产线负载轨迹生成器',
    function: '时间维度负载曲线',
    modelingObject: 'LoadTrajectory',
    keyFields: ['Load_t', 'Demand_t', 'Cap_t'],
    output: '曲线',
    category: 'simulation',
    icon: React.createElement(Activity, { size: 16 })
  },
  {
    id: 'cashflow_trajectory_predictor',
    name: '现金流轨迹预测器',
    function: '收入−库存占用',
    modelingObject: 'CashflowPrediction',
    keyFields: ['Cash_t'],
    output: '现金流趋势',
    category: 'simulation',
    icon: React.createElement(DollarSign, { size: 16 })
  },
  {
    id: 'customer_satisfaction_evolution',
    name: '客户满意度演化模型',
    function: '延期次数累计',
    modelingObject: 'SatisfactionEvolution',
    keyFields: ['DelayCount'],
    output: '满意度趋势',
    category: 'simulation',
    icon: React.createElement(Smile, { size: 16 })
  },

  // 三、风险与概率层（Risk Layer）
  // ① 概率分布建模工具
  {
    id: 'yield_distribution_modeler',
    name: '良率分布建模器',
    function: 'Beta/Normal分布',
    modelingObject: 'YieldDistribution',
    keyFields: ['μ', 'σ²'],
    output: '分布对象',
    category: 'risk',
    icon: React.createElement(BarChart3, { size: 16 })
  },
  {
    id: 'leadtime_distribution_modeler',
    name: '供货期分布建模器',
    function: 'LT波动建模',
    modelingObject: 'LeadtimeDistribution',
    keyFields: ['LogNormal'],
    output: '到货概率',
    category: 'risk',
    icon: React.createElement(Clock, { size: 16 })
  },
  {
    id: 'failure_probability_modeler',
    name: '故障概率建模器',
    function: '产线故障概率',
    modelingObject: 'FailureProbability',
    keyFields: ['P(Failure)'],
    output: '停机概率',
    category: 'risk',
    icon: React.createElement(AlertOctagon, { size: 16 })
  },
  {
    id: 'delay_probability_predictor',
    name: '延期概率预测器',
    function: 'ML模型预测',
    modelingObject: 'DelayPrediction',
    keyFields: ['Logistic'],
    output: 'P(Delay)',
    category: 'risk',
    icon: React.createElement(Brain, { size: 16 })
  },

  // ② 蒙特卡洛仿真器
  {
    id: 'multi_path_monte_carlo',
    name: '多路径随机仿真器',
    function: 'N次随机采样',
    modelingObject: 'MonteCarlo',
    keyFields: ['N', 'Sampling'],
    output: '结果分布',
    category: 'risk',
    icon: React.createElement(Shuffle, { size: 16 })
  },
  {
    id: 'risk_interval_calculator',
    name: '风险区间计算器',
    function: '计算置信区间',
    modelingObject: 'RiskInterval',
    keyFields: ['P95', 'P50'],
    output: '风险区间',
    category: 'risk',
    icon: React.createElement(BarChart3, { size: 16 })
  },
  {
    id: 'extreme_scenario_identifier',
    name: '极端情境识别器',
    function: 'Worst-case路径',
    modelingObject: 'ExtremeScenario',
    keyFields: ['Top5%', 'Risk'],
    output: '极端场景',
    category: 'risk',
    icon: React.createElement(AlertTriangle, { size: 16 })
  },

  // ③ 敏感性分析工具
  {
    id: 'weight_sensitivity_analyzer',
    name: '权重敏感性分析器',
    function: 'W变化对Z影响',
    modelingObject: 'WeightSensitivity',
    keyFields: ['∂Z/∂W_i'],
    output: '敏感度矩阵',
    category: 'risk',
    icon: React.createElement(Table, { size: 16 })
  },
  {
    id: 'yield_sensitivity_analyzer',
    name: '良率敏感度分析器',
    function: 'Yield变化影响交付',
    modelingObject: 'YieldSensitivity',
    keyFields: ['ΔDelivery'],
    output: '影响值',
    category: 'risk',
    icon: React.createElement(Percent, { size: 16 })
  },
  {
    id: 'logistics_risk_sensitivity',
    name: '物流风险敏感性分析器',
    function: '运费变化影响利润',
    modelingObject: 'LogisticsSensitivity',
    keyFields: ['ΔMargin'],
    output: '影响值',
    category: 'risk',
    icon: React.createElement(Truck, { size: 16 })
  },

  // 四、执行与治理层（Governance Layer）
  // ① 冻结与变更管理工具
  {
    id: 'freeze_window_manager',
    name: '冻结窗口管理器',
    function: 'MPS冻结控制',
    modelingObject: 'FreezeWindow',
    keyFields: ['t', 'Freeze'],
    output: '锁定状态',
    category: 'governance',
    icon: React.createElement(Lock, { size: 16 })
  },
  {
    id: 'change_approval_engine',
    name: '变更审批流引擎',
    function: '变更需要审批',
    modelingObject: 'ChangeApproval',
    keyFields: ['RiskScore', 'Threshold'],
    output: '审批流',
    category: 'governance',
    icon: React.createElement(CheckSquare, { size: 16 })
  },
  {
    id: 'mandatory_manual_confirm',
    name: '强制人工确认器',
    function: '高风险强制人工',
    modelingObject: 'ManualConfirmation',
    keyFields: ['RiskLevel'],
    output: '人工节点',
    category: 'governance',
    icon: React.createElement(UserCheck, { size: 16 })
  },

  // ② 审计与版本管理工具
  {
    id: 'scenario_version_manager',
    name: '场景版本管理器',
    function: '保存每次推演版本',
    modelingObject: 'VersionManager',
    keyFields: ['VersionID'],
    output: '历史版本',
    category: 'governance',
    icon: React.createElement(GitCommit, { size: 16 })
  },
  {
    id: 'decision_tracker',
    name: '决策追踪器',
    function: '记录参数变更',
    modelingObject: 'DecisionTracking',
    keyFields: ['ChangeLog'],
    output: '审计记录',
    category: 'governance',
    icon: React.createElement(History, { size: 16 })
  },
  {
    id: 'rollback_tool',
    name: '回滚工具',
    function: '恢复历史状态',
    modelingObject: 'Rollback',
    keyFields: ['PreviousState'],
    output: '历史状态',
    category: 'governance',
    icon: React.createElement(Undo, { size: 16 })
  },

  // ③ 组织协同与策略工具
  {
    id: 'strategy_tag_engine',
    name: '策略标签引擎',
    function: '保守/激进模式',
    modelingObject: 'StrategyEngine',
    keyFields: ['RiskWeight'],
    output: '策略状态',
    category: 'governance',
    icon: React.createElement(ToggleLeft, { size: 16 })
  },
  {
    id: 'sacrifice_customer_manager',
    name: '牺牲客户许可管理',
    function: '是否允许延期',
    modelingObject: 'SacrificePermission',
    keyFields: ['AllowSacrifice'],
    output: '标志位',
    category: 'governance',
    icon: React.createElement(ShieldAlert, { size: 16 })
  },
  {
    id: 'organization_cost_calculator',
    name: '组织成本计算器',
    function: '协同复杂度成本',
    modelingObject: 'OrgCost',
    keyFields: ['CoordinationCost'],
    output: '成本值',
    category: 'governance',
    icon: React.createElement(Calculator, { size: 16 })
  },
  {
    id: 'cross_base_complexity_model',
    name: '跨基地协同复杂度模型',
    function: '基地数量函数',
    modelingObject: 'ComplexityModel',
    keyFields: ['N_bases'],
    output: '风险',
    category: 'governance',
    icon: React.createElement(Network, { size: 16 })
  }
];

// 默认约束规则数据
export const DEFAULT_CONSTRAINT_RULES: ConstraintRule[] = [
  // 订单与客户维度约束
  {
    id: 'order_priority',
    name: '订单优先级',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Soft',
    expression: 'PriorityScore = 客户级别×W1 + 毛利×W2 + 战略标签×W3',
    parameters: [
      { name: 'W1', value: 0.4, unit: '' },
      { name: 'W2', value: 0.35, unit: '' },
      { name: 'W3', value: 0.25, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有订单'],
    riskWeight: 0.8,
    description: '根据客户级别、毛利和战略标签计算订单优先级得分'
  },
  {
    id: 'delivery_window',
    name: '交期窗口',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Hard',
    expression: 'Earliest ≤ DeliveryDate ≤ Latest',
    parameters: [
      { name: 'earliestDays', value: 3, unit: '天' },
      { name: 'latestDays', value: 30, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有订单'],
    riskWeight: 1.0,
    description: '订单交付日期必须在最早和最晚时间窗口内'
  },
  {
    id: 'order_quantity_adjust',
    name: '订单数量调整规则',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Soft',
    expression: 'Q_adj ∈ [Q×(1-δ), Q×(1+δ)]',
    parameters: [
      { name: 'delta', value: 0.1, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['非战略订单'],
    riskWeight: 0.5,
    description: '允许订单数量在一定比例范围内浮动调整'
  },
  {
    id: 'order_split',
    name: '订单是否可拆分',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Hard',
    expression: 'SplitFlag = True 才允许多基地',
    parameters: [
      { name: 'maxSplitRatio', value: 0.6, unit: '' },
      { name: 'minSplitQty', value: 100, unit: '件' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['大批量订单'],
    riskWeight: 1.0,
    description: '只有标记为可拆分的订单才允许跨多个基地生产'
  },
  {
    id: 'order_freeze',
    name: '订单冻结点',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Hard',
    expression: '当前时间 > FreezeDate → 不允许变更',
    parameters: [
      { name: 'freezeDays', value: 2, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有订单'],
    riskWeight: 1.0,
    description: '订单在冻结点之后不允许进行任何变更'
  },
  {
    id: 'delay_penalty',
    name: '延期违约成本',
    category: 'order',
    ontologyObject: 'Order',
    constraintType: 'Soft',
    expression: 'Penalty = 延期天数 × 单日违约成本',
    parameters: [
      { name: 'dailyPenalty', value: 5000, unit: '元/天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有订单'],
    riskWeight: 0.7,
    description: '订单延期交付将产生违约成本'
  },
  {
    id: 'customer_elasticity',
    name: '客户历史履约弹性',
    category: 'order',
    ontologyObject: 'Customer',
    constraintType: 'Soft',
    expression: 'ElasticityCoef ∈ [0,1]',
    parameters: [
      { name: 'toleranceDays', value: 3, unit: '天' },
      { name: 'elasticityBase', value: 0.8, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['VIP客户'],
    riskWeight: 0.6,
    description: '基于客户历史履约情况计算的弹性系数'
  },
  {
    id: 'customer_profit',
    name: '客户利润贡献等级',
    category: 'order',
    ontologyObject: 'Customer',
    constraintType: 'Soft',
    expression: 'ProfitWeight = 等级映射表',
    parameters: [
      { name: 'A级权重', value: 1.5, unit: '' },
      { name: 'B级权重', value: 1.2, unit: '' },
      { name: 'C级权重', value: 1.0, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有客户'],
    riskWeight: 0.7,
    description: '根据客户利润贡献等级设置不同的权重'
  },
  {
    id: 'customer_risk',
    name: '客户投诉/索赔风险',
    category: 'order',
    ontologyObject: 'Customer',
    constraintType: 'Soft',
    expression: 'RiskScore = 投诉频率×严重度',
    parameters: [
      { name: 'frequencyWeight', value: 0.6, unit: '' },
      { name: 'severityWeight', value: 0.4, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['高风险客户'],
    riskWeight: 0.9,
    description: '评估客户投诉和索赔风险的风险评分'
  },
  {
    id: 'customer_crossbase',
    name: '客户跨基地交付接受度',
    category: 'order',
    ontologyObject: 'Customer',
    constraintType: 'Hard',
    expression: 'AcceptCrossBase=True 才允许',
    parameters: [
      { name: 'allowed', value: true, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有客户'],
    riskWeight: 1.0,
    description: '只有接受跨基地交付的客户才允许多基地生产'
  },
  // 基地与物流维度约束
  {
    id: 'base_leadtime',
    name: '与客户交货地时间',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Hard',
    expression: 'LeadTime = 生产时长 + 物流时间',
    parameters: [
      { name: 'geoFactor', value: 1.2, unit: '' },
      { name: 'baseBuffer', value: 1, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有基地'],
    riskWeight: 1.0,
    description: '计算基地到客户交货地的总交付时间'
  },
  {
    id: 'logistics_cost',
    name: '交付物流成本',
    category: 'logistics',
    ontologyObject: 'Logistics',
    constraintType: 'Soft',
    expression: 'Cost = 单位运费 × 距离 × 数量',
    parameters: [
      { name: 'unitCost', value: 0.5, unit: '元/吨·公里' },
      { name: 'maxCostRatio', value: 0.05, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有基地'],
    riskWeight: 0.5,
    description: '计算订单交付的物流成本'
  },
  {
    id: 'base_transfer',
    name: '跨基地调拨周期',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Hard',
    expression: 'TransferTime ≥ 标准周期',
    parameters: [
      { name: 'minTransferDays', value: 2, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['多基地场景'],
    riskWeight: 1.0,
    description: '跨基地物料调拨的最小时间周期'
  },
  {
    id: 'base_bottleneck',
    name: '基地瓶颈概率',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Soft',
    expression: 'BottleneckProb = 历史瓶颈次数/周期',
    parameters: [
      { name: 'threshold', value: 0.3, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有基地'],
    riskWeight: 0.7,
    description: '基于历史数据评估基地出现瓶颈的概率'
  },
  {
    id: 'base_efficiency',
    name: '基地人效差异',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Soft',
    expression: 'EffectiveCap = 理论产能 × 人效系数',
    parameters: [
      { name: 'efficiencyFactor', value: 0.9, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有基地'],
    riskWeight: 0.6,
    description: '考虑人效差异后的有效产能计算'
  },
  {
    id: 'base_policy',
    name: '基地政策限制',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Hard',
    expression: '若政策限制=True → 禁止排产',
    parameters: [
      { name: 'policyRestricted', value: false, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['受限基地'],
    riskWeight: 1.0,
    description: '基地政策限制导致的排产禁止'
  },
  {
    id: 'base_stability',
    name: '基地历史交付稳定性',
    category: 'logistics',
    ontologyObject: 'Base',
    constraintType: 'Soft',
    expression: 'StabilityIndex = 准交率移动平均',
    parameters: [
      { name: 'threshold', value: 0.85, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有基地'],
    riskWeight: 0.7,
    description: '基于历史准交率评估基地交付稳定性'
  },
  // 产线与产能维度约束
  {
    id: 'line_capacity',
    name: '有效可用产能',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Hard',
    expression: 'Cap_eff = 理论产能×OEE×良率',
    parameters: [
      { name: 'OEE', value: 0.85, unit: '' },
      { name: 'yield', value: 0.98, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有产线'],
    riskWeight: 1.0,
    description: '考虑OEE和良率后的有效产能'
  },
  {
    id: 'line_load',
    name: '瓶颈负载率',
    category: 'capacity',
    ontologyObject: 'Process',
    constraintType: 'Hard',
    expression: 'LoadRate = 需求量/瓶颈产能 ≤ 1',
    parameters: [
      { name: 'maxLoadRate', value: 0.95, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['瓶颈工序'],
    riskWeight: 1.0,
    description: '瓶颈工序的负载率上限约束'
  },
  {
    id: 'line_substitute',
    name: '产线替代能力',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Hard',
    expression: '若替代能力=True → 可分配',
    parameters: [
      { name: 'substituteMatrix', value: '标准矩阵', unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['替代产线组'],
    riskWeight: 1.0,
    description: '产线之间替代生产的可行性约束'
  },
  {
    id: 'line_switch_cost',
    name: '产线切换成本',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Soft',
    expression: 'SwitchCost = 切换次数×单次成本',
    parameters: [
      { name: 'switchCost', value: 2000, unit: '元/次' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有产线'],
    riskWeight: 0.5,
    description: '产线型号切换产生的成本'
  },
  {
    id: 'line_moq',
    name: '最小批量约束',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Hard',
    expression: 'Q ≥ MOQ',
    parameters: [
      { name: 'MOQ', value: 500, unit: '件' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有产线'],
    riskWeight: 1.0,
    description: '产线生产的最小批量要求'
  },
  {
    id: 'line_setup',
    name: '型号切换时间',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Hard',
    expression: 'SetupTime × 切换次数',
    parameters: [
      { name: 'setupTime', value: 4, unit: '小时' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有产线'],
    riskWeight: 1.0,
    description: '产线切换型号所需的时间损耗'
  },
  {
    id: 'line_shift',
    name: '夜班/周末限制',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Hard',
    expression: '不允许在限制时间生产',
    parameters: [
      { name: 'allowNight', value: false, unit: '' },
      { name: 'allowWeekend', value: false, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['受限产线'],
    riskWeight: 1.0,
    description: '产线是否允许在夜班或周末生产'
  },
  {
    id: 'line_adjust_cost',
    name: '排产调整代价',
    category: 'capacity',
    ontologyObject: 'Line',
    constraintType: 'Soft',
    expression: '调整次数×隐性成本',
    parameters: [
      { name: 'adjustCost', value: 1000, unit: '元/次' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有产线'],
    riskWeight: 0.6,
    description: '排产计划调整产生的隐性成本'
  },
  // 物料与库存维度约束
  {
    id: 'material_kit',
    name: '关键物料齐套率',
    category: 'inventory',
    ontologyObject: 'Material',
    constraintType: 'Hard',
    expression: 'KitRate ≥ 阈值',
    parameters: [
      { name: 'minKitRate', value: 0.95, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['关键物料'],
    riskWeight: 1.0,
    description: '物料齐套率必须达到最低要求'
  },
  {
    id: 'material_risk',
    name: '物料交期风险',
    category: 'inventory',
    ontologyObject: 'Material',
    constraintType: 'Soft',
    expression: 'Risk = 延期概率×影响度',
    parameters: [
      { name: 'riskWeight', value: 0.7, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['长交期物料'],
    riskWeight: 0.8,
    description: '评估物料交期延期的风险'
  },
  {
    id: 'inventory_safety',
    name: '安全库存红线',
    category: 'inventory',
    ontologyObject: 'Inventory',
    constraintType: 'Hard',
    expression: 'Stock ≥ SafetyStock',
    parameters: [
      { name: 'safetyStock', value: 1000, unit: '件' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['关键物料'],
    riskWeight: 1.0,
    description: '库存必须保持在安全库存红线以上'
  },
  {
    id: 'inventory_transfer',
    name: '在途库存可调拨性',
    category: 'inventory',
    ontologyObject: 'Inventory',
    constraintType: 'Hard',
    expression: '若可调拨=True',
    parameters: [
      { name: 'transferable', value: true, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['在途库存'],
    riskWeight: 1.0,
    description: '在途库存是否可用于调拨'
  },
  {
    id: 'inventory_aging',
    name: '库存老化风险',
    category: 'inventory',
    ontologyObject: 'Inventory',
    constraintType: 'Soft',
    expression: 'AgingDays ≥ 阈值',
    parameters: [
      { name: 'maxAgingDays', value: 30, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有库存'],
    riskWeight: 0.6,
    description: '库存存放时间过长导致的老化风险'
  },
  {
    id: 'inventory_capital',
    name: '库存占用资金',
    category: 'inventory',
    ontologyObject: 'Inventory',
    constraintType: 'Soft',
    expression: 'CapitalCost = 库存额×资金成本率',
    parameters: [
      { name: 'capitalRate', value: 0.06, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有库存'],
    riskWeight: 0.5,
    description: '库存占用的资金成本'
  },
  {
    id: 'inventory_share',
    name: '跨基地库存共享规则',
    category: 'inventory',
    ontologyObject: 'Inventory',
    constraintType: 'Hard',
    expression: '是否允许跨基地使用',
    parameters: [
      { name: 'allowShare', value: true, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['共享库存'],
    riskWeight: 1.0,
    description: '库存是否允许跨基地共享使用'
  },
  // 供应商与质量维度约束
  {
    id: 'supplier_leadtime',
    name: '供应商供货期',
    category: 'supplier',
    ontologyObject: 'Supplier',
    constraintType: 'Hard',
    expression: 'ArrivalDate ≥ 下单日期 + LT',
    parameters: [
      { name: 'leadTime', value: 7, unit: '天' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有供应商'],
    riskWeight: 1.0,
    description: '供应商物料供货的交期约束'
  },
  {
    id: 'supplier_stability',
    name: '供货稳定性',
    category: 'supplier',
    ontologyObject: 'Supplier',
    constraintType: 'Soft',
    expression: 'Variance ≤ 阈值',
    parameters: [
      { name: 'maxVariance', value: 0.1, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['关键供应商'],
    riskWeight: 0.7,
    description: '供应商供货时间的稳定性要求'
  },
  {
    id: 'supplier_urgent',
    name: '临时加急能力',
    category: 'supplier',
    ontologyObject: 'Supplier',
    constraintType: 'Soft',
    expression: 'ExtraCap ≤ 最大加急能力',
    parameters: [
      { name: 'maxExtraCap', value: 0.2, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有供应商'],
    riskWeight: 0.6,
    description: '供应商应对临时加急订单的能力上限'
  },
  {
    id: 'quality_yield',
    name: '当前良率',
    category: 'supplier',
    ontologyObject: 'Process',
    constraintType: 'Hard',
    expression: '实际产出 = 投料×良率',
    parameters: [
      { name: 'yield', value: 0.98, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有工序'],
    riskWeight: 1.0,
    description: '基于当前良率计算实际产出'
  },
  {
    id: 'quality_trend',
    name: '良率波动趋势',
    category: 'supplier',
    ontologyObject: 'Process',
    constraintType: 'Soft',
    expression: 'TrendSlope > 0 则风险上升',
    parameters: [
      { name: 'trendThreshold', value: 0.05, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['关键工序'],
    riskWeight: 0.8,
    description: '良率下降趋势的风险预警'
  },
  {
    id: 'quality_exception',
    name: '质量异常频率',
    category: 'supplier',
    ontologyObject: 'Process',
    constraintType: 'Soft',
    expression: '异常次数/周期',
    parameters: [
      { name: 'maxExceptions', value: 2, unit: '次/周' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有工序'],
    riskWeight: 0.8,
    description: '质量异常发生频率的监控'
  },
  // 经营目标与策略权重
  {
    id: 'objective_weight',
    name: '总体经营目标权重',
    category: 'strategy',
    ontologyObject: 'Objective',
    constraintType: 'Soft',
    expression: 'Z = 交付率×W1 + 毛利×W2 + 现金流×W3',
    parameters: [
      { name: 'W1', value: 0.4, unit: '' },
      { name: 'W2', value: 0.35, unit: '' },
      { name: 'W3', value: 0.25, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['全局'],
    riskWeight: 0.9,
    description: '多目标优化函数中各目标的权重配置'
  },
  {
    id: 'delay_function',
    name: '延期罚则成本函数',
    category: 'strategy',
    ontologyObject: 'Objective',
    constraintType: 'Soft',
    expression: 'f(d)=a×d²+b×d',
    parameters: [
      { name: 'a', value: 100, unit: '' },
      { name: 'b', value: 1000, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['所有订单'],
    riskWeight: 0.8,
    description: '延期交付的非线性罚则函数'
  },
  {
    id: 'opportunity_cost',
    name: '资源占用机会成本',
    category: 'strategy',
    ontologyObject: 'Objective',
    constraintType: 'Soft',
    expression: '占用时长×单位机会成本',
    parameters: [
      { name: 'opportunityCost', value: 500, unit: '元/小时' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['瓶颈资源'],
    riskWeight: 0.6,
    description: '资源被占用导致的机会成本'
  },
  {
    id: 'risk_strategy',
    name: '保守/激进策略',
    category: 'strategy',
    ontologyObject: 'Strategy',
    constraintType: 'Soft',
    expression: 'RiskWeight ∈ [0,1]',
    parameters: [
      { name: 'riskWeight', value: 0.5, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['全局'],
    riskWeight: 0.7,
    description: '排产策略的风险偏好系数（0保守-1激进）'
  },
  {
    id: 'approval_rule',
    name: '自动/人工确认',
    category: 'strategy',
    ontologyObject: 'Workflow',
    constraintType: 'Hard',
    expression: 'RiskScore>阈值→人工',
    parameters: [
      { name: 'approvalThreshold', value: 0.8, unit: '' }
    ],
    enabled: true,
    version: '1.0.0',
    applicableScope: ['高风险场景'],
    riskWeight: 1.0,
    description: '根据风险评分决定是否需要人工审批'
  }
];

// 求解器配置定义
interface SolverConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  owner: string;
  validPeriod: string;
  // 目标函数
  objectives: {
    id: string;
    name: string;
    weight: number;
    enabled: boolean;
  }[];
  paretoMode: boolean;
  // 约束规则
  hardConstraints: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
  softConstraints: {
    id: string;
    name: string;
    penalty: number;
    tolerance: number;
    enabled: boolean;
  }[];
  // 决策变量
  timeGranularity: 'hour' | 'day' | 'week';
  allowSplitOrder: boolean;
  allowCrossLine: boolean;
  // 求解策略
  algorithm: string;
  maxTime: number;
  optimalityGap: number;
  maxIterations: number;
  parallelThreads: number;
  warmStart: boolean;
  // 场景模式
  scenarioMode: 'single' | 'batch' | 'sensitivity' | 'rolling';
  // 数据接口
  dataSources: {
    type: string;
    source: string;
    refreshRate: string;
    enabled: boolean;
  }[];
  // 输出控制
  outputLevel: 'order' | 'product' | 'line';
  solutionCount: number;
  outputPareto: boolean;
  generateReport: boolean;
  // 风险控制
  timeoutFallback: boolean;
  autoRelaxConstraint: boolean;
  alertOnException: boolean;
  requireApproval: boolean;
}

// 求解器类型列表
export const SOLVER_TYPES: SolverType[] = [
  {
    id: 'lp',
    name: 'LP',
    fullName: '线性规划（Linear Programming）',
    description: '用于成本最小化、资源分配等连续优化问题',
    applicableScenarios: ['成本最小化', '资源分配', '物料平衡'],
    exampleSolvers: ['CPLEX', 'Gurobi', 'GLPK', 'SCIP'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <Calculator size={24} />
  },
  {
    id: 'milp',
    name: 'MILP',
    fullName: '混合整数线性规划（Mixed Integer Linear Programming）',
    description: '用于主生产计划、批量排产等含离散决策的优化问题',
    applicableScenarios: ['主生产计划', '批量排产', '设施选址'],
    exampleSolvers: ['CPLEX', 'Gurobi', 'SCIP', 'CBC', 'OR-Tools'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: <Layers size={24} />
  },
  {
    id: 'nlp',
    name: 'NLP',
    fullName: '非线性规划（Nonlinear Programming）',
    description: '用于工艺流程优化、产品生命周期管理等含非线性约束的问题',
    applicableScenarios: ['工艺流程优化', '产品生命周期管理', '能耗优化'],
    exampleSolvers: ['IPOPT', 'KNITRO', 'GAMS', 'BARON'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: <Zap size={24} />
  },
  {
    id: 'cp',
    name: 'CP',
    fullName: '约束规划（Constraint Programming）',
    description: '用于生产调度、设备约束管理等复杂约束满足问题',
    applicableScenarios: ['生产调度', '设备约束管理', '人员排班'],
    exampleSolvers: ['Choco Solver', 'IBM CP Optimizer', 'OR-Tools CP-SAT', 'Gecode'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: <Shield size={24} />
  },
  {
    id: 'minlp',
    name: 'MINLP',
    fullName: '混合整数非线性规划（Mixed Integer Nonlinear Programming）',
    description: '用于复杂工艺路径优化、生产能力调度等高度复杂问题',
    applicableScenarios: ['复杂工艺路径优化', '生产能力调度', '多品种混线'],
    exampleSolvers: ['Bonmin', 'GAMS', 'BARON', 'DICOPT'],
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: <Box size={24} />
  },
  {
    id: 'heuristic',
    name: '启发式算法',
    fullName: '启发式/元启发式算法（Heuristic/Meta-heuristic）',
    description: '用于大规模排产、插单优化等NP-hard问题的近似求解',
    applicableScenarios: ['大规模排产', '插单优化', '动态调度'],
    exampleSolvers: ['遗传算法(GA)', '模拟退火(SA)', '禁忌搜索(TS)', '粒子群优化(PSO)', '蚁群算法(ACO)'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: <Cpu size={24} />
  },
  {
    id: 'simulation',
    name: '仿真求解器',
    fullName: '离散事件仿真（Discrete Event Simulation）',
    description: '用于What-if推演、多场景模拟等需要动态建模的问题',
    applicableScenarios: ['What-if推演', '多场景模拟', '瓶颈分析', '产能验证'],
    exampleSolvers: ['AnyLogic', 'FlexSim', 'Arena', 'Simio', 'Plant Simulation'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: <Clock size={24} />
  },
  {
    id: 'multiobj',
    name: '多目标优化',
    fullName: '多目标优化求解器（Multi-Objective Optimization）',
    description: '用于产销平衡、客户优先级优化等多目标权衡问题',
    applicableScenarios: ['产销平衡', '客户优先级优化', '成本-交期权衡'],
    exampleSolvers: ['NSGA-II', 'MOEA/D', 'GAMS', 'PlatEMO', 'jMetal'],
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    icon: <BarChart3 size={24} />
  },
  {
    id: 'rolling',
    name: '滚动窗口',
    fullName: '滚动窗口/在线优化求解器（Rolling Horizon/Online）',
    description: '用于动态调度、生产调整等需要频繁重优化的场景',
    applicableScenarios: ['动态调度', '生产调整', '实时排产', '插单响应'],
    exampleSolvers: ['OR-Tools', 'Simulated Annealing', '滚动MILP', '模型预测控制(MPC)'],
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: <RotateCcw size={24} />
  },
  {
    id: 'dl',
    name: '深度学习',
    fullName: '深度学习求解器（Deep Learning-based）',
    description: '用于需求预测、库存管理等数据驱动的预测和决策问题',
    applicableScenarios: ['需求预测', '库存管理', '异常检测', '参数调优'],
    exampleSolvers: ['LSTM', 'Transformer', 'DQN', 'PPO', 'GNN'],
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    icon: <Database size={24} />
  }
];

// 默认配置模板
const DEFAULT_CONFIG: SolverConfig = {
  id: '',
  name: '',
  type: 'milp',
  version: '1.0.0',
  owner: '',
  validPeriod: '2024-01-01至2024-12-31',
  objectives: [
    { id: 'profit', name: '利润最大化', weight: 0.5, enabled: true },
    { id: 'delivery', name: '交期达成率最大化', weight: 0.3, enabled: true },
    { id: 'inventory', name: '库存成本最小化', weight: 0.2, enabled: true },
    { id: 'utilization', name: '产能利用率最大化', weight: 0, enabled: false },
    { id: 'changeover', name: '切换次数最小化', weight: 0, enabled: false }
  ],
  paretoMode: false,
  hardConstraints: [
    { id: 'capacity', name: '产能上限', enabled: true },
    { id: 'bom', name: 'BOM匹配', enabled: true },
    { id: 'process', name: '工艺顺序', enabled: true },
    { id: 'material', name: '物料可用性', enabled: true },
    { id: 'compliance', name: '合规规则', enabled: true }
  ],
  softConstraints: [
    { id: 'priority', name: '客户优先级', penalty: 100, tolerance: 0.1, enabled: true },
    { id: 'safety', name: '安全库存', penalty: 50, tolerance: 0.05, enabled: true },
    { id: 'changeover_freq', name: '设备切换频率', penalty: 30, tolerance: 0.2, enabled: true },
    { id: 'delay', name: '延迟交付', penalty: 200, tolerance: 0, enabled: true }
  ],
  timeGranularity: 'day',
  allowSplitOrder: true,
  allowCrossLine: false,
  algorithm: 'auto',
  maxTime: 300,
  optimalityGap: 0.01,
  maxIterations: 10000,
  parallelThreads: 8,
  warmStart: true,
  scenarioMode: 'single',
  dataSources: [
    { type: 'orders', source: 'ERP', refreshRate: '实时', enabled: true },
    { type: 'inventory', source: 'ERP', refreshRate: '每小时', enabled: true },
    { type: 'capacity', source: 'MES', refreshRate: '每15分钟', enabled: true },
    { type: 'bom', source: 'PLM', refreshRate: '每日', enabled: true },
    { type: 'yield', source: 'MES', refreshRate: '每小时', enabled: true }
  ],
  outputLevel: 'order',
  solutionCount: 1,
  outputPareto: false,
  generateReport: true,
  timeoutFallback: true,
  autoRelaxConstraint: true,
  alertOnException: true,
  requireApproval: false
};

// 求解器类型卡片组件（第一级页面）
const SolverTypeCard: React.FC<{
  solver: SolverType;
  onClick: () => void;
}> = ({ solver, onClick }) => (
  <div
    onClick={onClick}
    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 group`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${solver.bgColor} ${solver.color} group-hover:scale-110 transition-transform`}>
        {solver.icon}
      </div>
      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${solver.bgColor} ${solver.color}`}>
        {solver.name}
      </div>
    </div>
    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{solver.fullName}</h3>
    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{solver.description}</p>
    <div className="space-y-2">
      <div className="text-xs">
        <span className="text-gray-400">适用场景：</span>
        <span className="text-gray-600">{solver.applicableScenarios.join('、')}</span>
      </div>
      <div className="text-xs">
        <span className="text-gray-400">求解器：</span>
        <span className="text-gray-600">{solver.exampleSolvers.slice(0, 3).join('、')}</span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <button className={`w-full py-2 rounded-lg text-sm font-medium ${solver.bgColor} ${solver.color} hover:opacity-80 transition-opacity`}>
        进入配置 →
      </button>
    </div>
  </div>
);

// 配置详情页面组件（第二级页面）
const SolverConfigPage: React.FC<{
  solverType: string;
  onBack: () => void;
}> = ({ solverType, onBack }) => {
  const solver = SOLVER_TYPES.find(s => s.id === solverType) || SOLVER_TYPES[1];
  const [activeTab, setActiveTab] = useState('basic');
  const [config, setConfig] = useState<SolverConfig>({
    ...DEFAULT_CONFIG,
    id: `solver_${solverType}_001`,
    name: `${solver.name} Solver V1`,
    type: solverType,
    owner: '张工程师'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateConfig = (updates: Partial<SolverConfig>) => {
    setConfig({ ...config, ...updates });
    setIsSaved(false);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      alert('求解完成！目标值: 98.5%, 计算时间: 12.3s');
    }, 3000);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const tabs = [
    { id: 'basic', name: '基础信息', icon: Database },
    { id: 'objective', name: '目标函数', icon: BarChart3 },
    { id: 'constraint', name: '约束规则', icon: Shield },
    { id: 'variable', name: '决策变量', icon: Settings },
    { id: 'algorithm', name: '算法策略', icon: Cpu },
    { id: 'scenario', name: '场景模式', icon: Clock },
    { id: 'data', name: '数据接口', icon: Database },
    { id: 'output', name: '输出配置', icon: FileText },
    { id: 'risk', name: '风险控制', icon: AlertCircle },
    { id: 'monitor', name: '监控日志', icon: History }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            返回求解器列表
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${solver.bgColor} ${solver.color}`}>
              {solver.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{solver.fullName}</h2>
              <p className="text-sm text-gray-500">求解器配置与运行</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
              isSaved ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Save size={16} />
            {isSaved ? '已保存' : '保存配置'}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Play size={16} />
            {isRunning ? '运行中...' : '运行求解'}
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* 左侧标签导航 */}
        <div className="w-56 bg-white rounded-xl border border-gray-200 p-3 overflow-auto">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧配置内容 */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Database size={20} className="text-blue-500" />
                基础信息配置
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solver名称</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="如：产销平衡MILP V3"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solver类型</label>
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    {solver.fullName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本号</label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => updateConfig({ version: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                  <input
                    type="text"
                    value={config.owner}
                    onChange={(e) => updateConfig({ owner: e.target.value })}
                    placeholder="模型Owner"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">生效周期</label>
                  <input
                    type="text"
                    value={config.validPeriod}
                    onChange={(e) => updateConfig({ validPeriod: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">求解器描述</label>
                  <textarea
                    rows={3}
                    placeholder="请输入求解器的详细描述..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'objective' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={20} className="text-green-500" />
                  目标函数配置
                </h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.paretoMode}
                    onChange={(e) => updateConfig({ paretoMode: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">启用Pareto多目标模式</span>
                </label>
              </div>
              <div className="space-y-3">
                {config.objectives.map((obj, idx) => (
                  <div key={obj.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={obj.enabled}
                      onChange={(e) => {
                        const newObjs = [...config.objectives];
                        newObjs[idx].enabled = e.target.checked;
                        updateConfig({ objectives: newObjs });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700">{obj.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">权重</span>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={obj.weight}
                        onChange={(e) => {
                          const newObjs = [...config.objectives];
                          newObjs[idx].weight = parseFloat(e.target.value);
                          updateConfig({ objectives: newObjs });
                        }}
                        disabled={!obj.enabled}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">
                  加载预设模板
                </button>
                <button className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
                  保存为模板
                </button>
              </div>
            </div>
          )}

          {activeTab === 'constraint' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield size={20} className="text-red-500" />
                约束规则配置
              </h3>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  硬约束（不可违反）
                </h4>
                <div className="space-y-2">
                  {config.hardConstraints.map((cons, idx) => (
                    <div key={cons.id} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={cons.enabled}
                        onChange={(e) => {
                          const newCons = [...config.hardConstraints];
                          newCons[idx].enabled = e.target.checked;
                          updateConfig({ hardConstraints: newCons });
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-5 h-5"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-700">{cons.name}</span>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">必须</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  软约束（可违反，有惩罚）
                </h4>
                <div className="space-y-2">
                  {config.softConstraints.map((cons, idx) => (
                    <div key={cons.id} className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={cons.enabled}
                        onChange={(e) => {
                          const newCons = [...config.softConstraints];
                          newCons[idx].enabled = e.target.checked;
                          updateConfig({ softConstraints: newCons });
                        }}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-5 h-5"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-700">{cons.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">惩罚系数</span>
                        <input
                          type="number"
                          value={cons.penalty}
                          onChange={(e) => {
                            const newCons = [...config.softConstraints];
                            newCons[idx].penalty = parseInt(e.target.value);
                            updateConfig({ softConstraints: newCons });
                          }}
                          disabled={!cons.enabled}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variable' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings size={20} className="text-purple-500" />
                决策变量配置
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">排产时间粒度</label>
                  <div className="flex gap-3">
                    {(['hour', 'day', 'week'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => updateConfig({ timeGranularity: g })}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          config.timeGranularity === g
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g === 'hour' ? '小时' : g === 'day' ? '天' : '周'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.allowSplitOrder}
                      onChange={(e) => updateConfig({ allowSplitOrder: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">允许拆单</div>
                      <div className="text-xs text-gray-500 mt-0.5">一个订单可分配到多个产线生产</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.allowCrossLine}
                      onChange={(e) => updateConfig({ allowCrossLine: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">允许跨产线生产</div>
                      <div className="text-xs text-gray-500 mt-0.5">同一批次可在不同产线间流转</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Cpu size={20} className="text-indigo-500" />
                求解策略配置
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">算法选择</label>
                <select
                  value={config.algorithm}
                  onChange={(e) => updateConfig({ algorithm: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="auto">自动选择（推荐）</option>
                  <option value="bnb">Branch & Bound</option>
                  <option value="cutting">Cutting Plane</option>
                  <option value="genetic">遗传算法</option>
                  <option value="sa">模拟退火</option>
                  <option value="hybrid">混合模式</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最大计算时间（秒）</label>
                  <input
                    type="number"
                    value={config.maxTime}
                    onChange={(e) => updateConfig({ maxTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最优容忍度（%）</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.optimalityGap * 100}
                    onChange={(e) => updateConfig({ optimalityGap: parseFloat(e.target.value) / 100 })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">迭代上限</label>
                  <input
                    type="number"
                    value={config.maxIterations}
                    onChange={(e) => updateConfig({ maxIterations: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">并行线程数</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={config.parallelThreads}
                    onChange={(e) => updateConfig({ parallelThreads: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={config.warmStart}
                  onChange={(e) => updateConfig({ warmStart: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                />
                <div>
                  <div className="font-medium text-gray-900">启用Warm Start</div>
                  <div className="text-xs text-gray-500 mt-0.5">使用前次求解结果作为初始解加速收敛</div>
                </div>
              </label>
            </div>
          )}

          {activeTab === 'scenario' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                场景模式配置
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'single', name: '单场景求解', desc: '针对单一数据集进行优化求解' },
                  { id: 'batch', name: '多场景批量运行', desc: '同时运行多个场景配置进行对比' },
                  { id: 'sensitivity', name: '敏感性分析', desc: '分析关键参数变化对结果的影响' },
                  { id: 'rolling', name: '滚动窗口计算', desc: '按时间窗口滚动更新求解' }
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      config.scenarioMode === mode.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scenarioMode"
                      value={mode.id}
                      checked={config.scenarioMode === mode.id}
                      onChange={(e) => updateConfig({ scenarioMode: e.target.value as any })}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{mode.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{mode.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Database size={20} className="text-cyan-500" />
                数据接口配置
              </h3>
              <div className="space-y-3">
                {config.dataSources.map((source, idx) => (
                  <div key={source.type} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={(e) => {
                        const newSources = [...config.dataSources];
                        newSources[idx].enabled = e.target.checked;
                        updateConfig({ dataSources: newSources });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {source.type === 'orders' ? '订单数据' :
                         source.type === 'inventory' ? '库存数据' :
                         source.type === 'capacity' ? '产线能力' :
                         source.type === 'bom' ? 'BOM结构' : '良率参数'}
                      </div>
                      <div className="text-xs text-gray-500">来源：{source.source} | 刷新：{source.refreshRate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-pink-500" />
                输出控制配置
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">输出粒度</label>
                <div className="flex gap-3">
                  {[
                    { id: 'order', name: '订单级' },
                    { id: 'product', name: '产品级' },
                    { id: 'line', name: '产线级' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => updateConfig({ outputLevel: level.id as any })}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        config.outputLevel === level.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">可行解数量</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.solutionCount}
                  onChange={(e) => updateConfig({ solutionCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.outputPareto}
                    onChange={(e) => updateConfig({ outputPareto: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">输出Pareto解集</span>
                </label>

                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.generateReport}
                    onChange={(e) => updateConfig({ generateReport: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">生成解释性报告</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                风险控制配置
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.timeoutFallback}
                    onChange={(e) => updateConfig({ timeoutFallback: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">超时自动降级</div>
                    <div className="text-xs text-gray-500 mt-0.5">超过最大计算时间时自动返回当前最优解</div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.autoRelaxConstraint}
                    onChange={(e) => updateConfig({ autoRelaxConstraint: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">无可行解自动放宽约束</div>
                    <div className="text-xs text-gray-500 mt-0.5">当问题无可行解时自动放宽软约束</div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.alertOnException}
                    onChange={(e) => updateConfig({ alertOnException: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">异常报警</div>
                    <div className="text-xs text-gray-500 mt-0.5">求解异常时发送通知</div>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.requireApproval}
                    onChange={(e) => updateConfig({ requireApproval: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <div>
                    <div className="font-medium text-gray-900">人工审批开关</div>
                    <div className="text-xs text-gray-500 mt-0.5">关键决策需人工确认</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History size={20} className="text-gray-500" />
                日志与审计
              </h3>
              <div className="p-5 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">计算开始时间</span>
                    <span className="font-mono text-gray-700">--</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">计算耗时</span>
                    <span className="font-mono text-gray-700">--</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-500">最终目标值</span>
                    <span className="font-mono text-gray-700">--</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">违反约束情况</span>
                    <span className="font-mono text-gray-700">--</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
                  查看完整日志
                </button>
                <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  导出审计报告
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 求解器类型列表页面（标签页内使用）
const SolverTypeListPage: React.FC<{
  onSelectSolver: (solverId: string) => void;
}> = ({ onSelectSolver }) => {
  return (
    <div className="h-full flex flex-col">

      {/* 求解器类型网格 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-blue-500" />
          选择求解器类型
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SOLVER_TYPES.map((solver) => (
            <SolverTypeCard
              key={solver.id}
              solver={solver}
              onClick={() => onSelectSolver(solver.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 约束规则库页面组件
const ConstraintRulesLibrary: React.FC = () => {
  const [rules, setRules] = useState<ConstraintRule[]>(DEFAULT_CONSTRAINT_RULES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRule, setEditingRule] = useState<ConstraintRule | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'config'>('list');

  const filteredRules = rules.filter(rule => {
    const matchesCategory = selectedCategory ? rule.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? rule.name.includes(searchQuery) || rule.description.includes(searchQuery)
      : true;
    return matchesCategory && matchesSearch;
  });

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRule = (updatedRule: ConstraintRule) => {
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
    setEditingRule(null);
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      order: 'blue',
      logistics: 'cyan',
      capacity: 'indigo',
      inventory: 'green',
      supplier: 'amber',
      strategy: 'purple'
    };
    return colors[categoryId] || 'gray';
  };

  const getCategoryName = (categoryId: string) => {
    const cat = CONSTRAINT_CATEGORIES.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">管理产销协同场景下的业务约束规则配置</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2">
            <Plus size={18} />
            新建规则
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download size={18} />
            导出配置
          </button>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'list' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          规则列表
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'config' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          批量配置
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* 分类卡片 - 紧凑布局 */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            <div
              onClick={() => setSelectedCategory(null)}
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                selectedCategory === null
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">全部</span>
                <span className="text-base font-bold text-indigo-600">{rules.length}</span>
              </div>
            </div>
            {CONSTRAINT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = rules.filter(r => r.category === cat.id).length;
              const enabledCount = rules.filter(r => r.category === cat.id && r.enabled).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedCategory === cat.id
                      ? `border-${cat.color}-500 bg-${cat.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Icon size={12} className={`text-${cat.color}-500`} />
                      <span className="text-xs text-gray-600 truncate">{cat.name}</span>
                    </div>
                    <span className={`text-xs font-bold text-${cat.color}-600`}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 搜索和过滤 - 紧凑 */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索规则名称..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1 text-sm">
              <Filter size={16} />
              筛选
            </button>
          </div>

          {/* 规则列表 */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">启用</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">规则名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">类别</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">本体对象</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">等级</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">表达式</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">风险权重</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={rule.enabled ? 'text-green-500' : 'text-gray-300'}
                      >
                        {rule.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">{rule.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full bg-${getCategoryColor(rule.category)}-100 text-${getCategoryColor(rule.category)}-600`}>
                        {getCategoryName(rule.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rule.ontologyObject}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.constraintType === 'Hard'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {rule.constraintType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs truncate">
                      {rule.expression}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${rule.riskWeight * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{rule.riskWeight}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">批量配置</h3>
          <p className="text-gray-500">批量配置功能开发中...</p>
        </div>
      )}

      {/* 规则编辑弹窗 */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[800px] max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑约束规则</h3>
              <button
                onClick={() => setEditingRule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">版本号</label>
                  <input
                    type="text"
                    value={editingRule.version}
                    onChange={(e) => setEditingRule({ ...editingRule, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计算表达式</label>
                <input
                  type="text"
                  value={editingRule.expression}
                  onChange={(e) => setEditingRule({ ...editingRule, expression: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">约束类型</label>
                  <select
                    value={editingRule.constraintType}
                    onChange={(e) => setEditingRule({ ...editingRule, constraintType: e.target.value as 'Hard' | 'Soft' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Hard">Hard (硬约束)</option>
                    <option value="Soft">Soft (软约束)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">风险权重</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editingRule.riskWeight}
                    onChange={(e) => setEditingRule({ ...editingRule, riskWeight: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">参数配置</label>
                <div className="space-y-2">
                  {editingRule.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <GripVertical size={16} className="text-gray-400" />
                      <span className="flex-1 text-sm font-medium">{param.name}</span>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => {
                          const newParams = [...editingRule.parameters];
                          newParams[idx] = { ...param, value: e.target.value };
                          setEditingRule({ ...editingRule, parameters: newParams });
                        }}
                        className="w-32 px-3 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-xs text-gray-500 w-16">{param.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="ruleEnabled"
                  checked={editingRule.enabled}
                  onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ruleEnabled" className="text-sm text-gray-700">启用此规则</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => updateRule(editingRule)}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                保存修改
              </button>
              <button
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 推理模型工具库组件
const OntologyModelingLibrary: React.FC<{ onSelectTool?: (toolId: string) => void }> = ({ onSelectTool }) => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = ONTOLOGY_MODELING_TOOLS.filter(tool => {
    const matchesDomain = selectedDomain === null || tool.category === selectedDomain;
    const matchesSearch = searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.function.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const domainColors: Record<string, string> = {
    order: 'blue',
    customer: 'cyan',
    network: 'indigo',
    line: 'violet',
    inventory: 'green',
    supplier: 'amber',
    quality: 'rose',
    objective: 'purple',
    decision: 'orange',
    simulation: 'teal',
    risk: 'red',
    governance: 'slate'
  };

  return (
    <div className="h-full flex flex-col">
      {/* 域分类卡片 - 紧凑布局 */}
      <div className="grid grid-cols-6 gap-2 mb-3">
        <div
          onClick={() => setSelectedDomain(null)}
          className={`p-2 rounded-lg border cursor-pointer transition-all ${
            selectedDomain === null
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">全部</span>
            <span className="text-base font-bold text-emerald-600">{ONTOLOGY_MODELING_TOOLS.length}</span>
          </div>
        </div>
        {ONTOLOGY_DOMAINS.map(domain => {
          const Icon = domain.icon;
          const count = ONTOLOGY_MODELING_TOOLS.filter(t => t.category === domain.id).length;
          return (
            <div
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id === selectedDomain ? null : domain.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                selectedDomain === domain.id
                  ? `border-${domain.color}-500 bg-${domain.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className={`text-${domain.color}-500`} />
                  <span className="text-xs text-gray-600 truncate">{domain.name}</span>
                </div>
                <span className={`text-sm font-bold text-${domain.color}-600`}>{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 搜索 - 更紧凑 */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索工具名称或功能..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 工具网格 - 更紧凑 */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-2">
          {filteredTools.map(tool => {
            const domainColor = domainColors[tool.category] || 'gray';
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool?.(tool.id)}
                className={`p-2.5 rounded-lg border bg-white hover:shadow-sm transition-all cursor-pointer border-${domainColor}-200 hover:border-${domainColor}-400`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className={`p-1.5 rounded bg-${domainColor}-100 text-${domainColor}-600`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{tool.name}</h3>
                    <p className="text-[11px] text-gray-500 truncate">{tool.function}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 w-14 shrink-0">对象:</span>
                    <span className="font-medium text-gray-700 truncate">{tool.modelingObject}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-gray-400 w-14 shrink-0">字段:</span>
                    <div className="flex flex-wrap gap-1">
                      {tool.keyFields.slice(0, 2).map((field, idx) => (
                        <span key={idx} className={`px-1 py-0.5 rounded bg-${domainColor}-50 text-${domainColor}-700 text-[10px]`}>
                          {field}
                        </span>
                      ))}
                      {tool.keyFields.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{tool.keyFields.length - 2}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 w-14 shrink-0">输出:</span>
                    <span className={`font-medium text-${domainColor}-600 truncate text-[11px]`}>{tool.output}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 推理模型工具配置页面
interface OntologyToolConfigPageProps {
  toolId: string;
  onBack: () => void;
}

const OntologyToolConfigPage: React.FC<OntologyToolConfigPageProps> = ({ toolId, onBack }) => {
  const tool = ONTOLOGY_MODELING_TOOLS.find(t => t.id === toolId);
  const [activeSection, setActiveSection] = useState<string>('basic');

  if (!tool) return null;

  const domainColors: Record<string, string> = {
    order: 'blue',
    customer: 'cyan',
    network: 'indigo',
    line: 'violet',
    inventory: 'green',
    supplier: 'amber',
    quality: 'rose',
    objective: 'purple',
    decision: 'orange',
    simulation: 'teal',
    risk: 'red',
    governance: 'slate'
  };
  const domainColor = domainColors[tool.category] || 'gray';

  // 根据工具类型获取专属字段
  const getExtraFields = () => {
    switch (tool.id) {
      case 'order_priority_scorer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">权重组合方式</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>加权求和</option>
                  <option>分段函数</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">允许负值</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">参与目标函数</span>
                </label>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 font-mono">
                PriorityScore = W1 × CustomerLevel + W2 × MarginContribution + W3 × StrategicFlag - W4 × RiskScore
              </p>
            </div>
          </div>
        );
      case 'current_yield_model':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分布类型</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Normal</option>
                  <option>Beta</option>
                  <option>固定值</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">均值 μ</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.95" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标准差 σ</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.02" />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">参与 Monte Carlo 模拟</span>
            </label>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <p className="text-xs text-rose-800 font-mono">Yield ~ N(μ, σ²)</p>
            </div>
          </div>
        );
      case 'line_capacity_modeler':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理论产能</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OEE计算方式</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>固定值</option>
                  <option>公式</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">良率来源</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>直接输入</option>
                  <option>调用质量模型</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">爬坡函数类型</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>线性</option>
                  <option>指数</option>
                  <option>自定义</option>
                </select>
              </div>
            </div>
            <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
              <p className="text-xs text-violet-800 font-mono">EffectiveCapacity = TheoreticalCapacity × OEE × Yield</p>
            </div>
          </div>
        );
      case 'supplier_leadtime_model':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">基准LT</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="7" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">波动幅度</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分布类型</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>LogNormal</option>
                  <option>Normal</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">允许加急</span>
              </label>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">最大加急比例</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.3" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className={`px-6 py-4 bg-${domainColor}-600 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold">{tool.name}</h2>
              <p className="text-sm text-white/80">{tool.function}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{tool.modelingObject}</span>
            <button className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100">
              保存配置
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id: 'basic', label: '① 基本信息', icon: FileText },
          { id: 'scope', label: '② 适用范围', icon: Target },
          { id: 'expression', label: '③ 模型表达', icon: Calculator },
          { id: 'parameters', label: '④ 参数配置', icon: Settings },
          { id: 'output', label: '⑤ 输出与版本', icon: CheckCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? `text-${domainColor}-600 border-b-2 border-${domainColor}-600 bg-${domainColor}-50`
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ① 基本信息区 */}
          {activeSection === 'basic' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
                  <input type="text" defaultValue={tool.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型类型</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>评分模型</option>
                    <option>函数模型</option>
                    <option>分布模型</option>
                    <option>矩阵模型</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属域</label>
                  <select defaultValue={tool.category} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="order">Order</option>
                    <option value="line">Line</option>
                    <option value="base">Base</option>
                    <option value="inventory">Inventory</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea defaultValue={tool.function} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                </div>
              </div>
            </div>
          )}

          {/* ② 适用范围区 */}
          {activeSection === 'scope' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">适用范围</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品型号</label>
                  <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" size={4}>
                    <option>全部型号</option>
                    <option>磷酸铁锂-280Ah</option>
                    <option>三元锂-150Ah</option>
                    <option>储能专用-304Ah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基地</label>
                  <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" size={4}>
                    <option>全部基地</option>
                    <option>常州基地</option>
                    <option>洛阳基地</option>
                    <option>厦门基地</option>
                    <option>成都基地</option>
                    <option>武汉基地</option>
                    <option>合肥基地</option>
                    <option>黑龙江基地</option>
                    <option>广州基地</option>
                    <option>江门基地</option>
                    <option>眉山基地</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客户</label>
                  <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" size={4}>
                    <option>全部客户</option>
                    <option>战略客户</option>
                    <option>普通客户</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">生效周期</label>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <span className="text-gray-500 self-center">至</span>
                    <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ③ 模型表达区 */}
          {activeSection === 'expression' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">模型表达</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表达式类型</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>公式</option>
                    <option>查表</option>
                    <option>曲线</option>
                    <option>概率分布</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">表达式编辑区</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-300">
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">+</button>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">-</button>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">×</button>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">÷</button>
                      <span className="text-gray-300">|</span>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">if</button>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">piecewise</button>
                      <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Normal(μ,σ)</button>
                    </div>
                    <textarea
                      className="w-full px-3 py-2 text-sm font-mono min-h-[120px] focus:outline-none"
                      placeholder={`示例: W1 * CustomerLevel + W2 * MarginContribution`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">依赖变量（自动识别）</label>
                  <div className="flex flex-wrap gap-2">
                    {tool.keyFields.map((field, idx) => (
                      <span key={idx} className={`px-2 py-1 bg-${domainColor}-100 text-${domainColor}-700 rounded text-xs`}>
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 专属配置字段 */}
                {getExtraFields()}
              </div>
            </div>
          )}

          {/* ④ 参数配置区 */}
          {activeSection === 'parameters' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">参数配置</h3>
              <div className="space-y-3">
                {[
                  { name: 'W1', desc: '客户级别权重', default: 0.4, min: 0, max: 1, adjustable: true },
                  { name: 'W2', desc: '毛利权重', default: 0.35, min: 0, max: 1, adjustable: true },
                  { name: 'W3', desc: '战略标签权重', default: 0.25, min: 0, max: 1, adjustable: false }
                ].map((param, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20">
                      <span className="text-sm font-medium text-gray-900">{param.name}</span>
                    </div>
                    <div className="flex-1 text-xs text-gray-500">{param.desc}</div>
                    <div className="w-24">
                      <input type="number" defaultValue={param.default} step="0.01" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </div>
                    <div className="w-32 flex items-center gap-2 text-xs text-gray-500">
                      <span>[{param.min},</span>
                      <span>{param.max}]</span>
                    </div>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" defaultChecked={param.adjustable} className="rounded border-gray-300" />
                      <span>可调</span>
                    </label>
                  </div>
                ))}
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600">
                  + 添加参数
                </button>
              </div>
            </div>
          )}

          {/* ⑤ 输出与版本管理区 */}
          {activeSection === 'output' && (
            <div className="space-y-6">
              {/* 输出配置 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">输出配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">输出变量名</label>
                    <input type="text" defaultValue={tool.output} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">输出类型</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>Float</option>
                      <option>Distribution</option>
                      <option>Matrix</option>
                      <option>Object</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 治理字段 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">权限与治理</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="text-sm font-medium text-amber-900">影响核心决策</p>
                      <p className="text-xs text-amber-700">高风险模型需要审批</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">修改后自动触发再求解</p>
                      <p className="text-xs text-gray-500">模型变更后自动重新计算依赖结果</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 版本管理 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">版本管理</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">版本号</label>
                    <input type="text" defaultValue="v1.2.0" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">创建人</label>
                    <input type="text" defaultValue="张工程师" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                    <input type="text" defaultValue="2024-01-15" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">审批状态</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>草稿</option>
                      <option>已生效</option>
                      <option>已归档</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    查看历史版本
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    回滚版本
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    影响范围评估
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 主组件
const MCPTools: React.FC = () => {
  const { solverType, ontologyToolId } = useParams<{ solverType?: string; ontologyToolId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'solver' | 'constraints' | 'ontology'>('solver');

  const handleSelectSolver = (solverId: string) => {
    navigate(`/mcp-tools/${solverId}`);
  };

  const handleSelectOntologyTool = (toolId: string) => {
    navigate(`/mcp-tools/ontology/${toolId}`);
  };

  const handleBack = () => {
    navigate('/mcp-tools');
  };

  // 如果选中了具体求解器，显示配置页面
  if (solverType && solverType !== 'ontology') {
    return <SolverConfigPage solverType={solverType} onBack={handleBack} />;
  }

  // 如果选中了推理模型工具，显示配置页面
  if (ontologyToolId) {
    return <OntologyToolConfigPage toolId={ontologyToolId} onBack={handleBack} />;
  }

  // 主页面：标签切换
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题 */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">MCP工具</h2>
        <p className="text-gray-500 mt-1">数学规划、约束管理与推理模型工具集，支持锂电制造产销协同优化</p>
      </div>

      {/* 标签栏 */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('solver')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'solver'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Cpu size={18} />
          求解器
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'solver' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
          }`}>
            {SOLVER_TYPES.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('constraints')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'constraints'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen size={18} />
          约束规则
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'constraints' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
          }`}>
            {DEFAULT_CONSTRAINT_RULES.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ontology')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'ontology'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid3X3 size={18} />
          推理模型
          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
            activeTab === 'ontology' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
          }`}>
            {ONTOLOGY_MODELING_TOOLS.length}
          </span>
        </button>
      </div>

      {/* 标签内容 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'solver' ? (
          <SolverTypeListPage onSelectSolver={handleSelectSolver} />
        ) : activeTab === 'constraints' ? (
          <ConstraintRulesLibrary />
        ) : (
          <OntologyModelingLibrary onSelectTool={handleSelectOntologyTool} />
        )}
      </div>
    </div>
  );
};

export default MCPTools;
