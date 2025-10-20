<img width="120" alt="app-icon" src="./public/logo/logo-rounded.png">
<br>
<br>

# SSW555-FormulaForce-RecipeMate Backend
🥘 Kitchen Buddiee — Backend Goes here

## Local dev

This repository contains a minimal Express server that exposes a signup endpoint at POST /api/auth/signup.

Requirements:
- Node 18+ (or a modern Node.js that supports ESM)
- MongoDB running locally (defaults to mongodb://127.0.0.1:27017/ and database `KitchenBuddiee-db`)

Install dependencies and run from the `backend` folder:

```powershell
cd backend
npm install express cors helmet body-parser bcryptjs http-errors
node server.js
```

The server will run on port 4000 by default.