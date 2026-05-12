// ============================================================
// EP-06: Nomor HP Tamu
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-06: Nomor HP Tamu", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/pendataan-tamu");
    cy.get(".form-card", { timeout: 10000 }).should("be.visible");
  });

  it("Valid — Nomor '081234567890' diterima", () => {
    cy.get('input[name="nama"]').clear().type("Tamu Test Valid", { delay: 50 });
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Nomor '12345' (tidak sesuai format) ditolak", () => {
    cy.get('input[name="nama"]').clear().type("Tamu Test", { delay: 50 });
    cy.get('input[name="nomorHp"]').clear().type("12345");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".error-text").should("be.visible").and("contain", "Format");
  });

  it("Tidak Valid — Nomor HP kosong ditolak", () => {
    cy.get('input[name="nama"]').clear().type("Tamu Test", { delay: 50 });
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
  });
});
