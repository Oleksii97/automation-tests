 Ось коли що використовувати:

## `realHover()` vs `.trigger('mouseover')`

| | `realHover()` | `.trigger('mouseover')` |
|---|---|---|
| Як працює | Імітує реальний рух миші | Штучно запускає JS подію |
| Потрібен плагін | ✅ `cypress-real-events` | ❌ вбудований в Cypress |
| CSS `:hover` спрацьовує | ✅ Так | ❌ Ні |
| JS `mouseover` спрацьовує | ✅ Так | ✅ Так |
| В headless режимі (CI/CD) | ⚠️ Іноді нестабільний | ✅ Стабільний |

---

## Коли що використовувати

```js

перед використанням cy.get('img').realHover();
відкрий файл:
cypress/support/e2e.js
і додай:
import "cypress-real-events";


// ✅ realHover() — коли hover зроблений через CSS
// Наприклад: div:hover .tooltip { display: block }
// Як на нашому сайті — figcaption показується через CSS
cy.get('img').realHover();


// ✅ trigger('mouseover') — коли hover зроблений через JavaScript
// Наприклад: element.addEventListener('mouseover', () => showTooltip())
cy.get('img').trigger('mouseover');
```

---

## Як зрозуміти що використовувати?

Відкрий DevTools → Elements → знайди елемент → подивись:

```
// CSS hover → використовуй realHover()
.figcaption { display: none; }
.figure:hover .figcaption { display: block; }

// JS hover → використовуй trigger()
element.addEventListener('mouseover', handler)
```

---

## Практичне правило

Спробуй спочатку `trigger('mouseover')` — він простіший і не потребує плагіна. Якщо не спрацювало — тоді `realHover()`.

```js
// Спочатку пробуй це
cy.get('img').trigger('mouseover');
cy.get('.tooltip').should('be.visible');

// Якщо не працює — тоді це
cy.get('img').realHover();
cy.get('.tooltip').should('be.visible');
```