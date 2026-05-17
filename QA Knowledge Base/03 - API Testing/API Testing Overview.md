# API Testing Overview

> Тестування REST API: HTTP методи, статус коди, заголовки, автентифікація.

#qa #automation #testing #api

---

## Overview

**API Testing** — перевірка програмних інтерфейсів застосунку (Application Programming Interface). API тести перевіряють, що сервер правильно обробляє запити та повертає коректні відповіді.

**Переваги API тестів над E2E:**

| Параметр | API Tests | E2E Tests |
|----------|-----------|-----------|
| Швидкість | Секунди | Хвилини |
| Стабільність | Висока | Середня |
| Залежність від UI | Немає | Повна |
| Раннє тестування | Так | Ні |
| Покриття edge cases | Легко | Складно |

---

## HTTP Fundamentals

### HTTP Methods (CRUD)

| Метод | Дія | Ідемпотентний |
|-------|-----|---------------|
| `GET` | Отримати дані | Так |
| `POST` | Створити ресурс | Ні |
| `PUT` | Повністю оновити | Так |
| `PATCH` | Частково оновити | Ні |
| `DELETE` | Видалити ресурс | Так |
| `HEAD` | Лише заголовки | Так |
| `OPTIONS` | Доступні методи | Так |

### HTTP Status Codes

| Група | Діапазон | Приклади |
|-------|----------|---------|
| **1xx** Informational | 100-199 | 100 Continue |
| **2xx** Success | 200-299 | 200 OK, 201 Created, 204 No Content |
| **3xx** Redirect | 300-399 | 301 Moved, 302 Found, 304 Not Modified |
| **4xx** Client Error | 400-499 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 422 Unprocessable, 429 Too Many Requests |
| **5xx** Server Error | 500-599 | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

### Request Structure

```
Method  URL
  ↓      ↓
POST https://api.example.com/users?role=admin
                                    ↑
                              Query Params

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
  Accept: application/json

Body:
{
  "name": "Alice",
  "email": "alice@test.com"
}
```

### Response Structure

```
Status: 201 Created

Headers:
  Content-Type: application/json
  X-Request-ID: abc-123

Body:
{
  "id": 42,
  "name": "Alice",
  "email": "alice@test.com",
  "createdAt": "2026-05-16T10:00:00Z"
}
```

---

## Authentication Types

| Тип | Де передається | Приклад |
|-----|---------------|---------|
| **API Key** | Header або Query | `X-API-Key: abc123` |
| **Basic Auth** | Header | `Authorization: Basic base64(user:pass)` |
| **Bearer Token (JWT)** | Header | `Authorization: Bearer eyJ...` |
| **OAuth 2.0** | Header | Access token після flow |
| **Session Cookie** | Cookie | `Cookie: sessionId=xyz` |

---

## API Testing with Cypress

### Basic Request

```javascript
// GET request
cy.request('https://reqres.in/api/users/2')
  .then(response => {
    expect(response.status).to.eq(200);
    expect(response.body.data.email).to.eq('janet.weaver@reqres.in');
  });
```

### Full Request Object

```javascript
const request = {
  method: 'POST',
  url: 'https://reqres.in/api/users',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + Cypress.env('TOKEN')
  },
  body: {
    name: 'Alice',
    job: 'QA Engineer'
  }
};

cy.request(request).then(response => {
  expect(response.status).to.eq(201);
  expect(response.body).to.have.property('id');
  expect(response.body.name).to.eq('Alice');
});
```

### Testing Error Responses

```javascript
// Тестуємо 404
cy.request({
  url: '/api/users/9999',
  failOnStatusCode: false   // не падає на не-200
}).then(response => {
  expect(response.status).to.eq(404);
});

// Тестуємо 401
cy.request({
  url: '/api/protected',
  failOnStatusCode: false
}).then(response => {
  expect(response.status).to.eq(401);
  expect(response.body.message).to.include('Unauthorized');
});
```

### Response Time Assertion

```javascript
it('response should be under 500ms', () => {
  cy.request('/api/users').then(response => {
    expect(response.duration).to.be.lessThan(500);
  });
});
```

---

## API Testing Checklist

### Functional
- [ ] Happy path — валідні дані → 200/201
- [ ] Invalid data — неправильний тип/формат → 400
- [ ] Missing required fields → 400/422
- [ ] Unauthorized access → 401
- [ ] Forbidden access (wrong role) → 403
- [ ] Not found → 404
- [ ] Wrong HTTP method → 405
- [ ] Server error handling → 500 (симуляція)

### Security
- [ ] Без токена → 401
- [ ] Прострочений токен → 401
- [ ] SQL Injection у параметрах
- [ ] XSS у тілі запиту
- [ ] IDOR (Insecure Direct Object Reference)

### Performance
- [ ] Response time < SLA (зазвичай 200-500ms)
- [ ] Паралельні запити
- [ ] Великий payload

---

## Common API Testing Tools

| Інструмент | Тип | Коли використовувати |
|-----------|-----|---------------------|
| **Postman** | Manual / Collection | Дослідження, ручне тестування |
| **Insomnia** | Manual | Альтернатива Postman |
| **Cypress** | Automated | API + E2E в одному проєкті |
| **Playwright** | Automated | API + E2E в одному проєкті |
| **Pytest + Requests** | Automated | Python проєкти |
| **REST Assured** | Automated | Java проєкти |
| **K6** | Performance | Навантажувальне + API |

---

## Reusable API Snippets

### Login and get token

```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then(response => {
    expect(response.status).to.eq(200);
    const token = response.body.accessToken;
    Cypress.env('TOKEN', token);
    window.localStorage.setItem('token', token);
  });
});

// Використання у тесті
beforeEach(() => {
  cy.loginApi('user@test.com', 'password123');
});
```

### Create test data via API

```javascript
// Створити юзера через API замість UI (швидше)
before(() => {
  cy.request({
    method: 'POST',
    url: '/api/users',
    headers: { Authorization: `Bearer ${Cypress.env('ADMIN_TOKEN')}` },
    body: { name: 'Test User', email: 'test@temp.com', role: 'user' }
  }).then(resp => {
    Cypress.env('USER_ID', resp.body.id);
  });
});

after(() => {
  // Очищення після тестів
  cy.request({
    method: 'DELETE',
    url: `/api/users/${Cypress.env('USER_ID')}`,
    headers: { Authorization: `Bearer ${Cypress.env('ADMIN_TOKEN')}` }
  });
});
```

---

## Related Notes

- [[API Testing with Cypress]] — детальний Cypress API guide
- [[Cypress Guide]] — E2E + API фреймворк
- [[Security Testing MOC]] — безпека API
- [[Performance Testing Overview]] — навантажувальне тестування API
- [[Automation Testing Index]] — головна сторінка
