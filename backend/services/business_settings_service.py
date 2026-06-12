from backend.extensions import db
from backend.exceptions import ValidationError
from backend.models.business_settings import BusinessSettings


DEFAULT_BUSINESS_NAME = "MINIMARKET POS"


def get_business_settings():
    settings = db.session.query(BusinessSettings).order_by(BusinessSettings.id.asc()).first()

    if settings:
        return settings

    settings = BusinessSettings(
        business_name=DEFAULT_BUSINESS_NAME,
        footer_message="Documento generado automáticamente por Minimarket POS.",
    )

    db.session.add(settings)
    db.session.commit()

    return settings


def update_business_settings(data):
    settings = get_business_settings()

    business_name = (data.get("business_name") or "").strip()

    if not business_name:
        raise ValidationError("El nombre del negocio es obligatorio.")

    settings.update_from_dict(data)

    db.session.commit()

    return settings