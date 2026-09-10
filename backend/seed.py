from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.farmer import Farmer, FarmerVerificationStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.core.security import hash_password


def seed_database() -> None:
    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # Categories
        # ---------------------------------------------------------
        categories_data = [
            {
                "name": "Vegetables",
                "description": "Fresh organic vegetables directly from local farmers.",
            },
            {
                "name": "Fruits",
                "description": "Fresh seasonal fruits sourced from local farms.",
            },
            {
                "name": "Grains",
                "description": "Naturally grown rice, millets and other grains.",
            },
            {
                "name": "Dairy",
                "description": "Fresh farm dairy products.",
            },
        ]

        categories: dict[str, Category] = {}

        for data in categories_data:
            category = db.scalar(
                select(Category).where(Category.name == data["name"])
            )

            if category is None:
                category = Category(**data)
                db.add(category)
                db.flush()

            categories[category.name] = category

        # ---------------------------------------------------------
        # Farmers
        # ---------------------------------------------------------
        farmers_data = [
            {
                "name": "Ravi Kumar",
                "email": "ravi@orb.local",
                "phone": "9876543210",
                "farm_name": "Green Valley Organic Farm",
                "description": (
                    "A local organic farm producing fresh vegetables "
                    "using sustainable farming practices."
                ),
                "location": "Shamshabad",
                "district": "Rangareddy",
                "state": "Telangana",
                "years_of_farming": 12,
                "organic_certified": True,
                "rating": 4.8,
            },
            {
                "name": "Lakshmi Devi",
                "email": "lakshmi@orb.local",
                "phone": "9876543211",
                "farm_name": "Sri Lakshmi Farms",
                "description": (
                    "Family-owned farm specializing in naturally grown "
                    "rice, fruits and seasonal crops."
                ),
                "location": "Warangal",
                "district": "Warangal",
                "state": "Telangana",
                "years_of_farming": 18,
                "organic_certified": True,
                "rating": 4.7,
            },
            {
                "name": "Suresh Reddy",
                "email": "suresh@orb.local",
                "phone": "9876543212",
                "farm_name": "Nature Fresh Farm",
                "description": (
                    "Small-scale farmer delivering fresh fruits and "
                    "traditional dairy products."
                ),
                "location": "Vikarabad",
                "district": "Vikarabad",
                "state": "Telangana",
                "years_of_farming": 10,
                "organic_certified": False,
                "rating": 4.6,
            },
        ]

        farmers: dict[str, Farmer] = {}

        for data in farmers_data:
            user = db.scalar(
                select(User).where(User.email == data["email"])
            )

            if user is None:
                user = User(
                    name=data["name"],
                    email=data["email"],
                    phone=data["phone"],
                    password_hash=hash_password("Farmer@123"),
                    role=UserRole.FARMER,
                    is_active=True,
                )
                db.add(user)
                db.flush()

            farmer = db.scalar(
                select(Farmer).where(Farmer.user_id == user.id)
            )

            if farmer is None:
                farmer = Farmer(
                    user_id=user.id,
                    farm_name=data["farm_name"],
                    description=data["description"],
                    location=data["location"],
                    district=data["district"],
                    state=data["state"],
                    years_of_farming=data["years_of_farming"],
                    organic_certified=data["organic_certified"],
                    verification_status=FarmerVerificationStatus.COMPLETED if data["organic_certified"] else FarmerVerificationStatus.PROFILE_SUBMITTED,
                    rating=data["rating"],
                )
                db.add(farmer)
                db.flush()

            farmers[farmer.farm_name] = farmer

        # ---------------------------------------------------------
        # Products
        # ---------------------------------------------------------
        products_data = [
            {
                "farmer": "Green Valley Organic Farm",
                "category": "Vegetables",
                "name": "Organic Tomatoes",
                "description": "Fresh naturally grown tomatoes.",
                "price": Decimal("80.00"),
                "unit": "kg",
                "stock_quantity": Decimal("50"),
            },
            {
                "farmer": "Green Valley Organic Farm",
                "category": "Vegetables",
                "name": "Fresh Spinach",
                "description": "Fresh farm-grown spinach.",
                "price": Decimal("40.00"),
                "unit": "bunch",
                "stock_quantity": Decimal("100"),
            },
            {
                "farmer": "Green Valley Organic Farm",
                "category": "Vegetables",
                "name": "Organic Carrots",
                "description": "Fresh organic carrots.",
                "price": Decimal("70.00"),
                "unit": "kg",
                "stock_quantity": Decimal("40"),
            },
            {
                "farmer": "Sri Lakshmi Farms",
                "category": "Grains",
                "name": "Organic Rice",
                "description": "Naturally cultivated premium rice.",
                "price": Decimal("120.00"),
                "unit": "kg",
                "stock_quantity": Decimal("200"),
            },
            {
                "farmer": "Sri Lakshmi Farms",
                "category": "Fruits",
                "name": "Fresh Mangoes",
                "description": "Seasonal naturally grown mangoes.",
                "price": Decimal("150.00"),
                "unit": "kg",
                "stock_quantity": Decimal("80"),
            },
            {
                "farmer": "Nature Fresh Farm",
                "category": "Fruits",
                "name": "Fresh Guavas",
                "description": "Fresh farm-grown guavas.",
                "price": Decimal("90.00"),
                "unit": "kg",
                "stock_quantity": Decimal("60"),
            },
            {
                "farmer": "Nature Fresh Farm",
                "category": "Dairy",
                "name": "Country Cow Milk",
                "description": "Fresh farm milk from indigenous cows.",
                "price": Decimal("70.00"),
                "unit": "liter",
                "stock_quantity": Decimal("30"),
            },
        ]

        for data in products_data:
            farmer = farmers[data["farmer"]]
            category = categories[data["category"]]

            product = db.scalar(
                select(Product).where(
                    Product.name == data["name"],
                    Product.farmer_id == farmer.id,
                )
            )

            if product is None:
                product = Product(
                    farmer_id=farmer.id,
                    category_id=category.id,
                    name=data["name"],
                    description=data["description"],
                    price=data["price"],
                    unit=data["unit"],
                    stock_quantity=data["stock_quantity"],
                    organic=True,
                    is_available=True,
                )
                db.add(product)

        db.commit()

        print("ORB seed data inserted successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
