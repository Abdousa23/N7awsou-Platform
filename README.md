# N7awsou Platform

N7awsou is a comprehensive travel and tour management platform, featuring an AI-powered assistant, a robust backend API, and a modern frontend web application. This monorepo contains all services required to run the platform locally.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Environment Variables](#environment-variables)
  - [Running the Project Locally](#running-the-project-locally)
    - [1. Backend (NestJS)](#1-backend-nestjs)
    - [2. Frontend (Next.js)](#2-frontend-nextjs)
    - [3. AI Service (Python)](#3-ai-service-python)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
n7awso-ai/           # AI-powered bots and recommendation system (Python)
N7awsou-back/        # Backend REST API (NestJS/TypeScript)
N7awsou-frontend/    # Frontend web app (Next.js/TypeScript)
```

---

## Features

### 1. AI Service (`n7awso-ai`)
- **Voice Chat API**: Natural language interaction for travel assistance.
- **Recommendation System**: Personalized trip, hotel, and activity suggestions.
- **Planning Bot**: Automated trip planning based on user preferences.
- **Search Bot**: Advanced search for destinations, offers, and more.
- **Assistance Bot**: General travel inquiries and support.
- **Email Marketing Automation**: Automated email campaigns for offers and updates.
- **Knowledge Base**: Centralized travel data for AI responses.

### 2. Backend API (`N7awsou-back`)
- **User Authentication & Authorization**: Secure login, registration, and role-based access.
- **Tour Management**: CRUD operations for tours, custom tours, and related entities.
- **Hotel & Room Management**: Manage hotels, rooms, and availability.
- **Country & City Data**: Rich information about destinations.
- **Booking System**: End-to-end booking flow for users.
- **Payment Integration**: Payment processing for bookings.
- **Review System**: User reviews for tours and hotels.
- **History Tracking**: User activity and booking history.
- **Cloudinary Integration**: Image upload and management.
- **Logging & Error Handling**: Centralized logging and exception filters.

### 3. Frontend Web App (`N7awsou-frontend`)
- **Multi-language Support**: Arabic, English, and French.
- **Responsive Design**: Mobile-friendly UI.
- **Authentication**: Login, registration, and protected routes.
- **Landing Page**: Engaging homepage with featured tours and offers.
- **Tour Search & Filtering**: Advanced search, filters, and recommendations.
- **Booking Flow**: Intuitive booking process for users.
- **User Dashboard**: Manage bookings, profile, and preferences.
- **AI Chat Integration**: Interact with the AI assistant directly from the UI.
- **Admin Features**: (If enabled) Manage tours, bookings, and users.
- **Theming & Accessibility**: Customizable themes and accessible components.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Python** (v3.9+)
- **Docker** (optional, for database and services)
- **PostgreSQL** (or your preferred DB, if not using Docker)

---

### Clone the Repository

```sh
git clone https://github.com/your-org/n7awsou-platform.git
cd n7awsou-platform
```

---

### Environment Variables

- Copy `.env.example` to `.env` in each subproject and fill in required values.
- Ensure database URLs, API keys, and secrets are set correctly.

---

### Running the Project Locally

#### 1. Backend (NestJS)

```sh
cd N7awsou-back
npm install
# Generate Prisma client if needed
npx prisma generate
# Run database migrations
npx prisma migrate dev
# Start the backend server
npm run start:dev
```

- The backend will run on `http://localhost:3000` by default.

#### 2. Frontend (Next.js)

```sh
cd N7awsou-frontend
npm install
npm run dev
```

- The frontend will run on `http://localhost:3001` (or as configured).

#### 3. AI Service (Python)

```sh
cd n7awso-ai
pip install -r requirements.txt
# Run the AI service
python main.py
```

- The AI service will run on `http://localhost:8000` (or as configured).


## API Documentation

- **Backend API**: Swagger docs available at `http://localhost:3000/api` (if enabled).
- **AI Voice Chat API**: See [`VOICE_CHAT_API.md`](n7awso-ai/VOICE_CHAT_API.md).
- **Country/City APIs**: See [`COUNTRY_API.md`](N7awsou-back/src/country/COUNTRY_API.md) and [`CITY_API.md`](N7awsou-back/src/city/CITY_API.md).

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.


## Contact

For questions or support, please open an issue or contact the maintainers.
