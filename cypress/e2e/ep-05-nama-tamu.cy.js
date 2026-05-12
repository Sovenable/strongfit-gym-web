// ============================================================
// EP-05: Nama Tamu
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-05: Nama Tamu", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/pendataan-tamu");
    cy.get(".form-card", { timeout: 10000 }).should("be.visible");
  });

  it("Valid — Nama 'Budi Santoso' diterima", () => {
    cy.get('input[name="nama"]').clear().type("Budi Santoso", { delay: 50 });
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Nama 'A' (kurang dari 2 karakter) ditolak", () => {
    cy.get('input[name="nama"]').clear().type("A");
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".error-text").should("be.visible").and("contain", "minimal 2 karakter");
  });

  it("Tidak Valid — Nama 'Andi123' (mengandung angka) ditolak", () => {
    cy.get('input[name="nama"]').clear().type("Andi123", { delay: 50 });
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".error-text").should("be.visible").and("contain", "huruf dan spasi");
  });

  it("Tidak Valid — Nama tamu kosong ditolak", () => {
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();
    cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
  });
});
