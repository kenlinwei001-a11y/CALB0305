"""
共享报告生成器 - 生成各种格式的报告
支持：Markdown、HTML、JSON、Excel、PDF
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum


class ReportFormat(Enum):
    """报告格式"""
    MARKDOWN = "md"
    HTML = "html"
    JSON = "json"
    EXCEL = "xlsx"
    PDF = "pdf"
    TEXT = "txt"


@dataclass
class ReportSection:
    """报告章节"""
    title: str
    content: str
    level: int = 1  # 标题级别


class ReportGenerator:
    """
    报告生成器

    支持生成多种格式的报告：
    1. Markdown - 适合人工阅读
    2. HTML - 适合网页展示
    3. JSON - 适合程序处理
    4. Excel - 适合数据分析
    5. PDF - 适合打印和存档
    """

    def __init__(self, output_dir: str = "reports"):
        """
        初始化报告生成器

        Args:
            output_dir: 报告输出目录
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_markdown_report(
        self,
        title: str,
        sections: List[ReportSection],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        生成 Markdown 格式报告

        Args:
            title: 报告标题
            sections: 报告章节列表
            metadata: 元数据

        Returns:
            Markdown 内容
        """
        lines = [f"# {title}", ""]

        # 添加元数据
        if metadata:
            lines.append("## 元数据")
            for key, value in metadata.items():
                lines.append(f"- **{key}**: {value}")
            lines.append("")

        # 添加章节
        for section in sections:
            prefix = "#" * section.level
            lines.append(f"{prefix} {section.title}")
            lines.append("")
            lines.append(section.content)
            lines.append("")

        return "\n".join(lines)

    def generate_html_report(
        self,
        title: str,
        sections: List[ReportSection],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        生成 HTML 格式报告

        Args:
            title: 报告标题
            sections: 报告章节列表
            metadata: 元数据

        Returns:
            HTML 内容
        """
        html_parts = [
            "<!DOCTYPE html>",
            "<html>",
            "<head>",
            f"<title>{title}</title>",
            "<style>",
            self._get_default_css(),
            "</style>",
            "</head>",
            "<body>",
            f"<h1>{title}</h1>"
        ]

        # 添加元数据
        if metadata:
            html_parts.append("<div class='metadata'>")
            html_parts.append("<h2>元数据</h2>")
            html_parts.append("<ul>")
            for key, value in metadata.items():
                html_parts.append(f"<li><strong>{key}:</strong> {value}</li>")
            html_parts.append("</ul>")
            html_parts.append("</div>")

        # 添加章节
        for section in sections:
            tag = f"h{section.level}"
            html_parts.append(f"<{tag}>{section.title}</{tag}>")
            # 将 Markdown 风格的内容转换为简单 HTML
            content = self._markdown_to_simple_html(section.content)
            html_parts.append(f"<div class='section-content'>{content}</div>")

        html_parts.extend(["</body>", "</html>"])

        return "\n".join(html_parts)

    def generate_json_report(
        self,
        title: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        生成 JSON 格式报告

        Args:
            title: 报告标题
            data: 报告数据
            metadata: 元数据

        Returns:
            JSON 内容
        """
        report_data = {
            "title": title,
            "generated_at": datetime.now().isoformat(),
            "metadata": metadata or {},
            "data": data
        }

        return json.dumps(report_data, ensure_ascii=False, indent=2)

    def generate_excel_report(
        self,
        title: str,
        sheets: Dict[str, List[Dict[str, Any]]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        生成 Excel 格式报告

        Args:
            title: 报告标题
            sheets: 工作表数据 {表名: [行数据]}
            metadata: 元数据

        Returns:
            生成的文件路径
        """
        try:
            import pandas as pd

            output_path = self.output_dir / f"{self._sanitize_filename(title)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                # 添加元数据表
                if metadata:
                    meta_df = pd.DataFrame([
                        {"键": k, "值": str(v)}
                        for k, v in metadata.items()
                    ])
                    meta_df.to_excel(writer, sheet_name="元数据", index=False)

                # 添加数据表
                for sheet_name, data in sheets.items():
                    if not data:
                        continue

                    df = pd.DataFrame(data)
                    # 限制表名长度（Excel 限制为 31 字符）
                    safe_name = sheet_name[:31]
                    df.to_excel(writer, sheet_name=safe_name, index=False)

            return str(output_path)

        except ImportError:
            raise ImportError("需要安装 pandas 和 openpyxl: pip install pandas openpyxl")

    def save_report(
        self,
        content: str,
        filename: str,
        format: ReportFormat = ReportFormat.MARKDOWN
    ) -> str:
        """
        保存报告到文件

        Args:
            content: 报告内容
            filename: 文件名（不含扩展名）
            format: 报告格式

        Returns:
            保存的文件路径
        """
        safe_filename = self._sanitize_filename(filename)
        extension = format.value
        full_filename = f"{safe_filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"

        output_path = self.output_dir / full_filename

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(output_path)

    def _sanitize_filename(self, filename: str) -> str:
        """清理文件名中的非法字符"""
        import re
        # 替换非法字符
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        # 限制长度
        return sanitized[:100]

    def _get_default_css(self) -> str:
        """获取默认 CSS 样式"""
        return """
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            h1 { color: #1a1a1a; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
            h2 { color: #2a2a2a; margin-top: 30px; }
            h3 { color: #3a3a3a; }
            .metadata {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .section-content {
                margin: 15px 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 15px 0;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background: #f5f5f5;
            }
            code {
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
            .success { color: #28a745; }
            .warning { color: #ffc107; }
            .error { color: #dc3545; }
        """

    def _markdown_to_simple_html(self, content: str) -> str:
        """将简单 Markdown 转换为 HTML"""
        import re

        # 代码块
        content = re.sub(
            r'```(\w+)?\n(.*?)```',
            r'<pre><code>\2</code></pre>',
            content,
            flags=re.DOTALL
        )

        # 行内代码
        content = re.sub(r'`([^`]+)`', r'<code>\1</code>', content)

        # 粗体
        content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)

        # 斜体
        content = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', content)

        # 换行
        content = content.replace('\n', '<br>')

        return content


class ReportTemplate:
    """报告模板 - 预定义的报告结构"""

    @staticmethod
    def create_inspection_report(
        batch_id: str,
        material_type: str,
        results: Dict[str, Any],
        comparison: Optional[Dict[str, Any]] = None
    ) -> List[ReportSection]:
        """
        创建检验报告模板

        Args:
            batch_id: 批次号
            material_type: 材料类型
            results: 检验结果
            comparison: 历史对比结果

        Returns:
            报告章节列表
        """
        sections = [
            ReportSection(
                title="基本信息",
                content=f"""
- **批次号**: {batch_id}
- **材料类型**: {material_type}
- **检验时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **检验结果**: {'✓ 合格' if results.get('is_passed') else '✗ 不合格'}
""",
                level=2
            ),
            ReportSection(
                title="检验数据",
                content=f"```json\n{json.dumps(results, ensure_ascii=False, indent=2)}\n```",
                level=2
            )
        ]

        if comparison:
            sections.append(ReportSection(
                title="历史对比",
                content=f"""
- **对比结果**: {comparison.get('comparison', '无')}
- **趋势**: {comparison.get('trend', '未知')}
- **排名**: {comparison.get('rank', 'N/A')}
""",
                level=2
            ))

        return sections

    @staticmethod
    def create_analysis_report(
        title: str,
        findings: List[Dict[str, Any]],
        recommendations: List[str]
    ) -> List[ReportSection]:
        """
        创建分析报告模板

        Args:
            title: 报告标题
            findings: 发现项列表
            recommendations: 建议列表

        Returns:
            报告章节列表
        """
        sections = [
            ReportSection(
                title="执行摘要",
                content=f"本报告包含 {len(findings)} 项发现，{len(recommendations)} 条建议。",
                level=2
            ),
            ReportSection(
                title="详细发现",
                content="\n\n".join([
                    f"**{i+1}. {f.get('title', '未命名')}**\n{f.get('description', '')}"
                    for i, f in enumerate(findings)
                ]),
                level=2
            ),
            ReportSection(
                title="建议措施",
                content="\n".join([f"{i+1}. {r}" for i, r in enumerate(recommendations)]),
                level=2
            )
        ]

        return sections

    @staticmethod
    def create_summary_report(
        period: str,
        metrics: Dict[str, Any],
        highlights: List[str]
    ) -> List[ReportSection]:
        """
        创建汇总报告模板

        Args:
            period: 报告周期
            metrics: 指标数据
            highlights: 亮点/要点

        Returns:
            报告章节列表
        """
        metrics_content = "\n".join([
            f"- **{k}**: {v}"
            for k, v in metrics.items()
        ])

        sections = [
            ReportSection(
                title=f"周期: {period}",
                content=f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                level=2
            ),
            ReportSection(
                title="关键指标",
                content=metrics_content,
                level=2
            ),
            ReportSection(
                title="要点总结",
                content="\n".join([f"- {h}" for h in highlights]),
                level=2
            )
        ]

        return sections


if __name__ == '__main__':
    # 测试代码
    print("测试报告生成器...")

    generator = ReportGenerator(output_dir="test_reports")

    # 测试 Markdown 报告
    sections = [
        ReportSection("概述", "这是一个测试报告。"),
        ReportSection("详细数据", "```json\n{'key': 'value'}\n```"),
        ReportSection("结论", "一切正常。")
    ]

    md_content = generator.generate_markdown_report(
        title="测试报告",
        sections=sections,
        metadata={"作者": "AI", "版本": "1.0"}
    )

    md_path = generator.save_report(md_content, "test_report", ReportFormat.MARKDOWN)
    print(f"生成 Markdown 报告: {md_path}")

    # 测试 HTML 报告
    html_content = generator.generate_html_report(
        title="测试报告",
        sections=sections,
        metadata={"作者": "AI", "版本": "1.0"}
    )
    html_path = generator.save_report(html_content, "test_report", ReportFormat.HTML)
    print(f"生成 HTML 报告: {html_path}")

    # 测试模板
    template_sections = ReportTemplate.create_inspection_report(
        batch_id="202403001",
        material_type="Li2CO3",
        results={"purity": 99.7, "is_passed": True},
        comparison={"comparison": "高于平均水平", "trend": "上升"}
    )

    print(f"\n检验报告章节数: {len(template_sections)}")
    for s in template_sections:
        print(f"  - {s.title}")
