FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
ENV NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend \
    DATABASE_URL=sqlite:////app/db/duolingo.db \
    NEXT_PUBLIC_API_URL=/api/v1 \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY --from=frontend-build /usr/local/bin/node /usr/local/bin/node
COPY --from=frontend-build /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
COPY --from=frontend-build /app/frontend/.next /app/frontend/.next
COPY --from=frontend-build /app/frontend/node_modules /app/frontend/node_modules
COPY frontend/package.json /app/frontend/package.json
COPY frontend/public /app/frontend/public

COPY backend /app/backend
COPY db /app/db
COPY docker/start.sh /app/docker/start.sh
RUN chmod +x /app/docker/start.sh

EXPOSE 3000
CMD ["/app/docker/start.sh"]
