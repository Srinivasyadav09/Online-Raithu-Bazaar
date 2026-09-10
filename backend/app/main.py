from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.categories import router as categories_router
from app.api.v1.farmers import router as farmers_router
from app.api.v1.health import router as health_router
from app.api.v1.products import router as products_router
from app.api.v1.auth import router as auth_router
from app.core.config import settings
from app.api.v1.cart import router as cart_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Online Raithu Bazaar",
    version="0.1.0",
    debug=settings.debug,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_router,
    prefix="/api/v1",
)

app.include_router(
    categories_router,
    prefix="/api/v1",
)

app.include_router(
    farmers_router,
    prefix="/api/v1",
)

app.include_router(
    products_router,
    prefix="/api/v1",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(cart_router, prefix="/api/v1")

app.include_router(
    orders_router,
    prefix="/api/v1",
)
app.include_router(payments_router, prefix="/api/v1")
from app.api.v1.admin import router as admin_router
app.include_router(admin_router, prefix="/api/v1")
app.mount("/media", StaticFiles(directory="uploads"), name="media")

@app.get("/", tags=["Root"])
def root() -> dict[str, object]:
    return {
        "success": True,
        "message": "Welcome to ORB - Online Raithu Bazaar API",
        "version": "0.1.0",
    }

