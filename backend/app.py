from flask import Flask
from config import Config
from extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    @app.route("/")
    def home():
        return {"message": "API running"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)