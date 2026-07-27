# Deployment Guide

The repository includes a single-service Render deployment. The Docker image runs the Next.js app on the public port and FastAPI on an internal port. Next.js rewrites `/api/v1/*` requests to FastAPI, so reviewers only need one public URL.

## Render deployment

1. Push this repository to a GitHub repository.
2. In Render, choose **New > Blueprint** and select the repository.
3. Keep the Blueprint file as `render.yaml` and create the service.
4. Wait for the Docker build and open the generated `onrender.com` URL.
5. Verify `https://YOUR-APP.onrender.com/api/v1/health` returns a healthy response.

The expected Render service configuration is already declared in `render.yaml`:

- Docker build from the repository root
- Singapore region
- Free web-service plan for an assignment demo
- Health check at `/api/v1/health`
- `NEXT_PUBLIC_API_URL=/api/v1` so the browser uses the same public origin

## Local Docker verification

```bash
docker build -t duolingo-clone .
docker run --rm -p 3000:3000 duolingo-clone
```

Open `http://localhost:3000` and use the normal lesson flow. The container includes the seeded SQLite database and automatically seeds it if the database file is absent.

## Deployment limitation

SQLite is intentionally retained because it is part of the assignment architecture. The default Render demo uses the container filesystem, so progress is demo data and can reset when the service is recreated. For a persistent deployment, attach a Render persistent disk at `/app/db` or migrate the SQLAlchemy URL to a managed PostgreSQL database. No application code outside the database URL and migration/seed strategy needs to change for that future upgrade.
