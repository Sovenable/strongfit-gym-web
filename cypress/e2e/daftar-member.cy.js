// ============================================================
// FT-06: Filter dan Search Member
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-06: Filter dan Search Member", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/daftar-member");
    cy.get(".data-table", { timeout: 10000 }).should("be.visible");
  });

  it("Berhasil mencari member berdasarkan kata kunci nama", () => {
    cy.get("input.filter-input").should("be.visible").clear().type("Fakhri");
    cy.contains("button", "Tampilkan").click();

    cy.get(".data-table").should("be.visible");
    cy.get(".data-table tbody tr")
      .should("have.length.at.least", 1)
      .and("contain", "Fakhri");

    cy.get(".empty-row").should("not.exist");
  });

  it("Berhasil filter member berdasarkan status membership", () => {
    cy.get("select.filter-select").should("be.visible").select("Aktif");
    cy.contains("button", "Tampilkan").click();

    cy.get(".data-table").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".empty-row").length > 0) {
        cy.get(".empty-row").should("be.visible");
      } else {
        cy.get(".data-table tbody tr").each(($row) => {
          cy.wrap($row).find(".status-badge").should("contain", "Aktif");
        });
      }
    });
  });

  it("Menampilkan pesan kosong jika nama tidak ditemukan", () => {
    cy.get("input.filter-input").clear().type("ZzzNamaTidakAdaSamaSekali");
    cy.contains("button", "Tampilkan").click();

    cy.get(".empty-row")
      .should("be.visible")
      .and("contain", "Tidak ada data member");
  });
});
