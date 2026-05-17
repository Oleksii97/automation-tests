# Cypress Guide

> Повний гайд по Cypress: E2E, Component, API тестування.

#cypress #automation #testing #ui #e2e

---

## Overview

**Cypress** — сучасний JavaScript фреймворк для E2E, Component та API тестування вебзастосунків. Працює безпосередньо в браузері, без WebDriver.

**Особливості:**
- Time Travel — снапшоти на кожному кроці
- Auto Waiting — автоматичне очікування елементів
- Debuggability — дебаг у DevTools браузера
- Screenshots & Video — автоматично при падінні
- Built-in assertions (Chai), mocking, spying

**Обмеження:**
- Лише JavaScript / TypeScript
- Немає нативної підтримки Safari (тільки WebKit preview)
- Не підходить для мобільного нативного тестування
- Один браузер за раз (без паралельного запуску без Cypress Cloud)

---

## Setup

### Installation

```bash
# Передумова: Node.js v18+
node -v

# Ініціалізація проєкту
mkdir my-tests && cd my-tests
npm init -y

# Встановлення Cypress
npm install cypress --save-dev

# Перший запуск
npx cypress open
```

### Configuration (cypress.config.js)

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://your-app.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 6000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 2,    // CI: retries на падіння
      openMode: 0    // GUI: без retries
    },
    env: {
      API_URL: 'https://api.your-app.com',
      TOKEN: ''      // заповнити через .env
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    screenshotOnRunFailure: true,
    video: true
  }
});
```

### Project Structure

```
my-tests/
├── cypress/
│   ├── e2e/                    ← тест-файли
│   │   ├── smoke/
│   │   │   └── homepage.cy.js
│   │   ├── auth/
│   │   │   └── login.cy.js
│   │   └── api/
│   │       └── users.cy.js
│   ├── pages/                  ← Page Objects
│   │   ├── LoginPage.js
│   │   └── HomePage.js
│   ├── fixtures/               ← тестові дані
│   │   ├── users.json
│   │   └── products.json
│   └── support/
│       ├── commands.js         ← custom commands
│       └── e2e.js              ← глобальні налаштування
├── cypress.config.js
├── package.json
└── .env                        ← secrets (в .gitignore!)
```

---

## Examples

### Basic Test Structure

```javascript
// cypress/e2e/auth/login.cy.js

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');    // baseUrl + /login
  });

  it('should display login form', () => {
    cy.get('[data-cy="email"]').should('be.visible');
    cy.get('[data-cy="password"]').should('be.visible');
    cy.get('[data-cy="submit"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.get('[data-cy="email"]').type('user@test.com');
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome-msg"]').should('contain', 'Welcome');
  });

  it('should show error on invalid credentials', () => {
    cy.get('[data-cy="email"]').type('wrong@test.com');
    cy.get('[data-cy="password"]').type('wrongpass');
    cy.get('[data-cy="submit"]').click();
    cy.get('[data-cy="error-msg"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
```

### Page Object Pattern

```javascript
// cypress/pages/LoginPage.js
export class LoginPage {
  navigate() {
    cy.visit('/login');
    return this;
  }

  fillEmail(email) {
    cy.get('[data-cy="email"]').clear().type(email);
    return this;
  }

  fillPassword(password) {
    cy.get('[data-cy="password"]').clear().type(password);
    return this;
  }

  submit() {
    cy.get('[data-cy="submit"]').click();
    return this;
  }

  login(email, password) {
    return this.fillEmail(email).fillPassword(password).submit();
  }

  // Assertions
  shouldBeVisible() {
    cy.get('[data-cy="login-form"]').should('be.visible');
    return this;
  }

  shouldShowError(message) {
    cy.get('[data-cy="error-msg"]')
      .should('be.visible')
      .and('contain', message);
    return this;
  }
}
```

```javascript
// cypress/e2e/auth/login.cy.js
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login Tests', () => {
  beforeEach(() => {
    loginPage.navigate();
  });

  it('should login successfully', () => {
    loginPage
      .login('user@test.com', 'password123');

    cy.url().should('include', '/dashboard');
  });

  it('should show error on invalid login', () => {
    loginPage
      .login('wrong@test.com', 'wrongpass')
      .shouldShowError('Invalid credentials');
  });
});
```

### Custom Commands

```javascript
// cypress/support/commands.js

// Login через API (швидше ніж через UI)
Cypress.Commands.add('loginApi', (email = 'user@test.com', password = 'pass') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: { email, password }
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.accessToken);
    Cypress.env('TOKEN', body.accessToken);
  });
});

// Перевірка toast-повідомлення
Cypress.Commands.add('shouldShowToast', (message, type = 'success') => {
  cy.get(`[data-cy="toast-${type}"]`)
    .should('be.visible')
    .and('contain', message);
});

// Drag and drop
Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (subject, target) => {
  cy.wrap(subject).trigger('dragstart');
  cy.get(target).trigger('drop');
});
```

```javascript
// cypress/support/e2e.js
// Автоматично імпортує commands.js
import './commands';

// Глобальні налаштування
beforeEach(() => {
  // Очищення стану перед кожним тестом
  cy.clearLocalStorage();
  cy.clearCookies();
});
```

### Fixtures (Test Data)

```json
// cypress/fixtures/users.json
{
  "admin": {
    "email": "admin@test.com",
    "password": "Admin123!",
    "role": "admin"
  },
  "user": {
    "email": "user@test.com",
    "password": "User123!",
    "role": "user"
  }
}
```

```javascript
// Використання fixture
describe('Auth Tests', () => {
  let users;

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('admin login', () => {
    cy.loginApi(users.admin.email, users.admin.password);
    cy.visit('/admin');
    cy.get('[data-cy="admin-panel"]').should('be.visible');
  });
});
```

### Network Interception

```javascript
// Мок API відповіді
it('shows empty state when no products', () => {
  cy.intercept('GET', '/api/products', { body: [] }).as('getProducts');
  cy.visit('/products');
  cy.wait('@getProducts');
  cy.get('[data-cy="empty-state"]').should('be.visible');
});

// Мок помилки сервера
it('shows error on server failure', () => {
  cy.intercept('GET', '/api/products', { statusCode: 500 }).as('serverError');
  cy.visit('/products');
  cy.wait('@serverError');
  cy.get('[data-cy="error-banner"]').should('be.visible');
});

// Перевірка запиту
it('sends correct data on form submit', () => {
  cy.intercept('POST', '/api/users').as('createUser');
  
  cy.visit('/register');
  cy.get('[data-cy="name"]').type('Alice');
  cy.get('[data-cy="email"]').type('alice@test.com');
  cy.get('[data-cy="submit"]').click();
  
  cy.wait('@createUser').then(({ request }) => {
    expect(request.body.name).to.eq('Alice');
    expect(request.body.email).to.eq('alice@test.com');
  });
});
```

### API Testing

```javascript
describe('Users API', () => {
  let authToken;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'admin@test.com', password: 'Admin123!' }
    }).then(resp => {
      authToken = resp.body.accessToken;
    });
  });

  it('GET /api/users - returns list', () => {
    cy.request({
      url: '/api/users',
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(resp => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.be.an('array');
      expect(resp.body.length).to.be.greaterThan(0);
    });
  });

  it('POST /api/users - creates user', () => {
    cy.request({
      method: 'POST',
      url: '/api/users',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: 'Test User', email: `test_${Date.now()}@test.com` }
    }).then(resp => {
      expect(resp.status).to.eq(201);
      expect(resp.body).to.have.property('id');
    });
  });
});
```

---

## Best Practices

1. **`data-cy` або `data-testid`** для стабільних селекторів
2. **`loginApi`** замість UI логіну де можливо
3. **Уникай `cy.wait(ms)`** — використовуй `cy.intercept()` + `cy.wait('@alias')`
4. **Один тест = один `it()`** — атомарні тести
5. **Прибирай `.only()`** перед комітом
6. **`fixtures`** для тестових даних
7. **`cypress.env()`** для чутливих даних

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `cy.get() timed out` | Елемент не з'явився | Перевір селектор або збільш timeout |
| `Cross origin error` | Перехід на інший домен | Використай `cy.origin()` |
| `.only()` в коміті | Запустяться лише ці тести | ESLint правило + pre-commit hook |
| `Cannot read property of undefined` | Async проблема | Поверни `cy.` chain або використай `.then()` |
| Flaky test | Часовий race condition | `cy.intercept()` для чекання запитів |

---

## CLI Reference

```bash
# GUI режим (розробка)
npx cypress open

# Headless (CI)
npx cypress run

# Конкретний браузер
npx cypress run --browser chrome
npx cypress run --browser firefox

# Конкретний файл
npx cypress run --spec "cypress/e2e/auth/login.cy.js"

# За тегом (з @cypress/grep плагіном)
npx cypress run --env grepTags=smoke

# З відео та скрінами
npx cypress run --headed --video true

# Запис у Cypress Cloud
npx cypress run --record --key <record-key>
```

---

## Checklists

### Перед написанням тестів

- [ ] Встановлено Node.js (`node -v`)
- [ ] Встановлено Cypress (`npm install cypress --save-dev`)
- [ ] Браузери Chrome / Firefox оновлені до останньої версії
- [ ] Налаштовано VSCode + термінал (Git Bash або вбудований)
- [ ] Створено структуру папок (`e2e`, `pages`, `fixtures`, `support`)

### Якісний тест має

- [ ] Зрозумілу назву — що саме перевіряє
- [ ] Один тест — одна перевірка / один сценарій
- [ ] Селектори типу `data-cy` (а не CSS класи чи XPath)
- [ ] Без залежності від попередніх тестів
- [ ] Без захардкоджених затримок (`cy.wait(5000)`) — лише крайній випадок
- [ ] Повторювані частини винесені в custom commands або Page Object
- [ ] Має assertions — без них це скрипт, а не тест

### Перед комітом коду

- [ ] Прибрав `.only()` з усіх тестів
- [ ] Не залишилось закоментованого коду
- [ ] Тести проходять локально (`npx cypress run`)
- [ ] Селектори стабільні (не `.css-1f1fv1i` або `div > div > span`)
- [ ] `node_modules` у `.gitignore`
- [ ] Чутливі дані (паролі, API-ключі) в `.env`, а не в коді

---

## Related Notes

- [[API Testing with Cypress]] — детальний API guide
- [[Page Object Pattern]] — POP патерн
- [[UI Testing Overview]] — UI тестування
- [[CI-CD Overview]] — Cypress у CI/CD
- [[Cypress Cheatsheet]] — швидка шпаргалка
- [[Framework Comparison]] — порівняння з іншими
- [[Automation Testing Index]] — головна сторінка
