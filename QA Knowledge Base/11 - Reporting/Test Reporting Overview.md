# Test Reporting Overview

> Звіти по тестуванню: інструменти, формати, інтеграція з CI/CD та моніторинг.

#qa #automation #testing #reporting

---

## Overview

**Test Reporting** — документування результатів тестування для команди, менеджменту та аналізу тенденцій. Хороший звіт відповідає на питання: що тестувалось, що впало, чому, і що робити далі.

---

## Report Types

| Тип | Аудиторія | Деталі |
|-----|-----------|--------|
| **Test Execution Report** | QA команда | Всі тести, статуси, час |
| **Summary Report** | Менеджмент | Відсоток проходження, тренди |
| **Bug Report** | Розробники | Деталі падінь, кроки |
| **Coverage Report** | Tech Lead | Покриття коду |
| **Performance Report** | Всі | Метрики, SLA |

---

## Reporting Tools

### Allure Report (Best Overall)

```bash
# Встановлення
npm install --save-dev allure-commandline
npm install --save-dev allure-cypress    # для Cypress
```

```javascript
// cypress.config.js
const { allureCypress } = require('allure-cypress/reporter');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, {
        resultsDir: 'allure-results'
      });
    }
  }
});
```

```bash
# Генерація та відкриття звіту
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

**Функціональність Allure:**
- Grafici та тренди
- Screenshots, videos, attachments
- Категорії падінь (Known Issues, Product Bugs, Test Defects)
- Severity, labels, описи
- Retries та flaky тест індикатори

### Cypress HTML Report

```bash
npm install --save-dev mochawesome
npm install --save-dev cypress-mochawesome-reporter
```

```javascript
// cypress.config.js
module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Test Results',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false
  }
});
```

### Playwright HTML Report

```javascript
// playwright.config.js
module.exports = defineConfig({
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
    ['json', { outputFile: 'results.json' }]
  ]
});
```

```bash
npx playwright show-report
```

### Artillery HTML Report

```bash
artillery run --output results.json test.yml
artillery report results.json --output report.html
```

### pytest HTML Report

```bash
pip install pytest-html
pytest --html=reports/report.html --self-contained-html

# З coverage
pytest --html=reports/report.html --cov=src --cov-report=html
```

---

## CI/CD Integration

### GitHub Actions Artifacts

```yaml
- name: Run Cypress tests
  uses: cypress-io/github-action@v6

- name: Upload test reports
  uses: actions/upload-artifact@v3
  if: always()   # навіть якщо тести впали
  with:
    name: test-reports
    path: |
      cypress/screenshots
      cypress/videos
      allure-report/
    retention-days: 30

- name: Publish Test Results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Cypress Tests
    path: 'results.xml'
    reporter: java-junit
```

### Slack Notification

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": ":x: Tests Failed!",
        "attachments": [{
          "color": "danger",
          "fields": [
            {
              "title": "Repository",
              "value": "${{ github.repository }}",
              "short": true
            },
            {
              "title": "Branch",
              "value": "${{ github.ref_name }}",
              "short": true
            },
            {
              "title": "Triggered by",
              "value": "${{ github.actor }}",
              "short": true
            },
            {
              "title": "Report",
              "value": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
              "short": false
            }
          ]
        }]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Test Metrics to Track

| Метрика | Формула | Мета |
|---------|---------|------|
| **Pass Rate** | Passed / Total × 100% | > 95% |
| **Flakiness Rate** | Flaky / Total × 100% | < 5% |
| **Test Execution Time** | Час запуску | Тренд вниз |
| **Coverage** | Тести / Features × 100% | > 80% |
| **Mean Time to Detect** | Час виявлення бага | Тренд вниз |
| **Defects Found** | Кількість знайдених дефектів | Тренд вниз (стабільна система) |

---

## Bug Report Template

```markdown
## Bug Report

**Title**: [Module/Component] Short description

**Priority**: Critical / High / Medium / Low
**Severity**: Critical / Major / Minor / Trivial
**Status**: New / In Progress / Fixed / Closed

**Environment**:
- OS: Windows 11 / macOS 14
- Browser: Chrome 125
- App Version: 2.3.1
- Environment: Staging

**Preconditions**:
- User is logged in
- Cart has at least 1 item

**Steps to Reproduce**:
1. Go to /cart
2. Click "Checkout"
3. Fill in payment form
4. Click "Submit"

**Expected Result**:
Order confirmation page is displayed

**Actual Result**:
500 Internal Server Error

**Attachments**:
- screenshot.png
- console-log.txt
- video-of-bug.mp4

**Notes**:
Happens only with Visa cards, not Mastercard
```

---

## Monitoring & Alerting

### Test Trend Analysis

```
Week 1: 95% pass rate
Week 2: 92% pass rate → ⚠️ Investigate flaky tests
Week 3: 88% pass rate → 🚨 Action needed
Week 4: 96% pass rate → ✅ Recovered
```

### Dashboard Recommended Tools

| Інструмент | Що показує |
|-----------|-----------|
| **Allure TestOps** | Тренди, flaky tests, coverage |
| **Grafana + InfluxDB** | Custom dashboards |
| **Cypress Cloud** | Cypress-specific analytics |
| **GitHub Actions** | CI runs, success/fail rate |
| **Datadog** | Application + test monitoring |

---

## Best Practices

1. **Зберігай screenshots/video при падінні** — в CI як artifacts
2. **Чіткі назви тестів** — звіт повинен бути зрозумілий без коду
3. **Категорії падінь** — test defect vs product bug vs infrastructure
4. **Тренди важливіші за абсолютні числа** — Pass Rate падає? Діяй.
5. **Flaky tests tracker** — окремий tracking для нестабільних тестів
6. **Notification на failure** — Slack/Email негайно

---

## Related Notes

- [[CI-CD Overview]] — звіти в CI/CD
- [[GitHub Actions Guide]] — artifacts та notifications
- [[Cypress Guide]] — Cypress reporting
- [[Artillery Guide]] — performance reports
- [[Automation Testing Index]] — головна сторінка
