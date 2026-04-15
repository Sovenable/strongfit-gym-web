// ============================================================
// FT-01: Tambah Member Baru
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-01: Tambah Member Baru", () => {
  beforeEach(() => {
    cy.login();

    cy.intercept("GET", "**/api/unassigned-users", {
      statusCode: 200,
      body: {
        success: true,
        unassignedUsers: [{ uid: "99", userId: "99", name: "Test User" }],
        totalDevice: 1,
        totalAssigned: 0,
        totalUnassigned: 1,
      },
    }).as("getUnassignedUsers");

    cy.visit("/tambah-member");
    cy.wait("@getUnassignedUsers");
  });

  it("Berhasil menambah member baru dengan data valid", () => {
    const randomStr = Math.random().toString(36).replace(/[^a-z]/g, "").substring(0, 6);
    const namaUnik = "TestMember" + randomStr;

    cy.get('input[placeholder="Masukkan nama member"]')
      .should("be.visible")
      .clear()
      .type(namaUnik, { delay: 100 })
      .should("have.value", namaUnik);

    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
    cy.get('select[name="paketMembership"]').select("1 Bulan");
    cy.get('input[placeholder="Masukkan nama member"]').should("have.value", namaUnik);
    cy.contains("button", "Tambah Member").click();

    cy.get(".alert-success", { timeout: 15000 })
      .should("be.visible")
      .and("contain", "berhasil ditambahkan");
  });

  it("Gagal menambah member jika nama dikosongkan", () => {
    cy.get('input[name="nomorHp"]').type("081234567890");
    cy.get('select[name="paketMembership"]').select("1 Bulan");
    cy.contains("button", "Tambah Member").click();

    cy.get(".error-text")
      .should("be.visible")
      .and("contain", "Nama member tidak boleh kosong");

    cy.get(".alert-success").should("not.exist");
  });
});
