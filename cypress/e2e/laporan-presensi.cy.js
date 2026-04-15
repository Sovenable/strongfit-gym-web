// ============================================================
// FT-05: Lihat Laporan Presensi
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

describe("FT-05: Lihat Laporan Presensi", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/laporan-presensi");
    cy.get(".laporan-presensi", { timeout: 10000 }).should("be.visible");
  });

  it("Menampilkan data presensi sesuai tanggal yang dipilih", () => {
    cy.contains("button", "Harian").should("be.visible");

    const kemarin = new Date();
    kemarin.setDate(kemarin.getDate() - 1);
    const yyyy = kemarin.getFullYear();
    const mm = String(kemarin.getMonth() + 1).padStart(2, "0");
    const dd = String(kemarin.getDate()).padStart(2, "0");
    const tanggalKemarin = `${yyyy}-${mm}-${dd}`;

    cy.get('input[type="date"].date-picker')
      .should("exist")
      .invoke("val", tanggalKemarin)
      .trigger("change", { force: true });

    cy.get(".checkin-stats").should("be.visible");
    cy.get(".checkin-stat-item").should("have.length.at.least", 3);
    cy.get(".data-table").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".empty-row").length > 0) {
        cy.get(".empty-row").should("be.visible");
      } else {
        cy.get(".data-table tbody tr").should("have.length.at.least", 1);
      }
    });
  });

  it("Bisa berpindah tanggal menggunakan tombol panah", () => {
    cy.get(".date-text").invoke("text").then((tanggalAwal) => {
      cy.get(".date-btn").first().click();
      cy.get(".date-text").invoke("text").should("not.eq", tanggalAwal);
      cy.get(".data-table").should("be.visible");
    });
  });
});
