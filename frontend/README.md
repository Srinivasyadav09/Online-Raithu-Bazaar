# ORB Frontend

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend API base URL, for example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Portals

- Customer: register/login, browse products, cart and orders.
- Farmer: apply for a farmer account, track verification, manage the farm profile, and after admin approval upload images and publish products.
- Admin: review farmer applications, move them to `Verifying`, and approve them to `Completed`.

## Farmer verification lifecycle

`Profile submitted` → `Verifying` → `Completed`

A farmer is not organic certified until the status reaches `Completed`. Product management and image uploads remain locked before completion.
