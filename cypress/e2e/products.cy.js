// cypress/e2e/products.cy.js
const creds = { email: "santo@gmail.com", password: "12345" };

// Login sin UI y deja token en localStorage
function programmaticLogin() {
  cy.request("POST", "/api/v1/seguridad/login", creds).then(({ body }) => {
    window.localStorage.setItem("token", body.token);
    if (body.refreshToken) window.localStorage.setItem("refreshToken", body.refreshToken);
  });
}

describe("Catálogo – filtra TODAS las categorías", () => {
  before(() => {
    // Nos aseguramos de tener un token antes de cargar productos
    cy.visit("/login.html");
    programmaticLogin();
  });

  beforeEach(() => {
    // Interceptamos todas las cargas de productos (con y sin query)
    cy.intercept("GET", "**/api/v1/productos*").as("getProductos");
    cy.visit("/productos.html");
    cy.contains("Catálogo de Productos", { timeout: 10000 }).should("be.visible");
    cy.wait("@getProductos"); // carga inicial
  });

  it("aplica y valida cada categoría del desplegable", () => {
    // Leemos TODAS las opciones del select
    cy.get("#fCategoria option").then(($opts) => {
      const cats = [...$opts].map(o => o.value).filter(v => v && v !== "Todas");

      // Recorremos cada categoría
      cy.wrap(cats).each((cat) => {
        // Seleccionar la categoría
        cy.get("#fCategoria").select(cat);

        // Esperar la petición de productos filtrada
        cy.wait("@getProductos")
          .its("request.url")
          .should("include", `categoria=${encodeURIComponent(cat)}`);

        // Validar la tabla ya actualizada
        cy.get("#tabla tbody tr").then(($rows) => {
          if ($rows.length === 0) {
            // Caso sin resultados
            cy.get("#msg").should("contain", "No hay productos");
          } else {
            // Columna 2 = Categoría
            cy.get("#tabla tbody tr td:nth-child(2)").each(($td) => {
              expect($td.text().trim()).to.eq(cat);
            });
          }
        });
      });
    });
  });

  it("restaura 'Todas' con el botón Mostrar todos", () => {
    cy.get("#fCategoria").select("Abarrotes");           // cambia a algo distinto
    cy.wait("@getProductos");

    cy.get("#btnLimpiar").click();                       // click en Mostrar todos
    cy.wait("@getProductos").its("request.url")          // cuando es "todas" no debería llevar query de categoría
      .should("not.include", "categoria=");

    // Debe renderizar algo (si tienes data) o al menos no romper
    cy.get("#tabla tbody tr", { timeout: 10000 }).should("exist");
  });

  it("permite cerrar sesión", () => {
    cy.get("#btnLogout").click();
    cy.url({ timeout: 10000 }).should("include", "/login.html");
  });
});