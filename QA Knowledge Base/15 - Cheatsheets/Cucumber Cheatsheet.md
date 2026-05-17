# Cucumber Cheatsheet

> Швидка шпаргалка по Cucumber.js: Gherkin, Step Definitions, теги, параметри.

#cucumber #bdd #gherkin #cheatsheet #testing

---

## Installation

```bash
npm init --yes
npm install --save-dev @cucumber/cucumber
```

### package.json

```json
{
  "scripts": {
    "test": "cucumber-js",
    "test:smoke": "cucumber-js --tags '@smoke'"
  }
}
```

---

## Project Structure

```
project/
├── features/
│   ├── login.feature
│   ├── cart.feature
│   └── step_definitions/
│       ├── login.steps.js
│       └── cart.steps.js
├── cucumber.js
└── package.json
```

### cucumber.js (config)

```javascript
module.exports = {
  default: [
    '--format html:reports/cucumber-report.html',
    '--publish-quiet'
  ].join(' ')
};
```

---

## Gherkin Structure

```gherkin
@tag1 @tag2
Feature: Feature Name

  Background:
    Given common precondition

  @tag3
  Scenario: Test name
    Given [state]
    When [action]
    Then [result]
    And [additional]
    But [exception]

  Scenario Outline: Parameterized test
    Given I have <count> items
    When I buy <buy> items
    Then I have <remaining> items

    Examples:
      | count | buy | remaining |
      |    10 |   3 |         7 |
      |    20 |   5 |        15 |
```

---

## Step Definitions

```javascript
const { Given, When, Then, Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const assert = require('assert');

// Hooks
BeforeAll(async function () { /* before all scenarios */ });
Before(async function () { /* before each scenario */ });
After(async function () { /* after each scenario */ });
AfterAll(async function () { /* after all */ });

// Tagged hooks
Before({ tags: '@smoke' }, async function () { /* only for @smoke */ });

// Steps
Given('user is on {string} page', function (page) {
  // this = World (shared context в межах одного Scenario)
  this.page = page;
});

When('user enters email {string}', function (email) {
  this.email = email;
});

Then('user should see {string} message', function (message) {
  assert.strictEqual(this.actualMessage, message);
});

// World context
this.someValue = 'test';   // зберігати між кроками
const value = this.someValue; // читати
```

---

## Step Parameters

| Параметр | Тип | Gherkin приклад |
|----------|-----|----------------|
| `{string}` | String (в `"..."`) | `"hello world"` |
| `{int}` | Integer | `42` |
| `{float}` | Float | `3.14` |
| `{word}` | Single word | `admin` |

```gherkin
Given I have {int} cukes and {float} price
Given I am logged in as {word}
Given the message is {string}
```

---

## Data Tables

```gherkin
Given the following users exist:
  | name  | email          | role  |
  | Alice | alice@test.com | admin |
  | Bob   | bob@test.com   | user  |
```

```javascript
Given('the following users exist:', function (dataTable) {
  // hashes() → [{ name: 'Alice', email: '...', role: 'admin' }, ...]
  const users = dataTable.hashes();

  // rows() → array without header
  const rows = dataTable.rows();

  // rawTable → all rows including header
  const all = dataTable.rawTable;
});
```

---

## Multiline Text (Doc Strings)

```gherkin
Given I have this JSON payload:
  """
  {
    "name": "Alice",
    "role": "admin"
  }
  """
```

```javascript
Given('I have this JSON payload:', function (docString) {
  this.payload = JSON.parse(docString);
});
```

---

## Tags

```gherkin
@smoke @regression
Feature: Auth

  @positive
  Scenario: Valid login

  @negative @slow
  Scenario: Invalid credentials

  @skip
  Scenario: WIP test
```

```bash
# Запуск за тегами
cucumber-js --tags '@smoke'
cucumber-js --tags '@smoke and @positive'
cucumber-js --tags 'not @skip'
cucumber-js --tags '@smoke or @regression'

# Конкретний файл
cucumber-js features/login.feature

# Конкретний сценарій
cucumber-js features/login.feature:15
```

---

## Scenario Outline

```gherkin
Scenario Outline: Login as <role>
  Given I am on the login page
  When I login with "<email>" and "<password>"
  Then I should see the "<dashboard>" page

  Examples:
    | role    | email           | password | dashboard |
    | admin   | admin@test.com  | admin123 | admin     |
    | user    | user@test.com   | user123  | home      |
```

---

## Background

```gherkin
Feature: Shopping Cart

  Background:
    Given I am logged in          # перед КОЖНИМ сценарієм
    And my cart is empty

  Scenario: Add item
    When I add "Laptop"
    Then cart has 1 item

  Scenario: Remove item
    Given cart has "Laptop"
    When I remove "Laptop"
    Then cart is empty
```

---

## Tags in package.json

```json
{
  "scripts": {
    "test": "cucumber-js",
    "test:smoke": "cucumber-js --tags '@smoke'",
    "test:regression": "cucumber-js --tags '@regression'",
    "test:api": "cucumber-js --tags '@api'",
    "test:no-skip": "cucumber-js --tags 'not @skip'"
  }
}
```

---

## Common Errors

| Помилка | Причина | Рішення |
|---------|---------|---------|
| Undefined step | Немає step definition | Cucumber виведе шаблон — копіюй його |
| Ambiguous step | Кілька definitions підходять | Конкретизуй pattern |
| World context lost | Не через `this` | Використовуй `this.var = x` |
| Cannot find module | Неправильний шлях | Перевір `require()` шляхи |
| YAML indent error | (не YAML, але) Пробіли у .feature | Перевір відступи |

---

## Related Notes

- [[BDD and Cucumber]] — повний гайд
- [[Gherkin Syntax]] — синтаксис Gherkin
- [[Page Object Pattern]] — POP + BDD
- [[CI-CD Overview]] — Cucumber у CI
