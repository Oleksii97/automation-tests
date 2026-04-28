describe("login test", () => {
  it("Positive test", () => {
    cy.visit("https://practice.expandtesting.com/login");

        // Знаходимо інпут з поштою та вводимо email
        cy.get("#username").type("practice");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();

        // Перевіряємо, що ми успішно увійшли
        cy.url().should("include", "/secure");
        cy.contains("Secure Area page for Automation Testing Practice").should("be.visible");
  });


  it("Login after log out", () => {
    cy.visit("https://practice.expandtesting.com/login");

        // Знаходимо інпут з поштою та вводимо email
        cy.get("#username").type("practice");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();

        // Клікаємо на кнопку виходу
        cy.get(".icon-2x.icon-signout").click();

        });

  it("Negative username", () => {
    cy.visit("https://practice.expandtesting.com/login");   

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("wrongusername");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

  it("Negative password", () => {
    cy.visit("https://practice.expandtesting.com/login");   

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("practice");
        cy.get("#password").type("WrongPassword");
        cy.get("#submit-login").click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your password is invalid!").should("be.visible");
  });

  it("Field of username is empty", () => {
    cy.visit("https://practice.expandtesting.com/login");   

        // Знаходимо інпут з поштою та вводимо неправильний email
        //cy.get("#username").type("");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

  it("Field of password is empty", () => {
    cy.visit("https://practice.expandtesting.com/login"); 

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("practice");
        //cy.get("#password").type("");
        cy.get("#submit-login").click();      

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your password is invalid!").should("be.visible");
  });

  it("SQL Injection", () => {
    cy.visit("https://practice.expandtesting.com/login"); 

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("practice' OR 1=1 --");
        //cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();      

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

  it("XSS attempt", () => {
    cy.visit("https://practice.expandtesting.com/login"); 

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("<script>alert('XSS')</script>");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();      

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

    it("Back button after logout", () => {
    cy.visit("https://practice.expandtesting.com/login"); 

        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get("#username").type("practice");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();      

        // Клікаємо на кнопку виходу
        cy.get(".icon-2x.icon-signout").click();    
        // Натискаємо кнопку "Назад" в браузері
        cy.go("back");

        // Перевіряємо, що ми не повернулися на захищену сторінку
        cy.url().should("include", "/login");
        cy.contains("You logged out of the secure area!").should("be.visible");
  });

  it("Leading/trailing spaces", () => {
    cy.visit("https://practice.expandtesting.com/login");

        // Знаходимо інпут з поштою та вводимо email
        cy.get("#username").type("                                                                       practice  ");
        cy.get("#password").type("SuperSecretPassword!");
        cy.get("#submit-login").click();

        // Перевіряємо, що ми успішно увійшли
        cy.contains("Your username is invalid!").should("be.visible");
  });

});
