# Settings Management System

A full-stack **Settings Management System** that supports CRUD operations on **schemaless JSON settings**, with pagination, persistence, and a simple UI. The system is fully containerized and runnable with a single command.

---

## Overview

This project implements a RESTful API and frontend UI for managing arbitrary JSON-based “settings” objects. Each settings object is identified by a server-generated unique ID (`uid`) and can be created, read, updated, deleted, and listed with pagination.

### Key Features
- Schemaless JSON storage using PostgreSQL `JSONB`
- Full CRUD REST API
- Offset-based pagination
- React + TypeScript frontend
- Express + TypeScript backend
- Dockerized deployment (one-command startup)

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript
- Direct SQL queries (no ORM)

### Database
- PostgreSQL (JSONB for schemaless storage)

### Infrastructure
- Docker
- Docker Compose

---

## How to Run (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Start the Full Stack

From the project root:

<!-- ```bash -->
docker compose up --build

Open the UI
http://localhost:8080


The frontend is served by nginx and proxies /api/* requests to the backend.

First startup may take ~10–20 seconds while Postgres initializes.

How to run locally (optional)
Backend
cd backend
npm install
npm run dev


Runs on:

http://localhost:3000

Frontend
cd frontend
npm install
npm run dev


Runs on:

http://localhost:5173


In local development, the frontend uses a proxy to reach the backend.

API overview
Create settings

POST /api/settings

Request body:

{
  "example": true
}


Response:

{
  "uid": "uuid",
  "settings": { "example": true }
}

Get settings by UID

GET /api/settings/:uid

Returns 404 if not found

Update settings

PUT /api/settings/:uid

Replaces the entire settings object

Returns 404 if not found

Delete settings

DELETE /api/settings/:uid

Idempotent

Returns 204 No Content

List settings (pagination)

GET /api/settings?limit=&offset=

Defaults:

limit = 20

offset = 0

Response:

{
  "items": [
    { "uid": "...", "settings": { ... } }
  ],
  "page": {
    "limit": 20,
    "offset": 0,
    "total": 123
  }
}


Stable ordering: created_at DESC, uid DESC

Invalid params return 400

Large offsets return empty lists (not errors)

Design decisions

Postgres JSONB
Enables fully schemaless storage while retaining strong durability and query support.

limit/offset pagination
Simple, predictable pagination that works cleanly with UI controls.

Stable ordering
Prevents duplicate or missing rows during pagination.

Server-generated UUIDs
Avoids client trust issues and guarantees uniqueness.

Validation
Settings must be a valid JSON object (arrays and primitives rejected).

Nginx API proxy
Frontend calls /api/*, avoiding CORS issues and hardcoded backend URLs.

Testing

No automated tests were included.

Manual test checklist

After startup:

Create a new settings JSON in the UI

Verify it appears in the list

Edit and save the settings

Delete the settings

Restart containers and confirm data persists

Sample curl
curl -X POST http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -d '{"example": true}'

Notes for reviewers

Entire system runs with one Docker command

No local Postgres or Node setup required

Frontend ↔ backend communication matches production patterns

Designed for clarity and correctness over unnecessary complexity
