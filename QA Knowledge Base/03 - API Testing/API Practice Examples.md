# API Practice Examples — Cypress Tests

> Реальні Cypress API тести для https://practice.expandtesting.com/notes/api/
> Покриває: Auth (register/login/logout), User Profile, Notes CRUD — позитивні та негативні сценарії.

#cypress #api #testing #practice #rest #examples

---

## Навігація

- [[#Налаштування]]
- [[#1. Health Check]]
- [[#2. Register]]
- [[#3. Login]]
- [[#4. User Profile (GET / PATCH)]]
- [[#5. Change Password]]
- [[#6. Forgot Password]]
- [[#7. Notes — Create (POST)]]
- [[#8. Notes — Get All (GET)]]
- [[#9. Notes — Get by ID (GET)]]
- [[#10. Notes — Update Full (PUT)]]
- [[#11. Notes — Update Partial (PATCH)]]
- [[#12. Notes — Delete (DELETE)]]
- [[#13. Logout та Delete Account]]
- [[#14. E2E Flow — повний сценарій]]

---

## Налаштування

```bash
mkdir cypress-api-practice && cd cypress-api-practice
npm init -y
npm install cypress --save-dev
```

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://practice.expandtesting.com/notes/api',
    defaultCommandTimeout: 10000,
    responseTimeout: 15000,
    video: false,
    env: {
      // Тестовий юзер — змінюй під себе
      TEST_EMAIL: 'cypress_test_user@mailinator.com',
      TEST_PASSWORD: 'Test@1234!',
      TEST_NAME: 'Cypress Tester',
    },
  },
});
```

```javascript
// cypress/support/api-commands.js
// Реєструємо і логінимось через cy.session() — токен кешується між тестами

Cypress.Commands.add('registerAndLogin', () => {
  const email = `test_${Date.now()}@mailinator.com`;
  const password = 'Test@1234!';
  const name = 'Cypress Tester';

  return cy.request({
    method: 'POST',
    url: '/users/register',
    form: true,
    body: { name, email, password },
    failOnStatusCode: false,
  }).then(() => {
    return cy.request({
      method: 'POST',
      url: '/users/login',
      form: true,
      body: { email, password },
    }).then((res) => {
      const token = res.body.data.token;
      Cypress.env('authToken', token);
      Cypress.env('userId', res.body.data.id);
      Cypress.env('userEmail', email);
      Cypress.env('userPassword', password);
      return token;
    });
  });
});

Cypress.Commands.add('apiAuth', () => {
  return { 'x-auth-token': Cypress.env('authToken') };
});
```

---

## 1. Health Check

**Файл:** `cypress/e2e/api/01-health-check.cy.js`

```javascript
describe('API Health Check', () => {
  // Перевіряємо що API взагалі живе — базова перевірка перед усіма тестами.

  it('повинен повернути 200 і підтвердити що API запущено', () => {
    cy.request('GET', '/health-check').then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.eq('Notes API is Running');
    });
  });

  it('повинен відповісти за розумний час (< 3 секунди)', () => {
    const start = Date.now();
    cy.request('GET', '/health-check').then(() => {
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(3000);
    });
  });

  it('повинен повертати Content-Type: application/json', () => {
    cy.request('GET', '/health-check').then((res) => {
      expect(res.headers['content-type']).to.include('application/json');
    });
  });
});
```

> **Техніки:** `cy.request()` — основа API тестів в Cypress. Перевіряємо `status`, `body`, `headers`. Date.now() для вимірювання часу відповіді — простий performance check.

---

## 2. Register

**Файл:** `cypress/e2e/api/02-register.cy.js`

```javascript
describe('POST /users/register', () => {
  // Реєстрація нового юзера. Кожен тест — унікальний email через timestamp.

  describe('Happy Path', () => {
    it('повинен зареєструвати нового користувача і повернути 201', () => {
      const uniqueEmail = `user_${Date.now()}@mailinator.com`;

      cy.request({
        method: 'POST',
        url: '/users/register',
        form: true,
        body: {
          name: 'Test User',
          email: uniqueEmail,
          password: 'Test@1234!',
        },
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.have.property('id');
        expect(res.body.data.email).to.eq(uniqueEmail);
        expect(res.body.data.name).to.eq('Test User');
        // Пароль ніколи не повертається у відповіді
        expect(res.body.data).not.to.have.property('password');
      });
    });

    it('повинен повернути id, name, email у data об\'єкті', () => {
      const uniqueEmail = `user_${Date.now()}_2@mailinator.com`;

      cy.request({
        method: 'POST',
        url: '/users/register',
        form: true,
        body: {
          name: 'Second User',
          email: uniqueEmail,
          password: 'Password@99',
        },
      }).then((res) => {
        expect(res.body.data).to.include.keys('id', 'name', 'email');
        expect(res.body.data.id).to.be.a('string').and.not.be.empty;
      });
    });
  });

  describe('Негативні сценарії', () => {
    it('повинен повернути 400 при дублікаті email', () => {
      const email = `dup_${Date.now()}@mailinator.com`;
      const body = { name: 'User', email, password: 'Test@1234!' };

      // Перший запит — успішний
      cy.request({ method: 'POST', url: '/users/register', form: true, body })
        .then(() => {
          // Другий з тим самим email
          cy.request({
            method: 'POST',
            url: '/users/register',
            form: true,
            body,
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.eq(409);
            expect(res.body.success).to.be.false;
          });
        });
    });

    it('повинен повернути 400 при невалідному email', () => {
      cy.request({
        method: 'POST',
        url: '/users/register',
        form: true,
        body: { name: 'User', email: 'not-an-email', password: 'Test@1234!' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('повинен повернути 400 при відсутньому name', () => {
      cy.request({
        method: 'POST',
        url: '/users/register',
        form: true,
        body: { email: `no_name_${Date.now()}@mailinator.com`, password: 'Test@1234!' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it('повинен повернути 400 при короткому паролі', () => {
      cy.request({
        method: 'POST',
        url: '/users/register',
        form: true,
        body: {
          name: 'User',
          email: `short_pass_${Date.now()}@mailinator.com`,
          password: '123',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });
  });
});
```

> **Техніки:** `failOnStatusCode: false` — Cypress не кидає помилку при 4xx/5xx, ми самі перевіряємо статус. `form: true` — відправляє тіло як `application/x-www-form-urlencoded`. `Date.now()` — гарантує унікальний email кожного тесту.

---

## 3. Login

**Файл:** `cypress/e2e/api/03-login.cy.js`

```javascript
describe('POST /users/login', () => {
  // Логін: отримуємо токен, перевіряємо структуру відповіді,
  // перевіряємо поведінку при невірних кредах.

  let testEmail;
  let testPassword = 'Test@5678!';

  before(() => {
    // Реєструємо юзера один раз для всіх тестів логіну
    testEmail = `login_test_${Date.now()}@mailinator.com`;
    cy.request({
      method: 'POST',
      url: '/users/register',
      form: true,
      body: { name: 'Login Tester', email: testEmail, password: testPassword },
    });
  });

  describe('Happy Path', () => {
    it('повинен повернути 200 і токен при правильних кредах', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: testEmail, password: testPassword },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.have.property('token');
        expect(res.body.data.token).to.be.a('string').and.not.be.empty;
      });
    });

    it('повинен повертати id, name, email разом з токеном', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: testEmail, password: testPassword },
      }).then((res) => {
        const { data } = res.body;
        expect(data).to.include.keys('id', 'name', 'email', 'token');
        expect(data.email).to.eq(testEmail);
        expect(data.name).to.eq('Login Tester');
      });
    });

    it('токен повинен бути достатньо довгим (JWT-like)', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: testEmail, password: testPassword },
      }).then((res) => {
        const token = res.body.data.token;
        expect(token.length).to.be.greaterThan(20);
      });
    });
  });

  describe('Негативні сценарії', () => {
    it('повинен повернути 401 при неправильному паролі', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: testEmail, password: 'WrongPassword!' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.success).to.be.false;
        expect(res.body).not.to.have.nested.property('data.token');
      });
    });

    it('повинен повернути 400 при відсутньому email', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { password: testPassword },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('повинен повернути 401 при незареєстрованому email', () => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: 'nobody_exists@mailinator.com', password: 'Pass@1234!' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});
```

> **Техніки:** `before()` — виконується один раз перед усіма тестами в describe. `nested.property('data.token')` — перевірка вкладеного поля через dot-notation. Токен перевіряємо на довжину — щоб не пройшов порожній рядок.

---

## 4. User Profile (GET / PATCH)

**Файл:** `cypress/e2e/api/04-profile.cy.js`

```javascript
describe('User Profile', () => {
  // Профіль: отримання та оновлення. Для всіх запитів потрібен x-auth-token.

  let token;
  let userEmail;

  before(() => {
    userEmail = `profile_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST',
      url: '/users/register',
      form: true,
      body: { name: 'Profile Tester', email: userEmail, password },
    }).then(() => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: userEmail, password },
      }).then((res) => {
        token = res.body.data.token;
      });
    });
  });

  describe('GET /users/profile', () => {
    it('повинен повернути профіль авторизованого юзера', () => {
      cy.request({
        method: 'GET',
        url: '/users/profile',
        headers: { 'x-auth-token': token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.email).to.eq(userEmail);
        expect(res.body.data.name).to.eq('Profile Tester');
      });
    });

    it('повинен повернути 401 без токену', () => {
      cy.request({
        method: 'GET',
        url: '/users/profile',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.success).to.be.false;
      });
    });

    it('повинен повернути 401 з невалідним токеном', () => {
      cy.request({
        method: 'GET',
        url: '/users/profile',
        headers: { 'x-auth-token': 'invalid_token_xyz' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  describe('PATCH /users/profile', () => {
    it('повинен оновити name профілю', () => {
      cy.request({
        method: 'PATCH',
        url: '/users/profile',
        headers: { 'x-auth-token': token },
        form: true,
        body: { name: 'Updated Name' },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.name).to.eq('Updated Name');
      });
    });

    it('повинен оновити phone та company', () => {
      cy.request({
        method: 'PATCH',
        url: '/users/profile',
        headers: { 'x-auth-token': token },
        form: true,
        body: {
          name: 'Updated Name',
          phone: '+380991234567',
          company: 'Cypress Corp',
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.phone).to.eq('+380991234567');
        expect(res.body.data.company).to.eq('Cypress Corp');
      });
    });

    it('повинен зберегти оновлені дані при GET після PATCH', () => {
      cy.request({
        method: 'PATCH',
        url: '/users/profile',
        headers: { 'x-auth-token': token },
        form: true,
        body: { name: 'Persisted Name' },
      }).then(() => {
        cy.request({
          method: 'GET',
          url: '/users/profile',
          headers: { 'x-auth-token': token },
        }).then((res) => {
          expect(res.body.data.name).to.eq('Persisted Name');
        });
      });
    });
  });
});
```

> **Техніки:** `headers: { 'x-auth-token': token }` — передача токену у кожен авторизований запит. Ланцюжок `.then()` — послідовне виконання запитів де другий залежить від першого. Перевірка persistence — GET після PATCH щоб підтвердити що зміни збереглись.

---

## 5. Change Password

**Файл:** `cypress/e2e/api/05-change-password.cy.js`

```javascript
describe('POST /users/change-password', () => {
  let token;
  let currentPassword = 'OldPass@123!';
  let newPassword = 'NewPass@456!';
  let userEmail;

  before(() => {
    userEmail = `changepw_${Date.now()}@mailinator.com`;

    cy.request({
      method: 'POST',
      url: '/users/register',
      form: true,
      body: { name: 'PW Changer', email: userEmail, password: currentPassword },
    }).then(() => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email: userEmail, password: currentPassword },
      }).then((res) => {
        token = res.body.data.token;
      });
    });
  });

  it('повинен успішно змінити пароль', () => {
    cy.request({
      method: 'POST',
      url: '/users/change-password',
      headers: { 'x-auth-token': token },
      form: true,
      body: { currentPassword, newPassword },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('повинен дозволяти логін з новим паролем після зміни', () => {
    cy.request({
      method: 'POST',
      url: '/users/login',
      form: true,
      body: { email: userEmail, password: newPassword },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.have.property('token');
    });
  });

  it('повинен заблокувати логін зі старим паролем', () => {
    cy.request({
      method: 'POST',
      url: '/users/login',
      form: true,
      body: { email: userEmail, password: currentPassword },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('повинен повернути 400 при неправильному currentPassword', () => {
    cy.request({
      method: 'POST',
      url: '/users/change-password',
      headers: { 'x-auth-token': token },
      form: true,
      body: { currentPassword: 'WrongOldPass!', newPassword: 'AnotherNew@1!' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401]);
      expect(res.body.success).to.be.false;
    });
  });
});
```

> **Техніки:** `be.oneOf([400, 401])` — перевірка на кілька допустимих статусів. Ланцюжок change → login with new → login with old — повний цикл верифікації зміни пароля.

---

## 6. Forgot Password

**Файл:** `cypress/e2e/api/06-forgot-password.cy.js`

```javascript
describe('POST /users/forgot-password', () => {
  // Forgot password — надсилає email з токеном для скидання.
  // В тестовому середовищі перевіряємо лише відповідь API,
  // не реальний email.

  let registeredEmail;

  before(() => {
    registeredEmail = `forgot_${Date.now()}@mailinator.com`;
    cy.request({
      method: 'POST',
      url: '/users/register',
      form: true,
      body: { name: 'Forgot Tester', email: registeredEmail, password: 'Test@1234!' },
    });
  });

  it('повинен повернути 200 для зареєстрованого email', () => {
    cy.request({
      method: 'POST',
      url: '/users/forgot-password',
      form: true,
      body: { email: registeredEmail },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('email');
    });
  });

  it('повинен повернути 400 для невалідного email формату', () => {
    cy.request({
      method: 'POST',
      url: '/users/forgot-password',
      form: true,
      body: { email: 'not-valid-email' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('повинен повернути 400 при порожньому email', () => {
    cy.request({
      method: 'POST',
      url: '/users/forgot-password',
      form: true,
      body: { email: '' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
```

> **Техніки:** Тестуємо лише API-відповідь, не поштовий ящик. `include('email')` — часткова перевірка повідомлення, незалежна від точного тексту. `before()` — налаштування стану одного разу перед групою тестів.

---

## 7. Notes — Create (POST)

**Файл:** `cypress/e2e/api/07-notes-create.cy.js`

```javascript
describe('POST /notes — Create Note', () => {
  let token;

  before(() => {
    const email = `notes_create_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST',
      url: '/users/register',
      form: true,
      body: { name: 'Notes Creator', email, password },
    }).then(() => {
      cy.request({
        method: 'POST',
        url: '/users/login',
        form: true,
        body: { email, password },
      }).then((res) => {
        token = res.body.data.token;
      });
    });
  });

  describe('Happy Path', () => {
    it('повинен створити нотатку категорії Home', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: {
          title: 'My First Note',
          description: 'This is a test note created by Cypress',
          category: 'Home',
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.eq('My First Note');
        expect(res.body.data.category).to.eq('Home');
        expect(res.body.data.completed).to.be.false;
        expect(res.body.data).to.have.property('id');
        expect(res.body.data).to.have.property('user_id');
      });
    });

    it('повинен створити нотатку категорії Work', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: { title: 'Work Task', description: 'Fix the bug', category: 'Work' },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.category).to.eq('Work');
      });
    });

    it('повинен створити нотатку категорії Personal', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: {
          title: 'Personal Note',
          description: 'Something personal',
          category: 'Personal',
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.category).to.eq('Personal');
      });
    });

    it('нова нотатка повинна мати completed: false за замовчуванням', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: { title: 'Incomplete Note', description: 'Not done yet', category: 'Home' },
      }).then((res) => {
        expect(res.body.data.completed).to.be.false;
      });
    });
  });

  describe('Негативні сценарії', () => {
    it('повинен повернути 400 при відсутньому title', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: { description: 'No title', category: 'Home' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('повинен повернути 400 при невалідній category', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: { title: 'Bad Category', description: 'Test', category: 'InvalidCat' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it('повинен повернути 401 без токену', () => {
      cy.request({
        method: 'POST',
        url: '/notes',
        form: true,
        body: { title: 'Unauthorized', description: 'Test', category: 'Home' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});
```

> **Техніки:** `have.property('id')` — перевірка що поле існує (без перевірки значення). Тестуємо всі 3 валідні категорії окремо — enum coverage. Перевіряємо `completed: false` як default value.

---

## 8. Notes — Get All (GET)

**Файл:** `cypress/e2e/api/08-notes-get-all.cy.js`

```javascript
describe('GET /notes — Get All Notes', () => {
  let token;

  before(() => {
    const email = `notes_getall_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'GetAll Tester', email, password },
    }).then(() => {
      cy.request({
        method: 'POST', url: '/users/login', form: true,
        body: { email, password },
      }).then((res) => {
        token = res.body.data.token;

        // Створюємо 3 нотатки для тестів
        const notes = [
          { title: 'Note A', description: 'First', category: 'Home' },
          { title: 'Note B', description: 'Second', category: 'Work' },
          { title: 'Note C', description: 'Third', category: 'Personal' },
        ];
        notes.forEach((note) => {
          cy.request({
            method: 'POST', url: '/notes',
            headers: { 'x-auth-token': token },
            form: true, body: note,
          });
        });
      });
    });
  });

  it('повинен повернути масив нотаток', () => {
    cy.request({
      method: 'GET',
      url: '/notes',
      headers: { 'x-auth-token': token },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
    });
  });

  it('повинен повернути мінімум 3 нотатки (ті що ми створили)', () => {
    cy.request({
      method: 'GET',
      url: '/notes',
      headers: { 'x-auth-token': token },
    }).then((res) => {
      expect(res.body.data.length).to.be.at.least(3);
    });
  });

  it('кожна нотатка повинна мати обов\'язкові поля', () => {
    cy.request({
      method: 'GET',
      url: '/notes',
      headers: { 'x-auth-token': token },
    }).then((res) => {
      res.body.data.forEach((note) => {
        expect(note).to.include.keys(
          'id', 'title', 'description', 'category', 'completed', 'user_id'
        );
      });
    });
  });

  it('повинен повернути тільки нотатки поточного юзера', () => {
    cy.request({
      method: 'GET',
      url: '/notes',
      headers: { 'x-auth-token': token },
    }).then((res) => {
      const userId = res.body.data[0]?.user_id;
      res.body.data.forEach((note) => {
        expect(note.user_id).to.eq(userId);
      });
    });
  });

  it('повинен повернути 401 без токену', () => {
    cy.request({
      method: 'GET',
      url: '/notes',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
```

> **Техніки:** `be.an('array')` — перевірка типу. `at.least(3)` — перевірка мінімальної довжини. `forEach` в `.then()` — ітерація по масиву відповіді для перевірки кожного об'єкту. Ізоляція даних — новий юзер для кожного describe.

---

## 9. Notes — Get by ID (GET)

**Файл:** `cypress/e2e/api/09-notes-get-by-id.cy.js`

```javascript
describe('GET /notes/:id — Get Note by ID', () => {
  let token;
  let noteId;

  before(() => {
    const email = `notes_byid_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'GetById Tester', email, password },
    }).then(() => {
      cy.request({
        method: 'POST', url: '/users/login', form: true,
        body: { email, password },
      }).then((loginRes) => {
        token = loginRes.body.data.token;

        cy.request({
          method: 'POST', url: '/notes',
          headers: { 'x-auth-token': token },
          form: true,
          body: { title: 'Specific Note', description: 'Find me by ID', category: 'Work' },
        }).then((createRes) => {
          noteId = createRes.body.data.id;
        });
      });
    });
  });

  it('повинен повернути конкретну нотатку за ID', () => {
    cy.request({
      method: 'GET',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(noteId);
      expect(res.body.data.title).to.eq('Specific Note');
      expect(res.body.data.description).to.eq('Find me by ID');
      expect(res.body.data.category).to.eq('Work');
    });
  });

  it('повинен повернути 400 або 404 для неіснуючого ID', () => {
    cy.request({
      method: 'GET',
      url: '/notes/000000000000000000000000',
      headers: { 'x-auth-token': token },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
      expect(res.body.success).to.be.false;
    });
  });

  it('повинен повернути 400 при невалідному форматі ID', () => {
    cy.request({
      method: 'GET',
      url: '/notes/not-a-valid-id',
      headers: { 'x-auth-token': token },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
```

> **Техніки:** Ланцюг `register → login → create → save noteId` в `before()`. Template literal `/notes/${noteId}` — динамічний URL з ID. `be.oneOf([400, 404])` — API може повертати різні коди для "not found".

---

## 10. Notes — Update Full (PUT)

**Файл:** `cypress/e2e/api/10-notes-update-put.cy.js`

```javascript
describe('PUT /notes/:id — Full Update', () => {
  let token;
  let noteId;

  before(() => {
    const email = `notes_put_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'PUT Tester', email, password },
    }).then(() => {
      cy.request({
        method: 'POST', url: '/users/login', form: true,
        body: { email, password },
      }).then((loginRes) => {
        token = loginRes.body.data.token;
        cy.request({
          method: 'POST', url: '/notes',
          headers: { 'x-auth-token': token },
          form: true,
          body: { title: 'Original Title', description: 'Original desc', category: 'Home' },
        }).then((createRes) => {
          noteId = createRes.body.data.id;
        });
      });
    });
  });

  it('повинен оновити всі поля нотатки', () => {
    cy.request({
      method: 'PUT',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: {
        title: 'Updated Title',
        description: 'Updated description',
        category: 'Work',
        completed: true,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.title).to.eq('Updated Title');
      expect(res.body.data.description).to.eq('Updated description');
      expect(res.body.data.category).to.eq('Work');
      expect(res.body.data.completed).to.be.true;
    });
  });

  it('оновлені дані повинні зберегтись (GET після PUT)', () => {
    cy.request({
      method: 'PUT',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: {
        title: 'Persisted Title',
        description: 'Persisted desc',
        category: 'Personal',
        completed: false,
      },
    }).then(() => {
      cy.request({
        method: 'GET',
        url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
      }).then((getRes) => {
        expect(getRes.body.data.title).to.eq('Persisted Title');
        expect(getRes.body.data.category).to.eq('Personal');
      });
    });
  });

  it('повинен повернути 400 якщо completed відсутній', () => {
    cy.request({
      method: 'PUT',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: { title: 'No Completed', description: 'Test', category: 'Home' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
```

> **Техніки:** PUT — повне оновлення (всі поля обов'язкові). Перевірка persistence через GET після PUT — підтверджуємо реальне збереження в БД. Негативний тест без `completed` — перевіряє що PUT валідує всі поля.

---

## 11. Notes — Update Partial (PATCH)

**Файл:** `cypress/e2e/api/11-notes-patch.cy.js`

```javascript
describe('PATCH /notes/:id — Partial Update (completed status)', () => {
  let token;
  let noteId;

  before(() => {
    const email = `notes_patch_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'PATCH Tester', email, password },
    }).then(() => {
      cy.request({
        method: 'POST', url: '/users/login', form: true,
        body: { email, password },
      }).then((loginRes) => {
        token = loginRes.body.data.token;
        cy.request({
          method: 'POST', url: '/notes',
          headers: { 'x-auth-token': token },
          form: true,
          body: { title: 'Todo Item', description: 'Needs to be done', category: 'Work' },
        }).then((createRes) => {
          noteId = createRes.body.data.id;
        });
      });
    });
  });

  it('повинен позначити нотатку як виконану (completed: true)', () => {
    cy.request({
      method: 'PATCH',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: { completed: true },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.completed).to.be.true;
    });
  });

  it('повинен повернути нотатку з completed: true після PATCH', () => {
    cy.request({
      method: 'GET',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
    }).then((res) => {
      expect(res.body.data.completed).to.be.true;
    });
  });

  it('повинен скасувати виконання (completed: false)', () => {
    cy.request({
      method: 'PATCH',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: { completed: false },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.completed).to.be.false;
    });
  });

  it('PATCH не повинен змінювати title і description', () => {
    cy.request({
      method: 'PATCH',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: { completed: true },
    }).then((res) => {
      // Title і description залишаються незмінними
      expect(res.body.data.title).to.eq('Todo Item');
      expect(res.body.data.description).to.eq('Needs to be done');
    });
  });

  it('повинен повернути 400 без поля completed', () => {
    cy.request({
      method: 'PATCH',
      url: `/notes/${noteId}`,
      headers: { 'x-auth-token': token },
      form: true,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
```

> **Техніки:** PATCH — часткове оновлення, тільки поле `completed`. Перевіряємо що PATCH не перезаписує інші поля (title, description) — важливий тест ізоляції змін. Toggle тест: true → false → підтвердження.

---

## 12. Notes — Delete (DELETE)

**Файл:** `cypress/e2e/api/12-notes-delete.cy.js`

```javascript
describe('DELETE /notes/:id — Delete Note', () => {
  let token;

  before(() => {
    const email = `notes_delete_${Date.now()}@mailinator.com`;
    const password = 'Test@1234!';

    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'Delete Tester', email, password },
    }).then(() => {
      cy.request({
        method: 'POST', url: '/users/login', form: true,
        body: { email, password },
      }).then((res) => {
        token = res.body.data.token;
      });
    });
  });

  it('повинен видалити нотатку і повернути 200', () => {
    // Створюємо нотатку для видалення
    cy.request({
      method: 'POST', url: '/notes',
      headers: { 'x-auth-token': token },
      form: true,
      body: { title: 'To Delete', description: 'Will be deleted', category: 'Home' },
    }).then((createRes) => {
      const noteId = createRes.body.data.id;

      cy.request({
        method: 'DELETE',
        url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
      }).then((deleteRes) => {
        expect(deleteRes.status).to.eq(200);
        expect(deleteRes.body.success).to.be.true;
      });
    });
  });

  it('видалена нотатка повинна бути недоступна (GET після DELETE)', () => {
    cy.request({
      method: 'POST', url: '/notes',
      headers: { 'x-auth-token': token },
      form: true,
      body: { title: 'Gone Note', description: 'Will vanish', category: 'Work' },
    }).then((createRes) => {
      const noteId = createRes.body.data.id;

      cy.request({
        method: 'DELETE',
        url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
      }).then(() => {
        // Спробуємо отримати видалену нотатку
        cy.request({
          method: 'GET',
          url: `/notes/${noteId}`,
          headers: { 'x-auth-token': token },
          failOnStatusCode: false,
        }).then((getRes) => {
          expect(getRes.status).to.be.oneOf([400, 404]);
        });
      });
    });
  });

  it('повторне видалення повинно повернути помилку', () => {
    cy.request({
      method: 'POST', url: '/notes',
      headers: { 'x-auth-token': token },
      form: true,
      body: { title: 'Delete Twice', description: 'Test', category: 'Personal' },
    }).then((createRes) => {
      const noteId = createRes.body.data.id;

      cy.request({
        method: 'DELETE',
        url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
      }).then(() => {
        cy.request({
          method: 'DELETE',
          url: `/notes/${noteId}`,
          headers: { 'x-auth-token': token },
          failOnStatusCode: false,
        }).then((secondDelete) => {
          expect(secondDelete.status).to.be.oneOf([400, 404]);
        });
      });
    });
  });

  it('повинен повернути 401 при спробі видалити без токену', () => {
    cy.request({
      method: 'DELETE',
      url: '/notes/some-id',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
```

> **Техніки:** Create → Delete → GET — повний lifecycle тест видалення. Idempotency test: повторний DELETE повинен повертати помилку (нотатка вже видалена). Вкладені `.then()` — послідовні залежні запити.

---

## 13. Logout та Delete Account

**Файл:** `cypress/e2e/api/13-logout-delete-account.cy.js`

```javascript
describe('Logout та Delete Account', () => {
  describe('DELETE /users/logout', () => {
    it('повинен успішно розлогінитись і інвалідувати токен', () => {
      const email = `logout_${Date.now()}@mailinator.com`;
      const password = 'Test@1234!';

      cy.request({
        method: 'POST', url: '/users/register', form: true,
        body: { name: 'Logout Test', email, password },
      }).then(() => {
        cy.request({
          method: 'POST', url: '/users/login', form: true,
          body: { email, password },
        }).then((loginRes) => {
          const token = loginRes.body.data.token;

          // Логаут
          cy.request({
            method: 'DELETE',
            url: '/users/logout',
            headers: { 'x-auth-token': token },
          }).then((logoutRes) => {
            expect(logoutRes.status).to.eq(200);
            expect(logoutRes.body.success).to.be.true;
          });

          // Спроба використати токен після логауту
          cy.request({
            method: 'GET',
            url: '/users/profile',
            headers: { 'x-auth-token': token },
            failOnStatusCode: false,
          }).then((profileRes) => {
            expect(profileRes.status).to.eq(401);
          });
        });
      });
    });

    it('повинен повернути 401 при логауті без токену', () => {
      cy.request({
        method: 'DELETE',
        url: '/users/logout',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  describe('DELETE /users/delete-account', () => {
    it('повинен видалити акаунт і заблокувати логін', () => {
      const email = `delete_acc_${Date.now()}@mailinator.com`;
      const password = 'Test@1234!';

      cy.request({
        method: 'POST', url: '/users/register', form: true,
        body: { name: 'Account Deleter', email, password },
      }).then(() => {
        cy.request({
          method: 'POST', url: '/users/login', form: true,
          body: { email, password },
        }).then((loginRes) => {
          const token = loginRes.body.data.token;

          cy.request({
            method: 'DELETE',
            url: '/users/delete-account',
            headers: { 'x-auth-token': token },
          }).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
            expect(deleteRes.body.success).to.be.true;
          });

          // Спроба залогінитись після видалення акаунту
          cy.request({
            method: 'POST', url: '/users/login', form: true,
            body: { email, password },
            failOnStatusCode: false,
          }).then((loginAgain) => {
            expect(loginAgain.status).to.eq(401);
          });
        });
      });
    });
  });
});
```

> **Техніки:** Token invalidation test — після logout токен не повинен працювати. Account deletion flow — видалення акаунту → спроба логіну → 401. Повний lifecycle акаунту в одному тесті.

---

## 14. E2E Flow — повний сценарій

**Файл:** `cypress/e2e/api/14-e2e-flow.cy.js`

```javascript
describe('Full E2E API Flow', () => {
  // Повний сценарій: реєстрація → логін → CRUD нотаток → логаут.
  // Перевіряємо що всі операції працюють разом у реальному флоу.

  it('повний lifecycle: register → login → create notes → update → delete → logout', () => {
    const email = `e2e_flow_${Date.now()}@mailinator.com`;
    const password = 'E2E@Test123!';
    let token;
    let noteId;

    // 1. Реєстрація
    cy.request({
      method: 'POST', url: '/users/register', form: true,
      body: { name: 'E2E User', email, password },
    }).then((res) => {
      expect(res.status).to.eq(201);
      cy.log('✓ Реєстрація успішна');
    });

    // 2. Логін — отримуємо токен
    cy.request({
      method: 'POST', url: '/users/login', form: true,
      body: { email, password },
    }).then((res) => {
      expect(res.status).to.eq(200);
      token = res.body.data.token;
      cy.log('✓ Логін успішний, токен отримано');
    });

    // 3. Перевіряємо профіль
    cy.then(() => {
      cy.request({
        method: 'GET', url: '/users/profile',
        headers: { 'x-auth-token': token },
      }).then((res) => {
        expect(res.body.data.email).to.eq(email);
        cy.log('✓ Профіль отримано');
      });
    });

    // 4. Створюємо нотатку
    cy.then(() => {
      cy.request({
        method: 'POST', url: '/notes',
        headers: { 'x-auth-token': token },
        form: true,
        body: { title: 'E2E Note', description: 'Full flow test', category: 'Work' },
      }).then((res) => {
        expect(res.status).to.eq(200);
        noteId = res.body.data.id;
        cy.log(`✓ Нотатка створена, ID: ${noteId}`);
      });
    });

    // 5. Оновлюємо completed статус
    cy.then(() => {
      cy.request({
        method: 'PATCH', url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
        form: true,
        body: { completed: true },
      }).then((res) => {
        expect(res.body.data.completed).to.be.true;
        cy.log('✓ Нотатка позначена як виконана');
      });
    });

    // 6. Перевіряємо список нотаток
    cy.then(() => {
      cy.request({
        method: 'GET', url: '/notes',
        headers: { 'x-auth-token': token },
      }).then((res) => {
        expect(res.body.data).to.be.an('array');
        const found = res.body.data.find((n) => n.id === noteId);
        expect(found).to.exist;
        expect(found.completed).to.be.true;
        cy.log('✓ Нотатка знайдена в списку');
      });
    });

    // 7. Видаляємо нотатку
    cy.then(() => {
      cy.request({
        method: 'DELETE', url: `/notes/${noteId}`,
        headers: { 'x-auth-token': token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        cy.log('✓ Нотатка видалена');
      });
    });

    // 8. Логаут
    cy.then(() => {
      cy.request({
        method: 'DELETE', url: '/users/logout',
        headers: { 'x-auth-token': token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        cy.log('✓ Логаут успішний');
      });
    });
  });
});
```

> **Техніки:** `cy.then()` між запитами — гарантує послідовне виконання коли кожен крок залежить від попереднього. `cy.log()` — вивід кастомних повідомлень у Cypress GUI. `.find()` на масиві відповіді — пошук конкретного об'єкту за умовою.

---

## Запуск

```bash
# Всі API тести
npx cypress run --spec "cypress/e2e/api/**"

# Конкретний файл
npx cypress run --spec "cypress/e2e/api/14-e2e-flow.cy.js"

# З репортером
npx cypress run --spec "cypress/e2e/api/**" --reporter mochawesome
```

---

## API Endpoints — довідка

| Метод | Endpoint | Auth | Опис |
|-------|----------|------|------|
| GET | `/health-check` | — | Перевірка статусу API |
| POST | `/users/register` | — | Реєстрація |
| POST | `/users/login` | — | Логін, отримання токену |
| GET | `/users/profile` | ✓ | Профіль юзера |
| PATCH | `/users/profile` | ✓ | Оновлення профілю |
| POST | `/users/change-password` | ✓ | Зміна пароля |
| POST | `/users/forgot-password` | — | Запит скидання пароля |
| DELETE | `/users/logout` | ✓ | Логаут |
| DELETE | `/users/delete-account` | ✓ | Видалення акаунту |
| POST | `/notes` | ✓ | Створити нотатку |
| GET | `/notes` | ✓ | Всі нотатки |
| GET | `/notes/:id` | ✓ | Нотатка за ID |
| PUT | `/notes/:id` | ✓ | Повне оновлення |
| PATCH | `/notes/:id` | ✓ | Оновити `completed` |
| DELETE | `/notes/:id` | ✓ | Видалити нотатку |

---

## Related Notes

- [[API Testing with Cypress]] — загальний гайд API тестування в Cypress
- [[API Testing Overview]] — теорія API тестування
- [[UI Practice Examples]] — UI тести для того ж сайту
- [[Cypress Guide]] — повний Cypress гайд

---

*API документація: https://practice.expandtesting.com/notes/api/api-docs/*
*Base URL: https://practice.expandtesting.com/notes/api*
