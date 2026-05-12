# 📋 Тести Dropdown — повний розбір коду

> Файл: `DropDownList.cy.js`  
> Сайт: https://practice.expandtesting.com/dropdown  
> Написано так щоб через 10 років відкрити і одразу зрозуміти що відбувається.

---

## 🌐 Що тестуємо

**Dropdown (випадаючий список)** — це HTML елемент `<select>` з опціями `<option>` всередині.

```html
<select id="dropdown">
  <option value="">Please select an option</option>   ← placeholder
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
  <option value="UA" disabled>Ukraine</option>        ← заблокована
</select>
```

Юзер клікає → список розкривається → вибирає значення → сторінка реагує.

---

## 🏗️ Структура файлу

```
describe()        — головний контейнер всіх тестів
  beforeEach()    — виконується перед кожним тестом
  context()       — підгрупа тестів за темою
    it()          — один конкретний тест
```

---

## ⚙️ Верхній блок — налаштування

```js
describe('Dropdown — HTML <select>', () => {

  beforeEach(() => {
    cy.visit('https://practice.expandtesting.com/dropdown');
  });
```

| Команда | Що робить |
|---|---|
| `describe('назва', () => {})` | Створює групу тестів. Cypress показує цю назву у звіті як заголовок |
| `beforeEach(() => {})` | Виконується автоматично **перед кожним** `it()`. Використовується щоб не дублювати `cy.visit()` в кожному тесті |
| `cy.visit(url)` | Відкриває сторінку в браузері |

**Навіщо `beforeEach`:**
```
Без beforeEach — треба писати cy.visit() в кожному тесті:
  it('тест 1', () => { cy.visit(...); ... })
  it('тест 2', () => { cy.visit(...); ... })  ← копіпаста

З beforeEach — один раз:
  beforeEach(() => { cy.visit(...) })
  it('тест 1', () => { ... })  ← чисто
  it('тест 2', () => { ... })  ← чисто
```

---

## 🧪 Група 1 — Стартовий стан

### Тест: dropdown існує і видимий

```js
it('dropdown існує і видимий', () => {
  cy.get('select')
    .should('exist')
    .and('be.visible');
});
```

| Команда | Що робить |
|---|---|
| `cy.get('select')` | Знаходить HTML елемент `<select>` на сторінці |
| `.should('exist')` | Перевіряє що елемент є в DOM (навіть якщо прихований) |
| `.and('be.visible')` | Перевіряє що елемент видимий на екрані (не `display:none`) |
| `.and()` | Додає ще одну перевірку в ланцюжку — те саме що ще один `.should()` |

**Навіщо цей тест:** якщо розробник випадково видалив dropdown або сховав його — цей тест впаде першим і одразу покаже проблему.

---

### Тест: dropdown містить опції

```js
it('dropdown містить опції', () => {
  cy.get('select option')
    .should('have.length.greaterThan', 1);
});
```

| Команда | Що робить |
|---|---|
| `select option` | CSS селектор: знайди всі `<option>` всередині `<select>` |
| `have.length.greaterThan(1)` | Перевіряє що знайдено **більше ніж 1** елемент |

**Чому `greaterThan(1)` а не `greaterThan(0)`:**  
Один елемент може бути — це placeholder "Please select an option".  
Нам потрібні реальні опції для вибору → має бути більше ніж 1.

---

### Тест: показує дефолтне значення

```js
it('показує дефолтне значення', () => {
  cy.get('select option:checked')
    .invoke('text')
    .then((text) => {
      cy.log(`Дефолтне значення: "${text.trim()}"`);
    });
});
```

| Команда | Що робить |
|---|---|
| `option:checked` | CSS псевдоклас: знаходить опцію яка **зараз вибрана** |
| `.invoke('text')` | Витягує текстовий вміст елемента як JavaScript рядок |
| `.then((text) => {})` | Отримує значення і дозволяє з ним працювати |
| `text.trim()` | Прибирає пробіли на початку і в кінці рядка |
| `cy.log()` | Виводить повідомлення в лог Cypress (видно під час запуску) |

**Цей тест не робить жорстких перевірок** — тільки логує. Корисно для документування поведінки сайту.

---

### Тест: всі опції мають текст і value

```js
it('всі опції мають текст і value', () => {
  cy.get('select option').each(($option) => {
    const text  = $option.text().trim();
    const value = $option.attr('value');
    cy.log(`text: "${text}" | value: "${value}"`);
    expect(text).to.not.eq('');
  });
});
```

| Команда | Що робить |
|---|---|
| `.each(($option) => {})` | Перебирає кожен знайдений елемент по черзі. `$option` — поточний елемент |
| `$option.text()` | jQuery метод: повертає текст елемента (без HTML тегів) |
| `$option.attr('value')` | jQuery метод: повертає значення атрибута `value` |
| `expect(text).to.not.eq('')` | Chai assertion: перевіряє що текст НЕ порожній рядок |

**Різниця між `cy.wrap()` і `$option.text()`:**
```js
// Всередині .each() можна використовувати jQuery напряму
$option.text()        // jQuery — швидко, без Cypress
$option.attr('value') // jQuery — швидко, без Cypress

// Але для Cypress команд треба cy.wrap()
cy.wrap($option).should('be.visible') // потрібен wrap
```

---

## 🧪 Група 2 — Вибір опції

### Тест: вибір по value

```js
it('вибір по value атрибуту', () => {
  cy.get('#dropdown').select('1');
  cy.get('select').should('have.value', '1');
});
```

| Команда | Що робить |
|---|---|
| `cy.get('#dropdown')` | Знаходить елемент з `id="dropdown"` (# = id селектор як в CSS) |
| `.select('1')` | Вибирає опцію де `value="1"`. Спеціальна Cypress команда тільки для `<select>` |
| `.should('have.value', '1')` | Перевіряє що поточне вибране значення = `'1'` |

**Три способи використати `.select()`:**
```js
cy.get('select').select('1')         // по value атрибуту → <option value="1">
cy.get('select').select('Option 1')  // по тексту опції   → <option>Option 1</option>
cy.get('select').select(0)           // по індексу        → перша опція (рідко використовується)
```

---

### Тест: вибір по тексту

```js
it('вибір по тексту опції', () => {
  cy.get('#dropdown').select('Option 1');
  cy.get('select').should('have.value', '1');
});
```

Передаємо **текст** що бачить юзер, а не value.  
Cypress сам знайде відповідну опцію і вибере її.

---

### Тест: вибір по індексу

```js
it('вибір по індексу', () => {
  cy.get('select option').eq(1).then(($option) => {
    const value = $option.attr('value');
    cy.get('#dropdown').select(value);
    cy.get('select').should('have.value', value);
  });
});
```

| Команда | Що робить |
|---|---|
| `.eq(1)` | Бере елемент за індексом. `eq(0)` = перший, `eq(1)` = другий (індекси з нуля!) |
| `.then(($option) => {})` | Отримуємо DOM елемент і можемо читати його атрибути |
| `$option.attr('value')` | Читаємо `value` атрибут — це рядок типу `"1"` або `"UA"` |

**Навіщо `eq(1)` а не `eq(0)`:**  
`eq(0)` — це placeholder "Please select an option" з `value=""`.  
`eq(1)` — перша реальна опція з реальним value.

---

### Тест: вибір останньої опції

```js
it('вибір останньої опції', () => {
  cy.get('#dropdown option')
    .not('[value=""]')
    .not('[disabled]')
    .last()
    .then(($option) => {
      const value = $option.attr('value');
      cy.get('#dropdown').select(value);
      cy.get('#dropdown').should('have.value', value);
    });
});
```

| Команда | Що робить |
|---|---|
| `.not('[value=""]')` | Виключає опції де `value=""` — це placeholder |
| `.not('[disabled]')` | Виключає опції з атрибутом `disabled` — їх не можна вибрати |
| `.last()` | Бере останній елемент з тих що залишились після фільтрів |

**Чому треба два `.not()`:**
```
Без фільтрів .last() міг би повернути:
  - placeholder з value=""   → .select('') падає
  - disabled опцію (ZW)      → .select('ZW') падає

З фільтрами .last() повертає останню реальну активну опцію → все ок
```

---

## 🧪 Група 3 — Перебір всіх опцій

### Тест: кожну опцію можна вибрати

```js
it('кожну опцію можна вибрати', () => {
  cy.get('#dropdown option')
    .not('[value=""]')
    .not('[disabled]')
    .each(($option) => {
      const value = $option.attr('value');
      const text  = $option.text().trim();

      cy.log(`Вибираємо: "${text}" (value="${value}")`);

      cy.get('#dropdown').select(value);
      cy.get('#dropdown').should('have.value', value);
    });
});
```

**Що відбувається по кроках:**
```
1. Знаходимо всі опції
2. Виключаємо placeholder (value="")
3. Виключаємо disabled опції
4. Для кожної опції що залишилась:
   а. Читаємо її value і text
   б. Логуємо що вибираємо
   в. Вибираємо через .select()
   г. Перевіряємо що вибралась правильна
```

**Навіщо цей тест замість окремих `it()` для кожної опції:**
```js
// ❌ Без циклу — копіпаста для кожної опції
it('вибір Option 1', () => { cy.get('#dropdown').select('1') })
it('вибір Option 2', () => { cy.get('#dropdown').select('2') })
it('вибір Option 3', () => { cy.get('#dropdown').select('3') })
// ... 200 рядків для 100 країн

// ✅ З циклом — один блок для всіх
cy.get('option').not('[disabled]').each(($option) => {
  cy.get('#dropdown').select($option.attr('value'))
})
```

---

### Тест: після вибору — вибрана тільки вона

```js
it('після вибору кожної опції — вибрана тільки вона', () => {
  cy.get('#dropdown option').not('[value=""]').each(($option) => {
    cy.get('#dropdown').select($option.attr('value'));

    cy.get('#dropdown option:checked')
      .should('have.attr', 'value', $option.attr('value'));
  });
});
```

| Команда | Що робить |
|---|---|
| `option:checked` | Знаходить опцію яка зараз вибрана |
| `.should('have.attr', 'value', '1')` | Перевіряє що атрибут `value` = `'1'` |

**Різниця між `have.value` і `have.attr`:**
```js
cy.get('select').should('have.value', '1')       // value самого <select>
cy.get('option:checked').should('have.attr', 'value', '1') // атрибут <option>
// Обидва перевіряють одне і те саме — просто різні підходи
```

---

## 🧪 Група 4 — Реакція сторінки

### Тест: після вибору з'являється підтвердження

```js
it('після вибору Option 1 — з\'являється підтвердження', () => {
  cy.get('#dropdown').select('1');
  cy.get('body').should('contain.text', 'Option 1');
});
```

| Команда | Що робить |
|---|---|
| `cy.get('body')` | Знаходить весь `<body>` сторінки |
| `.should('contain.text', 'Option 1')` | Перевіряє що десь на сторінці є текст "Option 1" |

**`contain.text` vs `have.text`:**
```js
.should('contain.text', 'Option') // ✅ текст МІСТИТЬ "Option" (часткове співпадіння)
.should('have.text', 'Option 1')  // перевіряє ПОВНИЙ текст елемента (точне співпадіння)
```

---

## 🧪 Група 5 — Граничні випадки

### Тест: placeholder не має реального value

```js
it('placeholder опція не має реального value', () => {
  cy.get('select option').first().then(($option) => {
    const value = $option.attr('value');
    cy.log(`Placeholder value: "${value}"`);
    expect(value === '' || value === undefined).to.be.true;
  });
});
```

| Команда | Що робить |
|---|---|
| `.first()` | Бере перший елемент зі знайдених |
| `value === '' \|\| value === undefined` | Перевіряє обидва варіанти: або порожній рядок, або атрибут відсутній |
| `expect(...).to.be.true` | Chai assertion: перевіряє що вираз = `true` |

---

### Тест: неіснуюче value не вибирається

```js
it('неіснуюче value не вибирається', () => {
  cy.get('select').invoke('val').then((currentValue) => {

    cy.get('select').then(($select) => {
      $select.val('nonexistent_value_xyz');
    });

    cy.get('select').invoke('val').then((newValue) => {
      expect(newValue).to.not.eq('nonexistent_value_xyz');
      cy.log(`Значення після спроби: "${newValue}"`);
    });
  });
});
```

| Команда | Що робить |
|---|---|
| `.invoke('val')` | Викликає jQuery метод `.val()` — читає поточне вибране значення |
| `$select.val('xyz')` | Встановлює значення через jQuery напряму (обходить UI) |
| `.to.not.eq('xyz')` | Перевіряє що значення НЕ рівне — тобто неіснуюче значення не встановилось |

**Навіщо цей тест:**  
Перевіряємо що якщо хтось спробує підставити неіснуюче значення через консоль браузера — select не зломається і не покаже "сміття".

---

## 🔍 Чому `cy.get('select option')` і `cy.get('#dropdown option')` — одне і те саме

В коді ти міг помітити два різних записи які роблять одне і те саме:

```js
cy.get('select option')      // варіант 1
cy.get('#dropdown option')   // варіант 2
```

### Як це працює

```html
<!-- HTML на сторінці -->
<select id="dropdown">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

```js
cy.get('select option')
// Знаходить всі <option> всередині будь-якого <select>
// Пробіл між словами = "шукай ВСЕРЕДИНІ"

cy.get('#dropdown option')
// # означає id — знаходить конкретний <select id="dropdown">
// Потім шукає <option> всередині нього
```

Результат **однаковий** — бо на сторінці є тільки один `<select>` і він має `id="dropdown"`.

---

### Різниця між селекторами

```js
cy.get('select')
// По тегу — знайде ВСІ <select> на сторінці
// Якщо їх 3 — поверне всі 3

cy.get('#dropdown')
// По id — знайде ТІЛЬКИ той що має id="dropdown"
// id завжди унікальний на сторінці

cy.get('select option')
// Пробіл = "шукай всередині"
// Знайде всі <option> в будь-якому <select>

cy.get('#dropdown option')
// Знайде всі <option> тільки в <select id="dropdown">
```

---

### Аналогія з реальним життям

```
cy.get('select option')
→ "знайди всіх мешканців в будь-якому будинку міста"

cy.get('#dropdown option')
→ "знайди всіх мешканців в будинку з номером dropdown"
```

---

### Коли що використовувати

```js
// На сторінці ОДИН select — обидва однакові ✅
cy.get('select option')     // працює
cy.get('#dropdown option')  // працює

// На сторінці КІЛЬКА select — треба уточнювати ⚠️
cy.get('select option')     // знайде опції З УСІХ select — може дати зайвий результат
cy.get('#dropdown option')  // тільки з потрібного — точно і надійно
```

**Правило:** якщо є `id` — завжди використовуй `#id`.  
Тест не зламається якщо на сторінці пізніше додадуть ще один `<select>`.

---

### Таблиця CSS селекторів

| Селектор | Що знаходить | Приклад |
|---|---|---|
| `select` | Елемент по тегу | `cy.get('select')` |
| `#dropdown` | Елемент по id | `cy.get('#dropdown')` |
| `.my-class` | Елемент по класу | `cy.get('.form-select')` |
| `select option` | `<option>` всередині будь-якого `<select>` | `cy.get('select option')` |
| `#dropdown option` | `<option>` всередині конкретного `<select>` | `cy.get('#dropdown option')` |
| `[value="1"]` | Елемент з атрибутом value="1" | `cy.get('[value="1"]')` |
| `[disabled]` | Елемент з атрибутом disabled | `cy.get('[disabled]')` |

---

## 📋 Шпаргалка — всі команди файлу

| Команда | Що робить |
|---|---|
| `cy.visit(url)` | Відкрити сторінку |
| `cy.get('select')` | Знайти `<select>` елемент |
| `cy.get('#dropdown')` | Знайти елемент по id |
| `cy.get('select option')` | Знайти всі `<option>` в `<select>` |
| `.select('value')` | Вибрати опцію по value, тексту або індексу |
| `.should('have.value', 'x')` | Перевірити вибране значення select |
| `.should('exist')` | Елемент є в DOM |
| `.should('be.visible')` | Елемент видимий |
| `.should('contain.text', 'x')` | Елемент містить текст |
| `.should('have.length.greaterThan', n)` | Більше ніж n елементів |
| `.not('[disabled]')` | Виключити disabled елементи |
| `.not('[value=""]')` | Виключити елементи з порожнім value |
| `.each(($el) => {})` | Перебрати кожен елемент |
| `.first()` | Перший елемент |
| `.last()` | Останній елемент |
| `.eq(n)` | Елемент за індексом (з 0) |
| `.invoke('text')` | Отримати текст елемента |
| `.invoke('val')` | Отримати або встановити value |
| `.then(($el) => {})` | Отримати елемент і працювати з ним |
| `$el.attr('value')` | Прочитати атрибут через jQuery |
| `$el.text()` | Прочитати текст через jQuery |
| `cy.log('text')` | Вивести в лог Cypress |
| `expect(x).to.eq(y)` | Порівняти два значення |
| `expect(x).to.not.eq(y)` | Перевірити що НЕ рівні |
| `expect(x).to.be.true` | Перевірити що значення = true |

---

## ⚠️ Типові помилки з dropdown

```
❌ Помилка 1: вибір disabled опції
   cy.get('select').select('ZW') → падає бо ZW disabled
   ✅ Рішення: .not('[disabled]') перед .each()

❌ Помилка 2: вибір placeholder
   cy.get('select option').last() → може повернути placeholder
   ✅ Рішення: .not('[value=""]') перед .last()

❌ Помилка 3: передача числа замість рядка
   cy.get('select').select(10) → шукає по індексу, а не value
   ✅ Рішення: cy.get('select').select('10') → рядок з лапками

❌ Помилка 4: перевірка після .each() не в ланцюжку
   cy.get('option').each(...) потім одразу expect() → може спрацювати до
   ✅ Рішення: перевірку робити всередині .each()
```

---

*Файл: `DropDownList.cy.js` | Фреймворк: Cypress | Сайт: practice.expandtesting.com*
