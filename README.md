# minimarket-pos

Sistema de punto de venta local para un minimarket.

## Descripción

Esta aplicación está diseñada para usarse localmente en un solo equipo, sin servidor remoto ni conexión a internet obligatoria. Permite registrar productos, controlar stock, vender desde una caja web, revisar análisis de inventario y mantener respaldos locales de la base de datos.

El pago ocurre fuera de la aplicación. El sistema registra la venta, descuenta inventario y conserva la información necesaria para reportes.

## Alcance

- Registro y edición de productos.
- Control de inventario, stock mínimo y ajustes manuales.
- Carrito y registro de ventas.
- Validación de stock insuficiente y productos sin precio.
- Reportes, analytics y generación de PDFs.
- Backups locales manuales y respaldo automático diario.
- Importación de productos desde CSV.
- Módulo de reposición de sacos/productos a granel.
- Configuración local de datos del negocio.

## No incluye

- Autenticación de usuarios.
- Login/JWT.
- Procesamiento de pagos.
- Uso multiusuario simultáneo.
- Servidor remoto obligatorio.

## Stack

### Backend

- Python 3.12
- Flask
- SQLAlchemy
- Flask-Migrate / Alembic
- SQLite local
- Marshmallow
- Pytest

### Frontend

- Node.js 20.19.0 o superior
- React
- TypeScript
- Vite
- React Router
- Recharts

## Instalación

### Backend

Dentro de `backend/`:

```bash
cd backend
pipenv install --dev
```

O sin Pipenv:

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
pip install pytest
```

### Frontend

Dentro de `frontend/`:

```bash
cd frontend
npm install
```

El repositorio incluye `.nvmrc` con `20.19.0`, que cumple el mínimo requerido por Vite.

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

La aplicación web queda disponible normalmente en `http://localhost:5173`.

## Base de datos

La aplicación usa SQLite local en `backend/instance/minimarket.db` por defecto. No se necesita un servidor de base de datos externo.

El backend soporta un archivo `.env` dentro de `backend/` para configurar variables como:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `ENABLE_AUTO_BACKUP`

`ENABLE_AUTO_BACKUP` está activo por defecto. En tests se desactiva explícitamente.

## Inicializar o migrar la base de datos

Dentro de `backend/`:

```bash
pipenv run flask --app app db upgrade
```

El backend también puede crear tablas automáticamente al iniciar si detecta que falta la tabla `products`, pero las migraciones son la fuente recomendada para mantener el esquema.

## Cargar productos

Puedes añadir productos manualmente desde la interfaz de gestión de productos, o importar un CSV usando:

```bash
cd backend
pipenv run python scripts/import_products.py data/imports/archivo.csv
```

El CSV debe incluir al menos las columnas `name` y `stock`.

## Tests

### Backend

Dentro de `backend/`:

```bash
pipenv run pytest
```

La suite cubre healthcheck, productos, backups y flujos críticos de carrito/checkout.

### Frontend

El frontend todavía no tiene suite automática dedicada. La verificación disponible hoy es:

```bash
cd frontend
npm run build
```

## Build frontend

Dentro de `frontend/`:

```bash
npm run build
```

Si ves una advertencia de Vite sobre Node, revisa que la versión activa sea `20.19.0` o superior. Con Node 22, Vite requiere `22.12.0` o superior.

## Estructura del repositorio

- `backend/`: servidor local Flask.
- `backend/models/`: modelos SQLAlchemy.
- `backend/routes/`: endpoints de API.
- `backend/services/`: lógica de negocio.
- `backend/schemas/`: validación y serialización.
- `backend/tests/`: tests backend con pytest.
- `backend/migrations/`: migraciones Alembic.
- `backend/data/imports/`: CSVs de importación.
- `frontend/`: aplicación web React + TypeScript.
- `frontend/src/features/`: módulos principales del panel.
- `frontend/src/pages/`: vistas de caja y dashboard.

## Notas operativas

- Esta app está pensada para un equipo local y una operación simple.
- Antes de restaurar un backup, el sistema crea un respaldo de seguridad previo.
- Productos sin precio pueden existir en inventario, pero no se pueden cobrar.
- Las ventas descuentan stock y registran movimientos de inventario.
