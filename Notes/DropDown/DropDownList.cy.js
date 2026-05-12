// ╔══════════════════════════════════════════════════════════════════════════╗
// ║              ТЕСТИ DROPDOWN — HTML <select> та кастомний                ║
// ║                                                                          ║
// ║  Сторінка 1 (HTML select):                                               ║
// ║  https://practice.expandtesting.com/dropdown                             ║
// ║                                                                          ║
// ║                          ║
// ║                                                                          ║
// ║  Різниця між типами:                                                     ║
// ║  HTML <select>  → вбудований браузерний елемент                          ║
// ║                 → .select('value') — одна команда                        ║
// ║ 
// ╚══════════════════════════════════════════════════════════════════════════╝


// ═════════════════════════════════════════════════════════════════════════════
// ЧАСТИНА 1 — HTML <select>
// https://practice.expandtesting.com/dropdown
// ═════════════════════════════════════════════════════════════════════════════

describe('Dropdown — HTML <select>', () => {

  beforeEach(() => {
    cy.visit('https://practice.expandtesting.com/dropdown');
  });


  // ── 1. Стартовий стан ─────────────────────────────────────────────────────

  context('1. Стартовий стан', () => {

    it('dropdown існує і видимий', () => {
      cy.get('select')
        .should('exist')
        .and('be.visible');
    });

    it('dropdown містить опції', () => {
      // Має бути більше ніж 1 опція (не рахуємо placeholder)
      cy.get('select option')
        .should('have.length.greaterThan', 1);
    });

    it('показує дефолтне значення', () => {
      // :checked — знаходить вибрану на даний момент опцію
      cy.get('select option:checked')
        .invoke('text')
        .then((text) => {
          cy.log(`Дефолтне значення: "${text.trim()}"`);
          // Зазвичай це "Please select an option" або перша опція
        });
    });

    it('всі опції мають текст і value', () => {
      cy.get('select option').each(($option) => {
        const text  = $option.text().trim();
        const value = $option.attr('value');
        cy.log(`text: "${text}" | value: "${value}"`);
        // Кожна реальна опція має мати текст
        expect(text).to.not.eq('');
      });
    });

  });


  // ── 2. Вибір опції ────────────────────────────────────────────────────────

  context('2. Вибір опції', () => {

    it('вибір по value атрибуту', () => {
      // .select('1') — знаходить <option value="1"> і вибирає її
      cy.get('#dropdown').select('1');
      cy.get('select').should('have.value', '1');
    });

    it('вибір по тексту опції', () => {
      // .select('Option 1') — знаходить опцію з таким текстом
      cy.get('#dropdown').select('Option 1');
      cy.get('select').should('have.value', '1');
    });

    it('вибір по індексу', () => {
      // eq(1) — пропускаємо placeholder (eq(0)), беремо першу реальну опцію
      cy.get('select option').eq(1).then(($option) => {
        const value = $option.attr('value');
        cy.get('#dropdown').select(value);
        cy.get('select').should('have.value', value);
      });
    });

    it('вибір останньої опції', () => {
  // not('[value=""]')    — пропускаємо placeholder
  // not('[disabled]')    — пропускаємо заблоковані опції
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

  });


  // ── 3. Перебір всіх опцій ─────────────────────────────────────────────────

  context('3. Перебір всіх опцій', () => {

   it('кожну опцію можна вибрати', () => {
  cy.get('#dropdown option')
    .not('[value=""]')    // пропускаємо placeholder
    .not('[disabled]')    // пропускаємо заблоковані опції
    .each(($option) => {
      const value = $option.attr('value');
      const text  = $option.text().trim();

      cy.log(`Вибираємо: "${text}" (value="${value}")`);

      cy.get('#dropdown').select(value);
      cy.get('#dropdown').should('have.value', value);
    });
});

    it('після вибору кожної опції — вибрана тільки вона', () => {
      cy.get('#dropdown option').not('[value=""]').each(($option) => {
        cy.get('#dropdown').select($option.attr('value'));

        // Перевіряємо що вибрана саме ця опція
        cy.get('#dropdown option:checked')
          .should('have.attr', 'value', $option.attr('value'));
      });
    });

  });


  // ── 4. Реакція сторінки ───────────────────────────────────────────────────

  context('4. Реакція сторінки після вибору', () => {

    it('після вибору Option 1 — з\'являється підтвердження', () => {
      cy.get('#dropdown').select('1');

      // На сайті після вибору з'являється текст з результатом
      cy.get('body').should('contain.text', 'Option 1');
    });

    it('після вибору Option 2 — текст змінюється', () => {
      cy.get('#dropdown').select('1');

      cy.get('#dropdown').select('2');

      cy.get('body').should('contain.text', 'Option 2');
    });

  });


  // ── 5. Граничні випадки ───────────────────────────────────────────────────

  context('5. Граничні випадки', () => {

    it('placeholder опція не має реального value', () => {
      cy.get('select option').first().then(($option) => {
        // Перша опція (placeholder) зазвичай має value="" або disabled
        const value = $option.attr('value');
        cy.log(`Placeholder value: "${value}"`);
        expect(value === '' || value === undefined).to.be.true;
      });
    });

    it('неіснуюче value не вибирається', () => {
      // Зберігаємо поточне значення
      cy.get('select').invoke('val').then((currentValue) => {
        // Намагаємось вибрати неіснуюче значення через JS
        cy.get('select').then(($select) => {
          $select.val('nonexistent_value_xyz');
        });

        // Значення не змінилось (або стало порожнім)
        cy.get('select').invoke('val').then((newValue) => {
          expect(newValue).to.not.eq('nonexistent_value_xyz');
          cy.log(`Значення після спроби: "${newValue}"`);
        });
      });
    });

  });

});


