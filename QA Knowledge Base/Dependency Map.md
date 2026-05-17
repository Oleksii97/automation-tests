# Dependency Map

> Карта залежностей між технологіями та інструментами QA Automation.

#qa #automation #map #dependencies

---

## Technology Dependency Graph

```
                    ┌─────────────────┐
                    │  QA Fundamentals │
                    │  [[QA Overview]] │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ [[Test Types]]  │
                    │  Testing Pyramid│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐  ┌───▼────┐  ┌─────▼──────┐
     │ Manual Testing│  │ Unit   │  │Integration │
     └────────┬──────┘  │ Tests  │  │   Tests    │
              │          └───┬────┘  └─────┬──────┘
              │              │             │
              ▼              └──────┬──────┘
     [[Manual vs Automation]]       │
              │                     │
              ▼                     ▼
     [[Automation Overview]]    [[Pytest Guide]]
              │
    ┌─────────┼──────────┐
    │         │          │
    ▼         ▼          ▼
[[Cypress]]  [[Playwright]] [[Selenium Guide]]
    │         │          │
    └─────────┼──────────┘
              │
    ┌─────────┼──────────────┐
    │         │              │
    ▼         ▼              ▼
[[API Testing]] [[UI Testing]] [[Page Object Pattern]]
    │              │
    │         ┌────┴──────────┐
    │         │               │
    │         ▼               ▼
    │  [[BDD and Cucumber]] [[Selectors Guide]]
    │         │
    │         ▼
    │  [[Gherkin Syntax]]
    │
    └────────────────────────────────────┐
                                         │
                              ┌──────────▼──────────┐
                              │   [[CI-CD Overview]] │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                     │
                    ▼                    ▼                     ▼
           [[GitHub Actions]]    [[DevOps for QA]]   [[Artillery Guide]]
                    │                    │                     │
                    ▼                    ▼                     ▼
           [[Test Reporting]]    Docker/Kubernetes   [[Performance Testing]]
                    │
                    ▼
           [[Security Testing Overview]]
```

---

## Tool Categories & Links

### Tier 1: Core (обов'язкові)

| Категорія | Інструмент | Файл |
|-----------|-----------|------|
| E2E Testing | Cypress | [[Cypress Guide]] |
| Version Control | Git + GitHub | — |
| Task Runner | npm / pip | — |
| IDE | VSCode | — |

### Tier 2: Professional (для роботи)

| Категорія | Інструмент | Файл |
|-----------|-----------|------|
| Cross-Browser | Playwright | [[Playwright Guide]] |
| Performance | Artillery | [[Artillery Guide]] |
| CI/CD | GitHub Actions | [[GitHub Actions Guide]] |
| API Design | Postman | [[Tools Overview]] |
| BDD | Cucumber | [[BDD and Cucumber]] |
| Python Testing | Pytest | [[Pytest Guide]] |

### Tier 3: Advanced (для Senior)

| Категорія | Інструмент | Файл |
|-----------|-----------|------|
| Legacy Web | Selenium | [[Selenium Guide]] |
| Security | OWASP ZAP, Snyk | [[Security Testing Overview]] |
| Container | Docker | [[DevOps for QA]] |
| Reporting | Allure | [[Test Reporting Overview]] |
| Mobile | Appium | [[Mobile Testing Overview]] |

---

## Learning Dependencies

```
Необхідне знання А перед Б:

JavaScript Basics
    → Cypress
        → Page Object Pattern
            → BDD/Cucumber
    → Playwright
    → API Testing

HTTP Protocol
    → API Testing
        → Security Testing (API Security)
    → Performance Testing (Artillery)

Git Basics
    → GitHub Actions / CI/CD
        → DevOps for QA (Docker)

QA Fundamentals
    → All testing types
```

---

## Integration Map

```
Cypress ────────────────────────── GitHub Actions
   │                                       │
   ├── cy.request() ──────────── REST API ─┤
   │                                       │
   ├── cy.intercept() ─────── Mock Server  │
   │                                       │
   └── Page Objects ──── BDD/Cucumber ─────┤
                                           │
Artillery ─────────────────────────────────┤
   │                                       │
   └── YAML config ─────── environments    │
                                           │
Docker ─────────────────────────────────────
   │
   └── Selenium Grid ── Parallel E2E
```

---

## Technology Evolution Timeline

```
2004: Selenium 1.0
2006: Selenium WebDriver (Selenium 2)
2011: WebDriver W3C Draft
2013: Karma, Mocha появились
2016: Jest 1.0
2017: Cypress 1.0
2018: Playwright (predecessor: Puppeteer)
2020: Playwright 1.0 (Microsoft)
2021: Cypress Component Testing
2022: Playwright mature, Safari support
2023: Cypress 13.x, Playwright 1.40+
2024: AI-assisted test generation появляється
2025: Playwright домінує cross-browser
2026: AI/LLM інтеграція в тести
```

---

## Related Notes

- [[Automation Testing Index]] — головна MOC
- [[QA Automation MOC]] — карта автоматизації
- [[Security Testing MOC]] — security карта
- [[Learning Roadmap]] — шлях розвитку
- [[Framework Comparison]] — порівняння фреймворків
- [[Tools Overview]] — огляд інструментів
