Коли використовувати realHover()

✔ CSS hover (dropdown, tooltip, cards)
✔ меню, що відкривається по hover
✔ анімації через :hover
✔ production-like поведінка

1) Встановити плагін
npm install cypress-real-events

2) Підключити плагін

відкрий файл:

cypress/support/e2e.js

і додай:

import "cypress-real-events";
Тепер можна писати тест 
---------------------------------------------------------------------------------------------------------------


describe("Hover Test", () => {
    it("should display tooltip on hover", () => {

        cy.visit("https://practice.expandtesting.com/hovers");

        cy.get('[data-testid="img-user-1"]').realHover();

        cy.contains('name: user1').should("be.visible");
    });
});



Або без інсталяцйії плагіна

якщо логіка працює через:

✔ onMouseOver
✔ addEventListener


describe("Hover Test", () => {
    it("should display tooltip on hover", () => {

        cy.visit("https://practice.expandtesting.com/hovers");

        cy.get('[data-testid="img-user-1"]').trigger('mouseover');
        
        cy.contains('name: user1').should("be.visible");
    });
});
