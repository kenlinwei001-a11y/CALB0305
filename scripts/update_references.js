/**
 * 为每个技能分配专业的参考文献
 * 根据技能ID、名称和领域分配符合其特点的references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 专业参考文献库
const referenceLibrary = {
  // 质量检测类
  material_purity: [
    "《GB/T 11064-2018 碳酸锂、单水氢氧化锂、氯化锂化学分析方法》",
    "《GB/T 24533-2019 锂离子电池石墨类负极材料》",
    "《YS/T 582-2013 电池级碳酸锂》",
    "《锂电池原材料来料检验规范 V3.2》",
    "《近红外光谱分析技术在锂电材料检测中的应用》"
  ],

  // 浆料/涂布工艺
  slurry_coating: [
    "《锂电池制造工艺标准 V4.1》",
    "《浆料搅拌工艺操作规程》",
    "《极片涂布工艺参数手册》",
    "《GB/T 36276-2018 电力储能用锂离子电池》",
    "《锂电池浆料流变特性研究》论文"
  ],

  // 辊压工艺
  calendaring: [
    "《极片辊压工艺技术规范》",
    "《锂电池极片压实密度控制标准》",
    "《辊压机操作规程 V2.0》",
    "《极片机械强度测试方法》"
  ],

  // 卷绕/装配
  winding_assembly: [
    "《锂电池卷绕工艺标准》",
    "《电芯装配工艺规程》",
    "《张力控制技术在锂电制造中的应用》",
    "《卷绕机操作与维护手册》"
  ],

  // 注液/化成
  electrolyte_formation: [
    "《电解液注入工艺规范》",
    "《锂电池化成工艺标准》",
    "《浸润效果评估方法》",
    "《化成设备操作规程》"
  ],

  // 容量预测
  capacity_prediction: [
    "《锂电池容量分选标准》",
    "《化成曲线分析方法》",
    "《电池一致性评价方法》",
    "《容量预测模型技术规范》"
  ],

  // 热失控/安全
  thermal_safety: [
    "《GB 38031-2020 电动汽车用动力蓄电池安全要求》",
    "《锂电池热失控预警系统设计规范》",
    "《Pack级安全检测标准》",
    "《热失控机理及防控技术》"
  ],

  // 产销计划
  production_planning: [
    "《生产计划管理规范》",
    "《产销协同作业指导书》",
    "《S&OP产销平衡管理办法》",
    "《化成柜产能规划指南》",
    "《锂电池制造TOC管理实践》"
  ],

  // 设备维护
  maintenance: [
    "《设备全生命周期管理规范》",
    "《预测性维护实施指南》",
    "《设备故障诊断技术手册》",
    "《振动分析与故障诊断》",
    "《设备RUL预测模型规范》"
  ],

  // 库存优化
  inventory: [
    "《库存管理策略与实施》",
    "《安全库存计算方法》",
    "《正极材料JIT供应管理》",
    "《库存周转优化实践》"
  ],

  // 需求预测
  demand_forecast: [
    "《需求预测模型技术规范》",
    "《时间序列分析方法》",
    "《销售预测与计划管理》",
    "《市场分析与需求规划》"
  ],

  // 产能评估
  capacity_evaluation: [
    "《产能评估与规划方法》",
    "《OEE设备综合效率分析》",
    "《产能瓶颈识别技术》",
    "《产线平衡优化方法》"
  ],

  // 排程优化
  scheduling: [
    "《生产排程优化算法》",
    "《APS高级计划排程系统规范》",
    "《多约束排程问题求解》",
    "《智能排程系统实施指南》"
  ],

  // 供应链
  supply_chain: [
    "《供应链协同管理规范》",
    "《供应商管理办法》",
    "《物流配送优化指南》",
    "《供应链风险管理》"
  ],

  // 订单交付
  order_fulfillment: [
    "《订单履行流程规范》",
    "《交付准时率管理》",
    "《客户订单跟踪系统操作手册》",
    "《订单变更管理流程》"
  ],

  // 财务分析
  financial_analysis: [
    "《项目投资财务评价方法》",
    "《NPV/IRR计算方法规范》",
    "《敏感性分析技术指南》",
    "《锂电池项目可行性研究》"
  ],

  // 选址/市场
  location_market: [
    "《生产基地选址评估方法》",
    "《市场预测与竞争分析》",
    "《区域投资环境评价》",
    "《锂电池产业布局规划》"
  ],

  // 仿真模拟
  simulation: [
    "《蒙特卡洛模拟应用指南》",
    "《系统动力学建模方法》",
    "《离散事件仿真技术》",
    "《What-if分析方法》"
  ],

  // 风险评估
  risk_assessment: [
    "《项目风险评估方法》",
    "《风险矩阵分析技术》",
    "《供应链风险识别》",
    "《风险评估报告编制规范》"
  ],

  // OEE/设备效率
  oee_equipment: [
    "《OEE设备综合效率分析》",
    "《设备性能评价指标》",
    "《TPM全面生产维护》",
    "《设备效率提升方法》"
  ],

  // 能耗/碳足迹
  energy_carbon: [
    "《工厂能耗监测规范》",
    "《碳足迹核算方法》",
    "《能源管理体系标准》",
    "《节能诊断技术指南》"
  ],

  // 成本控制
  cost_control: [
    "《生产成本核算规范》",
    "《成本分析与控制方法》",
    "《标准成本制定指南》",
    "《降本增效实施方案》"
  ],

  // 异常检测/根因分析
  anomaly_rootcause: [
    "《异常检测算法应用》",
    "《根因分析方法论》",
    "《SPC统计过程控制》",
    "《质量异常处理流程》"
  ],

  // 原子技能 - 时间序列
  atom_time_series: [
    "《时间序列分析理论与应用》",
    "《ARIMA模型详解》",
    "《LSTM时序预测方法》",
    "《Prophet预测框架》"
  ],

  // 原子技能 - 优化算法
  atom_optimization: [
    "《运筹学优化方法》",
    "《线性规划求解技术》",
    "《混合整数规划算法》",
    "《多目标优化方法》"
  ],

  // 原子技能 - 机器学习
  atom_ml: [
    "《机器学习实战》",
    "《统计学习方法》",
    "《深度学习理论与实践》",
    "《特征工程方法》"
  ],

  // 原子技能 - 概率统计
  atom_probability: [
    "《概率论与数理统计》",
    "《贝叶斯统计推断》",
    "《蒙特卡洛方法》",
    "《概率分布拟合技术》"
  ],

  // 原子技能 - 图算法
  atom_graph: [
    "《图论与网络流》",
    "《因果推断方法》",
    "《图神经网络基础》",
    "《路径规划算法》"
  ],

  // 场景技能 - 预测性维护
  scenario_maintenance: [
    "《预测性维护体系构建》",
    "《设备健康管理技术》",
    "《故障预测与健康管理(PHM)》",
    "《维修决策优化方法》"
  ],

  // 场景技能 - 产销匹配
  scenario_production_sales: [
    "《产销协同管理实践》",
    "《S&OP产销平衡方法》",
    "《需求与产能匹配技术》",
    "《生产计划优化策略》"
  ],

  // 场景技能 - 投资决策
  scenario_investment: [
    "《投资项目可行性研究》",
    "《资本预算决策方法》",
    "《投资风险评估技术》",
    "《财务建模与分析》"
  ],

  // 通用
  general: [
    "《ISO 9001:2015 质量管理体系》",
    "《IATF 16949 汽车行业质量管理体系》",
    "《锂电池行业最佳实践》"
  ]
};

// 为技能匹配参考文献的函数
function matchReferences(skill) {
  const skillId = skill.skill_id.toLowerCase();
  const name = skill.name.toLowerCase();
  const tags = skill.capability_tags.map(t => t.toLowerCase());

  // 根据技能ID和名称匹配
  if (skillId.includes('material') || skillId.includes('purity') || name.includes('原料') || name.includes('纯度')) {
    return referenceLibrary.material_purity;
  }

  if (skillId.includes('viscosity') || skillId.includes('slurry') || skillId.includes('mixing') ||
      name.includes('浆料') || name.includes('粘度') || name.includes('搅拌')) {
    return referenceLibrary.slurry_coating;
  }

  if (skillId.includes('coating') || skillId.includes('thickness') || name.includes('涂布') || name.includes('厚度')) {
    return referenceLibrary.slurry_coating;
  }

  if (skillId.includes('roller') || skillId.includes('calendaring') || skillId.includes('pressure') ||
      name.includes('辊压') || name.includes('压力')) {
    return referenceLibrary.calendaring;
  }

  if (skillId.includes('tension') || skillId.includes('winding') || name.includes('张力') || name.includes('卷绕')) {
    return referenceLibrary.winding_assembly;
  }

  if (skillId.includes('electrolyte') || skillId.includes('soaking') || skillId.includes('formation') ||
      name.includes('注液') || name.includes('浸润') || name.includes('化成')) {
    return referenceLibrary.electrolyte_formation;
  }

  if (skillId.includes('capacity') || name.includes('容量') || name.includes('分容')) {
    return referenceLibrary.capacity_prediction;
  }

  if (skillId.includes('thermal') || skillId.includes('safety') || skillId.includes('runaway') ||
      name.includes('热失控') || name.includes('安全')) {
    return referenceLibrary.thermal_safety;
  }

  if (skillId.includes('sop') || skillId.includes('balancer') || name.includes('产销') || name.includes('平衡')) {
    return referenceLibrary.production_planning;
  }

  if ((skillId.includes('equipment') || skillId.includes('maintenance') || skillId.includes('rul') ||
       name.includes('设备') || name.includes('维护') || name.includes('寿命')) &&
      !skillId.includes('atom')) {
    return referenceLibrary.maintenance;
  }

  if (skillId.includes('repair') || name.includes('维修') || name.includes('修复')) {
    return referenceLibrary.maintenance;
  }

  if (skillId.includes('inventory') || name.includes('库存') || name.includes('周转')) {
    return referenceLibrary.inventory;
  }

  if ((skillId.includes('demand') || skillId.includes('forecast') || name.includes('需求') || name.includes('预测')) &&
      !skillId.includes('atom')) {
    return referenceLibrary.demand_forecast;
  }

  if (skillId.includes('capacity') && (skillId.includes('evaluation') || skillId.includes('planning')) ||
      name.includes('产能') || name.includes('评估')) {
    return referenceLibrary.capacity_evaluation;
  }

  if (skillId.includes('scheduling') || name.includes('排程') || name.includes('调度')) {
    return referenceLibrary.scheduling;
  }

  if (skillId.includes('supply') || skillId.includes('chain') || name.includes('供应链')) {
    return referenceLibrary.supply_chain;
  }

  if (skillId.includes('logistics') || skillId.includes('delivery') || name.includes('物流') || name.includes('交付')) {
    return referenceLibrary.supply_chain;
  }

  if (skillId.includes('order') && skillId.includes('fulfillment') || name.includes('订单') || name.includes('履行')) {
    return referenceLibrary.order_fulfillment;
  }

  if (skillId.includes('npv') || skillId.includes('capex') || skillId.includes('financial') ||
      name.includes('npv') || name.includes('投资') || name.includes('财务')) {
    return referenceLibrary.financial_analysis;
  }

  if (skillId.includes('location') || skillId.includes('site') || skillId.includes('market') ||
      name.includes('选址') || name.includes('市场')) {
    return referenceLibrary.location_market;
  }

  if (skillId.includes('simulation') || skillId.includes('monte') || name.includes('仿真') || name.includes('模拟')) {
    return referenceLibrary.simulation;
  }

  if (skillId.includes('risk') || name.includes('风险') || name.includes('评估')) {
    return referenceLibrary.risk_assessment;
  }

  if (skillId.includes('oee') || (name.includes('oee') || name.includes('效率')) &&
      !skillId.includes('atom')) {
    return referenceLibrary.oee_equipment;
  }

  if (skillId.includes('energy') || skillId.includes('carbon') || name.includes('能耗') || name.includes('碳')) {
    return referenceLibrary.energy_carbon;
  }

  if (skillId.includes('cost') || name.includes('成本')) {
    return referenceLibrary.cost_control;
  }

  if (skillId.includes('anomaly') || skillId.includes('root') || name.includes('异常') || name.includes('根因')) {
    return referenceLibrary.anomaly_rootcause;
  }

  if (skillId.includes('quality') && !skillId.includes('atom') || name.includes('质量')) {
    return referenceLibrary.material_purity;
  }

  // 原子技能分类
  if (skillId.includes('atom_time') || skillId.includes('forecast')) {
    return referenceLibrary.atom_time_series;
  }

  if (skillId.includes('atom_linear') || skillId.includes('atom_mixed') ||
      skillId.includes('atom_optimization') || skillId.includes('programming')) {
    return referenceLibrary.atom_optimization;
  }

  if (skillId.includes('atom_classification') || skillId.includes('atom_clustering') ||
      skillId.includes('atom_regression') || skillId.includes('atom_ml')) {
    return referenceLibrary.atom_ml;
  }

  if (skillId.includes('atom_probability') || skillId.includes('atom_bayesian') ||
      skillId.includes('atom_monte') || skillId.includes('distribution')) {
    return referenceLibrary.atom_probability;
  }

  if (skillId.includes('atom_graph') || skillId.includes('atom_causal') ||
      skillId.includes('atom_path') || skillId.includes('atom_network')) {
    return referenceLibrary.atom_graph;
  }

  // 场景技能分类
  if (skillId.includes('scenario') && (skillId.includes('maintenance') || skillId.includes('downtime'))) {
    return referenceLibrary.scenario_maintenance;
  }

  if (skillId.includes('scenario') && (skillId.includes('production') || skillId.includes('sales') ||
      skillId.includes('demand') || skillId.includes('inventory'))) {
    return referenceLibrary.scenario_production_sales;
  }

  if (skillId.includes('scenario') && (skillId.includes('investment') || skillId.includes('capex') ||
      skillId.includes('expansion'))) {
    return referenceLibrary.scenario_investment;
  }

  // 领域技能
  if (skillId.includes('domain_equipment') || skillId.includes('domain_rul')) {
    return referenceLibrary.maintenance;
  }

  if (skillId.includes('domain_scheduling') || skillId.includes('domain_line')) {
    return referenceLibrary.scheduling;
  }

  if (skillId.includes('domain_yield') || skillId.includes('domain_process')) {
    return referenceLibrary.material_purity;
  }

  // 默认返回通用参考文献
  return referenceLibrary.general;
}

// 读取constants.ts
const constantsPath = path.join(__dirname, '..', 'constants.ts');
let content = fs.readFileSync(constantsPath, 'utf-8');

// 提取所有技能块
const skillRegex = /{\s*skill_id:\s*"([^"]+)"[\s\S]*?assets:\s*\[[^\]]*\]\s*}/g;

let match;
let updatedCount = 0;
const skills = [];

console.log('开始为技能分配专业参考文献...\n');

// 先收集所有技能信息
while ((match = skillRegex.exec(content)) !== null) {
  const skillBlock = match[0];
  const skillId = match[1];

  // 提取技能名称
  const nameMatch = skillBlock.match(/name:\s*"([^"]+)"/);
  const name = nameMatch ? nameMatch[1] : '';

  // 提取capability_tags
  const tagsMatch = skillBlock.match(/capability_tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];

  skills.push({
    skill_id: skillId,
    name: name,
    capability_tags: tags,
    originalBlock: skillBlock
  });
}

// 为每个技能分配参考文献并更新
for (const skill of skills) {
  const newReferences = matchReferences(skill);

  // 检查当前的references
  const currentRefMatch = skill.originalBlock.match(/references:\s*\[([^\]]*)\]/);
  if (currentRefMatch) {
    // 构建新的references字符串
    const newRefStr = `references: [${newReferences.map(r => `"${r}"`).join(', ')}]`;

    // 替换references
    const updatedBlock = skill.originalBlock.replace(
      /references:\s*\[[^\]]*\]/,
      newRefStr
    );

    // 更新内容
    content = content.replace(skill.originalBlock, updatedBlock);
    updatedCount++;

    console.log(`✓ ${skill.skill_id}`);
    console.log(`  名称: ${skill.name}`);
    console.log(`  参考文献: ${newReferences.length} 条`);
    console.log(`  首条: ${newReferences[0].substring(0, 40)}...\n`);
  }
}

// 写回文件
fs.writeFileSync(constantsPath, content, 'utf-8');

console.log(`\n处理完成！共更新 ${updatedCount} 个技能的参考文献`);
console.log('\n每个技能现在都有与其专业领域相关的参考文献');
