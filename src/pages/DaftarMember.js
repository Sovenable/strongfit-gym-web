import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  onMembersSnapshot,
  hitungStatusMembership,
  getTransaksiByMemberId,
} from "../services/firebaseService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import "./DaftarMember.css";

// ===== Helper: hitung bulan-bulan yang ter-cover oleh satu periode =====
function getBulanYangTercover(tanggalMulai, tanggalExpired) {
  const bulanList = [];
  if (!tanggalMulai || !tanggalExpired) return bulanList;

  const mulai = tanggalMulai.toDate ? tanggalMulai.toDate() : new Date(tanggalMulai);
  const expired = tanggalExpired.toDate ? tanggalExpired.toDate() : new Date(tanggalExpired);

  const cur = new Date(mulai.getFullYear(), mulai.getMonth(), 1);
  const end = new Date(expired.getFullYear(), expired.getMonth(), 1);

  while (cur <= end) {
    bulanList.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return bulanList;
}

function DaftarMember() {
  const [members, setMembers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchNama, setSearchNama] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // ===== Modal detail member =====
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalTransaksi, setModalTransaksi] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // ===== Chart =====
  const [dataChart, setDataChart] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [allMembersData, setAllMembersData] = useState([]);

  // ===== Modal chart (klik titik) =====
  const [chartModal, setChartModal] = useState(null);

  const itemsPerPage = 7;

  // ===== Realtime listener: Members =====
  useEffect(() => {
    const unsubscribe = onMembersSnapshot((data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===== Fetch data chart =====
  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const tahun = new Date().getFullYear();
        const bulanLabels = [];
        for (let i = 0; i < 12; i++) {
          const d = new Date(tahun, i, 1);
          bulanLabels.push({
            key: `${tahun}-${String(i + 1).padStart(2, "0")}`,
            label: d.toLocaleDateString("id-ID", { month: "short" }),
            count: 0,
          });
        }

        const snapMembers = await getDocs(collection(db, "members"));
        const rawMembers = snapMembers.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllMembersData(rawMembers);

        rawMembers.forEach((m) => {
          const bulanTercover = getBulanYangTercover(m.tanggalMulai, m.tanggalExpired);
          bulanTercover.forEach((bulan) => {
            const entry = bulanLabels.find((b) => b.key === bulan);
            if (entry) entry.count += 1;
          });
        });

        setDataChart(bulanLabels);
      } catch (err) {
        console.error("Error fetch chart:", err);
        setDataChart([]);
      }
      setChartLoading(false);
    };

    fetchChartData();
  }, []);

  // ===== Klik titik di chart =====
  const handleChartClick = (data) => {
    if (!data || !data.activePayload || data.activeTooltipIndex === undefined) return;
    const bulanKey = dataChart[data.activeTooltipIndex].key;
    const bulanLabel = dataChart[data.activeTooltipIndex].label;

    const membersAktifDiBulan = allMembersData.filter((m) => {
      const tercover = getBulanYangTercover(m.tanggalMulai, m.tanggalExpired);
      return tercover.includes(bulanKey);
    });

    setChartModal({ bulan: bulanKey, label: bulanLabel, members: membersAktifDiBulan });
  };

  // ===== Buka modal detail member =====
  const handleRowClick = async (member) => {
    setSelectedMember(member);
    setModalLoading(true);
    setModalTransaksi([]);
    try {
      const transaksi = await getTransaksiByMemberId(member.memberId);
      setModalTransaksi(transaksi);
    } catch (err) {
      console.error("Error fetch transaksi member:", err);
    }
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setModalTransaksi([]);
  };

  // ===== Hitung bulan yang ijo di modal member =====
  const getBulanAktif = () => {
    const aktif = new Set();

    modalTransaksi.forEach((t) => {
      const bulanTercover = getBulanYangTercover(t.tanggalMulai, t.tanggalExpired);
      bulanTercover.forEach((b) => aktif.add(b));
    });

    if (selectedMember?.tanggalMulai && selectedMember?.tanggalExpired) {
      const bulanAwal = getBulanYangTercover(
        selectedMember.tanggalMulai,
        selectedMember.tanggalExpired
      );
      bulanAwal.forEach((b) => aktif.add(b));
    }

    return aktif;
  };

  // ===== Generate Januari–Desember tahun berjalan =====
  const generateBulanTahunIni = () => {
    const tahun = new Date().getFullYear();
    const hasil = [];
    for (let bulan = 0; bulan < 12; bulan++) {
      const d = new Date(tahun, bulan, 1);
      hasil.push({
        key: `${tahun}-${String(bulan + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
        labelPendek: d.toLocaleDateString("id-ID", { month: "short" }),
        tahun: tahun,
      });
    }
    return hasil;
  };

  // ===== Hitung status realtime =====
  const membersWithStatus = members.map((m) => ({
    ...m,
    statusRealtime: hitungStatusMembership(m.tanggalExpired),
  }));

  const totalMember = membersWithStatus.length;
  const memberAktif = membersWithStatus.filter((m) => m.statusRealtime !== "Expired").length;
  const h7 = membersWithStatus.filter((m) => m.statusRealtime === "Aktif (H-7)").length;
  const h3 = membersWithStatus.filter((m) => m.statusRealtime === "Aktif (H-3)").length;
  const expired = membersWithStatus.filter((m) => m.statusRealtime === "Expired").length;

  // ===== Filter & Search =====
  const filteredMembers = membersWithStatus.filter((member) => {
    const matchStatus =
      filterStatus === "Semua" ||
      (filterStatus === "Aktif" && member.statusRealtime === "Aktif") ||
      (filterStatus === "Aktif (H-7)" && member.statusRealtime === "Aktif (H-7)") ||
      (filterStatus === "Aktif (H-3)" && member.statusRealtime === "Aktif (H-3)") ||
      (filterStatus === "Expired" && member.statusRealtime === "Expired");
    const matchNama = member.nama.toLowerCase().includes(searchNama.toLowerCase());
    return matchStatus && matchNama;
  });

  // ===== Pagination =====
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const handleFilter = () => setCurrentPage(1);

  // ===== Format tanggal =====
  const formatTanggal = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "numeric", year: "numeric" });
  };

  // ===== Status badge class =====
  const getStatusClass = (status) => {
    if (!status) return "status-badge status-default";
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
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
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

  const bulan12 = generateBulanTahunIni();
  const bulanAktif = selectedMember ? getBulanAktif() : new Set();

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
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
          Klik baris member untuk melihat riwayat perpanjangan
        </p>
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
                  <tr
                    key={member.id}
                    onClick={() => handleRowClick(member)}
                    style={{ cursor: "pointer" }}
                    className="member-row-clickable"
                  >
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
                  <span key={index} className="page-dots">...</span>
                ) : (
                  <button
                    key={index}
                    className={`page-btn ${currentPage === page ? "page-active" : ""}`}
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

      {/* ===== CHART MEMBER AKTIF PER BULAN ===== */}
      <div className="card-section">
        <h2 className="section-title">Grafik Member Aktif per Bulan</h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
          Klik titik di grafik untuk melihat detail member yang aktif di bulan tersebut
        </p>
        {chartLoading ? (
          <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>
            Memuat data grafik...
          </p>
        ) : (
          <div className="grafik-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dataChart}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="label" fontSize={12} tick={{ fill: "#666" }} />
                <YAxis fontSize={12} tick={{ fill: "#666" }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} member`, "Member Aktif"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
               <Line
                type="monotone"
                dataKey="count"
                name="Member Aktif"
                stroke="#4a90d9"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#4a90d9"
                      stroke="#fff"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const item = dataChart[index];
                        const membersAktif = allMembersData.filter((m) => {
                          const tercover = getBulanYangTercover(m.tanggalMulai, m.tanggalExpired);
                          return tercover.includes(item.key);
                        });
                        setChartModal({ bulan: item.key, label: item.label, members: membersAktif });
                      }}
                    />
                  );
                }}
                activeDot={(props) => {
                  const { cx, cy, index } = props;
                  return (
                    <circle
                      key={`active-${index}`}
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill="#4a90d9"
                      stroke="#fff"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const item = dataChart[index];
                        const membersAktif = allMembersData.filter((m) => {
                          const tercover = getBulanYangTercover(m.tanggalMulai, m.tanggalExpired);
                          return tercover.includes(item.key);
                        });
                        setChartModal({ bulan: item.key, label: item.label, members: membersAktif });
                      }}
                    />
                  );
                }}
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ===== MODAL CHART — detail member aktif per bulan ===== */}
      {chartModal && (
        <div className="modal-overlay" onClick={() => setChartModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Member Aktif — {chartModal.label}</h2>
                <span style={{ fontSize: "13px", color: "#888" }}>
                  {chartModal.members.length} member aktif di bulan ini
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setChartModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {chartModal.members.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "100px" }}>No Member</th>
                      <th>Nama</th>
                      <th style={{ width: "140px" }}>Tanggal Expired</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartModal.members
                      .sort((a, b) => (a.memberId > b.memberId ? 1 : -1))
                      .map((m) => (
                        <tr key={m.id}>
                          <td>{m.memberId}</td>
                          <td>{m.nama}</td>
                          <td>{formatTanggal(m.tanggalExpired)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", color: "#888", padding: "24px 0" }}>
                  Tidak ada member aktif di bulan ini
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DETAIL MEMBER — riwayat perpanjangan ===== */}
      {selectedMember && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedMember.nama}</h2>
                <span style={{ fontSize: "13px", color: "#888" }}>
                  {selectedMember.memberId}
                </span>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">Riwayat Perpanjangan — {new Date().getFullYear()}</p>

              {modalLoading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "24px 0" }}>
                  Memuat riwayat...
                </p>
              ) : (
                <>
                  <div className="bulan-grid">
                    {bulan12.map((b) => {
                      const aktif = bulanAktif.has(b.key);
                      return (
                        <div
                          key={b.key}
                          className={`bulan-item ${aktif ? "bulan-aktif" : "bulan-kosong"}`}
                          title={b.label}
                        >
                          <span className="bulan-pendek">{b.labelPendek}</span>
                          <span className="bulan-tahun">{b.tahun}</span>
                          {aktif && <span className="bulan-check">✓</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="modal-legend">
                    <span className="legend-item">
                      <span className="legend-dot legend-dot-aktif" /> Membership Aktif
                    </span>
                    <span className="legend-item">
                      <span className="legend-dot legend-dot-kosong" /> Tidak ada
                    </span>
                  </div>

                  {modalTransaksi.length > 0 && (
                    <div className="modal-transaksi-list">
                      <p className="modal-subtitle" style={{ marginTop: "16px" }}>
                        Riwayat Transaksi ({modalTransaksi.length} transaksi)
                      </p>
                      {modalTransaksi
                        .sort((a, b) => {
                          const tA = a.tanggalMulai?.toDate?.() || new Date(0);
                          const tB = b.tanggalMulai?.toDate?.() || new Date(0);
                          return tB - tA;
                        })
                        .map((t, i) => (
                          <div key={t.id || i} className="transaksi-item">
                            <div className="transaksi-paket">{t.paketMembership}</div>
                            <div className="transaksi-detail">
                              {formatTanggal(t.tanggalMulai)} — {formatTanggal(t.tanggalExpired)}
                            </div>
                            <div className="transaksi-nominal">
                              Rp {Number(t.nominalPembayaran || 0).toLocaleString("id-ID")}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaftarMember;