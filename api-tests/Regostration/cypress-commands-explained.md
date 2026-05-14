# Cypress API Testing — Розбір кожної команди

---

## Структура `cy.request()`

```js
cy.request({
  method:          // який HTTP метод використовувати
  url:             // куди відправляємо запит
  headers:         // що передаємо в заголовках
  failOnStatusCode:// чи падати на 4xx/5xx
  body:            // що відправляємо в тілі запиту
})
```

---

## Кожен параметр окремо

### `method`
```js
method: 'POST'   // створити щось нове
method: 'GET'    // отримати дані
method: 'PUT'    // оновити повністю
method: 'PATCH'  // оновити частково
method: 'DELETE' // видалити
```

---

### `url`
```js
// ❌ Рядок — це текст, не змінна
url: 'BASE_URL'

// ✅ Змінна — посилається на const BASE_URL
url: BASE_URL

// ✅ Напряму
url: 'https://practice.expandtesting.com/notes/api/users/register'
```

---

### `headers`
```js
// Потрібен коли відправляємо JSON body
headers: { 'Content-Type': 'application/json' }

// Потрібен коли авторизуємось через токен
headers: { Authorization: `Bearer ${token}` }

// Обидва разом
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}
```

---

### `failOnStatusCode`
```js
// НЕ пишемо — коли очікуємо успіх (200, 201)
// Cypress сам впаде якщо прийде 4xx/5xx

// ПИШЕМО false — коли спеціально тестуємо помилку
failOnStatusCode: false  // дозволяє 400, 401, 404, 409 і т.д.
```

| Статус | Писати `failOnStatusCode: false`? |
|--------|----------------------------------|
| `200` | ❌ |
| `201` | ❌ |
| `400` | ✅ |
| `401` | ✅ |
| `403` | ✅ |
| `404` | ✅ |
| `409` | ✅ |

---

### `body`
```js
// Об'єкт з даними які відправляємо
body: {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123!'
}

// Пустий body (для тесту missing body)
// просто не пишемо body взагалі
```

---

## Кожна перевірка `.expect()`

### Перевірка статусу
```js
expect(response.status).to.eq(201)  // точно 201
expect(response.status).to.eq(400)  // точно 400
expect(response.status).to.eq(409)  // точно 409
```

---

### Перевірка що поле існує
```js
// Перевіряє лише наявність поля
expect(response.body).to.have.property('message')
expect(response.body.data).to.have.property('id')
```

---

### Перевірка що поле існує І має значення
```js
// Перевіряє наявність + значення одночасно
expect(response.body).to.have.property('username', 'emilys')
//                                      ^поле       ^значення
```

---

### Перевірка значення поля
```js
// Пряме порівняння значення
expect(response.body.data.name).to.eq(user.name)
expect(response.body.data.email).to.eq(user.email)
expect(response.body.message).to.eq('An account already exists with the same email address')
```

---

### Перевірка що поле НЕ існує (security check)
```js
// Перевіряємо що пароль не повертається у відповіді
expect(response.body.data).to.not.have.property('password')
expect(response.body).to.not.have.property('accessToken')
```

---

## Як читати вкладену відповідь

```json
{
  "success": true,
  "status": 201,
  "message": "User created",
  "data": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

```js
response.body.success          // true
response.body.message          // "User created"
response.body.data.id          // "abc123"
response.body.data.name        // "John Doe"
response.body.data.email       // "john@example.com"
```

---

## Шаблони

### ✅ Шаблон — успішна реєстрація
```js
it('should register successfully', () => {
  const user = {
    name: 'John Doe',
    email: `john_${Date.now()}@example.com`,  // унікальний email
    password: 'Password123!'
  };

  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    body: user
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body.data).to.have.property('id');
    expect(response.body.data.name).to.eq(user.name);
    expect(response.body.data.email).to.eq(user.email);
    expect(response.body.data).to.not.have.property('password'); // security
  });
});
```

---

### ❌ Шаблон — негативний тест (400)
```js
it('should fail with empty name', () => {
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    failOnStatusCode: false,          // обов'язково для 4xx
    body: { name: '', email: 'johndoe@example.com', password: 'Password123!' }
  }).then((response) => {
    expect(response.status).to.eq(400);
    expect(response.body).to.have.property('message');
  });
});
```

---

### 🔁 Шаблон — дублікат (409)
```js
it('should fail with duplicate email', () => {
  const user = {
    name: 'John Doe',
    email: `duplicate_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  // Крок 1: реєструємо першого разу — успіх
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    body: user
  }).then((response) => {
    expect(response.status).to.eq(201);
  });

  // Крок 2: реєструємо вдруге — конфлікт
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    failOnStatusCode: false,
    body: user
  }).then((response) => {
    expect(response.status).to.eq(409);
    expect(response.body.message).to.eq('An account already exists with the same email address');
  });
});
```

---

### 🔐 Шаблон — GET з токеном
```js
it('should access protected route with valid token', () => {
  // Крок 1: логін — отримуємо токен
  cy.request({
    method: 'POST',
    url: LOGIN_URL,
    headers: HEADERS,
    body: { username: 'emilys', password: 'emilyspass' }
  }).then((loginResponse) => {
    expect(loginResponse.status).to.eq(200);

    const token = loginResponse.body.accessToken;

    // Крок 2: використовуємо токен
    cy.request({
      method: 'GET',
      url: PROTECTED_URL,
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('username');
    });
  });
});
```

---

### 📏 Шаблон — перевірка довжини поля
```js
it('should fail with too short name', () => {
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    failOnStatusCode: false,
    body: { name: 'Jo', email: 'johndoe@example.com', password: 'Password123!' }
    //           ^^^^  менше мінімальної довжини
  }).then((response) => {
    expect(response.status).to.eq(400);
  });
});

it('should fail with too long name', () => {
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    failOnStatusCode: false,
    body: { name: 'J'.repeat(51), email: 'johndoe@example.com', password: 'Password123!' }
    //           ^^^^^^^^^^^^^^^ більше максимальної довжини (51 > 50)
  }).then((response) => {
    expect(response.status).to.eq(400);
  });
});
```

---

### 💉 Шаблон — SQL ін'єкція
```js
it('should reject SQL injection', () => {
  cy.request({
    method: 'POST',
    url: BASE_URL,
    headers: HEADERS,
    failOnStatusCode: false,
    body: {
      name: "' OR 1=1--",     // ін'єкція без валідного імені
      email: 'attack@example.com',
      password: 'Password123!'
    }
  }).then((response) => {
    expect(response.status).to.eq(400);
    expect(response.body).to.not.have.property('accessToken');
  });
});
```

---

## Помилки які є у файлі

| Тест | Проблема | Правильний статус |
|------|----------|-------------------|
| `Password without uppercase` | Очікує `409`, але має бути `400` — це помилка валідації, не конфлікт | `400` |
| `Password without numbers` | Те саме — `409` → `400` | `400` |
| `should fail with special chars` | Те саме — `409` → `400` | `400` |
| `SQL injection` | Очікує `409` — має бути `400` | `400` |
| `XSS attack` | Очікує `409` — має бути `400` | `400` |
| `Email case sensitivity` | Тестує з `test@test.com` — не перевіряє реальну чутливість до регістру | Потрібен `Date.now()` |
| `Unicode characters` | Очікує `409` — але юнікод може бути валідним | Перевір у документації |
| `Missing Content-Type` | Дублюється — два однакових `it()` з однаковою назвою | Видалити дублікат |

---

## Коли який статус очікувати

| Ситуація | Статус |
|----------|--------|
| Успішно створено | `201` |
| Успішно отримано | `200` |
| Помилка валідації (пусте поле, короткий пароль) | `400` |
| Не авторизований | `401` |
| Заборонено | `403` |
| Не знайдено | `404` |
| Конфлікт (дублікат email) | `409` |
