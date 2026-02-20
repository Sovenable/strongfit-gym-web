import React, { useState, useEffect } from "react";
import { getPresensiByDate, toDateString } from "../services/firebaseService";
import "./LaporanPresensi.css";

function LaporanPresensi() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dataPresensi, setDataPresensi] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Fetch presensi setiap kali tanggal berubah =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tanggal = toDateString(selectedDate);
        const data = await getPresensiByDate(tanggal);
        setDataPresensi(data);
      } catch (error) {
        console.error("Error fetch presensi:", error);
        setDataPresensi([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedDate]);

  // ===== Hitung statistik =====
  const totalCheckIn = dataPresensi.length;
  const totalMember = dataPresensi.filter((d) => d.tipe === "Member").length;
  const totalTamu = dataPresensi.filter((d) => d.tipe === "Tamu").length;

  // ===== Navigasi tanggal =====
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // ===== Format tanggal tampilan =====
  const formatTanggalDisplay = () => {
    return selectedDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ===== Format waktu dari Timestamp =====
  const formatWaktu = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== Status badge class =====
  const getStatusClass = (status) => {
    if (!status || status === "-") return "status-badge status-default";
    if (status.includes("H-7")) return "status-badge status-h7";
    if (status.includes("H-3")) return "status-badge status-h3";
    if (status === "Expired") return "status-badge status-expired";
    if (status.includes("Aktif")) return "status-badge status-aktif";
    return "status-badge status-default";
  };

  return (
    <div className="laporan-presensi">
      <h1 className="page-title">Laporan Presensi</h1>

      {/* ===== DATE NAVIGATION ===== */}
      <div className="card-section">
        <div className="date-nav">
          <button className="date-btn" onClick={handlePrevDay}>
            ◀
          </button>
          <div className="date-display">
            <span className="date-text">{formatTanggalDisplay()}</span>
            <input
              type="date"
              className="date-picker"
              value={toDateString(selectedDate)}
              onChange={handleDateChange}
            />
          </div>
          <button className="date-btn" onClick={handleNextDay}>
            ▶
          </button>
        </div>
      </div>

      {/* ===== RINGKASAN CHECK-IN ===== */}
      <div className="checkin-stats">
        <div className="checkin-stat-item">
          <span className="checkin-stat-label">Total Check-In</span>
          <span className="checkin-stat-value">{totalCheckIn}</span>
        </div>
        <div className="checkin-stat-item">
          <span className="checkin-stat-label">Member</span>
          <span className="checkin-stat-value stat-member">{totalMember}</span>
        </div>
        <div className="checkin-stat-item">
          <span className="checkin-stat-label">Tamu</span>
          <span className="checkin-stat-value stat-tamu">{totalTamu}</span>
        </div>
      </div>

      {/* ===== TABEL PRESENSI ===== */}
      <div className="card-section">
        <h2 className="section-title">Data Check-In</h2>
        {loading ? (
          <p style={{ color: "#888", textAlign: "center", padding: "24px 0" }}>
            Memuat data presensi...
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>No</th>
                  <th>Nama</th>
                  <th style={{ width: "130px" }}>Waktu Check-In</th>
                  <th style={{ width: "170px" }}>Status Membership</th>
                  <th style={{ width: "100px" }}>Tipe</th>
                </tr>
              </thead>
              <tbody>
                {dataPresensi.length > 0 ? (
                  dataPresensi.map((item, index) => (
                    <tr key={item.id}>
                      <td>{dataPresensi.length - index}</td>
                      <td>{item.nama}</td>
                      <td>{formatWaktu(item.waktuCheckIn)}</td>
                      <td>
                        <span className={getStatusClass(item.statusMembership)}>
                          {item.statusMembership || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`tipe-badge ${
                            item.tipe === "Member"
                              ? "tipe-member"
                              : "tipe-tamu"
                          }`}
                        >
                          {item.tipe}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Tidak ada data check-in pada tanggal ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LaporanPresensi;