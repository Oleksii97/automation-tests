const users = [
  { img: 'img-user-1', name: 'user1' },
  { img: 'img-user-2', name: 'user2' },
  { img: 'img-user-3', name: 'user3' },
  
];

describe('Hover Test', () => {
  users.forEach(({ img, name }) => {
    it(`показує підпис для ${name} при наведенні`, () => {
      cy.visit('https://practice.expandtesting.com/hovers');

      cy.get(`[data-testid="${img}"]`).realHover();

      // .parent()        — піднімаємось на рівень вгору від img
      // .find()          — шукаємо figcaption всередині того самого блоку
      // .invoke('show')  — примусово прибираємо display:none
      cy.get(`[data-testid="${img}"]`)
        .parent()
        .find('.figcaption')
        .invoke('show')
        .should('contain.text', `name: ${name}`);
    });
  });
});