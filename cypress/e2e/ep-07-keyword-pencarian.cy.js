// ============================================================
// EP-07: Keyword Pencarian Member
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-07: Keyword Pencarian Member", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/daftar-member");
    cy.get(".data-table", { timeout: 10000 }).should("be.visible");
  });

  it("Valid — Keyword 'Fakhri' menampilkan hasil pencarian", () => {
    cy.get("input.filter-input").clear().type("Fakhri");
    cy.contains("button", "Tampilkan").click();
    cy.get(".data-table tbody tr")
      .should("have.length.at.least", 1)
      .and("contain", "Fakhri");
  });

  it("Valid — Keyword 'a' (1 karakter) menampilkan hasil", () => {
    cy.get("input.filter-input").clear().type("a");
    cy.contains("button", "Tampilkan").click();
    cy.get(".data-table").should("be.visible");
  });

  it("Tidak Valid — Keyword kosong menampilkan semua data", () => {
    cy.get("input.filter-input").clear();
    cy.contains("button", "Tampilkan").click();
    cy.get(".data-table").should("be.visible");
    cy.get(".data-table tbody tr").should("have.length.at.least", 1);
  });

  it("Tidak Valid — Keyword 'NamaTidakAdaSamaSekali' menampilkan pesan kosong", () => {
    cy.get("input.filter-input").clear().type("NamaTidakAdaSamaSekali");
    cy.contains("button", "Tampilkan").click();
    cy.get(".empty-row")
      .should("be.visible")
      .and("contain", "Tidak ada data member");
  });
});
