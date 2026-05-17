# QA Automation MOC

> Map of Content для QA Automation: від основ до просунутих практик.

#qa #automation #moc

---

## Learning Path (Junior → Senior)

### Junior AQA
- [[QA Overview]] — що таке QA, роль тестувальника
- [[Test Types]] — unit, integration, E2E, API
- [[Testing Pyramid]] — стратегія покриття тестами
- [[Manual vs Automation]] — коли автоматизувати

### Middle AQA
- [[Cypress Guide]] — E2E тестування
- [[API Testing Overview]] — REST API тестування
- [[Page Object Pattern]] — архітектурний патерн
- [[BDD and Cucumber]] — BDD підхід
- [[CI-CD Overview]] — базова CI/CD інтеграція

### Senior AQA / SDET
- [[Playwright Guide]] — кросбраузерне тестування
- [[Selenium Guide]] — WebDriver стандарт
- [[Performance Testing Overview]] — навантажувальне тестування
- [[Artillery Guide]] — Artillery в деталях
- [[Security Testing Overview]] — основи security testing
- [[DevOps for QA]] — Docker, Kubernetes
- [[GitHub Actions Guide]] — повноцінний CI/CD

---

## Test Automation Flow

```
Вимоги (Requirements)
        ↓
Test Plan → Test Cases
        ↓
Framework Setup (Cypress / Playwright / Selenium)
        ↓
Write Tests → Review → Merge
        ↓
CI/CD Pipeline (GitHub Actions / Jenkins)
        ↓
Reports → Slack/Email Notification
        ↓
Bug Report → Fix → Retest
```

---

## Framework Selection Guide

| Потреба | Рекомендація |
|---------|-------------|
| Новий проєкт, JS/TS стек | [[Cypress Guide]] |
| Кросбраузерність (Safari, Firefox) | [[Playwright Guide]] |
| Legacy Java проєкт | [[Selenium Guide]] |
| Python backend testing | [[Pytest Guide]] |
| BDD з бізнесом | [[BDD and Cucumber]] |
| Навантажувальне тестування | [[Artillery Guide]] |

---

## Key Concepts

- **Test Pyramid**: багато unit → менше integration → мало E2E
- **Shift Left**: тестувати раніше, а не тільки перед релізом
- **DRY**: Don't Repeat Yourself — використовуй [[Page Object Pattern]]
- **CI/CD Integration**: тести → автоматично → на кожен commit

---

## Backlinks

→ [[Automation Testing Index]] — головна сторінка
→ [[Security Testing MOC]] — безпека
→ [[QA Automation Interview Questions]] — підготовка до співбесіди
