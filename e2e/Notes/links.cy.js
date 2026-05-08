// ==========================================
// Social Media Links Tests (Cypress)
// ==========================================

describe("Tests of social media links", () => {

    // beforeEach runs before every test case
    // Purpose: prepare test state (open app + login)
    beforeEach(() => {

        // Open main page of the application
        cy.visit("https://www.saucedemo.com")

        // Enter username
        cy.get("#user-name").type("standard_user")

        // Enter password
        cy.get("#password").type("secret_sauce")

        // Click login button
        cy.get("#login-button").click()
    })


    // ==========================================
    // Twitter link test
    // ==========================================
    it("Twitter link validation", () => {

        // We do NOT click external links (new tab / cross-domain issue)
        // Instead we validate that href attribute is correct
        cy.get(".social_twitter a")
            .should("have.attr", "href")
            .and("include", "twitter.com/saucelabs")
    })


    // ==========================================
    // Facebook link test
    // ==========================================
    it("Facebook link validation", () => {

        // Validate Facebook link without navigation
        cy.get(".social_facebook a")
            .should("have.attr", "href")
            .and("include", "facebook.com/saucelabs")
    })


    // ==========================================
    // LinkedIn link test
    // ==========================================
    it("LinkedIn link validation", () => {

        // Validate LinkedIn link without clicking
        cy.get(".social_linkedin a")
            .should("have.attr", "href")
            .and("include", "linkedin.com/company/sauce-labs")
    })

})


// ==========================================
// WHEN TO USE click() + cy.url()
// ==========================================
//
// Use click() + cy.url() ONLY for internal navigation
// (same domain application pages)
//
// Example:
// - login → inventory page
// - product → product details
// - cart → checkout
//
// Example:
// cy.get("#login-button").click()
// cy.url().should("include", "/inventory")
//
// ==========================================
//
// WHEN NOT TO USE click()
// ==========================================
//
// DO NOT click external links:
// - Twitter
// - Facebook
// - LinkedIn
//
// Reason:
// - opens new tab (target="_blank")
// - cross-origin restrictions
// - flaky tests in Cypress
//
// Instead:
// - validate href attribute only
// ==========================================