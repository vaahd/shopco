# SHOP.CO | Premium Fashion Archive

A high-end, full-stack ecommerce boutique platform built with modern technologies.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit & TanStack Query
- **Styling**: Tailwind CSS & Shadcn UI
- **Routing**: React Router Dom v6
- **Animations**: Framer Motion & Tailwind Animate

### Backend
- **Framework**: Django 6.0 (Python)
- **API**: Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: PostgreSQL
- **Environment**: Python-dotenv

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-project
   ```

2. **Backend Setup**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 📦 Deployment Preparation

The project is optimized for deployment:
- ✅ **Environment Variables**: Managed via `.env` files (see `.env.example`).
- ✅ **Static Files**: Configured `STATIC_ROOT` for Django `collectstatic`.
- ✅ **Code Splitting**: implemented via React Suspense & lazy loading.
- ✅ **Clean Environment**: Unused dependencies removed.

## 📝 License
This project is licensed under the MIT License.
