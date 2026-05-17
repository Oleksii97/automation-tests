# Selenium Guide

> Selenium WebDriver: стандарт автоматизації браузерів, Java/Python/JS.

#selenium #automation #testing #ui #webdriver

---

## Overview

**Selenium** — найпоширеніший стандарт автоматизації браузерів. Заснований на протоколі WebDriver (W3C стандарт). Підтримується всіма браузерами та більшістю мов програмування.

**Плюси:**
- Підтримка всіх браузерів (Chrome, Firefox, Safari, Edge, IE)
- Підтримка всіх мов (Java, Python, JavaScript, C#, Ruby, Kotlin)
- W3C стандарт — велика спільнота
- Selenium Grid — паралельне тестування

**Мінуси:**
- Немає auto-waiting — треба писати явні очікування
- Повільніший за Playwright/Cypress
- Більше boilerplate коду
- Потребує налаштування WebDriver

---

## Setup

### Java (Maven)

```xml
<!-- pom.xml -->
<dependencies>
  <dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.18.1</version>
  </dependency>
  <dependency>
    <groupId>org.testng</groupId>
    <artifactId>testng</artifactId>
    <version>7.9.0</version>
    <scope>test</scope>
  </dependency>
</dependencies>
```

### Python

```bash
pip install selenium pytest
pip install webdriver-manager   # автоматичне управління WebDriver
```

### JavaScript

```bash
npm install selenium-webdriver
npm install chromedriver --save-dev
```

---

## Examples

### Python + Selenium + Pytest

```python
# conftest.py
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope='session')
def driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)  # implicit wait
    yield driver
    driver.quit()
```

```python
# tests/test_login.py
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestLogin:
    BASE_URL = "https://example.com"

    def test_login_success(self, driver):
        driver.get(f"{self.BASE_URL}/login")

        # Знайти елементи
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        email_field.send_keys("user@test.com")

        password_field = driver.find_element(By.ID, "password")
        password_field.send_keys("password123")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='submit']")
        submit_btn.click()

        # Перевірка
        WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url

    def test_login_invalid_credentials(self, driver):
        driver.get(f"{self.BASE_URL}/login")

        driver.find_element(By.ID, "email").send_keys("wrong@test.com")
        driver.find_element(By.ID, "password").send_keys("wrongpass")
        driver.find_element(By.CSS_SELECTOR, "[type='submit']").click()

        error_msg = WebDriverWait(driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".error-message"))
        )
        assert "Invalid credentials" in error_msg.text
```

### Java + Selenium + TestNG

```java
// LoginPage.java (Page Object)
import org.openqa.selenium.*;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    private WebDriver driver;

    @FindBy(id = "email")
    private WebElement emailField;

    @FindBy(id = "password")
    private WebElement passwordField;

    @FindBy(css = "[data-testid='submit']")
    private WebElement submitButton;

    @FindBy(css = ".error-message")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void navigate() {
        driver.get("https://example.com/login");
    }

    public void login(String email, String password) {
        emailField.clear();
        emailField.sendKeys(email);
        passwordField.clear();
        passwordField.sendKeys(password);
        submitButton.click();
    }

    public String getErrorMessage() {
        return errorMessage.getText();
    }
}
```

```java
// LoginTest.java
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.*;
import org.testng.*;
import org.testng.annotations.*;

public class LoginTest {
    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeClass
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        loginPage = new LoginPage(driver);
    }

    @Test
    public void testSuccessfulLogin() {
        loginPage.navigate();
        loginPage.login("user@test.com", "password123");
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Test
    public void testInvalidCredentials() {
        loginPage.navigate();
        loginPage.login("wrong@test.com", "wrongpass");
        Assert.assertEquals(loginPage.getErrorMessage(), "Invalid credentials");
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) driver.quit();
    }
}
```

### JavaScript + Selenium

```javascript
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTest() {
  const options = new chrome.Options().headless();
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get('https://example.com/login');

    const email = await driver.findElement(By.id('email'));
    await email.sendKeys('user@test.com');

    const password = await driver.findElement(By.id('password'));
    await password.sendKeys('password123');

    const submit = await driver.findElement(By.css("[data-testid='submit']"));
    await submit.click();

    await driver.wait(until.urlContains('/dashboard'), 5000);
    const url = await driver.getCurrentUrl();
    console.assert(url.includes('/dashboard'), 'Login failed');

    console.log('Test passed!');
  } finally {
    await driver.quit();
  }
}

runTest();
```

---

## Waits (Очікування)

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# Implicit Wait — для всіх пошуків
driver.implicitly_wait(10)  # чекає до 10 секунд

# Explicit Wait — для конкретного елемента
wait = WebDriverWait(driver, 10)

# Очікування умов
element = wait.until(EC.visibility_of_element_located((By.ID, "myId")))
element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn")))
element = wait.until(EC.presence_of_element_located((By.XPATH, "//button")))
wait.until(EC.url_contains("/dashboard"))
wait.until(EC.title_contains("Dashboard"))

# Fluent Wait — з polling
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import NoSuchElementException

fluent_wait = WebDriverWait(
    driver,
    timeout=30,
    poll_frequency=2,
    ignored_exceptions=[NoSuchElementException]
)
element = fluent_wait.until(EC.element_to_be_clickable((By.ID, "btn")))
```

---

## Locators (Локатори)

```python
# By.ID
element = driver.find_element(By.ID, "username")

# By.NAME
element = driver.find_element(By.NAME, "email")

# By.CLASS_NAME
element = driver.find_element(By.CLASS_NAME, "btn-primary")

# By.CSS_SELECTOR (найгнучкіший)
element = driver.find_element(By.CSS_SELECTOR, "[data-testid='submit']")
element = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

# By.XPATH (коли CSS не вистачає)
element = driver.find_element(By.XPATH, "//button[@type='submit']")
element = driver.find_element(By.XPATH, "//div[@class='login-form']//input[@name='email']")

# By.LINK_TEXT
element = driver.find_element(By.LINK_TEXT, "Click here")

# By.PARTIAL_LINK_TEXT
element = driver.find_element(By.PARTIAL_LINK_TEXT, "Click")

# Знайти всі елементи
elements = driver.find_elements(By.CSS_SELECTOR, ".list-item")
```

---

## Selenium Grid

```yaml
# docker-compose.yml для Selenium Grid
version: '3'
services:
  selenium-hub:
    image: selenium/hub:4
    ports:
      - "4442:4442"
      - "4443:4443"
      - "4444:4444"

  chrome:
    image: selenium/node-chrome:4
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_EVENT_BUS_PUBLISH_PORT=4442

  firefox:
    image: selenium/node-firefox:4
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_EVENT_BUS_PUBLISH_PORT=4442
```

```python
# Підключення до Grid
from selenium import webdriver

options = webdriver.ChromeOptions()
driver = webdriver.Remote(
    command_executor='http://selenium-hub:4444/wd/hub',
    options=options
)
```

---

## Best Practices

1. **Explicit Waits** замість `time.sleep()` або Implicit Wait
2. **Page Object Model** — інкапсуляція локаторів у класах
3. **`data-testid`** атрибути — стабільніші за XPath
4. **Headless mode** у CI/CD
5. **Driver cleanup** — завжди `driver.quit()` у teardown
6. **Selenium Grid** для паралельного запуску

---

## Related Notes

- [[Cypress Guide]] — сучасна альтернатива
- [[Playwright Guide]] — сучасна кросбраузерна альтернатива
- [[Framework Comparison]] — порівняння
- [[Page Object Pattern]] — POP патерн
- [[Pytest Guide]] — Python testing framework
- [[CI-CD Overview]] — Selenium у CI
