# NestJS Microservice - Auth Service

## Overview

This service handles user authentication and JWT token issuance.

## Tech Stack

- NestJS
- TypeScript
- Prisma (SQLite)
- JWT
- Passport

## Configuration

Configure the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| JWT_SECRET | Secret key for JWT signing | (required) |
| DATABASE_URL | SQLite database connection string | file:./dev.db |

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## Testing

### Test Results

**Unit Tests**: 21 tests passing
- `src/users/users.service.spec.ts` - 6 tests
- `src/auth/auth.service.spec.ts` - 8 tests
- `src/auth/auth.controller.spec.ts` - 7 tests

**E2E Tests**: 10 tests passing
- `test/auth.e2e-spec.ts` - Full auth flow tests

### Coverage

| Module | % Statements | % Branches | % Functions | % Lines |
|--------|-------------|------------|-------------|---------|
| auth.service.ts | 100% | 100% | 100% | 100% |
| users.service.ts | 100% | 100% | 100% | 100% |
| auth.dto.ts | 100% | 100% | 100% | 100% |

## Docker

```bash
# Build the Docker image
docker build -t nest-microservice-auth .

# Run the container
docker run -p 3001:3001 --env-file .env nest-microservice-auth
```

## API Endpoints

- **Base URL**: `http://localhost:3001`
- **Swagger**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`

## Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register a new user |
| `/auth/login` | POST | Login and receive JWT token |

### Register

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

---

> This service was extracted from the monorepo `nest-microservice-store` as part of a microservices migration. Initial commits were done via multi-agent setup to avoid merge conflicts.
```
