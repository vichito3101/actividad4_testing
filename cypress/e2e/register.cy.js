// cypress/e2e/register.cy.js

// Utilidad para generar datos únicos por ejecución
const uid = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

describe("Registro de usuario", () => {
  beforeEach(() => {
    // Intercepta el POST para sincronizarnos con la respuesta del backend
    cy.intercept("POST", "**/api/v1/seguridad/create").as("crearUsuario");
    cy.visit("/register.html");
    cy.contains("Registro de usuario").should("be.visible");
  });

  it("muestra los campos del formulario", () => {
    cy.get("#nombre").should("be.visible");
    cy.get("#apellido").should("be.visible");
    cy.get("#nro_documento").should("be.visible");
    cy.get("#edad").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#rol").should("be.visible");
  });

  it("valida DNI y contraseña en el cliente", () => {
    cy.get("#nombre").type("Ana");
    cy.get("#apellido").type("Pérez");
    cy.get("#nro_documento").type("12345678");           // inválido
    cy.get("#edad").type("20");
    cy.get("#email").type(`ana${uid()}@test.com`);
    cy.get("#password").type("123");                // muy corta
    cy.get("button[type='submit']").click();

    cy.get("#msg")
      .should("be.visible")
      .and(($m) => {
        // Puede salir uno de los dos mensajes, validamos cualquiera
        const t = $m.text();
        expect(
          t.includes("DNI inválido") || t.includes("Contraseña muy corta"),
          "mensaje de validación"
        ).to.equal(true);
      });
  });

  it("registra un usuario nuevo y redirige a login", () => {
    const suf = uid(); // asegura unicidad
    const email = `user${suf}@test.com`;
    const dni = (10000000 + Number(suf.slice(-7))).toString().slice(0, 8); // 8 dígitos

    cy.get("#nombre").clear().type("Carlos");
    cy.get("#apellido").clear().type("Lopez");
    cy.get("#nro_documento").clear().type(dni);
    cy.get("#edad").clear().type("30");
    cy.get("#email").clear().type(email);
    cy.get("#password").clear().type("abcd1234");
    cy.get("#rol").select("cliente");

    cy.get("button[type='submit']").click();

    // Espera la respuesta del backend y verifica 2xx
    cy.wait("@crearUsuario").its("response.statusCode").should("be.within", 200, 299);

    // El HTML hace setTimeout de 900ms antes de redirigir
    cy.url({ timeout: 10000 }).should("include", "/login.html");
  });

  it("botón 'Volver al login' navega correctamente", () => {
    cy.get("#btnBackLogin").click();
    cy.url({ timeout: 10000 }).should("include", "/login.html");
  });
});
