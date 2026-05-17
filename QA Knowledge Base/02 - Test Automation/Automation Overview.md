# Automation Overview

> Стратегія та підходи до автоматизованого тестування.

#automation #testing #qa #strategy

---

## Overview

**Test Automation** — це використання програмного забезпечення для виконання тестів і порівняння отриманих результатів з очікуваними. Автоматизація звільняє QA від рутинної роботи та дозволяє запускати тести частіше та надійніше.

---

## Automation Architecture

```
Test Framework
      ↓
┌─────────────────────────────────────┐
│  Test Layer (test files)            │
│  Page Object Layer (page classes)   │
│  Service Layer (API helpers)        │
│  Data Layer (fixtures, factories)   │
│  Utils (helpers, custom commands)   │
└─────────────────────────────────────┘
      ↓
Browser / API / Mobile Driver
      ↓
Application Under Test (AUT)
```

---

## Framework Types

| Тип | Опис | Приклади |
|-----|------|---------|
| **Linear / Record-Playback** | Запис і відтворення дій | Selenium IDE |
| **Modular** | Тести як модульні блоки | Звичайний Selenium |
| **Data-Driven** | Тести + зовнішні дані | Excel, CSV, JSON |
| **Keyword-Driven** | Дії описуються ключовими словами | Robot Framework |
| **Behavior-Driven (BDD)** | Тести на мові бізнесу | [[BDD and Cucumber]] |
| **Hybrid** | Комбінація підходів | Більшість сучасних проєктів |

---

## Technology Stacks

### JavaScript / TypeScript
- [[Cypress Guide]] — E2E + API
- [[Playwright Guide]] — E2E + Cross-browser
- Jest / Mocha — Unit
- [[BDD and Cucumber]] — BDD

### Python
- [[Pytest Guide]] — Universal
- Selenium + Python
- Playwright Python

### Java
- [[Selenium Guide]] + JUnit / TestNG
- Playwright Java
- REST Assured — API

---

## Setup Checklist

```
□ Вибрати фреймворк (Cypress / Playwright / Selenium)
□ Вибрати мову програмування (JS / Python / Java)
□ Налаштувати структуру проєкту
□ Впровадити Page Object Pattern
□ Налаштувати конфігурацію (base URL, timeouts)
□ Підключити CI/CD (GitHub Actions / Jenkins)
□ Налаштувати репортинг (Allure, HTML Report)
□ Додати fixtures / test data management
□ Впровадити code review процес для тестів
```

---

## Project Structure Example

```
automation-project/
├── .github/
│   └── workflows/
│       └── tests.yml         ← CI/CD pipeline
├── cypress/
│   ├── e2e/                  ← тест-файли
│   ├── pages/                ← Page Objects
│   ├── fixtures/             ← тестові дані
│   └── support/
│       ├── commands.js       ← custom commands
│       └── e2e.js
├── cypress.config.js         ← конфігурація
├── package.json
└── .env                      ← secrets (не в Git!)
```

---

## Best Practices

1. **Незалежні тести** — кожен тест повинен запускатися окремо
2. **DRY принцип** — використовуй [[Page Object Pattern]] та custom commands
3. **Стабільні селектори** — `data-cy`, `data-testid`, `aria-label`
4. **Немає hardcoded даних** — використовуй fixtures та env variables
5. **Чіткі назви** — `it('should show error on invalid email')`
6. **Атомарні тести** — один тест = одна перевірка
7. **CI/CD інтеграція** — тести запускаються автоматично

---

## Related Notes

- [[Testing Pyramid]] — де вписуються автотести
- [[Manual vs Automation]] — коли автоматизувати
- [[Page Object Pattern]] — архітектура тестів
- [[Cypress Guide]] — E2E фреймворк
- [[CI-CD Overview]] — автоматичний запуск
- [[Automation Testing Index]] — головна сторінка
