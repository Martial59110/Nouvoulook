## Running the Project with Docker

This project is fully containerized and can be run using Docker Compose. The setup includes three main services (API, Angular Admin, Astro Front) and a PostgreSQL database. Each service has its own Dockerfile and is orchestrated via the provided `docker-compose.yml`.

### Project-Specific Requirements
- **Node.js Version:** All Node-based services use `node:22.13.1-slim` (set via `ARG NODE_VERSION=22.13.1` in Dockerfiles).
- **Database:** PostgreSQL (default user/password: `postgres`/`postgres`, database: `nouvoulook`).
- **Static File Serving:** The Angular admin UI is served using `http-server@14.1.1`.
- **Astro Frontend:** Served using `astro preview` on port 4321.

### Required Environment Variables
- **API Service (`api-nouvoulook`):**
  - Uses `.env` file (see `.env.example` for required variables). Place your environment variables in `./api-nouvoulook/.env`.
- **Admin and Frontend:**
  - Optionally support `.env` files in their respective directories (`./front-nouvoulook/admin/.env`, `./front-nouvoulook/front/.env`). Uncomment the `env_file` lines in the compose file if needed.
- **PostgreSQL:**
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` are set in the compose file. **Change the password for production!**

### Build and Run Instructions
1. **Copy and configure environment files:**
   - For the API: `cp ./api-nouvoulook/.env.example ./api-nouvoulook/.env` and edit as needed.
   - (Optional) For Admin/Front: create `.env` files if your frontend needs environment variables.
2. **Build and start all services:**
   ```sh
   docker compose up --build
   ```
   This will build and start:
   - API (NestJS, port 3001)
   - Admin UI (Angular, port 8080)
   - Front UI (Astro, port 4321)
   - PostgreSQL (port 5432)

### Ports Exposed
- **API:** `3001` (NestJS backend)
- **Admin UI:** `8080` (Angular admin interface)
- **Front UI:** `4321` (Astro frontend)
- **PostgreSQL:** `5432` (database)

### Special Configuration Notes
- **API Database Connection:** The API expects a PostgreSQL database. Ensure your `.env` in `api-nouvoulook` is configured to connect to the `postgres` service (e.g., `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nouvoulook`).
- **Frontend/Backend Communication:**
  - The Admin and Frontend UIs expect the API to be reachable at `http://localhost:3001`.
- **Production Security:**
  - Change the default PostgreSQL password before deploying to production.
- **Volumes:**
  - PostgreSQL data is persisted in a Docker volume (`pgdata`).

---

_Refer to the individual README files in each subproject for more details on service-specific configuration and usage._