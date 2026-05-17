# Page Object Pattern

> Page Object Model (POM): архітектурний патерн для організації тестового коду.

#automation #testing #patterns #cypress #selenium #playwright

---

## Overview

**Page Object Pattern (POP / POM)** — архітектурний патерн у тест-автоматизації. Код для роботи з кожною сторінкою виноситься у окремий клас (Page Object). Тести взаємодіють лише з методами класу, а не напряму з селекторами.

**Принципи:**
- **Single Responsibility** — один клас = одна сторінка
- **Encapsulation** — селектори ховаються всередині класу
- **DRY** — Don't Repeat Yourself
- **Abstraction** — тест не знає деталей реалізації

---

## Why Use Page Objects

### Without POP (погано)

```javascript
// test1.cy.js
it('login test', () => {
  cy.visit('/login');
  cy.get('#user_email').type('user@test.com');
  cy.get('#user_password').type('123456');
  cy.get("[type='submit']").click();
});

// test2.cy.js (дублювання!)
it('another login test', () => {
  cy.visit('/login');
  cy.get('#user_email').type('admin@test.com');  // той самий код!
  cy.get('#user_password').type('admin');
  cy.get("[type='submit']").click();
});
```

**Проблема**: якщо змінився selector `#user_email` на `#email` — треба правити в 50 місцях.

### With POP (добре)

```javascript
// pages/LoginPage.js — один раз
// Тести використовують LoginPage.login()
// При зміні верстки правиш лише LoginPage.js
```

---

## Implementation in Cypress

### Project Structure

```
cypress/
├── e2e/
│   ├── auth/
│   │   └── login.cy.js
│   └── products/
│       └── catalog.cy.js
├── pages/
│   ├── BasePage.js         ← спільні методи
│   ├── LoginPage.js
│   ├── HomePage.js
│   ├── ProductPage.js
│   └── CartPage.js
├── fixtures/
│   └── users.json
└── support/
    └── commands.js
```

### Base Page (Shared Methods)

```javascript
// cypress/pages/BasePage.js
export class BasePage {
  // Спільні методи для всіх сторінок

  getHeader() {
    return cy.get('[data-cy="header"]');
  }

  getNavItem(name) {
    return cy.get('[data-cy="nav"]').contains(name);
  }

  openMenu(name) {
    this.getNavItem(name).click();
    return this;
  }

  shouldBeOnPage(path) {
    cy.url().should('include', path);
    return this;
  }

  waitForPageLoad() {
    cy.get('[data-cy="page-loader"]').should('not.exist');
    return this;
  }
}
```

### Login Page

```javascript
// cypress/pages/LoginPage.js
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Селектори — в одному місці
  selectors = {
    emailInput: '[data-cy="email"]',
    passwordInput: '[data-cy="password"]',
    submitBtn: '[data-cy="submit"]',
    errorMsg: '[data-cy="error-message"]',
    forgotPasswordLink: '[data-cy="forgot-password"]'
  };

  // Навігація
  navigate() {
    cy.visit('/login');
    return this;  // для chaining
  }

  // Дії
  fillEmail(email) {
    cy.get(this.selectors.emailInput).clear().type(email);
    return this;
  }

  fillPassword(password) {
    cy.get(this.selectors.passwordInput).clear().type(password);
    return this;
  }

  submit() {
    cy.get(this.selectors.submitBtn).click();
    return this;
  }

  clickForgotPassword() {
    cy.get(this.selectors.forgotPasswordLink).click();
    return this;
  }

  // Комбінований метод
  login(email, password) {
    return this
      .fillEmail(email)
      .fillPassword(password)
      .submit();
  }

  // Assertions (повернення this для chaining)
  shouldShowForm() {
    cy.get(this.selectors.emailInput).should('be.visible');
    cy.get(this.selectors.passwordInput).should('be.visible');
    cy.get(this.selectors.submitBtn).should('be.visible');
    return this;
  }

  shouldShowError(message) {
    cy.get(this.selectors.errorMsg)
      .should('be.visible')
      .and('contain', message);
    return this;
  }

  shouldNotShowError() {
    cy.get(this.selectors.errorMsg).should('not.exist');
    return this;
  }
}
```

### Product Page

```javascript
// cypress/pages/ProductPage.js
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  selectors = {
    productCard: '[data-cy="product-card"]',
    productTitle: '[data-cy="product-title"]',
    addToCartBtn: '[data-cy="add-to-cart"]',
    cartCounter: '[data-cy="cart-count"]',
    filterDropdown: '[data-cy="filter"]'
  };

  navigate() {
    cy.visit('/products');
    return this;
  }

  getProductCards() {
    return cy.get(this.selectors.productCard);
  }

  addFirstProductToCart() {
    cy.get(this.selectors.productCard)
      .first()
      .find(this.selectors.addToCartBtn)
      .click();
    return this;
  }

  filterBy(category) {
    cy.get(this.selectors.filterDropdown).select(category);
    return this;
  }

  shouldHaveProductCount(count) {
    cy.get(this.selectors.productCard).should('have.length', count);
    return this;
  }

  shouldShowCartCount(count) {
    cy.get(this.selectors.cartCounter).should('have.text', String(count));
    return this;
  }
}
```

### Using in Tests

```javascript
// cypress/e2e/auth/login.cy.js
import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Login Tests', () => {
  beforeEach(() => {
    loginPage.navigate();
  });

  it('should display login form', () => {
    loginPage.shouldShowForm();
  });

  it('should login with valid credentials', () => {
    loginPage
      .login('user@test.com', 'password123');

    // Після логіну перевіряємо редирект
    cy.url().should('include', '/dashboard');
  });

  it('should show error on invalid credentials', () => {
    loginPage
      .login('wrong@test.com', 'wrongpass')
      .shouldShowError('Invalid credentials');
  });

  it('full user journey: login → browse → add to cart', () => {
    // Можна використовувати кілька Page Objects у одному тесті
    const { ProductPage } = require('../../pages/ProductPage');
    const productPage = new ProductPage();

    loginPage.login('user@test.com', 'password123');
    productPage.navigate();
    productPage.addFirstProductToCart();
    productPage.shouldShowCartCount(1);
  });
});
```

---

## Implementation in Playwright

```javascript
// pages/LoginPage.js (Playwright)
class LoginPage {
  constructor(page) {
    this.page = page;
    // Locators визначаються у конструкторі
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.submitBtn = page.locator('[data-testid="submit"]');
    this.errorMsg = page.locator('[data-testid="error"]');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async shouldShowError(message) {
    await expect(this.errorMsg).toBeVisible();
    await expect(this.errorMsg).toContainText(message);
  }
}

module.exports = { LoginPage };
```

---

## Implementation in Selenium (Python)

```python
# pages/login_page.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    URL = "/login"
    
    # Локатори як константи класу
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    SUBMIT_BTN = (By.CSS_SELECTOR, "[data-testid='submit']")
    ERROR_MSG = (By.CSS_SELECTOR, ".error-message")

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def navigate(self):
        self.driver.get(f"{self.base_url}{self.URL}")

    def fill_email(self, email):
        field = self.wait.until(EC.presence_of_element_located(self.EMAIL_INPUT))
        field.clear()
        field.send_keys(email)

    def fill_password(self, password):
        field = self.driver.find_element(*self.PASSWORD_INPUT)
        field.clear()
        field.send_keys(password)

    def submit(self):
        self.driver.find_element(*self.SUBMIT_BTN).click()

    def login(self, email, password):
        self.fill_email(email)
        self.fill_password(password)
        self.submit()

    def get_error_message(self):
        element = self.wait.until(EC.visibility_of_element_located(self.ERROR_MSG))
        return element.text
```

---

## Best Practices

### DO:

- ✅ Назви методів описують **дії**: `login()`, `addToCart()`, `submit()`
- ✅ Назви assertions починаються з `should`: `shouldShowError()`, `shouldBeVisible()`
- ✅ Повертай `this` або page object для method chaining
- ✅ Зберігай усі локатори у одному місці (selectors об'єкт або клас константи)
- ✅ Один Page Object = одна сторінка/компонент
- ✅ Базовий клас для shared методів (header, footer, nav)

### DON'T:

- ❌ **Не клади assertions у «дієві» методи** — `login()` не повинен мати `should`
- ❌ **Не дублюй бізнес-логіку** між Page Objects
- ❌ **Не роби занадто «розумні» Page Objects** — вони мають бути тонкими
- ❌ **Не хардкодь тестові дані** у Page Objects — передавай через параметри

---

## Common Errors

| Помилка | Проблема | Рішення |
|---------|---------|---------|
| `login()` містить assert | Порушення SRP | Розділи: `login()` + `shouldBeLoggedIn()` |
| Дублювання методів між PO | Порушення DRY | Базовий клас |
| Надто великий Page Object | Порушення SRP | Розбий на компоненти |
| Селектор у тест-файлі | Порушення інкапсуляції | Перенеси у Page Object |

---

## Related Notes

- [[Cypress Guide]] — Cypress + POP
- [[Playwright Guide]] — Playwright + POM
- [[Selenium Guide]] — Selenium + POM
- [[BDD and Cucumber]] — BDD + POP
- [[UI Testing Overview]] — UI тестування
- [[Automation Testing Index]] — головна сторінка
