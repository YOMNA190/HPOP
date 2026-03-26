# Happiness Plaza Operations Platform (HPOP)

A unified system for Al-Habeeb Group and JKFacilities to manage Happiness Plaza (20,000 sqm, opening Dec 2026) – combining facility management, project tracking, and marketing analytics.

![Happiness Plaza](https://img.shields.io/badge/Location-Qena,%20Egypt-0A4D4C)
![Status](https://img.shields.io/badge/Status-Development-C5A028)
![Stack](https://img.shields.io/badge/Stack-MERN-61DAFB)

## 🌟 Features

### Facility Management Module
- **Tenant Portal**: Submit maintenance requests with photo uploads
- **Manager Dashboard**: Overview cards, request heatmap, SLA compliance gauge
- **Real-time Chat**: Socket.io-powered messaging between tenants and managers
- **Status Timeline**: Animated progress tracking (Submitted → Assigned → In Progress → Completed)
- **Satisfaction Rating**: 5-star rating system with confetti effects

### Project Management Module
- **Gantt Chart**: Interactive D3.js visualization with drag-and-drop
- **3D Timeline**: Immersive Three.js task visualization
- **Critical Path**: Highlighted with pulsing glow effect
- **Delay Alerts**: Automatic notifications for overdue tasks
- **Team Workload**: Radar chart showing capacity per assignee

### Marketing Analytics Module
- **Campaign Dashboard**: Bar chart race, geo heatmap, summary cards
- **Performance Metrics**: CTR, CPC, CPA, ROI tracking
- **AI Insights**: Rule-based recommendations
- **Export Reports**: PDF generation with brand colors

### Unified Portal
- **Hero Section**: Full-screen video background with animated overlay
- **Countdown Timer**: Animated sand timer to opening date
- **3D Building Viewer**: Interactive Three.js model with orbit controls
- **Qena Heritage**: Nile wave animation, gold particles, local identity

## 🎨 Design System

### Color Palette
- **Primary**: `#0A4D4C` (Deep Nile Teal)
- **Accent**: `#C5A028` (Desert Gold)
- **Background**: `#0A0A0F` (Almost Black)
- **Surface**: `rgba(18, 18, 24, 0.7)` with backdrop-blur

### Typography
- **Headlines**: Cairo (Arabic) / Inter (Latin)
- **Body**: Noto Sans Arabic / Inter

### Animations
- Page transitions with Framer Motion
- Scroll animations with GSAP ScrollTrigger
- 3D tilt effects on hover
- Custom cursor with trailing effect
- Particle system reacting to mouse movement

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS (custom design system, dark mode first)
- Framer Motion + GSAP (scroll animations)
- Three.js (3D building viewer, particle effects)
- Recharts + D3.js (advanced charts)
- Socket.io-client (real-time features)
- Zustand (global state)
- TanStack Query (server state)
- i18next (Arabic/English, RTL support)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- Socket.io with Redis adapter
- JWT (access + refresh tokens)
- BullMQ + Redis (background jobs)
- Winston logging

### Infrastructure
- Docker Compose (postgres, redis, backend, frontend)
- GitHub Actions CI
- Health checks for all services

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/alhabeeb/hpop.git
cd hpop

# Start all services
cd docker
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### Manual Setup

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
hpop/
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   └── i18n/           # Translations
│   └── package.json
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hpop?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
REDIS_URL="redis://localhost:6379"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:5000"
```

## 👥 Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@alhabeeb.com | admin123 |
| Manager | manager@jkfacilities.com | manager123 |
| Tenant | tenant1@example.com | tenant123 |

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Maintenance
- `GET /api/maintenance` - List requests
- `POST /api/maintenance` - Create request
- `GET /api/maintenance/:id` - Get request details
- `PATCH /api/maintenance/:id` - Update request
- `POST /api/maintenance/:id/chat` - Add chat message

### Projects
- `GET /api/projects` - List tasks
- `POST /api/projects` - Create task
- `GET /api/projects/gantt` - Get Gantt data
- `PATCH /api/projects/:id` - Update task

### Marketing
- `GET /api/marketing` - List campaigns
- `GET /api/marketing/analytics` - Get analytics
- `GET /api/marketing/insights` - Get AI insights

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npm run cypress:open
```

## 🚀 Deployment

### Render (Recommended)
1. Connect your GitHub repository
2. Create a new Web Service for backend
3. Add PostgreSQL and Redis addons
4. Set environment variables
5. Deploy!

### Vercel (Frontend)
1. Import your GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Al-Habeeb Group for the opportunity
- JKFacilities for facility management expertise
- Qena community for their support

---

<p align="center">
  <strong>Happiness Plaza - Opening December 2026</strong><br>
  <em>A world-class destination in the heart of Qena</em>
</p>
