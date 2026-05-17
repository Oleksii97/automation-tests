# Tools Overview

> Повний огляд інструментів для QA Automation: від тест-фреймворків до CI/CD.

#qa #automation #tools

---

## Overview

Екосистема QA Automation інструментів дуже велика. Цей огляд допомагає орієнтуватися та вибирати правильні інструменти для конкретних задач.

---

## By Category

### E2E / UI Testing

| Інструмент | Мова | Особливості | Коли обрати |
|-----------|------|------------|------------|
| **[[Cypress Guide]]** | JS/TS | Auto-wait, Chrome/Firefox/Edge | JS проєкт, простий старт |
| **[[Playwright Guide]]** | JS/TS/Python/Java | Safari, cross-browser, parallel | Cross-browser, Safari |
| **[[Selenium Guide]]** | Будь-яка | W3C standard, всі браузери | Легасі, Java/Python |
| **WebdriverIO** | JS/TS | Selenium + Cucumber, multi | Гнучка конфігурація |
| **TestCafe** | JS/TS | Без WebDriver | Проста альтернатива |

### API Testing

| Інструмент | Тип | Коли обрати |
|-----------|-----|------------|
| **Postman** | Manual + Runner | Дослідження API, документація |
| **Insomnia** | Manual | Альтернатива Postman |
| **Cypress `cy.request()`** | Automated | API + E2E разом |
| **Playwright APIRequest** | Automated | API + E2E разом |
| **[[Pytest Guide]] + requests** | Automated | Python проєкт |
| **REST Assured** | Automated | Java проєкт |
| **K6** | Performance + API | Навантаження + functional |
| **Supertest** | Automated | Node.js backend тести |

### Performance / Load Testing

| Інструмент | Мова | Протоколи |
|-----------|------|----------|
| **[[Artillery Guide]]** | YAML + JS | HTTP, WS, Socket.io |
| **k6** | JS | HTTP, WS, gRPC |
| **JMeter** | GUI + XML | HTTP, FTP, JDBC |
| **Gatling** | Scala/Kotlin | HTTP, WS |
| **Locust** | Python | HTTP |
| **wrk** | CLI | HTTP |

### Security Testing

| Інструмент | Тип | Опис |
|-----------|-----|------|
| **OWASP ZAP** | DAST | Сканер вразливостей |
| **Burp Suite** | DAST | Перехоплення HTTP |
| **Snyk** | SCA | Аналіз залежностей |
| **SonarQube** | SAST | Статичний аналіз |
| **Semgrep** | SAST | Патерни вразливостей |
| **Trivy** | Container | Docker image scanning |
| **GitLeaks** | Secret Detection | Секрети у коді |

### Mobile Testing

| Інструмент | Платформа | Тип |
|-----------|-----------|-----|
| **Appium** | iOS + Android | E2E |
| **Detox** | iOS + Android (RN) | E2E |
| **XCUITest** | iOS | Native |
| **Espresso** | Android | Native |
| **BrowserStack** | Cloud | Cross-device |

### BDD Frameworks

| Інструмент | Мова | Опис |
|-----------|------|------|
| **[[BDD and Cucumber]]** | JS/Java/Python/Ruby | Gherkin-based |
| **Robot Framework** | Python | Keyword-driven |
| **SpecFlow** | C# | .NET Cucumber |
| **Behave** | Python | Python Cucumber |

### Test Runners / Unit Testing

| Інструмент | Мова | Опис |
|-----------|------|------|
| **Jest** | JS | Найпопулярніший для JS |
| **Vitest** | JS | Vite-based, швидкий |
| **Mocha + Chai** | JS | Гнучкий |
| **[[Pytest Guide]]** | Python | Найкращий для Python |
| **JUnit 5** | Java | Стандарт Java |
| **TestNG** | Java | Більше фіч |

### CI/CD Tools

| Інструмент | Тип | Опис |
|-----------|-----|------|
| **[[GitHub Actions Guide]]** | Cloud | Вбудовано в GitHub |
| **GitLab CI** | Cloud | Вбудовано в GitLab |
| **Jenkins** | Self-hosted | Найгнучкіший |
| **CircleCI** | Cloud | Docker-native |
| **TeamCity** | Self-hosted | JetBrains |

### Reporting

| Інструмент | Тип | Опис |
|-----------|-----|------|
| **Allure Report** | HTML | Найкращий HTML звіт |
| **Mochawesome** | HTML | Cypress звіт |
| **Playwright Reporter** | HTML | Built-in |
| **TestRail** | TMS | Test Management System |
| **Jira** | Bug Tracking | Задачі та баги |

### Version Control & Collaboration

| Інструмент | Опис |
|-----------|------|
| **Git** | Контроль версій |
| **GitHub** | Hosting + Actions |
| **GitLab** | Hosting + CI/CD |
| **Bitbucket** | Hosting + Pipelines |

### Dev Tools

| Інструмент | Опис |
|-----------|------|
| **VSCode** | Найпопулярніший редактор |
| **IntelliJ IDEA** | Java + Kotlin |
| **PyCharm** | Python |
| **Postman** | API testing |
| **Chrome DevTools** | Debug UI тести |
| **Selector Playground** | Cypress вбудований |

---

## Quick Selection Guide

```
Хочу почати E2E тестування (JS) → Cypress
Хочу тестувати Safari → Playwright
Хочу Python → Playwright Python або Pytest + Selenium
Хочу Java → Selenium + TestNG або Playwright Java
Хочу BDD → Cucumber + Cypress/Playwright
Хочу Load Testing → Artillery (простий) або k6 (потужний)
Хочу API Testing → Postman (manual) + Cypress/Pytest (automated)
Хочу Security → OWASP ZAP + Snyk + npm audit
Хочу CI/CD → GitHub Actions (якщо GitHub) або Jenkins
Хочу Reports → Allure Report
```

---

## Tool Versions (2026)

| Інструмент | Стабільна версія |
|-----------|-----------------|
| Cypress | 13.x |
| Playwright | 1.44.x |
| Selenium | 4.x |
| Artillery | 2.x |
| k6 | 0.50.x |
| Node.js | 20 LTS |
| Python | 3.12.x |

---

## Related Notes

- [[Framework Comparison]] — детальне порівняння
- [[Cypress Guide]] — Cypress
- [[Playwright Guide]] — Playwright
- [[Artillery Guide]] — Artillery
- [[CI-CD Overview]] — CI/CD tools
- [[Automation Testing Index]] — головна сторінка
