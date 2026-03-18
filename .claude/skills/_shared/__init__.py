"""
Claude Code Skills 共享工具库

提供 Skill 开发常用的辅助功能：
- data_loader: 数据加载和格式处理
- history_manager: 执行历史记录和记忆功能
- config_manager: 配置管理和初始化
- validator: 输入验证和规则检查
- report_generator: 报告生成和格式化

使用方法:
    from shared import data_loader, history_manager
    from shared.config_manager import ConfigManager
    from shared.validator import InputValidator
"""

__version__ = "1.0.0"

# 便捷导入
from . import data_loader
from . import history_manager
from . import config_manager
from . import validator
from . import report_generator

__all__ = [
    'data_loader',
    'history_manager',
    'config_manager',
    'validator',
    'report_generator',
]
