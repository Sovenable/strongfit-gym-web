// ============================================================
// EP-03: Nomor HP Member
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("EP-03: Nomor HP Member", () => {
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
    cy.get('select[name="paketMembership"]').select("1 Bulan");
  };

  it("Valid — Nomor '081234567890' diterima", () => {
    isiFieldLain();
    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
    cy.contains("button", "Tambah Member").click();
    cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
  });

  it("Tidak Valid — Nomor '628123456789' (tidak diawali 08) ditolak", () => {
    isiFieldLain();
    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("628123456789");
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "Format");
  });

  it("Tidak Valid — Nomor '08123' (kurang dari 10 digit) ditolak", () => {
    isiFieldLain();
    cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("08123");
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "Format");
  });

  it("Tidak Valid — Nomor HP kosong ditolak", () => {
    isiFieldLain();
    cy.contains("button", "Tambah Member").click();
    cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
  });
});
