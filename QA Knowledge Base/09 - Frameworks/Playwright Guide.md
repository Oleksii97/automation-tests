# Playwright Guide

> Playwright від Microsoft: кросбраузерне E2E тестування для сучасних вебзастосунків.

#playwright #automation #testing #ui #e2e #crossbrowser

---

## Overview

**Playwright** — потужний фреймворк від Microsoft для автоматизованого тестування вебзастосунків. Підтримує всі сучасні браузери (Chromium, Firefox, WebKit/Safari) з єдиним API.

**Переваги:**
- Підтримка Safari (WebKit) — на відміну від Cypress
- Playwright Test — вбудований test runner
- Auto-waiting (як у Cypress)
- Вбудований відео, screenshots, traces
- Multiple contexts та tabs
- Mobile emulation
- Мови: JS/TS, Python, Java, C#

**Порівняно з Cypress:**
- Краща підтримка кросбраузерності
- Підтримка кількох вкладок/вікон
- Підтримка Safari
- Більш низькорівневий API

---

## Setup

### Installation

```bash
# Встановлення
npm init playwright@latest

# Або в існуючий проєкт
npm install @playwright/test --save-dev
npx playwright install   # встановлює браузери (Chromium, Firefox, WebKit)

# Встановити конкретні браузери
npx playwright install chromium firefox webkit
```

### Configuration (playwright.config.js)

```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }]
  ],

  use: {
    baseURL: 'https://your-app.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: true
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    // Mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] }
    }
  ]
});
```

---

## Examples

### Basic Test

```javascript
// tests/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'user@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'wrong@test.com');
    await page.fill('[data-testid="password"]', 'wrongpass');
    await page.click('[data-testid="submit"]');

    const error = page.locator('[data-testid="error-msg"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Invalid credentials');
  });
});
```

### Page Object Model

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.submitBtn = page.locator('[data-testid="submit"]');
    this.errorMsg = page.locator('[data-testid="error-msg"]');
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

```javascript
// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user@test.com', 'password123');

  await expect(page).toHaveURL(/dashboard/);
});
```

### API Testing

```javascript
const { test, expect, request } = require('@playwright/test');

test.describe('Users API', () => {
  let apiContext;
  let token;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: 'https://api.example.com'
    });

    const response = await apiContext.post('/auth/login', {
      data: { email: 'admin@test.com', password: 'Admin123!' }
    });
    const body = await response.json();
    token = body.accessToken;
  });

  test('GET /users returns list', async () => {
    const response = await apiContext.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeInstanceOf(Array);
  });

  test('POST /users creates user', async () => {
    const response = await apiContext.post('/users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Alice',
        email: `alice_${Date.now()}@test.com`
      }
    });

    expect(response.status()).toBe(201);
    const user = await response.json();
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Alice');
  });
});
```

### Mobile Emulation

```javascript
const { test, devices } = require('@playwright/test');

test.use({
  ...devices['iPhone 14']
});

test('mobile menu works', async ({ page }) => {
  await page.goto('/');
  const hamburger = page.locator('[data-testid="hamburger-menu"]');
  await expect(hamburger).toBeVisible();
  await hamburger.click();
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
});
```

### Multiple Tabs

```javascript
test('new tab opens on external link', async ({ page, context }) => {
  await page.goto('/');

  // Чекаємо нову вкладку
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('[data-testid="external-link"]')
  ]);

  await newPage.waitForLoadState();
  expect(newPage.url()).toContain('external-site.com');
});
```

### Screenshot & Visual Testing

```javascript
test('homepage visual test', async ({ page }) => {
  await page.goto('/');

  // Snapshot всієї сторінки
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    threshold: 0.1   // 10% tolerance
  });

  // Snapshot конкретного елемента
  await expect(page.locator('.header')).toHaveScreenshot('header.png');
});
```

### Network Mocking

```javascript
test('shows empty state when API returns empty', async ({ page }) => {
  // Мок API до відкриття сторінки
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.goto('/products');
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
});

// Мок помилки
await page.route('**/api/users', route => {
  route.fulfill({ status: 500 });
});
```

---

## Assertions Reference

```javascript
// Елемент
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toBeEmpty();

// Текст
await expect(locator).toHaveText('exact text');
await expect(locator).toContainText('partial');
await expect(locator).toHaveValue('input value');

// Атрибути
await expect(locator).toHaveAttribute('href', '/link');
await expect(locator).toHaveClass('active');
await expect(locator).toHaveId('my-id');

// Кількість
await expect(locator).toHaveCount(5);

// URL
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page).toHaveURL(/dashboard/);

// Title
await expect(page).toHaveTitle('My App');
```

---

## CLI Reference

```bash
# Запустити всі тести
npx playwright test

# Конкретний файл
npx playwright test login.spec.js

# Конкретний браузер
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# З UI (інтерактивний режим)
npx playwright test --ui

# Debug режим
npx playwright test --debug

# Headed (з вікном)
npx playwright test --headed

# Показати HTML звіт
npx playwright show-report

# Генерація тесту (record mode)
npx playwright codegen https://example.com
```

---

## Best Practices

1. **Використовуй `data-testid`** для стабільних локаторів
2. **`page.locator()`** замість `page.$()` — lazy evaluation
3. **`await expect(locator).toBeVisible()`** — auto-retry до timeout
4. **Page Object Model** для читабельності
5. **`test.beforeAll()`** для одноразового setup (API token)
6. **Паралельний запуск** — `fullyParallel: true`
7. **Traces on failure** — `trace: 'on-first-retry'`

---

## Related Notes

- [[Cypress Guide]] — альтернативний E2E фреймворк
- [[Selenium Guide]] — WebDriver стандарт
- [[Framework Comparison]] — порівняння фреймворків
- [[Page Object Pattern]] — POP патерн
- [[UI Testing Overview]] — UI тестування
- [[CI-CD Overview]] — Playwright у CI
- [[Automation Testing Index]] — головна сторінка
