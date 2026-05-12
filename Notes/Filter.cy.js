describe("Tests of product sorting filter", () => {

    // beforeEach виконується перед кожним тестом
    // використовується для уникнення дублювання логіну
    beforeEach(() => {

        // відкриваємо сторінку сайту
        cy.visit("https://www.saucedemo.com")

        // вводимо логін
        cy.get("#user-name").type("standard_user")

        // вводимо пароль
        cy.get("#password").type("secret_sauce")

        // натискаємо кнопку входу
        cy.get("#login-button").click()
    })

    it("Filter products from A to Z", () => {

        // select() - вибір значення у dropdown
        cy.get(".product_sort_container").select("az")

        // first() - беремо перший елемент зі списку
        // should("have.text") - перевіряє текст елемента
        cy.get(".inventory_item_name")
            .first()
            .should("have.text", "Sauce Labs Backpack")
    })

    it("Filter products from Z to A", () => {

        cy.get(".product_sort_container").select("za")

        cy.get(".inventory_item_name")
            .first()
            .should("have.text", "Test.allTheThings() T-Shirt (Red)")
    })

    it("Filter products from low to high price", () => {

        cy.get(".product_sort_container").select("lohi")

        cy.get(".inventory_item_price")
            .first()
            .should("have.text", "$7.99")
    })

    it("Filter products from high to low price", () => {

        cy.get(".product_sort_container").select("hilo")

        cy.get(".inventory_item_price")
            .first()
            .should("have.text", "$49.99")
    })

})