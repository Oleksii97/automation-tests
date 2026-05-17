# DevOps for QA

> Docker, Kubernetes та інфраструктура для QA Automation Engineer.

#devops #docker #kubernetes #qa #automation #cicd

---

## Overview

QA Automation Engineer все частіше потребує знань DevOps практик: контейнеризація тестів, запуск у хмарі, управління середовищами. Docker і Kubernetes стали стандартом для запуску автотестів.

---

## Docker for Testing

### Why Docker for Tests

- **Ізольоване середовище** — однакове на локальній машині та CI
- **Відтворюваність** — "works on my machine" більше не проблема
- **Паралельний запуск** — кілька контейнерів одночасно
- **Чисте середовище** — кожен запуск з нуля

### Dockerfile для Cypress

```dockerfile
# Dockerfile
FROM cypress/included:13.6.0

# Встановлення залежностей
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Копіюємо тести
COPY cypress/ ./cypress/
COPY cypress.config.js ./

# Точка входу
CMD ["npx", "cypress", "run", "--browser", "chrome"]
```

### Dockerfile для Playwright

```dockerfile
FROM mcr.microsoft.com/playwright:v1.44.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps

COPY . .

CMD ["npx", "playwright", "test"]
```

### Build та Run

```bash
# Збірка образу
docker build -t my-cypress-tests .

# Запуск тестів
docker run --rm \
  -e CYPRESS_BASE_URL=https://staging.example.com \
  -e CYPRESS_API_TOKEN=my-token \
  -v $(pwd)/cypress/screenshots:/app/cypress/screenshots \
  -v $(pwd)/cypress/videos:/app/cypress/videos \
  my-cypress-tests

# Windows (PowerShell)
docker run --rm `
  -e CYPRESS_BASE_URL=https://staging.example.com `
  -v ${PWD}/cypress/screenshots:/app/cypress/screenshots `
  my-cypress-tests
```

### docker-compose.yml для тестів

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Тести (залежать від app та api)
  cypress-tests:
    build: .
    depends_on:
      - app
      - api
    environment:
      - CYPRESS_BASE_URL=http://app:3000
      - CYPRESS_API_URL=http://api:4000
    volumes:
      - ./cypress/screenshots:/app/cypress/screenshots
      - ./cypress/videos:/app/cypress/videos
    command: npx cypress run --browser chrome

  # Тестовий застосунок
  app:
    image: my-app:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - API_URL=http://api:4000

  # Тестовий API
  api:
    image: my-api:latest
    ports:
      - "4000:4000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/testdb

  # Тестова база даних
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=testdb
    # Без volumes — дані не зберігаються між запусками (чисте середовище)
```

```bash
# Запуск всього стеку
docker-compose up --abort-on-container-exit cypress-tests

# Тільки тести (app/api мають бути запущені)
docker-compose run --rm cypress-tests
```

### Selenium Grid з Docker

```yaml
# docker-compose.selenium.yml
version: '3.8'
services:
  selenium-hub:
    image: selenium/hub:4
    ports:
      - "4444:4444"

  chrome:
    image: selenium/node-chrome:4
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_EVENT_BUS_PUBLISH_PORT=4442
    deploy:
      replicas: 3   # 3 Chrome ноди паралельно

  firefox:
    image: selenium/node-firefox:4
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_EVENT_BUS_PUBLISH_PORT=4442
    deploy:
      replicas: 2
```

```bash
docker-compose -f docker-compose.selenium.yml up -d
# Grid UI: http://localhost:4444
```

---

## Docker Commands for QA

```bash
# Основні команди
docker ps                          # запущені контейнери
docker ps -a                       # всі контейнери
docker images                      # список образів
docker logs <container-id>         # логи контейнера
docker exec -it <container-id> sh  # увійти в контейнер

# Cleanup
docker stop <container-id>
docker rm <container-id>
docker rmi <image-id>
docker system prune                # видалити все непотрібне

# Build
docker build -t my-tests .
docker build -t my-tests:v1.0 .
docker build --no-cache -t my-tests .

# Run
docker run --rm my-tests                     # видалити після зупинки
docker run -d my-tests                       # в background
docker run -it my-tests sh                   # інтерактивний shell
docker run -e VAR=value my-tests             # env variable
docker run -v /host/path:/container/path my-tests  # volume mount
```

---

## Kubernetes for Testing

### Why K8s for Tests

- Масштабований паралельний запуск
- Управління ресурсами (CPU, memory)
- Self-healing (перезапуск при падінні)
- Інтеграція з хмарними провайдерами

### Test Job Manifest

```yaml
# k8s/cypress-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: cypress-e2e-tests
  labels:
    app: test-runner
    type: e2e
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 2    # retries
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: cypress
          image: my-cypress-tests:latest
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2"
          env:
            - name: CYPRESS_BASE_URL
              valueFrom:
                secretKeyRef:
                  name: test-secrets
                  key: staging-url
            - name: CYPRESS_TOKEN
              valueFrom:
                secretKeyRef:
                  name: test-secrets
                  key: api-token
          volumeMounts:
            - name: test-results
              mountPath: /app/cypress/screenshots
      volumes:
        - name: test-results
          emptyDir: {}
```

```bash
# Запуск
kubectl apply -f k8s/cypress-job.yaml

# Статус
kubectl get jobs
kubectl get pods -l app=test-runner

# Логи
kubectl logs -l app=test-runner --follow

# Видалення
kubectl delete -f k8s/cypress-job.yaml
```

---

## Environment Management

### .env файли для різних середовищ

```bash
# .env.development
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000
ENV=dev

# .env.staging
BASE_URL=https://staging.example.com
API_URL=https://api.staging.example.com
ENV=staging

# .env.production (лише для reference, ніколи в тестах!)
# ...
```

```bash
# Запуск з конкретним оточенням
ENV=staging npx cypress run
dotenv -e .env.staging npx cypress run
```

---

## Container Security for Tests

```dockerfile
# Security best practices у Dockerfile
FROM cypress/included:13.6.0

# Не запускати як root
RUN groupadd -r testuser && useradd -r -g testuser testuser

WORKDIR /app
COPY --chown=testuser:testuser package*.json ./
RUN npm ci --only=production

COPY --chown=testuser:testuser . .

USER testuser   # переключитись на non-root

CMD ["npx", "cypress", "run"]
```

---

## Monitoring Test Infrastructure

```yaml
# Prometheus metrics для тестів (Grafana dashboard)
- job_name: 'test-runner'
  static_configs:
    - targets: ['test-runner:9090']
  metrics_path: '/metrics'
```

---

## Related Notes

- [[CI-CD Overview]] — CI/CD pipeline
- [[GitHub Actions Guide]] — GitHub Actions + Docker
- [[Security Testing Overview]] — container security
- [[Automation Testing Index]] — головна сторінка
