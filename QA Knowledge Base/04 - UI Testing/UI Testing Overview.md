# UI Testing Overview

> Автоматизоване тестування інтерфейсу: браузери, селектори, взаємодія з елементами.

#qa #automation #testing #ui #selenium #playwright #cypress

---

## Overview

**UI Testing** — перевірка того, що користувач бачить та з чим взаємодіє. UI тести імітують дії реального користувача: кліки, введення тексту, навігацію.

---

## UI Testing Tools

| Інструмент | Мова | Браузери | Особливості |
|-----------|------|----------|------------|
| [[Cypress Guide]] | JS/TS | Chrome, Firefox, Edge | Вбудовано в браузер, Auto-wait |
| [[Playwright Guide]] | JS/TS/Python/Java | Chrome, Firefox, Safari, Edge | Кросбраузерний, найшвидший |
| [[Selenium Guide]] | Будь-яка | Всі браузери | WebDriver стандарт, найпопулярніший |

---

## Selectors Guide

### Selector Types (від найкращих до найгірших)

| Пріоритет | Тип | Приклад | Стабільність |
|-----------|-----|---------|-------------|
| ⭐⭐⭐⭐⭐ | `data-cy` / `data-testid` | `[data-cy="submit"]` | Максимальна |
| ⭐⭐⭐⭐ | `aria-label` | `[aria-label="Close"]` | Висока |
| ⭐⭐⭐ | `id` | `#user_email` | Висока (якщо не auto-generated) |
| ⭐⭐ | `name` | `[name="email"]` | Середня |
| ⭐ | `class` | `.btn-primary` | Низька (часто змінюється) |
| ❌ | CSS path | `div > div > span.x1q` | Дуже низька |
| ❌ | XPath довгий | `//div[@class='x']/span[2]` | Дуже низька |

### Cypress Selectors

```javascript
// Найкращий варіант - data attributes
cy.get('[data-cy="submit-button"]').click();
cy.get('[data-testid="email-input"]').type('user@test.com');

// За ID
cy.get('#user_email').type('user@test.com');

// За aria-label (доступність)
cy.get('[aria-label="Close dialog"]').click();

// За текстом
cy.contains('Submit').click();
cy.contains('button', 'Sign In').click();  // тег + текст

// За атрибутами
cy.get('[type="email"]').type('test@test.com');
cy.get('[placeholder="Enter your email"]').type('test@test.com');
```

### HTML рекомендація

```html
<!-- Додавай data-cy або data-testid до інтерактивних елементів -->
<button data-cy="submit-btn" type="submit">Submit</button>
<input data-cy="email-input" type="email" />
<div data-cy="user-card" class="card">...</div>
```

---

## Assertions

### Cypress Assertions

```javascript
// Видимість
cy.get('.modal').should('be.visible');
cy.get('.loader').should('not.be.visible');

// Існування в DOM
cy.get('#success-msg').should('exist');
cy.get('#error-msg').should('not.exist');

// Текст
cy.get('h1').should('have.text', 'Welcome');
cy.get('p').should('contain', 'partial text');

// Значення input
cy.get('#email').should('have.value', 'user@test.com');

// CSS властивості
cy.get('.btn').should('have.css', 'background-color', 'rgb(255, 107, 10)');

// Класи
cy.get('.item').should('have.class', 'active');
cy.get('.btn').should('not.have.class', 'disabled');

// Атрибути
cy.get('a').should('have.attr', 'href', '/about');
cy.get('input').should('be.disabled');
cy.get('input[type="checkbox"]').should('be.checked');

// URL
cy.url().should('include', '/dashboard');
cy.url().should('eq', 'https://example.com/');

// Кількість елементів
cy.get('.item').should('have.length', 5);
cy.get('li').should('have.length.greaterThan', 3);
```

---

## Mouse Events

```javascript
// Базові кліки
cy.get('[data-cy="btn"]').click();
cy.get('[data-cy="btn"]').dblclick();
cy.get('[data-cy="menu-item"]').rightclick();

// Click options
cy.get('[data-cy="btn"]').click({ force: true });  // для прихованих елементів
cy.get('[data-cy="btn"]').click({ multiple: true }); // клік по всіх

// Hover (через trigger)
cy.get('[data-cy="tooltip-trigger"]').trigger('mouseover');
cy.get('[data-cy="dropdown"]').trigger('mouseenter');

// Scroll
cy.get('[data-cy="footer"]').scrollIntoView();
cy.scrollTo('bottom');
cy.scrollTo(0, 500);  // x, y coordinates
```

---

## Keyboard Events

```javascript
// Введення тексту
cy.get('#search').type('automation testing');
cy.get('#email').type('user@test.com');

// Спеціальні клавіші
cy.get('#search').type('{enter}');
cy.get('#input').type('{backspace}');
cy.get('body').type('{esc}');
cy.get('#input').type('{ctrl}a');  // Ctrl+A

// Очищення поля
cy.get('#email').clear();
cy.get('#email').clear().type('new@test.com');

// Keyboard shortcut
cy.get('body').type('{ctrl}z');  // undo
```

---

## Waiting Strategies

```javascript
// Cypress Auto-Waits — НЕ потрібно sleep()
// Cypress автоматично чекає до 4 секунд

// Чекати появи елемента (вбудовано в should)
cy.get('[data-cy="result"]', { timeout: 10000 }).should('be.visible');

// Чекати мережевий запит
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');  // чекаємо завершення запиту
cy.get('[data-cy="user-list"]').should('be.visible');

// Уникай cy.wait(ms) якщо можливо
// Виняток: коли анімація або зовнішній сервіс без API
cy.wait(500);  // лише крайній випадок
```

---

## Network Interception

```javascript
// Мокування API відповіді
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');

// Мокування помилки
cy.intercept('GET', '/api/users', { statusCode: 500 }).as('serverError');

// Перехоплення і модифікація
cy.intercept('POST', '/api/login', (req) => {
  req.reply({ statusCode: 200, body: { token: 'fake-token' } });
});

// Перевірка запиту
cy.intercept('POST', '/api/users').as('createUser');
cy.get('[data-cy="submit"]').click();
cy.wait('@createUser').its('request.body').should('deep.equal', {
  name: 'Alice',
  email: 'alice@test.com'
});
```

---

## Best Practices

1. **Використовуй `data-cy` / `data-testid`** атрибути
2. **Уникай `cy.wait(ms)`** — використовуй Auto-wait
3. **Один тест = одна перевірка** — атомарні тести
4. **Незалежні тести** — не покладайся на попередній тест
5. **Мокуй зовнішні сервіси** — `cy.intercept()` для стабільності
6. **Використовуй `beforeEach`** для підготовки стану
7. **Перевіряй позитивні і негативні сценарії**

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| Element not found | Елемент не завантажився | Збільш timeout або перевір селектор |
| Element not visible | Елемент в DOM але прихований | `.scrollIntoView()` або `{ force: true }` |
| Detached element | DOM оновився під час тесту | Повторно знайти елемент |
| Cross-origin error | Перехід на інший домен | `cy.origin()` або `chromeWebSecurity: false` |
| StaleElementReference | Selenium: DOM змінився | Повторно знайти елемент |

---

## Related Notes

- [[Cypress Guide]] — детальний Cypress гайд
- [[Playwright Guide]] — Playwright альтернатива
- [[Selenium Guide]] — Selenium WebDriver
- [[Page Object Pattern]] — архітектурний паттерн
- [[Selectors Guide]] — розширений гайд по селекторах
- [[Automation Testing Index]] — головна сторінка
