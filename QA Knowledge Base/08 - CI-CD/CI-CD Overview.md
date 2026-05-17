# CI/CD Overview

> Безперервна інтеграція та доставка: концепції, pipeline, інструменти для QA.

#qa #automation #cicd #devops

---

## Overview

**CI/CD** (Continuous Integration / Continuous Delivery) — набір практик і інструментів для автоматизованої перевірки та доставки коду від розробника до продакшену.

```
Developer → Code → CI (Build + Test) → CD (Deploy) → Production
```

---

## CI vs CD vs CD

| Абревіатура | Розшифровка | Що робить |
|-------------|-------------|-----------|
| **CI** | Continuous Integration | Автоматично перевіряє код при кожному commit |
| **CD** | Continuous Delivery | Автоматично готує код до деплою (ручний approve) |
| **CD** | Continuous Deployment | Автоматично деплоїть у production (без approve) |

---

## CI Pipeline Stages

```
┌─────────────────────────────────────────────────────────┐
│                    CI Pipeline                           │
│                                                          │
│  Code Commit                                             │
│       ↓                                                  │
│  1. Source Control (Git Checkout)                        │
│       ↓                                                  │
│  2. Install Dependencies (npm ci / pip install)          │
│       ↓                                                  │
│  3. Lint / Code Style Check (ESLint, Prettier)           │
│       ↓                                                  │
│  4. Unit Tests (Jest, Pytest)                            │
│       ↓                                                  │
│  5. Build (npm run build / Docker build)                 │
│       ↓                                                  │
│  6. Integration Tests (API tests)                        │
│       ↓                                                  │
│  7. E2E Tests (Cypress, Playwright)                      │
│       ↓                                                  │
│  8. Security Scan (Snyk, ZAP)                            │
│       ↓                                                  │
│  9. Performance Tests (Artillery) — якщо потрібно        │
│       ↓                                                  │
│  10. Report & Notify (Slack, Email)                      │
└─────────────────────────────────────────────────────────┘
         ↓ Якщо всі кроки пройшли
    CD Pipeline (Deploy to Staging → Production)
```

---

## When to Run Tests

| Тригер | Тип тестів | Причина |
|--------|-----------|---------|
| **Push до feature branch** | Smoke + Unit | Швидкий feedback |
| **Pull Request / Merge Request** | Smoke + Integration + API | Перевірка перед злиттям |
| **Push до main/master** | Full Regression | Після злиття |
| **Scheduled (нічний)** | Full E2E + Performance | Повне покриття |
| **Ручний запуск** | Вибірковий | Перед релізом |

---

## CI/CD Tools

### Cloud-Integrated (вбудовані в Git-платформи)

| Інструмент | Платформа | Безкоштовно |
|-----------|-----------|-------------|
| **GitHub Actions** | GitHub | Так (обмежено) |
| **GitLab CI/CD** | GitLab | Так (обмежено) |
| **Bitbucket Pipelines** | Bitbucket | Так (обмежено) |
| **Azure DevOps** | Azure | Так (обмежено) |

### Standalone (окремі сервери)

| Інструмент | Особливості |
|-----------|-------------|
| **Jenkins** | Найпоширеніший, дуже гнучкий |
| **TeamCity** | Від JetBrains, зручний UI |
| **CircleCI** | Хмарний, Docker-native |
| **Bamboo** | Від Atlassian, з Jira |

---

## GitHub Actions — Quick Start

### Basic Cypress Pipeline

```yaml
# .github/workflows/cypress.yml
name: Cypress E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'   # щоночі о 2:00

jobs:
  cypress-run:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          browser: chrome
          headed: false
        env:
          CYPRESS_BASE_URL: ${{ secrets.STAGING_URL }}
          CYPRESS_TOKEN: ${{ secrets.API_TOKEN }}

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload test video
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

### Advanced Pipeline with Jobs

```yaml
# .github/workflows/full-pipeline.yml
name: Full Test Pipeline

on:
  pull_request:
    branches: [main]

jobs:
  # Job 1: Lint and Unit Tests (швидко)
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit

  # Job 2: API Tests (залежить від unit)
  api-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:api

  # Job 3: E2E Tests (паралельно з API)
  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    strategy:
      matrix:
        browser: [chrome, firefox]   # паралельно у двох браузерах
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Run E2E in ${{ matrix.browser }}
        uses: cypress-io/github-action@v6
        with:
          browser: ${{ matrix.browser }}
        env:
          CYPRESS_BASE_URL: ${{ vars.STAGING_URL }}

  # Job 4: Security Scan
  security:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Job 5: Notify (завжди)
  notify:
    runs-on: ubuntu-latest
    needs: [api-tests, e2e-tests, security]
    if: always()
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Pipeline ${{ job.status }}: ${{ github.workflow }}",
              "attachments": [{
                "color": "${{ job.status == 'success' && 'good' || 'danger' }}",
                "text": "Branch: ${{ github.ref }} | Commit: ${{ github.sha }}"
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Artillery Performance Pipeline

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 3 * * 1'   # щопонеділка о 3:00

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g artillery
      - run: artillery run --output results.json tests/load-test.yml
      - run: artillery report results.json
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: report.html
```

---

## GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - install
  - test
  - e2e
  - report

variables:
  NODE_VERSION: "20"

install:
  stage: install
  script:
    - npm ci
  cache:
    paths:
      - node_modules/

unit-tests:
  stage: test
  script:
    - npm run test:unit
  artifacts:
    reports:
      junit: junit-report.xml

api-tests:
  stage: test
  script:
    - npm run test:api

e2e-tests:
  stage: e2e
  image: cypress/included:13.6.0
  script:
    - cypress run --browser chrome
  artifacts:
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
    expire_in: 1 week
```

---

## Docker in CI/CD

```dockerfile
# Dockerfile для запуску тестів
FROM cypress/included:13.6.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "cypress", "run", "--browser", "chrome"]
```

```bash
# Запуск тестів у Docker
docker build -t my-tests .
docker run --rm \
  -e CYPRESS_BASE_URL=https://staging.example.com \
  -v $(pwd)/cypress/screenshots:/app/cypress/screenshots \
  my-tests
```

---

## CI/CD Best Practices

1. **Fail fast** — спочатку швидкі тести (lint, unit), потім повільні (E2E)
2. **Паралельне виконання** — API та E2E паралельно
3. **Artifacts** — зберігай screenshots/videos при падінні
4. **Secrets у secrets** — ніколи не хардкод у workflow файлах
5. **Retry для flaky тестів** — `--retries 2` у Cypress
6. **Notifications** — Slack/email при падінні
7. **Branch protection** — merge лише якщо CI пройшов
8. **Cache dependencies** — швидший запуск

---

## Triggers Reference

```yaml
on:
  # При push
  push:
    branches: [main, 'release/*']
    paths:                          # лише якщо змінились ці файли
      - 'src/**'
      - '*.json'
    paths-ignore:
      - 'docs/**'
      - '*.md'

  # При PR
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]

  # За розкладом
  schedule:
    - cron: '0 2 * * *'    # щодня о 2:00 UTC

  # Ручний запуск
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]
      browser:
        description: 'Browser'
        default: 'chrome'
```

---

## Checklists

### CI/CD — впровадження

- [ ] Налаштовано базовий workflow на push до main
- [ ] Тести запускаються автоматично при commit
- [ ] Налаштовано тригер для Pull Request
- [ ] Звіти доступні команді (хоча б через artifacts або Slack)
- [ ] Документація для команди — як працює pipeline
- [ ] Sensitive data (паролі, токени) у Secrets, не в коді
- [ ] Build-час не перевищує 30 хвилин (для зручності команди)

### CI/CD — для AQA проєкту

- [ ] Тести запускаються в чистому Docker-середовищі
- [ ] Налаштовано retry для нестабільних тестів (`retries: { runMode: 2 }`)
- [ ] Скріншоти та відео зберігаються як artifacts при падінні
- [ ] Налаштовано параметри запуску (browser, environment, spec)
- [ ] Падіння тесту → нотифікація відповідальному (Slack/Email)
- [ ] Окремі jobs для smoke та regression тестів

---

## Related Notes

- [[GitHub Actions Guide]] — детальний GitHub Actions гайд
- [[DevOps for QA]] — Docker, Kubernetes
- [[Cypress Guide]] — Cypress в CI
- [[Artillery Guide]] — Performance в CI
- [[CI-CD Cheatsheet]] — швидка шпаргалка
- [[Automation Testing Index]] — головна сторінка
