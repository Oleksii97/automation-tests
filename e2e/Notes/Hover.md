Коли використовувати realHover()

✔ CSS hover (dropdown, tooltip, cards)
✔ меню, що відкривається по hover
✔ анімації через :hover
✔ production-like поведінка


describe("Hover Test", () => {
    it("should display tooltip on hover", () => {

        cy.visit("https://practice.expandtesting.com/hovers");

        cy.get('[data-testid="img-user-1"]').realHover();

        cy.contains('name: user1').should("be.visible");
    });
});



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