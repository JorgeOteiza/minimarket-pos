from flask import Flask, jsonify
from backend.config import Config
from backend.extensions import db, migrate
from backend.routes.products import products_bp
from backend.routes.cart import cart_bp
from backend.routes.inventory import inventory_bp
from backend.routes.analytics import analytics_bp
from backend.routes.sales import sales_bp
from backend.routes.bulk import bulk_bp
from backend.models import Product, Sale, SaleItem
from backend.exceptions import AppError
from marshmallow import ValidationError as MarshmallowValidationError
from werkzeug.exceptions import HTTPException
from backend.routes.backups import backups_bp
from backend.routes.reports import reports_bp

import traceback

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
        print("UNEXPECTED ERROR:", error)
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error"
        }), 500
        
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            "error": error.description
        }), error.code


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    
    CORS(app)

    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(sales_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(inventory_bp, url_prefix="/api",)
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(bulk_bp, url_prefix="/api")
    app.register_blueprint(backups_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")

    register_error_handlers(app)

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()