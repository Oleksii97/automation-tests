# GitHub Actions Guide

> Налаштування CI/CD для автотестів за допомогою GitHub Actions.

#cicd #automation #github #devops

---

## Overview

**GitHub Actions** — вбудована система CI/CD у GitHub. Дозволяє автоматично запускати будь-які скрипти при push, PR, за розкладом або вручну.

**Переваги:**
- Вбудовано в GitHub — не треба окремий сервер
- Безкоштовно для public repos
- Величезна бібліотека готових actions
- Matrix strategy для паралельного запуску

---

## Setup

### File Location

```
.github/
└── workflows/
    ├── tests.yml          ← основний pipeline
    ├── performance.yml    ← навантажувальні тести
    └── security.yml       ← security scan
```

### Anatomy of Workflow File

```yaml
name: My Workflow              # назва в UI

on:                            # тригери
  push:
    branches: [main]
  pull_request:

env:                           # глобальні env variables
  NODE_VERSION: '20'

jobs:                          # jobs (виконуються паралельно)
  my-job:                      # назва job
    runs-on: ubuntu-latest     # runner OS
    
    steps:                     # кроки всередині job
      - name: Step name
        run: echo "Hello!"
      
      - name: Use action
        uses: actions/checkout@v3
```

---

## Examples

### Cypress E2E Tests

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          browser: chrome
          record: false
        env:
          CYPRESS_BASE_URL: ${{ secrets.BASE_URL }}
          CYPRESS_API_TOKEN: ${{ secrets.API_TOKEN }}

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: screenshots
          path: cypress/screenshots
          retention-days: 7
```

### Playwright Tests

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox
      - run: npx playwright test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Matrix Strategy (паралельні браузери)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
      fail-fast: false   # продовжуй якщо один браузер впав
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Run tests in ${{ matrix.browser }}
        uses: cypress-io/github-action@v6
        with:
          browser: ${{ matrix.browser }}
```

### Manual Workflow with Inputs

```yaml
name: Manual Test Run

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options: [dev, staging, production]
      test-suite:
        description: 'Test suite to run'
        required: true
        default: 'smoke'
        type: choice
        options: [smoke, regression, full]
      browser:
        description: 'Browser'
        default: 'chrome'
        type: choice
        options: [chrome, firefox, edge]

jobs:
  manual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Run ${{ inputs.test-suite }} tests
        uses: cypress-io/github-action@v6
        with:
          browser: ${{ inputs.browser }}
          spec: "cypress/e2e/${{ inputs.test-suite }}/**/*.cy.js"
        env:
          CYPRESS_BASE_URL: ${{ vars[format('{0}_URL', inputs.environment)] }}
```

### Artillery Performance Tests

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 3 * * 1'  # щопонеділка о 3:00

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g artillery@latest
      - name: Run load test
        run: artillery run --output results.json tests/load.yml
        env:
          TARGET_URL: ${{ secrets.STAGING_URL }}
      - name: Generate report
        run: artillery report results.json --output report.html
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: |
            results.json
            report.html
```

### Full Pipeline with Conditions

```yaml
name: Full Pipeline

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  api-tests:
    runs-on: ubuntu-latest
    needs: lint           # чекає lint
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:api

  e2e-tests:
    runs-on: ubuntu-latest
    needs: api-tests      # чекає api-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - uses: cypress-io/github-action@v6
        with:
          browser: chrome

  notify-success:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: success()         # лише якщо все пройшло
    steps:
      - name: Notify success
        run: echo "All tests passed! Notifying team..."

  notify-failure:
    runs-on: ubuntu-latest
    needs: [lint, api-tests, e2e-tests]
    if: failure()         # якщо щось впало
    steps:
      - name: Notify failure
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "Tests FAILED on PR #${{ github.event.number }}"}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Best Practices

### Secrets Management

```yaml
# Правильно — через secrets
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}

# НІКОЛИ так
env:
  API_TOKEN: "my-real-token-123"   # ❌ Небезпечно!
```

### Caching

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'npm'          # кешує node_modules

# Або вручну
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### Retries для нестабільних тестів

```yaml
- name: Run tests with retry
  uses: cypress-io/github-action@v6
  with:
    config: retries=2         # Cypress retry

# Або через step retry
- name: Run API tests
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm run test:api
```

### Artifacts Retention

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      cypress/screenshots
      cypress/videos
      reports/
    retention-days: 30    # зберігати 30 днів
```

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `Resource not accessible by integration` | Недостатньо прав | Додай permissions до workflow |
| `Process completed with exit code 1` | Тест впав | Перевір logs |
| `Cypress: No specs found` | Неправильний path | Перевір `spec` параметр |
| `npm ci failed` | Немає package-lock.json | Запусти `npm install` і закомміть lock |
| Secret is empty | Секрет не додано | Settings → Secrets and variables |

---

## Useful Actions

```yaml
# Checkout
uses: actions/checkout@v3

# Node.js setup
uses: actions/setup-node@v3

# Python setup
uses: actions/setup-python@v4

# Upload artifacts
uses: actions/upload-artifact@v3

# Download artifacts
uses: actions/download-artifact@v3

# Cypress
uses: cypress-io/github-action@v6

# Playwright
uses: microsoft/playwright-github-action@v1

# Slack notification
uses: slackapi/slack-github-action@v1

# Docker build & push
uses: docker/build-push-action@v4

# Snyk security
uses: snyk/actions/node@master

# Cache
uses: actions/cache@v3
```

---

## Related Notes

- [[CI-CD Overview]] — загальна теорія CI/CD
- [[DevOps for QA]] — Docker в GitHub Actions
- [[Cypress Guide]] — Cypress в CI
- [[Artillery Guide]] — Performance в CI
- [[CI-CD Cheatsheet]] — швидка шпаргалка
