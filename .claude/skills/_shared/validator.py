"""
共享输入验证器 - 验证 Skill 输入数据的通用工具
用于：数据格式检查、业务规则验证、依赖检查
"""

import re
from typing import Dict, Any, List, Optional, Callable, Union
from enum import Enum
from dataclasses import dataclass


class ValidationSeverity(Enum):
    """验证严重程度"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ValidationResult:
    """验证结果"""
    is_valid: bool
    message: str
    severity: ValidationSeverity
    field: Optional[str] = None
    suggestion: Optional[str] = None


class InputValidator:
    """
    输入数据验证器

    提供常见的验证规则：
    1. 必需字段检查
    2. 类型检查
    3. 格式验证（正则）
    4. 范围验证
    5. 枚举值验证
    6. 自定义验证规则
    """

    @staticmethod
    def validate_required(
        data: Dict[str, Any],
        fields: List[str]
    ) -> List[ValidationResult]:
        """
        验证必需字段

        Args:
            data: 输入数据
            fields: 必需字段列表

        Returns:
            验证结果列表
        """
        results = []
        for field in fields:
            if field not in data or data[field] is None or data[field] == "":
                results.append(ValidationResult(
                    is_valid=False,
                    message=f"缺少必需字段: {field}",
                    severity=ValidationSeverity.ERROR,
                    field=field,
                    suggestion=f"请提供 {field} 的值"
                ))
        return results

    @staticmethod
    def validate_type(
        data: Dict[str, Any],
        field_types: Dict[str, type]
    ) -> List[ValidationResult]:
        """
        验证字段类型

        Args:
            data: 输入数据
            field_types: 字段类型映射 {字段名: 期望类型}

        Returns:
            验证结果列表
        """
        results = []
        for field, expected_type in field_types.items():
            if field in data and data[field] is not None:
                if not isinstance(data[field], expected_type):
                    actual_type = type(data[field]).__name__
                    expected_type_name = expected_type.__name__
                    results.append(ValidationResult(
                        is_valid=False,
                        message=f"字段 {field} 类型错误: 期望 {expected_type_name}，实际 {actual_type}",
                        severity=ValidationSeverity.ERROR,
                        field=field,
                        suggestion=f"请将 {field} 转换为 {expected_type_name} 类型"
                    ))
        return results

    @staticmethod
    def validate_pattern(
        data: Dict[str, Any],
        field_patterns: Dict[str, str]
    ) -> List[ValidationResult]:
        """
        验证字段格式（正则）

        Args:
            data: 输入数据
            field_patterns: 字段正则映射 {字段名: 正则表达式}

        Returns:
            验证结果列表
        """
        results = []
        for field, pattern in field_patterns.items():
            if field in data and data[field] is not None:
                value = str(data[field])
                if not re.match(pattern, value):
                    results.append(ValidationResult(
                        is_valid=False,
                        message=f"字段 {field} 格式不正确: {value}",
                        severity=ValidationSeverity.ERROR,
                        field=field,
                        suggestion=f"请确保 {field} 符合格式要求"
                    ))
        return results

    @staticmethod
    def validate_range(
        data: Dict[str, Any],
        field_ranges: Dict[str, Dict[str, float]]
    ) -> List[ValidationResult]:
        """
        验证数值范围

        Args:
            data: 输入数据
            field_ranges: 字段范围映射 {字段名: {min: x, max: y}}

        Returns:
            验证结果列表
        """
        results = []
        for field, range_spec in field_ranges.items():
            if field in data and data[field] is not None:
                value = data[field]
                if not isinstance(value, (int, float)):
                    continue

                min_val = range_spec.get('min')
                max_val = range_spec.get('max')

                if min_val is not None and value < min_val:
                    results.append(ValidationResult(
                        is_valid=False,
                        message=f"字段 {field} 值 {value} 小于最小值 {min_val}",
                        severity=ValidationSeverity.ERROR,
                        field=field,
                        suggestion=f"请确保 {field} >= {min_val}"
                    ))

                if max_val is not None and value > max_val:
                    results.append(ValidationResult(
                        is_valid=False,
                        message=f"字段 {field} 值 {value} 大于最大值 {max_val}",
                        severity=ValidationSeverity.ERROR,
                        field=field,
                        suggestion=f"请确保 {field} <= {max_val}"
                    ))
        return results

    @staticmethod
    def validate_enum(
        data: Dict[str, Any],
        field_enums: Dict[str, List[str]]
    ) -> List[ValidationResult]:
        """
        验证枚举值

        Args:
            data: 输入数据
            field_enums: 字段枚举映射 {字段名: [允许值列表]}

        Returns:
            验证结果列表
        """
        results = []
        for field, allowed_values in field_enums.items():
            if field in data and data[field] is not None:
                value = data[field]
                if value not in allowed_values:
                    results.append(ValidationResult(
                        is_valid=False,
                        message=f"字段 {field} 值 '{value}' 不在允许值列表中",
                        severity=ValidationSeverity.ERROR,
                        field=field,
                        suggestion=f"请使用以下值之一: {', '.join(allowed_values)}"
                    ))
        return results

    @staticmethod
    def validate_batch_id(batch_id: str) -> ValidationResult:
        """
        验证批次号格式

        Gotcha: 批次号格式可能不一致，此验证确保格式基本正确

        Args:
            batch_id: 批次号

        Returns:
            验证结果
        """
        if not batch_id:
            return ValidationResult(
                is_valid=False,
                message="批次号不能为空",
                severity=ValidationSeverity.ERROR,
                suggestion="请提供有效的批次号"
            )

        # 常见的批次号格式
        patterns = [
            r'^\d{4}\d{2}\d{5}$',      # YYYYMMDDXXX
            r'^\d{4}-\d{2}-\d{3}$',    # YYYY-MM-XXX
            r'^\d{2}-\d{2}-\d{3}$',    # YY-MM-XXX
            r'^BATCH\d+$',             # BATCHXXXX
        ]

        batch_upper = batch_id.upper().strip()
        for pattern in patterns:
            if re.match(pattern, batch_upper):
                return ValidationResult(
                    is_valid=True,
                    message="批次号格式正确",
                    severity=ValidationSeverity.INFO
                )

        return ValidationResult(
            is_valid=False,
            message=f"批次号 '{batch_id}' 格式不标准",
            severity=ValidationSeverity.WARNING,
            suggestion="建议使用格式: YYYYMMDDXXX (如 202403001)"
        )

    @staticmethod
    def validate_date_string(
        date_str: str,
        field_name: str = "日期"
    ) -> ValidationResult:
        """
        验证日期字符串

        Args:
            date_str: 日期字符串
            field_name: 字段名称（用于错误消息）

        Returns:
            验证结果
        """
        if not date_str:
            return ValidationResult(
                is_valid=False,
                message=f"{field_name}不能为空",
                severity=ValidationSeverity.ERROR
            )

        # 常见日期格式
        patterns = [
            (r'^\d{4}-\d{2}-\d{2}$', 'YYYY-MM-DD'),
            (r'^\d{4}/\d{2}/\d{2}$', 'YYYY/MM/DD'),
            (r'^\d{4}年\d{2}月\d{2}日$', 'YYYY年MM月DD日'),
            (r'^\d{4}\d{2}\d{2}$', 'YYYYMMDD'),
        ]

        for pattern, format_name in patterns:
            if re.match(pattern, date_str.strip()):
                return ValidationResult(
                    is_valid=True,
                    message=f"{field_name}格式正确 ({format_name})",
                    severity=ValidationSeverity.INFO
                )

        return ValidationResult(
            is_valid=False,
            message=f"{field_name}格式不正确: {date_str}",
            severity=ValidationSeverity.ERROR,
            suggestion="建议使用格式: YYYY-MM-DD (如 2024-03-01)"
        )

    @staticmethod
    def validate_purity(value: float, threshold: float = 99.5) -> ValidationResult:
        """
        验证纯度值

        Args:
            value: 纯度值
            threshold: 合格阈值

        Returns:
            验证结果
        """
        if not isinstance(value, (int, float)):
            return ValidationResult(
                is_valid=False,
                message="纯度值必须是数字",
                severity=ValidationSeverity.ERROR
            )

        if value < 0 or value > 100:
            return ValidationResult(
                is_valid=False,
                message=f"纯度值 {value}% 超出有效范围 (0-100%)",
                severity=ValidationSeverity.ERROR
            )

        if value < threshold:
            return ValidationResult(
                is_valid=False,
                message=f"纯度 {value}% 低于阈值 {threshold}%",
                severity=ValidationSeverity.WARNING,
                suggestion="建议检查原料质量或重新检测"
            )

        return ValidationResult(
            is_valid=True,
            message=f"纯度 {value}% 合格",
            severity=ValidationSeverity.INFO
        )

    @staticmethod
    def run_all_validations(
        data: Dict[str, Any],
        rules: Dict[str, Any]
    ) -> List[ValidationResult]:
        """
        运行所有验证规则

        Args:
            data: 输入数据
            rules: 验证规则字典
                {
                    'required': ['field1', 'field2'],
                    'types': {'field1': str, 'field2': int},
                    'patterns': {'field1': r'^\d+$'},
                    'ranges': {'field2': {'min': 0, 'max': 100}},
                    'enums': {'field3': ['a', 'b', 'c']}
                }

        Returns:
            所有验证结果
        """
        all_results = []

        if 'required' in rules:
            all_results.extend(InputValidator.validate_required(data, rules['required']))

        if 'types' in rules:
            all_results.extend(InputValidator.validate_type(data, rules['types']))

        if 'patterns' in rules:
            all_results.extend(InputValidator.validate_pattern(data, rules['patterns']))

        if 'ranges' in rules:
            all_results.extend(InputValidator.validate_range(data, rules['ranges']))

        if 'enums' in rules:
            all_results.extend(InputValidator.validate_enum(data, rules['enums']))

        return all_results

    @staticmethod
    def has_errors(results: List[ValidationResult]) -> bool:
        """检查结果中是否包含错误"""
        return any(
            r.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL]
            for r in results
        )

    @staticmethod
    def get_errors(results: List[ValidationResult]) -> List[ValidationResult]:
        """获取所有错误结果"""
        return [
            r for r in results
            if r.severity in [ValidationSeverity.ERROR, ValidationSeverity.CRITICAL]
        ]

    @staticmethod
    def format_results(results: List[ValidationResult]) -> str:
        """格式化验证结果为可读字符串"""
        if not results:
            return "✓ 所有验证通过"

        lines = []
        for r in results:
            icon = "✓" if r.is_valid else "✗"
            lines.append(f"{icon} [{r.severity.value}] {r.message}")
            if r.suggestion:
                lines.append(f"   建议: {r.suggestion}")

        return "\n".join(lines)


# 常用正则表达式模式
COMMON_PATTERNS = {
    'batch_id': r'^(\d{4}\d{2}\d{5}|\d{4}-\d{2}-\d{3}|BATCH\d+)$',
    'date': r'^\d{4}[-/]\d{2}[-/]\d{2}$',
    'datetime': r'^\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2}$',
    'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    'phone': r'^1[3-9]\d{9}$',
    'uuid': r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    'percentage': r'^(100|[0-9]{1,2})(\.\d+)?$',
}


if __name__ == '__main__':
    # 测试代码
    print("测试输入验证器...")

    validator = InputValidator()

    # 测试批次号验证
    test_batches = ["202403001", "BATCH001", "invalid", ""]
    for batch in test_batches:
        result = validator.validate_batch_id(batch)
        print(f"批次号 '{batch}': {result.message}")

    # 测试完整验证
    data = {
        "batch_id": "202403001",
        "purity": 99.7,
        "inspection_date": "2024-03-01",
        "inspector": "张三"
    }

    rules = {
        'required': ['batch_id', 'purity', 'inspection_date'],
        'types': {'purity': (int, float)},
        'ranges': {'purity': {'min': 0, 'max': 100}}
    }

    results = validator.run_all_validations(data, rules)
    print(f"\n完整验证结果:\n{validator.format_results(results)}")

    # 测试纯度验证
    print(f"\n纯度验证:")
    for purity in [99.8, 99.2, 101, -1]:
        result = validator.validate_purity(purity, 99.5)
        print(f"  {purity}%: {result.message}")
