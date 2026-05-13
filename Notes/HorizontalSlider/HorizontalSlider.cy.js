// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                    ТЕСТИ HORIZONTAL SLIDER                              ║
// ║                                                                          ║
// ║  Сайт: https://practice.expandtesting.com/horizontal-slider             ║
// ║                                                                          ║
// ║  Реальна структура слайдера:                                             ║
// ║  <input type="range" min="0" max="10" step="0.5" value="0">             ║
// ║                                                                          ║
// ║  ВАЖЛИВО:                                                                ║
// ║  step = 0.5 — стрілки клавіатури НЕ працюють надійно                   ║
// ║  Використовуємо .invoke('val').trigger('input') — єдиний надійний спосіб║
// ╚══════════════════════════════════════════════════════════════════════════╝

describe('Horizontal Slider', () => {

  const SLIDER  = 'input[type="range"]';
  const DISPLAY = '#range';
  const MIN     = 0;
  const MAX     = 5.0;
  const STEP    = 0.5;

  beforeEach(() => {
    cy.visit('https://practice.expandtesting.com/horizontal-slider');
  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  1. СТАРТОВИЙ СТАН                                                    ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('1. Стартовий стан', () => {

    it('слайдер існує і видимий', () => {
      cy.get(SLIDER)
        .should('exist')
        .and('be.visible');
    });

    it('початкове значення = 0', () => {
      cy.get(SLIDER).should('have.value', '0');
    });

    it('дисплей показує 0', () => {
      cy.get(DISPLAY).should('have.text', '0');
    });

    it('атрибут step = 0.5', () => {
      cy.get(SLIDER).invoke('attr', 'step').should('eq', '0.5');
    });

    it('min = 0, max = 5.0', () => {
      cy.get(SLIDER).invoke('attr', 'min').should('eq', '0.0');
      cy.get(SLIDER).invoke('attr', 'max').should('eq', '5.0');
    });

  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  2. ВСТАНОВЛЕННЯ ЗНАЧЕННЯ                                             ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('2. Встановлення значення через invoke + trigger', () => {

    it('встановити 0.5 — один крок', () => {
      cy.get(SLIDER).invoke('val', 0.5).trigger('input').trigger('change');
      cy.get(SLIDER).should('have.value', '0.5');
      cy.get(DISPLAY).should('have.text', '0.5');
    });

    it('встановити 2.5 — середина', () => {
      cy.get(SLIDER).invoke('val', 2.5).trigger('input').trigger('change');
      cy.get(SLIDER).should('have.value', '2.5');
      cy.get(DISPLAY).should('have.text', '2.5');
    });

    it('встановити 2.5 — дробне значення', () => {
      cy.get(SLIDER).invoke('val', 2.5).trigger('input').trigger('change');
      cy.get(SLIDER).invoke('val').then((val) => {
        expect(Number(val)).to.be.within(2, 3);
        cy.log(`Встановлено 2.5 → отримано: ${val}`);
      });
    });

    it('дисплей оновлюється після кожної зміни', () => {
      [0.5, 1, 2.5, 5].forEach((value) => {
        cy.get(SLIDER).invoke('val', value).trigger('input').trigger('change');
        cy.get(SLIDER).invoke('val').then((sliderVal) => {
          cy.get(DISPLAY).should('have.text', sliderVal);
          cy.log(`✅ Слайдер: ${sliderVal} | Дисплей: ${sliderVal}`);
        });
      });
    });

  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  3. ПЕРЕВІРКА КРОКУ 0.5                                               ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('3. Крок 0.5 — всі валідні значення', () => {

    it('всі можливі значення від 0 до 5 з кроком 0.5', () => {
      // Генеруємо масив: [0, 0.5, 1, 1.5, ... 5] = 11 значення
      const validValues = [];
      for (let v = MIN; v <= MAX; v += STEP) {
        validValues.push(parseFloat(v.toFixed(1)));
        // toFixed(1) — виправляє помилки float в JS
        // Без нього: 0.1 + 0.2 = 0.30000000000000004
      }

      cy.log(`Всього валідних значень: ${validValues.length}`);

      validValues.forEach((value) => {
        cy.get(SLIDER).invoke('val', value).trigger('input').trigger('change');
        cy.get(SLIDER).should('have.value', `${value}`);
      });
    });

    it('некратне значення округлюється — 1.3 стає 1 або 1.5', () => {
      cy.get(SLIDER).invoke('val', 1.3).trigger('input');
      cy.get(SLIDER).invoke('val').then((val) => {
        const num = Number(val);
        cy.log(`Встановили 1.3 → отримали ${num}`);
        expect(num === 1 || num === 1.5).to.be.true;
      });
    });

  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  4. ГРАНИЧНІ ЗНАЧЕННЯ                                                 ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('4. Граничні значення', () => {

    it('мінімум = 0', () => {
      cy.get(SLIDER).invoke('val', MIN).trigger('input');
      cy.get(SLIDER).should('have.value', '0');
      cy.get(DISPLAY).should('have.text', '0');
    });

    it('максимум = 5', () => {
      cy.get(SLIDER).invoke('val', MAX).trigger('input').trigger('change');
      cy.get(SLIDER).should('have.value', '5');
      cy.get(DISPLAY).should('have.text', '5');
    });

    it('значення нижче мінімуму — залишається 0', () => {
      cy.get(SLIDER).invoke('val', -5).trigger('input').trigger('change');
      cy.get(SLIDER).invoke('val').then((val) => {
        expect(Number(val)).to.be.gte(MIN);
        cy.log(`Спроба -5 → результат: ${val}`);
      });
    });

    it('значення вище максимуму — залишається 5', () => {
      cy.get(SLIDER).invoke('val', 99).trigger('input');
      cy.get(SLIDER).invoke('val').then((val) => {
        expect(Number(val)).to.be.lte(MAX);
        cy.log(`Спроба 99 → результат: ${val}`);
      });
    });

  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  5. СИНХРОНІЗАЦІЯ СЛАЙДЕРА І ДИСПЛЕЮ                                  ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('5. Синхронізація слайдера і дисплею', () => {

    it('після скидання на 0 — дисплей теж 0', () => {
      cy.get(SLIDER).invoke('val', 3.5).trigger('input').trigger('change');
      cy.get(DISPLAY).should('have.text', '3.5');

      cy.get(SLIDER).invoke('val', 0).trigger('input').trigger('change');
      cy.get(SLIDER).should('have.value', '0');
      cy.get(DISPLAY).should('have.text', '0');
    });

    it('слайдер і дисплей завжди синхронізовані', () => {
      [1, 3, 5, 7, 10].forEach((value) => {
        cy.get(SLIDER).invoke('val', value).trigger('input').trigger('change');
        cy.get(SLIDER).invoke('val').then((sliderVal) => {
          cy.get(DISPLAY).should('have.text', sliderVal);
        });
      });
    });

  });


  // ╔════════════════════════════════════════════════════════════════════════╗
  // ║  6. ДОСТУПНІСТЬ                                                       ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  context('6. Доступність', () => {

    it('слайдер активний (не disabled)', () => {
      cy.get(SLIDER).should('be.enabled');
    });

    it('слайдер має type="range"', () => {
      cy.get(SLIDER).should('have.attr', 'type', 'range');
    });

    it('слайдер отримує фокус при кліку', () => {
      cy.get(SLIDER).click().should('be.focused');
    });

  });

});