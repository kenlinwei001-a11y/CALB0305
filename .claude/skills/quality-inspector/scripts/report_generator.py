"""
报告生成器 - 生成符合国标的检验报告
支持 PDF、Excel、JSON 格式
"""

from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime


def generate_inspection_report(
    batch_id: str,
    results: Dict[str, Any],
    material_type: str = "Unknown",
    template: str = "default",
    output_format: str = "PDF"
) -> str:
    """
    生成检验报告

    Args:
        batch_id: 批次号
        results: 检验结果字典
        material_type: 材料类型
        template: 报告模板名称
        output_format: 输出格式 (PDF/Excel/JSON)

    Returns:
        生成的报告文件路径
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"inspection_report_{batch_id}_{timestamp}"

    if output_format.upper() == "JSON":
        return _generate_json_report(batch_id, results, material_type, filename)
    elif output_format.upper() == "EXCEL":
        return _generate_excel_report(batch_id, results, material_type, filename)
    else:  # PDF
        return _generate_pdf_report(batch_id, results, material_type, template, filename)


def _generate_json_report(
    batch_id: str,
    results: Dict[str, Any],
    material_type: str,
    filename: str
) -> str:
    """生成 JSON 格式报告"""
    import json

    report_data = {
        "report_type": "原料检验报告",
        "batch_id": batch_id,
        "material_type": material_type,
        "inspection_time": datetime.now().isoformat(),
        "results": results,
        "conclusion": "合格" if results.get('is_passed') else "不合格"
    }

    output_path = f"reports/{filename}.json"
    Path(output_path).parent.mkdir(exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    return output_path


def _generate_excel_report(
    batch_id: str,
    results: Dict[str, Any],
    material_type: str,
    filename: str
) -> str:
    """生成 Excel 格式报告"""
    try:
        import pandas as pd

        # 创建数据
        data = {
            '检验项目': ['批次号', '材料类型', '检验时间', '纯度', '结论'],
            '结果': [
                batch_id,
                material_type,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                f"{results.get('purity', 0):.2f}%",
                "合格" if results.get('is_passed') else "不合格"
            ]
        }

        df = pd.DataFrame(data)

        output_path = f"reports/{filename}.xlsx"
        Path(output_path).parent.mkdir(exist_ok=True)

        df.to_excel(output_path, index=False, sheet_name='检验报告')

        return output_path

    except ImportError:
        print("警告: 未安装 pandas，降级为 JSON 格式")
        return _generate_json_report(batch_id, results, material_type, filename)


def _generate_pdf_report(
    batch_id: str,
    results: Dict[str, Any],
    material_type: str,
    template: str,
    filename: str
) -> str:
    """生成 PDF 格式报告（使用报告模板）"""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        output_path = f"reports/{filename}.pdf"
        Path(output_path).parent.mkdir(exist_ok=True)

        doc = SimpleDocTemplate(output_path, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        # 标题
        elements.append(Paragraph("原料检验报告", styles['Title']))
        elements.append(Spacer(1, 20))

        # 基本信息
        basic_data = [
            ['批次号', batch_id],
            ['材料类型', material_type],
            ['检验时间', datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ['纯度', f"{results.get('purity', 0):.2f}%"],
            ['结论', "合格" if results.get('is_passed') else "不合格"]
        ]

        basic_table = Table(basic_data, colWidths=[150, 300])
        basic_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        elements.append(basic_table)

        doc.build(elements)
        return output_path

    except ImportError:
        print("警告: 未安装 reportlab，降级为 JSON 格式")
        return _generate_json_report(batch_id, results, material_type, filename)


if __name__ == '__main__':
    # 测试代码
    test_results = {
        'purity': 99.72,
        'is_passed': True,
        'contaminants': [{'name': 'Fe', 'level': 0.001}]
    }

    json_path = generate_inspection_report('202403001', test_results, 'Li2CO3', output_format='JSON')
    print(f"生成 JSON 报告: {json_path}")
