# BDD and Cucumber

> Behavior Driven Development: Gherkin сценарії, Cucumber.js, Step Definitions.

#bdd #cucumber #gherkin #automation #testing

---

## Overview

**BDD (Behavior Driven Development)** — підхід до розробки, де вимоги пишуться зрозумілою всім мовою: і бізнесу, і розробникам, і тестувальникам.

**Cucumber** — найпопулярніший BDD-фреймворк. Читає Gherkin-сценарії та виконує їх як автотести.

---

## Why BDD

| Проблема без BDD | Рішення з BDD |
|-----------------|--------------|
| Бізнес пише вимоги своєю мовою | Спільна мова (Gherkin) |
| Розробники не розуміють бізнес-контекст | Сценарії описують поведінку |
| Тести відірвані від вимог | Тести = вимоги |
| Складно ставити пріоритети | Фічі = бізнес-цінності |

---

## BDD Flow

```
Business Need (Бізнес-потреба)
        ↓
User Story (Epics → Stories)
        ↓
Feature + Scenarios (Gherkin)
        ↓
Step Definitions (Code)
        ↓
Test Execution
        ↓
Living Documentation (Звіт = Документація)
```

---

## Setup

### Installation (Node.js)

```bash
mkdir cucumber-tests && cd cucumber-tests
npm init --yes
npm install --save-dev @cucumber/cucumber

# Структура папок
mkdir -p features/step_definitions
```

### package.json

```json
{
  "scripts": {
    "test": "cucumber-js",
    "test:smoke": "cucumber-js --tags '@smoke'",
    "test:regression": "cucumber-js --tags '@regression'"
  }
}
```

### cucumber.js (конфіг)

```javascript
// cucumber.js
module.exports = {
  default: [
    '--format-options \'{"snippetInterface": "synchronous"}\'',
    '--format html:reports/cucumber-report.html',
    '--publish-quiet'
  ].join(' ')
}
```

---

## Examples

### Feature File

```gherkin
# features/login.feature

@login @regression
Feature: User Authentication

  Background:
    Given the user is on the login page

  @smoke
  Scenario: Successful login with valid credentials
    When the user enters email "user@test.com" and password "password123"
    And clicks the submit button
    Then the user should be redirected to the dashboard
    And a welcome message should be visible

  Scenario: Failed login with invalid password
    When the user enters email "user@test.com" and password "wrongpass"
    And clicks the submit button
    Then an error message "Invalid credentials" should be displayed

  @smoke
  Scenario Outline: Login with different user roles
    When the user enters email "<email>" and password "<password>"
    And clicks the submit button
    Then the user should be redirected to "<dashboard>"

    Examples:
      | email              | password  | dashboard       |
      | admin@test.com     | admin123  | /admin          |
      | user@test.com      | user123   | /dashboard      |
      | manager@test.com   | mgr123    | /manager-panel  |
```

### Step Definitions (JavaScript)

```javascript
// features/step_definitions/login.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Симульований стан (у реальних тестах — Cypress/Playwright)
let currentPage = '';
let isLoggedIn = false;
let errorMessage = '';
let currentUser = null;

Given('the user is on the login page', function () {
  currentPage = '/login';
  // cy.visit('/login');  // у Cypress тестах
});

When('the user enters email {string} and password {string}', function (email, password) {
  // cy.get('[data-cy="email"]').type(email);
  // cy.get('[data-cy="password"]').type(password);
  this.email = email;
  this.password = password;
});

When('clicks the submit button', function () {
  // cy.get('[data-cy="submit"]').click();
  if (this.email === 'user@test.com' && this.password === 'password123') {
    isLoggedIn = true;
    currentPage = '/dashboard';
  } else {
    isLoggedIn = false;
    errorMessage = 'Invalid credentials';
  }
});

Then('the user should be redirected to the dashboard', function () {
  assert.strictEqual(currentPage, '/dashboard');
  // cy.url().should('include', '/dashboard');
});

Then('a welcome message should be visible', function () {
  // cy.get('[data-cy="welcome-msg"]').should('be.visible');
  assert.ok(isLoggedIn, 'User should be logged in');
});

Then('an error message {string} should be displayed', function (expectedMessage) {
  assert.strictEqual(errorMessage, expectedMessage);
  // cy.get('[data-cy="error"]').should('contain', expectedMessage);
});

Then('the user should be redirected to {string}', function (path) {
  assert.ok(currentPage.includes(path) || isLoggedIn);
  // cy.url().should('include', path);
});
```

### Shopping Cart with Data Tables

```gherkin
# features/cart.feature
Feature: Shopping Cart

  Scenario: Calculate total with multiple items
    Given the following products are added to the cart:
      | Product    | Price | Quantity |
      | Laptop     | 1000  | 1        |
      | Headphones | 100   | 2        |
      | Mouse      | 25    | 3        |
    When I calculate the total
    Then the total should be 1275

  Scenario: Apply discount coupon
    Given the cart total is 500
    When I apply coupon "SAVE20"
    Then the total should be 400
```

```javascript
// features/step_definitions/cart.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

let cartItems = [];
let cartTotal = 0;

Given('the following products are added to the cart:', function (dataTable) {
  // dataTable.hashes() → [{Product: 'Laptop', Price: '1000', Quantity: '1'}, ...]
  cartItems = dataTable.hashes();
});

When('I calculate the total', function () {
  cartTotal = cartItems.reduce((total, item) => {
    return total + parseInt(item.Price) * parseInt(item.Quantity);
  }, 0);
});

Then('the total should be {int}', function (expected) {
  assert.strictEqual(cartTotal, expected);
});

Given('the cart total is {int}', function (total) {
  cartTotal = total;
});

When('I apply coupon {string}', function (coupon) {
  if (coupon === 'SAVE20') {
    cartTotal = cartTotal * 0.8;  // 20% знижка
  }
});
```

### Is It Friday? (Classic Example)

```gherkin
# features/is_it_friday.feature
Feature: Is it Friday yet?
  Everyone wants to know when it's Friday!

  Scenario Outline: Today is or is not Friday
    Given today is "<day>"
    When I ask whether it's Friday yet
    Then I should be told "<answer>"

    Examples:
      | day            | answer |
      | Friday         | TGIF   |
      | Monday         | Nope   |
      | Sunday         | Nope   |
      | anything else! | Nope   |
```

```javascript
// features/step_definitions/friday.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

function isItFriday(day) {
  return day === 'Friday' ? 'TGIF' : 'Nope';
}

Given('today is {string}', function (day) {
  this.today = day;    // `this` = World (спільний контекст сценарію)
});

When("I ask whether it's Friday yet", function () {
  this.answer = isItFriday(this.today);
});

Then('I should be told {string}', function (expected) {
  assert.strictEqual(this.answer, expected);
});
```

---

## Gherkin Syntax

### Keywords Reference

| Ключове слово | Призначення |
|---------------|-------------|
| `Feature` | Назва функціональності |
| `Background` | Кроки перед кожним сценарієм |
| `Scenario` | Один тестовий сценарій |
| `Scenario Outline` | Параметризований сценарій |
| `Examples` | Таблиця даних для Outline |
| `Given` | Передумова (стан) |
| `When` | Дія користувача |
| `Then` | Очікуваний результат |
| `And` / `But` | Додаткові кроки |
| `@tag` | Тег для фільтрації |
| `#` | Коментар |

### Step Parameters

| Параметр | Тип | Приклад у Gherkin |
|----------|-----|------------------|
| `{string}` | Рядок у подвійних лапках | `"hello world"` |
| `{int}` | Ціле число | `42` |
| `{float}` | Число з комою | `3.14` |
| `{word}` | Одне слово без пробілів | `admin` |

---

## Tagging Strategy

```gherkin
@smoke                    ← 10-20 критичних тестів
@regression              ← весь набір
@api                     ← API тести
@ui                      ← UI тести
@slow                    ← тести що довго виконуються
@skip                    ← тимчасово вимкнені
@wip                     ← в розробці (Work In Progress)
```

```bash
# Запуск за тегами
npx cucumber-js --tags '@smoke'
npx cucumber-js --tags '@regression and not @slow'
npx cucumber-js --tags '@api or @ui'
npx cucumber-js --tags 'not @skip'
npx cucumber-js features/login.feature  # конкретний файл
```

---

## Best Practices

### Хороший Gherkin

```gherkin
# ✅ Добре: описує поведінку
Scenario: User sees balance after login
  Given I am logged in as a bank customer
  When I navigate to the accounts page
  Then I should see the balance for each account

# ❌ Погано: описує UI деталі
Scenario: User clicks button
  Given I am on /login page
  When I type "user@test.com" in input with id "email"
  And I click button with class "btn-primary"
  Then I see element with class "dashboard-title"
```

### Правила

1. **Given**: стан, а не дія — `Given I am logged in` (не `Given I log in`)
2. **When**: одна дія — `When I click Submit`
3. **Then**: перевіряємо результат — `Then I see the dashboard`
4. **And**: замість дублювання Given/When/Then
5. **Один Then** = один перевірений результат
6. **Background**: спільні кроки для всіх сценаріїв фічі
7. **Scenario Outline**: для тестування з різними даними

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `Undefined step` | Немає step definition | Cucumber виводить шаблон — копіюй |
| `Ambiguous step` | Кілька step definition підходять | Конкретизуй regex/text |
| `World context lost` | Не використовуєш `this` | Зберігай стан у `this.variable` |
| `Background runs too much` | Один фіч = один Background | Розбий на кілька фіч |
| Технічні деталі у Gherkin | Порушення BDD | Описуй поведінку, не UI |

---

## Checklists

### BDD / Cucumber — якісний сценарій

- [ ] Назва Feature/Scenario зрозуміла бізнес-аналітику без технічних знань
- [ ] Кроки описують **поведінку**, а не UI-реалізацію
- [ ] Без технічних деталей у Gherkin (ID, CSS-класи, XPath, URL)
- [ ] Один `Then` = один перевірений результат
- [ ] Використано `And`/`But` для уникнення повторів Given/When/Then
- [ ] `Background` використовується для спільних передумов
- [ ] `Scenario Outline` + `Examples` для тестів з різними даними
- [ ] Теги для класифікації (`@smoke`, `@regression`, `@skip`, `@wip`)

### BDD / Cucumber — структура проєкту

- [ ] Папка `features/` створена у корені проєкту
- [ ] Step definitions у `features/step_definitions/`
- [ ] Конфіг `cucumber.js` у корені проєкту
- [ ] Скрипт `npm test` запускає `cucumber-js`
- [ ] `@cucumber/cucumber` у `devDependencies` у `package.json`
- [ ] Step definitions перевикористовуються між різними `.feature` файлами
- [ ] `.gitignore` містить `node_modules`

---

## Related Notes

- [[Gherkin Syntax]] — повний синтаксис Gherkin
- [[Cypress Guide]] — Cypress + Cucumber
- [[Page Object Pattern]] — POP + BDD
- [[CI-CD Overview]] — BDD у CI/CD
- [[Cucumber Cheatsheet]] — швидка шпаргалка
- [[Automation Testing Index]] — головна сторінка
