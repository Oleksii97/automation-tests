describe("login test", () => {
   const username = "#username";
   const password = "#password";
   const submitButton = "#submit-login";
   
   beforeEach(() => {
    cy.visit("https://practice.expandtesting.com/login");
    cy.get(username).should("be.visible");
    cy.get(password).should("be.visible");
    cy.get(submitButton).should("be.visible");
  });


  it("Positive test", () => {
    
        // Знаходимо інпут з поштою та вводимо email
        cy.get(username).type("practice");
        cy.get(password).type("SuperSecretPassword!");
        cy.get(submitButton).click();

        // Перевіряємо, що ми успішно увійшли
        cy.url().should("include", "/secure");
        cy.contains("Secure Area page for Automation Testing Practice").should("be.visible");
  });


  it("Login after log out", () => {
    
        // Знаходимо інпут з поштою та вводимо email
        cy.get(username).type("practice");
        cy.get(password).type("SuperSecretPassword!");
        cy.get(submitButton).click();

        // Клікаємо на кнопку виходу
        cy.get(".icon-2x.icon-signout").click();
  });

  it("Negative username", () => {
   
        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get(username).type("wrongusername");
        cy.get(password).type("SuperSecretPassword!");
        cy.get(submitButton).click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

  it("Negative password", () => {
   
        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get(username).type("practice");
        cy.get("#password").type("WrongPassword");
        cy.get("#submit-login").click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your password is invalid!").should("be.visible");
  });

  it("Field of username is empty", () => {
        // Знаходимо інпут з поштою та вводимо неправильний email
        //cy.get(username).type("");
        cy.get(password).type("SuperSecretPassword!");
        cy.get(submitButton).click();    

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your username is invalid!").should("be.visible");
  });

      it("Field of password is empty", () => {
        // Знаходимо інпут з поштою та вводимо неправильний email
        cy.get(username).type("practice");
        //cy.get("#password").type("");
        cy.get("#submit-login").click();      

        // Перевіряємо, що з'явилося повідомлення про помилку
        cy.contains("Your password is invalid!").should("be.visible");
  });

      
  
      it("XSS attempt", () => {
        // Знаходимо інпут з поштою та вводимо неправильний email
      cy.get(username).type("<script>alert('XSS')</script>");
      cy.get("#password").type("SuperSecretPassword!");
      cy.get("#submit-login").click();      
      // Перевіряємо, що з'явилося повідомлення про помилку
      cy.contains("Your username is invalid!").should("be.visible");
      });




      it.only("Back button after logout", () => {
      cy.get(username).type("practice");
      cy.get(password).type("SuperSecretPassword!");
      cy.get(submitButton).click();
      cy.url().should("include", "/secure");

      // Логаут
      cy.get(".icon-2x.icon-signout").click();
      cy.url().should("include", "/login");

      // Натискаємо "Назад" — браузер повертає на /secure
      cy.go("back");

      // ✅ Правильна перевірка — сторінка має редіректнути на /login
      // бо сесія вже закінчилась після логауту
      cy.url().should("include", "/login");
      });

    it("Leading/trailing spaces", () => {
        // Знаходимо інпут з поштою та вводимо email
        cy.get(username).type("                                                                       practice  ");
        cy.get(password).type("SuperSecretPassword!");
        cy.get(submitButton).click();

        // Перевіряємо, що ми успішно увійшли
        cy.contains("Your username is invalid!").should("be.visible");
      });

});
