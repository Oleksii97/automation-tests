describe("registration tests", () => {
beforeEach(() => {
    cy.visit("https://practice.expandtesting.com/register");
});

  it("Positive test", () => {

        cy.get("#username").type("Dartanaine");
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();

    cy.contains("Successfully registered, you can log in now.").should("be.visible");
  });

    it("Negative test - password mismatch", () => { 
               cy.get("#username").type("Dartanaine");
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password321")
        cy.get('button[type="submit"]').click();

    cy.contains("An error occurred during registration. Please try again.").should("be.visible");
  });

    it("Log in is empty", () => { 
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();

    cy.contains("All fields are required.").should("be.visible");
    });

    it("Password is empty", () => {
        cy.get("#username").type("Dartanaine");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();

    cy.contains("All fields are required.").should("be.visible");
    });

    it("Confirm password is empty", () => {
        cy.get("#username").type("Dartanaine");
        cy.get("#password").type("password123");
        cy.get('button[type="submit"]').click(); 

    cy.contains("All fields are required.").should("be.visible");
    });

    it("Password is too short", () => {
        cy.get("#username").type("Dartanaine");
        cy.get("#password").type("12");
        cy.get("#confirmPassword").type("12")
        cy.get('button[type="submit"]').click();

    cy.contains("Password must be at least 4 characters long.").should("be.visible");
    });

    it("incorrect username", () => {

        cy.get("#username").type("testtest.com");
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();

    cy.contains("Invalid username. Usernames can only contain lowercase letters, numbers, and single hyphens, must be between 3 and 39 characters, and cannot start or end with a hyphen.").should("be.visible");
    });

    it("Space in password", () => {
        cy.get("#username").type("Dartanaine");
        cy.get("#password").type("password 123");
        cy.get("#confirmPassword").type("password 123")
        cy.get('button[type="submit"]').click();

    cy.contains("An error occurred during registration. Please try again.").should("be.visible");
    });

     it("SQL Injection", () => {
        cy.get("#username").type("Dartanaine' OR '1'='1");
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();
 
    cy.contains("Invalid username. Usernames can only contain lowercase letters, numbers, and single hyphens, must be between 3 and 39 characters, and cannot start or end with a hyphen.").should("be.visible");
    });

     it("XSS Attack", () => {
        cy.get("#username").type("<script>alert('XSS')</script>");
        cy.get("#password").type("password123");
        cy.get("#confirmPassword").type("password123")
        cy.get('button[type="submit"]').click();

     cy.contains("Invalid username. Usernames can only contain lowercase letters, numbers, and single hyphens, must be between 3 and 39 characters, and cannot start or end with a hyphen.").should("be.visible");
    });


});
