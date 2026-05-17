# API Testing with Cypress

> Повний гайд по API тестуванню в Cypress: від першого запиту до просунутих технік.

#cypress #api #testing #automation

---

## Overview

Cypress дозволяє тестувати REST API за допомогою команди `cy.request()`. Це дозволяє об'єднати API та E2E тести в одному проєкті.

**Коли використовувати cy.request() для API тестів:**
- Тестування backend-ендпоінтів
- Прекондиції (створити дані перед E2E тестом)
- Перевірка стану після UI дій
- Перевірка безпеки (401, 403)

---

## Setup

```bash
# Cypress вже включає cy.request() — додаткових пакетів не треба
npm install cypress --save-dev
npx cypress open
```

**Налаштування baseUrl у cypress.config.js:**

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://api.example.com',
    env: {
      API_TOKEN: 'your-token-here'  // краще через .env
    }
  }
});
```

---

## Examples

### Simple GET Request

```javascript
describe('Users API', () => {
  it('should return user by id', () => {
    cy.request('GET', 'https://reqres.in/api/users/2')
      .then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('email');
        expect(response.body.data.email).to.eq('janet.weaver@reqres.in');
      });
  });
});
```

### Full Request Object

```javascript
it('should create new user', () => {
  const request = {
    method: 'POST',
    url: '/api/users',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cypress.env('TOKEN')}`
    },
    body: {
      name: 'Test User',
      job: 'QA Engineer'
    }
  };

  cy.request(request).then(response => {
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property('id');
    expect(response.body.name).to.eq('Test User');
  });
});
```

### Testing Non-200 Responses

```javascript
it('should return 404 for non-existing user', () => {
  cy.request({
    url: '/api/users/9999',
    failOnStatusCode: false  // ключовий параметр!
  }).then(response => {
    expect(response.status).to.eq(404);
  });
});

it('should return 401 without auth token', () => {
  cy.request({
    url: '/api/protected-endpoint',
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.eq(401);
    expect(response.body).to.have.property('message');
  });
});
```

### Checking Response Body Fields

```javascript
it('should validate user data structure', () => {
  cy.request('/api/users/1').then(response => {
    const user = response.body.data;

    // Перевірка наявності полів
    expect(user).to.have.keys(['id', 'email', 'first_name', 'last_name', 'avatar']);

    // Перевірка типів
    expect(user.id).to.be.a('number');
    expect(user.email).to.be.a('string');
    expect(user.email).to.include('@');
  });
});
```

### Checking Headers

```javascript
it('should have correct content-type', () => {
  cy.request('/api/users').then(response => {
    // Заголовки з дефісом — через квадратні дужки
    expect(response.headers['content-type']).to.include('application/json');
    expect(response.requestHeaders['Authorization']).to.exist;
  });
});
```

### Response Time Assertion

```javascript
it('should respond within SLA', () => {
  cy.request('/api/users').then(response => {
    expect(response.duration).to.be.lessThan(300);
  });
});
```

### Data Randomization

```javascript
function randomEmail() {
  const id = Math.floor(Math.random() * 1000000);
  return `test_${id}@example.com`;
}

it('should register unique user', () => {
  cy.request({
    method: 'POST',
    url: '/api/register',
    body: {
      email: randomEmail(),
      password: 'TestPass123!'
    }
  }).then(response => {
    expect(response.status).to.eq(201);
  });
});
```

### Chained Requests (Login → Use Token)

```javascript
it('should login and access protected resource', () => {
  // Крок 1: Авторизація
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email: 'user@test.com', password: 'pass123' }
  }).then(loginResponse => {
    expect(loginResponse.status).to.eq(200);
    const token = loginResponse.body.accessToken;

    // Крок 2: Використання токена
    cy.request({
      url: '/api/profile',
      headers: { Authorization: `Bearer ${token}` }
    }).then(profileResponse => {
      expect(profileResponse.status).to.eq(200);
      expect(profileResponse.body.email).to.eq('user@test.com');
    });
  });
});
```

### Custom Headers: User-Agent and Cookies

Будь-який HTTP-заголовок передається через `headers` об'єкт. Це включає `User-Agent`, `Cookie`, `X-Custom-Header` тощо.

```javascript
it('send request with custom user-agent and cookie', () => {
  const request = {
    url: 'https://httpbin.org/headers',
    headers: {
      'user-agent': 'My test bot 1.0',
      'Cookie': 'sessionId=abc123; userId=42'
    }
  };

  cy.request(request).then(response => {
    expect(response.status).to.eq(200);
    // httpbin повертає отримані заголовки у response.body.headers
    expect(response.body.headers['User-Agent']).to.include('My test bot');
  });
});
```

> Заголовки з дефісом або великою літерою — звертайся через квадратні дужки:
> `response.headers['content-type']`, `response.requestHeaders['Cookie']`

---

## Debugging

### Method 1: console.log()

```javascript
cy.request(request).then(resp => {
  console.log('Full response:', resp);
  console.log('Status:', resp.status);
  console.log('Body:', JSON.stringify(resp.body, null, 2));
});
// → Дивитись у DevTools Console (F12)
```

### Method 2: cy.log()

```javascript
cy.request(request).then(resp => {
  cy.log('Email: ' + resp.body.data.email);
  cy.log('Status: ' + resp.status);
});
// → Виводиться у Test Runner Cypress
```

### Method 3: debugger

```javascript
cy.request(request).then(resp => {
  debugger;  // Зупиняється тут (DevTools мають бути відкриті)
  expect(resp.status).to.eq(200);
});
```

---

## Best Practices

1. **Використовуй `failOnStatusCode: false`** для тестування помилок
2. **Зберігай чутливі дані в `Cypress.env()`** або `.env` файлі
3. **Починай з Happy Path** — потім негативні кейси
4. **Перевіряй і status, і body** — не тільки код відповіді
5. **Використовуй API для прекондицій** — замість UI кроків
6. **Перевіряй Response Time** — як частину SLA

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `cy.request() failed` | Статус ≠ 200 | Додай `failOnStatusCode: false` |
| `Cannot read property of undefined` | Неправильний шлях до поля | Перевір структуру response.body |
| `CORS error` | Браузерна CORS перевірка | cy.request() обходить CORS |
| `401 Unauthorized` | Токен відсутній/прострочений | Перевір хедер Authorization |
| `Timeout exceeded` | Сервер не відповідає | Збільш timeout у конфігу |

---

## Checklist: API тестування

- [ ] Покрив Happy Path — валідні дані → 200 OK, коректна відповідь
- [ ] Перевірив негативні кейси: 400, 401, 403, 404, 405, 500
- [ ] Тестував з невалідними параметрами (неправильний тип, порожні значення)
- [ ] Тестував із відсутніми обов'язковими параметрами
- [ ] Тестував без авторизаційного токена → 401
- [ ] Перевіряєш не лише `status`, а й структуру та значення `body`
- [ ] Перевіряєш `response.duration` у межах SLA (зазвичай < 300ms)
- [ ] Використовуєш `failOnStatusCode: false` для тестування помилок

---

## References

- [[API Testing Overview]] — загальна теорія API тестування
- [[Cypress Guide]] — повний гайд Cypress
- [[Cypress Cheatsheet]] — швидка шпаргалка
- [[Security Testing MOC]] — API security
