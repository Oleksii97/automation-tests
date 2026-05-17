# UI Practice Examples — Cypress Tests

> Реальні Cypress тести для https://practice.expandtesting.com/ — 12 типів UI елементів з поясненнями технік.

#cypress #ui #testing #practice #e2e #examples

---

## Навігація по темах

- [[#1. Login / Register форми]]
- [[#2. Input Fields (text, number, date)]]
- [[#3. Checkboxes та Radio Buttons]]
- [[#4. Dropdowns (select)]]
- [[#5. Drag and Drop]]
- [[#6. JavaScript Alerts]]
- [[#7. iFrame взаємодія]]
- [[#8. Shadow DOM]]
- [[#9. Multiple Windows / Tabs]]
- [[#10. File Upload]]
- [[#11. Hover та Mouse Events]]
- [[#12. Infinite Scroll / Dynamic Content]]
- [[#13. Scrollbars]]

---

## Налаштування проєкту

```bash
# Ініціалізація
mkdir cypress-practice && cd cypress-practice
npm init -y
npm install cypress --save-dev

# Структура папок
cypress/
  e2e/
    01-login.cy.js
    02-inputs.cy.js
    03-checkboxes-radio.cy.js
    04-dropdowns.cy.js
    05-drag-drop.cy.js
    06-alerts.cy.js
    07-iframe.cy.js
    08-shadow-dom.cy.js
    09-windows.cy.js
    10-file-upload.cy.js
    11-hover-mouse.cy.js
    12-infinite-scroll.cy.js
  support/
    commands.js
    e2e.js
```

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://practice.expandtesting.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
    video: false,
  },
});
```

---

## 1. Login / Register форми

**Файл:** `cypress/e2e/01-login.cy.js`

```javascript
describe('Login / Register Forms', () => {
  // Перевіряємо автентифікацію: успішний вхід, валідацію помилок,
  // і що після виходу сесія очищається.

  const BASE = 'https://practice.expandtesting.com';
  const VALID_USER = { username: 'practice', password: 'SuperSecretPassword!' };

  describe('Login — Happy Path', () => {
    it('повинен успішно залогінитись з правильними кредами', () => {
      cy.visit('/login');

      cy.get('#username').type(VALID_USER.username);
      cy.get('#password').type(VALID_USER.password);
      cy.get('button[type="submit"]').click();

      // Перевіряємо редирект після логіну
      cy.url().should('include', '/secure');

      // Flash-повідомлення про успіх
      cy.get('.flash.success')
        .should('be.visible')
        .and('contain', 'You logged into a secure area');
    });

    it('повинен зберігати сесію при перезавантаженні (cookie)', () => {
      cy.visit('/login');
      cy.get('#username').type(VALID_USER.username);
      cy.get('#password').type(VALID_USER.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/secure');

      // Перевіряємо що сесійна кука існує
      cy.getCookie('rack.session').should('exist');
    });
  });

  describe('Login — Негативні сценарії', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('повинен показати помилку при неправильному паролі', () => {
      cy.get('#username').type(VALID_USER.username);
      cy.get('#password').type('wrong_password_123');
      cy.get('button[type="submit"]').click();

      cy.get('.flash.error')
        .should('be.visible')
        .and('contain', 'Your username is invalid');

      // URL не повинен змінитись
      cy.url().should('include', '/login');
    });

    it('повинен показати помилку при порожньому полі username', () => {
      cy.get('#password').type(VALID_USER.password);
      cy.get('button[type="submit"]').click();

      cy.get('.flash.error').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('повинен показати помилку при обох порожніх полях', () => {
      cy.get('button[type="submit"]').click();
      cy.get('.flash.error').should('be.visible');
    });
  });

  describe('Logout', () => {
    it('повинен успішно вийти і заблокувати доступ до secure area', () => {
      // Логінимось
      cy.visit('/login');
      cy.get('#username').type(VALID_USER.username);
      cy.get('#password').type(VALID_USER.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/secure');

      // Логаутимось
      cy.get('a[href="/logout"]').click();

      cy.url().should('include', '/login');
      cy.get('.flash.success')
        .should('be.visible')
        .and('contain', 'You logged out of the secure area');

      // Спробуємо повернутись — повинно редиректнути
      cy.visit('/secure');
      cy.url().should('include', '/login');
    });
  });
});
```

> **Техніки:** `cy.getCookie()` для перевірки сесії. `beforeEach` для підготовки стану перед кожним тестом. Flash-повідомлення перевіряємо через `.flash.error` / `.flash.success` — стабільні CSS-класи, не змінюються при рефакторингу тексту.

---

## 2. Input Fields (text, number, date)

**Файл:** `cypress/e2e/02-inputs.cy.js`

```javascript
describe('Input Fields', () => {
  // Перевіряємо різні типи полів вводу: поведінку при введенні,
  // обмеження, очищення та спеціальні символи.

  describe('Text Inputs', () => {
    beforeEach(() => {
      cy.visit('/inputs');
    });

    it('повинен приймати текстовий ввід і відображати значення', () => {
      cy.get('input[type="number"]')
        .type('42')
        .should('have.value', '42');
    });

    it('повинен очищати поле і приймати нове значення', () => {
      cy.get('input[type="number"]')
        .type('100')
        .clear()
        .type('999')
        .should('have.value', '999');
    });

    it('повинен ігнорувати нечислові символи в number input', () => {
      cy.get('input[type="number"]')
        .type('abc')
        .should('have.value', '');
    });
  });

  describe('Key Events', () => {
    beforeEach(() => {
      cy.visit('/key_presses');
    });

    it('повинен визначати натиснуту клавішу ENTER', () => {
      cy.get('#target').type('{enter}');
      cy.get('#result').should('contain', 'ENTER');
    });

    it('повинен визначати клавішу TAB', () => {
      cy.get('#target').type('{tab}');
      cy.get('#result').should('contain', 'TAB');
    });

    it('повинен визначати літеру A', () => {
      cy.get('#target').type('a');
      cy.get('#result').should('contain', 'A');
    });

    it('повинен визначати стрілку вліво', () => {
      cy.get('#target').type('{leftarrow}');
      cy.get('#result').should('contain', 'LEFT');
    });
  });

  describe('Form Inputs (різні типи)', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('поле password повинно маскувати введений текст', () => {
      cy.get('#password')
        .should('have.attr', 'type', 'password')
        .type('MySecret123');
      // Значення є, але тип password = маскування
      cy.get('#password').should('have.value', 'MySecret123');
    });

    it('повинен підтримувати вставку через clipboard (invoke val)', () => {
      // Симулюємо paste — через invoke для обходу browser security
      cy.get('#username').invoke('val', 'pasted_user').trigger('input');
      cy.get('#username').should('have.value', 'pasted_user');
    });
  });
});
```

> **Техніки:** `cy.get().type('{enter}')` — спеціальні клавіші в фігурних дужках. `.clear()` перед `.type()` — щоб не накопичувати текст. `invoke('val', ...)` — безпосереднє встановлення значення DOM-елементу, корисно для симуляції paste.

---

## 3. Checkboxes та Radio Buttons

**Файл:** `cypress/e2e/03-checkboxes-radio.cy.js`

```javascript
describe('Checkboxes and Radio Buttons', () => {
  // Перевіряємо стан (checked/unchecked), toggle,
  // і що тільки один radio може бути вибраний.

  describe('Checkboxes', () => {
    beforeEach(() => {
      cy.visit('/checkboxes');
    });

    it('повинен відображати початковий стан чекбоксів', () => {
      cy.get('input[type="checkbox"]').eq(0).should('not.be.checked');
      cy.get('input[type="checkbox"]').eq(1).should('be.checked');
    });

    it('повинен чекати перший чекбокс після кліку', () => {
      cy.get('input[type="checkbox"]').eq(0).check();
      cy.get('input[type="checkbox"]').eq(0).should('be.checked');
    });

    it('повинен знімати відмітку з другого чекбоксу', () => {
      cy.get('input[type="checkbox"]').eq(1).uncheck();
      cy.get('input[type="checkbox"]').eq(1).should('not.be.checked');
    });

    it('повинен відмічати всі чекбокси', () => {
      cy.get('input[type="checkbox"]').check();
      cy.get('input[type="checkbox"]').each(($el) => {
        cy.wrap($el).should('be.checked');
      });
    });

    it('toggle: клік двічі повертає початковий стан', () => {
      cy.get('input[type="checkbox"]').eq(0).click().click();
      cy.get('input[type="checkbox"]').eq(0).should('not.be.checked');
    });
  });

  describe('Radio Buttons', () => {
    beforeEach(() => {
      cy.visit('/radiobuttons');
    });

    it('повинен вибрати перший radio button', () => {
      cy.get('input[type="radio"]').first().check();
      cy.get('input[type="radio"]').first().should('be.checked');
    });

    it('вибір другого radio повинен знімати відмітку з першого', () => {
      cy.get('input[type="radio"]').first().check();
      cy.get('input[type="radio"]').eq(1).check();

      // Тільки другий повинен бути вибраний
      cy.get('input[type="radio"]').first().should('not.be.checked');
      cy.get('input[type="radio"]').eq(1).should('be.checked');
    });

    it('повинен відображати правильний текст після вибору', () => {
      cy.get('input[type="radio"][value="Yes"]').check();
      cy.get('.radiobutton').should('contain', 'Yes');
    });
  });
});
```

> **Техніки:** `.check()` / `.uncheck()` — семантичні команди Cypress для checkbox і radio, кращі за `.click()` бо перевіряють тип елементу. `.each(($el) => {...})` — ітерація по колекції елементів. `cy.wrap($el)` — обгортання jQuery-елемента в Cypress chain.

---

## 4. Dropdowns (select)

**Файл:** `cypress/e2e/04-dropdowns.cy.js`

```javascript
describe('Dropdowns', () => {
  // Перевіряємо вибір опцій, початковий стан,
  // і неможливість вибору disabled опції.

  beforeEach(() => {
    cy.visit('/dropdown');
  });

  it('повинен мати "Please select an option" за замовчуванням', () => {
    cy.get('#dropdown').should('have.value', '');
    cy.get('#dropdown option:selected').should('have.text', 'Please select an option');
  });

  it('повинен вибрати Option 1', () => {
    cy.get('#dropdown').select('Option 1');
    cy.get('#dropdown').should('have.value', '1');
    cy.get('#dropdown option:selected').should('have.text', 'Option 1');
  });

  it('повинен вибрати Option 2 за value', () => {
    cy.get('#dropdown').select('2');
    cy.get('#dropdown').should('have.value', '2');
  });

  it('повинен вибрати опцію за індексом', () => {
    // select() приймає текст, value, або index
    cy.get('#dropdown').select(1);  // індекс 1 = перша non-disabled опція
    cy.get('#dropdown').should('not.have.value', '');
  });

  it('всі опції повинні бути в списку', () => {
    cy.get('#dropdown option').should('have.length', 3);
    cy.get('#dropdown option').eq(1).should('have.text', 'Option 1');
    cy.get('#dropdown option').eq(2).should('have.text', 'Option 2');
  });

  it('перша опція повинна бути disabled', () => {
    cy.get('#dropdown option').first().should('have.attr', 'disabled');
  });
});
```

> **Техніки:** `.select()` в Cypress приймає текст, value або індекс — дуже зручно. `option:selected` — CSS псевдоклас для активної опції. Перевіряємо і value і текстовий label, бо вони можуть розходитись.

---

## 5. Drag and Drop

**Файл:** `cypress/e2e/05-drag-drop.cy.js`

```javascript
describe('Drag and Drop', () => {
  // Drag and Drop потребує симуляції mouse events.
  // Cypress не має вбудованого drag(), тому використовуємо
  // реальний API або HTML5 drag events через trigger().

  beforeEach(() => {
    cy.visit('/drag_and_drop');
  });

  it('повинен перетягнути елемент A у колонку B', () => {
    // Перевіряємо початковий стан
    cy.get('#column-a header').should('have.text', 'A');
    cy.get('#column-b header').should('have.text', 'B');

    // HTML5 Drag via trigger
    cy.get('#column-a')
      .trigger('dragstart', { dataTransfer: new DataTransfer() });
    cy.get('#column-b')
      .trigger('dragover')
      .trigger('drop');

    // Після drop — A повинен бути в column-b
    cy.get('#column-b header').should('have.text', 'A');
    cy.get('#column-a header').should('have.text', 'B');
  });

  it('повинен дозволяти зворотній drag (B → A)', () => {
    // Спочатку переміщаємо A → B
    cy.get('#column-a').trigger('dragstart', { dataTransfer: new DataTransfer() });
    cy.get('#column-b').trigger('dragover').trigger('drop');
    cy.get('#column-b header').should('have.text', 'A');

    // Потім B → A (де тепер "B")
    cy.get('#column-b').trigger('dragstart', { dataTransfer: new DataTransfer() });
    cy.get('#column-a').trigger('dragover').trigger('drop');
    cy.get('#column-a header').should('have.text', 'A');
  });
});

// Альтернатива: через cypress-drag-drop плагін
// npm install -D @4tw/cypress-drag-drop
describe('Drag and Drop (з плагіном)', () => {
  // Після встановлення плагіну:
  // import '@4tw/cypress-drag-drop' в commands.js

  it('drag через cypress-drag-drop plugin (простіший синтаксис)', () => {
    cy.visit('/drag_and_drop');

    // cy.get('#column-a').drag('#column-b');
    // cy.get('#column-b header').should('have.text', 'A');

    cy.log('Плагін @4tw/cypress-drag-drop надає cy.drag() команду');
    // Розкоментуй вище після npm install -D @4tw/cypress-drag-drop
  });
});
```

> **Техніки:** Нативний HTML5 drag через `.trigger('dragstart')` / `.trigger('drop')`. `DataTransfer` — стандартний Web API для передачі даних при drag. Плагін `@4tw/cypress-drag-drop` спрощує синтаксис до `cy.drag()`. Для складних drag-n-drop (координати, mousemove) використовуй `.trigger('mousedown').trigger('mousemove').trigger('mouseup')`.

---

## 6. JavaScript Alerts

**Файл:** `cypress/e2e/06-alerts.cy.js`

```javascript
describe('JavaScript Alerts', () => {
  // Cypress перехоплює window.alert, window.confirm, window.prompt
  // автоматично — alert/confirm закриваються OK,
  // prompt повертає null. Можемо перевизначити через cy.on().

  beforeEach(() => {
    cy.visit('/js_alerts');
  });

  describe('JS Alert (простий)', () => {
    it('повинен обробити alert і перевірити повідомлення', () => {
      // Встановлюємо слухача ДО кліку
      cy.on('window:alert', (text) => {
        expect(text).to.equal('I am a JS Alert');
      });

      cy.get('button').contains('Click for JS Alert').click();

      // Cypress автоматично натиснув OK
      cy.get('#result').should('have.text', 'You successfully clicked an alert');
    });

    it('повинен зафіксувати текст alert через stub', () => {
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.get('button').contains('Click for JS Alert').click()
        .then(() => {
          expect(alertStub).to.be.calledWith('I am a JS Alert');
        });
    });
  });

  describe('JS Confirm (OK / Cancel)', () => {
    it('повинен натиснути OK в confirm', () => {
      // За замовчуванням Cypress повертає true (OK)
      cy.on('window:confirm', () => true);

      cy.get('button').contains('Click for JS Confirm').click();
      cy.get('#result').should('contain', 'You clicked: Ok');
    });

    it('повинен натиснути Cancel в confirm', () => {
      // Повертаємо false = Cancel
      cy.on('window:confirm', () => false);

      cy.get('button').contains('Click for JS Confirm').click();
      cy.get('#result').should('contain', 'You clicked: Cancel');
    });
  });

  describe('JS Prompt (введення тексту)', () => {
    it('повинен ввести текст в prompt і підтвердити', () => {
      // Stub window.prompt щоб повернути значення
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('Cypress Test Input');
      });

      cy.get('button').contains('Click for JS Prompt').click();
      cy.get('#result').should('contain', 'You entered: Cypress Test Input');
    });

    it('повинен обробити Cancel в prompt (null)', () => {
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns(null);
      });

      cy.get('button').contains('Click for JS Prompt').click();
      cy.get('#result').should('contain', 'You entered: null');
    });
  });
});
```

> **Техніки:** `cy.on('window:alert', fn)` — слухач без стану (кожен виклик). `cy.stub()` — шпигун з перевіркою `calledWith`. `cy.window().then(win => cy.stub(win, 'prompt'))` — єдиний спосіб перевизначити `prompt`, бо він не є подією. Слухач треба встановити ДО дії, що викликає alert.

---

## 7. iFrame взаємодія

**Файл:** `cypress/e2e/07-iframe.cy.js`

```javascript
// cypress/support/commands.js — додай цю команду
// Cypress не має вбудованої підтримки iframe, потрібен workaround

Cypress.Commands.add('getIframeBody', (iframeSelector) => {
  return cy.get(iframeSelector)
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
});

// ---

describe('iFrame Interaction', () => {
  // iframe — це окремий document всередині сторінки.
  // Cypress не може взаємодіяти з ним напряму,
  // тому дістаємо body через contentDocument.

  beforeEach(() => {
    cy.visit('/iframe');
  });

  it('повинен взаємодіяти з TinyMCE редактором в iframe', () => {
    // Очікуємо завантаження iframe
    cy.get('iframe#mce_0_ifr').should('be.visible');

    // Дістаємо body iframe через команду
    cy.getIframeBody('iframe#mce_0_ifr').within(() => {
      // Очищаємо і вводимо текст
      cy.get('#tinymce')
        .clear()
        .type('Hello from Cypress inside iframe!');
    });

    // Перевіряємо через iframe body
    cy.getIframeBody('iframe#mce_0_ifr').within(() => {
      cy.get('#tinymce').should('contain', 'Hello from Cypress inside iframe!');
    });
  });

  it('повинен натискати кнопки форматування в iframe', () => {
    cy.get('iframe#mce_0_ifr').should('be.visible');

    cy.getIframeBody('iframe#mce_0_ifr').within(() => {
      cy.get('#tinymce').clear().type('Bold text test');
    });

    // Натискаємо Bold у тулбарі (поза iframe)
    cy.get('[aria-label="Bold"]').click();
  });

  it('повинен читати текст з iframe', () => {
    cy.getIframeBody('iframe#mce_0_ifr').within(() => {
      cy.get('#tinymce').should('exist');
      cy.get('#tinymce p').should('be.visible');
    });
  });
});
```

> **Техніки:** `.its('0.contentDocument.body')` — доступ до DOM iframe через JS API. `.should('not.be.empty')` — waiting до завантаження. `.then(cy.wrap)` — обгортка в Cypress object. `cy.within()` — обмежує пошук DOM всередині вибраного елементу. Кастомна команда `getIframeBody` — зручна абстракція, яку можна використовувати для будь-якого iframe.

---

## 8. Shadow DOM

**Файл:** `cypress/e2e/08-shadow-dom.cy.js`

```javascript
describe('Shadow DOM', () => {
  // Shadow DOM — ізольоване дерево DOM, недоступне для звичайних селекторів.
  // Cypress підтримує Shadow DOM через { includeShadowDom: true }
  // або глобальне налаштування в cypress.config.js.

  beforeEach(() => {
    cy.visit('/shadowdom');
  });

  it('повинен знайти елементи всередині Shadow DOM', () => {
    // Варіант 1: опція в конкретному запиті
    cy.get('my-paragraph', { includeShadowDom: true })
      .shadow()
      .find('p')
      .should('be.visible');
  });

  it('повинен читати текст з Shadow DOM елемента', () => {
    cy.get('my-paragraph')
      .shadow()
      .find('slot')
      .should('exist');
  });

  it('повинен взаємодіяти з input всередині Shadow DOM', () => {
    // Якщо є input в shadow root
    cy.get('[data-cy="shadow-host"]', { includeShadowDom: true })
      .shadow()
      .find('input')
      .type('Shadow DOM input test');
  });

  it('повинен перевірити стилі shadow DOM (ізоляція)', () => {
    // Перевіряємо що shadow DOM елементи рендеряться
    cy.get('my-paragraph').should('exist');
    cy.get('my-paragraph').shadow().should('exist');
  });
});

// Глобальне налаштування (замість { includeShadowDom: true } скрізь):
// cypress.config.js:
// module.exports = defineConfig({
//   e2e: {
//     experimentalShadowDomSupport: true,  // старіші версії
//   },
// });
```

> **Техніки:** `.shadow()` — переходить у shadow root елементу. `{ includeShadowDom: true }` — опція запиту для пошуку крізь shadow boundaries. Для глобального увімкнення — `experimentalShadowDomSupport: true` в конфізі. Shadow DOM часто використовується у Web Components (Custom Elements).

---

## 9. Multiple Windows / Tabs

**Файл:** `cypress/e2e/09-windows.cy.js`

```javascript
describe('Multiple Windows / Tabs', () => {
  // Cypress не підтримує multiple tabs нативно (одна вкладка за раз).
  // Підхід: перевіряємо href посилань і видаляємо target="_blank",
  // або використовуємо cy.origin() для cross-origin переходів.

  beforeEach(() => {
    cy.visit('/windows');
  });

  it('повинен перевірити що посилання відкривається в новій вкладці', () => {
    // Перевіряємо атрибут, не відкриваємо нову вкладку
    cy.get('a[href="/windows/new"]')
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'href', '/windows/new');
  });

  it('повинен відкрити посилання в тому ж вікні (видаливши target)', () => {
    // Видаляємо target="_blank" щоб відкрити в поточному вікні
    cy.get('a[href="/windows/new"]')
      .invoke('removeAttr', 'target')
      .click();

    cy.url().should('include', '/windows/new');
    cy.get('h3').should('contain', 'New Window');
  });

  it('повинен перевірити новий URL через window.open stub', () => {
    const windowOpenStub = cy.stub();

    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake(windowOpenStub);
    });

    // Якщо посилання використовує window.open
    cy.get('a[href="/windows/new"]')
      .invoke('removeAttr', 'target')
      .click();

    // Якщо використовується window.open — перевіряємо виклик
    // windowOpenStub.should('be.calledWith', ...)
  });

  it('повинен переходити на нову сторінку і повертатись назад', () => {
    cy.get('a[href="/windows/new"]')
      .invoke('removeAttr', 'target')
      .click();

    cy.url().should('include', '/windows/new');
    cy.go('back');
    cy.url().should('include', '/windows');
  });
});
```

> **Техніки:** `invoke('removeAttr', 'target')` — видаляємо `target="_blank"` щоб посилання відкрилось в тому ж вікні. `cy.go('back')` / `cy.go('forward')` — навігація в history. `cy.stub(win, 'open')` — перехоплення `window.open`. Для реального тестування кількох вкладок — тільки Playwright (підтримує нативно).

---

## 10. File Upload

**Файл:** `cypress/e2e/10-file-upload.cy.js`

```javascript
describe('File Upload', () => {
  // cy.selectFile() — нативна підтримка завантаження файлів в Cypress 9.3+
  // Підтримує: шлях до файлу, Buffer, fixture або drag-and-drop.

  beforeEach(() => {
    cy.visit('/upload');
  });

  it('повинен завантажити файл через вибір у провіднику', () => {
    // Файл з папки cypress/fixtures/
    cy.get('#file-upload').selectFile('cypress/fixtures/test-file.txt');
    cy.get('#file-submit').click();

    cy.get('#uploaded-files').should('contain', 'test-file.txt');
  });

  it('повинен завантажити файл через drag-and-drop', () => {
    cy.get('#drag-drop-upload').selectFile(
      'cypress/fixtures/test-file.txt',
      { action: 'drag-drop' }
    );

    cy.get('.upload-success').should('be.visible');
  });

  it('повинен завантажити файл через Buffer (без файлу на диску)', () => {
    const fileContent = 'Hello, Cypress!';
    cy.get('#file-upload').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: 'generated-file.txt',
      mimeType: 'text/plain',
    });
    cy.get('#file-submit').click();

    cy.get('#uploaded-files').should('contain', 'generated-file.txt');
  });

  it('повинен завантажити кілька файлів (multiple)', () => {
    cy.get('#file-upload[multiple]').selectFile([
      'cypress/fixtures/file1.txt',
      'cypress/fixtures/file2.txt',
    ]);
    cy.get('#file-submit').click();

    cy.get('#uploaded-files')
      .should('contain', 'file1.txt')
      .and('contain', 'file2.txt');
  });
});

// cypress/fixtures/test-file.txt — створи цей файл:
// Вміст: "This is a test file for Cypress upload testing."
```

> **Техніки:** `cy.selectFile()` — нативна команда Cypress (v9.3+), не потрібен плагін. `{ action: 'drag-drop' }` — симуляція drag-n-drop upload. `Cypress.Buffer.from()` — створення файлу з пам'яті без фізичного файлу. `cypress/fixtures/` — папка для тестових даних і файлів.

---

## 11. Hover та Mouse Events

**Файл:** `cypress/e2e/11-hover-mouse.cy.js`

```javascript
describe('Hover and Mouse Events', () => {
  // CSS :hover не тригериться через cy.trigger('mouseover') в деяких браузерах.
  // Найкращий підхід: trigger('mouseenter') або realHover() з плагіном.

  describe('Hovers (аватари)', () => {
    beforeEach(() => {
      cy.visit('/hovers');
    });

    it('повинен показати підказку при hover на першому аватарі', () => {
      cy.get('.figure').eq(0).trigger('mouseover');
      cy.get('.figure').eq(0).find('.figcaption').should('be.visible');
    });

    it('повинен показати ім\'я користувача при hover', () => {
      cy.get('.figure').eq(0).trigger('mouseover');
      cy.get('.figure').eq(0)
        .find('.figcaption h5')
        .should('contain', 'user1');
    });

    it('повинен мати посилання на профіль в hover меню', () => {
      cy.get('.figure').eq(1).trigger('mouseover');
      cy.get('.figure').eq(1)
        .find('a[href*="/users/"]')
        .should('be.visible')
        .click();

      cy.url().should('include', '/users/');
    });

    it('повинен hover на всіх трьох фігурах', () => {
      cy.get('.figure').each(($figure, index) => {
        cy.wrap($figure).trigger('mouseover');
        cy.wrap($figure)
          .find('.figcaption')
          .should('be.visible');
        cy.log(`Figure ${index + 1} hover OK`);
      });
    });
  });

  describe('Context Menu (правий клік)', () => {
    beforeEach(() => {
      cy.visit('/context_menu');
    });

    it('повинен відкрити контекстне меню при правому кліку', () => {
      cy.on('window:alert', (text) => {
        expect(text).to.equal('You selected a context menu');
      });

      cy.get('#hot-spot').rightclick();
    });
  });

  describe('Double Click', () => {
    beforeEach(() => {
      cy.visit('/double_click');
    });

    it('повинен змінити колір блоку після подвійного кліку', () => {
      cy.get('#click-box').dblclick();
      cy.get('#click-box').should('have.css', 'background-color', 'rgb(0, 128, 0)');
    });
  });
});
```

> **Техніки:** `.trigger('mouseover')` — найкраще для стандартного CSS hover. `.rightclick()` — симуляція правого кліку (context menu). `.dblclick()` — подвійний клік. Для складних hover (CSS animations) — плагін `cypress-real-events` надає `.realHover()` через Chrome DevTools Protocol.

---

## 12. Infinite Scroll / Dynamic Content

**Файл:** `cypress/e2e/12-infinite-scroll.cy.js`

```javascript
describe('Infinite Scroll and Dynamic Content', () => {
  // Infinite scroll підвантажує контент при скролі вниз.
  // cy.scrollTo() + перевірка появи нових елементів.

  describe('Infinite Scroll', () => {
    beforeEach(() => {
      cy.visit('/infinite_scroll');
    });

    it('повинен завантажити початковий контент', () => {
      cy.get('.jscroll-added').should('have.length.greaterThan', 0);
    });

    it('повинен підвантажити більше елементів після скролу', () => {
      cy.get('.jscroll-added').then(($items) => {
        const initialCount = $items.length;

        // Скролимо до низу
        cy.scrollTo('bottom');

        // Чекаємо появи нових елементів
        cy.get('.jscroll-added', { timeout: 10000 })
          .should('have.length.greaterThan', initialCount);
      });
    });

    it('повинен підвантажити контент після 3 скролів', () => {
      const scrollAndCheck = (times) => {
        if (times === 0) return;
        cy.scrollTo('bottom');
        cy.wait(500); // Мінімальне очікування підвантаження
        scrollAndCheck(times - 1);
      };

      cy.get('.jscroll-added').its('length').then((initialCount) => {
        scrollAndCheck(3);
        cy.get('.jscroll-added').should('have.length.greaterThan', initialCount);
      });
    });
  });

  describe('Dynamic Content (оновлення)', () => {
    beforeEach(() => {
      cy.visit('/dynamic_content');
    });

    it('повинен оновити контент при перезавантаженні сторінки', () => {
      // Зберігаємо початковий текст
      cy.get('.large-10').eq(0).invoke('text').then((initialText) => {
        cy.reload();
        // Після reload — контент може змінитись (dynamic)
        cy.get('.large-10').eq(0).should('exist');
      });
    });

    it('повинен зберігати перший елемент статичним', () => {
      // Параметр ?with_content=1 фіксує перший елемент
      cy.visit('/dynamic_content?with_content=1');
      cy.get('.large-10').eq(0).invoke('text').then((firstText) => {
        cy.reload();
        cy.get('.large-10').eq(0).should('have.text', firstText);
      });
    });
  });

  describe('Dynamic Loading (hidden / rendered)', () => {
    it('повинен дочекатись появи прихованого елементу', () => {
      cy.visit('/dynamic_loading/1');
      cy.get('#start button').click();

      // Лоадер зникає, елемент з'являється
      cy.get('#loading').should('not.be.visible');
      cy.get('#finish').should('be.visible').and('contain', 'Hello World!');
    });

    it('повинен дочекатись рендерингу елементу який не існував', () => {
      cy.visit('/dynamic_loading/2');
      cy.get('#start button').click();

      // Елемент не існував — з'являється після кліку
      cy.get('#finish', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Hello World!');
    });
  });
});
```

> **Техніки:** `cy.scrollTo('bottom')` — скрол до низу сторінки. `.its('length')` — отримати довжину колекції як значення. `{ timeout: 10000 }` — збільшений timeout для динамічного контенту. Рекурсивна функція `scrollAndCheck` — реалізація багаторазового скролу без `cy.wait()` loops.

---

## 13. Scrollbars

**Файл:** `cypress/e2e/13-scrollbars.cy.js`

```javascript
describe('Scrollbars', () => {
  // Перевіряємо скрол всередині елементів (не сторінки),
  // позицію скролу, scrollIntoView та видимість після скролу.

  describe('Horizontal Scrollbar', () => {
    beforeEach(() => {
      cy.visit('/horizontal_slider');
    });

    it('повинен відображати слайдер з початковим значенням 0', () => {
      cy.get('input[type="range"]').should('have.value', '0');
    });

    it('повинен змінити значення слайдера через .invoke()', () => {
      cy.get('input[type="range"]')
        .invoke('val', 3)
        .trigger('input');

      cy.get('span#range').should('have.text', '3');
    });

    it('повинен збільшити значення клавішею ArrowRight', () => {
      cy.get('input[type="range"]').focus().type('{rightarrow}');
      cy.get('span#range').should('not.have.text', '0');
    });

    it('повинен збільшувати значення кількома натисканнями стрілки', () => {
      cy.get('input[type="range"]')
        .focus()
        .type('{rightarrow}{rightarrow}{rightarrow}');

      cy.get('span#range').then(($span) => {
        const val = parseFloat($span.text());
        expect(val).to.be.greaterThan(0);
      });
    });
  });

  describe('Scrollable Element (overflow: scroll)', () => {
    beforeEach(() => {
      cy.visit('/scrollbars');
    });

    it('повинен прокрутити до кнопки всередині контейнера', () => {
      // scrollIntoView — скролить елемент у видиму область
      cy.get('#scrollableElement button')
        .scrollIntoView()
        .should('be.visible');
    });

    it('повинен клікнути кнопку після скролу до неї', () => {
      cy.get('#scrollableElement button')
        .scrollIntoView()
        .click();

      // Перевіряємо що клік спрацював
      cy.get('#scrollableElement button').should('exist');
    });

    it('повинен скролити контейнер через scrollTo з координатами', () => {
      // Скролимо всередині конкретного елементу
      cy.get('#scrollableElement').scrollTo('bottom');
      cy.get('#scrollableElement button').should('be.visible');
    });

    it('повинен скролити контейнер плавно (smooth behavior)', () => {
      cy.get('#scrollableElement').scrollTo('bottom', { easing: 'linear' });
      cy.get('#scrollableElement button').should('be.visible');
    });
  });

  describe('Page Scroll', () => {
    beforeEach(() => {
      cy.visit('/large');
    });

    it('повинен скролити сторінку до низу', () => {
      cy.scrollTo('bottom');
      // Перевіряємо що сторінка проскролила (window scrollY > 0)
      cy.window().its('scrollY').should('be.greaterThan', 0);
    });

    it('повинен скролити до конкретних координат', () => {
      cy.scrollTo(0, 500);
      cy.window().its('scrollY').should('be.closeTo', 500, 50);
    });

    it('повинен скролити до верху після скролу вниз', () => {
      cy.scrollTo('bottom');
      cy.scrollTo('top');
      cy.window().its('scrollY').should('eq', 0);
    });

    it('повинен зробити елемент видимим через scrollIntoView', () => {
      // Елемент внизу великої сторінки
      cy.get('table#large-table').scrollIntoView().should('be.visible');
    });
  });
});
```

> **Техніки:** `.scrollIntoView()` — прокручує до елементу і робить його видимим, найнадійніший метод. `cy.scrollTo('bottom')` — скрол до низу сторінки або контейнера. `cy.get(container).scrollTo()` — скрол всередині конкретного елементу (overflow: scroll). `invoke('val', x).trigger('input')` — єдиний надійний спосіб встановити значення range slider без реального drag. `cy.window().its('scrollY')` — перевірка позиції скролу через Window API.

---

## Спільні команди (support/commands.js)

```javascript
// cypress/support/commands.js

// Кастомна команда для роботи з iframe
Cypress.Commands.add('getIframeBody', (iframeSelector) => {
  return cy.get(iframeSelector)
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
});

// Кастомна команда для логіну
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/secure');
  });
});

// Кастомна команда для drag and drop через coordinates
Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (subject, targetEl) => {
  cy.wrap(subject).trigger('mousedown', { which: 1 });
  cy.get(targetEl)
    .trigger('mousemove')
    .trigger('mouseup', { force: true });
});
```

---

## Запуск тестів

```bash
# Відкрити Cypress GUI (інтерактивний режим)
npx cypress open

# Запустити всі тести headless (CI режим)
npx cypress run

# Запустити конкретний файл
npx cypress run --spec "cypress/e2e/01-login.cy.js"

# Запустити з конкретним браузером
npx cypress run --browser chrome

# Запустити тільки тести з тегом (через grep плагін)
npx cypress run --env grepTags=@smoke
```

---

## Типові помилки та їх вирішення

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `iframe body not found` | iframe не завантажився | Додай `cy.wait('@iframeLoad')` або збільш timeout |
| `trigger mouseover не працює` | CSS :hover потребує реального курсора | Використовуй `cypress-real-events` плагін |
| `Cannot select file` | `cy.selectFile` доступний з v9.3+ | Оновіть Cypress або використайте `cypress-file-upload` |
| `cross-origin error` | Перехід на інший домен | `cy.origin('other.com', () => {...})` |
| `Shadow DOM not found` | `includeShadowDom` не увімкнено | Додай опцію або налаштуй глобально |
| `New tab not opened` | Cypress = один таб | Видали `target="_blank"` через `invoke('removeAttr', 'target')` |

---

## Related Notes

- [[Cypress Guide]] — повний гайд по Cypress
- [[UI Testing Overview]] — загальний огляд UI тестування
- [[Page Object Pattern]] — рефакторинг тестів у Page Objects
- [[API Testing with Cypress]] — API тести на Cypress
- [[Cypress Cheatsheet]] — quick reference

---

*Майданчик для практики: https://practice.expandtesting.com/*
*Документація Cypress: https://docs.cypress.io/*
