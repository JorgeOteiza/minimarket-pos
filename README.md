# minimarket-pos

Sistema de punto de venta local para un minimarket.

## Descripción

Esta aplicación está diseñada para usarse localmente en un solo equipo, sin servidor remoto ni conexión a internet. Permite llevar el registro de stock, ventas y análisis de inventario. El pago se realiza fuera de la aplicación, por lo que no incluye procesamiento de pagos.

## Alcance

- Registro de productos y categorías
- Control de inventario y ajustes
- Registro de ventas y carrito
- Reportes y análisis de ventas
- Backups locales de la base de datos
- Generación de PDFs e informes

## No incluye

- Autenticación de usuarios
- Login/JWT
- Procesamiento de pagos
- Uso multiusuario simultáneo

## Requisitos

### Backend

- Python 3.12
- Pip / Pipenv

### Frontend

- Node.js
- npm

## Instalación

### Backend

Dentro de `backend/`:

```bash
cd backend
pipenv install
```

O sin Pipenv:

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
```

### Frontend

Dentro de `frontend/`:

```bash
cd frontend
npm install
```

## Ejecución

### Backend

Dentro de `backend/`:

```bash
pipenv run dev
```

O si usas virtualenv:

```bash
python -m flask --app app run --debug
```

### Frontend

Dentro de `frontend/`:

```bash
npm run dev
```

## Base de datos

La aplicación usa SQLite local dentro de `backend/instance/minimarket.db` por defecto. No se necesita servidor de base de datos externo.

## Configuración local

El backend usa un archivo `.env` en `backend/` si está presente. Hay un ejemplo disponible en `backend/.env.example` con la configuración de `DATABASE_URL` y `CORS_ORIGINS`.

## Inicializar la base de datos

Si la base de datos local no existe o falta el esquema, puedes inicializarla con:

```bash
cd backend
pipenv run flask --app app db upgrade
```

Si prefieres crear el esquema directamente sin migraciones, el backend ahora también crea las tablas necesarias automáticamente al iniciar si detecta que falta la tabla `products`.

## Cargar productos

Si al abrir la página de productos ves "No hay productos", significa que la base de datos está vacía y aún no se han cargado productos.

Puedes añadir productos manualmente desde la interfaz de "Gestión de Productos", o importar un archivo CSV de ejemplo usando el script:

```bash
cd backend
pipenv run python scripts/import_products.py data/imports/archivo.csv
```

Asegúrate de usar un CSV que incluya al menos las columnas `name` y `stock`.

## Uso

1. Ejecutar el backend localmente.
2. Ejecutar el frontend localmente.
3. Usar la aplicación desde el navegador en `http://localhost:5173` (o el puerto que Vite asigne).

## Notas importantes

- Si la app se usa en un solo equipo y una sola persona, no es necesario implementar autenticación.
- El pago se registra de forma manual fuera de la aplicación, por lo que aquí solo se gestiona el stock y el registro de venta.
- CORS no es una preocupación crítica en este contexto local, pero es buena práctica limitar orígenes si en el futuro se accede desde otra aplicación local.

## Mejoras recomendadas

- Agregar tests automáticos en backend (`pytest`) para asegurar el correcto funcionamiento.
- Añadir logging local para ayudar en la resolución de errores.
- Mantener copia de seguridad periódica de `backend/instance/minimarket.db`.

## Ejecutar tests backend

Dentro de `backend/`:

```bash
pipenv install --dev
pipenv run pytest
```

## Estructura del repositorio

- `backend/`: código del servidor local Flask
- `frontend/`: aplicación web React + TypeScript
- `backend/instance/`: base de datos SQLite local y archivos de instancia
- `backend/models/`: modelos SQLAlchemy
- `backend/routes/`: endpoints de API
- `backend/services/`: lógica de negocio

## Contacto

Si deseas que continúe con la implementación de tests o mejoras específicas, avísame y lo hacemos paso a paso.
