# Online Raithu Bazaar (ORB)

## Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173
Backend Swagger: http://127.0.0.1:8000/docs

Farmer registration: http://localhost:5173/register/farmer

Farmer verification has exactly three stages: Profile submitted, Verifying, Completed. Only an admin can move the application forward. `organic_certified` is false until Completed. Product and image management is blocked until verification is completed.
