describe("Log in tests", () => {
    it("Valid log in", () => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name")
        .should("be.visible")
        .type("standard_user");

        cy.get("#password")
        .should("be.visible")
        .type("secret_sauce");

        cy.get("#login-button")
        .should("be.visible")
        .click();

        cy.url().should("include", "/inventory.html");
    });

     it("Invalid login", () => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("wewe");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
        cy.get("[data-test='error']").should("be.visible");
    });

       it("Invalid password", () => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauc");
        cy.get("#login-button").click();
        cy.get("[data-test='error']").should("be.visible");
    });

     it("Login and password are empty", () => {
        cy.visit("https://www.saucedemo.com");
        
        cy.get("#login-button").click();
        cy.get("[data-test='error']").should("be.visible");
    });
});

describe("Tests of the cart", () => {
    beforeEach(() => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
    });

    it ("Add item to cart", () => {
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get(".shopping_cart_badge").should("have.text", "1");
        });

    it ("Remove item from cart", () => {
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get(".shopping_cart_badge").should("have.text", "1");
        cy.get("#remove-sauce-labs-backpack").click();
        cy.get(".shopping_cart_badge").should("not.exist");
    });

     it ("Remove item in the cart", () => {
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get(".shopping_cart_badge").should("have.text", "1");
        cy.get(".shopping_cart_link").click();
        cy.get("#remove-sauce-labs-backpack").click();
        cy.get(".shopping_cart_badge").should("not.exist");
    });
    it ("Remove one product out of three from the cart", () => {
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get("#add-to-cart-sauce-labs-bike-light").click();
        cy.get("#add-to-cart-sauce-labs-bolt-t-shirt").click();
        cy.get(".shopping_cart_badge").should("have.text", "3");
        cy.get(".shopping_cart_link").click();
        cy.get("#remove-sauce-labs-bike-light").click();
        cy.get(".shopping_cart_badge").should("have.text", "2");
    });

    it ("Remove all products from the cart", () => {
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get("#add-to-cart-sauce-labs-bike-light").click();
        cy.get("#add-to-cart-sauce-labs-bolt-t-shirt").click();
        cy.get(".shopping_cart_badge").should("have.text", "3");
        cy.get(".shopping_cart_link").click();
        cy.get("#remove-sauce-labs-bike-light").click();
        cy.get("#remove-sauce-labs-backpack").click();
        cy.get("#remove-sauce-labs-bolt-t-shirt").click();
        cy.get(".shopping_cart_badge").should("not.exist");
    });
});


describe("Tests of the full-page", () => {
    beforeEach(() => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
    });

    it ("Add item to cart from full page", () => {
        cy.get("#item_2_title_link").click();
        cy.get("#add-to-cart").click();
        cy.get(".shopping_cart_badge").should("have.text", "1");
    });
    
    it ("Remove item from cart from full page", () => {
        cy.get("#item_2_title_link").click();
        cy.get("#add-to-cart").click();
        cy.get(".shopping_cart_badge").should("have.text", "1");
        cy.get("#remove").click();
        cy.get(".shopping_cart_badge").should("not.exist");
    });
});


describe("Tests of the filter", () => {
    beforeEach(() => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
    });

    it ("Filter from A to Z", () => {
        cy.get(".product_sort_container").select("az");
        cy.get(".inventory_item_name").first().should("have.text", "Sauce Labs Backpack");
    });

    it ("Filter from Z to A", () => {
        cy.get(".product_sort_container").select("za");
        cy.get(".inventory_item_name").first().should("have.text", "Test.allTheThings() T-Shirt (Red)");
    });

    it ("Filter from low to high", () => {
        cy.get(".product_sort_container").select("lohi");
        cy.get(".inventory_item_price").first().should("have.text", "$7.99");
    });

    it ("Filter from high to low", () => {
        cy.get(".product_sort_container").select("hilo");
        cy.get(".inventory_item_price").first().should("have.text", "$49.99");
    });
});



describe("Tests of the checkout", () => {
    beforeEach(() => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
        cy.get("#add-to-cart-sauce-labs-backpack").click();
        cy.get(".shopping_cart_link").click();
        cy.get("#checkout").click();
    });

    it ("Checkout with valid data", () => {
        cy.get("#first-name").type("John");
        cy.get("#last-name").type("Smith");
        cy.get("#postal-code").type("12345");
        cy.get("#continue").click();
        cy.url().should("include", "/checkout-step-two.html");
    });

    it ("Checkout with empty data", () => {
        cy.get("#continue").click();
        cy.get("[data-test='error']").should("be.visible");
    }); 
});


describe("Tests of socials media links", () => {
    beforeEach(() => {
        cy.visit("https://www.saucedemo.com");
        cy.get("#user-name").type("standard_user");
        cy.get("#password").type("secret_sauce");
        cy.get("#login-button").click();
    });

    it ("Twitter link", () => {
        cy.get(".social_twitter a")
        .should("have.attr", "href")
        .and("include", "twitter.com/saucelabs")
    });

    it ("Facebook link", () => {
        cy.get(".social_facebook a")
        .should("have.attr", "href")
        .and("include", "facebook.com/saucelabs")
    });

    it ("LinkedIn link", () => {
        cy.get(".social_linkedin a")
        .should("have.attr", "href")
        .and("include", "linkedin.com/company/sauce-labs")
    });
});