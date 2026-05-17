# QA Overview

> Основи забезпечення якості програмного забезпечення: ролі, принципи, процеси.

#qa #testing #fundamentals

---

## Overview

**QA (Quality Assurance)** — це систематичний процес забезпечення якості програмного продукту. QA охоплює не лише тестування, але й увесь процес розробки: від вимог до деплою.

**Різниця між QA та QC:**

| QA (Quality Assurance) | QC (Quality Control) |
|------------------------|----------------------|
| Проактивний підхід | Реактивний підхід |
| Покращення процесів | Пошук дефектів у продукті |
| Планування, аудит | Тестування, перевірки |
| «Робимо правильно з першого разу» | «Знаходимо проблеми після створення» |

---

## Testing Principles (7 Принципів тестування)

1. **Тестування показує наявність дефектів**, але не їх відсутність
2. **Вичерпне тестування неможливе** — завжди є компроміс
3. **Раннє тестування** — чим раніше, тим дешевше виправлення
4. **Кластеризація дефектів** — більшість помилок у 20% модулів
5. **Парадокс пестициду** — тести треба оновлювати, бо система «звикає»
6. **Тестування залежить від контексту** — різні підходи для різних систем
7. **Помилка відсутності помилок** — система може відповідати вимогам, але бути марною

---

## Roles in QA

| Роль | Обов'язки |
|------|-----------|
| **QA Engineer** | Ручне тестування, test cases, bug reports |
| **AQA / SDET** | Автоматизація тестів, frameworks |
| **QA Lead** | Планування, координація, процеси |
| **Test Manager** | Стратегія якості, ресурси, звітність |
| **DevOps/QA** | CI/CD пайплайни, infrastructure |

---

## Testing Process

```
Requirements Analysis
        ↓
Test Planning (Test Plan, Test Strategy)
        ↓
Test Design (Test Cases, Test Scenarios)
        ↓
Test Execution (Manual / Automated)
        ↓
Defect Reporting (Bug Report)
        ↓
Regression Testing
        ↓
Test Closure (Report, Lessons Learned)
```

---

## Bug Report Structure

```
Title: [Module] Short description of the bug

Priority: Critical / High / Medium / Low
Severity: Critical / Major / Minor / Trivial

Environment: OS, Browser, Version
Preconditions: User must be logged in

Steps to Reproduce:
1. Go to /login
2. Enter invalid email
3. Click Submit

Expected Result: Error message "Invalid email"
Actual Result: 500 Internal Server Error

Attachments: screenshot.png, console.log
```

---

## Test Documentation

| Документ | Призначення |
|----------|------------|
| **Test Plan** | Стратегія та обсяг тестування |
| **Test Case** | Кроки + очікуваний результат |
| **Test Scenario** | Бізнес-сценарій (без деталей) |
| **Test Suite** | Набір test cases |
| **Bug Report** | Опис знайденого дефекту |
| **Test Report** | Підсумки після тестового циклу |

---

## Related Notes

- [[Testing Pyramid]] — стратегія покриття тестами
- [[Test Types]] — класифікація видів тестування
- [[Manual vs Automation]] — коли автоматизувати
- [[QA Automation MOC]] — шлях до автоматизації
- [[Automation Testing Index]] — головна сторінка
