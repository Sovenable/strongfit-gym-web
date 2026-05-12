// ============================================================
// EP-02: Nama Member
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-02: Nama Member", () => {
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

  const isiFieldLain = () => {
    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
    cy.get('select[name="paketMembership"]').select("1 Bulan");
  };

  it("Valid — Nama 'Muhammad Fakhri' diterima", () => {
    cy.get('input[placeholder="Masukkan nama member"]').clear().type("Muhammad Fakhri", { delay: 50 });
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Nama 'A' (kurang dari 2 karakter) ditolak", () => {
    cy.get('input[placeholder="Masukkan nama member"]').clear().type("A");
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "minimal 2 karakter");
  });

  it("Tidak Valid — Nama 'Fakhri123' (mengandung angka) ditolak", () => {
    cy.get('input[placeholder="Masukkan nama member"]').clear().type("Fakhri123", { delay: 50 });
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "huruf dan spasi");
  });

  it("Tidak Valid — Nama kosong ditolak", () => {
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
  });
});
