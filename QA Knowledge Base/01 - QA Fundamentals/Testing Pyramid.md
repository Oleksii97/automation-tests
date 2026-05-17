# Testing Pyramid

> Стратегічна модель розподілу тестів: від дрібних юніт-тестів до великих E2E.

#qa #testing #fundamentals #strategy

---

## Overview

**Піраміда тестування** (Testing Pyramid) — модель, що описує оптимальне співвідношення різних типів тестів. Запропонована Майком Коном (Mike Cohn).

```
         /\
        /  \
       / E2E\        ← Мало, повільні, дорогі
      /------\
     /        \
    /Integration\    ← Середньо, перевіряють взаємодію
   /------------\
  /              \
 /   Unit Tests   \  ← Багато, швидкі, дешеві
/------------------\
```

---

## Pyramid Levels

### Level 1: Unit Tests (Основа)

- **Що перевіряють**: окремі функції, методи, класи
- **Кількість**: 60-70% від усіх тестів
- **Швидкість**: мілісекунди
- **Інструменти**: Jest, Mocha, JUnit, Pytest
- **Хто пише**: розробники

```javascript
// Приклад Unit Test (Jest)
function add(a, b) { return a + b; }

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});
```

### Level 2: Integration Tests (Середина)

- **Що перевіряють**: взаємодію між модулями, API-ендпоінти, БД
- **Кількість**: 20-30% від усіх тестів
- **Швидкість**: секунди
- **Інструменти**: [[Pytest]], Supertest, REST Assured

```python
# Приклад Integration Test (Pytest)
def test_user_creation_api(client):
    response = client.post('/api/users', json={'name': 'Alice'})
    assert response.status_code == 201
    assert response.json()['name'] == 'Alice'
```

### Level 3: E2E Tests (Верхівка)

- **Що перевіряють**: повний шлях користувача через UI
- **Кількість**: 5-10% від усіх тестів
- **Швидкість**: хвилини
- **Інструменти**: [[Cypress Guide]], [[Playwright Guide]], [[Selenium Guide]]

```javascript
// Приклад E2E Test (Cypress)
it('user can login and see dashboard', () => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').type('user@test.com');
  cy.get('[data-cy="password"]').type('password123');
  cy.get('[data-cy="submit"]').click();
  cy.url().should('include', '/dashboard');
});
```

---

## Anti-Patterns

### Ice Cream Cone (Антипіраміда)

```
\                  /
 \   Unit Tests   /   ← Мало
  \--------------/
   \            /
    \ Integration/   ← Мало
     \----------/
      \        /
       \  E2E  /      ← ДУЖЕ БАГАТО ← Проблема!
        \------/
```

**Проблеми**: повільно, дорого, нестабільно (flaky tests).

### Trophy (Трофей — сучасний підхід)

```
       /\
      /E2E\           ← Мало
     /------\
    /  Static \       ← TypeScript, ESLint
   /  Analysis \
  /--------------\
 / Integration    \   ← Найбільше
/------------------\
      Unit           ← Менше, ніж інтеграційних
```

Підхід від Kent C. Dodds — більше integration тестів, менше unit.

---

## Best Practices

- Тримай E2E тести для критичних user journeys
- Використовуй API тести замість E2E там, де можливо
- Юніт тести мають бути незалежними (no side effects)
- Запускай тести паралельно (CI/CD)
- Не дублюй покриття між рівнями

---

## Related Notes

- [[Test Types]] — детальна класифікація тестів
- [[Manual vs Automation]] — коли автоматизувати
- [[Automation Overview]] — стратегія автоматизації
- [[QA Overview]] — основи QA
- [[Automation Testing Index]] — головна сторінка
