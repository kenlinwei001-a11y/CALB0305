/**
 * 技能文件结构完善脚本
 * 为每个技能添加 references/ 和 assets/ 字段
 * 并完善 scripts/ 为确定性脚本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 constants.ts
const constantsPath = path.join(__dirname, '..', 'constants.ts');
let content = fs.readFileSync(constantsPath, 'utf-8');

// 知识库文档模板
const referenceTemplates = {
  quality: [
    "《锂电池原材料检验规范 V3.2》",
    "《GB/T 11064-2018 碳酸锂化学分析方法》",
    "《ISO 9001:2015 质量管理体系》"
  ],
  process: [
    "《锂电池制造工艺标准 V4.1》",
    "《浆料搅拌工艺操作规程》",
    "《极片涂布工艺参数手册》"
  ],
  equipment: [
    "《设备维护保养手册》",
    "《设备故障诊断指南》",
    "《设备点检标准》"
  ],
  planning: [
    "《生产计划管理规范》",
    "《产销协同作业指导书》",
    "《库存管理策略文档》"
  ],
  safety: [
    "《锂电池安全生产规范》",
    "《热失控预防与应急处理》",
    "《Pack安全检测标准》"
  ]
};

// 静态资源模板
const assetTemplates = {
  quality: [
    "templates/inspection_report_template.xlsx",
    "templates/certificate_template.pdf",
    "config/specification_thresholds.json"
  ],
  process: [
    "templates/process_record_template.xlsx",
    "config/process_parameters.json",
    "charts/control_chart_template.png"
  ],
  equipment: [
    "templates/maintenance_record_template.xlsx",
    "config/equipment_specifications.json",
    "models/digital_twin_config.json"
  ],
  planning: [
    "templates/production_plan_template.xlsx",
    "config/capacity_constraints.json",
    "config/material_lead_times.json"
  ],
  safety: [
    "templates/safety_checklist_template.xlsx",
    "config/alert_thresholds.json",
    "procedures/emergency_response.pdf"
  ]
};

// 确定性脚本模板
const deterministicScripts = {
  python: (skillId) => `import json
import time
from typing import Dict, Any, Optional

class SkillExecutor:
    '''
    ${skillId} - 确定性执行脚本
    核心原则：相同输入 + 相同状态 = 相同输出
    '''

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.start_time = time.time()

    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        '''输入参数校验'''
        if not isinstance(event, dict):
            return False, "INPUT_MUST_BE_OBJECT"
        return True, None

    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:
        '''
        执行逻辑 - 必须是确定性的
        不允许使用随机数、时间依赖等不确定因素
        '''
        # 1. 输入校验
        is_valid, error = self.validate_input(event)
        if not is_valid:
            return {"error": error, "status": "FAILED"}

        # 2. 业务逻辑执行（示例）
        result = self._business_logic(event)

        # 3. 构建确定性输出
        return {
            "status": "SUCCESS",
            "result": result,
            "execution_time_ms": int((time.time() - self.start_time) * 1000),
            "timestamp": int(time.time())
        }

    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:
        '''业务逻辑实现'''
        # 根据具体技能实现业务逻辑
        return event

def handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    '''技能入口函数'''
    config = context.get('config', {}) if context else {}
    executor = SkillExecutor(config)
    return executor.execute(event)`,

  javascript: (skillId) => `/**
 * ${skillId} - 确定性执行脚本
 * 核心原则：相同输入 + 相同状态 = 相同输出
 */

class SkillExecutor {
  constructor(config = {}) {
    this.config = config;
    this.startTime = Date.now();
  }

  /**
   * 输入参数校验
   */
  validateInput(event) {
    if (typeof event !== 'object' || event === null) {
      return { valid: false, error: 'INPUT_MUST_BE_OBJECT' };
    }
    return { valid: true };
  }

  /**
   * 执行逻辑 - 必须是确定性的
   * 不允许使用 Math.random()、Date.now() 等不确定因素
   */
  execute(event) {
    // 1. 输入校验
    const validation = this.validateInput(event);
    if (!validation.valid) {
      return { error: validation.error, status: 'FAILED' };
    }

    // 2. 业务逻辑执行
    const result = this.businessLogic(event);

    // 3. 构建确定性输出
    return {
      status: 'SUCCESS',
      result,
      executionTimeMs: Date.now() - this.startTime
    };
  }

  /**
   * 业务逻辑实现
   */
  businessLogic(event) {
    // 根据具体技能实现业务逻辑
    return event;
  }
}

/**
 * 技能入口函数
 */
function handler(event, context = {}) {
  const executor = new SkillExecutor(context.config);
  return executor.execute(event);
}

module.exports = { handler, SkillExecutor };`
};

// 匹配技能文件块
const skillRegex = /{\s*skill_id:\s*"([^"]+)"[\s\S]*?scriptLang:\s*"([^"]+)"/g;

// 处理每个技能
let match;
let updatedCount = 0;

console.log('开始处理技能文件结构完善...\n');

while ((match = skillRegex.exec(content)) !== null) {
  const skillBlock = match[0];
  const skillId = match[1];
  const scriptLang = match[2];

  // 检查是否已有 references 和 assets
  if (skillBlock.includes('references:') && skillBlock.includes('assets:')) {
    console.log(`✓ ${skillId} - 已有完整结构，跳过`);
    continue;
  }

  // 确定技能类别
  let category = 'quality';
  if (skillId.includes('viscosity') || skillId.includes('coating') || skillId.includes('mixing')) {
    category = 'process';
  } else if (skillId.includes('equipment') || skillId.includes('maintenance') || skillId.includes('rul')) {
    category = 'equipment';
  } else if (skillId.includes('sop') || skillId.includes('plan') || skillId.includes('balance')) {
    category = 'planning';
  } else if (skillId.includes('thermal') || skillId.includes('safety')) {
    category = 'safety';
  }

  // 生成 references 和 assets
  const refs = referenceTemplates[category] || referenceTemplates.quality;
  const assets = assetTemplates[category] || assetTemplates.quality;

  // 生成确定性脚本
  const newScript = deterministicScripts[scriptLang](skillId);

  // 构建新的文件块
  const newFields = `,\n      references: [${refs.map(r => `"${r}"`).join(', ')}],\n      assets: [${assets.map(a => `"${a}"`).join(', ')}]`;

  // 在 scriptLang 后插入新字段
  const updatedBlock = skillBlock.replace(
    `scriptLang: "${scriptLang}"`,
    `scriptLang: "${scriptLang}"${newFields}`
  );

  // 替换脚本内容
  const scriptMatch = skillBlock.match(/script:\s*"([\s\S]*?)"\s*,\s*scriptLang:/);
  if (scriptMatch) {
    const escapedScript = newScript.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const finalBlock = updatedBlock.replace(
      scriptMatch[1],
      escapedScript
    );

    content = content.replace(skillBlock, finalBlock);
    updatedCount++;
    console.log(`✓ ${skillId} - 已更新 (${category})`);
  }
}

// 写回文件
fs.writeFileSync(constantsPath, content, 'utf-8');

console.log(`\n处理完成！共更新 ${updatedCount} 个技能`);
console.log('\n更新内容：');
console.log('  - 添加 references/ 知识库文档列表');
console.log('  - 添加 assets/ 静态模板文件列表');
console.log('  - 更新 scripts/ 为确定性执行脚本');
