import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import {
  X, Database, Zap, Scale, GitBranch, Layers, Grid3X3, Search,
  TrendingUp, Factory, Package, CheckCircle, DollarSign, Truck, Users, Calendar,
  Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, Info, ChevronRight,
  Table, Play, Scale as ScaleIcon, Workflow, ArrowRight, Cpu, BookOpen, Plus, Link2, Network
} from 'lucide-react';
// 导入MCP工具的约束规则和求解器数据
import { DEFAULT_CONSTRAINT_RULES, CONSTRAINT_CATEGORIES, SOLVER_TYPES, ConstraintRule } from './MCPTools';

// ==================== 类型定义 ====================

type NodeType = 'dataEntity' | 'behavior' | 'businessRule' | 'businessProcess';
type SemanticCategory = 'sales' | 'production' | 'inventory' | 'quality' | 'finance' | 'logistics' | 'customer' | 'planning';

// 数据字段
interface DataField {
  name: string;
  dataType: string;
  required: boolean;
  description: string;
}

// 实体关系
type EntityRelationType = 'belongs_to' | 'contains' | 'references' | 'triggers' | 'derived_from';
interface EntityRelation {
  targetEntityId: string;
  relationType: EntityRelationType;
  description: string;
}

// 生命周期状态
type LifecycleState = 'draft' | 'active' | 'suspended' | 'archived' | 'deleted';

// 数据实体类型
 type EntityType = 'organization' | 'asset' | 'businessObject' | 'eventObject';

// 数据实体 - 数字孪生的可管理对象
type DataEntity = {
  id: string;
  name: string;
  description: string;
  // 1️⃣ 实体分类
  entityType: EntityType;
  subtype?: string; // 子类型：如organization下可细分为department/supplier/customer
  // 属性定义
  fields: DataField[];
  // 关系定义
  relations?: EntityRelation[];
  // 生命周期状态
  lifecycleStates?: LifecycleState[];
  currentState?: LifecycleState;
  // 数据源信息
  source: string;
  updateFrequency: string;
  // 关联实体
  relatedEntities: string[];
  // 业务标识
  businessCode?: string;
  owner?: string;
  // 扩展属性
  tags?: string[];
};

// 行为操作类型
type ActionType = 'crud' | 'businessAction' | 'batchCalculation';
type CrudOperation = 'create' | 'read' | 'update' | 'delete';
type BusinessActionType = 'approve' | 'reject' | 'adjust' | 'transfer' | 'alert' | 'notify';

// 操作影响范围
interface ActionImpact {
  entityId: string;
  impactType: 'read' | 'write' | 'delete' | 'trigger';
  description: string;
}

// 行为操作 - 对数据实体的可控操作
type Behavior = {
  id: string;
  name: string;
  description: string;
  // 2️⃣ 行为分类
  actionType: ActionType;
  // CRUD操作细分
  crudOperation?: CrudOperation;
  // 业务动作细分
  businessActionType?: BusinessActionType;
  // 批处理配置
  batchConfig?: {
    targetEntities: string[];
    calculationFormula: string;
    triggerCondition?: string;
  };
  // 输入输出参数
  inputParams: DataField[];
  outputParams: DataField[];
  // 影响的数据实体
  impactedEntities: ActionImpact[];
  // 关联的数据实体（兼容旧数据）
  relatedDataEntities?: string[];
  // 执行权限
  requiredRoles?: string[];
  // 审计日志
  enableAudit?: boolean;
  // 扩展属性
  tags?: string[];
};

// 规则子类型
type RuleSubtype = 'validation' | 'constraint' | 'calculation' | 'risk';

// 规则触发配置
interface RuleTrigger {
  triggerType: 'event' | 'schedule' | 'threshold' | 'manual';
  triggerEvent?: string;
  scheduleExpression?: string;
  thresholdValue?: number;
}

// 规则动作
interface RuleAction {
  actionType: 'block' | 'warn' | 'autoProcess' | 'notify' | 'log';
  actionConfig: Record<string, any>;
  actionDescription: string;
}

// 业务规则 - 约束和计算逻辑
type BusinessRule = {
  id: string;
  name: string;
  description: string;
  // 3️⃣ 规则分类
  ruleType: 'validation' | 'constraint' | 'calculation' | 'decision';
  ruleSubtype: RuleSubtype;
  // 规则定义
  condition: string;
  conditionExpression?: string; // 可执行的表达式
  // 动作定义（新的结构化格式）
  action: string;
  ruleAction?: RuleAction;
  // 优先级
  priority: number;
  // 触发配置
  trigger?: RuleTrigger;
  // 适用的数据实体
  applicableEntities: string[];
  // 风险等级（针对风险规则）
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  // 阈值配置
  thresholdConfig?: {
    warningThreshold: number;
    criticalThreshold: number;
    autoActionThreshold?: number;
  };
  // 影响的业务行为（兼容旧数据）
  relatedBehaviors?: string[];
  // 启用状态
  enabled: boolean;
  // 扩展属性
  tags?: string[];
};

// 节点类型
type WorkflowNodeType = 'task' | 'decision' | 'gateway' | 'start' | 'end' | 'subprocess' | 'human' | 'system';

// 条件分支
interface ConditionalBranch {
  branchId: string;
  branchName: string;
  condition: string;
  conditionExpression: string;
  targetStepId: string;
  isDefault: boolean;
}

// 触发机制
type TriggerMechanism =
  | { type: 'schedule'; scheduleExpression: string; description: string }
  | { type: 'event'; eventName: string; eventSource: string; description: string }
  | { type: 'manual'; initiator: string; description: string }
  | { type: 'threshold'; metric: string; threshold: number; operator: '>' | '<' | '=' | '>=' | '<=' };

// 人机协作配置
interface HumanMachineConfig {
  requiresHumanApproval: boolean;
  approverRoles: string[];
  autoExecuteCondition?: string;
  timeoutMinutes?: number;
  escalationRule?: string;
}

// 流程节点定义
interface WorkflowNode {
  nodeId: string;
  nodeName: string;
  description: string;
  nodeType: WorkflowNodeType;
  order: number;
  // 执行的实体引用
  referencedEntityId?: string; // 关联的数据实体/行为/规则ID
  entityType?: NodeType;
  // 人机协作配置
  humanMachineConfig?: HumanMachineConfig;
  // 条件分支（仅decision类型节点）
  conditionalBranches?: ConditionalBranch[];
  // 超时配置
  timeoutConfig?: {
    timeoutMinutes: number;
    timeoutAction: 'escalate' | 'skip' | 'fail';
  };
}

// 业务流程 - 执行链
type BusinessProcess = {
  id: string;
  name: string;
  description: string;
  // 4️⃣ 流程定义
  // 流程节点（替代原来的steps）
  nodes: WorkflowNode[];
  // 兼容旧数据
  steps?: ProcessStep[];
  // 触发机制
  trigger: string;
  triggers: TriggerMechanism[];
  // 流程结果
  result: string;
  resultDefinition?: {
    successCriteria: string;
    outputEntities: string[];
    failureHandling: string;
  };
  // 关联节点（兼容旧数据）
  relatedNodes?: string[];
  // 流程编排
  orchestration?: {
    parallelBranches?: string[][];
    compensationSteps?: string[];
  };
  // 监控配置
  monitoringConfig?: {
    slaMinutes?: number;
    alertThreshold?: number;
    keyMetrics: string[];
  };
  // 启用状态
  enabled: boolean;
  // 扩展属性
  tags?: string[];
};

// 原子业务语义 - 包含完整的四类信息
interface AtomicSemantic {
  id: string;
  code: string;
  name: string;
  englishName: string;
  description: string;
  category: SemanticCategory;
  // 四类信息
  dataEntities: DataEntity[];
  behaviors: Behavior[];
  businessRules: BusinessRule[];
  businessProcesses: BusinessProcess[];
  // 节点间的关联关系
  relationships: {
    from: string;
    to: string;
    type: 'uses' | 'triggers' | 'implements' | 'part_of';
    description?: string;
  }[];
}

// 流程步骤（兼容旧数据结构）
interface ProcessStep {
  id: string;
  name: string;
  description: string;
  order: number;
  nodeTypes: string[];
}

// 节点类型配置
const NODE_TYPE_CONFIG: Record<NodeType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
  shape: 'circle' | 'rect' | 'diamond' | 'hexagon';
}> = {
  dataEntity: {
    label: '数据实体',
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    borderColor: '#4f46e5',
    icon: Table,
    shape: 'circle'
  },
  behavior: {
    label: '行为操作',
    color: '#0891b2',
    bgColor: '#cffafe',
    borderColor: '#0891b2',
    icon: Play,
    shape: 'rect'
  },
  businessRule: {
    label: '业务规则',
    color: '#ea580c',
    bgColor: '#ffedd5',
    borderColor: '#ea580c',
    icon: ScaleIcon,
    shape: 'diamond'
  },
  businessProcess: {
    label: '业务流程',
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: '#16a34a',
    icon: Workflow,
    shape: 'hexagon'
  }
};

// 类别配置
const CATEGORY_CONFIG: Record<SemanticCategory, { label: string; color: string; bgColor: string; icon: any }> = {
  sales: { label: '销售类', color: '#4f46e5', bgColor: '#e0e7ff', icon: TrendingUp },
  production: { label: '生产类', color: '#0891b2', bgColor: '#cffafe', icon: Factory },
  inventory: { label: '库存类', color: '#16a34a', bgColor: '#dcfce7', icon: Package },
  quality: { label: '质量类', color: '#dc2626', bgColor: '#fee2e2', icon: CheckCircle },
  finance: { label: '财务类', color: '#d97706', bgColor: '#fef3c7', icon: DollarSign },
  logistics: { label: '物流类', color: '#7c3aed', bgColor: '#ede9fe', icon: Truck },
  customer: { label: '客户类', color: '#db2777', bgColor: '#fce7f3', icon: Users },
  planning: { label: '计划类', color: '#059669', bgColor: '#d1fae5', icon: Calendar }
};

// ==================== 原子业务语义数据 ====================

const ATOMIC_SEMANTICS: AtomicSemantic[] = [
  // ==================== 场景1: 设备预测性维护 ====================
  {
    id: 'sem_equipment_health_monitor',
    code: 'EQUIP_HEALTH_MONITOR',
    name: '设备健康度监测',
    englishName: 'Equipment Health Monitoring',
    description: '设备预测性维护场景的第1个子链条：实时采集设备传感器数据，计算健康度指标',
    category: 'production',
    dataEntities: [
      {
        id: 'de_sensor_realtime',
        name: '传感器实时数据',
        description: '设备振动、温度、电流等传感器实时数据流',
        entityType: 'businessObject' as EntityType,
        subtype: 'iot_data_stream',
        fields: [
          { name: 'sensor_id', dataType: 'string', required: true, description: '传感器唯一标识' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'metric_type', dataType: 'string', required: true, description: '指标类型：vibration/temperature/current' },
          { name: 'metric_value', dataType: 'number', required: true, description: '指标值' },
          { name: 'timestamp', dataType: 'datetime', required: true, description: '采集时间戳' },
          { name: 'status', dataType: 'string', required: true, description: '传感器状态' }
        ],
        relations: [
          { targetEntityId: 'de_equipment_profile', relationType: 'references', description: '关联设备档案' }
        ],
        lifecycleStates: ['active', 'inactive', 'fault'],
        currentState: 'active',
        source: 'IoT平台',
        updateFrequency: '实时',
        relatedEntities: ['de_equipment_profile'],
        businessCode: 'SENSOR_RT',
        owner: '设备管理部',
        tags: ['IoT', '传感器', '实时数据']
      },
      {
        id: 'de_equipment_profile',
        name: '设备档案',
        description: '设备基础信息、技术参数、维护历史',
        entityType: 'asset' as EntityType,
        subtype: 'production_equipment',
        fields: [
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备唯一编码' },
          { name: 'equipment_name', dataType: 'string', required: true, description: '设备名称' },
          { name: 'model', dataType: 'string', required: true, description: '设备型号' },
          { name: 'install_date', dataType: 'datetime', required: true, description: '安装日期' },
          { name: 'warranty_period', dataType: 'number', required: true, description: '保修期(月)' },
          { name: 'critical_level', dataType: 'string', required: true, description: '关键等级：A/B/C' }
        ],
        relations: [
          { targetEntityId: 'de_sensor_realtime', relationType: 'triggers', description: '触发传感器监控' }
        ],
        lifecycleStates: ['new', 'running', 'maintenance', 'retired'],
        currentState: 'running',
        source: 'EAM系统',
        updateFrequency: '每日',
        relatedEntities: ['de_sensor_realtime'],
        businessCode: 'EQ_PROFILE',
        owner: '设备管理部',
        tags: ['设备', '资产', '档案']
      },
      {
        id: 'de_health_indicator',
        name: '健康度指标',
        description: '设备健康度评估结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'calculated_metric',
        fields: [
          { name: 'indicator_id', dataType: 'string', required: true, description: '指标ID' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'health_score', dataType: 'number', required: true, description: '健康度评分0-100' },
          { name: 'assessment_time', dataType: 'datetime', required: true, description: '评估时间' },
          { name: 'trend_direction', dataType: 'string', required: true, description: '趋势：上升/下降/平稳' }
        ],
        relations: [
          { targetEntityId: 'de_equipment_profile', relationType: 'derived_from', description: '从设备数据计算' }
        ],
        lifecycleStates: ['draft', 'confirmed', 'archived'],
        currentState: 'confirmed',
        source: 'AI计算引擎',
        updateFrequency: '每小时',
        relatedEntities: ['de_equipment_profile', 'de_sensor_realtime'],
        businessCode: 'HEALTH_IND',
        owner: '设备管理部',
        tags: ['健康度', '评估', 'AI计算']
      }
    ],
    behaviors: [
      {
        id: 'bh_collect_sensor_data',
        name: '采集传感器数据',
        description: '从IoT平台实时采集设备传感器数据',
        actionType: 'crud' as ActionType,
        crudOperation: 'create',
        inputParams: [
          { name: 'equipment_ids', dataType: 'array', required: true, description: '设备编码列表' },
          { name: 'metric_types', dataType: 'array', required: true, description: '指标类型列表' }
        ],
        outputParams: [
          { name: 'collected_count', dataType: 'number', required: true, description: '采集数据条数' },
          { name: 'data_quality', dataType: 'string', required: true, description: '数据质量评估' }
        ],
        impactedEntities: [
          { entityId: 'de_sensor_realtime', impactType: 'write', description: '写入传感器数据' }
        ],
        relatedDataEntities: ['de_sensor_realtime'],
        requiredRoles: ['IoT运维工程师'],
        enableAudit: true,
        tags: ['数据采集', 'IoT', '实时']
      },
      {
        id: 'bh_calc_health_score',
        name: '计算健康度评分',
        description: '基于传感器数据计算设备健康度',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_sensor_realtime', 'de_equipment_profile'],
          calculationFormula: 'ML模型：f(vibration, temperature, current, age)',
          triggerCondition: '每小时或手动触发'
        },
        inputParams: [
          { name: 'time_window', dataType: 'number', required: true, description: '时间窗口(小时)' },
          { name: 'algorithm_params', dataType: 'object', required: false, description: '算法参数' }
        ],
        outputParams: [
          { name: 'health_scores', dataType: 'array', required: true, description: '健康度评分列表' },
          { name: 'anomalies', dataType: 'array', required: true, description: '异常检测结果' }
        ],
        impactedEntities: [
          { entityId: 'de_sensor_realtime', impactType: 'read', description: '读取传感器数据' },
          { entityId: 'de_health_indicator', impactType: 'write', description: '写入健康度结果' }
        ],
        relatedDataEntities: ['de_sensor_realtime', 'de_equipment_profile'],
        requiredRoles: ['数据科学家', '设备工程师'],
        enableAudit: true,
        tags: ['健康度', 'AI计算', '批量']
      }
    ],
    businessRules: [
      {
        id: 'br_sensor_data_quality',
        name: '传感器数据质量规则',
        description: '验证传感器数据的完整性和准确性',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: '数据缺失率>5% 或 异常值比例>10%',
        conditionExpression: 'missing_rate > 0.05 OR outlier_rate > 0.1',
        action: '标记数据质量异常，触发传感器检修',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { severity: 'medium', notify: '设备维护组' },
          actionDescription: '发送数据质量告警'
        },
        priority: 2,
        trigger: { triggerType: 'event', triggerEvent: 'data_collection_completed' },
        applicableEntities: ['de_sensor_realtime'],
        enabled: true,
        relatedBehaviors: ['bh_collect_sensor_data'],
        tags: ['数据质量', '验证', '传感器']
      },
      {
        id: 'br_health_threshold',
        name: '健康度阈值规则',
        description: '健康度低于阈值时触发预警',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '健康度评分<60分',
        conditionExpression: 'health_score < 60',
        action: '触发设备预警，生成检修建议',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { workflow: 'maintenance_alert' },
          actionDescription: '自动创建维护工单'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 60 },
        applicableEntities: ['de_health_indicator'],
        riskLevel: 'high',
        thresholdConfig: {
          warningThreshold: 70,
          criticalThreshold: 60,
          autoActionThreshold: 50
        },
        enabled: true,
        relatedBehaviors: ['bh_calc_health_score'],
        tags: ['健康度', '阈值', '预警']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_health_monitoring',
        name: '设备健康监测流程',
        description: '设备实时健康监测的完整流程',
        processType: 'monitoring',
        trigger: { type: 'schedule', scheduleExpression: '0 * * * *', description: '每小时执行' },
        steps: [
          { stepId: 's1', stepName: '采集数据', description: '从传感器采集数据', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: '质量检查', description: '验证数据质量', order: 2, nodeTypes: ['businessRule'] },
          { stepId: 's3', stepName: '计算健康度', description: '执行AI模型计算', order: 3, nodeTypes: ['behavior'] },
          { stepId: 's4', stepName: '阈值判断', description: '判断是否需要预警', order: 4, nodeTypes: ['businessRule'] }
        ],
        result: '健康度评估报告',
        resultDefinition: {
          successCriteria: '数据完整且健康度计算成功',
          failureHandling: '记录日志并通知运维'
        },
        tags: ['监测', '实时', '健康度']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_sensor_realtime', to: 'de_equipment_profile', type: 'belongs_to', description: '传感器数据属于设备' },
      { from: 'de_health_indicator', to: 'de_equipment_profile', type: 'derived_from', description: '健康度从设备档案派生' },
      { from: 'de_health_indicator', to: 'de_sensor_realtime', type: 'derived_from', description: '健康度从传感器数据计算' },
      // 行为与数据实体的关系
      { from: 'bh_collect_sensor_data', to: 'de_sensor_realtime', type: 'implements', description: '实现数据采集' },
      { from: 'bh_collect_sensor_data', to: 'de_equipment_profile', type: 'uses', description: '使用设备配置' },
      { from: 'bh_calc_health_score', to: 'de_sensor_realtime', type: 'uses', description: '读取传感器数据' },
      { from: 'bh_calc_health_score', to: 'de_equipment_profile', type: 'uses', description: '读取设备信息' },
      { from: 'bh_calc_health_score', to: 'de_health_indicator', type: 'implements', description: '生成健康度指标' },
      // 规则与数据实体的关系
      { from: 'br_sensor_data_quality', to: 'de_sensor_realtime', type: 'validates', description: '验证传感器数据' },
      { from: 'br_sensor_data_quality', to: 'bh_collect_sensor_data', type: 'triggers', description: '触发重采' },
      { from: 'br_health_threshold', to: 'de_health_indicator', type: 'triggers', description: '监控健康度' },
      { from: 'br_health_threshold', to: 'bh_calc_health_score', type: 'depends_on', description: '依赖健康度计算' },
      // 流程与行为/规则的关系
      { from: 'bp_health_monitoring', to: 'bh_collect_sensor_data', type: 'implements', description: '流程实现采集' },
      { from: 'bp_health_monitoring', to: 'br_sensor_data_quality', type: 'implements', description: '流程实现质检' },
      { from: 'bp_health_monitoring', to: 'bh_calc_health_score', type: 'implements', description: '流程实现计算' },
      { from: 'bp_health_monitoring', to: 'br_health_threshold', type: 'implements', description: '流程实现阈值判断' }
    ]
  },

  // 场景1子链条2: RUL预测
  {
    id: 'sem_rul_prediction',
    code: 'RUL_PREDICTION',
    name: '设备RUL预测',
    englishName: 'Remaining Useful Life Prediction',
    description: '设备预测性维护场景的第2个子链条：基于健康度趋势预测设备剩余使用寿命',
    category: 'production',
    dataEntities: [
      {
        id: 'de_health_history',
        name: '健康度历史',
        description: '设备健康度变化历史记录',
        entityType: 'businessObject' as EntityType,
        subtype: 'time_series_data',
        fields: [
          { name: 'history_id', dataType: 'string', required: true, description: '记录ID' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'health_score', dataType: 'number', required: true, description: '健康度' },
          { name: 'record_time', dataType: 'datetime', required: true, description: '记录时间' }
        ],
        relations: [],
        lifecycleStates: ['active', 'archived'],
        currentState: 'active',
        source: '健康度计算',
        updateFrequency: '每小时',
        relatedEntities: [],
        businessCode: 'HEALTH_HIST',
        owner: '设备管理部',
        tags: ['历史', '健康度', '时序']
      },
      {
        id: 'de_rul_prediction',
        name: 'RUL预测结果',
        description: '设备剩余使用寿命预测',
        entityType: 'businessObject' as EntityType,
        subtype: 'prediction_result',
        fields: [
          { name: 'prediction_id', dataType: 'string', required: true, description: '预测ID' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'rul_days', dataType: 'number', required: true, description: '剩余寿命天数' },
          { name: 'confidence', dataType: 'number', required: true, description: '置信度' },
          { name: 'predicted_at', dataType: 'datetime', required: true, description: '预测时间' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'confirmed'],
        currentState: 'confirmed',
        source: 'RUL预测模型',
        updateFrequency: '每日',
        relatedEntities: [],
        businessCode: 'RUL_PRED',
        owner: '设备管理部',
        tags: ['RUL', '预测', '寿命']
      }
    ],
    behaviors: [
      {
        id: 'bh_predict_rul',
        name: 'RUL预测计算',
        description: '使用生存分析模型预测设备剩余寿命',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_health_history'],
          calculationFormula: 'Weibull生存分析 + LSTM趋势预测',
          triggerCondition: '每日凌晨2点'
        },
        inputParams: [
          { name: 'history_days', dataType: 'number', required: true, description: '历史数据天数' }
        ],
        outputParams: [
          { name: 'rul_days', dataType: 'number', required: true, description: '剩余寿命' },
          { name: 'confidence', dataType: 'number', required: true, description: '置信度' }
        ],
        impactedEntities: [
          { entityId: 'de_health_history', impactType: 'read', description: '读取历史' },
          { entityId: 'de_rul_prediction', impactType: 'write', description: '写入预测' }
        ],
        relatedDataEntities: ['de_health_history'],
        requiredRoles: ['数据科学家'],
        enableAudit: true,
        tags: ['RUL', '预测', 'AI']
      }
    ],
    businessRules: [
      {
        id: 'br_rul_critical',
        name: 'RUL临界值规则',
        description: 'RUL低于30天时触发紧急维护',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: 'RUL<30天',
        conditionExpression: 'rul_days < 30',
        action: '触发紧急维护流程',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { priority: 'high' },
          actionDescription: '创建紧急维护工单'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 30 },
        applicableEntities: ['de_rul_prediction'],
        riskLevel: 'critical',
        enabled: true,
        relatedBehaviors: ['bh_predict_rul'],
        tags: ['RUL', '临界', '紧急']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_rul_prediction',
        name: 'RUL预测流程',
        description: '设备剩余寿命预测流程',
        processType: 'calculation',
        trigger: { type: 'schedule', scheduleExpression: '0 2 * * *', description: '每日凌晨2点' },
        steps: [
          { stepId: 's1', stepName: '获取历史', description: '读取健康度历史', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: 'RUL预测', description: '执行预测模型', order: 2, nodeTypes: ['behavior'] },
          { stepId: 's3', stepName: '临界判断', description: '判断是否需维护', order: 3, nodeTypes: ['businessRule'] }
        ],
        result: 'RUL预测报告',
        resultDefinition: { successCriteria: '预测完成', failureHandling: '重试' },
        tags: ['RUL', '预测']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_rul_prediction', to: 'de_health_history', type: 'derived_from', description: 'RUL从历史健康度派生' },
      // 行为与数据实体的关系
      { from: 'bh_predict_rul', to: 'de_health_history', type: 'uses', description: '读取历史数据' },
      { from: 'bh_predict_rul', to: 'de_rul_prediction', type: 'implements', description: '生成预测结果' },
      // 规则与数据实体的关系
      { from: 'br_rul_critical', to: 'de_rul_prediction', type: 'triggers', description: '监控RUL临界值' },
      { from: 'br_rul_critical', to: 'bh_predict_rul', type: 'depends_on', description: '依赖预测结果' },
      // 流程与行为/规则的关系
      { from: 'bp_rul_prediction', to: 'de_health_history', type: 'uses', description: '流程使用历史数据' },
      { from: 'bp_rul_prediction', to: 'bh_predict_rul', type: 'implements', description: '流程实现预测' },
      { from: 'bp_rul_prediction', to: 'br_rul_critical', type: 'implements', description: '流程实现临界判断' }
    ]
  },

  // ==================== 场景2: 设备故障维修时间预测 ====================
  {
    id: 'sem_repair_time_pred',
    code: 'REPAIR_TIME_PRED',
    name: '维修工时预测',
    englishName: 'Repair Time Prediction',
    description: '设备故障维修时间预测场景的第1个子链条：基于故障类型和历史数据预测维修工时',
    category: 'production',
    dataEntities: [
      {
        id: 'de_failure_record',
        name: '故障记录',
        description: '设备故障历史记录',
        entityType: 'businessObject' as EntityType,
        subtype: 'failure_record',
        fields: [
          { name: 'failure_id', dataType: 'string', required: true, description: '故障ID' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'failure_type', dataType: 'string', required: true, description: '故障类型' },
          { name: 'severity', dataType: 'string', required: true, description: '严重程度' },
          { name: 'occurrence_time', dataType: 'datetime', required: true, description: '发生时间' }
        ],
        relations: [],
        lifecycleStates: ['open', 'processing', 'closed'],
        currentState: 'open',
        source: '设备管理系统',
        updateFrequency: '实时',
        relatedEntities: [],
        businessCode: 'FAIL_REC',
        owner: '维修部',
        tags: ['故障', '记录']
      },
      {
        id: 'de_repair_history',
        name: '维修历史',
        description: '历史维修工单记录',
        entityType: 'businessObject' as EntityType,
        subtype: 'maintenance_record',
        fields: [
          { name: 'repair_id', dataType: 'string', required: true, description: '维修ID' },
          { name: 'failure_type', dataType: 'string', required: true, description: '故障类型' },
          { name: 'actual_hours', dataType: 'number', required: true, description: '实际工时' },
          { name: 'technician_level', dataType: 'string', required: true, description: '技师等级' }
        ],
        relations: [],
        lifecycleStates: ['archived'],
        currentState: 'archived',
        source: 'EAM系统',
        updateFrequency: '每日',
        relatedEntities: [],
        businessCode: 'REP_HIST',
        owner: '维修部',
        tags: ['维修', '历史']
      }
    ],
    behaviors: [
      {
        id: 'bh_predict_repair_time',
        name: '预测维修工时',
        description: '基于故障类型预测维修所需工时',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_failure_record', 'de_repair_history'],
          calculationFormula: '回归模型：f(故障类型, 严重程度, 设备年龄)',
          triggerCondition: '故障发生时'
        },
        inputParams: [
          { name: 'failure_id', dataType: 'string', required: true, description: '故障记录ID' }
        ],
        outputParams: [
          { name: 'predicted_hours', dataType: 'number', required: true, description: '预测工时' },
          { name: 'confidence', dataType: 'number', required: true, description: '置信度' }
        ],
        impactedEntities: [
          { entityId: 'de_failure_record', impactType: 'read', description: '读取故障' },
          { entityId: 'de_repair_history', impactType: 'read', description: '读取历史' }
        ],
        relatedDataEntities: ['de_failure_record', 'de_repair_history'],
        requiredRoles: ['维修工程师'],
        enableAudit: true,
        tags: ['预测', '工时', '维修']
      }
    ],
    businessRules: [
      {
        id: 'br_long_repair',
        name: '长工时预警规则',
        description: '预测工时超过8小时触发预警',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '预测工时>8小时',
        conditionExpression: 'predicted_hours > 8',
        action: '安排备用设备，协调多人维修',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { notify: '生产经理' },
          actionDescription: '长工时预警'
        },
        priority: 2,
        trigger: { triggerType: 'threshold', thresholdValue: 8 },
        applicableEntities: ['de_failure_record'],
        enabled: true,
        relatedBehaviors: ['bh_predict_repair_time'],
        tags: ['工时', '预警', '维修']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_repair_planning',
        name: '维修计划流程',
        description: '故障维修计划制定流程',
        processType: 'planning',
        trigger: { type: 'event', eventName: 'failure_reported', eventSource: '设备系统', description: '故障上报时' },
        steps: [
          { stepId: 's1', stepName: '故障登记', description: '记录故障信息', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: '工时预测', description: '预测维修工时', order: 2, nodeTypes: ['behavior'] },
          { stepId: 's3', stepName: '资源调配', description: '安排人员和备件', order: 3, nodeTypes: ['businessRule'] }
        ],
        result: '维修计划',
        resultDefinition: { successCriteria: '计划制定完成', failureHandling: '升级处理' },
        tags: ['维修', '计划']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_failure_record', to: 'de_repair_history', type: 'references', description: '故障关联历史' },
      // 行为与数据实体的关系
      { from: 'bh_predict_repair_time', to: 'de_failure_record', type: 'uses', description: '读取故障信息' },
      { from: 'bh_predict_repair_time', to: 'de_repair_history', type: 'uses', description: '使用历史数据' },
      // 规则与数据实体的关系
      { from: 'br_long_repair', to: 'de_failure_record', type: 'triggers', description: '监控故障工时' },
      { from: 'br_long_repair', to: 'bh_predict_repair_time', type: 'depends_on', description: '依赖预测结果' },
      // 流程与行为/规则的关系
      { from: 'bp_repair_planning', to: 'de_failure_record', type: 'uses', description: '流程使用故障记录' },
      { from: 'bp_repair_planning', to: 'bh_predict_repair_time', type: 'implements', description: '流程实现工时预测' },
      { from: 'bp_repair_planning', to: 'br_long_repair', type: 'implements', description: '流程实现资源调配' }
    ]
  },

  // ==================== 场景3: 产销匹配协同 ====================
  {
    id: 'sem_inventory_optimization',
    code: 'INVENTORY_OPTIMIZATION',
    name: '库存优化与补货决策',
    englishName: 'Inventory Optimization & Replenishment',
    description: '实时监控库存水平，智能触发补货建议，平衡库存成本与交付能力',
    category: 'inventory',
    dataEntities: [
      {
        id: 'de_inventory',
        name: '实时库存数据',
        description: '各仓库实时库存状态',
        entityType: 'asset' as EntityType,
        subtype: 'inventory_item',
        fields: [
          { name: 'material_code', dataType: 'string', required: true, description: '物料编码' },
          { name: 'warehouse_code', dataType: 'string', required: true, description: '仓库编码' },
          { name: 'available_qty', dataType: 'number', required: true, description: '可用数量' },
          { name: 'reserved_qty', dataType: 'number', required: true, description: '预留数量' },
          { name: 'safety_stock', dataType: 'number', required: true, description: '安全库存' },
          { name: 'max_stock', dataType: 'number', required: true, description: '最大库存' }
        ],
        relations: [
          { targetEntityId: 'de_supplier', relationType: 'references', description: '关联供应商' },
          { targetEntityId: 'de_turnover', relationType: 'references', description: '关联周转分析' }
        ],
        lifecycleStates: ['active', 'inactive', 'frozen'],
        currentState: 'active',
        source: 'WMS系统',
        updateFrequency: '实时',
        relatedEntities: ['de_supplier', 'de_turnover'],
        businessCode: 'INV_DATA',
        owner: '仓储部',
        tags: ['库存', '实时', '资产']
      },
      {
        id: 'de_supplier',
        name: '供应商主数据',
        description: '供应商基本信息和供货能力',
        entityType: 'organization' as EntityType,
        subtype: 'external_supplier',
        fields: [
          { name: 'supplier_id', dataType: 'string', required: true, description: '供应商ID' },
          { name: 'supplier_name', dataType: 'string', required: true, description: '供应商名称' },
          { name: 'lead_time', dataType: 'number', required: true, description: '交货周期(天)' },
          { name: 'moq', dataType: 'number', required: true, description: '最小订货量' },
          { name: 'unit_price', dataType: 'number', required: true, description: '单价' }
        ],
        relations: [
          { targetEntityId: 'de_inventory', relationType: 'triggers', description: '影响库存' }
        ],
        lifecycleStates: ['active', 'suspended', 'blacklisted'],
        currentState: 'active',
        source: 'SRM系统',
        updateFrequency: '每月',
        relatedEntities: ['de_inventory'],
        businessCode: 'SUP_MASTER',
        owner: '采购部',
        tags: ['供应商', '组织', '外部']
      },
      {
        id: 'de_turnover',
        name: '库存周转分析',
        description: '物料库存周转率分析',
        entityType: 'businessObject' as EntityType,
        subtype: 'analysis_report',
        fields: [
          { name: 'material_code', dataType: 'string', required: true, description: '物料编码' },
          { name: 'turnover_days', dataType: 'number', required: true, description: '周转天数' },
          { name: 'turnover_rate', dataType: 'number', required: true, description: '周转率' },
          { name: 'abc_class', dataType: 'string', required: true, description: 'ABC分类' },
          { name: 'cost_occupation', dataType: 'number', required: true, description: '资金占用' }
        ],
        relations: [
          { targetEntityId: 'de_inventory', relationType: 'derived_from', description: '从库存数据派生' }
        ],
        lifecycleStates: ['draft', 'active', 'archived'],
        currentState: 'active',
        source: 'BI分析',
        updateFrequency: '每周',
        relatedEntities: ['de_inventory'],
        businessCode: 'TURNOVER_RPT',
        owner: '数据部',
        tags: ['分析', '周转', '报表']
      }
    ],
    behaviors: [
      {
        id: 'bh_calculate_replenishment',
        name: '计算补货建议',
        description: '基于库存水平和需求预测计算补货建议',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_inventory', 'de_turnover'],
          calculationFormula: 'MAX(安全库存 + 预测需求 - 当前库存, 0)',
          triggerCondition: '库存变化或定时任务'
        },
        inputParams: [
          { name: 'current_stock', dataType: 'number', required: true, description: '当前库存' },
          { name: 'safety_stock', dataType: 'number', required: true, description: '安全库存' },
          { name: 'lead_time', dataType: 'number', required: true, description: '交货周期' }
        ],
        outputParams: [
          { name: 'recommend_qty', dataType: 'number', required: true, description: '建议补货量' },
          { name: 'order_point', dataType: 'number', required: true, description: '订货点' }
        ],
        impactedEntities: [
          { entityId: 'de_inventory', impactType: 'read', description: '读取库存数据' },
          { entityId: 'de_turnover', impactType: 'read', description: '读取周转数据' }
        ],
        relatedDataEntities: ['de_inventory', 'de_turnover'],
        requiredRoles: ['采购员', '计划员'],
        enableAudit: true,
        tags: ['补货', '计算', '批量']
      },
      {
        id: 'bh_create_pr',
        name: '生成采购申请',
        description: '创建采购申请单',
        actionType: 'crud' as ActionType,
        crudOperation: 'create',
        inputParams: [
          { name: 'material_code', dataType: 'string', required: true, description: '物料编码' },
          { name: 'quantity', dataType: 'number', required: true, description: '申请数量' },
          { name: 'required_date', dataType: 'datetime', required: true, description: '需求日期' }
        ],
        outputParams: [
          { name: 'pr_id', dataType: 'string', required: true, description: '采购申请号' },
          { name: 'status', dataType: 'string', required: true, description: '申请状态' }
        ],
        impactedEntities: [
          { entityId: 'de_supplier', impactType: 'read', description: '选择供应商' },
          { entityId: 'de_inventory', impactType: 'write', description: '预留库存' }
        ],
        relatedDataEntities: ['de_supplier'],
        requiredRoles: ['采购员'],
        enableAudit: true,
        tags: ['采购', '创建', 'CRUD']
      }
    ],
    businessRules: [
      {
        id: 'br_safety_warning',
        name: '安全库存预警规则',
        description: '库存低于安全水位时触发预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: '可用库存 < 安全库存',
        conditionExpression: 'available_qty < safety_stock',
        action: '发送预警通知给采购员',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { channels: ['email', 'app'], recipients: ['采购员'] },
          actionDescription: '发送库存预警通知'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 1 },
        applicableEntities: ['de_inventory'],
        thresholdConfig: { warningThreshold: 1.1, criticalThreshold: 1.0 },
        enabled: true,
        relatedBehaviors: ['bh_calculate_replenishment'],
        tags: ['库存', '预警', '安全库存']
      },
      {
        id: 'br_overstock',
        name: '库存积压预警规则',
        description: '库存超过最大水位时触发预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '库存数量 > 最大库存',
        conditionExpression: 'available_qty > max_stock',
        action: '暂停该物料采购，启动促销清库',
        ruleAction: {
          actionType: 'block',
          actionConfig: { blockPurchase: true, triggerPromotion: true },
          actionDescription: '暂停采购并触发促销'
        },
        priority: 2,
        trigger: { triggerType: 'threshold', thresholdValue: 1 },
        applicableEntities: ['de_inventory'],
        enabled: true,
        relatedBehaviors: ['bh_calculate_replenishment'],
        tags: ['积压', '约束', '清库']
      },
      {
        id: 'br_eoq',
        name: '经济批量计算规则',
        description: '计算最优订货批量',
        ruleType: 'calculation' as const,
        ruleSubtype: 'calculation' as RuleSubtype,
        condition: '物料ABC分类 = A类',
        conditionExpression: 'abc_class == "A"',
        action: '使用EOQ模型计算经济批量',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { formula: 'EOQ', roundToMOQ: true },
          actionDescription: '自动计算经济批量'
        },
        priority: 3,
        trigger: { triggerType: 'event', triggerEvent: 'replenishment_calculation' },
        applicableEntities: ['de_turnover'],
        enabled: true,
        relatedBehaviors: ['bh_create_pr'],
        tags: ['EOQ', '计算', 'A类物料']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_replenishment',
        name: '智能补货流程',
        description: '从库存监控到补货执行的自动化流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '库存监控', description: '实时监控库存水平', nodeType: 'system', order: 2, referencedEntityId: 'de_inventory', entityType: 'dataEntity' },
          { nodeId: 'decision1', nodeName: '库存检查', description: '检查是否低于安全库存', nodeType: 'decision', order: 3, referencedEntityId: 'br_safety_warning', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '需要补货', condition: '库存<安全库存', conditionExpression: 'available_qty < safety_stock', targetStepId: 'node3', isDefault: false }, { branchId: 'b2', branchName: '无需补货', condition: '其他情况', conditionExpression: 'true', targetStepId: 'end', isDefault: true }] },
          { nodeId: 'node3', nodeName: '需求计算', description: '计算补货需求量', nodeType: 'system', order: 4, referencedEntityId: 'bh_calculate_replenishment', entityType: 'behavior' },
          { nodeId: 'node4', nodeName: '供应商选择', description: '选择最优供应商', nodeType: 'human', order: 5, referencedEntityId: 'de_supplier', entityType: 'dataEntity', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['采购员'], timeoutMinutes: 60 } },
          { nodeId: 'node5', nodeName: '下单执行', description: '创建采购订单', nodeType: 'system', order: 6, referencedEntityId: 'bh_create_pr', entityType: 'behavior' },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 7 }
        ],
        trigger: '库存低于订货点',
        triggers: [{ type: 'threshold', metric: 'available_qty', threshold: 1, operator: '<', description: '库存低于安全库存阈值' }],
        result: '生成采购订单',
        resultDefinition: { successCriteria: '采购申请已创建', outputEntities: ['de_supplier'], failureHandling: '记录异常并通知' },
        relatedNodes: ['de_inventory', 'de_supplier', 'bh_calculate_replenishment', 'bh_create_pr', 'br_safety_warning'],
        enabled: true,
        monitoringConfig: { slaMinutes: 120, alertThreshold: 0.95, keyMetrics: ['补货响应时间', '订单生成率'] },
        tags: ['补货', '自动化', '库存']
      }
    ],
    relationships: [
      { from: 'bh_calculate_replenishment', to: 'de_inventory', type: 'uses', description: '读取库存' },
      { from: 'bh_calculate_replenishment', to: 'de_turnover', type: 'uses', description: '读取周转率' },
      { from: 'bh_calculate_replenishment', to: 'de_supplier', type: 'uses', description: '获取供应商信息' },
      { from: 'bh_create_pr', to: 'de_supplier', type: 'uses', description: '选择供应商' },
      { from: 'bh_create_pr', to: 'de_inventory', type: 'uses', description: '检查库存' },
      { from: 'br_safety_warning', to: 'de_inventory', type: 'triggers', description: '监控库存' },
      { from: 'br_safety_warning', to: 'bh_calculate_replenishment', type: 'triggers', description: '触发补货' },
      { from: 'br_overstock', to: 'de_inventory', type: 'triggers', description: '监控积压' },
      { from: 'br_overstock', to: 'bh_create_pr', type: 'blocks', description: '阻止采购' },
      { from: 'br_eoq', to: 'de_turnover', type: 'uses', description: '使用ABC分类' },
      { from: 'br_eoq', to: 'bh_create_pr', type: 'triggers', description: '影响采购量' },
      { from: 'bp_replenishment', to: 'de_inventory', type: 'uses', description: '使用库存数据' },
      { from: 'bp_replenishment', to: 'de_supplier', type: 'uses', description: '使用供应商' },
      { from: 'bp_replenishment', to: 'bh_calculate_replenishment', type: 'implements', description: '实现补货' },
      { from: 'bp_replenishment', to: 'bh_create_pr', type: 'implements', description: '实现采购' },
      { from: 'bp_replenishment', to: 'br_safety_warning', type: 'implements', description: '实现预警' },
      { from: 'bp_replenishment', to: 'br_overstock', type: 'implements', description: '实现积压检查' },
      { from: 'bp_replenishment', to: 'br_eoq', type: 'implements', description: '实现经济批量' }
    ]
  },
  // 客户信用与风险评估
  {
    id: 'sem_credit',
    code: 'CREDIT_RISK_ASSESSMENT',
    name: '客户信用与风险评估',
    englishName: 'Customer Credit & Risk Assessment',
    description: '评估客户信用等级，控制应收账款风险，优化销售策略',
    category: 'customer',
    dataEntities: [
      {
        id: 'de_customer',
        name: '客户主数据',
        description: '客户基本信息档案',
        entityType: 'organization' as EntityType,
        subtype: 'external_customer',
        fields: [
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'customer_name', dataType: 'string', required: true, description: '客户名称' },
          { name: 'industry', dataType: 'string', required: true, description: '所属行业' },
          { name: 'company_scale', dataType: 'string', required: true, description: '企业规模' },
          { name: 'cooperation_years', dataType: 'number', required: true, description: '合作年限' },
          { name: 'credit_level', dataType: 'string', required: true, description: '信用等级' }
        ],
        relations: [
          { targetEntityId: 'de_ar', relationType: 'references', description: '关联应收款' },
          { targetEntityId: 'de_transaction', relationType: 'references', description: '关联交易统计' }
        ],
        lifecycleStates: ['prospect', 'active', 'suspended', 'inactive'],
        currentState: 'active',
        source: 'CRM系统',
        updateFrequency: '每月',
        relatedEntities: ['de_ar', 'de_transaction'],
        businessCode: 'CUST_MASTER',
        owner: '销售部',
        tags: ['客户', '组织', '信用']
      },
      {
        id: 'de_ar',
        name: '应收账款明细',
        description: '客户应收账款往来记录',
        entityType: 'businessObject' as EntityType,
        subtype: 'financial_record',
        fields: [
          { name: 'ar_id', dataType: 'string', required: true, description: '应收款ID' },
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'invoice_amount', dataType: 'number', required: true, description: '发票金额' },
          { name: 'due_date', dataType: 'datetime', required: true, description: '到期日' },
          { name: 'overdue_days', dataType: 'number', required: true, description: '逾期天数' },
          { name: 'payment_status', dataType: 'string', required: true, description: '回款状态' }
        ],
        relations: [
          { targetEntityId: 'de_customer', relationType: 'belongs_to', description: '属于客户' }
        ],
        lifecycleStates: ['open', 'partial', 'paid', 'overdue', 'written_off'],
        currentState: 'open',
        source: '财务系统',
        updateFrequency: '每日',
        relatedEntities: ['de_customer'],
        businessCode: 'AR_DETAIL',
        owner: '财务部',
        tags: ['应收款', '财务', '业务对象']
      },
      {
        id: 'de_transaction',
        name: '客户交易统计',
        description: '客户交易行为统计分析',
        entityType: 'businessObject' as EntityType,
        subtype: 'analysis_report',
        fields: [
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'total_orders', dataType: 'number', required: true, description: '总订单数' },
          { name: 'total_amount', dataType: 'number', required: true, description: '交易总金额' },
          { name: 'avg_order_value', dataType: 'number', required: true, description: '平均订单额' },
          { name: 'return_rate', dataType: 'number', required: true, description: '退货率' }
        ],
        relations: [
          { targetEntityId: 'de_customer', relationType: 'derived_from', description: '从客户数据派生' }
        ],
        lifecycleStates: ['draft', 'active', 'archived'],
        currentState: 'active',
        source: '数据仓库',
        updateFrequency: '每周',
        relatedEntities: ['de_customer'],
        businessCode: 'TRANS_STATS',
        owner: '数据部',
        tags: ['交易', '统计', '分析']
      }
    ],
    behaviors: [
      {
        id: 'bh_calc_credit',
        name: '计算信用评分',
        description: '综合评估客户信用状况',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_customer', 'de_ar', 'de_transaction'],
          calculationFormula: '信用评分 = f(付款历史, 交易规模, 合作年限)',
          triggerCondition: '每月评估或信用事件'
        },
        inputParams: [
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' }
        ],
        outputParams: [
          { name: 'credit_score', dataType: 'number', required: true, description: '信用分数' },
          { name: 'risk_level', dataType: 'string', required: true, description: '风险等级' }
        ],
        impactedEntities: [
          { entityId: 'de_customer', impactType: 'read', description: '读取客户信息' },
          { entityId: 'de_ar', impactType: 'read', description: '读取应收款' },
          { entityId: 'de_transaction', impactType: 'read', description: '读取交易统计' }
        ],
        relatedDataEntities: ['de_customer', 'de_ar', 'de_transaction'],
        requiredRoles: ['信用分析师', '财务经理'],
        enableAudit: true,
        tags: ['信用', '评分', '计算']
      },
      {
        id: 'bh_adjust_limit',
        name: '调整信用额度',
        description: '根据评估结果调整客户信用额度',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'adjust',
        inputParams: [
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'new_limit', dataType: 'number', required: true, description: '新额度' }
        ],
        outputParams: [
          { name: 'old_limit', dataType: 'number', required: true, description: '原额度' },
          { name: 'adjust_date', dataType: 'datetime', required: true, description: '调整日期' }
        ],
        impactedEntities: [
          { entityId: 'de_customer', impactType: 'write', description: '更新信用额度' }
        ],
        relatedDataEntities: ['de_customer'],
        requiredRoles: ['财务经理'],
        enableAudit: true,
        tags: ['信用', '调整', '额度']
      }
    ],
    businessRules: [
      {
        id: 'br_credit_adjust',
        name: '信用评级调整规则',
        description: '根据逾期情况调整信用评级',
        ruleType: 'decision' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '逾期次数 > 3 或 最长逾期天数 > 30天',
        conditionExpression: 'overdue_count > 3 OR max_overdue_days > 30',
        action: '信用等级降级，暂停赊销',
        ruleAction: {
          actionType: 'block',
          actionConfig: { suspendCredit: true, notifySales: true },
          actionDescription: '暂停赊销并通知销售'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'credit_evaluation' },
        applicableEntities: ['de_customer', 'de_ar'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_calc_credit', 'bh_adjust_limit'],
        tags: ['信用', '降级', '风险']
      },
      {
        id: 'br_new_customer',
        name: '新客户授信规则',
        description: '新客户的初始信用额度设定',
        ruleType: 'calculation' as const,
        ruleSubtype: 'calculation' as RuleSubtype,
        condition: '合作年限 < 1年 AND 企业规模 = 大型',
        conditionExpression: 'cooperation_years < 1 AND company_scale == "大型"',
        action: '初始信用额度 = 50万元',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { initialLimit: 500000, autoApprove: true },
          actionDescription: '自动设定初始信用额度'
        },
        priority: 2,
        trigger: { triggerType: 'event', triggerEvent: 'new_customer_onboard' },
        applicableEntities: ['de_customer'],
        enabled: true,
        relatedBehaviors: ['bh_adjust_limit'],
        tags: ['新客户', '授信', '计算']
      },
      {
        id: 'br_high_risk',
        name: '高风险客户预警规则',
        description: '识别高风险客户',
        ruleType: 'validation' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '逾期率 > 10% OR 坏账金额 > 10万',
        conditionExpression: 'overdue_rate > 0.1 OR bad_debt > 100000',
        action: '列入高风险名单，现款现货',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { addToBlacklist: true, requireCashPayment: true },
          actionDescription: '标记高风险并要求现款现货'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 0.1 },
        applicableEntities: ['de_customer', 'de_ar'],
        riskLevel: 'critical',
        enabled: true,
        relatedBehaviors: ['bh_calc_credit'],
        tags: ['高风险', '预警', '风险']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_credit_assess',
        name: '信用评估流程',
        description: '定期客户信用评估流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '数据采集', description: '收集客户交易数据', nodeType: 'system', order: 2, referencedEntityId: 'de_customer', entityType: 'dataEntity' },
          { nodeId: 'node2', nodeName: '评分计算', description: '运行信用评分模型', nodeType: 'system', order: 3, referencedEntityId: 'bh_calc_credit', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '风险检查', description: '检查是否为高风险客户', nodeType: 'decision', order: 4, referencedEntityId: 'br_high_risk', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '高风险', condition: '逾期率>10%', conditionExpression: 'overdue_rate>0.1', targetStepId: 'node6', isDefault: false }, { branchId: 'b2', branchName: '正常', condition: '其他情况', conditionExpression: 'true', targetStepId: 'node4', isDefault: true }] },
          { nodeId: 'node4', nodeName: '等级评定', description: '确定信用等级', nodeType: 'human', order: 5, referencedEntityId: 'br_credit_adjust', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['财务经理'], timeoutMinutes: 1440 } },
          { nodeId: 'node5', nodeName: '额度调整', description: '调整信用额度', nodeType: 'system', order: 6, referencedEntityId: 'bh_adjust_limit', entityType: 'behavior' },
          { nodeId: 'node6', nodeName: '风险处理', description: '高风险客户处理', nodeType: 'human', order: 7, referencedEntityId: 'br_high_risk', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['财务总监'], timeoutMinutes: 240 } },
          { nodeId: 'node7', nodeName: '通知客户', description: '发送评估结果', nodeType: 'system', order: 8 },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 9 }
        ],
        trigger: '每季度首月1日',
        triggers: [{ type: 'schedule', scheduleExpression: '0 0 1 1,4,7,10 *', description: '每季度首月1日执行' }],
        result: '更新客户信用档案',
        resultDefinition: { successCriteria: '所有客户信用评估完成', outputEntities: ['de_customer'], failureHandling: '记录异常并重新评估' },
        relatedNodes: ['de_customer', 'de_ar', 'bh_calc_credit', 'br_credit_adjust', 'bh_adjust_limit'],
        enabled: true,
        monitoringConfig: { slaMinutes: 2880, alertThreshold: 0.95, keyMetrics: ['评估覆盖率', '风险识别率'] },
        tags: ['信用', '评估', '季度']
      }
    ],
    relationships: [
      { from: 'bh_calc_credit', to: 'de_customer', type: 'uses', description: '读取客户信息' },
      { from: 'bh_calc_credit', to: 'de_ar', type: 'uses', description: '读取应收款' },
      { from: 'bh_calc_credit', to: 'de_transaction', type: 'uses', description: '读取交易' },
      { from: 'bh_adjust_limit', to: 'de_customer', type: 'uses', description: '更新额度' },
      { from: 'bh_adjust_limit', to: 'de_ar', type: 'uses', description: '参考应收款' },
      { from: 'br_credit_adjust', to: 'de_customer', type: 'triggers', description: '监控客户' },
      { from: 'br_credit_adjust', to: 'de_ar', type: 'triggers', description: '监控应收款' },
      { from: 'br_credit_adjust', to: 'bh_calc_credit', type: 'triggers', description: '基于评分' },
      { from: 'br_credit_adjust', to: 'bh_adjust_limit', type: 'triggers', description: '触发调整' },
      { from: 'br_new_customer', to: 'de_customer', type: 'triggers', description: '监控新客户' },
      { from: 'br_new_customer', to: 'bh_adjust_limit', type: 'triggers', description: '触发授信' },
      { from: 'br_high_risk', to: 'de_customer', type: 'triggers', description: '监控客户' },
      { from: 'br_high_risk', to: 'de_ar', type: 'triggers', description: '监控逾期' },
      { from: 'br_high_risk', to: 'bh_calc_credit', type: 'triggers', description: '触发评估' },
      { from: 'bp_credit_assess', to: 'de_customer', type: 'uses', description: '使用客户数据' },
      { from: 'bp_credit_assess', to: 'de_ar', type: 'uses', description: '使用应收款' },
      { from: 'bp_credit_assess', to: 'bh_calc_credit', type: 'implements', description: '实现评估' },
      { from: 'bp_credit_assess', to: 'bh_adjust_limit', type: 'implements', description: '实现调整' },
      { from: 'bp_credit_assess', to: 'br_credit_adjust', type: 'implements', description: '实现评级调整' },
      { from: 'bp_credit_assess', to: 'br_high_risk', type: 'implements', description: '实现风险检查' },
      { from: 'bp_credit_assess', to: 'br_new_customer', type: 'implements', description: '实现新客户授信' }
    ]
  },
  // 更多业务释义...
  {
    id: 'sem_quality',
    code: 'QUALITY_TRACEABILITY',
    name: '质量异常追溯与处理',
    englishName: 'Quality Traceability & Handling',
    description: '快速追溯质量问题源头，协调产销部门制定处理方案',
    category: 'quality',
    dataEntities: [
      {
        id: 'de_qc_record',
        name: '质量检测记录',
        description: '生产过程中的质量检测数据',
        entityType: 'businessObject' as EntityType,
        subtype: 'quality_record',
        fields: [
          { name: 'inspect_id', dataType: 'string', required: true, description: '检测ID' },
          { name: 'batch_no', dataType: 'string', required: true, description: '批次号' },
          { name: 'inspect_item', dataType: 'string', required: true, description: '检测项目' },
          { name: 'standard_value', dataType: 'number', required: true, description: '标准值' },
          { name: 'actual_value', dataType: 'number', required: true, description: '实测值' },
          { name: 'judgement', dataType: 'string', required: true, description: '判定结果' }
        ],
        relations: [
          { targetEntityId: 'de_batch_trace', relationType: 'references', description: '关联批次追溯' },
          { targetEntityId: 'de_defect', relationType: 'triggers', description: '触发不良品记录' }
        ],
        lifecycleStates: ['pending', 'passed', 'failed', 'reinspected'],
        currentState: 'passed',
        source: 'QMS系统',
        updateFrequency: '实时',
        relatedEntities: ['de_batch_trace', 'de_defect'],
        businessCode: 'QC_RECORD',
        owner: '质量部',
        tags: ['质量', '检测', '记录']
      },
      {
        id: 'de_batch_trace',
        name: '生产批次追溯',
        description: '产品生产全过程追溯信息',
        entityType: 'businessObject' as EntityType,
        subtype: 'traceability_record',
        fields: [
          { name: 'batch_no', dataType: 'string', required: true, description: '批次号' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'raw_material_batch', dataType: 'string', required: true, description: '原料批次' },
          { name: 'equipment_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'operator_id', dataType: 'string', required: true, description: '操作员工号' },
          { name: 'process_params', dataType: 'object', required: true, description: '工艺参数' }
        ],
        relations: [
          { targetEntityId: 'de_qc_record', relationType: 'references', description: '关联检测记录' }
        ],
        lifecycleStates: ['producing', 'qc_pending', 'released', 'isolated', 'recalled'],
        currentState: 'released',
        source: 'MES系统',
        updateFrequency: '实时',
        relatedEntities: ['de_qc_record'],
        businessCode: 'BATCH_TRACE',
        owner: '生产部',
        tags: ['批次', '追溯', 'MES']
      },
      {
        id: 'de_defect',
        name: '不良品记录',
        description: '不合格品处理记录',
        entityType: 'eventObject' as EntityType,
        subtype: 'defect_record',
        fields: [
          { name: 'defect_id', dataType: 'string', required: true, description: '不良品ID' },
          { name: 'batch_no', dataType: 'string', required: true, description: '批次号' },
          { name: 'defect_type', dataType: 'string', required: true, description: '不良类型' },
          { name: 'defect_reason', dataType: 'string', required: true, description: '不良原因' },
          { name: 'disposal_method', dataType: 'string', required: true, description: '处置方式' }
        ],
        relations: [
          { targetEntityId: 'de_qc_record', relationType: 'derived_from', description: '从检测记录派生' }
        ],
        lifecycleStates: ['reported', 'analyzing', 'processing', 'closed'],
        currentState: 'reported',
        source: 'QMS系统',
        updateFrequency: '实时',
        relatedEntities: ['de_qc_record'],
        businessCode: 'DEFECT_REC',
        owner: '质量部',
        tags: ['不良品', '事件', '处理']
      }
    ],
    behaviors: [
      {
        id: 'bh_gen_trace_report',
        name: '生成质量追溯报告',
        description: '追溯问题产品的全流程信息',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'analyze',
        inputParams: [
          { name: 'batch_no', dataType: 'string', required: true, description: '批次号' }
        ],
        outputParams: [
          { name: 'trace_report', dataType: 'object', required: true, description: '追溯报告' }
        ],
        impactedEntities: [
          { entityId: 'de_batch_trace', impactType: 'read', description: '读取批次信息' },
          { entityId: 'de_qc_record', impactType: 'read', description: '读取检测记录' }
        ],
        relatedDataEntities: ['de_batch_trace', 'de_qc_record'],
        requiredRoles: ['质量工程师'],
        enableAudit: true,
        tags: ['追溯', '分析', '报告']
      },
      {
        id: 'bh_create_ticket',
        name: '创建异常处理单',
        description: '发起质量异常处理流程',
        actionType: 'crud' as ActionType,
        crudOperation: 'create',
        inputParams: [
          { name: 'defect_info', dataType: 'object', required: true, description: '不良信息' }
        ],
        outputParams: [
          { name: 'ticket_id', dataType: 'string', required: true, description: '异常单号' }
        ],
        impactedEntities: [
          { entityId: 'de_defect', impactType: 'write', description: '创建不良品记录' }
        ],
        relatedDataEntities: ['de_defect'],
        requiredRoles: ['质检员', '质量工程师'],
        enableAudit: true,
        tags: ['异常', '工单', '创建']
      }
    ],
    businessRules: [
      {
        id: 'br_quality_alert',
        name: '质量警报规则',
        description: '质量异常自动警报',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: '不良率 > 5% 或 严重缺陷数 > 0',
        conditionExpression: 'defect_rate > 0.05 OR critical_defect_count > 0',
        action: '触发质量警报，停线检查',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { alertLevel: 'critical', stopLine: true, notifyChannels: ['sms', 'call'] },
          actionDescription: '触发质量警报并停线'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 0.05 },
        applicableEntities: ['de_qc_record'],
        thresholdConfig: { warningThreshold: 0.03, criticalThreshold: 0.05 },
        enabled: true,
        relatedBehaviors: ['bh_gen_trace_report'],
        tags: ['质量', '警报', '停线']
      },
      {
        id: 'br_batch_isolation',
        name: '批次隔离规则',
        description: '问题批次自动隔离',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '判定结果 = 不合格',
        conditionExpression: 'judgement == "不合格"',
        action: '自动冻结库存，禁止出货',
        ruleAction: {
          actionType: 'block',
          actionConfig: { freezeInventory: true, blockShipment: true },
          actionDescription: '冻结库存并阻止出货'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'qc_failed' },
        applicableEntities: ['de_batch_trace'],
        enabled: true,
        relatedBehaviors: ['bh_create_ticket'],
        tags: ['隔离', '冻结', '约束']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_quality_handle',
        name: '质量异常处理流程',
        description: '从发现到关闭的完整处理流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '异常发现', description: '发现质量异常', nodeType: 'system', order: 2, referencedEntityId: 'de_qc_record', entityType: 'dataEntity' },
          { nodeId: 'decision1', nodeName: '严重度评估', description: '评估问题严重度', nodeType: 'decision', order: 3, referencedEntityId: 'br_quality_alert', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '严重', condition: '不良率>5%', conditionExpression: 'defect_rate>0.05', targetStepId: 'node6', isDefault: false }, { branchId: 'b2', branchName: '一般', condition: '其他情况', conditionExpression: 'true', targetStepId: 'node3', isDefault: true }] },
          { nodeId: 'node3', nodeName: '原因分析', description: '分析根本原因', nodeType: 'human', order: 4, referencedEntityId: 'bh_gen_trace_report', entityType: 'behavior', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['质量工程师'], timeoutMinutes: 240 } },
          { nodeId: 'node4', nodeName: '影响评估', description: '评估影响范围', nodeType: 'system', order: 5, referencedEntityId: 'de_batch_trace', entityType: 'dataEntity' },
          { nodeId: 'node5', nodeName: '处置决策', description: '确定处置方案', nodeType: 'human', order: 6, referencedEntityId: 'br_batch_isolation', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['质量经理'], timeoutMinutes: 120 } },
          { nodeId: 'node6', nodeName: '紧急停线', description: '紧急停线处理', nodeType: 'human', order: 7, referencedEntityId: 'br_quality_alert', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['生产经理', '质量经理'], timeoutMinutes: 30 } },
          { nodeId: 'node7', nodeName: '纠正预防', description: '实施纠正预防措施', nodeType: 'system', order: 8, referencedEntityId: 'bh_create_ticket', entityType: 'behavior' },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 9 }
        ],
        trigger: '检测出质量异常',
        triggers: [{ type: 'event', eventName: 'qc_failed', eventSource: 'de_qc_record', description: '质量检测不合格时触发' }],
        result: '异常关闭，措施落实',
        resultDefinition: { successCriteria: '所有措施已实施并验证有效', outputEntities: ['de_defect'], failureHandling: '升级至质量总监' },
        relatedNodes: ['de_qc_record', 'de_batch_trace', 'bh_gen_trace_report', 'br_quality_alert'],
        enabled: true,
        monitoringConfig: { slaMinutes: 480, alertThreshold: 0.95, keyMetrics: ['响应时间', '处理周期'] },
        tags: ['质量', '异常', 'CAPA']
      }
    ],
    relationships: [
      { from: 'bh_gen_trace_report', to: 'de_batch_trace', type: 'uses', description: '读取批次' },
      { from: 'bh_gen_trace_report', to: 'de_qc_record', type: 'uses', description: '读取检测' },
      { from: 'bh_gen_trace_report', to: 'de_defect', type: 'uses', description: '使用不良记录' },
      { from: 'bh_create_ticket', to: 'de_defect', type: 'uses', description: '记录不良' },
      { from: 'bh_create_ticket', to: 'de_qc_record', type: 'uses', description: '使用检测数据' },
      { from: 'br_quality_alert', to: 'de_qc_record', type: 'triggers', description: '监控检测' },
      { from: 'br_quality_alert', to: 'de_defect', type: 'triggers', description: '监控不良' },
      { from: 'br_quality_alert', to: 'bh_gen_trace_report', type: 'triggers', description: '触发追溯' },
      { from: 'br_batch_isolation', to: 'de_batch_trace', type: 'triggers', description: '冻结批次' },
      { from: 'br_batch_isolation', to: 'de_qc_record', type: 'triggers', description: '监控检测' },
      { from: 'br_batch_isolation', to: 'bh_create_ticket', type: 'triggers', description: '触发工单' },
      { from: 'bp_quality_handle', to: 'de_qc_record', type: 'uses', description: '使用检测数据' },
      { from: 'bp_quality_handle', to: 'de_batch_trace', type: 'uses', description: '使用批次数据' },
      { from: 'bp_quality_handle', to: 'de_defect', type: 'uses', description: '使用不良记录' },
      { from: 'bp_quality_handle', to: 'bh_gen_trace_report', type: 'implements', description: '实现追溯' },
      { from: 'bp_quality_handle', to: 'bh_create_ticket', type: 'implements', description: '实现工单创建' },
      { from: 'bp_quality_handle', to: 'br_quality_alert', type: 'implements', description: '实现警报' },
      { from: 'bp_quality_handle', to: 'br_batch_isolation', type: 'implements', description: '实现隔离' }
    ]
  },
  // 生产排程与产能优化
  {
    id: 'sem_production_scheduling',
    code: 'PRODUCTION_SCHEDULING',
    name: '生产排程与产能优化',
    englishName: 'Production Scheduling & Capacity Optimization',
    description: '基于订单优先级和资源约束，生成最优生产排程计划',
    category: 'production',
    dataEntities: [
      {
        id: 'de_work_center',
        name: '工作中心',
        description: '生产车间的工作中心配置信息',
        entityType: 'asset' as EntityType,
        subtype: 'work_center',
        fields: [
          { name: 'wc_id', dataType: 'string', required: true, description: '工作中心编码' },
          { name: 'wc_name', dataType: 'string', required: true, description: '工作中心名称' },
          { name: 'capacity_per_day', dataType: 'number', required: true, description: '日产能' },
          { name: 'efficiency_rate', dataType: 'number', required: true, description: '效率系数' },
          { name: 'shift_count', dataType: 'number', required: true, description: '班次数量' },
          { name: 'status', dataType: 'string', required: true, description: '状态' }
        ],
        relations: [
          { targetEntityId: 'de_equipment', relationType: 'contains', description: '包含设备' }
        ],
        lifecycleStates: ['active', 'maintenance', 'offline'],
        currentState: 'active',
        source: 'MES系统',
        updateFrequency: '实时',
        relatedEntities: ['de_equipment'],
        businessCode: 'WC_MASTER',
        owner: '生产部',
        tags: ['工作中心', '产能', '资产']
      },
      {
        id: 'de_equipment',
        name: '设备主数据',
        description: '生产设备的基础信息和状态',
        entityType: 'asset' as EntityType,
        subtype: 'production_equipment',
        fields: [
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'eq_name', dataType: 'string', required: true, description: '设备名称' },
          { name: 'wc_id', dataType: 'string', required: true, description: '所属工作中心' },
          { name: 'oee', dataType: 'number', required: true, description: '设备综合效率' },
          { name: 'mttr', dataType: 'number', required: true, description: '平均修复时间' },
          { name: 'mtbf', dataType: 'number', required: true, description: '平均故障间隔' }
        ],
        relations: [
          { targetEntityId: 'de_work_center', relationType: 'belongs_to', description: '属于工作中心' }
        ],
        lifecycleStates: ['running', 'idle', 'maintenance', 'breakdown'],
        currentState: 'running',
        source: 'MES系统',
        updateFrequency: '实时',
        relatedEntities: ['de_work_center'],
        businessCode: 'EQ_MASTER',
        owner: '设备部',
        tags: ['设备', 'OEE', '资产']
      },
      {
        id: 'de_production_order',
        name: '生产订单',
        description: '生产任务订单信息',
        entityType: 'businessObject' as EntityType,
        subtype: 'production_order',
        fields: [
          { name: 'po_id', dataType: 'string', required: true, description: '订单号' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'quantity', dataType: 'number', required: true, description: '生产数量' },
          { name: 'priority', dataType: 'string', required: true, description: '优先级' },
          { name: 'due_date', dataType: 'datetime', required: true, description: '交付日期' },
          { name: 'status', dataType: 'string', required: true, description: '订单状态' }
        ],
        relations: [
          { targetEntityId: 'de_work_center', relationType: 'references', description: '分配工作中心' }
        ],
        lifecycleStates: ['released', 'scheduled', 'in_progress', 'completed', 'closed'],
        currentState: 'released',
        source: 'ERP系统',
        updateFrequency: '实时',
        relatedEntities: ['de_work_center'],
        businessCode: 'PO_MASTER',
        owner: '计划部',
        tags: ['生产订单', '工单', '业务对象']
      }
    ],
    behaviors: [
      {
        id: 'bh_schedule_optimize',
        name: '排程优化计算',
        description: '使用算法生成最优生产排程',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_production_order', 'de_work_center'],
          calculationFormula: '遗传算法 + 约束规划',
          triggerCondition: '订单变更或定时触发'
        },
        inputParams: [
          { name: 'orders', dataType: 'array', required: true, description: '待排产订单' },
          { name: 'constraints', dataType: 'object', required: true, description: '约束条件' }
        ],
        outputParams: [
          { name: 'schedule_plan', dataType: 'object', required: true, description: '排程计划' },
          { name: 'utilization', dataType: 'number', required: true, description: '预计利用率' }
        ],
        impactedEntities: [
          { entityId: 'de_production_order', impactType: 'write', description: '更新订单计划时间' },
          { entityId: 'de_work_center', impactType: 'read', description: '读取产能数据' }
        ],
        relatedDataEntities: ['de_production_order', 'de_work_center'],
        requiredRoles: ['计划员'],
        enableAudit: true,
        tags: ['排程', '优化', '算法']
      },
      {
        id: 'bh_capacity_adjust',
        name: '产能调整',
        description: '根据实际情况调整产能配置',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'adjust',
        inputParams: [
          { name: 'wc_id', dataType: 'string', required: true, description: '工作中心编码' },
          { name: 'new_capacity', dataType: 'number', required: true, description: '新产能值' }
        ],
        outputParams: [
          { name: 'old_capacity', dataType: 'number', required: true, description: '原产能值' },
          { name: 'adjust_time', dataType: 'datetime', required: true, description: '调整时间' }
        ],
        impactedEntities: [
          { entityId: 'de_work_center', impactType: 'write', description: '更新产能配置' }
        ],
        relatedDataEntities: ['de_work_center'],
        requiredRoles: ['生产经理', '计划经理'],
        enableAudit: true,
        tags: ['产能', '调整', '配置']
      }
    ],
    businessRules: [
      {
        id: 'br_oee_threshold',
        name: 'OEE阈值预警规则',
        description: '设备OEE低于阈值时预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: 'OEE < 85%',
        conditionExpression: 'oee < 0.85',
        action: '发送OEE预警，建议设备维护',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { alertChannels: ['email', 'app'], notifyRoles: ['设备工程师'] },
          actionDescription: 'OEE预警通知'
        },
        priority: 2,
        trigger: { triggerType: 'threshold', thresholdValue: 0.85 },
        applicableEntities: ['de_equipment'],
        thresholdConfig: { warningThreshold: 0.85, criticalThreshold: 0.75 },
        enabled: true,
        relatedBehaviors: ['bh_capacity_adjust'],
        tags: ['OEE', '预警', '设备']
      },
      {
        id: 'br_delivery_constraint',
        name: '交付期约束规则',
        description: '确保订单在交付期内完成',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '计划完成日期 > 交付日期',
        conditionExpression: 'planned_end > due_date',
        action: '标记延期风险，触发 expedite 流程',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { escalateTo: '生产经理', createActionItem: true },
          actionDescription: '延期风险预警'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'schedule_generated' },
        applicableEntities: ['de_production_order'],
        enabled: true,
        relatedBehaviors: ['bh_schedule_optimize'],
        tags: ['交付', '约束', '延期']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_daily_scheduling',
        name: '日排程流程',
        description: '每日生产排程制定与发布',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '订单收集', description: '收集待排产订单', nodeType: 'system', order: 2, referencedEntityId: 'de_production_order', entityType: 'dataEntity' },
          { nodeId: 'node2', nodeName: '产能检查', description: '检查可用产能', nodeType: 'system', order: 3, referencedEntityId: 'de_work_center', entityType: 'dataEntity' },
          { nodeId: 'node3', nodeName: '排程计算', description: '运行排程优化算法', nodeType: 'system', order: 4, referencedEntityId: 'bh_schedule_optimize', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '约束检查', description: '检查是否满足约束', nodeType: 'decision', order: 5, referencedEntityId: 'br_delivery_constraint', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '满足', condition: '无延期风险', conditionExpression: 'no_delay', targetStepId: 'node5', isDefault: false }, { branchId: 'b2', branchName: '不满足', condition: '有延期风险', conditionExpression: 'has_delay', targetStepId: 'node4', isDefault: true }] },
          { nodeId: 'node4', nodeName: '人工调整', description: '人工干预排程', nodeType: 'human', order: 6, humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['计划主管'], timeoutMinutes: 60 } },
          { nodeId: 'node5', nodeName: '计划发布', description: '发布日排程计划', nodeType: 'system', order: 7 },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 8 }
        ],
        trigger: '每日凌晨',
        triggers: [{ type: 'schedule', scheduleExpression: '0 2 * * *', description: '每日凌晨2点执行' }],
        result: '发布日排程计划',
        resultDefinition: { successCriteria: '所有订单已排产', outputEntities: ['de_production_order'], failureHandling: '标记未排产订单' },
        relatedNodes: ['de_production_order', 'de_work_center', 'bh_schedule_optimize'],
        enabled: true,
        monitoringConfig: { slaMinutes: 60, alertThreshold: 0.98, keyMetrics: ['排程完成率', '设备利用率'] },
        tags: ['排程', '日常', '自动化']
      }
    ],
    relationships: [
      { from: 'bh_schedule_optimize', to: 'de_production_order', type: 'uses', description: '读取订单' },
      { from: 'bh_schedule_optimize', to: 'de_work_center', type: 'uses', description: '读取产能' },
      { from: 'bh_schedule_optimize', to: 'de_equipment', type: 'uses', description: '读取设备' },
      { from: 'bh_capacity_adjust', to: 'de_work_center', type: 'uses', description: '调整产能' },
      { from: 'bh_capacity_adjust', to: 'de_equipment', type: 'uses', description: '调整设备' },
      { from: 'br_oee_threshold', to: 'de_equipment', type: 'triggers', description: '监控OEE' },
      { from: 'br_oee_threshold', to: 'bh_capacity_adjust', type: 'triggers', description: '触发调整' },
      { from: 'br_delivery_constraint', to: 'de_production_order', type: 'triggers', description: '检查交付' },
      { from: 'br_delivery_constraint', to: 'bh_schedule_optimize', type: 'triggers', description: '触发排程调整' },
      { from: 'bp_daily_scheduling', to: 'de_production_order', type: 'uses', description: '使用订单' },
      { from: 'bp_daily_scheduling', to: 'de_work_center', type: 'uses', description: '使用产能' },
      { from: 'bp_daily_scheduling', to: 'bh_schedule_optimize', type: 'implements', description: '实现排程' },
      { from: 'bp_daily_scheduling', to: 'bh_capacity_adjust', type: 'implements', description: '实现调整' },
      { from: 'bp_daily_scheduling', to: 'br_oee_threshold', type: 'implements', description: '实现OEE监控' },
      { from: 'bp_daily_scheduling', to: 'br_delivery_constraint', type: 'implements', description: '实现交付检查' }
    ]
  },
  // 物流交付追踪
  {
    id: 'sem_logistics_tracking',
    code: 'LOGISTICS_TRACKING',
    name: '物流交付追踪',
    englishName: 'Logistics Delivery Tracking',
    description: '跟踪产品在途状态，管理交付时间和物流成本',
    category: 'logistics',
    dataEntities: [
      {
        id: 'de_shipment',
        name: '发货单',
        description: '产品发货信息',
        entityType: 'businessObject' as EntityType,
        subtype: 'shipment_record',
        fields: [
          { name: 'ship_id', dataType: 'string', required: true, description: '发货单号' },
          { name: 'order_id', dataType: 'string', required: true, description: '销售订单号' },
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'ship_date', dataType: 'datetime', required: true, description: '发货日期' },
          { name: 'estimated_arrival', dataType: 'datetime', required: true, description: '预计到达' },
          { name: 'carrier', dataType: 'string', required: true, description: '承运商' },
          { name: 'tracking_no', dataType: 'string', required: true, description: '追踪号' },
          { name: 'status', dataType: 'string', required: true, description: '发货状态' }
        ],
        relations: [
          { targetEntityId: 'de_delivery_event', relationType: 'triggers', description: '触发出货事件' }
        ],
        lifecycleStates: ['created', 'picked', 'shipped', 'in_transit', 'delivered', 'returned'],
        currentState: 'created',
        source: 'TMS系统',
        updateFrequency: '实时',
        relatedEntities: ['de_delivery_event'],
        businessCode: 'SHIP_REC',
        owner: '物流部',
        tags: ['发货', '物流', '业务对象']
      },
      {
        id: 'de_delivery_event',
        name: '交付事件',
        description: '物流过程中的关键事件',
        entityType: 'eventObject' as EntityType,
        subtype: 'logistics_event',
        fields: [
          { name: 'event_id', dataType: 'string', required: true, description: '事件ID' },
          { name: 'ship_id', dataType: 'string', required: true, description: '发货单号' },
          { name: 'event_type', dataType: 'string', required: true, description: '事件类型' },
          { name: 'event_time', dataType: 'datetime', required: true, description: '事件时间' },
          { name: 'location', dataType: 'string', required: true, description: '地点' },
          { name: 'remark', dataType: 'string', required: false, description: '备注' }
        ],
        relations: [
          { targetEntityId: 'de_shipment', relationType: 'belongs_to', description: '属于发货单' }
        ],
        lifecycleStates: ['active', 'processed', 'archived'],
        currentState: 'active',
        source: 'TMS系统',
        updateFrequency: '实时',
        relatedEntities: ['de_shipment'],
        businessCode: 'DELV_EVT',
        owner: '物流部',
        tags: ['物流事件', '追踪', '事件对象']
      },
      {
        id: 'de_carrier',
        name: '承运商档案',
        description: '物流承运商信息和绩效',
        entityType: 'organization' as EntityType,
        subtype: 'logistics_carrier',
        fields: [
          { name: 'carrier_id', dataType: 'string', required: true, description: '承运商编码' },
          { name: 'carrier_name', dataType: 'string', required: true, description: '承运商名称' },
          { name: 'service_type', dataType: 'string', required: true, description: '服务类型' },
          { name: 'ontime_rate', dataType: 'number', required: true, description: '准时率' },
          { name: 'damage_rate', dataType: 'number', required: true, description: '货损率' },
          { name: 'cost_per_km', dataType: 'number', required: true, description: '每公里成本' }
        ],
        relations: [
          { targetEntityId: 'de_shipment', relationType: 'triggers', description: '执行运输' }
        ],
        lifecycleStates: ['active', 'suspended', 'terminated'],
        currentState: 'active',
        source: 'SRM系统',
        updateFrequency: '每月',
        relatedEntities: ['de_shipment'],
        businessCode: 'CARRIER',
        owner: '采购部',
        tags: ['承运商', '物流', '组织']
      }
    ],
    behaviors: [
      {
        id: 'bh_track_shipment',
        name: '物流追踪',
        description: '实时获取物流在途信息',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'analyze',
        inputParams: [
          { name: 'tracking_no', dataType: 'string', required: true, description: '追踪号' },
          { name: 'carrier', dataType: 'string', required: true, description: '承运商' }
        ],
        outputParams: [
          { name: 'current_status', dataType: 'string', required: true, description: '当前状态' },
          { name: 'current_location', dataType: 'string', required: true, description: '当前位置' },
          { name: 'estimated_arrival', dataType: 'datetime', required: true, description: '预计到达' }
        ],
        impactedEntities: [
          { entityId: 'de_shipment', impactType: 'read', description: '读取发货信息' },
          { entityId: 'de_delivery_event', impactType: 'write', description: '记录事件' }
        ],
        relatedDataEntities: ['de_shipment', 'de_carrier'],
        requiredRoles: ['物流专员'],
        enableAudit: true,
        tags: ['追踪', '物流', '分析']
      },
      {
        id: 'bh_carrier_eval',
        name: '承运商评估',
        description: '评估承运商绩效',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_carrier', 'de_shipment'],
          calculationFormula: '综合评分 = f(准时率, 货损率, 成本)',
          triggerCondition: '每月评估'
        },
        inputParams: [
          { name: 'carrier_id', dataType: 'string', required: true, description: '承运商编码' },
          { name: 'eval_period', dataType: 'string', required: true, description: '评估周期' }
        ],
        outputParams: [
          { name: 'score', dataType: 'number', required: true, description: '综合评分' },
          { name: 'ranking', dataType: 'number', required: true, description: '排名' }
        ],
        impactedEntities: [
          { entityId: 'de_carrier', impactType: 'write', description: '更新绩效数据' },
          { entityId: 'de_shipment', impactType: 'read', description: '读取历史记录' }
        ],
        relatedDataEntities: ['de_carrier', 'de_shipment'],
        requiredRoles: ['物流经理'],
        enableAudit: true,
        tags: ['评估', '承运商', '绩效']
      }
    ],
    businessRules: [
      {
        id: 'br_delay_alert',
        name: '交付延迟预警',
        description: '识别即将延迟的交付',
        ruleType: 'validation' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '预计到达 > 承诺日期',
        conditionExpression: 'estimated_arrival > promised_date',
        action: '通知客户和销售人员',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { notifyChannels: ['email', 'sms'], notifyParties: ['客户', '销售'] },
          actionDescription: '延迟预警通知'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'status_update' },
        applicableEntities: ['de_shipment'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_track_shipment'],
        tags: ['延迟', '预警', '风险']
      },
      {
        id: 'br_carrier_select',
        name: '承运商选择规则',
        description: '根据评分自动选择承运商',
        ruleType: 'decision' as const,
        ruleSubtype: 'calculation' as RuleSubtype,
        condition: '紧急订单 AND 高价值货物',
        conditionExpression: 'urgent == true AND value > 100000',
        action: '选择评分最高的承运商',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { autoSelect: true, priorityFactor: 0.8 },
          actionDescription: '自动选择最优承运商'
        },
        priority: 2,
        trigger: { triggerType: 'event', triggerEvent: 'shipment_created' },
        applicableEntities: ['de_shipment', 'de_carrier'],
        enabled: true,
        relatedBehaviors: ['bh_carrier_eval'],
        tags: ['承运商', '选择', '决策']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_delivery_mgmt',
        name: '交付管理流程',
        description: '从发货到签收的完整流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '发货准备', description: '准备发货单', nodeType: 'system', order: 2, referencedEntityId: 'de_shipment', entityType: 'dataEntity' },
          { nodeId: 'node2', nodeName: '承运商分配', description: '分配承运商', nodeType: 'system', order: 3, referencedEntityId: 'br_carrier_select', entityType: 'businessRule' },
          { nodeId: 'node3', nodeName: '货物发出', description: '确认货物发出', nodeType: 'human', order: 4, referencedEntityId: 'de_shipment', entityType: 'dataEntity', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['仓管员'], timeoutMinutes: 30 } },
          { nodeId: 'node4', nodeName: '在途追踪', description: '物流在途跟踪', nodeType: 'system', order: 5, referencedEntityId: 'bh_track_shipment', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '延迟检查', description: '检查是否延迟', nodeType: 'decision', order: 6, referencedEntityId: 'br_delay_alert', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '延迟', condition: '预计延迟', conditionExpression: 'delayed', targetStepId: 'node7', isDefault: false }, { branchId: 'b2', branchName: '正常', condition: '正常', conditionExpression: 'true', targetStepId: 'node6', isDefault: true }] },
          { nodeId: 'node6', nodeName: '客户签收', description: '确认客户签收', nodeType: 'human', order: 7, humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['客户'], timeoutMinutes: 10080 } },
          { nodeId: 'node7', nodeName: '延迟处理', description: '处理延迟情况', nodeType: 'human', order: 8, referencedEntityId: 'br_delay_alert', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['物流经理'], timeoutMinutes: 120 } },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 9 }
        ],
        trigger: '销售订单发货',
        triggers: [{ type: 'event', eventName: 'order_ready_to_ship', eventSource: 'ERP', description: '订单可发货时触发' }],
        result: '交付完成',
        resultDefinition: { successCriteria: '客户已签收', outputEntities: ['de_shipment'], failureHandling: '启动客诉流程' },
        relatedNodes: ['de_shipment', 'de_carrier', 'bh_track_shipment'],
        enabled: true,
        monitoringConfig: { slaMinutes: 10080, alertThreshold: 0.95, keyMetrics: ['准时交付率', '客户满意度'] },
        tags: ['交付', '物流', '追踪']
      }
    ],
    relationships: [
      { from: 'bh_track_shipment', to: 'de_shipment', type: 'uses', description: '读取发货单' },
      { from: 'bh_track_shipment', to: 'de_delivery_event', type: 'uses', description: '读取交付事件' },
      { from: 'bh_track_shipment', to: 'de_carrier', type: 'uses', description: '使用承运商' },
      { from: 'bh_carrier_eval', to: 'de_carrier', type: 'uses', description: '读取承运商' },
      { from: 'bh_carrier_eval', to: 'de_shipment', type: 'uses', description: '读取发货历史' },
      { from: 'br_delay_alert', to: 'de_shipment', type: 'triggers', description: '监控交付' },
      { from: 'br_delay_alert', to: 'de_delivery_event', type: 'triggers', description: '监控事件' },
      { from: 'br_delay_alert', to: 'bh_track_shipment', type: 'triggers', description: '触发追踪' },
      { from: 'br_carrier_select', to: 'de_carrier', type: 'triggers', description: '选择承运商' },
      { from: 'br_carrier_select', to: 'de_shipment', type: 'triggers', description: '监控发货' },
      { from: 'br_carrier_select', to: 'bh_carrier_eval', type: 'triggers', description: '触发评估' },
      { from: 'bp_delivery_mgmt', to: 'de_shipment', type: 'uses', description: '使用发货单' },
      { from: 'bp_delivery_mgmt', to: 'de_carrier', type: 'uses', description: '使用承运商' },
      { from: 'bp_delivery_mgmt', to: 'de_delivery_event', type: 'uses', description: '使用交付事件' },
      { from: 'bp_delivery_mgmt', to: 'bh_track_shipment', type: 'implements', description: '实现追踪' },
      { from: 'bp_delivery_mgmt', to: 'bh_carrier_eval', type: 'implements', description: '实现评估' },
      { from: 'bp_delivery_mgmt', to: 'br_delay_alert', type: 'implements', description: '实现延迟预警' },
      { from: 'bp_delivery_mgmt', to: 'br_carrier_select', type: 'implements', description: '实现承运商选择' }
    ]
  },
  // 财务成本核算
  {
    id: 'sem_cost_accounting',
    code: 'COST_ACCOUNTING',
    name: '财务成本核算',
    englishName: 'Financial Cost Accounting',
    description: '计算产品成本，分析成本构成，支持定价决策',
    category: 'finance',
    dataEntities: [
      {
        id: 'de_cost_center',
        name: '成本中心',
        description: '成本归集中心',
        entityType: 'organization' as EntityType,
        subtype: 'cost_center',
        fields: [
          { name: 'cc_id', dataType: 'string', required: true, description: '成本中心编码' },
          { name: 'cc_name', dataType: 'string', required: true, description: '成本中心名称' },
          { name: 'cc_type', dataType: 'string', required: true, description: '类型(生产/辅助)' },
          { name: 'manager', dataType: 'string', required: true, description: '负责人' },
          { name: 'budget', dataType: 'number', required: true, description: '年度预算' }
        ],
        relations: [
          { targetEntityId: 'de_cost_item', relationType: 'contains', description: '包含成本项目' }
        ],
        lifecycleStates: ['active', 'frozen', 'closed'],
        currentState: 'active',
        source: '财务系统',
        updateFrequency: '每月',
        relatedEntities: ['de_cost_item'],
        businessCode: 'CC_MASTER',
        owner: '财务部',
        tags: ['成本中心', '财务', '组织']
      },
      {
        id: 'de_cost_item',
        name: '成本项目',
        description: '明细成本数据',
        entityType: 'businessObject' as EntityType,
        subtype: 'cost_transaction',
        fields: [
          { name: 'item_id', dataType: 'string', required: true, description: '项目ID' },
          { name: 'cc_id', dataType: 'string', required: true, description: '成本中心' },
          { name: 'cost_type', dataType: 'string', required: true, description: '成本类型(直接/间接)' },
          { name: 'cost_element', dataType: 'string', required: true, description: '成本要素' },
          { name: 'amount', dataType: 'number', required: true, description: '金额' },
          { name: 'posting_date', dataType: 'datetime', required: true, description: '过账日期' }
        ],
        relations: [
          { targetEntityId: 'de_cost_center', relationType: 'belongs_to', description: '属于成本中心' }
        ],
        lifecycleStates: ['draft', 'posted', 'adjusted', 'closed'],
        currentState: 'posted',
        source: '财务系统',
        updateFrequency: '每日',
        relatedEntities: ['de_cost_center'],
        businessCode: 'COST_ITEM',
        owner: '财务部',
        tags: ['成本', '财务', '业务对象']
      },
      {
        id: 'de_product_cost',
        name: '产品成本',
        description: '产品标准成本和实际成本',
        entityType: 'businessObject' as EntityType,
        subtype: 'product_costing',
        fields: [
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'period', dataType: 'string', required: true, description: '会计期间' },
          { name: 'material_cost', dataType: 'number', required: true, description: '材料成本' },
          { name: 'labor_cost', dataType: 'number', required: true, description: '人工成本' },
          { name: 'overhead_cost', dataType: 'number', required: true, description: '制造费用' },
          { name: 'total_cost', dataType: 'number', required: true, description: '总成本' }
        ],
        relations: [
          { targetEntityId: 'de_cost_item', relationType: 'derived_from', description: '从成本项目汇总' }
        ],
        lifecycleStates: ['estimated', 'standard', 'actual', 'settled'],
        currentState: 'actual',
        source: '财务系统',
        updateFrequency: '每月',
        relatedEntities: ['de_cost_item'],
        businessCode: 'PROD_COST',
        owner: '财务部',
        tags: ['产品成本', '核算', '财务']
      }
    ],
    behaviors: [
      {
        id: 'bh_calc_std_cost',
        name: '标准成本计算',
        description: '计算产品标准成本',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_product_cost', 'de_cost_item'],
          calculationFormula: '标准成本 = BOM成本 + 标准工时 × 标准费率',
          triggerCondition: 'BOM变更或年度更新'
        },
        inputParams: [
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'bom_version', dataType: 'string', required: true, description: 'BOM版本' }
        ],
        outputParams: [
          { name: 'std_cost', dataType: 'object', required: true, description: '标准成本明细' },
          { name: 'variance', dataType: 'number', required: true, description: '与上期差异' }
        ],
        impactedEntities: [
          { entityId: 'de_product_cost', impactType: 'write', description: '更新标准成本' }
        ],
        relatedDataEntities: ['de_product_cost'],
        requiredRoles: ['成本会计'],
        enableAudit: true,
        tags: ['标准成本', '计算', 'BOM']
      },
      {
        id: 'bh_cost_allocation',
        name: '成本分摊',
        description: '将间接成本分摊到产品',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_cost_item', 'de_product_cost'],
          calculationFormula: '分摊成本 = 间接费用 × 分摊系数',
          triggerCondition: '月末结账'
        },
        inputParams: [
          { name: 'cc_id', dataType: 'string', required: true, description: '成本中心' },
          { name: 'allocation_base', dataType: 'string', required: true, description: '分摊基础' }
        ],
        outputParams: [
          { name: 'allocated_cost', dataType: 'number', required: true, description: '分摊金额' },
          { name: 'allocation_rate', dataType: 'number', required: true, description: '分摊率' }
        ],
        impactedEntities: [
          { entityId: 'de_product_cost', impactType: 'write', description: '更新产品成本' },
          { entityId: 'de_cost_item', impactType: 'read', description: '读取成本项目' }
        ],
        relatedDataEntities: ['de_cost_item', 'de_product_cost'],
        requiredRoles: ['成本会计', '财务经理'],
        enableAudit: true,
        tags: ['分摊', '间接费用', '核算']
      }
    ],
    businessRules: [
      {
        id: 'br_cost_variance',
        name: '成本差异预警',
        description: '实际成本与标准成本差异过大时预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: '成本差异率 > 10%',
        conditionExpression: 'ABS(actual - std) / std > 0.1',
        action: '触发成本分析流程',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { notifyCostAccountant: true, createAnalysisTask: true },
          actionDescription: '成本差异预警'
        },
        priority: 2,
        trigger: { triggerType: 'event', triggerEvent: 'cost_settled' },
        applicableEntities: ['de_product_cost'],
        thresholdConfig: { warningThreshold: 0.1, criticalThreshold: 0.2 },
        enabled: true,
        relatedBehaviors: ['bh_calc_std_cost'],
        tags: ['成本', '差异', '预警']
      },
      {
        id: 'br_budget_control',
        name: '预算控制规则',
        description: '成本支出超预算时控制',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '累计支出 > 预算',
        conditionExpression: 'ytd_actual > budget',
        action: '暂停支出审批',
        ruleAction: {
          actionType: 'block',
          actionConfig: { blockPosting: true, requireApproval: 'CFO' },
          actionDescription: '超预算拦截'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'cost_posting' },
        applicableEntities: ['de_cost_center'],
        enabled: true,
        relatedBehaviors: ['bh_cost_allocation'],
        tags: ['预算', '控制', '约束']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_monthly_closing',
        name: '月末成本结账',
        description: '月度成本核算与结账流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '数据收集', description: '收集所有成本数据', nodeType: 'system', order: 2, referencedEntityId: 'de_cost_item', entityType: 'dataEntity' },
          { nodeId: 'node2', nodeName: '成本分摊', description: '执行间接成本分摊', nodeType: 'system', order: 3, referencedEntityId: 'bh_cost_allocation', entityType: 'behavior' },
          { nodeId: 'node3', nodeName: '标准成本更新', description: '更新标准成本', nodeType: 'system', order: 4, referencedEntityId: 'bh_calc_std_cost', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '差异检查', description: '检查成本差异', nodeType: 'decision', order: 5, referencedEntityId: 'br_cost_variance', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '差异大', condition: '差异>10%', conditionExpression: 'variance>0.1', targetStepId: 'node6', isDefault: false }, { branchId: 'b2', branchName: '正常', condition: '正常范围', conditionExpression: 'true', targetStepId: 'node7', isDefault: true }] },
          { nodeId: 'node6', nodeName: '差异分析', description: '分析成本差异原因', nodeType: 'human', order: 6, referencedEntityId: 'br_cost_variance', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['成本会计'], timeoutMinutes: 1440 } },
          { nodeId: 'node7', nodeName: '财务审核', description: '财务经理审核', nodeType: 'human', order: 7, humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['财务经理'], timeoutMinutes: 720 } },
          { nodeId: 'node8', nodeName: '结账确认', description: '确认月末结账', nodeType: 'system', order: 8 },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 9 }
        ],
        trigger: '每月末',
        triggers: [{ type: 'schedule', scheduleExpression: '0 0 1 * *', description: '每月1日执行' }],
        result: '成本结账完成',
        resultDefinition: { successCriteria: '所有成本已分配并审核', outputEntities: ['de_product_cost'], failureHandling: '回滚并重新处理' },
        relatedNodes: ['de_cost_center', 'de_cost_item', 'de_product_cost'],
        enabled: true,
        monitoringConfig: { slaMinutes: 2880, alertThreshold: 0.99, keyMetrics: ['结账及时率', '差异处理率'] },
        tags: ['结账', '月末', '核算']
      }
    ],
    relationships: [
      { from: 'bh_calc_std_cost', to: 'de_product_cost', type: 'uses', description: '读取产品成本' },
      { from: 'bh_calc_std_cost', to: 'de_cost_item', type: 'uses', description: '读取成本项目' },
      { from: 'bh_calc_std_cost', to: 'de_cost_center', type: 'uses', description: '读取成本中心' },
      { from: 'bh_cost_allocation', to: 'de_cost_item', type: 'uses', description: '读取成本项目' },
      { from: 'bh_cost_allocation', to: 'de_cost_center', type: 'uses', description: '读取成本中心' },
      { from: 'bh_cost_allocation', to: 'de_product_cost', type: 'uses', description: '更新产品成本' },
      { from: 'br_cost_variance', to: 'de_product_cost', type: 'triggers', description: '监控差异' },
      { from: 'br_cost_variance', to: 'bh_calc_std_cost', type: 'triggers', description: '触发成本计算' },
      { from: 'br_budget_control', to: 'de_cost_center', type: 'triggers', description: '控制预算' },
      { from: 'br_budget_control', to: 'de_cost_item', type: 'triggers', description: '监控支出' },
      { from: 'br_budget_control', to: 'bh_cost_allocation', type: 'triggers', description: '触发分摊检查' },
      { from: 'bp_monthly_closing', to: 'de_cost_center', type: 'uses', description: '使用成本中心' },
      { from: 'bp_monthly_closing', to: 'de_cost_item', type: 'uses', description: '使用成本项目' },
      { from: 'bp_monthly_closing', to: 'de_product_cost', type: 'uses', description: '使用产品成本' },
      { from: 'bp_monthly_closing', to: 'bh_calc_std_cost', type: 'implements', description: '实现成本计算' },
      { from: 'bp_monthly_closing', to: 'bh_cost_allocation', type: 'implements', description: '实现分摊' },
      { from: 'bp_monthly_closing', to: 'br_cost_variance', type: 'implements', description: '实现差异检查' },
      { from: 'bp_monthly_closing', to: 'br_budget_control', type: 'implements', description: '实现预算控制' }
    ]
  },
  // 需求计划与MRP
  {
    id: 'sem_demand_planning',
    code: 'DEMAND_PLANNING',
    name: '需求计划与MRP',
    englishName: 'Demand Planning & MRP',
    description: '基于销售预测和订单，计算物料需求计划',
    category: 'planning',
    dataEntities: [
      {
        id: 'de_demand_plan',
        name: '需求计划',
        description: '销售需求计划',
        entityType: 'businessObject' as EntityType,
        subtype: 'demand_forecast',
        fields: [
          { name: 'plan_id', dataType: 'string', required: true, description: '计划ID' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'plan_period', dataType: 'string', required: true, description: '计划期间' },
          { name: 'quantity', dataType: 'number', required: true, description: '计划数量' },
          { name: 'plan_type', dataType: 'string', required: true, description: '计划类型(预测/订单)' }
        ],
        relations: [
          { targetEntityId: 'de_mrp_result', relationType: 'triggers', description: '触发MRP计算' }
        ],
        lifecycleStates: ['draft', 'confirmed', 'frozen', 'closed'],
        currentState: 'confirmed',
        source: 'APS系统',
        updateFrequency: '每周',
        relatedEntities: ['de_mrp_result'],
        businessCode: 'DEMAND_PLAN',
        owner: '计划部',
        tags: ['需求', '计划', '预测']
      },
      {
        id: 'de_bom',
        name: '物料清单',
        description: '产品的BOM结构',
        entityType: 'businessObject' as EntityType,
        subtype: 'bom_structure',
        fields: [
          { name: 'bom_id', dataType: 'string', required: true, description: 'BOM编号' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'component_code', dataType: 'string', required: true, description: '组件编码' },
          { name: 'component_qty', dataType: 'number', required: true, description: '组件数量' },
          { name: 'level', dataType: 'number', required: true, description: 'BOM层级' }
        ],
        relations: [
          { targetEntityId: 'de_mrp_result', relationType: 'references', description: '用于MRP展开' }
        ],
        lifecycleStates: ['active', 'obsolete', 'pending'],
        currentState: 'active',
        source: 'PLM系统',
        updateFrequency: '按需',
        relatedEntities: ['de_mrp_result'],
        businessCode: 'BOM',
        owner: '工程部',
        tags: ['BOM', '物料清单', '结构']
      },
      {
        id: 'de_mrp_result',
        name: 'MRP结果',
        description: '物料需求计划计算结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'mrp_output',
        fields: [
          { name: 'mrp_id', dataType: 'string', required: true, description: 'MRP行项目' },
          { name: 'material_code', dataType: 'string', required: true, description: '物料编码' },
          { name: 'req_date', dataType: 'datetime', required: true, description: '需求日期' },
          { name: 'req_qty', dataType: 'number', required: true, description: '需求数量' },
          { name: 'supply_type', dataType: 'string', required: true, description: '供应类型(采购/生产)' }
        ],
        relations: [
          { targetEntityId: 'de_demand_plan', relationType: 'derived_from', description: '从需求计划派生' }
        ],
        lifecycleStates: ['planned', 'released', 'converted'],
        currentState: 'planned',
        source: 'ERP系统',
        updateFrequency: '每日',
        relatedEntities: ['de_demand_plan'],
        businessCode: 'MRP_RESULT',
        owner: '计划部',
        tags: ['MRP', '需求计划', '结果']
      }
    ],
    behaviors: [
      {
        id: 'bh_mrp_calc',
        name: 'MRP计算',
        description: '执行物料需求计划计算',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_demand_plan', 'de_bom', 'de_mrp_result'],
          calculationFormula: '毛需求 = 计划需求 × BOM用量; 净需求 = 毛需求 - 库存 - 在途',
          triggerCondition: '每日夜间或手动触发'
        },
        inputParams: [
          { name: 'plan_horizon', dataType: 'number', required: true, description: '计划展望期(天)' },
          { name: 'plan_version', dataType: 'string', required: true, description: '计划版本' }
        ],
        outputParams: [
          { name: 'mrp_list', dataType: 'array', required: true, description: 'MRP结果清单' },
          { name: 'exception_list', dataType: 'array', required: true, description: '异常清单' }
        ],
        impactedEntities: [
          { entityId: 'de_mrp_result', impactType: 'write', description: '生成MRP结果' },
          { entityId: 'de_demand_plan', impactType: 'read', description: '读取需求计划' },
          { entityId: 'de_bom', impactType: 'read', description: '读取BOM' }
        ],
        relatedDataEntities: ['de_demand_plan', 'de_bom'],
        requiredRoles: ['计划员'],
        enableAudit: true,
        tags: ['MRP', '计算', '需求']
      },
      {
        id: 'bh_plan_adjust',
        name: '计划调整',
        description: '根据实际情况调整需求计划',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'adjust',
        inputParams: [
          { name: 'plan_id', dataType: 'string', required: true, description: '计划ID' },
          { name: 'new_qty', dataType: 'number', required: true, description: '新数量' },
          { name: 'reason', dataType: 'string', required: true, description: '调整原因' }
        ],
        outputParams: [
          { name: 'old_qty', dataType: 'number', required: true, description: '原数量' },
          { name: 'adjust_time', dataType: 'datetime', required: true, description: '调整时间' }
        ],
        impactedEntities: [
          { entityId: 'de_demand_plan', impactType: 'write', description: '更新计划数量' }
        ],
        relatedDataEntities: ['de_demand_plan'],
        requiredRoles: ['计划主管'],
        enableAudit: true,
        tags: ['计划', '调整', '变更']
      }
    ],
    businessRules: [
      {
        id: 'br_shortage_alert',
        name: '物料短缺预警',
        description: '识别物料供应短缺',
        ruleType: 'validation' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '净需求 > 可用供应',
        conditionExpression: 'net_req > available_supply',
        action: '生成短缺清单并通知采购',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { createShortageList: true, notifyBuyers: true },
          actionDescription: '短缺预警通知'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'mrp_completed' },
        applicableEntities: ['de_mrp_result'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_mrp_calc'],
        tags: ['短缺', '预警', '物料']
      },
      {
        id: 'br_plan_freeze',
        name: '计划冻结规则',
        description: '临近生产日期冻结计划变更',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '距离生产日期 < 3天',
        conditionExpression: 'days_to_production < 3',
        action: '禁止计划调整，需走异常流程',
        ruleAction: {
          actionType: 'block',
          actionConfig: { freezePlan: true, requireExceptionApproval: true },
          actionDescription: '冻结计划变更'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'plan_adjust_request' },
        applicableEntities: ['de_demand_plan'],
        enabled: true,
        relatedBehaviors: ['bh_plan_adjust'],
        tags: ['冻结', '约束', '变更']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_demand_to_supply',
        name: '需求转供应流程',
        description: '从需求计划到供应执行',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '需求确认', description: '确认销售需求计划', nodeType: 'human', order: 2, referencedEntityId: 'de_demand_plan', entityType: 'dataEntity', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['销售经理'], timeoutMinutes: 1440 } },
          { nodeId: 'node2', nodeName: 'MRP计算', description: '运行MRP计算', nodeType: 'system', order: 3, referencedEntityId: 'bh_mrp_calc', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '短缺检查', description: '检查物料短缺', nodeType: 'decision', order: 4, referencedEntityId: 'br_shortage_alert', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '有短缺', condition: '存在短缺', conditionExpression: 'has_shortage', targetStepId: 'node5', isDefault: false }, { branchId: 'b2', branchName: '无短缺', condition: '供应充足', conditionExpression: 'true', targetStepId: 'node6', isDefault: true }] },
          { nodeId: 'node5', nodeName: '短缺处理', description: '处理物料短缺', nodeType: 'human', order: 5, referencedEntityId: 'br_shortage_alert', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['计划经理', '采购经理'], timeoutMinutes: 480 } },
          { nodeId: 'node6', nodeName: '计划发布', description: '发布供应计划', nodeType: 'system', order: 6 },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 7 }
        ],
        trigger: '周计划确认',
        triggers: [{ type: 'schedule', scheduleExpression: '0 18 * * 4', description: '每周四18点执行' }],
        result: '供应计划发布',
        resultDefinition: { successCriteria: '所有需求已转化为供应计划', outputEntities: ['de_mrp_result'], failureHandling: '标记例外并升级' },
        relatedNodes: ['de_demand_plan', 'de_mrp_result', 'bh_mrp_calc'],
        enabled: true,
        monitoringConfig: { slaMinutes: 1440, alertThreshold: 0.95, keyMetrics: ['计划达成率', '短缺处理率'] },
        tags: ['需求', '供应', 'MRP']
      }
    ],
    relationships: [
      { from: 'bh_mrp_calc', to: 'de_demand_plan', type: 'uses', description: '读取需求' },
      { from: 'bh_mrp_calc', to: 'de_bom', type: 'uses', description: '读取BOM' },
      { from: 'bh_mrp_calc', to: 'de_mrp_result', type: 'implements', description: '生成MRP结果' },
      { from: 'bh_plan_adjust', to: 'de_demand_plan', type: 'uses', description: '调整计划' },
      { from: 'bh_plan_adjust', to: 'de_mrp_result', type: 'uses', description: '调整MRP结果' },
      { from: 'br_shortage_alert', to: 'de_mrp_result', type: 'triggers', description: '监控短缺' },
      { from: 'br_shortage_alert', to: 'bh_mrp_calc', type: 'triggers', description: '触发MRP重算' },
      { from: 'br_plan_freeze', to: 'de_demand_plan', type: 'triggers', description: '控制变更' },
      { from: 'br_plan_freeze', to: 'bh_plan_adjust', type: 'triggers', description: '触发冻结检查' },
      { from: 'bp_demand_to_supply', to: 'de_demand_plan', type: 'uses', description: '使用需求计划' },
      { from: 'bp_demand_to_supply', to: 'de_bom', type: 'uses', description: '使用BOM' },
      { from: 'bp_demand_to_supply', to: 'de_mrp_result', type: 'uses', description: '使用MRP结果' },
      { from: 'bp_demand_to_supply', to: 'bh_mrp_calc', type: 'implements', description: '实现MRP' },
      { from: 'bp_demand_to_supply', to: 'bh_plan_adjust', type: 'implements', description: '实现计划调整' },
      { from: 'bp_demand_to_supply', to: 'br_shortage_alert', type: 'implements', description: '实现短缺预警' },
      { from: 'bp_demand_to_supply', to: 'br_plan_freeze', type: 'implements', description: '实现冻结控制' }
    ]
  },
  // 客户满意度管理
  {
    id: 'sem_customer_satisfaction',
    code: 'CUSTOMER_SATISFACTION',
    name: '客户满意度管理',
    englishName: 'Customer Satisfaction Management',
    description: '收集和分析客户反馈，监控满意度指标，驱动持续改进',
    category: 'customer',
    dataEntities: [
      {
        id: 'de_satisfaction_survey',
        name: '满意度调研',
        description: '客户满意度调研结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'survey_result',
        fields: [
          { name: 'survey_id', dataType: 'string', required: true, description: '调研ID' },
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'survey_date', dataType: 'datetime', required: true, description: '调研日期' },
          { name: 'overall_score', dataType: 'number', required: true, description: '总体评分' },
          { name: 'nps_score', dataType: 'number', required: true, description: 'NPS评分' },
          { name: 'feedback', dataType: 'string', required: false, description: '客户反馈' }
        ],
        relations: [
          { targetEntityId: 'de_complaint', relationType: 'triggers', description: '触发投诉处理' }
        ],
        lifecycleStates: ['pending', 'completed', 'analyzed'],
        currentState: 'completed',
        source: 'CRM系统',
        updateFrequency: '每月',
        relatedEntities: ['de_complaint'],
        businessCode: 'SAT_SURVEY',
        owner: '客服部',
        tags: ['满意度', '调研', 'NPS']
      },
      {
        id: 'de_complaint',
        name: '客户投诉',
        description: '客户投诉记录',
        entityType: 'eventObject' as EntityType,
        subtype: 'customer_complaint',
        fields: [
          { name: 'complaint_id', dataType: 'string', required: true, description: '投诉编号' },
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'complaint_type', dataType: 'string', required: true, description: '投诉类型' },
          { name: 'severity', dataType: 'string', required: true, description: '严重程度' },
          { name: 'description', dataType: 'string', required: true, description: '投诉描述' },
          { name: 'status', dataType: 'string', required: true, description: '处理状态' }
        ],
        relations: [
          { targetEntityId: 'de_satisfaction_survey', relationType: 'references', description: '关联满意度' }
        ],
        lifecycleStates: ['new', 'assigned', 'processing', 'resolved', 'closed'],
        currentState: 'new',
        source: 'CRM系统',
        updateFrequency: '实时',
        relatedEntities: ['de_satisfaction_survey'],
        businessCode: 'COMPLAINT',
        owner: '客服部',
        tags: ['投诉', '客服', '事件']
      }
    ],
    behaviors: [
      {
        id: 'bh_calc_csat',
        name: '计算满意度指标',
        description: '计算各项满意度指标',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_satisfaction_survey'],
          calculationFormula: 'CSAT = 满意数/总数; NPS = 推荐者% - 贬损者%',
          triggerCondition: '月度统计'
        },
        inputParams: [
          { name: 'period', dataType: 'string', required: true, description: '统计期间' }
        ],
        outputParams: [
          { name: 'csat_score', dataType: 'number', required: true, description: 'CSAT评分' },
          { name: 'nps_score', dataType: 'number', required: true, description: 'NPS评分' },
          { name: 'ces_score', dataType: 'number', required: true, description: 'CES评分' }
        ],
        impactedEntities: [
          { entityId: 'de_satisfaction_survey', impactType: 'read', description: '读取调研数据' }
        ],
        relatedDataEntities: ['de_satisfaction_survey'],
        requiredRoles: ['客服分析师'],
        enableAudit: true,
        tags: ['满意度', '指标', '计算']
      },
      {
        id: 'bh_handle_complaint',
        name: '处理客户投诉',
        description: '处理并跟进客户投诉',
        actionType: 'businessAction' as ActionType,
        businessActionType: 'analyze',
        inputParams: [
          { name: 'complaint_id', dataType: 'string', required: true, description: '投诉编号' }
        ],
        outputParams: [
          { name: 'resolution', dataType: 'string', required: true, description: '解决方案' },
          { name: 'closure_date', dataType: 'datetime', required: true, description: '关闭日期' }
        ],
        impactedEntities: [
          { entityId: 'de_complaint', impactType: 'write', description: '更新投诉状态' }
        ],
        relatedDataEntities: ['de_complaint'],
        requiredRoles: ['客服专员'],
        enableAudit: true,
        tags: ['投诉', '处理', '客服']
      }
    ],
    businessRules: [
      {
        id: 'br_csat_drop',
        name: '满意度下降预警',
        description: '客户满意度下降时预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: 'CSAT评分 < 80分 或 NPS < 30',
        conditionExpression: 'csat < 80 OR nps < 30',
        action: '触发改进流程，通知管理层',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { alertLevel: 'high', notifyManagement: true },
          actionDescription: '满意度预警通知'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'csat_calculated' },
        applicableEntities: ['de_satisfaction_survey'],
        thresholdConfig: { warningThreshold: 85, criticalThreshold: 80 },
        enabled: true,
        relatedBehaviors: ['bh_calc_csat'],
        tags: ['满意度', '预警', 'CSAT']
      },
      {
        id: 'br_complaint_escalation',
        name: '投诉升级规则',
        description: '严重投诉自动升级',
        ruleType: 'decision' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '严重投诉 或 24小时未响应',
        conditionExpression: 'severity == "high" OR hours_pending > 24',
        action: '升级至部门经理',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { escalateTo: 'manager', notifyCustomer: true },
          actionDescription: '投诉自动升级'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'complaint_created' },
        applicableEntities: ['de_complaint'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_handle_complaint'],
        tags: ['投诉', '升级', '风险']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_complaint_handling',
        name: '投诉处理流程',
        description: '从接收到关闭的投诉处理',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '投诉登记', description: '登记投诉信息', nodeType: 'system', order: 2, referencedEntityId: 'de_complaint', entityType: 'dataEntity' },
          { nodeId: 'decision1', nodeName: '严重度判断', description: '判断投诉严重度', nodeType: 'decision', order: 3, referencedEntityId: 'br_complaint_escalation', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '严重', condition: '严重投诉', conditionExpression: 'severity=="high"', targetStepId: 'node5', isDefault: false }, { branchId: 'b2', branchName: '一般', condition: '一般投诉', conditionExpression: 'true', targetStepId: 'node4', isDefault: true }] },
          { nodeId: 'node4', nodeName: '标准处理', description: '标准流程处理', nodeType: 'human', order: 4, referencedEntityId: 'bh_handle_complaint', entityType: 'behavior', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['客服专员'], timeoutMinutes: 480 } },
          { nodeId: 'node5', nodeName: '升级处理', description: '经理介入处理', nodeType: 'human', order: 5, referencedEntityId: 'br_complaint_escalation', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['客服经理'], timeoutMinutes: 240 } },
          { nodeId: 'node6', nodeName: '客户回访', description: '处理结果回访', nodeType: 'system', order: 6 },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 7 }
        ],
        trigger: '客户投诉',
        triggers: [{ type: 'event', eventName: 'complaint_received', eventSource: 'CRM', description: '收到客户投诉时触发' }],
        result: '投诉关闭',
        resultDefinition: { successCriteria: '客户确认问题解决', outputEntities: ['de_complaint'], failureHandling: '升级至总监' },
        relatedNodes: ['de_complaint', 'bh_handle_complaint'],
        enabled: true,
        monitoringConfig: { slaMinutes: 2880, alertThreshold: 0.95, keyMetrics: ['首次响应时间', '解决时长', '满意度'] },
        tags: ['投诉', '客服', '处理']
      }
    ],
    relationships: [
      { from: 'bh_calc_csat', to: 'de_satisfaction_survey', type: 'uses', description: '读取调研' },
      { from: 'bh_calc_csat', to: 'de_complaint', type: 'uses', description: '使用投诉数据' },
      { from: 'bh_handle_complaint', to: 'de_complaint', type: 'uses', description: '处理投诉' },
      { from: 'bh_handle_complaint', to: 'de_satisfaction_survey', type: 'uses', description: '更新满意度' },
      { from: 'br_csat_drop', to: 'de_satisfaction_survey', type: 'triggers', description: '监控满意度' },
      { from: 'br_csat_drop', to: 'bh_calc_csat', type: 'triggers', description: '触发满意度计算' },
      { from: 'br_complaint_escalation', to: 'de_complaint', type: 'triggers', description: '监控投诉' },
      { from: 'br_complaint_escalation', to: 'bh_handle_complaint', type: 'triggers', description: '触发处理' },
      { from: 'bp_complaint_handling', to: 'de_complaint', type: 'uses', description: '使用投诉' },
      { from: 'bp_complaint_handling', to: 'de_satisfaction_survey', type: 'uses', description: '使用调研' },
      { from: 'bp_complaint_handling', to: 'bh_handle_complaint', type: 'implements', description: '实现处理' },
      { from: 'bp_complaint_handling', to: 'bh_calc_csat', type: 'implements', description: '实现满意度计算' },
      { from: 'bp_complaint_handling', to: 'br_complaint_escalation', type: 'implements', description: '实现升级' },
      { from: 'bp_complaint_handling', to: 'br_csat_drop', type: 'implements', description: '实现满意度监控' }
    ]
  },
  // 设备预测性维护
  {
    id: 'sem_equipment_maintenance',
    code: 'EQUIPMENT_MAINTENANCE',
    name: '设备预测性维护',
    englishName: 'Predictive Equipment Maintenance',
    description: '基于设备数据和AI算法，预测故障并提前安排维护',
    category: 'production',
    dataEntities: [
      {
        id: 'de_sensor_data',
        name: '传感器数据',
        description: '设备传感器实时数据',
        entityType: 'businessObject' as EntityType,
        subtype: 'iot_sensor_data',
        fields: [
          { name: 'sensor_id', dataType: 'string', required: true, description: '传感器ID' },
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'metric_type', dataType: 'string', required: true, description: '指标类型' },
          { name: 'metric_value', dataType: 'number', required: true, description: '指标值' },
          { name: 'timestamp', dataType: 'datetime', required: true, description: '时间戳' }
        ],
        relations: [
          { targetEntityId: 'de_maintenance_task', relationType: 'triggers', description: '触发维护任务' }
        ],
        lifecycleStates: ['active', 'archived'],
        currentState: 'active',
        source: 'IoT平台',
        updateFrequency: '实时',
        relatedEntities: ['de_maintenance_task'],
        businessCode: 'SENSOR',
        owner: '设备部',
        tags: ['传感器', 'IoT', '数据']
      },
      {
        id: 'de_maintenance_task',
        name: '维护任务',
        description: '设备维护工单',
        entityType: 'businessObject' as EntityType,
        subtype: 'maintenance_work_order',
        fields: [
          { name: 'task_id', dataType: 'string', required: true, description: '任务编号' },
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'task_type', dataType: 'string', required: true, description: '任务类型' },
          { name: 'priority', dataType: 'string', required: true, description: '优先级' },
          { name: 'scheduled_date', dataType: 'datetime', required: true, description: '计划日期' },
          { name: 'status', dataType: 'string', required: true, description: '任务状态' }
        ],
        relations: [
          { targetEntityId: 'de_sensor_data', relationType: 'references', description: '基于传感器数据' }
        ],
        lifecycleStates: ['planned', 'scheduled', 'in_progress', 'completed', 'cancelled'],
        currentState: 'planned',
        source: 'EAM系统',
        updateFrequency: '实时',
        relatedEntities: ['de_sensor_data'],
        businessCode: ' Maint_TASK',
        owner: '设备部',
        tags: ['维护', '工单', '任务']
      },
      {
        id: 'de_failure_prediction',
        name: '故障预测',
        description: 'AI故障预测结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'ai_prediction',
        fields: [
          { name: 'prediction_id', dataType: 'string', required: true, description: '预测ID' },
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'failure_probability', dataType: 'number', required: true, description: '故障概率' },
          { name: 'predicted_failure_time', dataType: 'datetime', required: true, description: '预测故障时间' },
          { name: 'confidence', dataType: 'number', required: true, description: '置信度' }
        ],
        relations: [
          { targetEntityId: 'de_sensor_data', relationType: 'derived_from', description: '从传感器数据派生' }
        ],
        lifecycleStates: ['active', 'confirmed', 'false_positive'],
        currentState: 'active',
        source: 'AI平台',
        updateFrequency: '每小时',
        relatedEntities: ['de_sensor_data'],
        businessCode: 'PREDICTION',
        owner: '数据科学部',
        tags: ['预测', 'AI', '故障']
      }
    ],
    behaviors: [
      {
        id: 'bh_predict_failure',
        name: '预测设备故障',
        description: '使用AI模型预测设备故障',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_sensor_data'],
          calculationFormula: 'LSTM模型分析时间序列数据',
          triggerCondition: '每小时或异常检测'
        },
        inputParams: [
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'time_window', dataType: 'number', required: true, description: '分析时间窗(小时)' }
        ],
        outputParams: [
          { name: 'failure_prob', dataType: 'number', required: true, description: '故障概率' },
          { name: 'time_to_failure', dataType: 'number', required: true, description: '预计故障时间(小时)' },
          { name: 'anomaly_score', dataType: 'number', required: true, description: '异常评分' }
        ],
        impactedEntities: [
          { entityId: 'de_failure_prediction', impactType: 'write', description: '生成预测结果' },
          { entityId: 'de_sensor_data', impactType: 'read', description: '读取传感器数据' }
        ],
        relatedDataEntities: ['de_sensor_data'],
        requiredRoles: ['数据科学家'],
        enableAudit: true,
        tags: ['预测', 'AI', '故障']
      },
      {
        id: 'bh_create_maintenance',
        name: '创建维护任务',
        description: '根据预测结果创建维护工单',
        actionType: 'crud' as ActionType,
        crudOperation: 'create',
        inputParams: [
          { name: 'eq_id', dataType: 'string', required: true, description: '设备编码' },
          { name: 'prediction_id', dataType: 'string', required: true, description: '预测ID' }
        ],
        outputParams: [
          { name: 'task_id', dataType: 'string', required: true, description: '任务编号' },
          { name: 'scheduled_date', dataType: 'datetime', required: true, description: '计划日期' }
        ],
        impactedEntities: [
          { entityId: 'de_maintenance_task', impactType: 'write', description: '创建维护任务' },
          { entityId: 'de_failure_prediction', impactType: 'read', description: '读取预测结果' }
        ],
        relatedDataEntities: ['de_failure_prediction'],
        requiredRoles: ['设备工程师'],
        enableAudit: true,
        tags: ['维护', '工单', '创建']
      }
    ],
    businessRules: [
      {
        id: 'br_failure_risk',
        name: '故障风险预警',
        description: '故障概率过高时预警',
        ruleType: 'validation' as const,
        ruleSubtype: 'risk' as RuleSubtype,
        condition: '故障概率 > 70%',
        conditionExpression: 'failure_prob > 0.7',
        action: '紧急维护预警，准备备件',
        ruleAction: {
          actionType: 'notify',
          actionConfig: { alertLevel: 'critical', prepareSpareParts: true },
          actionDescription: '高风险故障预警'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 0.7 },
        applicableEntities: ['de_failure_prediction'],
        thresholdConfig: { warningThreshold: 0.5, criticalThreshold: 0.7 },
        riskLevel: 'critical',
        enabled: true,
        relatedBehaviors: ['bh_predict_failure'],
        tags: ['故障', '预警', '风险']
      },
      {
        id: 'br_preventive_action',
        name: '预防性维护触发',
        description: '根据预测自动触发维护',
        ruleType: 'decision' as const,
        ruleSubtype: 'calculation' as RuleSubtype,
        condition: '故障概率 > 50% 且 置信度 > 80%',
        conditionExpression: 'failure_prob > 0.5 AND confidence > 0.8',
        action: '自动创建预防性维护任务',
        ruleAction: {
          actionType: 'autoProcess',
          actionConfig: { autoCreateTask: true, priority: 'high' },
          actionDescription: '自动创建维护任务'
        },
        priority: 2,
        trigger: { triggerType: 'event', triggerEvent: 'prediction_completed' },
        applicableEntities: ['de_failure_prediction'],
        enabled: true,
        relatedBehaviors: ['bh_create_maintenance'],
        tags: ['预防', '维护', '自动']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_predictive_maintenance',
        name: '预测性维护流程',
        description: '从监控到维护的完整流程',
        nodes: [
          { nodeId: 'start', nodeName: '开始', description: '流程启动', nodeType: 'start', order: 1 },
          { nodeId: 'node1', nodeName: '数据收集', description: '收集传感器数据', nodeType: 'system', order: 2, referencedEntityId: 'de_sensor_data', entityType: 'dataEntity' },
          { nodeId: 'node2', nodeName: '故障预测', description: 'AI预测分析', nodeType: 'system', order: 3, referencedEntityId: 'bh_predict_failure', entityType: 'behavior' },
          { nodeId: 'decision1', nodeName: '风险评估', description: '评估故障风险', nodeType: 'decision', order: 4, referencedEntityId: 'br_failure_risk', entityType: 'businessRule', conditionalBranches: [{ branchId: 'b1', branchName: '高风险', condition: '概率>70%', conditionExpression: 'prob>0.7', targetStepId: 'node6', isDefault: false }, { branchId: 'b2', branchName: '中风险', condition: '概率>50%', conditionExpression: 'prob>0.5', targetStepId: 'node5', isDefault: false }, { branchId: 'b3', branchName: '正常', condition: '正常', conditionExpression: 'true', targetStepId: 'end', isDefault: true }] },
          { nodeId: 'node5', nodeName: '预防维护', description: '安排预防性维护', nodeType: 'system', order: 5, referencedEntityId: 'br_preventive_action', entityType: 'businessRule' },
          { nodeId: 'node6', nodeName: '紧急维护', description: '紧急维护处理', nodeType: 'human', order: 6, referencedEntityId: 'br_failure_risk', entityType: 'businessRule', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['设备经理'], timeoutMinutes: 120 } },
          { nodeId: 'node7', nodeName: '任务执行', description: '执行维护任务', nodeType: 'human', order: 7, referencedEntityId: 'bh_create_maintenance', entityType: 'behavior', humanMachineConfig: { requiresHumanApproval: true, approverRoles: ['维修工'], timeoutMinutes: 480 } },
          { nodeId: 'end', nodeName: '结束', description: '流程结束', nodeType: 'end', order: 8 }
        ],
        trigger: '定时预测或异常检测',
        triggers: [{ type: 'schedule', scheduleExpression: '0 * * * *', description: '每小时执行' }],
        result: '维护完成',
        resultDefinition: { successCriteria: '设备恢复正常运行', outputEntities: ['de_maintenance_task'], failureHandling: '升级至设备总监' },
        relatedNodes: ['de_sensor_data', 'de_failure_prediction', 'bh_predict_failure'],
        enabled: true,
        monitoringConfig: { slaMinutes: 720, alertThreshold: 0.98, keyMetrics: ['预测准确率', '维护响应时间'] },
        tags: ['预测', '维护', 'AI']
      }
    ],
    relationships: [
      { from: 'bh_predict_failure', to: 'de_sensor_data', type: 'uses', description: '读取传感器' },
      { from: 'bh_predict_failure', to: 'de_failure_prediction', type: 'implements', description: '生成预测' },
      { from: 'bh_create_maintenance', to: 'de_failure_prediction', type: 'uses', description: '读取预测' },
      { from: 'bh_create_maintenance', to: 'de_maintenance_task', type: 'implements', description: '创建维护任务' },
      { from: 'bh_create_maintenance', to: 'de_sensor_data', type: 'uses', description: '参考传感器数据' },
      { from: 'br_failure_risk', to: 'de_failure_prediction', type: 'triggers', description: '监控风险' },
      { from: 'br_failure_risk', to: 'de_sensor_data', type: 'triggers', description: '监控传感器' },
      { from: 'br_failure_risk', to: 'bh_predict_failure', type: 'triggers', description: '触发预测' },
      { from: 'br_preventive_action', to: 'de_failure_prediction', type: 'triggers', description: '触发维护' },
      { from: 'br_preventive_action', to: 'bh_create_maintenance', type: 'triggers', description: '创建任务' },
      { from: 'bp_predictive_maintenance', to: 'de_sensor_data', type: 'uses', description: '使用传感器' },
      { from: 'bp_predictive_maintenance', to: 'de_failure_prediction', type: 'uses', description: '使用预测' },
      { from: 'bp_predictive_maintenance', to: 'de_maintenance_task', type: 'uses', description: '使用维护任务' },
      { from: 'bp_predictive_maintenance', to: 'bh_predict_failure', type: 'implements', description: '实现预测' },
      { from: 'bp_predictive_maintenance', to: 'bh_create_maintenance', type: 'implements', description: '实现任务创建' },
      { from: 'bp_predictive_maintenance', to: 'br_failure_risk', type: 'implements', description: '实现风险监控' },
      { from: 'bp_predictive_maintenance', to: 'br_preventive_action', type: 'implements', description: '实现预防维护' }
    ]
  },

  // ==================== 场景3: 产销匹配协同 ====================
  {
    id: 'sem_demand_forecast',
    code: 'DEMAND_FORECAST',
    name: '需求预测分析',
    englishName: 'Demand Forecast Analysis',
    description: '产销匹配协同场景的第1个子链条：基于历史订单和市场趋势预测未来需求',
    category: 'sales',
    dataEntities: [
      {
        id: 'de_order_history',
        name: '订单历史数据',
        description: '历史销售订单记录',
        entityType: 'businessObject' as EntityType,
        subtype: 'order_record',
        fields: [
          { name: 'order_id', dataType: 'string', required: true, description: '订单号' },
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'quantity', dataType: 'number', required: true, description: '数量' },
          { name: 'order_date', dataType: 'datetime', required: true, description: '订单日期' },
          { name: 'delivery_date', dataType: 'datetime', required: true, description: '交付日期' }
        ],
        relations: [
          { targetEntityId: 'de_customer_profile', relationType: 'references', description: '关联客户' }
        ],
        lifecycleStates: ['active', 'archived'],
        currentState: 'active',
        source: 'ERP系统',
        updateFrequency: '实时',
        relatedEntities: ['de_customer_profile'],
        businessCode: 'ORD_HIST',
        owner: '销售部',
        tags: ['订单', '历史', '销售']
      },
      {
        id: 'de_customer_profile',
        name: '客户档案',
        description: '客户基础信息和分级',
        entityType: 'organization' as EntityType,
        subtype: 'customer',
        fields: [
          { name: 'customer_id', dataType: 'string', required: true, description: '客户编码' },
          { name: 'customer_name', dataType: 'string', required: true, description: '客户名称' },
          { name: 'customer_level', dataType: 'string', required: true, description: '客户等级：A/B/C' },
          { name: 'industry', dataType: 'string', required: true, description: '所属行业' },
          { name: 'credit_limit', dataType: 'number', required: true, description: '信用额度' }
        ],
        relations: [
          { targetEntityId: 'de_order_history', relationType: 'triggers', description: '触发订单分析' }
        ],
        lifecycleStates: ['active', 'suspended'],
        currentState: 'active',
        source: 'CRM系统',
        updateFrequency: '每日',
        relatedEntities: ['de_order_history'],
        businessCode: 'CUST_PROF',
        owner: '销售部',
        tags: ['客户', '档案', 'CRM']
      },
      {
        id: 'de_demand_forecast_result',
        name: '需求预测结果',
        description: '销售需求预测结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'forecast_result',
        fields: [
          { name: 'forecast_id', dataType: 'string', required: true, description: '预测ID' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'forecast_qty', dataType: 'number', required: true, description: '预测数量' },
          { name: 'forecast_month', dataType: 'string', required: true, description: '预测月份' },
          { name: 'confidence', dataType: 'number', required: true, description: '置信度' }
        ],
        relations: [
          { targetEntityId: 'de_order_history', relationType: 'derived_from', description: '从订单派生' }
        ],
        lifecycleStates: ['draft', 'confirmed', 'archived'],
        currentState: 'draft',
        source: 'AI预测引擎',
        updateFrequency: '每月',
        relatedEntities: ['de_order_history'],
        businessCode: 'DEM_FORECAST',
        owner: '计划部',
        tags: ['预测', '需求', 'AI']
      }
    ],
    behaviors: [
      {
        id: 'bh_forecast_demand',
        name: '需求预测计算',
        description: '使用时间序列和ML模型预测需求',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_order_history', 'de_customer_profile'],
          calculationFormula: 'ARIMA + Prophet + XGBoost集成',
          triggerCondition: '每月1日'
        },
        inputParams: [
          { name: 'history_months', dataType: 'number', required: true, description: '历史月数' },
          { name: 'forecast_months', dataType: 'number', required: true, description: '预测月数' }
        ],
        outputParams: [
          { name: 'forecast_results', dataType: 'array', required: true, description: '预测结果列表' },
          { name: 'accuracy_metrics', dataType: 'object', required: true, description: '准确度指标' }
        ],
        impactedEntities: [
          { entityId: 'de_order_history', impactType: 'read', description: '读取历史' },
          { entityId: 'de_demand_forecast_result', impactType: 'write', description: '写入预测' }
        ],
        relatedDataEntities: ['de_order_history', 'de_customer_profile'],
        requiredRoles: ['需求计划员', '数据分析师'],
        enableAudit: true,
        tags: ['预测', '需求', 'AI']
      }
    ],
    businessRules: [
      {
        id: 'br_forecast_accuracy_check',
        name: '预测准确度检查',
        description: '验证预测模型的MAPE是否达标',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: 'MAPE>20%',
        conditionExpression: 'mape > 0.20',
        action: '触发模型重训练',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { notify: '计划经理' },
          actionDescription: '准确度告警'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'forecast_completed' },
        applicableEntities: ['de_demand_forecast_result'],
        enabled: true,
        relatedBehaviors: ['bh_forecast_demand'],
        tags: ['预测', '准确度', '验证']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_demand_planning',
        name: '需求计划流程',
        description: '月度需求预测制定流程',
        processType: 'planning',
        trigger: { type: 'schedule', scheduleExpression: '0 2 1 * *', description: '每月1日凌晨2点' },
        steps: [
          { stepId: 's1', stepName: '数据采集', description: '采集订单历史', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: '需求预测', description: '执行预测模型', order: 2, nodeTypes: ['behavior'] },
          { stepId: 's3', stepName: '结果审核', description: '人工审核预测', order: 3, nodeTypes: ['businessRule'] }
        ],
        result: '需求预测报告',
        resultDefinition: { successCriteria: '预测完成并通过审核', failureHandling: '重新预测' },
        tags: ['需求', '预测', '计划']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_order_history', to: 'de_customer_profile', type: 'belongs_to', description: '订单属于客户' },
      { from: 'de_demand_forecast_result', to: 'de_order_history', type: 'derived_from', description: '预测从订单派生' },
      // 行为与数据实体的关系
      { from: 'bh_forecast_demand', to: 'de_order_history', type: 'uses', description: '使用历史订单' },
      { from: 'bh_forecast_demand', to: 'de_customer_profile', type: 'uses', description: '使用客户信息' },
      { from: 'bh_forecast_demand', to: 'de_demand_forecast_result', type: 'implements', description: '生成预测结果' },
      // 规则与数据实体的关系
      { from: 'br_forecast_accuracy_check', to: 'de_demand_forecast_result', type: 'validates', description: '验证预测准确度' },
      { from: 'br_forecast_accuracy_check', to: 'bh_forecast_demand', type: 'depends_on', description: '依赖预测行为' },
      // 流程与行为/规则的关系
      { from: 'bp_demand_planning', to: 'de_order_history', type: 'uses', description: '流程使用订单数据' },
      { from: 'bp_demand_planning', to: 'bh_forecast_demand', type: 'implements', description: '流程实现预测' },
      { from: 'bp_demand_planning', to: 'br_forecast_accuracy_check', type: 'implements', description: '流程实现结果审核' }
    ]
  },

  // 场景3子链条2: 产能匹配
  {
    id: 'sem_capacity_matching',
    code: 'CAPACITY_MATCHING',
    name: '产能供需匹配',
    englishName: 'Capacity Supply-Demand Matching',
    description: '产销匹配协同场景的第2个子链条：对比需求预测与可用产能，识别缺口',
    category: 'production',
    dataEntities: [
      {
        id: 'de_production_capacity',
        name: '生产能力数据',
        description: '各产线月度生产能力',
        entityType: 'asset' as EntityType,
        subtype: 'capacity_plan',
        fields: [
          { name: 'capacity_id', dataType: 'string', required: true, description: '产能ID' },
          { name: 'line_id', dataType: 'string', required: true, description: '产线编码' },
          { name: 'month', dataType: 'string', required: true, description: '月份' },
          { name: 'max_capacity', dataType: 'number', required: true, description: '最大产能' },
          { name: 'committed_capacity', dataType: 'number', required: true, description: '已承诺产能' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'confirmed'],
        currentState: 'confirmed',
        source: 'MES系统',
        updateFrequency: '每周',
        relatedEntities: [],
        businessCode: 'PROD_CAP',
        owner: '生产部',
        tags: ['产能', '生产', '计划']
      },
      {
        id: 'de_capacity_gap',
        name: '产能缺口分析',
        description: '需求与产能的缺口分析结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'gap_analysis',
        fields: [
          { name: 'gap_id', dataType: 'string', required: true, description: '缺口ID' },
          { name: 'product_model', dataType: 'string', required: true, description: '产品型号' },
          { name: 'month', dataType: 'string', required: true, description: '月份' },
          { name: 'demand_qty', dataType: 'number', required: true, description: '需求数量' },
          { name: 'supply_qty', dataType: 'number', required: true, description: '供应数量' },
          { name: 'gap_qty', dataType: 'number', required: true, description: '缺口数量' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'confirmed'],
        currentState: 'draft',
        source: '供需匹配计算',
        updateFrequency: '每日',
        relatedEntities: [],
        businessCode: 'CAP_GAP',
        owner: '计划部',
        tags: ['缺口', '分析', '供需']
      }
    ],
    behaviors: [
      {
        id: 'bh_match_capacity',
        name: '产能供需匹配',
        description: '对比需求和产能，计算缺口',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_demand_forecast_result', 'de_production_capacity'],
          calculationFormula: '缺口 = 需求 - 可用产能',
          triggerCondition: '需求预测更新后'
        },
        inputParams: [
          { name: 'forecast_id', dataType: 'string', required: true, description: '预测ID' }
        ],
        outputParams: [
          { name: 'gap_analysis', dataType: 'array', required: true, description: '缺口分析' },
          { name: 'constraint_violations', dataType: 'array', required: true, description: '约束冲突' }
        ],
        impactedEntities: [
          { entityId: 'de_demand_forecast_result', impactType: 'read', description: '读取预测' },
          { entityId: 'de_production_capacity', impactType: 'read', description: '读取产能' },
          { entityId: 'de_capacity_gap', impactType: 'write', description: '写入缺口' }
        ],
        relatedDataEntities: ['de_demand_forecast_result', 'de_production_capacity'],
        requiredRoles: ['计划员'],
        enableAudit: true,
        tags: ['匹配', '产能', '缺口']
      }
    ],
    businessRules: [
      {
        id: 'br_capacity_shortage',
        name: '产能短缺预警',
        description: '产能缺口超过阈值时预警',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '缺口率>10%',
        conditionExpression: 'gap_rate > 0.10',
        action: '触发产能调整或需求协商',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { notify: '生产经理' },
          actionDescription: '产能短缺告警'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 0.1 },
        applicableEntities: ['de_capacity_gap'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_match_capacity'],
        tags: ['产能', '短缺', '预警']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_sop_process',
        name: 'S&OP产销协同流程',
        description: '销售与运营计划协同流程',
        processType: 'planning',
        trigger: { type: 'schedule', scheduleExpression: '0 9 5 * *', description: '每月5日上午9点' },
        steps: [
          { stepId: 's1', stepName: '需求确认', description: '确认需求预测', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: '产能评估', description: '评估可用产能', order: 2, nodeTypes: ['behavior'] },
          { stepId: 's3', stepName: '缺口分析', description: '计算供需缺口', order: 3, nodeTypes: ['businessRule'] },
          { stepId: 's4', stepName: '协同会议', description: '产销协同会议', order: 4, nodeTypes: ['businessProcess'] }
        ],
        result: '产销协同决议',
        resultDefinition: { successCriteria: '达成产销一致', failureHandling: '升级至总监' },
        tags: ['S&OP', '产销', '协同']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_capacity_gap', to: 'de_production_capacity', type: 'derived_from', description: '缺口从产能数据派生' },
      // 行为与数据实体的关系
      { from: 'bh_match_capacity', to: 'de_production_capacity', type: 'uses', description: '读取产能数据' },
      { from: 'bh_match_capacity', to: 'de_capacity_gap', type: 'implements', description: '生成缺口分析' },
      // 规则与数据实体的关系
      { from: 'br_capacity_shortage', to: 'de_capacity_gap', type: 'triggers', description: '监控产能缺口' },
      { from: 'br_capacity_shortage', to: 'bh_match_capacity', type: 'depends_on', description: '依赖匹配结果' },
      // 流程与行为/规则的关系
      { from: 'bp_sop_process', to: 'de_production_capacity', type: 'uses', description: '流程使用产能数据' },
      { from: 'bp_sop_process', to: 'bh_match_capacity', type: 'implements', description: '流程实现产能评估' },
      { from: 'bp_sop_process', to: 'br_capacity_shortage', type: 'implements', description: '流程实现缺口分析' }
    ]
  },

  // ==================== 场景4: 新项目落地推演分析 ====================
  {
    id: 'sem_new_project_eval',
    code: 'NEW_PROJECT_EVAL',
    name: '新项目投资评估',
    englishName: 'New Project Investment Evaluation',
    description: '新项目落地推演分析场景的第1个子链条：评估新产线投资的经济可行性',
    category: 'finance',
    dataEntities: [
      {
        id: 'de_investment_plan',
        name: '投资计划',
        description: '新产线投资方案',
        entityType: 'businessObject' as EntityType,
        subtype: 'investment_plan',
        fields: [
          { name: 'plan_id', dataType: 'string', required: true, description: '计划ID' },
          { name: 'project_name', dataType: 'string', required: true, description: '项目名称' },
          { name: 'investment_amount', dataType: 'number', required: true, description: '投资金额' },
          { name: 'construction_period', dataType: 'number', required: true, description: '建设周期(月)' },
          { name: 'capacity_after_completion', dataType: 'number', required: true, description: '建成后产能' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'approved', 'rejected'],
        currentState: 'draft',
        source: '战略部',
        updateFrequency: '按需',
        relatedEntities: [],
        businessCode: 'INV_PLAN',
        owner: '战略部',
        tags: ['投资', '计划', '项目']
      },
      {
        id: 'de_financial_projection',
        name: '财务测算',
        description: '项目财务预测数据',
        entityType: 'businessObject' as EntityType,
        subtype: 'financial_model',
        fields: [
          { name: 'projection_id', dataType: 'string', required: true, description: '测算ID' },
          { name: 'year', dataType: 'number', required: true, description: '年份' },
          { name: 'revenue', dataType: 'number', required: true, description: '收入' },
          { name: 'cost', dataType: 'number', required: true, description: '成本' },
          { name: 'profit', dataType: 'number', required: true, description: '利润' },
          { name: 'npv', dataType: 'number', required: true, description: '净现值' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'confirmed'],
        currentState: 'draft',
        source: '财务模型',
        updateFrequency: '按需',
        relatedEntities: [],
        businessCode: 'FIN_PROJ',
        owner: '财务部',
        tags: ['财务', '测算', 'NPV']
      }
    ],
    behaviors: [
      {
        id: 'bh_calculate_npv',
        name: 'NPV财务测算',
        description: '计算项目净现值和投资回报',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_investment_plan'],
          calculationFormula: 'NPV = ∑(CF_t / (1+r)^t)',
          triggerCondition: '投资方案提交'
        },
        inputParams: [
          { name: 'plan_id', dataType: 'string', required: true, description: '投资计划ID' },
          { name: 'discount_rate', dataType: 'number', required: true, description: '折现率' }
        ],
        outputParams: [
          { name: 'npv', dataType: 'number', required: true, description: '净现值' },
          { name: 'irr', dataType: 'number', required: true, description: '内部收益率' },
          { name: 'payback_period', dataType: 'number', required: true, description: '回收期' }
        ],
        impactedEntities: [
          { entityId: 'de_investment_plan', impactType: 'read', description: '读取计划' },
          { entityId: 'de_financial_projection', impactType: 'write', description: '写入测算' }
        ],
        relatedDataEntities: ['de_investment_plan'],
        requiredRoles: ['财务分析师'],
        enableAudit: true,
        tags: ['NPV', '财务', '测算']
      }
    ],
    businessRules: [
      {
        id: 'br_investment_criteria',
        name: '投资标准规则',
        description: '验证项目是否符合投资标准',
        ruleType: 'validation' as const,
        ruleSubtype: 'validation' as RuleSubtype,
        condition: 'NPV<0 或 IRR<10%',
        conditionExpression: 'npv < 0 OR irr < 0.10',
        action: '拒绝投资方案',
        ruleAction: {
          actionType: 'block',
          actionConfig: { reason: '不满足投资回报要求' },
          actionDescription: '阻止投资'
        },
        priority: 1,
        trigger: { triggerType: 'event', triggerEvent: 'calculation_completed' },
        applicableEntities: ['de_financial_projection'],
        enabled: true,
        relatedBehaviors: ['bh_calculate_npv'],
        tags: ['投资', '标准', 'NPV']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_investment_decision',
        name: '投资决策流程',
        description: '新产线投资决策审批流程',
        processType: 'approval',
        trigger: { type: 'manual', initiator: '战略部', description: '投资方案提交' },
        steps: [
          { stepId: 's1', stepName: '财务测算', description: '财务模型计算', order: 1, nodeTypes: ['behavior'] },
          { stepId: 's2', stepName: '标准审核', description: '检查投资标准', order: 2, nodeTypes: ['businessRule'] },
          { stepId: 's3', stepName: '委员会审批', description: '投委会审批', order: 3, nodeTypes: ['businessProcess'] }
        ],
        result: '投资决策',
        resultDefinition: { successCriteria: '获得批准', failureHandling: '修改方案重提' },
        tags: ['投资', '决策', '审批']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_financial_projection', to: 'de_investment_plan', type: 'derived_from', description: '财务测算从投资计划派生' },
      // 行为与数据实体的关系
      { from: 'bh_calculate_npv', to: 'de_investment_plan', type: 'uses', description: '读取投资计划' },
      { from: 'bh_calculate_npv', to: 'de_financial_projection', type: 'implements', description: '生成财务测算' },
      // 规则与数据实体的关系
      { from: 'br_investment_criteria', to: 'de_financial_projection', type: 'validates', description: '验证投资标准' },
      { from: 'br_investment_criteria', to: 'bh_calculate_npv', type: 'depends_on', description: '依赖财务测算' },
      // 流程与行为/规则的关系
      { from: 'bp_investment_decision', to: 'de_investment_plan', type: 'uses', description: '流程使用投资计划' },
      { from: 'bp_investment_decision', to: 'bh_calculate_npv', type: 'implements', description: '流程实现财务测算' },
      { from: 'bp_investment_decision', to: 'br_investment_criteria', type: 'implements', description: '流程实现标准审核' }
    ]
  },

  // ==================== 场景5: 产能评估推演预测分析 ====================
  {
    id: 'sem_capacity_simulation',
    code: 'CAPACITY_SIMULATION',
    name: '产能瓶颈模拟',
    englishName: 'Capacity Bottleneck Simulation',
    description: '产能评估推演预测分析场景的第1个子链条：模拟不同需求情景下的产能瓶颈',
    category: 'planning',
    dataEntities: [
      {
        id: 'de_simulation_scenario',
        name: '模拟情景',
        description: '产能模拟的情景定义',
        entityType: 'businessObject' as EntityType,
        subtype: 'simulation_config',
        fields: [
          { name: 'scenario_id', dataType: 'string', required: true, description: '情景ID' },
          { name: 'scenario_name', dataType: 'string', required: true, description: '情景名称' },
          { name: 'demand_growth_rate', dataType: 'number', required: true, description: '需求增长率' },
          { name: 'time_horizon', dataType: 'number', required: true, description: '时间跨度(月)' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'active'],
        currentState: 'active',
        source: '计划部',
        updateFrequency: '按需',
        relatedEntities: [],
        businessCode: 'SIM_SCEN',
        owner: '计划部',
        tags: ['模拟', '情景', '推演']
      },
      {
        id: 'de_bottleneck_result',
        name: '瓶颈分析结果',
        description: '产能瓶颈识别结果',
        entityType: 'businessObject' as EntityType,
        subtype: 'bottleneck_analysis',
        fields: [
          { name: 'result_id', dataType: 'string', required: true, description: '结果ID' },
          { name: 'scenario_id', dataType: 'string', required: true, description: '情景ID' },
          { name: 'bottleneck_line', dataType: 'string', required: true, description: '瓶颈产线' },
          { name: 'bottleneck_time', dataType: 'string', required: true, description: '瓶颈时段' },
          { name: 'impact_orders', dataType: 'number', required: true, description: '影响订单数' }
        ],
        relations: [],
        lifecycleStates: ['draft', 'confirmed'],
        currentState: 'draft',
        source: '模拟引擎',
        updateFrequency: '每次模拟',
        relatedEntities: [],
        businessCode: 'BOT_RESULT',
        owner: '计划部',
        tags: ['瓶颈', '结果', '分析']
      }
    ],
    behaviors: [
      {
        id: 'bh_run_simulation',
        name: '执行产能模拟',
        description: '使用离散事件仿真模拟产能瓶颈',
        actionType: 'batchCalculation' as ActionType,
        batchConfig: {
          targetEntities: ['de_simulation_scenario', 'de_production_capacity'],
          calculationFormula: 'DES离散事件仿真',
          triggerCondition: '情景定义完成'
        },
        inputParams: [
          { name: 'scenario_id', dataType: 'string', required: true, description: '情景ID' }
        ],
        outputParams: [
          { name: 'utilization_curve', dataType: 'array', required: true, description: '利用率曲线' },
          { name: 'bottleneck_points', dataType: 'array', required: true, description: '瓶颈点' }
        ],
        impactedEntities: [
          { entityId: 'de_simulation_scenario', impactType: 'read', description: '读取情景' },
          { entityId: 'de_production_capacity', impactType: 'read', description: '读取产能' },
          { entityId: 'de_bottleneck_result', impactType: 'write', description: '写入结果' }
        ],
        relatedDataEntities: ['de_simulation_scenario', 'de_production_capacity'],
        requiredRoles: ['计划工程师'],
        enableAudit: true,
        tags: ['模拟', '产能', 'DES']
      }
    ],
    businessRules: [
      {
        id: 'br_bottleneck_alert',
        name: '瓶颈预警规则',
        description: '识别严重产能瓶颈',
        ruleType: 'constraint' as const,
        ruleSubtype: 'constraint' as RuleSubtype,
        condition: '利用率>95% 且 持续时间>1周',
        conditionExpression: 'utilization > 0.95 AND duration_days > 7',
        action: '触发产能扩充评估',
        ruleAction: {
          actionType: 'warn',
          actionConfig: { notify: '生产总监' },
          actionDescription: '严重瓶颈预警'
        },
        priority: 1,
        trigger: { triggerType: 'threshold', thresholdValue: 0.95 },
        applicableEntities: ['de_bottleneck_result'],
        riskLevel: 'high',
        enabled: true,
        relatedBehaviors: ['bh_run_simulation'],
        tags: ['瓶颈', '预警', '产能']
      }
    ],
    businessProcesses: [
      {
        id: 'bp_capacity_evaluation',
        name: '产能评估推演流程',
        description: '产能情景推演分析流程',
        processType: 'simulation',
        trigger: { type: 'manual', initiator: '计划部', description: '季度产能规划' },
        steps: [
          { stepId: 's1', stepName: '定义情景', description: '定义模拟情景', order: 1, nodeTypes: ['dataEntity'] },
          { stepId: 's2', stepName: '运行模拟', description: '执行仿真计算', order: 2, nodeTypes: ['behavior'] },
          { stepId: 's3', stepName: '瓶颈识别', description: '识别产能瓶颈', order: 3, nodeTypes: ['businessRule'] },
          { stepId: 's4', stepName: '方案制定', description: '制定应对方案', order: 4, nodeTypes: ['businessProcess'] }
        ],
        result: '产能评估报告',
        resultDefinition: { successCriteria: '完成推演', failureHandling: '调整情景重算' },
        tags: ['产能', '推演', '模拟']
      }
    ],
    relationships: [
      // 数据实体之间的关系
      { from: 'de_bottleneck_result', to: 'de_simulation_scenario', type: 'derived_from', description: '瓶颈结果从情景派生' },
      // 行为与数据实体的关系
      { from: 'bh_run_simulation', to: 'de_simulation_scenario', type: 'uses', description: '读取模拟情景' },
      { from: 'bh_run_simulation', to: 'de_bottleneck_result', type: 'implements', description: '生成瓶颈分析' },
      // 规则与数据实体的关系
      { from: 'br_bottleneck_alert', to: 'de_bottleneck_result', type: 'triggers', description: '监控瓶颈结果' },
      { from: 'br_bottleneck_alert', to: 'bh_run_simulation', type: 'depends_on', description: '依赖模拟结果' },
      // 流程与行为/规则的关系
      { from: 'bp_capacity_evaluation', to: 'de_simulation_scenario', type: 'uses', description: '流程使用情景定义' },
      { from: 'bp_capacity_evaluation', to: 'bh_run_simulation', type: 'implements', description: '流程实现模拟运行' },
      { from: 'bp_capacity_evaluation', to: 'br_bottleneck_alert', type: 'implements', description: '流程实现瓶颈识别' }
    ]
  }
];

// ==================== 业务语义与业务场景推演映射 ====================
// 将业务语义ID映射到对应的业务场景推演场景ID
const SEMANTIC_TO_SCENARIO_MAP: Record<string, string> = {
  // 场景1: 设备预测性维护
  'sem_equipment_health_monitor': 'predictive_maintenance',
  'sem_rul_prediction': 'predictive_maintenance',
  // 场景2: 设备故障维修时间预测
  'sem_repair_time_pred': 'breakdown_maintenance',
  // 场景3: 产销匹配协同
  'sem_demand_forecast': 'production_sales_match',
  'sem_capacity_matching': 'production_sales_match',
  // 场景4: 新项目落地推演分析
  'sem_new_project_eval': 'new_project_planning',
  // 场景5: 产能评估推演预测分析
  'sem_capacity_simulation': 'capacity_assessment_prediction'
};

// 场景名称映射
const SCENARIO_NAMES: Record<string, string> = {
  'predictive_maintenance': '设备预测性维护',
  'breakdown_maintenance': '设备故障维修时间预测',
  'production_sales_match': '产销匹配协同',
  'new_project_planning': '新项目落地推演分析',
  'capacity_assessment_prediction': '产能评估推演预测分析'
};

// ==================== 组件 ====================

interface BusinessSemanticCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessSemanticCreator: React.FC<BusinessSemanticCreatorProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<SemanticCategory | 'all'>('all');
  const [selectedSemantic, setSelectedSemantic] = useState<AtomicSemantic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  // 过滤语义
  const filteredSemantics = ATOMIC_SEMANTICS.filter(semantic => {
    const matchesCategory = selectedCategory === 'all' || semantic.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      semantic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      semantic.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center ${isMaximized ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white shadow-2xl w-full flex flex-col overflow-hidden ${
        isMaximized ? 'h-screen w-screen rounded-none' : 'h-[95vh] max-w-7xl rounded-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layers className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedSemantic ? selectedSemantic.name : '原子业务语义库'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {selectedSemantic
                  ? `${selectedSemantic.dataEntities.length}个数据实体 · ${selectedSemantic.behaviors.length}个行为 · ${selectedSemantic.businessRules.length}个规则 · ${selectedSemantic.businessProcesses.length}个流程`
                  : '锂电行业产销协同 - 完整的业务语义定义'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedSemantic && (
              <button
                onClick={() => setSelectedSemantic(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                返回列表
              </button>
            )}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600"
            >
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors">
              <X size={24} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {selectedSemantic ? (
            <SemanticDetailGraph
              semantic={selectedSemantic}
              isMaximized={isMaximized}
            />
          ) : (
            <SemanticListView
              semantics={filteredSemantics}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectSemantic={setSelectedSemantic}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 语义列表视图
const SemanticListView: React.FC<{
  semantics: AtomicSemantic[];
  selectedCategory: SemanticCategory | 'all';
  setSelectedCategory: (c: SemanticCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onSelectSemantic: (s: AtomicSemantic) => void;
}> = ({ semantics, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, onSelectSemantic }) => {
  const stats = {
    total: ATOMIC_SEMANTICS.length,
    byCategory: Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => ({
      ...acc,
      [cat]: ATOMIC_SEMANTICS.filter(s => s.category === cat).length
    }), {} as Record<string, number>)
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-50/80 border-r border-slate-200 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="搜索业务释义..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-1">
            <div
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid3X3 size={16} />
                <span className="text-sm font-medium">全部类别</span>
              </div>
              <span className={`text-xs ${selectedCategory === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                {stats.total}
              </span>
            </div>

            {(Object.keys(CATEGORY_CONFIG) as SemanticCategory[]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              return (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === category
                      ? 'ring-2 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? config.bgColor : undefined,
                    borderColor: selectedCategory === category ? config.color : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: config.color }} />
                    <span className="text-sm font-medium text-slate-700">{config.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">{stats.byCategory[category]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center - List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {semantics.map((semantic) => {
            const categoryConfig = CATEGORY_CONFIG[semantic.category];
            return (
              <div
                key={semantic.id}
                onClick={() => onSelectSemantic(semantic)}
                className="p-5 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg cursor-pointer transition-all bg-white group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: categoryConfig.bgColor }}
                    >
                      <categoryConfig.icon size={20} style={{ color: categoryConfig.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {semantic.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">{semantic.code}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">{semantic.description}</p>

                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded font-medium">
                    {semantic.dataEntities.length} 数据实体
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded font-medium">
                    {semantic.behaviors.length} 行为操作
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded font-medium">
                    {semantic.businessRules.length} 业务规则
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded font-medium">
                    {semantic.businessProcesses.length} 业务流程
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 语义详情图谱 - 艺术2D展示四类节点及其关系
const SemanticDetailGraph: React.FC<{
  semantic: AtomicSemantic;
  isMaximized: boolean;
}> = ({ semantic, isMaximized }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const [filteredType, setFilteredType] = useState<NodeType | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 获取当前业务语义对应的业务场景推演场景ID
  const relatedScenarioId = SEMANTIC_TO_SCENARIO_MAP[semantic.id];
  const relatedScenarioName = relatedScenarioId ? SCENARIO_NAMES[relatedScenarioId] : null;

  // 处理节点更新（如关联MCP规则）
  const handleUpdateNode = useCallback((updatedNode: any) => {
    setSelectedNode(updatedNode);
    // 这里可以添加逻辑将更新同步到语义数据
    console.log('节点已更新:', updatedNode);
  }, []);

  // 军队/科研严谨风格配色
  const typeColors: Record<NodeType, { fill: string; stroke: string; border: string; label: string }> = {
    dataEntity: { fill: '#1e3a5f', stroke: '#2c5282', border: '#4a6fa5', label: '数据实体' },
    behavior: { fill: '#22543d', stroke: '#276749', border: '#38a169', label: '行为操作' },
    businessRule: { fill: '#744210', stroke: '#975a16', border: '#d69e2e', label: '业务规则' },
    businessProcess: { fill: '#742a2a', stroke: '#9b2c2c', border: '#e53e3e', label: '业务流程' },
  };

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMaximized]);

  // 构建图谱节点和连线
  const { nodes, links } = useMemo(() => {
    const allNodes: any[] = [];
    const allLinks: any[] = [];

    const centerX = dimensions.width / 2 || 400;
    const centerY = dimensions.height / 2 || 300;

    // 添加数据实体节点 - 左侧分布
    semantic.dataEntities.forEach((de, i) => {
      allNodes.push({
        id: de.id,
        name: de.name,
        type: 'dataEntity' as NodeType,
        data: de,
        x: centerX - 250 + (i % 2) * 180,
        y: centerY - 120 + Math.floor(i / 2) * 140
      });
    });

    // 添加行为操作节点 - 中上分布
    semantic.behaviors.forEach((bh, i) => {
      allNodes.push({
        id: bh.id,
        name: bh.name,
        type: 'behavior' as NodeType,
        data: bh,
        x: centerX + (i % 2) * 160,
        y: centerY - 180 + i * 110
      });
    });

    // 添加业务规则节点 - 中下分布
    semantic.businessRules.forEach((br, i) => {
      allNodes.push({
        id: br.id,
        name: br.name,
        type: 'businessRule' as NodeType,
        data: br,
        x: centerX - 80 + (i % 2) * 220,
        y: centerY + 80 + i * 100
      });
    });

    // 添加业务流程节点 - 右侧分布
    semantic.businessProcesses.forEach((bp, i) => {
      allNodes.push({
        id: bp.id,
        name: bp.name,
        type: 'businessProcess' as NodeType,
        data: bp,
        x: centerX + 300,
        y: centerY - 60 + i * 140
      });
    });

    // 添加关系连线
    semantic.relationships.forEach(rel => {
      const sourceNode = allNodes.find(n => n.id === rel.from);
      const targetNode = allNodes.find(n => n.id === rel.to);
      if (sourceNode && targetNode) {
        allLinks.push({
          source: sourceNode,
          target: targetNode,
          type: rel.type,
          description: rel.description
        });
      }
    });

    return { nodes: allNodes, links: allLinks };
  }, [semantic, filteredType, dimensions]);

  // D3 军事严谨风格渲染
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const g = svg.append('g')
      .attr('transform', `translate(${transform.x}, ${transform.y}) scale(${zoom})`);

    // 定义标记
    const defs = g.append('defs');

    // 网格图案
    const gridPattern = defs.append('pattern')
      .attr('id', 'grid-mil')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');
    gridPattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1);

    // 绘制网格背景
    g.append('rect')
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('x', -width)
      .attr('y', -height)
      .attr('fill', 'url(#grid-mil)');

    // 箭头标记 - 统一使用深灰色
    defs.append('marker')
      .attr('id', 'arrow-mil')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#4a5568');

    // 计算节点高亮状态
    const isNodeHighlighted = (d: any) => {
      if (filteredType === 'all') return true;
      return d.type === filteredType;
    };

    // 绘制直线连线
    const linkSelection = g.selectAll('line.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#4a5568')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', (d: any) => isNodeHighlighted(d.source) && isNodeHighlighted(d.target) ? 0.8 : 0.2)
      .attr('marker-end', 'url(#arrow-mil)');

    // 绘制节点组
    const nodeGroups = g.selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .attr('opacity', (d: any) => isNodeHighlighted(d) ? 1 : 0.25);

    // 节点外边框
    nodeGroups.append('circle')
      .attr('class', 'node-border')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => typeColors[d.type]?.border || '#4a5568')
      .attr('stroke-width', 2);

    // 节点主体 - 实心填充
    nodeGroups.append('circle')
      .attr('class', 'node-body')
      .attr('r', 30)
      .attr('fill', (d: any) => typeColors[d.type]?.fill || '#2d3748')
      .attr('stroke', (d: any) => typeColors[d.type]?.stroke || '#4a5568')
      .attr('stroke-width', 1);

    // 节点类型标识 - 右上角
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', 20)
      .attr('y', -20)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text((d: any) => {
        const labels: Record<string, string> = {
          dataEntity: 'DE', behavior: 'BE', businessRule: 'BR', businessProcess: 'BP'
        };
        return labels[d.type] || 'NA';
      });

    // 节点标签 - 下方，等宽字体
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '42px')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '600')
      .attr('fill', '#1a202c')
      .attr('letter-spacing', '0.5px')
      .text((d: any) => d.name.length > 10 ? d.name.substring(0, 9) + '..' : d.name);

    // 节点类型标签
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '55px')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('fill', '#4a5568')
      .text((d: any) => typeColors[d.type]?.label || d.type);

    // 选中状态高亮
    nodeGroups.filter((d: any) => selectedNode?.id === d.id)
      .append('circle')
      .attr('class', 'selection-ring')
      .attr('r', 36)
      .attr('fill', 'none')
      .attr('stroke', '#1a202c')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2');

    // 交互事件
    nodeGroups
      .on('click', (_: any, d: any) => setSelectedNode(d))
      .on('mouseover', function(event: any, d: any) {
        if (!isNodeHighlighted(d)) return;
        d3.select(this).select('.node-border')
          .transition().duration(150)
          .attr('stroke', '#1a202c')
          .attr('stroke-width', 3);
        d3.select(this).select('.node-body')
          .transition().duration(150)
          .attr('r', 32);
      })
      .on('mouseout', function(event: any, d: any) {
        d3.select(this).select('.node-border')
          .transition().duration(150)
          .attr('stroke', typeColors[d.type]?.border || '#4a5568')
          .attr('stroke-width', 2);
        d3.select(this).select('.node-body')
          .transition().duration(150)
          .attr('r', 30);
      });

    // 力导向模拟 - 更稳定的布局
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70));

    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [nodes, links, selectedNode, zoom, transform, dimensions, filteredType]);

  // 拖拽平移
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex h-full">
      {/* 左侧过滤工具栏 */}
      <div className="w-16 bg-slate-100 border-r border-slate-300 flex flex-col items-center py-4 gap-2">
        <div
          onClick={() => setFilteredType('all')}
          className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-colors ${
            filteredType === 'all' ? 'bg-slate-700 text-white' : 'bg-white hover:bg-slate-200 border border-slate-300'
          }`}
          title="全部显示"
        >
          <Grid3X3 size={18} />
        </div>
        {(Object.keys(typeColors) as NodeType[]).map(type => {
          const colors = typeColors[type];
          const isActive = filteredType === type;
          return (
            <div
              key={type}
              onClick={() => setFilteredType(isActive ? 'all' : type)}
              className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-offset-1 ring-slate-400' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: isActive ? colors.fill : '#fff',
                border: `1px solid ${colors.stroke}`,
                color: isActive ? '#fff' : colors.fill
              }}
              title={colors.label}
            >
              <span className="text-xs font-mono font-bold">{type.substring(0, 2).toUpperCase()}</span>
            </div>
          );
        })}
      </div>

      {/* 图谱区域 */}
      <div className="flex-1 relative bg-slate-50" ref={containerRef}>
        {/* 控制工具栏 */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-white border border-slate-300 rounded p-1">
            <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className="p-2 hover:bg-slate-100 rounded transition-colors">
              <ZoomIn size={18} className="text-slate-600" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.3))} className="p-2 hover:bg-slate-100 rounded transition-colors">
              <ZoomOut size={18} className="text-slate-600" />
            </button>
            <button onClick={() => { setZoom(1); setTransform({ x: 0, y: 0 }); }} className="p-2 hover:bg-slate-100 rounded transition-colors">
              <RefreshCw size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* 缩放比例和场景跳转 */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="bg-white border border-slate-300 rounded px-3 py-1.5">
            <span className="text-xs text-slate-600 font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          {relatedScenarioId && (
            <button
              onClick={() => navigate(`/ontology?scenario=${relatedScenarioId}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
              title={`查看${relatedScenarioName}的业务场景推演图谱`}
            >
              <Network size={14} />
              <span>查看场景推演</span>
            </button>
          )}
        </div>

        {/* 图例 */}
        <div className="absolute bottom-4 left-4 z-10 bg-white border border-slate-300 rounded p-3">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">节点类型</h4>
          <div className="space-y-1.5">
            {(Object.keys(typeColors) as NodeType[]).map(type => {
              const colors = typeColors[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.fill }} />
                  <span className="text-xs text-slate-600 font-mono">{colors.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-1">连线类型</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-600" />
                <span className="text-[10px] text-slate-500 font-mono">uses 使用</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-600" />
                <span className="text-[10px] text-slate-500 font-mono">triggers 触发</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-600" />
                <span className="text-[10px] text-slate-500 font-mono">implements 实现</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG 画布 */}
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* 右侧节点详情面板 */}
      {selectedNode && (
        <NodeInfoPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={handleUpdateNode}
        />
      )}
    </div>
  );
};

// MCP规则选择器组件
const MCPRuleSelector: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectRule: (rule: ConstraintRule) => void;
}> = ({ isOpen, onClose, onSelectRule }) => {
  const [activeTab, setActiveTab] = useState<'constraints' | 'solvers'>('constraints');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRules = selectedCategory
    ? DEFAULT_CONSTRAINT_RULES.filter(r => r.category === selectedCategory)
    : DEFAULT_CONSTRAINT_RULES;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-[800px] max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">从MCP工具选择规则</h3>
            <p className="text-sm text-gray-500">关联约束规则或求解器到当前业务规则</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-1 p-3 border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('constraints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'constraints'
                ? 'bg-white text-gray-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen size={16} />
            约束规则 ({DEFAULT_CONSTRAINT_RULES.length})
          </button>
          <button
            onClick={() => setActiveTab('solvers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'solvers'
                ? 'bg-white text-gray-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Cpu size={16} />
            求解器 ({SOLVER_TYPES.length})
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'constraints' ? (
            <div className="space-y-4">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {CONSTRAINT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* 规则列表 */}
              <div className="grid grid-cols-1 gap-3">
                {filteredRules.map(rule => (
                  <div
                    key={rule.id}
                    onClick={() => onSelectRule(rule)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rule.constraintType === 'Hard'
                            ? 'bg-red-100 text-gray-600'
                            : 'bg-amber-100 text-gray-600'
                        }`}>
                          {rule.constraintType}
                        </span>
                        <span className="text-xs text-gray-500">{rule.ontologyObject}</span>
                      </div>
                      <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-indigo-100">
                        选择
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rule.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{rule.description}</p>
                    <div className="text-xs font-mono text-gray-400 bg-gray-50 p-2 rounded">
                      {rule.expression}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {SOLVER_TYPES.map(solver => (
                <div
                  key={solver.id}
                  onClick={() => onSelectRule({
                    id: solver.id,
                    name: solver.fullName,
                    category: 'solver',
                    ontologyObject: 'Solver',
                    constraintType: 'Hard',
                    expression: solver.description,
                    parameters: [],
                    enabled: true,
                    version: '1.0.0',
                    applicableScope: solver.applicableScenarios,
                    riskWeight: 0.8,
                    description: solver.description
                  } as ConstraintRule)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${solver.bgColor} ${solver.color}`}>
                      {solver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{solver.name}</h4>
                      <span className="text-xs text-gray-500">{solver.fullName}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{solver.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {solver.applicableScenarios.slice(0, 3).map((scenario, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded">
                        {scenario}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 节点信息面板
const NodeInfoPanel: React.FC<{
  node: any;
  onClose: () => void;
  onUpdateNode?: (updatedNode: any) => void;
}> = ({ node, onClose, onUpdateNode }) => {
  const config = NODE_TYPE_CONFIG[node.type];
  const [showMCPSelector, setShowMCPSelector] = useState(false);
  const [linkedMCPRule, setLinkedMCPRule] = useState<ConstraintRule | null>(null);

  const renderContent = () => {
    switch (node.type) {
      case 'dataEntity':
        const entityTypeLabels: Record<string, string> = {
          organization: '🏢 组织类',
          asset: '🔧 资产类',
          businessObject: '📋 业务对象类',
          eventObject: '🔔 事件对象类'
        };
        const lifecycleLabels: Record<string, string> = {
          draft: '草稿', active: '活跃', suspended: '暂停', archived: '归档', deleted: '已删除',
          maintenance: '维护中', offline: '离线'
        };
        return (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-700 mb-1">定义</h4>
              <p className="text-xs text-slate-700">{node.data.description}</p>
            </div>

            {/* 实体分类 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">实体分类</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-blue-700 rounded font-medium">
                  {entityTypeLabels[node.data.entityType] || node.data.entityType}
                </span>
                {node.data.subtype && (
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    {node.data.subtype}
                  </span>
                )}
              </div>
            </div>

            {/* 生命周期状态 */}
            {node.data.lifecycleStates && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">生命周期</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">当前状态:</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    {lifecycleLabels[node.data.currentState] || node.data.currentState}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {node.data.lifecycleStates.map((state: string) => (
                    <span key={state} className={`text-[10px] px-1.5 py-0.5 rounded ${state === node.data.currentState ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                      {lifecycleLabels[state] || state}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 实体关系 */}
            {node.data.relations && node.data.relations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">实体关系</h4>
                <div className="space-y-1">
                  {node.data.relations.map((rel: EntityRelation, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 bg-slate-50 rounded">
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-700">{rel.targetEntityId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{rel.relationType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">数据字段</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {node.data.fields.map((field: DataField, i: number) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-800">{field.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{field.dataType}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{field.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500">来源:</span>
                <span className="ml-1 text-slate-700">{node.data.source}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-slate-500">更新:</span>
                <span className="ml-1 text-slate-700">{node.data.updateFrequency}</span>
              </div>
            </div>

            {/* 业务信息 */}
            {(node.data.businessCode || node.data.owner) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {node.data.businessCode && (
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-500">业务编码:</span>
                    <span className="ml-1 text-slate-700 font-mono">{node.data.businessCode}</span>
                  </div>
                )}
                {node.data.owner && (
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-500">负责人:</span>
                    <span className="ml-1 text-slate-700">{node.data.owner}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'behavior':
        const actionTypeLabels: Record<string, string> = {
          crud: '🔧 CRUD操作',
          businessAction: '⚡ 业务动作',
          batchCalculation: '📊 批量计算'
        };
        const crudLabels: Record<string, string> = {
          create: '➕ 创建', read: '👁️ 读取', update: '✏️ 更新', delete: '🗑️ 删除'
        };
        const businessActionLabels: Record<string, string> = {
          approve: '✅ 审批通过', reject: '❌ 审批拒绝', adjust: '📐 调整',
          transfer: '🔄 转移', alert: '🚨 预警', notify: '📢 通知', analyze: '🔍 分析'
        };
        return (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-cyan-100">
              <h4 className="text-xs font-semibold text-cyan-700 mb-1">定义</h4>
              <p className="text-xs text-slate-700">{node.data.description}</p>
            </div>

            {/* 行为分类 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">行为分类</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded font-medium">
                  {actionTypeLabels[node.data.actionType] || node.data.actionType}
                </span>
                {node.data.crudOperation && (
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    {crudLabels[node.data.crudOperation] || node.data.crudOperation}
                  </span>
                )}
                {node.data.businessActionType && (
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    {businessActionLabels[node.data.businessActionType] || node.data.businessActionType}
                  </span>
                )}
              </div>
            </div>

            {/* 批处理配置 */}
            {node.data.batchConfig && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">批处理配置</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-500">计算公式:</span>
                    <p className="text-slate-700 mt-0.5 font-mono">{node.data.batchConfig.calculationFormula}</p>
                  </div>
                  {node.data.batchConfig.triggerCondition && (
                    <div className="p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">触发条件:</span>
                      <p className="text-slate-700 mt-0.5">{node.data.batchConfig.triggerCondition}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-slate-500">目标实体:</span>
                    {node.data.batchConfig.targetEntities.map((entity: string) => (
                      <span key={entity} className="text-[10px] px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 影响的数据实体 */}
            {node.data.impactedEntities && node.data.impactedEntities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">影响范围</h4>
                <div className="space-y-1">
                  {node.data.impactedEntities.map((impact: ActionImpact, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 bg-slate-50 rounded">
                      <span className="text-slate-700">{impact.entityId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-cyan-100 text-gray-600 rounded">{impact.impactType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 权限配置 */}
            {node.data.requiredRoles && node.data.requiredRoles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">执行权限</h4>
                <div className="flex flex-wrap gap-1">
                  {node.data.requiredRoles.map((role: string) => (
                    <span key={role} className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">输入参数</h4>
              <div className="space-y-1">
                {node.data.inputParams.map((param: DataField, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded">
                    <span>{param.name}</span>
                    <span className="text-[10px] text-slate-500">{param.dataType}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">输出参数</h4>
              <div className="space-y-1">
                {node.data.outputParams.map((param: DataField, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded">
                    <span>{param.name}</span>
                    <span className="text-[10px] text-slate-500">{param.dataType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'businessRule':
        const ruleSubtypeLabels: Record<string, string> = {
          validation: '✓ 验证规则',
          constraint: '⚡ 约束规则',
          calculation: '📊 计算规则',
          risk: '⚠️ 风险规则'
        };
        const riskLevelLabels: Record<string, { label: string; color: string }> = {
          low: { label: '低风险', color: 'bg-green-100 text-green-700' },
          medium: { label: '中风险', color: 'bg-yellow-100 text-yellow-700' },
          high: { label: '高风险', color: 'bg-orange-100 text-orange-700' },
          critical: { label: '严重风险', color: 'bg-red-100 text-red-700' }
        };
        const triggerTypeLabels: Record<string, string> = {
          event: '事件触发',
          schedule: '定时触发',
          threshold: '阈值触发',
          manual: '手动触发'
        };
        return (
          <div className="space-y-4">
            {/* MCP规则关联状态 */}
            {linkedMCPRule && (
              <div className="p-3 bg-gray-50 rounded-lg border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                    <Link2 size={12} />
                    已关联MCP规则
                  </h4>
                  <button
                    onClick={() => setLinkedMCPRule(null)}
                    className="text-[10px] text-gray-600 hover:text-indigo-800"
                  >
                    解除关联
                  </button>
                </div>
                <p className="text-xs font-medium text-indigo-900">{linkedMCPRule.name}</p>
                <p className="text-[10px] text-gray-600 mt-1">{linkedMCPRule.description}</p>
              </div>
            )}

            {/* 关联MCP规则按钮 */}
            {!linkedMCPRule && (
              <button
                onClick={() => setShowMCPSelector(true)}
                className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span className="text-xs font-medium">关联MCP规则</span>
              </button>
            )}

            <div className="p-3 bg-gray-50 rounded-lg border border-orange-100">
              <h4 className="text-xs font-semibold text-orange-700 mb-1">定义</h4>
              <p className="text-xs text-slate-700">{node.data.description}</p>
            </div>

            {/* 规则分类 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">规则分类</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">
                  {ruleSubtypeLabels[node.data.ruleSubtype] || node.data.ruleSubtype}
                </span>
                {node.data.riskLevel && (
                  <span className={`text-xs px-2 py-1 rounded ${riskLevelLabels[node.data.riskLevel]?.color || 'bg-slate-100 text-slate-600'}`}>
                    {riskLevelLabels[node.data.riskLevel]?.label || node.data.riskLevel}
                  </span>
                )}
              </div>
            </div>

            {/* 适用实体 */}
            {node.data.applicableEntities && node.data.applicableEntities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">适用实体</h4>
                <div className="flex flex-wrap gap-1">
                  {node.data.applicableEntities.map((entity: string) => (
                    <span key={entity} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 条件表达式 */}
            <div className="p-2 bg-slate-50 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">条件</h4>
              <p className="text-xs text-slate-600 mb-1">{node.data.condition}</p>
              {node.data.conditionExpression && (
                <p className="text-[10px] font-mono text-slate-500 bg-slate-100 p-1 rounded">
                  {node.data.conditionExpression}
                </p>
              )}
            </div>

            {/* 动作 */}
            <div className="p-2 bg-slate-50 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">动作</h4>
              <p className="text-xs text-slate-700">{node.data.action}</p>
              {node.data.ruleAction && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">动作类型:</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                      {node.data.ruleAction.actionType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{node.data.ruleAction.actionDescription}</p>
                </div>
              )}
            </div>

            {/* 触发配置 */}
            {node.data.trigger && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">触发机制</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-blue-700 rounded">
                    {triggerTypeLabels[node.data.trigger.triggerType]}
                  </span>
                  {node.data.trigger.triggerEvent && (
                    <span className="text-[10px] text-slate-500">{node.data.trigger.triggerEvent}</span>
                  )}
                </div>
              </div>
            )}

            {/* 阈值配置 */}
            {node.data.thresholdConfig && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">阈值配置</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                    警告: {node.data.thresholdConfig.warningThreshold}
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-red-700 rounded">
                    严重: {node.data.thresholdConfig.criticalThreshold}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">优先级:</span>
              <span className="px-2 py-0.5 bg-red-100 text-gray-600 rounded text-xs font-medium">
                P{node.data.priority}
              </span>
              {!node.data.enabled && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                  已禁用
                </span>
              )}
            </div>
          </div>
        );
      case 'businessProcess':
        const workflowNodes = node.data.nodes || node.data.steps || [];
        const nodeTypeIcons: Record<string, string> = {
          start: '●', task: '▢', decision: '◆', gateway: '◇',
          subprocess: '⬡', human: '👤', system: '⚙️', end: '◎'
        };
        const nodeTypeLabels: Record<string, string> = {
          start: '开始', task: '任务', decision: '决策', gateway: '网关',
          subprocess: '子流程', human: '人工节点', system: '系统节点', end: '结束'
        };
        return (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-green-100">
              <h4 className="text-xs font-semibold text-green-700 mb-1">定义</h4>
              <p className="text-xs text-slate-700">{node.data.description}</p>
            </div>

            {/* 流程节点 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">流程节点</h4>
              <div className="space-y-2">
                {workflowNodes.map((step: WorkflowNode | ProcessStep, idx: number) => {
                  const isWorkflowNode = 'nodeType' in step;
                  const stepId = isWorkflowNode ? (step as WorkflowNode).nodeId : (step as ProcessStep).id;
                  const stepName = isWorkflowNode ? (step as WorkflowNode).nodeName : (step as ProcessStep).name;
                  const stepDesc = isWorkflowNode ? (step as WorkflowNode).description : (step as ProcessStep).description;
                  const stepOrder = isWorkflowNode ? (step as WorkflowNode).order : (step as ProcessStep).order;
                  const nodeType = isWorkflowNode ? (step as WorkflowNode).nodeType : 'task';
                  const wfNode = isWorkflowNode ? (step as WorkflowNode) : null;

                  return (
                    <div key={stepId || idx} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                          nodeType === 'start' ? 'bg-green-200 text-green-700' :
                          nodeType === 'end' ? 'bg-gray-200 text-gray-700' :
                          nodeType === 'decision' ? 'bg-yellow-100 text-yellow-700' :
                          nodeType === 'human' ? 'bg-gray-100 text-blue-700' :
                          'bg-green-100 text-gray-600'
                        }`}>
                          {nodeTypeIcons[nodeType] || stepOrder}
                        </div>
                        {idx < workflowNodes.length - 1 && (
                          <div className="w-0.5 h-4 bg-green-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-slate-800">{stepName}</p>
                          {isWorkflowNode && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                              {nodeTypeLabels[nodeType]}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{stepDesc}</p>

                        {/* 条件分支 */}
                        {wfNode?.conditionalBranches && wfNode.conditionalBranches.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {wfNode.conditionalBranches.map((branch) => (
                              <div key={branch.branchId} className="flex items-center gap-1 text-[10px] pl-2 border-l-2 border-yellow-300">
                                <span className="text-slate-400">if</span>
                                <span className="text-slate-600">{branch.condition}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-gray-600">{branch.targetStepId}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 人机协作配置 */}
                        {wfNode?.humanMachineConfig?.requiresHumanApproval && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded">
                              👤 需审批: {wfNode.humanMachineConfig.approverRoles?.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 触发机制 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">触发机制</h4>
              <div className="space-y-2">
                {node.data.triggers?.map((trigger: TriggerMechanism, idx: number) => (
                  <div key={idx} className="text-xs p-2 bg-slate-50 rounded">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                      {trigger.type === 'schedule' ? '⏰ 定时' :
                       trigger.type === 'event' ? '🔔 事件' :
                       trigger.type === 'manual' ? '👤 手动' : '📊 阈值'}
                    </span>
                    <span className="ml-2 text-slate-600">{trigger.description}</span>
                  </div>
                )) || (
                  node.data.trigger && (
                    <div className="text-xs p-2 bg-slate-50 rounded">
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                        {node.data.trigger.type === 'schedule' ? '⏰ 定时' :
                         node.data.trigger.type === 'event' ? '🔔 事件' :
                         node.data.trigger.type === 'manual' ? '👤 手动' : '📊 阈值'}
                      </span>
                      <span className="ml-2 text-slate-600">{node.data.trigger.description}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 流程结果 */}
            <div className="p-2 bg-slate-50 rounded">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">流程结果</h4>
              <p className="text-xs text-slate-600">{node.data.result}</p>
              {node.data.resultDefinition && (
                <div className="mt-1 space-y-1 text-[10px] text-slate-500">
                  <p>成功标准: {node.data.resultDefinition.successCriteria}</p>
                  <p>失败处理: {node.data.resultDefinition.failureHandling}</p>
                </div>
              )}
            </div>

            {/* 监控配置 */}
            {node.data.monitoringConfig && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">监控配置</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {node.data.monitoringConfig.slaMinutes && (
                    <span className="px-2 py-1 bg-gray-50 text-purple-700 rounded">
                      SLA: {node.data.monitoringConfig.slaMinutes}分钟
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-50 text-blue-700 rounded">
                    关键指标: {node.data.monitoringConfig.keyMetrics?.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
              <config.icon size={16} style={{ color: config.color }} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{node.name}</h3>
              <p className="text-[10px] text-slate-500">{config.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4">
          {renderContent()}
        </div>
      </div>

      {/* MCP规则选择器弹窗 */}
      {node.type === 'businessRule' && (
        <MCPRuleSelector
          isOpen={showMCPSelector}
          onClose={() => setShowMCPSelector(false)}
          onSelectRule={(rule) => {
            setLinkedMCPRule(rule);
            setShowMCPSelector(false);
            // 更新节点数据
            if (onUpdateNode) {
              onUpdateNode({
                ...node,
                data: {
                  ...node.data,
                  mcpRuleRef: rule.id,
                  mcpRuleName: rule.name,
                  mcpRuleType: rule.category === 'solver' ? 'solver' : 'constraint'
                }
              });
            }
          }}
        />
      )}
    </>
  );
};

export default BusinessSemanticCreator;
