import sys
import logging

from backend.app import create_app
from backend.services.product_import_service import import_products_from_csv


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s | %(message)s",
)


def main():
    if len(sys.argv) < 2:
        print("Usage: python backend/scripts/import_products.py <file.csv>")
        sys.exit(1)

    file_path = sys.argv[1]

    app = create_app()

    with app.app_context():
        result = import_products_from_csv(file_path)

        print("\n📦 Import result:")
        print(f"Created: {result['created']}")
        print(f"Updated: {result['updated']}")
        print(f"Skipped: {result['skipped']}")
        print(f"Errors:  {len(result['errors'])}")

        if result["errors"]:
            print("\n❌ Errors:")
            for err in result["errors"]:
                print(
                    f"Row {err['row']} | "
                    f"{err['error']} | "
                    f"{err['data']}"
                )


if __name__ == "__main__":
    main()