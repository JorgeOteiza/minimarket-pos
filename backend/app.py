from flask import Flask, jsonify
from backend.config import Config
from backend.extensions import db, migrate
from backend.routes.products import products_bp
from backend.routes.cart import cart_bp
from backend.routes.inventory import inventory_bp
from backend.routes.analytics import analytics_bp
from backend.routes.sales import sales_bp
from backend.routes.bulk import bulk_bp
from backend.exceptions import AppError
from marshmallow import ValidationError as MarshmallowValidationError
from werkzeug.exceptions import HTTPException
from backend.routes.backups import backups_bp
from backend.routes.reports import reports_bp
from backend.routes.business_settings import business_settings_bp
from backend.services.backup_service import ensure_daily_auto_backup

from sqlalchemy import inspect

from flask_cors import CORS


def register_error_handlers(app):

    @app.errorhandler(AppError)
    def handle_app_error(error):
        return jsonify({
            "error": error.message
        }), error.status_code

    @app.errorhandler(MarshmallowValidationError)
    def handle_marshmallow_error(error):
        return jsonify({
            "error": error.messages
        }), 422

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unexpected error")
        return jsonify({
            "error": "Internal server error"
        }), 500
        
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            "error": error.description
        }), error.code


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config is not None:
        app.config.update(test_config)

    db.init_app(app)
    migrate.init_app(app, db)
    
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )

    with app.app_context():
        inspector = inspect(db.engine)
        if not inspector.has_table("products"):
            db.create_all()

        if app.config.get("ENABLE_AUTO_BACKUP", True):
            try:
                backup_result = ensure_daily_auto_backup()
                if backup_result.get("created"):
                    app.logger.info(
                        "Respaldo automático creado: %s",
                        backup_result["backup"]["filename"],
                    )
            except Exception as exc:
                app.logger.warning("No se pudo crear el respaldo automático: %s", exc)

    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(sales_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(inventory_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(bulk_bp, url_prefix="/api")
    app.register_blueprint(backups_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")
    app.register_blueprint(business_settings_bp, url_prefix="/api")

    register_error_handlers(app)

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()
