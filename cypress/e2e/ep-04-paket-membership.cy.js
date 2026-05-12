// ============================================================
// EP-04: Paket Membership
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-04: Paket Membership", () => {
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
    const randomStr = Math.random().toString(36).replace(/[^a-z]/g, "").substring(0, 6);
    cy.get('input[placeholder="Masukkan nama member"]').clear().type("Test" + randomStr, { delay: 50 });
    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
  };

  it("Valid — Paket '1 Bulan' diterima", () => {
    isiFieldLain();
    cy.get('select[name="paketMembership"]').select("1 Bulan");
    cy.contains("button", "Tambah Member").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Valid — Paket '3 Bulan' diterima", () => {
    isiFieldLain();
    cy.get('select[name="paketMembership"]').select("3 Bulan");
    cy.contains("button", "Tambah Member").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Tidak memilih paket ditolak", () => {
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "Pilih paket");
  });
});
