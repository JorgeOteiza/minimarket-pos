from flask import Flask
from config import Config
from extensions import db
from routes.products import products_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(products_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()