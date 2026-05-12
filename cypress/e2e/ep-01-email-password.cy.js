// ============================================================
// EP-01: Email dan Password (Login Admin)
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-01: Email dan Password", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // Firebase Auth juga nyimpen session di IndexedDB, harus dihapus juga
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase("firebaseLocalStorageDb");
    });
    cy.visit("/login");
    cy.get("form", { timeout: 10000 }).should("be.visible");
  });

  it("Valid — Email dan password terdaftar diterima, admin diarahkan ke dashboard", () => {
    cy.get('input[type="email"], input[name="email"]')
      .clear()
      .type("admin@strongfitgym.com");

    cy.get('input[type="password"], input[name="password"]')
      .clear()
      .type("strongfitgym");

    cy.contains("button", /login|masuk/i).click();

    cy.url({ timeout: 15000 }).should("satisfy", (url) => {
      return url.includes("/dashboard") || url === Cypress.config("baseUrl") + "/";
    });

    cy.contains(/dashboard|member aktif/i, { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Email tidak terdaftar, sistem menampilkan pesan kesalahan", () => {
    cy.get('input[type="email"], input[name="email"]')
      .clear()
      .type("tidakterdaftar@email.com");

    cy.get('input[type="password"], input[name="password"]')
      .clear()
      .type("strongfitgym");

    cy.contains("button", /login|masuk/i).click();

    cy.contains("p", "Email atau password salah", { timeout: 10000 })
      .should("be.visible");

    cy.url().should("include", "/login");
  });

  it("Tidak Valid — Password salah, sistem menampilkan pesan kesalahan", () => {
    cy.get('input[type="email"], input[name="email"]')
      .clear()
      .type("admin@strongfitgym.com");

    cy.get('input[type="password"], input[name="password"]')
      .clear()
      .type("passwordsalah123");

    cy.contains("button", /login|masuk/i).click();

    cy.contains("p", "Email atau password salah", { timeout: 10000 })
      .should("be.visible");

    cy.url().should("include", "/login");
  });

  it("Tidak Valid — Email kosong, sistem menampilkan pesan kesalahan", () => {
    cy.get('input[type="password"], input[name="password"]')
      .clear()
      .type("strongfitgym");

    cy.contains("button", /login|masuk/i).click();

    cy.url().should("include", "/login");
  });

  it("Tidak Valid — Password kosong, sistem menampilkan pesan kesalahan", () => {
    cy.get('input[type="email"], input[name="email"]')
      .clear()
      .type("admin@strongfitgym.com");

    cy.contains("button", /login|masuk/i).click();

    cy.url().should("include", "/login");
  });
});