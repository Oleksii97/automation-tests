# Automation Testing Index

> **Master Map of Content** — головна навігаційна сторінка бази знань з автоматизованого тестування.

#qa #automation #testing #moc

---

## Core Areas

| Розділ | Опис | Файл |
|--------|------|------|
| QA Fundamentals | Основи тестування, піраміда тестів | [[QA Overview]] |
| Test Automation | Автоматизація: підходи та принципи | [[Automation Overview]] |
| API Testing | REST, HTTP, cy.request | [[API Testing Overview]] |
| UI Testing | Браузерне тестування, селектори | [[UI Testing Overview]] |
| Mobile Testing | Appium, мобільне тестування | [[Mobile Testing Overview]] |
| Performance Testing | Навантажувальне тестування | [[Performance Testing Overview]] |
| Security Testing | OWASP, пентест, безпека | [[Security Testing Overview]] |
| CI/CD | Пайплайни, автозапуск тестів | [[CI-CD Overview]] |

---

## Frameworks

| Інструмент | Тип | Файл |
|-----------|-----|------|
| Cypress | E2E / Component / API | [[Cypress Guide]] |
| Playwright | E2E / Cross-browser | [[Playwright Guide]] |
| Selenium | UI / WebDriver | [[Selenium Guide]] |
| Pytest | Unit / API / Backend | [[Pytest Guide]] |
| Artillery | Performance / Load | [[Artillery Guide]] |
| Cucumber | BDD / Gherkin | [[BDD and Cucumber]] |

---

## Design Patterns & Methodology

- [[Page Object Pattern]] — інкапсуляція UI-логіки в класи
- [[BDD and Cucumber]] — Behavior Driven Development
- [[Gherkin Syntax]] — мова опису сценаріїв
- [[Test Types]] — класифікація видів тестування

---

## Tools & Infrastructure

- [[Tools Overview]] — огляд усіх інструментів
- [[Framework Comparison]] — порівняльна таблиця фреймворків
- [[DevOps for QA]] — Docker, Kubernetes для тестування
- [[GitHub Actions Guide]] — CI/CD з GitHub Actions

---

## Cheatsheets

- [[Cypress Cheatsheet]] — команди, селектори, assertions
- [[Artillery Cheatsheet]] — YAML структура, метрики, типи тестів
- [[Cucumber Cheatsheet]] — Gherkin, step definitions, теги
- [[CI-CD Cheatsheet]] — pipeline кроки, інструменти, типові workflow

---

## Other MOCs

- [[QA Automation MOC]] — повна карта автоматизації
- [[Security Testing MOC]] — безпека та пентестинг

---

## Interview & Career

- [[QA Automation Interview Questions]] — топ питань для співбесід

---

## Roadmap

- [[Learning Roadmap]] — шлях розвитку QA Automation Engineer

---

## Dependency Map

```
Manual Testing → Automation Testing
     ↓                  ↓
  Test Design     Test Frameworks (Cypress, Playwright, Selenium)
                        ↓
                   API Testing ←→ UI Testing ←→ Performance Testing
                        ↓
                    CI/CD Pipelines
                        ↓
                  Reporting & Monitoring
                        ↓
                    DevOps (Docker, K8s)
```

---

*Остання оновлення: 2026-05-16*
