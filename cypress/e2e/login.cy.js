describe("Login → Productos", () => {
  it("loguea y ve catálogo", () => {
    cy.visit("/login.html");
    cy.contains("Inicio de Sesión", { timeout: 10000 }).should("be.visible");

    cy.get("#email", { timeout: 10000 }).should("be.visible").type("santo@gmail.com");
    cy.get("#password").should("be.visible").type("12345");
    cy.contains("Iniciar Sesión").should("be.enabled").click();

    cy.url({ timeout: 10000 }).should("include", "/productos.html");
    cy.contains("Catálogo de Productos", { timeout: 10000 }).should("be.visible");
  });
});
