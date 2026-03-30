from flask import Flask
from config import Config
from extensions import db, migrate
from routes.products import products_bp

# 👇 IMPORTANTE: esto registra los modelos en SQLAlchemy
from models import Product


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(products_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()