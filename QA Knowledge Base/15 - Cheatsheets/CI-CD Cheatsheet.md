# CI/CD Cheatsheet

> Швидка шпаргалка по CI/CD: GitHub Actions, пайплайни, тригери, секрети.

#cicd #cheatsheet #automation #devops #github

---

## Concepts

| Термін | Що означає |
|--------|-----------|
| **CI** | Continuous Integration — автоматичне тестування при commit |
| **CD** | Continuous Delivery/Deployment — доставка до prod |
| **Pipeline** | Послідовність автоматизованих кроків |
| **Job** | Набір steps, виконується на одному runner |
| **Step** | Один крок усередині job |
| **Runner** | Машина де виконується pipeline |
| **Artifact** | Файл результату (звіт, відео, білд) |
| **Trigger** | Подія що запускає pipeline |
| **Secret** | Зашифрована змінна |

---

## Pipeline Flow

```
Code Commit → CI Trigger
    ↓
Install Dependencies
    ↓
Lint / Code Style
    ↓
Unit Tests
    ↓
Build
    ↓
Integration / API Tests
    ↓
E2E Tests (Cypress/Playwright)
    ↓
Security Scan
    ↓
Performance Tests (нічний)
    ↓
Report & Notify
    ↓
Deploy (CD)
```

---

## GitHub Actions Structure

```yaml
name: My Workflow            # назва

on:                          # тригери
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 2 * * *'     # щодня о 2:00
  workflow_dispatch:         # ручний запуск

env:                         # глобальні змінні
  NODE_VERSION: '20'

jobs:
  my-job:
    runs-on: ubuntu-latest   # runner
    steps:
      - uses: actions/checkout@v3
      - name: My step
        run: echo "Hello!"
      - name: With env
        env:
          MY_VAR: ${{ secrets.MY_SECRET }}
        run: echo $MY_VAR
```

---

## Triggers

```yaml
on:
  # Push
  push:
    branches: [main, 'release/*']
    paths: ['src/**', '*.json']
    paths-ignore: ['docs/**', '*.md']

  # Pull Request
  pull_request:
    types: [opened, synchronize, reopened]

  # Schedule (UTC)
  schedule:
    - cron: '0 2 * * *'     # 2:00 щодня
    - cron: '0 3 * * 1'     # 3:00 щопонеділка
    - cron: '0 0 1 * *'     # опівночі 1-го кожного місяця

  # Manual
  workflow_dispatch:
    inputs:
      environment:
        default: 'staging'
        type: choice
        options: [dev, staging, production]
```

---

## Common Steps

```yaml
# Checkout код
- uses: actions/checkout@v3

# Node.js
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'npm'

# Python
- uses: actions/setup-python@v4
  with:
    python-version: '3.12'

# Install
- run: npm ci               # краще за npm install у CI
- run: pip install -r requirements.txt

# Cypress
- uses: cypress-io/github-action@v6
  with:
    browser: chrome
    spec: 'cypress/e2e/smoke/**'
  env:
    CYPRESS_BASE_URL: ${{ secrets.BASE_URL }}

# Upload artifact
- uses: actions/upload-artifact@v3
  if: always()              # навіть якщо тест впав
  with:
    name: test-results
    path: cypress/screenshots
    retention-days: 30
```

---

## Job Dependencies

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  unit-tests:
    needs: lint           # чекає lint
    runs-on: ubuntu-latest
    steps: [...]

  e2e-tests:
    needs: unit-tests     # чекає unit
    runs-on: ubuntu-latest
    steps: [...]

  notify:
    needs: [lint, unit-tests, e2e-tests]
    if: always()          # завжди
    steps: [...]
```

---

## Parallel Matrix

```yaml
jobs:
  test:
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
        node: [18, 20]
      fail-fast: false    # продовжувати навіть якщо один впав
    steps:
      - run: npm test
        env:
          BROWSER: ${{ matrix.browser }}
          NODE: ${{ matrix.node }}
```

---

## Conditions

```yaml
steps:
  - run: echo "Always"

  - run: echo "Only on main"
    if: github.ref == 'refs/heads/main'

  - run: echo "Only on success"
    if: success()

  - run: echo "Only on failure"
    if: failure()

  - run: echo "Always even if previous failed"
    if: always()

  - run: echo "Not on schedule"
    if: github.event_name != 'schedule'
```

---

## Secrets & Variables

```yaml
# Використання secrets
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}

# Variables (публічні, не секрети)
env:
  BASE_URL: ${{ vars.STAGING_URL }}
  APP_VERSION: ${{ vars.APP_VERSION }}

# Contexts
${{ github.sha }}           # поточний commit SHA
${{ github.ref_name }}      # назва гілки
${{ github.actor }}         # хто запустив
${{ github.repository }}    # owner/repo
${{ github.run_id }}        # ID запуску
${{ github.event_name }}    # тип тригера
```

---

## Caching

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# Або через setup-node
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'npm'      # автоматично кешує node_modules
```

---

## Notifications

```yaml
# Slack
- uses: slackapi/slack-github-action@v1
  if: failure()
  with:
    payload: |
      {"text": "Tests Failed on ${{ github.ref_name }}"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

# Email (через SendGrid)
- uses: dawidd6/action-send-mail@v3
  if: failure()
  with:
    server_address: smtp.sendgrid.net
    username: apikey
    password: ${{ secrets.SENDGRID_API_KEY }}
    to: qa-team@company.com
    subject: "Tests Failed"
    body: "Pipeline failed on branch ${{ github.ref_name }}"
```

---

## Cypress Action Options

```yaml
- uses: cypress-io/github-action@v6
  with:
    browser: chrome            # chrome, firefox, edge
    headed: false              # headless (default)
    spec: 'cypress/e2e/**'    # конкретні файли
    config: baseUrl=https://example.com  # override config
    record: false              # Cypress Cloud recording
    parallel: false            # Cypress Cloud parallel
    wait-on: 'http://localhost:3000'  # чекати URL
    wait-on-timeout: 120       # timeout для wait-on
    start: 'npm run start'     # запустити dev server
    build: 'npm run build'     # збірка перед тестами
```

---

## CI/CD Tools Quick Reference

| Інструмент | Конфіг файл | Особливість |
|-----------|-------------|------------|
| GitHub Actions | `.github/workflows/*.yml` | Вбудовано в GitHub |
| GitLab CI | `.gitlab-ci.yml` | Вбудовано в GitLab |
| Jenkins | `Jenkinsfile` | Self-hosted, Groovy |
| CircleCI | `.circleci/config.yml` | Docker-native |
| Bitbucket Pipelines | `bitbucket-pipelines.yml` | Atlassian |

---

## Related Notes

- [[CI-CD Overview]] — детальний CI/CD гайд
- [[GitHub Actions Guide]] — GitHub Actions
- [[DevOps for QA]] — Docker в CI
- [[Cypress Guide]] — Cypress в CI
- [[Artillery Guide]] — Performance в CI
