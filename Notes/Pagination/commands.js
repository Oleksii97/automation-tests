// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                        КАСТОМНІ КОМАНДИ CYPRESS                        ║
// ║                                                                          ║
// ║  Що таке кастомні команди?                                               ║
// ║  Cypress має вбудовані команди: cy.get(), cy.click(), cy.visit()...      ║
// ║  Але ми можемо створювати свої — cy.assertPage(), cy.clickPage() тощо.  ║
// ║                                                                          ║
// ║  Навіщо?                                                                 ║
// ║  1. Не дублювати один і той самий код у кожному тесті                   ║
// ║  2. Якщо селектор зміниться — міняємо тільки тут, не у всіх тестах     ║
// ║  3. Тести стають читабельнішими: cy.assertPage(2) зрозуміліше ніж       ║
// ║     cy.get('#example_paginate .paginate_button.current')...              ║
// ║                                                                          ║
// ║  Cypress.Commands.add('назва', () => { ... })                           ║
// ║  Після цього можна використовувати cy.назва() у будь-якому тесті        ║
// ╚══════════════════════════════════════════════════════════════════════════╝


// ─── assertPage(number) ────────────────────────────────────────────────────
// Перевіряє яка сторінка зараз активна в пагінаторі.
//
// Як це працює в DataTables:
// Активна сторінка — це кнопка з класом .current або .active
// Наприклад: <a class="paginate_button current">2</a>
//
// Чому #example_paginate?
// На сторінці є breadcrumb який теж має клас .active на <li>
// Без #example_paginate Cypress знаходив breadcrumb замість пагінатора!
// #example_paginate — це контейнер саме пагінації DataTables
Cypress.Commands.add('assertPage', (number) => {
  cy.get('#example_paginate').within(() => {
    // .within() — шукаємо елементи ТІЛЬКИ всередині #example_paginate
    cy.get('.paginate_button.current, .paginate_button.active')
      .first()
      .should('contain.text', `${number}`);
      // should() — це assertion (перевірка).
      // contain.text — перевіряє що текст містить наше число
  });
});


// ─── assertItemsCount(count) ──────────────────────────────────────────────
// Перевіряє кількість рядків у таблиці.
//
// #example tbody tr — вибираємо всі <tr> всередині <tbody> таблиці #example
// :visible — тільки видимі рядки (DataTables може ховати рядки через display:none)
Cypress.Commands.add('assertItemsCount', (count) => {
  cy.get('#example tbody tr:visible').should('have.length', count);
  // have.length — перевіряє що знайдено рівно count елементів
});


// ─── assertDisabled(dtIdx) ────────────────────────────────────────────────
// Перевіряє що кнопка пагінації НЕактивна (заблокована).
//
// Важливий нюанс DataTables:
// В HTML кнопка виглядає так:
//   <li class="paginate_button page-item previous disabled">  ← клас на <li>
//     <a data-dt-idx="previous" class="page-link">Previous</a>
//   </li>
//
// Клас 'disabled' додається на <li>, а НЕ на <a>!
// Тому cy.get('[data-dt-idx="previous"]').should('be.disabled') НЕ ПРАЦЮЄ
// Треба знаходити <a> і йти до батьківського <li> через .closest('li')
Cypress.Commands.add('assertDisabled', (dtIdx) => {
  cy.get(`#example_paginate [data-dt-idx="${dtIdx}"]`)
    // [data-dt-idx="previous"] — атрибутний селектор, знаходить елемент з таким атрибутом
    .closest('li')
    // .closest() — піднімається вгору по DOM і знаходить найближчий <li>
    .should('have.class', 'disabled');
    // Перевіряємо що цей <li> має клас 'disabled'
});


// ─── assertEnabled(dtIdx) ─────────────────────────────────────────────────
// Протилежність assertDisabled — перевіряє що кнопка активна.
Cypress.Commands.add('assertEnabled', (dtIdx) => {
  cy.get(`#example_paginate [data-dt-idx="${dtIdx}"]`)
    .closest('li')
    .should('not.have.class', 'disabled');
    // not.have.class — перевіряє ВІДСУТНІСТЬ класу
});


// ─── clickPage(dtIdx) ─────────────────────────────────────────────────────
// Безпечний клік на кнопку next/previous.
//
// Чому не просто cy.get(...).click()?
// Якщо клікнути на disabled кнопку — тест може "пройти" але нічого не станеться.
// Потім наступна перевірка впаде з незрозумілою помилкою.
//
// Наша команда спочатку ПЕРЕВІРЯЄ що кнопка не disabled, і тільки потім клікає.
// Так ми отримаємо зрозумілу помилку одразу в потрібному місці.
Cypress.Commands.add('clickPage', (dtIdx) => {
  cy.get(`#example_paginate [data-dt-idx="${dtIdx}"]`)
    .closest('li')
    .should('not.have.class', 'disabled') // спочатку перевіряємо
    .then(() => {
      // .then() — виконується після того як попередня перевірка пройшла
      cy.get(`#example_paginate [data-dt-idx="${dtIdx}"]`).click();
    });
});


// ─── clickPageNumber(number) ──────────────────────────────────────────────
// Клік на конкретну цифру сторінки в пагінаторі (наприклад, "4").
//
// На цьому сайті НЕМАЄ кнопок "First" і "Last" —
// DataTables налаштований тільки з Previous/Next і номерами сторінок.
// Тому для переходу на сторінку 4 клікаємо на цифру "4".
//
// .not('.previous, .next') — виключаємо кнопки prev/next
// бо вони теж є .paginate_button і можуть містити текст "1" або "4" (рідко, але буває)
Cypress.Commands.add('clickPageNumber', (number) => {
  cy.get('#example_paginate .paginate_button')
    .not('.previous, .next')
    .contains(`${number}`)
    // .contains() — знаходить елемент який містить текст "4"
    .click();
});
