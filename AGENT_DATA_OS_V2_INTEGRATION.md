# 智能体中台 V2 融合架构文档

## 概述

本方案将新的工业级"智能体中台 (Agent Data OS)"设计与现有平台完美融合。采用**分层扩展**策略，保留所有现有功能，在此基础上新增六大核心能力。

## 架构演进

### 原有架构 (V1)
```
仪表盘 → 决策空间 → 业务对象 → 场景推演 → 技能中心 → MCP工具
```

### 融合架构 (V2)
```
┌─────────────────────────────────────────────────────────────────┐
│                        应用层 (Application)                       │
│  仪表盘    决策空间    业务对象    工作流    推演    技能市场      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Agent 层 (Agent Runtime)                    │
│  Planner    Analyst    Reasoner    Executor    Auditor           │
│     ↓          ↓          ↓          ↓          ↓               │
│  任务拆解   数据分析   因果推理   工具调用   风控审计             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      能力层 (Capabilities)                       │
│  场景推演    业务语义    业务释义    技能中心    MCP工具          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       资产层 (Assets)                            │
│  技能市场    决策资产    数据源                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 核心新增模块

### 1. Workflow Studio (/workflows)

**定位**: 工业级工作流编排系统，类似 Airflow + Palantir Pipeline Builder

**100+ 节点分类**:

| 分类 | 数量 | 关键节点 | 用途 |
|------|------|----------|------|
| **数据** | 15 | DataFetch, StreamJoin, FeatureEngineering | 数据接入与处理 |
| **语义** | 10 | OntologyMapping, MetricCompute | 本体映射与指标计算 |
| **推理** | 20 | AnomalyDetection, RootCauseAnalysis, CausalInference | 智能分析 |
| **决策** | 20 | Optimization, MultiObjectiveDecision, RiskEvaluation | 决策优化 |
| **仿真** | 15 | DiscreteEventSimulation, MonteCarlo, WhatIfAnalysis | 场景仿真 |
| **执行** | 10 | ActionDispatch, ParameterAdjust, AlertSend | 动作执行 |
| **控制** | 10 | If, Switch, Loop, Parallel, Retry | 流程控制 |

**示例工作流**:
```
设备异常处理流程:
  DataFetch(获取传感器数据)
    → AnomalyDetection(异常检测)
    → RootCauseAnalysis(根因分析)
    → If(高优先级?)
      ├─ Yes → ActionDispatch(创建紧急工单)
      └─ No → AlertSend(发送告警)
```

### 2. Simulation Lab (/simulation)

**定位**: What-if 推演实验室，支持参数调节、场景对比、优化求解

**核心能力**:
- **参数配置**: 滑块调节基础参数和推演变量
- **目标优化**: 最大化/最小化/目标值多目标优化
- **场景对比**: 多运行结果对比，柱状图可视化
- **风险评估**: 每次推演附带置信度和风险等级

**示例场景**:
| 场景 | 变量 | 输出指标 | 优化目标 |
|------|------|----------|----------|
| 产能规划 | 产能扩张量、自动化水平 | 交付率、单位成本、ROI | 最大化ROI |
| 库存优化 | 安全库存天数、再订货点 | 缺货率、库存成本、周转率 | 最小化成本 |

### 3. Skill Market (/skill-market)

**定位**: 技能市场，支持Skill共享、评价、商业化

**核心功能**:
- **发现**: 搜索、筛选、排序技能
- **评价**: 星级评分、用户评论、有用数
- **定价**: 免费/付费/订阅多种模式
- **统计**: 下载量、月活、成功率

**市场机制**:
```typescript
Skill = {
  publisher: "工业智能实验室",
  rating: { average: 4.8, count: 156 },
  pricing: { type: "free" | "paid" | "subscription" },
  usage: { downloads: 1256, monthlyActive: 342, successRate: 0.94 }
}
```

## 数据模型扩展

### 类型系统 (types.ts)

#### Workflow 类型系统
```typescript
// 100+ 节点类型
WorkflowNodeType =
  | 'DataFetch' | 'AnomalyDetection' | 'Optimization'
  | 'MonteCarlo' | 'ActionDispatch' | 'If' | ...

// 节点定义
WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  category: 'data' | 'semantic' | 'reasoning' | 'decision' | 'simulation' | 'execution' | 'control';
  config: Record<string, any>;
  input: WorkflowPort[];
  output: WorkflowPort[];
  execution: { timeout, retry, parallel };
  runtime?: { status, startTime, endTime, output }
}

// 工作流定义
Workflow = {
  id, name, category, version,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  inputSchema, outputSchema,
  metadata: { createdBy, isTemplate, isPublic },
  stats: { totalRuns, successRuns, avgDuration }
}
```

#### Simulation 类型系统
```typescript
SimulationScenario = {
  id, name, description,
  baseParams: SimulationParameter[],
  variables: SimulationVariable[],
  outputMetrics: string[],
  objectives: SimulationObjective[]
}

SimulationRun = {
  id, scenarioId, status,
  params: Record<string, any>,
  results: {
    metrics: Record<string, number>,
    confidence, riskLevel
  }
}

WhatIfAnalysis = {
  id, baseScenario,
  variations: WhatIfVariation[],
  results: WhatIfResult[],
  comparisonMatrix: ComparisonItem[]
}
```

#### Agent Runtime 类型系统
```typescript
AgentRuntime = {
  id, name, config: { maxAgents, timeout, logLevel },
  agents: AgentRuntimeInstance[],
  status: 'idle' | 'running' | 'paused' | 'completed',
  orchestration: { mode, workflowId }
}

AgentRuntimeInstance = {
  id, agentId, role, status,
  inputContext, outputContext,
  toolCalls: AgentToolCall[],
  stats: { tokenInput, tokenOutput, toolCallCount }
}

AgentMessage = {
  id, from, to, type, content, timestamp, correlationId
}
```

#### Explainability 类型系统
```typescript
DecisionExplanation = {
  id, decisionId,
  explanation: {
    summary, detailedReasoning,
    keyFactors: ExplanationFactor[],
    confidenceBreakdown: ConfidenceItem[]
  },
  evidence: ExplanationEvidence[],
  traceability: { dataSources, modelVersions, reasoningChain }
}

CounterfactualExplanation = {
  id, originalDecision,
  counterfactuals: CounterfactualScenario[]
}

AttributionAnalysis = {
  id, target, method,
  features: AttributionFeature[]
}
```

#### Skill Market 类型系统
```typescript
MarketSkill extends Skill = {
  marketInfo: { publisher, publishDate, version, changelog },
  rating: { average, count, distribution },
  reviews: SkillReview[],
  usage: { totalDownloads, monthlyActive, successRate },
  pricing: { type, price, currency, billingCycle },
  dependencies: { skills, tools, dataSources }
}

SkillSubscription = {
  id, userId, skillId, status,
  startDate, endDate,
  usageQuota: { total, used, resetDate }
}
```

### Mock 数据 (constants.ts)

#### 工作流示例
- `MOCK_WORKFLOWS`: 设备异常处理流程、质量预测与优化
- `WORKFLOW_NODE_TEMPLATES`: 24个节点模板

#### 推演示例
- `MOCK_SIMULATION_SCENARIOS`: 产能规划、库存优化
- `MOCK_SIMULATION_RUNS`: 已完成推演结果

#### Agent Runtime 示例
- `MOCK_AGENT_RUNTIMES`: 产线异常处理多Agent编排

#### 技能市场示例
- `MOCK_MARKET_SKILLS`: OEE优化专家、质量预测Pro

## 导航结构

### 新导航顺序
```
┌─────────────────────────────────────────────────────────────────┐
│  1. 仪表盘 (Dashboard)          ← 总体态势感知                    │
├─────────────────────────────────────────────────────────────────┤
│  2. 决策空间 (DecisionSpace)    ← Agent核心工作区                │
│  3. 业务对象 (Objects)          ← Object Layer                   │
│  4. 工作流 (WorkflowStudio)     ← Workflow编排 [NEW]             │
│  5. 推演 (SimulationLab)        ← What-if分析 [NEW]              │
├─────────────────────────────────────────────────────────────────┤
│  6. 场景推演 (Ontology)         ← 场景分析                        │
│  7. 业务语义 (Semantic)         ← 语义定义                        │
│  8. 业务释义 (Atoms)            ← 原子语义                        │
│  9. 技能中心 (Skills)           ← 技能管理                        │
│ 10. MCP工具 (MCP)               ← 工具使用                        │
├─────────────────────────────────────────────────────────────────┤
│ 11. 技能市场 (SkillMarket)      ← 技能商业化 [NEW]               │
│ 12. 决策资产 (Repository)       ← 知识沉淀                        │
│ 13. 数据源 (DataSources)        ← 数据管理                        │
└─────────────────────────────────────────────────────────────────┘
```

## 融合策略

### 1. 与现有模块的关系

| 新模块 | 现有基础 | 扩展方式 |
|--------|----------|----------|
| WorkflowStudio | BusinessSemanticCreator | 扩展WorkflowNode类型，添加100+节点 |
| SimulationLab | DecisionSpace + SimulationModal | 添加What-if对比、参数优化 |
| SkillMarket | SkillsRegistry | 添加市场属性、评价、定价 |

### 2. 数据流闭环

```
业务对象状态变更
    ↓
触发工作流 (WorkflowStudio)
    ↓
Agent执行推理 (AgentRuntime)
    ↓
调用工具 (MCP)
    ↓
执行推演 (SimulationLab)
    ↓
生成决策建议
    ↓
人工确认/自动执行
    ↓
结果反馈学习
    ↓
沉淀为技能 (SkillMarket)
```

### 3. 与数据库DDL对应

```typescript
// Object Layer → BusinessObject
type DBObjectEntity = { id, type, name, state, lifecycleStage }

// Semantic Layer → IndustrialMetric
type DBMetricDefinition = { id, name, formula, validCondition }

// Tool Layer → ToolRegistry
type DBToolRegistry = { id, name, inputSchema, outputSchema }

// Workflow Layer → Workflow
type Workflow = { id, nodes, edges, inputSchema, outputSchema }
```

## 使用场景

### 场景1: 设备异常智能处理
1. **对象层**: 设备EQ-001温度异常告警
2. **工作流**: 启动"设备异常处理流程"
   - 异常检测 → 根因分析 → 决策分支
3. **Agent**: Planner协调Analyst和Reasoner
4. **推演**: SimulationLab评估不同处理方案
5. **决策**: DecisionSpace推荐最优方案
6. **执行**: Executor调用MES创建工单

### 场景2: 产能规划What-if分析
1. **推演**: SimulationLab选择"产能规划"场景
2. **参数**: 调节产能扩张量、自动化水平
3. **运行**: 多次推演生成对比数据
4. **对比**: 查看交付率、成本、ROI对比
5. **决策**: 选择最优方案执行

### 场景3: 发现和使用Skill
1. **市场**: SkillMarket浏览可用技能
2. **筛选**: 按分类、价格、评分筛选
3. **详情**: 查看技能详情、评价、依赖
4. **获取**: 免费获取或购买订阅
5. **使用**: 在技能中心调用新Skill

## 技术实现

### 新增组件

| 组件 | 路径 | 功能 |
|------|------|------|
| WorkflowStudio | components/WorkflowStudio.tsx | 工作流编排画布 |
| NodePalette | WorkflowStudio内 | 节点库侧边栏 |
| PropertyPanel | WorkflowStudio内 | 节点属性面板 |
| SimulationLab | components/SimulationLab.tsx | 推演实验室 |
| ScenarioCard | SimulationLab内 | 场景卡片 |
| ResultsComparison | SimulationLab内 | 结果对比 |
| SkillMarket | components/SkillMarket.tsx | 技能市场 |
| SkillCard | SkillMarket内 | 技能卡片 |
| SkillDetailModal | SkillMarket内 | 技能详情弹窗 |

### 新增路由

```typescript
{ path: '/workflows', element: <WorkflowStudio /> }
{ path: '/simulation', element: <SimulationLab /> }
{ path: '/skill-market', element: <SkillMarket /> }
```

## 与Palantir Foundry + AIP对比

| 能力 | Palantir Foundry + AIP | 本平台 V2 |
|------|------------------------|-----------|
| 数据集成 | ✓ | ✓ (DataSourceManager) |
| 本体建模 | ✓ | ✓ (OntologyGraph) |
| 工作流编排 | ✓ | ✓ (WorkflowStudio) |
| Agent系统 | ✓ | ✓ (AgentRuntime) |
| 推演仿真 | ✓ | ✓ (SimulationLab) |
| 决策空间 | ✓ | ✓ (DecisionSpace) |
| 技能市场 | ✗ | ✓ (SkillMarket) |
| 工业场景 | 通用 | 锂电专用优化 |

## 总结

本融合方案实现了:
1. ✅ **保留所有现有功能** - 向后兼容
2. ✅ **新增3大核心模块** - Workflow、Simulation、SkillMarket
3. ✅ **100+ Workflow节点** - 覆盖数据到执行的完整链路
4. ✅ **完整类型系统** - 支持数据库DDL映射
5. ✅ **Agent Runtime** - 多Agent编排执行
6. ✅ **可解释性框架** - 为后续XAI预留

架构核心:
**数据 → 对象 → 本体 → Agent → 工具 → 工作流 → 推演 → 决策**
