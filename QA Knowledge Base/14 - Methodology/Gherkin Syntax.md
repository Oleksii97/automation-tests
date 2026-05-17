# Gherkin Syntax

> Повний довідник по синтаксису Gherkin: ключові слова, параметри, структура.

#bdd #gherkin #cucumber #testing

---

## Overview

**Gherkin** — мова для опису поведінки застосунку у вигляді сценаріїв, зрозумілих усім учасникам команди. Не є мовою програмування — це структурований природній текст.

---

## Structure

```
Feature: [Назва функціональності]
  [Опис (необов'язково)]

  Background:        ← виконується перед кожним Scenario
    Given [умова]

  @tag
  Scenario: [Назва сценарію]
    Given [передумова]
    When [дія]
    Then [результат]
    And [додатковий результат]
    But [виняток]

  Scenario Outline: [Параметризований сценарій]
    Given [<параметр>]
    When [...]
    Then [<результат>]

    Examples:
      | параметр | результат |
      | value1   | result1   |
      | value2   | result2   |
```

---

## Keywords

### Feature

Найвищий рівень організації — відповідає одній функціональності або модулю застосунку.

```gherkin
Feature: User Authentication
  As a registered user
  I want to be able to login
  So that I can access my account
```

### Background

Кроки, які виконуються **перед кожним** Scenario у фічі. Замінює `beforeEach`.

```gherkin
Feature: Shopping Cart

  Background:
    Given the user is logged in as "user@test.com"
    And the cart is empty

  Scenario: Add item to cart
    When I add "Laptop" to the cart
    Then the cart should contain 1 item

  Scenario: Remove item from cart
    Given the cart contains "Laptop"
    When I remove "Laptop" from the cart
    Then the cart should be empty
```

> ⚠️ Лише один Background на Feature. Різні передумови → різні Feature файли.

### Scenario

Один тестовий сценарій. Кожен Scenario незалежний.

```gherkin
Scenario: Successful login
  Given I am on the login page
  When I enter valid credentials
  Then I should be redirected to dashboard
```

### Scenario Outline (Template)

Параметризований сценарій — запускається для кожного рядка Examples.

```gherkin
Scenario Outline: Login with different roles
  Given I am on the login page
  When I login as "<role>" with password "<password>"
  Then I should see the "<page>" dashboard

  Examples:
    | role    | password | page    |
    | admin   | admin123 | admin   |
    | user    | user123  | user    |
    | manager | mgr123   | manager |
```

*Запуститься 3 рази — по одному для кожного рядка.*

---

## Step Keywords

### Given (Передумова)

Описує **стан системи** до початку дії. Не дія — стан.

```gherkin
Given I am logged in as an admin
Given the database contains 5 users
Given today is "2026-05-16"
```

### When (Дія)

Описує **дію користувача** або зовнішню подію.

```gherkin
When I click "Submit"
When the user enters email "user@test.com"
When 3 minutes pass
```

### Then (Результат)

Описує **очікуваний результат** після дії. Тут validation.

```gherkin
Then I should see "Login successful"
Then the order status should be "Confirmed"
Then an email should be sent to "user@test.com"
```

### And (Продовження)

Замінює повторення Given/When/Then для кращої читабельності.

```gherkin
# Без And (погано):
Given I have 3 items in cart
Given I have a promo code "SAVE10"
When I click "Checkout"
When I enter payment details
Then the total should be discounted
Then a confirmation email should be sent

# З And (добре):
Given I have 3 items in cart
And I have a promo code "SAVE10"
When I click "Checkout"
And I enter payment details
Then the total should be discounted
And a confirmation email should be sent
```

### But (Виняток)

Семантично аналогічний `And`, але позначає виняток або протилежне.

```gherkin
Then I should see the products page
But I should not see any error messages
But the cart counter should remain at 0
```

---

## Parameters in Steps

### String Parameter

```gherkin
When I enter email "user@test.com"
Then I should see the message "Login successful"
```

```javascript
When('I enter email {string}', function (email) {
  // email = 'user@test.com'
});
```

### Integer Parameter

```gherkin
Given there are 5 items in the cart
When I remove 2 items
Then I should have 3 items
```

```javascript
Given('there are {int} items in the cart', function (count) {
  // count = 5 (number, not string)
});
```

### Float Parameter

```gherkin
Given the product price is 29.99
Then the total should be 59.98
```

```javascript
Given('the product price is {float}', function (price) {
  // price = 29.99
});
```

### Word Parameter (no quotes, single word)

```gherkin
Given I am logged in as admin
```

```javascript
Given('I am logged in as {word}', function (role) {
  // role = 'admin'
});
```

---

## Special Syntax

### Tags

```gherkin
@smoke @regression
Feature: Authentication

  @positive
  Scenario: Successful login

  @negative @wip
  Scenario: Invalid credentials

  @skip
  Scenario: Deprecated test
```

```bash
# Запуск за тегами
cucumber-js --tags '@smoke'
cucumber-js --tags '@smoke and @positive'
cucumber-js --tags '@regression or @smoke'
cucumber-js --tags 'not @skip'
cucumber-js --tags '@smoke and not @wip'
```

### Multiline Text (Doc Strings)

```gherkin
Given the user enters the following address:
  """
  John Doe
  123 Main Street
  New York, NY 10001
  USA
  """
```

```javascript
Given('the user enters the following address:', function (docString) {
  // docString = "John Doe\n123 Main Street\nNew York, NY 10001\nUSA"
  console.log(docString);
});
```

### Data Tables

```gherkin
Given the following users exist:
  | name    | email           | role  |
  | Alice   | alice@test.com  | admin |
  | Bob     | bob@test.com    | user  |
  | Charlie | charlie@test.com| user  |
```

```javascript
Given('the following users exist:', function (dataTable) {
  const users = dataTable.hashes();
  // users = [
  //   { name: 'Alice', email: 'alice@test.com', role: 'admin' },
  //   { name: 'Bob', email: 'bob@test.com', role: 'user' },
  //   ...
  // ]

  // Альтернатива: dataTable.rows() → масив масивів (без заголовків)
  // Альтернатива: dataTable.rawTable → включаючи рядок заголовків
});
```

### Comments

```gherkin
# Це коментар — буде проігнорований Cucumber

Feature: Login
  # Цей сценарій тестує позитивний кейс
  Scenario: Successful login
    Given I am on login page  # інлайн коментар
```

---

## Internationalization

Gherkin підтримує 70+ мов:

```gherkin
# language: uk
Функціональність: Автентифікація

  Сценарій: Успішний вхід
    Припустимо я на сторінці логіну
    Коли я вводжу правильні дані
    Тоді я маю побачити дашборд
```

```gherkin
# language: de
Funktionalität: Anmeldung

  Szenario: Erfolgreiche Anmeldung
    Gegeben ich bin auf der Login-Seite
    Wenn ich gültige Zugangsdaten eingebe
    Dann sollte ich zum Dashboard weitergeleitet werden
```

---

## Best Practices

### Хороший Gherkin:

```gherkin
# ✅ Описує поведінку, незалежно від UI
Scenario: User receives confirmation after purchase
  Given I have completed the checkout
  When I submit the order
  Then I should receive a confirmation email
  And the order status should be "Processing"
```

### Поганий Gherkin:

```gherkin
# ❌ Прив'язаний до UI деталей
Scenario: Click button
  Given I am on /checkout page
  When I click button with id "btn-submit-order"
  And I wait 3 seconds
  Then I see div with class "success-banner"
```

### Правила:

1. **Given** — стан, не дія
2. **When** — одна дія
3. **Then** — перевірка результату
4. **Жодних технічних деталей** (ID, класи) у Gherkin
5. **Один Then** = один перевірений результат
6. **Убiquitous Language** — використовуй терміни бізнесу
7. **Background** лише для справді спільних умов

---

## Related Notes

- [[BDD and Cucumber]] — BDD підхід та Cucumber.js
- [[Cucumber Cheatsheet]] — швидка шпаргалка
- [[Page Object Pattern]] — POP + BDD
- [[Automation Testing Index]] — головна сторінка
