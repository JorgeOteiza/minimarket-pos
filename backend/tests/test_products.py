def test_get_products_empty(client):
    response = client.get("/api/products")

    assert response.status_code == 200
    data = response.get_json()
    assert data["items"] == []
    assert data["total"] == 0


def test_create_product(client):
    payload = {
        "name": "Pan de Molde",
        "stock": 5,
    }

    response = client.post("/api/products", json=payload)

    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "PAN DE MOLDE"
    assert data["stock"] == 5


def test_create_product_invalid_name(client):
    response = client.post("/api/products", json={"name": ""})

    assert response.status_code == 400
    data = response.get_json()
    assert data["error"] == "Validation error"
    assert "name" in data["details"]
