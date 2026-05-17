# Mobile Testing Overview

> Тестування мобільних застосунків: native, hybrid, web. Appium, Detox, Espresso.

#qa #automation #testing #mobile

#todo — розширити прикладами Appium та Detox

---

## Overview

**Mobile Testing** — тестування застосунків на мобільних пристроях (iOS, Android). Включає ручне та автоматизоване тестування.

---

## Mobile App Types

| Тип | Технологія | Приклади | Тестові інструменти |
|-----|-----------|---------|-------------------|
| **Native** | Swift, Kotlin, Java | Uber, WhatsApp | Appium, XCUITest, Espresso |
| **Hybrid** | Cordova, Ionic | Банківські додатки | Appium, Selenium |
| **Web (PWA)** | React, Vue | Twitter Lite | Playwright, Cypress Mobile |
| **Cross-Platform** | Flutter, React Native | Airbnb | Appium, Detox |

---

## Testing Tools

| Інструмент | Платформа | Тип | Мова |
|-----------|-----------|-----|------|
| **Appium** | iOS + Android | UI Automation | JS, Python, Java |
| **Detox** | iOS + Android (React Native) | E2E | JS |
| **XCUITest** | iOS | UI | Swift |
| **Espresso** | Android | UI | Kotlin/Java |
| **UIAutomator2** | Android | UI | Java |
| **BrowserStack** | Cloud | Cross-device | Будь-яка |
| **Sauce Labs** | Cloud | Cross-device | Будь-яка |

---

## Mobile-Specific Test Areas

### Functional Testing
- Встановлення / оновлення / видалення
- Реєстрація та авторизація
- Основний user flow
- Push notifications
- Deep links

### Non-Functional Testing
- **Performance**: startup time, frame rate, memory
- **Battery**: вплив на заряд
- **Network**: offline mode, slow connection (3G), no connection
- **Security**: certificate pinning, data storage
- **Accessibility**: VoiceOver (iOS), TalkBack (Android)
- **Compatibility**: різні пристрої та версії ОС

### Device Considerations
- Різні роздільності екрану (HDPI, XHDPI)
- Різні розміри екрану (phone, tablet)
- Орієнтація (portrait, landscape)
- Hardware (GPS, camera, fingerprint)
- iOS версії: 15, 16, 17, 18
- Android версії: 11, 12, 13, 14, 15

---

## Appium Quick Start

### Setup

```bash
npm install -g appium
appium driver install uiautomator2   # Android
appium driver install xcuitest       # iOS
```

### Basic iOS Test (JS)

```javascript
const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'iOS',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '17.0',
  'appium:app': '/path/to/app.ipa',
  'appium:automationName': 'XCUITest'
};

async function testLogin() {
  const driver = await remote({
    hostname: 'localhost',
    port: 4723,
    capabilities
  });

  const emailField = await driver.$('~email-input');  // accessibility id
  await emailField.setValue('user@test.com');

  const passwordField = await driver.$('~password-input');
  await passwordField.setValue('password123');

  const loginBtn = await driver.$('~login-button');
  await loginBtn.click();

  const dashboard = await driver.$('~dashboard-title');
  await dashboard.waitForDisplayed({ timeout: 5000 });

  await driver.deleteSession();
}
```

### Basic Android Test (Python)

```python
from appium import webdriver
from appium.options import UiAutomator2Options

options = UiAutomator2Options()
options.platform_name = 'Android'
options.device_name = 'Pixel 7'
options.app = '/path/to/app.apk'

driver = webdriver.Remote('http://localhost:4723', options=options)

# Знайти за resource-id
email_field = driver.find_element('id', 'com.example.app:id/email')
email_field.send_keys('user@test.com')

driver.quit()
```

---

## Testing on Real Devices vs Emulators

| Параметр | Емулятор/Симулятор | Реальний пристрій |
|----------|-------------------|------------------|
| Ціна | Безкоштовно | Дорого |
| Налаштування | Просто | Складно |
| Достовірність | Низька | Висока |
| Hardware тести | Немає | Повні |
| Performance | Не репрезентативна | Реальна |
| Паралельність | Легко | Складно |

**Рекомендація**: емулятори для розробки, реальні пристрої або BrowserStack для release testing.

---

## Playwright for Mobile Web

```javascript
const { chromium, devices } = require('@playwright/test');

test('mobile web test', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 14']  // емуляція мобільного пристрою
  });
  const page = await context.newPage();

  await page.goto('https://example.com');
  await expect(page.locator('[data-testid="hamburger-menu"]')).toBeVisible();

  await browser.close();
});
```

---

## CI/CD for Mobile Testing

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on: [push, pull_request]

jobs:
  android-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Android emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          script: npm run test:android
```

---

## Related Notes

- [[UI Testing Overview]] — UI тестування
- [[Playwright Guide]] — Playwright для mobile web
- [[CI-CD Overview]] — CI/CD для mobile
- [[DevOps for QA]] — інфраструктура
- [[Automation Testing Index]] — головна сторінка
