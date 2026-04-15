// ============================================================
// Equivalence Partitioning — Form Tambah Member
// EP-01: Nama Member | EP-02: Nomor HP | EP-03: Paket Membership
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("Equivalence Partitioning — Form Tambah Member", () => {
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

  const isiFieldLain = (skipField) => {
    if (skipField !== "nama") {
      const randomStr = Math.random().toString(36).replace(/[^a-z]/g, "").substring(0, 6);
      cy.get('input[placeholder="Masukkan nama member"]').clear().type("Test" + randomStr, { delay: 50 });
    }
    if (skipField !== "nomorHp") {
      cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
    }
    if (skipField !== "paketMembership") {
      cy.get('select[name="paketMembership"]').select("1 Bulan");
    }
  };

  // EP-01: Nama Member
  describe("EP-01: Nama Member", () => {
    it("Valid — Nama 'Muhammad Fakhri' diterima", () => {
      cy.get('input[placeholder="Masukkan nama member"]').clear().type("Muhammad Fakhri", { delay: 50 });
      isiFieldLain("nama");
      cy.contains("button", "Tambah Member").click();
      cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
    });

    it("Tidak Valid — Nama 'A' (kurang dari 2 karakter) ditolak", () => {
      cy.get('input[placeholder="Masukkan nama member"]').clear().type("A");
      isiFieldLain("nama");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "minimal 2 karakter");
    });

    it("Tidak Valid — Nama 'Fakhri123' (mengandung angka) ditolak", () => {
      cy.get('input[placeholder="Masukkan nama member"]').clear().type("Fakhri123", { delay: 50 });
      isiFieldLain("nama");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "huruf dan spasi");
    });

    it("Tidak Valid — Nama kosong ditolak", () => {
      isiFieldLain("nama");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
    });
  });

  // EP-02: Nomor HP Member
  describe("EP-02: Nomor HP Member", () => {
    it("Valid — Nomor '081234567890' diterima", () => {
      isiFieldLain("nomorHp");
      cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("081234567890");
      cy.contains("button", "Tambah Member").click();
      cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
    });

    it("Tidak Valid — Nomor '628123456789' (tidak diawali 08) ditolak", () => {
      isiFieldLain("nomorHp");
      cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("628123456789");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "Format");
    });

    it("Tidak Valid — Nomor '08123' (kurang dari 10 digit) ditolak", () => {
      isiFieldLain("nomorHp");
      cy.get('input[placeholder="08xxxxxxxxxxx"]').clear().type("08123");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "Format");
    });

    it("Tidak Valid — Nomor HP kosong ditolak", () => {
      isiFieldLain("nomorHp");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "tidak boleh kosong");
    });
  });

  // EP-03: Paket Membership
  describe("EP-03: Paket Membership", () => {
    it("Valid — Paket '1 Bulan' diterima", () => {
      isiFieldLain("paketMembership");
      cy.get('select[name="paketMembership"]').select("1 Bulan");
      cy.contains("button", "Tambah Member").click();
      cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
    });

    it("Valid — Paket '3 Bulan' diterima", () => {
      isiFieldLain("paketMembership");
      cy.get('select[name="paketMembership"]').select("3 Bulan");
      cy.contains("button", "Tambah Member").click();
      cy.get(".alert-success", { timeout: 15000 }).should("be.visible");
    });

    it("Tidak Valid — Tidak memilih paket ditolak", () => {
      isiFieldLain("paketMembership");
      cy.contains("button", "Tambah Member").click();
      cy.get(".error-text").should("be.visible").and("contain", "Pilih paket");
    });
  });
});
