// Domain Entities

// ==================== 业务语义创建系统 ====================

/**
 * 业务语义节点类型
 */
export type BusinessSemanticNodeType = 'dataEntity' | 'behavior' | 'businessRule' | 'businessProcess';

/**
 * 业务语义节点
 */
export interface BusinessSemanticNode {
  id: string;
  name: string;
  description: string;
  type: BusinessSemanticNodeType;
  scenarioId: string;
  // 节点特定属性
  attributes?: Record<string, any>;
  // 节点关联
  connections: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 业务语义场景
 */
export interface BusinessSemanticScenario {
  id: string;
  name: string;
  description: string;
  industry: string;
  // 场景包含的节点
  nodes: BusinessSemanticNode[];
  // 场景状态
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * 数据实体
 */
export interface DataEntity extends BusinessSemanticNode {
  type: 'dataEntity';
  fields: DataField[];
  source?: string;
  updateFrequency?: string;
}

/**
 * 数据字段
 */
export interface DataField {
  name: string;
  dataType: string;
  required: boolean;
  description?: string;
}

/**
 * 行为操作
 */
export interface BehaviorAction extends BusinessSemanticNode {
  type: 'behavior';
  operationType: 'create' | 'read' | 'update' | 'delete' | 'execute';
  inputParams: DataField[];
  outputParams: DataField[];
}

/**
 * 业务规则
 */
export interface BusinessRule extends BusinessSemanticNode {
  type: 'businessRule';
  ruleType: 'validation' | 'constraint' | 'calculation' | 'decision';
  condition: string;
  action: string;
  priority: number;
}

/**
 * 业务流程
 */
export interface BusinessProcess extends BusinessSemanticNode {
  type: 'businessProcess';
  steps: ProcessStep[];
  trigger?: string;
  result?: string;
}

/**
 * 流程步骤
 */
export interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  responsibleRole?: string;
  nodeId?: string;
}

// ==================== 原子化业务语义系统 ====================

/**
 * 原子业务语义 - 不可再分的业务因子
 * 作为企业的统一语义标准
 */
export interface AtomicOntology {
  id: string;
  name: string;
  description: string;
  category: AtomicCategory;
  dataType: AtomicDataType;
  unit?: string;
  constraints?: AtomicConstraint;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type AtomicCategory =
  // 通用分类
  | 'physical'      // 物理量：温度、压力、振动等
  | 'chemical'      // 化学量：纯度、PH值、成分等
  | 'temporal'      // 时间量：周期、频率、持续时间等
  | 'financial'     // 财务量：成本、价格、利润率等
  | 'logistical'    // 物流量：库存、周转率、配送时间等
  | 'quality'       // 质量量：合格率、缺陷率、精度等
  | 'operational'   // 运营量：产能、OEE、利用率等
  // 锂电制造专用分类
  | 'electrical'    // 电性能：电压、电流、电阻、容量等
  | 'material'      // 材料特性：粒径、比表面积、振实密度等
  | 'process'       // 工艺参数：涂布速度、辊压压力等
  | 'environmental' // 环境参数：露点温度、洁净度等
  | 'safety'        // 安全参数：温升、气体浓度等
  | 'equipment'     // 设备参数：主轴转速、张力等
  | 'product';      // 产品规格：尺寸、重量、能量密度等

export type AtomicDataType = 'number' | 'string' | 'boolean' | 'array' | 'object' | 'datetime';

export interface AtomicConstraint {
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: string;
  required?: boolean;
}

/**
 * 分子业务语义 - 由原子业务语义组合而成的业务实体
 * L2: 子系统 (Subsystem)
 * L3: 工艺过程 (Process)
 * L4: 参数定义 (Parameter Definition)
 */
export interface MolecularOntology {
  id: string;
  name: string;
  description: string;
  level: 2 | 3 | 4;  // L2=子系统, L3=工艺, L4=参数
  parentId?: string; // 父节点ID
  atomRefs: AtomReference[]; // 引用的原子业务语义
  children: string[]; // 子节点ID列表
  createdAt: string;
  updatedAt: string;
}

export interface AtomReference {
  atomId: string;
  role: string;      // 原子在业务语义中的角色/用途
  required: boolean; // 是否必填
  defaultValue?: any;
  mappingRules?: MappingRule[];
}

export interface MappingRule {
  condition: string;
  action: string;
  description: string;
}

/**
 * 业务场景 - 完整的场景定义
 */
export interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  industry: string;
  domain: string;
  molecularStructure: MolecularOntology[]; // L2+L3+L4结构
  status: 'draft' | 'published' | 'archived';
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// ==================== 技能分类常量 ====================

export const SKILL_CATEGORIES: SkillCategoryConfig[] = [
  {
    id: 'library-api',
    name: '库与 API 参考',
    description: '解释如何正确使用某个库、CLI 工具或 SDK',
    icon: 'Library',
    examples: ['内部计费库', 'CLI 封装工具', '设计系统适配']
  },
  {
    id: 'validation',
    name: '产品验证',
    description: '测试或验证代码是否正常工作，通常搭配外部工具',
    icon: 'CheckCircle',
    examples: ['注册流程验证', '结账流程测试', 'CLI 交互测试']
  },
  {
    id: 'data-analysis',
    name: '数据获取与分析',
    description: '连接数据和监控系统，获取和分析数据',
    icon: 'BarChart3',
    examples: ['漏斗查询', '用户群对比', '仪表盘查询']
  },
  {
    id: 'workflow',
    name: '业务流程与自动化',
    description: '将重复性工作流自动化为一条命令',
    icon: 'Workflow',
    examples: ['站会内容生成', '工单创建', '周报生成']
  },
  {
    id: 'scaffolding',
    name: '代码脚手架与模板',
    description: '为特定功能生成框架代码',
    icon: 'FileCode',
    examples: ['新服务模板', '数据库迁移', '应用创建']
  },
  {
    id: 'code-quality',
    name: '代码质量与审查',
    description: '帮助执行代码质量标准并辅助代码审查',
    icon: 'Shield',
    examples: ['对抗性审查', '代码风格检查', '测试实践']
  },
  {
    id: 'cicd',
    name: 'CI/CD 与部署',
    description: '获取、推送和部署代码',
    icon: 'GitBranch',
    examples: ['PR 监控', '服务部署', '生产环境 cherry-pick']
  },
  {
    id: 'runbook',
    name: '运维手册',
    description: '接收故障现象并执行多工具联合排查',
    icon: 'BookOpen',
    examples: ['服务调试', '值班排查', '日志关联']
  },
  {
    id: 'infrastructure',
    name: '基础设施运维',
    description: '执行日常维护和操作流程',
    icon: 'Server',
    examples: ['孤儿资源清理', '依赖管理', '成本调查']
  },
  {
    id: 'carbon-energy',
    name: '碳排放与能源管理',
    description: '碳排放核算、碳足迹追踪、节能减排优化、清洁能源规划',
    icon: 'Leaf',
    examples: ['碳排放核算', '产品碳足迹', '节能优化', '碳配额管理', '清洁能源替代']
  }
];

// ==================== 技能注册中心集成 ====================

// ==================== Skill 分类定义 ====================

/**
 * Skill 十大分类（基于 Claude Code 官方指南 + 碳排放能源管理）
 */
export type SkillCategory =
  | 'library-api'        // 库与 API 参考
  | 'validation'         // 产品验证
  | 'data-analysis'      // 数据获取与分析
  | 'workflow'           // 业务流程与自动化
  | 'scaffolding'        // 代码脚手架与模板
  | 'code-quality'       // 代码质量与审查
  | 'cicd'              // CI/CD 与部署
  | 'runbook'           // 运维手册
  | 'infrastructure'    // 基础设施运维
  | 'carbon-energy';    // 碳排放与能源管理

/**
 * Skill 分类配置
 */
export interface SkillCategoryConfig {
  id: SkillCategory;
  name: string;
  description: string;
  icon: string;
  examples: string[];
}

/**
 * Gotcha（坑点）定义
 */
export interface SkillGotcha {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution?: string;
}

/**
 * 触发条件定义
 */
export interface SkillTriggerCondition {
  description: string;
  examples: string[];
  keywords: string[];
}

export interface Skill {
  skill_id: string;
  name: string;
  version: string;
  domain: string[]; // Maps to Scenario IDs
  capability_tags: string[];
  input_schema: Record<string, string>;
  output_schema: Record<string, string>;
  cost: number; // 0.0 - 1.0
  latency: number; // ms
  accuracy_score: number; // 0.0 - 1.0
  dependencies: string[];
  description: string;
  // 新增：分类（基于 Claude Code 指南的 9 大类别）
  category?: SkillCategory;
  // 新增：触发条件（描述何时应该调用此 Skill）
  triggerConditions?: SkillTriggerCondition;
  // 新增：常见坑点列表
  gotchas?: SkillGotcha[];
  // 新增：依赖的其他 Skill
  dependsOn?: string[];
  files: {
    readme: string;        // SKILL.md - 核心规则文档
    config: string;        // 配置参数
    script: string;        // scripts/ - 确定性执行脚本
    scriptLang: string;    // 脚本语言
    references?: string[]; // references/ - 知识库文档列表
    assets?: string[];     // assets/ - 静态模板文件列表
    // 新增：辅助脚本列表
    helpers?: string[];
  };
  // 新增：场景绑定
  scenarioBindings?: ScenarioBinding[];
  // 新增：资产来源信息
  source?: {
    type: AssetSourceType;
    creator: string;
    creatorRole?: string;
    createdAt: string;
    updatedAt: string;
    conversationId?: string;
    discussionTopic?: string;
  };
}

export interface ScenarioBinding {
  scenarioId: string;
  inputMappings: ParameterMapping[];
  outputMappings: ParameterMapping[];
}

export interface ParameterMapping {
  skillParam: string;
  scenarioParam: string; // 指向L4参数
  atomId?: string;       // 指向原子业务语义
  transform?: string;    // 可选的转换函数
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isDynamic?: boolean; // 是否为动态创建的场景
  sourceScenarioId?: string; // 如果是从动态场景生成的
}

// 节点关联关系（上级/下级节点及其状态）
export interface RelatedNode {
  id: string;
  label: string;
  dataSubmitted: boolean; // 是否按时提交数据
  instructionCompleted: boolean; // 是否完成指令
}

export interface OntologyNode {
  id: string;
  label: string;
  type: 'simulation' | 'data';
  group?: 'simulation' | 'data';
  data_readiness?: number; // 0-100 Data Quality/Availability Score
  // 节点详细信息
  owner?: string; // 负责人
  responsibility?: string; // 职责描述
  upstreamNodes?: RelatedNode[]; // 上一级节点（带状态）
  downstreamNodes?: RelatedNode[]; // 下一级节点（带状态）
  upstreamNodeIds?: string[]; // 上游节点ID列表（兼容旧数据）
  downstreamNodeIds?: string[]; // 下游节点ID列表（兼容旧数据）
  dataSource?: string; // 数据源：导入、CRM系统、BOM系统、MES系统等
  dataFormat?: string; // 数据格式：JSON、XML、CSV等
  updateFrequency?: string; // 更新频率要求
  pendingTasks?: PendingTask[]; // 待执行任务
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
}

export interface OntologyLink {
  source: string;
  target: string;
  relation: string;
}

export interface OntologyData {
  nodes: OntologyNode[];
  links: OntologyLink[];
}

export interface ParsedTask {
  original_text: string;
  intents: string[];
  entities: string[];
  extracted_params: Record<string, any>;
}

export interface SkillScore {
  skill_id: string;
  total_score: number;
  breakdown: {
    intent_match: number;
    historical_accuracy: number;
    latency_score: number;
    cost_score: number;
  };
}

export interface RouterPlan {
  taskId: string;
  steps: {
    step_id: number;
    skill: Skill;
    score: number;
    // Detailed Execution Trace Fields
    reasoning_trace: string[];
    input_data: Record<string, any>;
    simulated_output: Record<string, any>;
  }[];
  total_confidence: number;
  estimated_latency: number;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  task_text: string;
  status: 'success' | 'failed' | 'running';
  skills_used: string[];
  duration: number;
  result_summary: string;
}

// ==================== 业务流程图谱关联性分析业务语义和技能 ====================

/**
 * 业务语义定义（用于产销场景）
 */
export interface BusinessSemanticDef {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'production' | 'inventory' | 'quality' | 'finance' | 'logistics' | 'customer' | 'planning';
  atoms: string[]; // 关联的业务释义ID
  skills: string[]; // 关联的技能ID
  processNodes: string[]; // 关联的业务流程节点ID
}

/**
 * 业务流程节点映射
 */
export interface ProcessNodeMapping {
  nodeId: string;
  nodeName: string;
  semantics: string[]; // 关联的业务语义ID
  skills: string[]; // 关联的技能ID
  atoms: string[]; // 所需业务释义
}

/**
 * 依赖关系图节点
 */
export interface DependencyNode {
  id: string;
  type: 'simulation' | 'data';
  name: string;
}

/**
 * 依赖关系图连线
 */
export interface DependencyLink {
  source: string;
  target: string;
  type: string;
}

// ==================== 推演分析系统 ====================

/**
 * 推演分析节点配置
 */
export interface SimulationNodeConfig {
  nodeId: string;
  nodeName: string;
  scenarioId: string;
  category: 'capacity_planning' | 'demand_forecast' | 'supply_chain' | 'production_scheduling' | 'investment_decision' | 'risk_assessment' | 'quality_prediction' | 'financial_analysis';
  description: string;
  inputParams: SimulationInputParam[];
  outputMetrics: string[];
  supportedSkills: string[];
}

/**
 * 推演分析输入参数
 */
export interface SimulationInputParam {
  id: string;
  name: string;
  description: string;
  dataType: 'number' | 'string' | 'boolean' | 'date' | 'file';
  required: boolean;
  defaultValue?: any;
  unit?: string;
  source?: 'manual' | 'file_import' | 'system' | 'upstream_node';
}

/**
 * 推演分析方案
 */
export interface SimulationSolution {
  id: string;
  name: string;
  description: string;
  inputData: Record<string, any>;
  outputMetrics: Record<string, number>;
  confidence: number;
  cost?: number;
  timeline?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * 推演分析报告
 */
export interface SimulationReport {
  id: string;
  nodeId: string;
  nodeName: string;
  timestamp: string;
  inputData: Record<string, any>;
  uploadedFiles: string[];
  usedSkills: string[];
  conversation: SimulationConversationMessage[];
  solutions: SimulationSolution[];
  comparisonMatrix: SolutionComparison[];
  recommendation: string;
}

/**
 * 推演对话消息
 */
export interface SimulationConversationMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  skillId?: string;
}

/**
 * 方案对比项
 */
export interface SolutionComparison {
  metric: string;
  unit: string;
  solutions: {
    solutionId: string;
    value: number;
    rank: number;
  }[];
}

// ==================== 决策知识引擎 (DKE) 资产库 ====================

/**
 * 资产来源类型
 */
export type AssetSourceType = 'preset' | 'conversation';

/**
 * 决策资产 - 沉淀于对话或通过预设创建的可复用决策组件
 */
export interface DecisionAsset {
  id: string;
  name: string;
  description: string;
  type: 'skill' | 'constraint' | 'ontology' | 'simulation_template' | 'decision_graph';
  source: AssetSourceType;
  // 来源信息
  sourceInfo: {
    creator: string;           // 创建人/决策人
    creatorRole?: string;      // 角色（专家、AI、管理员等）
    createdAt: string;         // 创建时间
    updatedAt: string;         // 更新时间
    conversationId?: string;   // 关联的对话ID（如果是从对话沉淀）
    discussionTopic?: string;  // 讨论主题
    participants?: string[];   // 参与讨论的人员
  };
  // 资产内容
  content: {
    // Skill类型
    skillDef?: Skill;
    // Constraint类型
    constraintDef?: ConstraintRule;
    // Ontology类型
    ontologyDef?: OntologyRelation;
    // Simulation Template类型
    templateDef?: SimulationTemplate;
    // Decision Graph类型
    graphDef?: DecisionGraph;
  };
  // 标签和分类
  tags: string[];
  category: string;
  // 使用统计
  usageStats: {
    usageCount: number;
    lastUsedAt?: string;
    successRate?: number;
  };
  // 版本信息
  version: string;
  status: 'draft' | 'active' | 'deprecated';
}

/**
 * 约束规则定义
 */
export interface ConstraintRule {
  id: string;
  name: string;
  description: string;
  expression: string;
  type: 'hard' | 'soft';
  category: string;
  priority: number;
  applicableScope: string[];
}

/**
 * 本体关系定义
 */
export interface OntologyRelation {
  id: string;
  source: string;
  target: string;
  relation: string;
  description: string;
  properties?: Record<string, any>;
}

/**
 * 推演模板定义
 */
export interface SimulationTemplate {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  skills: string[];
  constraints: string[];
  category: string;
}

/**
 * 决策图定义
 */
export interface DecisionGraph {
  id: string;
  name: string;
  description: string;
  nodes: DecisionGraphNode[];
  edges: DecisionGraphEdge[];
}

/**
 * 决策图节点
 */
export interface DecisionGraphNode {
  id: string;
  type: 'input' | 'hypothesis' | 'constraint' | 'skill' | 'decision' | 'output';
  name: string;
  description?: string;
  data?: any;
}

/**
 * 决策图边
 */
export interface DecisionGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/**
 * 决策案例 - 完整的决策记录
 */
export interface DecisionCase {
  id: string;
  title: string;
  description: string;
  context: {
    industry: string;
    domain: string;
    scenario: string;
  };
  // 决策参与者
  participants: {
    userId: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  // 决策时间线
  timeline: {
    startedAt: string;
    decidedAt: string;
    syncedAt?: string;
  };
  // 决策资产
  assets: {
    skills: string[];
    constraints: string[];
    ontologies: string[];
    templates: string[];
  };
  // 决策结果
  outcome: {
    decision: string;
    rationale: string;
    confidence: number;
    status: 'implemented' | 'pending' | 'abandoned';
  };
  // 关联的历史案例
  similarCases: {
    caseId: string;
    similarity: number;
    differences: string[];
  }[];
  // 差异分析
  diffAnalysis?: {
    comparedToCaseId: string;
    variableDiffs: VariableDiff[];
    ruleDiffs: RuleDiff[];
    skillDiffs: SkillDiff[];
  };
}

/**
 * 变量差异
 */
export interface VariableDiff {
  name: string;
  historical: any;
  current: any;
  change: string;
}

/**
 * 规则差异
 */
export interface RuleDiff {
  rule: string;
  historical: string;
  current: string;
  change: string;
}

/**
 * 技能差异
 */
export interface SkillDiff {
  capability: string;
  historical: string;
  current: string;
  change: string;
}

/**
 * 决策学习记录
 */
export interface DecisionLearningRecord {
  id: string;
  caseId: string;
  timestamp: string;
  // 差异记录
  differences: {
    category: string;
    from: string;
    to: string;
    reason: string;
  }[];
  // 决策选择
  choices: {
    option: string;
    selected: boolean;
    rationale: string;
  }[];
  // 决策人
  decisionMaker: {
    userId: string;
    name: string;
  };
  // 学习结果
  learning: {
    newSkills: string[];
    newConstraints: string[];
    evolvedRules: string[];
  };
}