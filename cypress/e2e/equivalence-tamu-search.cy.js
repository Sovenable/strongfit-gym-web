// ============================================================
// Equivalence Partitioning — Tamu & Pencarian
// EP-04: Nama Tamu | EP-05: Nomor HP Tamu | EP-06: Keyword Pencarian
// Sesuai Tabel 3.7 TA — Skenario Pengujian Equivalence Partitioning
// ============================================================

describe("Equivalence Partitioning — Form Pendataan Tamu", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/pendataan-tamu");
    cy.get(".form-card", { timeout: 10000 }).should("be.visible");
  });

  // EP-04: Nama Tamu
  describe("EP-04: Nama Tamu", () => {
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

  // EP-05: Nomor HP Tamu
  describe("EP-05: Nomor HP Tamu", () => {
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
});

// EP-06: Keyword Pencarian Member
describe("Equivalence Partitioning — Keyword Pencarian Member", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/daftar-member");
    cy.get(".data-table", { timeout: 10000 }).should("be.visible");
  });

  describe("EP-06: Keyword Pencarian", () => {
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
});
