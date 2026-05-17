# Learning Roadmap

> Roadmap для розвитку QA Automation Engineer: від нуля до Senior SDET.

#qa #automation #career #roadmap

---

## Phase 1: Foundation (0-3 місяці)

### QA Basics
- [ ] [[QA Overview]] — принципи тестування, ролі
- [ ] [[Testing Pyramid]] — стратегія покриття
- [ ] [[Test Types]] — типи тестування
- [ ] [[Manual vs Automation]] — коли автоматизувати

### Programming (JavaScript / Python)
- [ ] Базовий синтаксис (змінні, функції, умови, цикли)
- [ ] Об'єкти та масиви
- [ ] Async/Await, Promises (для JS)
- [ ] ООП основи (класи, наслідування)
- [ ] Git основи (commit, branch, PR)

### First Framework
- [ ] [[Cypress Guide]] — встановлення та перший тест
- [ ] cy.visit(), cy.get(), cy.click(), cy.type()
- [ ] Assertions: should(), and()
- [ ] describe/it структура
- [ ] beforeEach/afterEach hooks

---

## Phase 2: Automation (3-6 місяців)

### Cypress Advanced
- [ ] [[Page Object Pattern]] — POP архітектура
- [ ] Custom Commands
- [ ] Fixtures та Test Data
- [ ] Network Interception (cy.intercept)
- [ ] [[API Testing with Cypress]] — cy.request()
- [ ] Cypress configuration

### API Testing
- [ ] [[API Testing Overview]] — HTTP fundamentals
- [ ] REST API принципи
- [ ] Postman — manual exploration
- [ ] Automated API тести
- [ ] Authentication (JWT, Bearer token)

### BDD
- [ ] [[BDD and Cucumber]] — концепція BDD
- [ ] [[Gherkin Syntax]] — Feature, Scenario, Given/When/Then
- [ ] Step Definitions
- [ ] Scenario Outline + Examples

---

## Phase 3: Professional (6-12 місяців)

### Cross-Browser & Advanced
- [ ] [[Playwright Guide]] — кросбраузерне тестування
- [ ] Safari/WebKit тестування
- [ ] Mobile emulation
- [ ] Parallel test execution

### CI/CD Integration
- [ ] [[CI-CD Overview]] — основи CI/CD
- [ ] [[GitHub Actions Guide]] — практична конфігурація
- [ ] Docker основи — [[DevOps for QA]]
- [ ] Звіти та notifications

### Performance Testing
- [ ] [[Performance Testing Overview]] — теорія
- [ ] [[Artillery Guide]] — практика
- [ ] Метрики та SLA
- [ ] Аналіз результатів

### Reporting
- [ ] [[Test Reporting Overview]] — Allure Report
- [ ] Артефакти в CI
- [ ] Test Metrics

---

## Phase 4: Senior / SDET (12-24 місяці)

### Advanced Automation
- [ ] [[Selenium Guide]] — WebDriver стандарт
- [ ] [[Pytest Guide]] — Python testing
- [ ] Test Architecture Design
- [ ] Test Framework від нуля

### Security Testing
- [ ] [[Security Testing Overview]] — OWASP Top 10
- [ ] [[Security Testing MOC]] — інструменти
- [ ] SAST/DAST інтеграція в CI
- [ ] API Security Testing

### DevOps for QA
- [ ] Docker Compose для тестового стеку
- [ ] Kubernetes basics
- [ ] Cloud testing (BrowserStack, Sauce Labs)
- [ ] Monitoring та Alerting

### Leadership
- [ ] Test Strategy Design
- [ ] Team Mentoring
- [ ] Test Automation Interview — [[QA Automation Interview Questions]]
- [ ] Process Improvement

---

## Learning Resources

### Official Documentation
- [Cypress Docs](https://docs.cypress.io)
- [Playwright Docs](https://playwright.dev)
- [Artillery Docs](https://www.artillery.io/docs)
- [Cucumber Docs](https://cucumber.io/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

### Practice Sites
- `https://reqres.in/` — REST API для тренування
- `https://httpbin.org/` — HTTP тестування
- `https://the-internet.herokuapp.com/` — UI елементи для тренування
- `https://jsonplaceholder.typicode.com/` — Fake REST API
- `https://www.saucedemo.com/` — E2E тренування

### Books
- "Agile Testing" — Lisa Crispin
- "The Art of Unit Testing" — Roy Osherove
- "Continuous Delivery" — Jez Humble

---

## Skills Matrix

| Навичка | Junior | Middle | Senior |
|---------|--------|--------|--------|
| Ручне тестування | ✅ | ✅ | ✅ |
| Cypress / Playwright | Basics | Advanced | Expert |
| API Testing | Basic | Advanced | Expert |
| Page Object Pattern | ✅ | ✅ | ✅ |
| BDD/Cucumber | Aware | ✅ | ✅ |
| CI/CD | Aware | ✅ | Expert |
| Performance Testing | Aware | Basic | Advanced |
| Security Testing | Aware | Basic | Advanced |
| Docker | Aware | Basic | Advanced |
| JavaScript | Basic | Intermediate | Advanced |
| Git | Basic | ✅ | Expert |
| Test Architecture | — | Basic | Expert |

---

## Dependency Map між технологіями

```
JavaScript/TypeScript
        ↓
    ┌───┴────┐
Cypress  Playwright
    ↓        ↓
Page Object Pattern
        ↓
API Testing (cy.request / Playwright API)
        ↓
BDD/Cucumber (optional)
        ↓
CI/CD (GitHub Actions)
        ↓
Docker (DevOps for QA)
        ↓
Performance Testing (Artillery/k6)
        ↓
Security Testing (OWASP ZAP, Snyk)
        ↓
Reporting & Monitoring
```

---

## Related Notes

- [[Automation Testing Index]] — головна сторінка
- [[QA Automation MOC]] — карта знань
- [[QA Automation Interview Questions]] — підготовка до співбесіди
