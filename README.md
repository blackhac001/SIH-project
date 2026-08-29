# CONNECTX 🌐

> **Global Skill-to-Employment Intelligence Platform**  
> *"Your Skills. Their Opportunities. A Better Future."*  
> **Smart India Hackathon 2026** | **Problem ID**: 26135  
> **Theme**: Smart Education  

---

## 📌 Executive Summary

**CONNECTX** is an enterprise, consent-driven longitudinal skill-to-employment intelligence ecosystem connecting global talent, accredited training academies, and enterprise employers worldwide.

CONNECTX tracks the entire **longitudinal career lifecycle**:

```text
Skills Intelligence ➔ Target Matching ➔ Skill Gap Bridge ➔ Enterprise Connect ➔ Placement & Offer ➔ 5-Year Salary Growth
```

### Key Pillars
1. **Longitudinal Outcome Intelligence**: 5-Year salary forecasting, explainable market drivers, skill boost simulations, and wage progression tracking.
2. **5 Distinct Role-Based Experiences**: Tailored workspaces for Candidates, Employers / Companies, Talent Recruiters, Training Providers, and Ecosystem Admins.
3. **AI Intelligence Suite**: Neural resume parsing, ATS readiness scoring, skill gap detection, future skill demand forecasting, and 24/7 AI Career Copilot.
4. **Zero-Trust Data Consent**: Granular candidate sovereignty over verified credentials and employment records.
5. **Global Labor Market Insights**: Interactive regional intelligence maps tracking macro supply, demand, and compensation benchmarks across 150+ countries.

---

## 🏗️ Project Architecture & Directory Structure

```text
connectx/
├── docker-compose.yml          # Container orchestration (Frontend, Backend, Postgres)
├── docker-compose.dev.yml      # Development hot-reloading override
├── .env.example                # Sample environment variables with safe placeholders
├── README.md                   # Project overview & running instructions
│
├── frontend/                   # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI elements, badges, cards, guards, logo
│   │   │   ├── auth/           # Route guards (ProtectedRoute)
│   │   │   ├── common/         # Logo, Button, Card, Badge, Modal
│   │   │   └── layout/         # Role-aware Sidebar, TopNavbar
│   │   ├── hooks/              # Custom React hooks (useAuth context)
│   │   ├── layouts/            # RoleDashboardLayout, MainLayout
│   │   ├── pages/              # 5 Role Dashboards & AI Intelligence Pages
│   │   ├── services/           # Axios instance, Auth API, and AI Intelligence Engine
│   │   ├── types/              # TypeScript models (User, Role, Auth, API)
│   │   ├── utils/              # Constants, demo personas, local storage manager
│   │   ├── App.tsx             # Root router & role-based routes
│   │   └── main.tsx            # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Python FastAPI + SQLAlchemy 2.0 + Alembic
│   ├── app/
│   │   ├── api/                # API router & v1 endpoints (auth, users, skills, jobs, health)
│   │   ├── auth/               # Password hashing (bcrypt), JWT, security dependencies
│   │   ├── core/               # App configuration (Pydantic Settings), database engine
│   │   ├── models/             # SQLAlchemy declarative models (User, Role, Candidate, Job, etc.)
│   │   ├── schemas/            # Pydantic v2 schemas for request/response validation
│   │   ├── repositories/       # Database data-access layer
│   │   ├── services/           # Business logic layer (AuthService, UserService)
│   │   ├── analytics/          # Analytics & calculations module
│   │   ├── utils/              # Helper utilities
│   │   └── main.py             # FastAPI entrypoint, CORS & lifespan handler
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Pytest test suite (health, auth, RBAC, CRUD)
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/
│   └── init.sql                # Initial Postgres initialization script
├── scripts/
│   └── seed.py                 # Database seeding script for default roles and demo users
└── docs/
    └── architecture.md         # Comprehensive architectural specification
```

---

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20+)
* Docker Compose (v2+)

### Step 1: Clone and Configure Environment
```bash
# Clone the repository
git clone <repo_url>
cd connectx

# Create your local .env file from the example
cp .env.example .env
```

### Step 2: Build & Start All Services
```bash
docker compose up --build
```

### Step 3: Access Services
| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Portal** | [http://localhost:3000](http://localhost:3000) | CONNECTX Web Application |
| **FastAPI Interactive Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger OpenAPI UI |
| **FastAPI ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc API Reference |
| **Health Check Endpoint** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) | Backend & DB Health Probe |
| **PostgreSQL Database** | `localhost:5432` | Database Service (`connectx_db`) |

---

## 🛠️ Local Development (Without Docker)

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial roles and test accounts
python ../scripts/seed.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Run Backend Test Suite
```bash
# Inside backend directory
pytest tests/ -v
```

### 3. Frontend Setup
```bash
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
# Running on http://localhost:3000 (or http://localhost:5173)
```

---

## 👥 Demo Personas & Pre-Seeded Test Accounts

*(Demo / Development accounts for evaluation and sandbox testing only)*

| Role | Role Code | Demo Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate / Talent** | `CANDIDATE` | `alex.rivera@connectx.ai` | `Candidate@12345` | Resume Intelligence, Salary Projections & Jobs |
| **Company / Employer** | `EMPLOYER` | `recruitment@google.com` | `Employer@12345` | Enterprise Talent Search & Hiring Funnel |
| **Recruiter** | `EMPLOYER` | `sarah.recruiter@connectx.ai` | `Partner@12345` | AI Talent Sourcing & Fast Interview Scheduling |
| **Training Provider** | `TRAINING_PROVIDER` | `director@mit-academy.edu` | `Partner@12345` | Curriculum Gap Matrix & Placement Outcomes |
| **Ecosystem Admin** | `SUPER_ADMIN` | `admin@connectx.ai` | `Admin@12345` | Global Macro Intelligence & Security Auditing |

---

## 🛡️ Security & Role-Based Access Control (RBAC)

* **Password Hashing**: Industry-standard `bcrypt` algorithm.
* **Stateless Authentication**: Signed JWT tokens (`HS256`) containing subject identity, role claims, and token expiration.
* **Granular Dependency Injection**: Route-level permission guards using FastAPI `require_roles([RoleEnum.SUPER_ADMIN, ...])`.
* **Frontend Route Guards**: React `ProtectedRoute` verifying token validity and role authorization prior to route rendering.
* **Zero-Trust Consent**: Data privacy and consent verification mechanisms for talent records.
