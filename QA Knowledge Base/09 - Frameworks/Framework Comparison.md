# Framework Comparison

> Порівняльна таблиця фреймворків для автоматизованого тестування.

#qa #automation #testing #frameworks #comparison

---

## Overview

Вибір фреймворку залежить від: мови програмування команди, типу додатку, вимог до браузерів, досвіду команди.

---

## E2E Testing Frameworks

| Критерій | [[Cypress Guide]] | [[Playwright Guide]] | [[Selenium Guide]] |
|----------|---------|-----------|---------|
| **Мови** | JS/TS | JS/TS/Python/Java/C# | Всі мови |
| **Браузери** | Chrome, Firefox, Edge | Chrome, Firefox, Safari, Edge | Всі браузери |
| **Safari** | ❌ (WebKit в preview) | ✅ | ✅ |
| **Auto-waiting** | ✅ | ✅ | ❌ (треба вручну) |
| **Швидкість** | Швидко | Дуже швидко | Повільно |
| **Налаштування** | Дуже просто | Просто | Складно |
| **API Testing** | ✅ `cy.request()` | ✅ `request` context | ❌ |
| **Mobile** | ❌ | ✅ Emulation | ❌ |
| **Multiple Tabs** | Складно | ✅ | ✅ |
| **iframe** | ✅ | ✅ | ✅ |
| **Visual Testing** | Plugins | ✅ Built-in | Плагіни |
| **Spying/Mocking** | ✅ `cy.intercept()` | ✅ `page.route()` | ❌ |
| **Parallel** | Cypress Cloud (платно) | ✅ Built-in | Selenium Grid |
| **Community** | Велика | Зростає | Дуже велика |
| **License** | MIT | Apache 2.0 | Apache 2.0 |
| **Вартість** | Безкоштовно (Cloud платний) | Безкоштовно | Безкоштовно |

---

## Performance Testing Tools

| Критерій | [[Artillery Guide]] | k6 | JMeter | Gatling |
|----------|---------|-----|--------|---------|
| **Мова конфігурації** | YAML + JS | JavaScript | XML/GUI | Scala/Kotlin |
| **Навчальна крива** | Низька | Низька | Висока | Висока |
| **Швидкість** | Середня | Висока | Середня | Дуже висока |
| **CI/CD інтеграція** | ✅ Легко | ✅ Легко | Середньо | ✅ Легко |
| **Протоколи** | HTTP, WS | HTTP, WS, gRPC | HTTP, WS | HTTP, WS |
| **Звіти** | HTML | HTML, JSON, Prometheus | HTML, GUI | HTML |
| **Хмарне виконання** | Artillery Cloud | k6 Cloud | BlazeMeter | Gatling Cloud |
| **Ціна** | Безкоштовно | Безкоштовно | Безкоштовно | Безкоштовно |

---

## API Testing Tools

| Інструмент | Тип | Мова | Найкраще для |
|-----------|-----|------|-------------|
| Cypress `cy.request()` | Automated | JS/TS | API + E2E разом |
| Playwright API context | Automated | JS/TS/Python | API + E2E разом |
| [[Pytest Guide]] + requests | Automated | Python | Python проєкти |
| REST Assured | Automated | Java | Java проєкти |
| Postman | Manual + Automated | JS (collection runner) | Exploratory + Документація |
| Insomnia | Manual | — | Exploratory |
| supertest | Automated | JS | Node.js backend |

---

## Unit Testing Frameworks

| Framework | Мова | Особливості |
|-----------|------|------------|
| **Jest** | JavaScript | Найпопулярніший для JS |
| **Vitest** | JavaScript | Vite-based, швидший за Jest |
| **Mocha** | JavaScript | Гнучкий, needs chai |
| **[[Pytest Guide]]** | Python | Найкращий для Python |
| **JUnit 5** | Java | Стандарт для Java |
| **TestNG** | Java | Більше фіч ніж JUnit |
| **NUnit** | C# | Стандарт для .NET |
| **RSpec** | Ruby | BDD стиль |

---

## BDD Frameworks

| Framework | Мова | Базується на |
|-----------|------|-------------|
| **[[BDD and Cucumber]]** | JS/Java/Python/Ruby | Gherkin |
| **SpecFlow** | C# | Gherkin |
| **Behave** | Python | Gherkin |
| **JBehave** | Java | Gherkin |
| **Robot Framework** | Python | Keyword-driven |

---

## Decision Guide

### Вибір E2E фреймворку

```
Мова команди: Python? → Playwright (Python)
Мова команди: Java? → Selenium + TestNG
Мова команди: JavaScript/TypeScript?
  └─ Потрібен Safari? → Playwright
  └─ Не потрібен Safari? → Cypress (простіший) або Playwright (потужніший)

Новий проєкт, JS-стек, не потрібен Safari → Cypress
Новий проєкт, JS-стек, потрібен Safari → Playwright
Legacy Java проєкт → Selenium + TestNG
Python проєкт → Playwright Python або Selenium + Pytest
```

### Вибір Performance Testing

```
Простий старт, YAML-конфіг → Artillery
Developer-friendly, JS знайомий → k6
Enterprise, складні сценарії → Gatling
Graphical interface, GUI → JMeter
Python команда → Locust
```

---

## Pros & Cons Summary

### Cypress

✅ **Плюси:**
- Найпростіший старт
- Відмінний DX (Developer Experience)
- Time Travel, видео, screenshots вбудовані
- Відмінна документація

❌ **Мінуси:**
- Тільки JS/TS
- Немає Safari підтримки
- Паралельний запуск потребує Cypress Cloud (платно)
- Один браузер за раз

### Playwright

✅ **Плюси:**
- Підтримка Safari/WebKit
- Кілька мов програмування
- Паралельний запуск вбудований
- Кілька вкладок, сторінок
- Mobile emulation

❌ **Мінуси:**
- Складніший API ніж Cypress
- Більше налаштування
- Відносно новий (менша спільнота)

### Selenium

✅ **Плюси:**
- Підтримка всіх браузерів
- Підтримка всіх мов програмування
- Selenium Grid для паралельного запуску
- Найбільша спільнота

❌ **Мінуси:**
- Немає auto-waiting
- Потребує більше коду
- Повільніший за сучасні альтернативи
- Складніше налаштування

---

## Migration Paths

```
Selenium → Playwright: подібний API, простіший
Cypress → Playwright: схожа концепція, більше можливостей
Manual → Cypress: найпростіший вхід в автоматизацію
Manual → Playwright: більше можливостей, складніший старт
```

---

## Related Notes

- [[Cypress Guide]] — детальний Cypress гайд
- [[Playwright Guide]] — детальний Playwright гайд
- [[Selenium Guide]] — детальний Selenium гайд
- [[Artillery Guide]] — Artillery performance testing
- [[Pytest Guide]] — Python testing
- [[Automation Overview]] — загальна стратегія
- [[Automation Testing Index]] — головна сторінка
