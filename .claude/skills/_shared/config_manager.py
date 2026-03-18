"""
共享配置管理器 - 处理 Skill 的配置文件
用于：用户偏好存储、初始化设置、多环境配置
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict


@dataclass
class ConfigSchema:
    """配置模式定义"""
    key: str
    label: str
    description: str
    type: str  # 'string', 'number', 'boolean', 'select', 'list'
    required: bool = False
    default: Any = None
    options: Optional[List[Dict[str, str]]] = None  # 用于 select 类型
    validation: Optional[Dict[str, Any]] = None  # 验证规则


class ConfigManager:
    """
    Skill 配置管理器

    管理每个 Skill 的 config.json 文件，支持：
    1. 配置初始化（首次使用询问用户）
    2. 配置读取和更新
    3. 配置验证
    4. 多环境支持（dev/prod）
    """

    def __init__(self, skill_id: str, config_dir: str = ".claude/skills"):
        """
        初始化配置管理器

        Args:
            skill_id: Skill 标识
            config_dir: 配置目录基路径
        """
        self.skill_id = skill_id
        self.config_dir = Path(config_dir) / skill_id
        self.config_path = self.config_dir / "config.json"
        self._cache: Optional[Dict[str, Any]] = None

    def exists(self) -> bool:
        """检查配置文件是否存在"""
        return self.config_path.exists()

    def load(self, use_cache: bool = True) -> Dict[str, Any]:
        """
        加载配置

        Args:
            use_cache: 是否使用缓存

        Returns:
            配置字典
        """
        if use_cache and self._cache is not None:
            return self._cache.copy()

        if not self.exists():
            return {}

        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                self._cache = config
                return config.copy()
        except (json.JSONDecodeError, IOError):
            return {}

    def save(self, config: Dict[str, Any]) -> None:
        """
        保存配置

        Args:
            config: 配置字典
        """
        self.config_dir.mkdir(parents=True, exist_ok=True)

        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

        self._cache = config.copy()

    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置项

        Args:
            key: 配置键
            default: 默认值

        Returns:
            配置值
        """
        config = self.load()
        return config.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """
        设置配置项

        Args:
            key: 配置键
            value: 配置值
        """
        config = self.load(use_cache=False)
        config[key] = value
        self.save(config)

    def update(self, updates: Dict[str, Any]) -> None:
        """
        批量更新配置

        Args:
            updates: 更新字典
        """
        config = self.load(use_cache=False)
        config.update(updates)
        self.save(config)

    def delete(self, key: str) -> bool:
        """
        删除配置项

        Args:
            key: 配置键

        Returns:
            是否成功删除
        """
        config = self.load(use_cache=False)
        if key in config:
            del config[key]
            self.save(config)
            return True
        return False

    def initialize(
        self,
        schema: List[ConfigSchema],
        force: bool = False,
        interactive: bool = False
    ) -> Dict[str, Any]:
        """
        初始化配置

        Gotcha: 首次使用 Skill 时必须初始化配置，否则可能使用错误默认值

        Args:
            schema: 配置模式列表
            force: 是否强制重新初始化
            interactive: 是否交互式询问（CLI 模式）

        Returns:
            初始化后的配置
        """
        if self.exists() and not force:
            return self.load()

        config = {
            "_meta": {
                "skill_id": self.skill_id,
                "initialized": True,
                "version": "1.0.0"
            }
        }

        for field in schema:
            value = field.default

            # 交互式询问（仅在 CLI 模式下）
            if interactive and field.required:
                print(f"\n{field.label}")
                print(f"  {field.description}")

                if field.type == 'select' and field.options:
                    for i, opt in enumerate(field.options):
                        print(f"  {i+1}. {opt['label']}")
                    choice = input("请选择 (数字): ")
                    try:
                        value = field.options[int(choice)-1]['value']
                    except (ValueError, IndexError):
                        value = field.default
                elif field.type == 'boolean':
                    choice = input(f"{field.label} (y/n): ").lower()
                    value = choice in ['y', 'yes', 'true', '1']
                else:
                    user_input = input(f"{field.label} [{field.default}]: ")
                    value = user_input if user_input else field.default

            config[field.key] = value

        self.save(config)
        return config

    def validate(self, schema: List[ConfigSchema]) -> List[str]:
        """
        验证配置是否符合模式

        Args:
            schema: 配置模式列表

        Returns:
            错误信息列表
        """
        config = self.load()
        errors = []

        for field in schema:
            # 检查必需字段
            if field.required and field.key not in config:
                errors.append(f"缺少必需配置项: {field.label} ({field.key})")
                continue

            if field.key not in config:
                continue

            value = config[field.key]

            # 类型验证
            if field.type == 'string' and not isinstance(value, str):
                errors.append(f"{field.label} 必须是字符串")
            elif field.type == 'number' and not isinstance(value, (int, float)):
                errors.append(f"{field.label} 必须是数字")
            elif field.type == 'boolean' and not isinstance(value, bool):
                errors.append(f"{field.label} 必须是布尔值")
            elif field.type == 'list' and not isinstance(value, list):
                errors.append(f"{field.label} 必须是列表")

            # 验证规则
            if field.validation and value is not None:
                if 'min' in field.validation and isinstance(value, (int, float)):
                    if value < field.validation['min']:
                        errors.append(f"{field.label} 不能小于 {field.validation['min']}")

                if 'max' in field.validation and isinstance(value, (int, float)):
                    if value > field.validation['max']:
                        errors.append(f"{field.label} 不能大于 {field.validation['max']}")

                if 'pattern' in field.validation and isinstance(value, str):
                    import re
                    if not re.match(field.validation['pattern'], value):
                        errors.append(f"{field.label} 格式不正确")

        return errors

    def get_environment(self) -> str:
        """
        获取当前环境

        Returns:
            环境名称: 'development', 'staging', 'production'
        """
        return self.get('environment', 'development')

    def is_production(self) -> bool:
        """检查是否为生产环境"""
        return self.get_environment() == 'production'

    def reset(self) -> None:
        """重置配置（删除配置文件）"""
        if self.config_path.exists():
            self.config_path.unlink()
        self._cache = None


def create_default_config(skill_id: str, **kwargs) -> Dict[str, Any]:
    """
    创建默认配置模板

    Args:
        skill_id: Skill 标识
        **kwargs: 额外的默认配置

    Returns:
        默认配置字典
    """
    config = {
        "_meta": {
            "skill_id": skill_id,
            "initialized": True,
            "version": "1.0.0"
        },
        "environment": "development",
        "output_format": "json",
        "log_level": "info",
        "auto_save": True
    }
    config.update(kwargs)
    return config


if __name__ == '__main__':
    # 测试代码
    print("测试配置管理器...")

    # 创建测试配置
    manager = ConfigManager("test-skill", ".claude/test-skills")

    # 定义配置模式
    schema = [
        ConfigSchema(
            key="inspection_standard",
            label="检验标准",
            description="选择默认检验标准",
            type="select",
            required=True,
            default="国标",
            options=[
                {"value": "国标", "label": "国家标准"},
                {"value": "企标", "label": "企业标准"},
                {"value": "客户定制", "label": "客户定制标准"}
            ]
        ),
        ConfigSchema(
            key="purity_threshold",
            label="纯度阈值",
            description="最低纯度要求（%）",
            type="number",
            required=True,
            default=99.5,
            validation={"min": 95.0, "max": 100.0}
        ),
        ConfigSchema(
            key="auto_send_email",
            label="自动发送邮件",
            description="检验完成后自动发送报告",
            type="boolean",
            required=False,
            default=False
        )
    ]

    # 初始化配置
    config = manager.initialize(schema, force=True)
    print(f"初始化配置: {json.dumps(config, ensure_ascii=False, indent=2)}")

    # 验证配置
    errors = manager.validate(schema)
    print(f"验证错误: {errors}")

    # 更新配置
    manager.set("purity_threshold", 99.8)
    print(f"更新后纯度阈值: {manager.get('purity_threshold')}")

    # 清理
    manager.reset()
