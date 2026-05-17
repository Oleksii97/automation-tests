# Cypress Cheatsheet

> Швидка шпаргалка по Cypress: команди, селектори, assertions, API.

#cypress #cheatsheet #automation #testing

---

## Installation & Setup

```bash
npm init -y
npm install cypress --save-dev
npx cypress open          # GUI
npx cypress run           # headless
```

---

## CLI Commands

| Команда | Опис |
|---------|------|
| `npx cypress open` | Відкрити GUI |
| `npx cypress run` | Запустити всі тести headless |
| `npx cypress run -b chrome --headed` | Chrome з вікном |
| `npx cypress run -b firefox` | Firefox |
| `npx cypress run --spec "path/test.cy.js"` | Один файл |
| `npx cypress run --env key=value` | Передати env змінну |

---

## Test Structure

```javascript
describe('Group name', () => {
  before(() => { /* одноразово перед всіма */ });
  beforeEach(() => { /* перед кожним */ });
  afterEach(() => { /* після кожного */ });
  after(() => { /* одноразово після всіх */ });

  it('test name', () => { /* тест */ });
  it.only('only this', () => { /* тільки цей */ });
  it.skip('skip this', () => { /* пропустити */ });
});
```

---

## Navigation

```javascript
cy.visit('/path')              // baseUrl + /path
cy.visit('https://full-url')
cy.go('back')
cy.go('forward')
cy.reload()
cy.url().should('include', '/dashboard')
cy.title().should('eq', 'My App')
```

---

## Finding Elements

```javascript
cy.get('[data-cy="submit"]')           // ★ Best practice
cy.get('[data-testid="email"]')        // ★ Best practice
cy.get('#user-email')                  // by ID
cy.get('.btn-primary')                 // by class
cy.get('input[type="email"]')          // by attribute
cy.get('button')                       // by tag
cy.contains('Submit')                  // by text
cy.contains('button', 'Submit')        // tag + text
cy.get('ul').find('li')                // find inside
cy.get('li').first()
cy.get('li').last()
cy.get('li').eq(2)                     // 0-indexed
cy.get('li').filter('.active')
```

---

## Actions

```javascript
cy.get(sel).click()
cy.get(sel).click({ force: true })    // hidden element
cy.get(sel).dblclick()
cy.get(sel).rightclick()
cy.get(sel).type('text')
cy.get(sel).type('{enter}')
cy.get(sel).type('{backspace}')
cy.get(sel).type('{ctrl}a')
cy.get(sel).clear()
cy.get(sel).clear().type('new text')
cy.get(sel).submit()
cy.get(sel).check()                   // checkbox
cy.get(sel).uncheck()
cy.get(sel).select('Option')          // dropdown
cy.get(sel).scrollIntoView()
cy.scrollTo('bottom')
cy.get(sel).trigger('mouseover')
cy.get(sel).focus()
cy.get(sel).blur()
```

---

## Assertions

```javascript
// Visibility
.should('be.visible')
.should('not.be.visible')

// Existence
.should('exist')
.should('not.exist')

// Text
.should('have.text', 'exact')
.should('contain', 'partial')
.should('have.value', 'input value')

// CSS / Attributes
.should('have.class', 'active')
.should('not.have.class', 'disabled')
.should('have.attr', 'href', '/page')
.should('have.css', 'color', 'rgb(0,0,0)')

// State
.should('be.checked')
.should('be.disabled')
.should('be.enabled')

// Count
.should('have.length', 5)
.should('have.length.gt', 3)

// Chaining (same element)
.should('be.visible')
.and('have.text', 'Submit')
.and('not.be.disabled')
```

---

## API Testing

```javascript
// Simple GET
cy.request('/api/users')
  .its('status').should('eq', 200)

// Full request
cy.request({
  method: 'POST',
  url: '/api/users',
  headers: { Authorization: `Bearer ${token}` },
  body: { name: 'Alice', email: 'alice@test.com' },
  failOnStatusCode: false    // ← для тестування помилок
}).then(resp => {
  expect(resp.status).to.eq(201);
  expect(resp.body).to.have.property('id');
  expect(resp.duration).to.be.lessThan(500);
});

// Response fields
response.status        // 200
response.body          // parsed JSON
response.headers       // object
response.duration      // ms
response.requestHeaders
```

---

## Network Interception

```javascript
// Mock API response
cy.intercept('GET', '/api/users', { fixture: 'users.json' })

// Mock with status
cy.intercept('GET', '/api/users', { statusCode: 500 })

// Spy on request
cy.intercept('POST', '/api/login').as('login')
cy.get('[data-cy="submit"]').click()
cy.wait('@login').its('response.statusCode').should('eq', 200)
cy.wait('@login').its('request.body').should('deep.eq', { email: 'user@test.com' })
```

---

## Aliases

```javascript
cy.get('[data-cy="btn"]').as('submitBtn')
cy.get('@submitBtn').click()

cy.intercept('GET', '/api/data').as('getData')
cy.wait('@getData')
```

---

## Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginApi', (email, pass) => {
  cy.request({ method: 'POST', url: '/api/auth/login',
    body: { email, password: pass }
  }).then(({ body }) => {
    localStorage.setItem('token', body.token);
  });
});

// Використання
cy.loginApi('user@test.com', 'pass123');
```

---

## Fixtures

```javascript
// cypress/fixtures/users.json
{ "admin": { "email": "admin@test.com", "password": "admin123" } }

// Використання
cy.fixture('users').then(data => {
  cy.loginApi(data.admin.email, data.admin.password);
});
```

---

## Configuration (cypress.config.js)

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://myapp.com',
    defaultCommandTimeout: 6000,
    retries: { runMode: 2, openMode: 0 },
    env: { TOKEN: '', API_URL: '' }
  }
});
```

---

## Common Patterns

```javascript
// Login via API (швидше ніж UI)
beforeEach(() => {
  cy.loginApi('user@test.com', 'pass123');
  cy.visit('/dashboard');
});

// Wait for request before assertion
cy.intercept('GET', '/api/products').as('products');
cy.visit('/products');
cy.wait('@products');
cy.get('[data-cy="product-list"]').should('be.visible');

// Create test data, use, cleanup
before(() => {
  cy.request('POST', '/api/users', testUser)
    .then(resp => { Cypress.env('userId', resp.body.id); });
});
after(() => {
  cy.request('DELETE', `/api/users/${Cypress.env('userId')}`);
});
```

---

## Related Notes

- [[Cypress Guide]] — повний гайд
- [[API Testing with Cypress]] — API тестування
- [[Page Object Pattern]] — POP патерн
- [[UI Testing Overview]] — UI тестування
