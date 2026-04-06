print("CART ROUTES LOADED")
from flask import Flask, jsonify
from config import Config
from extensions import db, migrate
from routes.products import products_bp
from routes.sales import sales_bp
from models import Product, Sale, SaleItem
from exceptions import AppError
from marshmallow import ValidationError as MarshmallowValidationError
from werkzeug.exceptions import HTTPException
from routes.cart import cart_bp
import traceback


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

    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(sales_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")

    register_error_handlers(app)

    # 🔥 DEBUG: ver rutas registradas
    print("\n=== REGISTERED ROUTES ===")
    for rule in app.url_map.iter_rules():
        print(rule)
    print("=========================\n")

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()