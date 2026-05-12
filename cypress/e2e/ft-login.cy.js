// ============================================================
// FT-01: Login Admin
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-01: Login Admin", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // Firebase Auth juga nyimpen session di IndexedDB, harus dihapus juga
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase("firebaseLocalStorageDb");
    });
    cy.visit("/login");
    cy.get("form", { timeout: 10000 }).should("be.visible");
  });

  it("Berhasil login dengan email dan password yang valid", () => {
    cy.get('input[type="email"], input[name="email"]')
      .should("be.visible")
      .clear()
      .type("admin@strongfitgym.com");

    cy.get('input[type="password"], input[name="password"]')
      .should("be.visible")
      .clear()
      .type("strongfitgym");

    cy.contains("button", /login|masuk/i).click();

    cy.url({ timeout: 15000 }).should("satisfy", (url) => {
      return url.includes("/dashboard") || url === Cypress.config("baseUrl") + "/";
    });

    cy.contains(/dashboard|member aktif/i, { timeout: 15000 }).should("be.visible");
  });

  it("Gagal login dengan email atau password yang tidak valid", () => {
    cy.get('input[type="email"], input[name="email"]')
      .clear()
      .type("salah@email.com");

    cy.get('input[type="password"], input[name="password"]')
      .clear()
      .type("passwordsalah");

    cy.contains("button", /login|masuk/i).click();

    cy.contains("p", "Email atau password salah", { timeout: 10000 })
      .should("be.visible");

    cy.url().should("include", "/login");
  });
});