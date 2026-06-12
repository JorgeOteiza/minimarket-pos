from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from backend.services.reports_service import get_sales_report


def _format_clp(value):
    return f"${int(round(float(value or 0))):,}".replace(",", ".")


def _format_number(value):
    number = float(value or 0)

    if number.is_integer():
        return str(int(number))

    return f"{number:.2f}"


def _format_datetime(value):
    if not value:
        return "Sin fecha"

    try:
        parsed = datetime.fromisoformat(value)
        return parsed.strftime("%d-%m-%Y %H:%M")
    except ValueError:
        return str(value)


def _build_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Title"],
            fontSize=20,
            leading=24,
            spaceAfter=10,
            textColor=colors.HexColor("#111827"),
        )
    )

    styles.add(
        ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#4b5563"),
            spaceAfter=12,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            spaceBefore=12,
            spaceAfter=8,
            textColor=colors.HexColor("#111827"),
        )
    )

    styles.add(
        ParagraphStyle(
            name="SmallText",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#374151"),
        )
    )

    return styles


def _make_table(data, column_widths=None):
    table = Table(data, colWidths=column_widths, hAlign="LEFT")

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#111827")),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ]
        )
    )

    return table


def generate_sales_report_pdf(period="today"):
    report = get_sales_report(period=period)

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title=f"Reporte de ventas - {report['period']['label']}",
    )

    styles = _build_styles()
    elements = []

    generated_at = datetime.now().strftime("%d-%m-%Y %H:%M")

    elements.append(Paragraph("MINIMARKET POS", styles["ReportTitle"]))
    elements.append(
        Paragraph(
            f"Reporte de ventas · {report['period']['label']}<br/>"
            f"Periodo: {report['period']['start_date']} al {report['period']['end_date']}<br/>"
            f"Generado: {generated_at}",
            styles["ReportSubtitle"],
        )
    )

    summary = report["summary"]

    elements.append(Paragraph("Resumen comercial", styles["SectionTitle"]))

    summary_table = _make_table(
        [
            ["Indicador", "Valor"],
            ["Total vendido", _format_clp(summary["total_sales"])],
            ["Cantidad de ventas", _format_number(summary["sales_count"])],
            ["Ticket promedio", _format_clp(summary["average_ticket"])],
            ["Unidades vendidas", _format_number(summary["total_units_sold"])],
        ],
        column_widths=[8 * cm, 8 * cm],
    )

    elements.append(summary_table)
    elements.append(Spacer(1, 0.4 * cm))

    elements.append(Paragraph("Top productos vendidos", styles["SectionTitle"]))

    top_products = report["top_products"][:10]

    if top_products:
        top_products_table = [["#", "Producto", "Unidades", "Total vendido"]]

        for index, product in enumerate(top_products, start=1):
            top_products_table.append(
                [
                    str(index),
                    product["name"],
                    _format_number(product["quantity_sold"]),
                    _format_clp(product["total_sold"]),
                ]
            )

        elements.append(
            _make_table(
                top_products_table,
                column_widths=[1.2 * cm, 8.8 * cm, 3 * cm, 3.8 * cm],
            )
        )
    else:
        elements.append(
            Paragraph(
                "No hay productos vendidos en este periodo.",
                styles["SmallText"],
            )
        )

    elements.append(Spacer(1, 0.4 * cm))

    elements.append(Paragraph("Ventas recientes", styles["SectionTitle"]))

    recent_sales = report["recent_sales"][:20]

    if recent_sales:
        recent_sales_table = [["Venta", "Fecha", "Productos", "Total"]]

        for sale in recent_sales:
            recent_sales_table.append(
                [
                    f"#{sale['id']}",
                    _format_datetime(sale["created_at"]),
                    _format_number(sale["items_count"]),
                    _format_clp(sale["total_amount"]),
                ]
            )

        elements.append(
            _make_table(
                recent_sales_table,
                column_widths=[2.3 * cm, 5 * cm, 3.2 * cm, 4 * cm],
            )
        )
    else:
        elements.append(
            Paragraph(
                "No hay ventas registradas en este periodo.",
                styles["SmallText"],
            )
        )

    elements.append(Spacer(1, 0.5 * cm))
    elements.append(
        Paragraph(
            "Documento generado automáticamente por Minimarket POS.",
            styles["SmallText"],
        )
    )

    document.build(elements)

    buffer.seek(0)

    filename = f"reporte_ventas_{period}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"

    return buffer, filename