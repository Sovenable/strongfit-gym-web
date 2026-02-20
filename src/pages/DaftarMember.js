import React, { useState, useEffect } from "react";
import {
  onMembersSnapshot,
  hitungStatusMembership,
} from "../services/firebaseService";
import "./DaftarMember.css";

function DaftarMember() {
  const [members, setMembers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchNama, setSearchNama] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 7;

  // ===== Realtime listener: Members =====
  useEffect(() => {
    const unsubscribe = onMembersSnapshot((data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===== Hitung status realtime untuk setiap member =====
  const membersWithStatus = members.map((m) => ({
    ...m,
    statusRealtime: hitungStatusMembership(m.tanggalExpired),
  }));

  // ===== Hitung ringkasan statistik =====
  const totalMember = membersWithStatus.length;
  const memberAktif = membersWithStatus.filter(
    (m) => m.statusRealtime !== "Expired"
  ).length;
  const h7 = membersWithStatus.filter(
    (m) => m.statusRealtime === "Aktif (H-7)"
  ).length;
  const h3 = membersWithStatus.filter(
    (m) => m.statusRealtime === "Aktif (H-3)"
  ).length;
  const expired = membersWithStatus.filter(
    (m) => m.statusRealtime === "Expired"
  ).length;

  // ===== Filter & Search =====
  const filteredMembers = membersWithStatus.filter((member) => {
    const matchStatus =
      filterStatus === "Semua" ||
      (filterStatus === "Aktif" && member.statusRealtime === "Aktif") ||
      (filterStatus === "Aktif (H-7)" && member.statusRealtime === "Aktif (H-7)") ||
      (filterStatus === "Aktif (H-3)" && member.statusRealtime === "Aktif (H-3)") ||
      (filterStatus === "Expired" && member.statusRealtime === "Expired");

    const matchNama = member.nama
      .toLowerCase()
      .includes(searchNama.toLowerCase());

    return matchStatus && matchNama;
  });

  // ===== Pagination =====
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilter = () => {
    setCurrentPage(1);
  };

  // ===== Format tanggal dari Timestamp =====
  const formatTanggal = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  // ===== Status badge class =====
  const getStatusClass = (status) => {
    if (status.includes("H-7")) return "status-badge status-h7";
    if (status.includes("H-3")) return "status-badge status-h3";
    if (status === "Expired") return "status-badge status-expired";
    if (status === "Aktif") return "status-badge status-aktif";
    return "status-badge status-default";
  };

  // ===== Generate nomor halaman =====
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="daftar-member">
        <h1 className="page-title">Daftar Member</h1>
        <p style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>
          Memuat data member...
        </p>
      </div>
    );
  }

  return (
    <div className="daftar-member">
      <h1 className="page-title">Daftar Member</h1>

      {/* ===== RINGKASAN STATISTIK ===== */}
      <div className="card-section">
        <h2 className="section-title">Ringkasan Statistik</h2>
        <div className="ringkasan-stats">
          <div className="ringkasan-item">
            <span className="ringkasan-label">Total Member</span>
            <span className="ringkasan-value">{totalMember}</span>
          </div>
          <div className="ringkasan-item">
            <span className="ringkasan-label">Member Aktif</span>
            <span className="ringkasan-value value-aktif">{memberAktif}</span>
          </div>
          <div className="ringkasan-item">
            <span className="ringkasan-label">H-7</span>
            <span className="ringkasan-value value-h7">{h7}</span>
          </div>
          <div className="ringkasan-item">
            <span className="ringkasan-label">H-3</span>
            <span className="ringkasan-value value-h3">{h3}</span>
          </div>
          <div className="ringkasan-item">
            <span className="ringkasan-label">Expired</span>
            <span className="ringkasan-value value-expired">{expired}</span>
          </div>
        </div>
      </div>

      {/* ===== FILTER & PENCARIAN ===== */}
      <div className="card-section">
        <h2 className="section-title">Filter & Pencarian</h2>
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Status Membership</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Aktif (H-7)">Aktif (H-7)</option>
              <option value="Aktif (H-3)">Aktif (H-3)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="filter-group filter-search">
            <label className="filter-label">Pencarian Nama</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Cari nama member..."
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
            />
          </div>
          <div className="filter-group filter-btn-group">
            <button className="btn-tampilkan" onClick={handleFilter}>
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABEL DAFTAR MEMBER ===== */}
      <div className="card-section">
        <h2 className="section-title">Daftar Member</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>No Member</th>
                <th>Nama</th>
                <th style={{ width: "140px" }}>Tanggal Expired</th>
                <th style={{ width: "170px" }}>Status Membership</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.memberId}</td>
                    <td>{member.nama}</td>
                    <td>{formatTanggal(member.tanggalExpired)}</td>
                    <td>
                      <span className={getStatusClass(member.statusRealtime)}>
                        {member.statusRealtime}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    Tidak ada data member yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMembers.length > 0 && (
          <div className="pagination-wrapper">
            <span className="pagination-info">
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredMembers.length)} dari{" "}
              {filteredMembers.length} member
            </span>
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Prev
              </button>
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={index} className="page-dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    className={`page-btn ${
                      currentPage === page ? "page-active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaftarMember;