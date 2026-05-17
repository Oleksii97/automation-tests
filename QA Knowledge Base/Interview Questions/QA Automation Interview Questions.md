# QA Automation Interview Questions

> Топ питань для співбесід на позицію QA Automation Engineer / SDET.

#qa #automation #interview #career

---

## Junior Level

### QA Fundamentals

**Q: Що таке піраміда тестування?**
> A: Модель розподілу тестів: багато unit тестів (60-70%), менше integration (20-30%), мало E2E (5-10%). Юніт — швидкі та дешеві, E2E — повільні та дорогі. Мета — зменшити залежність від повільних E2E тестів.

**Q: Різниця між smoke та regression тестуванням?**
> A: Smoke — швидка перевірка основного функціоналу після деплою (10-20 критичних тестів, 5-10 хвилин). Regression — повна перевірка що нові зміни не зламали існуючий функціонал (весь набір тестів, запускається регулярно).

**Q: Що таке flaky test?**
> A: Тест, що іноді проходить, іноді падає без змін у коді. Причини: race conditions, зовнішні залежності, hardcoded timeouts. Рішення: cy.intercept(), proper waits, стабільні тестові дані.

**Q: Яка різниця між `before()` та `beforeEach()` у Cypress?**
> A: `before()` виконується один раз перед усіма тестами у describe. `beforeEach()` — перед кожним окремим тестом. Використовують `before()` для дорогих операцій (логін через API), `beforeEach()` — для скидання стану між тестами.

---

### Cypress

**Q: Чому `cy.wait(5000)` — погана практика?**
> A: Hardcoded wait робить тести повільними і нестабільними. Якщо сторінка завантажилась за 1 секунду, ми все одно чекаємо 5. Краще: `cy.intercept()` + `cy.wait('@alias')` або `.should('be.visible')` (auto-wait).

**Q: Що таке `data-cy` атрибут та навіщо його використовувати?**
> A: Кастомний HTML атрибут виключно для тестів. Стабільніший за CSS класи (можуть змінитися після рефакторингу), ID (можуть бути auto-generated), XPath. Конвенція: `data-cy="submit-button"`.

**Q: Поясни Page Object Pattern.**
> A: Архітектурний патерн де кожна сторінка/компонент UI представлена класом. Клас містить: локатори (selectors) та методи (дії + перевірки). Переваги: DRY, читабельність, одне місце для змін при зміні UI.

**Q: Як тестувати API помилки в Cypress?**
> A: Через `failOnStatusCode: false` у `cy.request()`. Без нього Cypress автоматично падає на будь-якому статусі ≠ 2xx.
```javascript
cy.request({ url: '/api/users/999', failOnStatusCode: false })
  .its('status').should('eq', 404);
```

---

### API Testing

**Q: Яка різниця між PUT та PATCH?**
> A: PUT — повністю замінює ресурс (треба відправити всі поля). PATCH — частково оновлює (тільки змінені поля). Обидва ідемпотентні (повторний запит дає той самий результат).

**Q: Що таке REST і які принципи лежать в основі?**
> A: Architectural style для API. Принципи: Stateless (сервер не зберігає стан клієнта), Client-Server, Uniform Interface (стандартні методи GET/POST/PUT/DELETE), Resource-based URLs (/users/1), Representation (JSON/XML).

**Q: Що перевіряти в API тесті?**
> A: Status code, response body (структура + значення), headers (Content-Type, Authorization), response time (SLA), error messages при невалідних даних, авторизацію (401/403).

---

## Middle Level

### Test Design

**Q: Що таке BDD і в чому його переваги?**
> A: Behavior Driven Development — підхід де тести пишуться на мові Gherkin (Given/When/Then), зрозумілій бізнесу. Переваги: спільна мова між бізнесом та tech командою, тести = жива документація, чіткий зв'язок з вимогами.

**Q: Як вибрати між Cypress та Playwright?**
> A: Cypress — простіший старт, відмінний DX, підходить для JS проєктів без Safari. Playwright — кросбраузерний (включно Safari), підтримка кількох мов, паралельний запуск вбудований, більше можливостей. Вибір залежить від вимог до браузерів та мови команди.

**Q: Як організувати тестові дані (test data management)?**
> A: Fixtures (статичні JSON), Factories (генерація через API), Database seeding, External files (CSV). Принципи: ізольовані дані для кожного тесту, очищення після тесту (teardown), уникати shared state між тестами.

**Q: Що таке test isolation та як забезпечити її?**
> A: Кожен тест повинен бути незалежним від інших: не залежати від попередніх тестів, мати власний стан, після завершення прибирати за собою. В Cypress: `beforeEach` для setup, `cy.clearLocalStorage()`, `cy.clearCookies()`.

---

### CI/CD

**Q: Як інтегрувати Cypress у GitHub Actions?**
> A: Файл `.github/workflows/tests.yml`, тригер `on: [push, pull_request]`, `uses: cypress-io/github-action@v6`, зберігати artifacts (screenshots/videos) при падінні. Secrets для BASE_URL та API_TOKEN.

**Q: Навіщо запускати тести в CI якщо вони є локально?**
> A: CI гарантує: чисте середовище (немає локальних залежностей), запуск при кожному commit (не забудуть), паралельний запуск (швидше), artifacts (evidence для команди), block merge при падінні.

**Q: Поясни стратегію запуску тестів при PR vs нічний прогін.**
> A: При PR — smoke тести (швидко, критичний шлях, 5-15 хв). Нічний прогін — повна regression suite (кілька годин). Розділення дозволяє: отримати швидкий feedback при PR і повне покриття раз на добу.

---

### Performance

**Q: Чим відрізняється Load Test від Stress Test?**
> A: Load Test — очікуване нормальне навантаження (перевірити стабільність). Stress Test — вище за очікуване (знайти межу системи, точку відмови). Spike Test — раптовий пік (перевірити реакцію на "Чорну п'ятницю").

**Q: Що таке p95 та чому важливіше за середнє?**
> A: p95 = 95% запитів отримали відповідь за цей час або швидше. Середнє "приховує" повільні хвости. Якщо 100 запитів і 5 зайняли 10 секунд, а 95 — 100ms, середнє буде ~600ms, а p95 = 100ms. SLA зазвичай прив'язаний до p95/p99.

---

## Senior Level

**Q: Як побудувати стратегію автоматизації з нуля для нового проєкту?**
> A: 1) Аналіз проєкту (мова, стек, браузери, вимоги). 2) Вибір фреймворку та підхід (Cypress/Playwright + POP + BDD якщо потрібно). 3) Визначення пріоритетів (API тести спочатку). 4) Побудова CI/CD інтеграції з першого дня. 5) Метрики успіху (pass rate, coverage, виконання часу). 6) Процес review тестів як production code.

**Q: Як боротись з нестабільними (flaky) тестами?**
> A: 1) Ідентифікувати через CI запуски (які тести fail intermittently). 2) Аналізувати причину (race condition, external API, data dependency). 3) Виправляти: cy.intercept() для API, стабільні selectors, ізольовані дані. 4) Quarantine: тимчасово ізолювати flaky тести. 5) Метрики flakiness rate.

**Q: Як масштабувати тестовий набір при великій команді (50+ тестів → 500+)?**
> A: 1) Чіткі конвенції та coding standards. 2) Code review для тестів. 3) Shared Page Objects library. 4) Parallel execution (CI). 5) Test tagging strategy (smoke/regression). 6) Регулярний review та рефакторинг. 7) Ownership — хто відповідальний за тести модулів.

**Q: Security testing: що перевіряти в API автоматично?**
> A: OWASP Top 10 автоматизовані перевірки: 401/403 на protected endpoints, IDOR (чужі ресурси), SQL Injection у параметрах, rate limiting, CORS headers, JWT validation (expiry, signature), security headers (X-Frame-Options, HSTS).

---

## Practical Tasks (Live Coding)

### Task 1: Write a login test in Cypress

```javascript
describe('Login', () => {
  beforeEach(() => cy.visit('/login'));

  it('successful login', () => {
    cy.get('[data-cy="email"]').type('user@test.com');
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('invalid credentials show error', () => {
    cy.get('[data-cy="email"]').type('wrong@test.com');
    cy.get('[data-cy="password"]').type('wrongpass');
    cy.get('[data-cy="submit"]').click();
    cy.get('[data-cy="error"]').should('contain', 'Invalid credentials');
  });
});
```

### Task 2: Create Page Object for Login

```javascript
export class LoginPage {
  navigate() { cy.visit('/login'); return this; }
  fillEmail(email) { cy.get('[data-cy="email"]').type(email); return this; }
  fillPassword(pass) { cy.get('[data-cy="password"]').type(pass); return this; }
  submit() { cy.get('[data-cy="submit"]').click(); return this; }
  login(email, pass) { return this.fillEmail(email).fillPassword(pass).submit(); }
  shouldShowError(msg) {
    cy.get('[data-cy="error"]').should('be.visible').and('contain', msg);
    return this;
  }
}
```

### Task 3: Write Artillery load test

```yaml
config:
  target: "https://api.example.com"
  phases:
    - duration: 300
      arrivalRate: 10
      name: Load Test
  plugins:
    ensure: {}
  ensure:
    thresholds:
      - http.response_time.p95: 500
    conditions:
      - expression: "vusers.failed == 0"
scenarios:
  - name: Get users
    flow:
      - get:
          url: "/api/users"
          expect:
            - statusCode: 200
```

---

## Related Notes

- [[QA Overview]] — основи QA
- [[Cypress Guide]] — Cypress детально
- [[API Testing Overview]] — API тестування
- [[BDD and Cucumber]] — BDD підхід
- [[CI-CD Overview]] — CI/CD
- [[QA Automation MOC]] — карта навчання
- [[Automation Testing Index]] — головна сторінка
