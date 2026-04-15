// ============================================================
// FT-04: Pendataan Tamu
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-04: Pendataan Tamu", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/pendataan-tamu");
    cy.get(".form-card", { timeout: 10000 }).should("be.visible");
  });

  it("Berhasil menyimpan data tamu dengan input valid", () => {
    const randomStr = Math.random().toString(36).replace(/[^a-z]/g, "").substring(0, 6);
    const namaUnik = "TamuTest" + randomStr;

    cy.get('input[name="nama"]')
      .should("be.visible")
      .clear()
      .type(namaUnik, { delay: 50 })
      .should("have.value", namaUnik);

    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();

    cy.get(".alert-success", { timeout: 15000 })
      .should("be.visible")
      .and("contain", namaUnik)
      .and("contain", "berhasil dicatat");
  });

  it("Gagal menyimpan tamu jika nama dikosongkan", () => {
    cy.get('input[name="nomorHp"]').clear().type("081234567890");
    cy.contains("button", "Simpan Data Tamu").click();

    cy.get(".error-text")
      .should("be.visible")
      .and("contain", "Nama tamu tidak boleh kosong");

    cy.get(".alert-success").should("not.exist");
  });
});
