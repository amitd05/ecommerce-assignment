
# E-commerce Web Application

A full-stack E-commerce application with a **React frontend** and **Node.js backend**. Users can browse products, filter them, and manage a shopping cart with authentication support.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project demonstrates an E-commerce application with:

- Product listing
- Product filtering by category and price
- Cart management
- User authentication
- Full-stack deployment using Render (backend) and Netlify (frontend)

---

## Features

- Browse and search products  
- Filter products by category and price  
- Add/remove items from cart  
- Persist cart for logged-in users  
- Responsive frontend design  

---

## Tech Stack

- **Frontend:** React, Axios, React Router  
- **Backend:** Node.js, Express  
- **Deployment:** Render (backend), Netlify (frontend)  
- **Version Control:** Git, GitHub  

---

## Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/ecommerce.git
cd ecommerce
````

### 2. Backend Setup

```bash
cd backend
npm install
npm start       # or node server.js
```

Backend runs at `http://localhost:5000` by default.

### 3. Frontend Setup

```bash
cd ../ecommerce-frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

---

## Frontend Deployment (Netlify)

1. Go to [Netlify](https://app.netlify.com/) → New site → Import from Git
2. Select your repository
3. Set build command:

```bash
npm run build
```

4. Set publish directory:

```bash
ecommerce-frontend/build
```

5. Add environment variable:

```
REACT_APP_API_URL=https://your-backend-on-render.com
```

6. Deploy the site

---

## Backend Deployment (Render)

1. Go to [Render](https://render.com/) → New Web Service → Connect GitHub repo
2. Select the `backend` folder
3. Set environment variables:

```
PORT=10000
TOKEN_SECRET=<your-secret>
```

4. Set start command:

```bash
node server.js
```

5. Deploy and note the Render URL, e.g., `https://ecommerce-assignment-4a43.onrender.com`

---

## Environment Variables

* **Frontend:**

  * `REACT_APP_API_URL` → Backend API URL

* **Backend:**

  * `PORT` → Backend port (Render assigns automatically)
  * `TOKEN_SECRET` → JWT secret key (if using authentication)

---

## Usage

* Access products at `/products`
* Manage cart at `/cart`
* Login to persist cart
* Use search and filters to browse products

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push branch: `git push origin feature-name`
5. Create a Pull Request

---

## License

This project is licensed under the MIT License.

