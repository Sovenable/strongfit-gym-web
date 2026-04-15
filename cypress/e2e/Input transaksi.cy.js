// ============================================================
// FT-02: Input Transaksi Membership
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-02: Input Transaksi Membership", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/input-transaksi");
    cy.get(".form-card", { timeout: 10000 }).should("be.visible");
  });

  it("Berhasil input transaksi untuk member yang valid", () => {
    cy.get('input[placeholder*="Ketik nama"]')
      .should("be.visible")
      .clear()
      .type("Fakhri", { delay: 100 });

    cy.get(".search-dropdown", { timeout: 5000 }).should("be.visible");
    cy.get(".search-item").first().click();

    cy.get(".member-info-card").should("be.visible").and("contain", "Fakhri");

    cy.get("select.form-select").first().select("1 Bulan");
    cy.get("select.form-select").eq(1).select("Cash");
    cy.contains("button", "Simpan Transaksi").click();

    cy.get(".alert-success", { timeout: 15000 })
      .should("be.visible")
      .and("contain", "berhasil dicatat");
  });

  it("Menampilkan pesan saat member tidak ditemukan", () => {
    cy.get('input[placeholder*="Ketik nama"]')
      .should("be.visible")
      .clear()
      .type("ZzzNamaTidakAda", { delay: 100 });

    cy.get(".search-dropdown", { timeout: 5000 }).should("be.visible");

    cy.get(".search-empty")
      .should("be.visible")
      .and("contain", "Member tidak ditemukan");

    cy.get(".search-item").should("not.exist");
  });
});
