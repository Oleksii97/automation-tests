# Test Types

> Повна класифікація видів тестування: від юніт до security.

#qa #testing #fundamentals

---

## Overview

Тестування класифікується за кількома вимірами: рівнем, типом, підходом. Знання класифікації допомагає вибрати правильний вид тесту для задачі.

---

## By Testing Level

| Рівень | Що перевіряє | Інструменти |
|--------|-------------|-------------|
| **Unit** | Окремі функції/методи | Jest, Mocha, Pytest, JUnit |
| **Integration** | Взаємодія між модулями | Supertest, REST Assured, [[Pytest Guide]] |
| **System** | Вся система як єдине ціле | [[Cypress Guide]], [[Playwright Guide]] |
| **Acceptance (UAT)** | Відповідність бізнес-вимогам | [[BDD and Cucumber]], ручне тестування |

---

## By Testing Type

### Functional Testing

| Тип | Опис |
|-----|------|
| **Smoke Testing** | Базова перевірка "чи запускається?" |
| **Sanity Testing** | Швидка перевірка після фікса |
| **Regression Testing** | Перевірка, що старе не зламалось |
| **Exploratory Testing** | Дослідження без скриптів |
| **Boundary Testing** | Перевірка граничних значень |
| **Equivalence Partitioning** | Групи еквівалентних значень |

### Non-Functional Testing

| Тип | Опис | Інструменти |
|-----|------|-------------|
| **Performance** | Швидкість, стабільність | [[Artillery Guide]], JMeter, k6 |
| **Load** | Поведінка під навантаженням | [[Artillery Guide]] |
| **Stress** | Поведінка за межею нормального | [[Artillery Guide]] |
| **Security** | Вразливості та загрози | [[Security Testing MOC]] |
| **Usability** | Зручність для користувача | Ручне / user research |
| **Accessibility** | Доступність (a11y) | axe, Lighthouse |
| **Compatibility** | Різні браузери/ОС | [[Playwright Guide]], BrowserStack |

---

## By Testing Approach

| Підхід | Опис |
|--------|------|
| **Black Box** | Тестуємо без знання внутрішньої реалізації |
| **White Box** | Тестуємо з доступом до коду (unit tests) |
| **Grey Box** | Комбінація: знаємо архітектуру, не знаємо деталей |

---

## Cypress Test Types

Cypress підтримує 4 типи тестів:

```javascript
// End-to-End: повний шлях користувача
describe('E2E: User Journey', () => {
  it('user can register and login', () => {
    cy.visit('/register');
    // ...
  });
});

// Component: окремий UI компонент
describe('Component: LoginForm', () => {
  it('shows error on invalid email', () => {
    cy.mount(<LoginForm />);
    // ...
  });
});

// Integration: взаємодія модулів
describe('Integration: Cart API', () => {
  it('adds item to cart via API', () => {
    cy.request('POST', '/api/cart', { itemId: 1 });
    // ...
  });
});

// API: HTTP-запити без UI
describe('API: Auth endpoints', () => {
  it('returns 401 without token', () => {
    cy.request({ url: '/api/me', failOnStatusCode: false })
      .its('status').should('eq', 401);
  });
});
```

---

## Test Priorities

| Пріоритет | Що запускати |
|-----------|-------------|
| **Smoke** | 10-20 тестів, критичний шлях, до 5 хв |
| **Sanity** | 50-100 тестів, основні модулі, до 15 хв |
| **Regression** | Всі тести, раз на день/ніч |
| **Full Suite** | Раз на тиждень / перед релізом |

---

## Related Notes

- [[Testing Pyramid]] — співвідношення типів тестів
- [[Manual vs Automation]] — що автоматизувати
- [[QA Overview]] — основи QA
- [[API Testing Overview]] — API тести
- [[Performance Testing Overview]] — навантажувальне тестування
- [[Security Testing MOC]] — тестування безпеки
