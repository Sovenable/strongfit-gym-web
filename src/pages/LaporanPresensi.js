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
  getPresensiByDate,
  getPresensiByMonth,
  toDateString,
  toMonthString,
  hitungStatusMembership,
  onMembersSnapshot,
} from "../services/firebaseService";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import "./LaporanPresensi.css";

function LaporanPresensi() {
  const [mode, setMode] = useState("harian"); // "harian" atau "bulanan"
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(toMonthString(new Date()));
  const [dataPresensi, setDataPresensi] = useState([]);
  const [members, setMembers] = useState([]);
  const [filterTipe, setFilterTipe] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [dataGrafik, setDataGrafik] = useState([]);
  const [periodeGrafik, setPeriodeGrafik] = useState("7hari");

  // ===== Realtime listener: Members (untuk cek status) =====
  useEffect(() => {
    const unsubscribe = onMembersSnapshot((data) => {
      setMembers(data);
    });
    return () => unsubscribe();
  }, []);

  // ===== Fetch presensi sesuai mode =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (mode === "harian") {
          const tanggal = toDateString(selectedDate);
          data = await getPresensiByDate(tanggal);
        } else {
          data = await getPresensiByMonth(selectedMonth);
        }
        setDataPresensi(data);
      } catch (error) {
        console.error("Error fetch presensi:", error);
        setDataPresensi([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedDate, selectedMonth, mode]);

  // ===== Fetch data grafik kunjungan =====
  useEffect(() => {
    const fetchGrafik = async () => {
      const hari = periodeGrafik === "7hari" ? 7 : 30;
      const now = new Date();
      const result = [];

      for (let i = hari - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const tanggal = toDateString(date);

        try {
          const q = query(
            collection(db, "presensi"),
            where("tanggal", "==", tanggal)
          );
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map((d) => d.data());

          const memberCount = docs.filter((d) => d.tipe === "Member").length;
          const tamuCount = docs.filter((d) => d.tipe === "Tamu").length;

          result.push({
            tanggal: date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            }),
            member: memberCount,
            tamu: tamuCount,
            total: memberCount + tamuCount,
          });
        } catch (error) {
          result.push({
            tanggal: date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            }),
            member: 0,
            tamu: 0,
            total: 0,
          });
        }
      }

      setDataGrafik(result);
    };

    fetchGrafik();
  }, [periodeGrafik]);

  // ===== Helper: get member status from members list =====
  const getMemberStatus = (memberId) => {
    const member = members.find((m) => m.memberId === memberId);
    if (member) {
      return hitungStatusMembership(member.tanggalExpired);
    }
    return null;
  };

  // ===== Filter data presensi =====
  const filteredPresensi = dataPresensi.filter((item) => {
    // Filter tipe
    if (filterTipe === "Member" && item.tipe !== "Member") return false;
    if (filterTipe === "Tamu" && item.tipe !== "Tamu") return false;

    // Filter status (hanya berlaku untuk Member)
    if (filterTipe === "Member" && filterStatus !== "Semua") {
      const currentStatus = getMemberStatus(item.memberId) || item.statusMembership;
      if (filterStatus === "Aktif" && currentStatus !== "Aktif") return false;
      if (filterStatus === "Aktif (H-7)" && currentStatus !== "Aktif (H-7)") return false;
      if (filterStatus === "Aktif (H-3)" && currentStatus !== "Aktif (H-3)") return false;
      if (filterStatus === "Expired" && currentStatus !== "Expired") return false;
    }

    return true;
  });

  // ===== Hitung statistik =====
  const totalCheckIn = filteredPresensi.length;
  const totalMember = filteredPresensi.filter((d) => d.tipe === "Member").length;
  const totalTamu = filteredPresensi.filter((d) => d.tipe === "Tamu").length;

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

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
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

  const formatBulanDisplay = () => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", {
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

  // ===== Format tanggal + waktu (untuk mode bulanan) =====
  const formatTanggalWaktu = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }) + " " + date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== Status badge class =====
  const getStatusClass = (status) => {
    if (!status || status === "-") return "status-badge status-default";
    if (status === "Belum Aktif") return "status-badge status-default";
    if (status.includes("H-7")) return "status-badge status-h7";
    if (status.includes("H-3")) return "status-badge status-h3";
    if (status === "Expired") return "status-badge status-expired";
    if (status.includes("Aktif")) return "status-badge status-aktif";
    return "status-badge status-default";
  };

  return (
    <div className="laporan-presensi">
      <h1 className="page-title">Laporan Presensi</h1>

      {/* ===== MODE TOGGLE ===== */}
      <div className="mode-toggle-wrapper">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === "harian" ? "mode-active" : ""}`}
            onClick={() => { setMode("harian"); setFilterTipe("Semua"); setFilterStatus("Semua"); }}
          >
            Harian
          </button>
          <button
            className={`mode-btn ${mode === "bulanan" ? "mode-active" : ""}`}
            onClick={() => { setMode("bulanan"); setFilterTipe("Semua"); setFilterStatus("Semua"); }}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* ===== DATE / MONTH NAVIGATION ===== */}
      <div className="card-section">
        {mode === "harian" ? (
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
        ) : (
          <div className="date-nav">
            <div className="date-display">
              <span className="date-text">{formatBulanDisplay()}</span>
              <input
                type="month"
                className="month-picker"
                value={selectedMonth}
                onChange={handleMonthChange}
              />
            </div>
          </div>
        )}
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

      {/* ===== FILTER ===== */}
      <div className="card-section">
        <h2 className="section-title">Filter</h2>
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Tipe</label>
            <select
              className="filter-select"
              value={filterTipe}
              onChange={(e) => {
                setFilterTipe(e.target.value);
                setFilterStatus("Semua");
              }}
            >
              <option value="Semua">Semua</option>
              <option value="Member">Member</option>
              <option value="Tamu">Tamu</option>
            </select>
          </div>
          {filterTipe === "Member" && (
            <div className="filter-group">
              <label className="filter-label">Status Membership</label>
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Aktif (H-7)">Aktif (H-7)</option>
                <option value="Aktif (H-3)">Aktif (H-3)</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          )}
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
                  <th style={{ width: "50px" }}>No</th>
                  <th style={{ width: "100px" }}>No Member</th>
                  <th>Nama</th>
                  <th style={{ width: "130px" }}>
                    {mode === "bulanan" ? "Tanggal & Waktu" : "Waktu Check-In"}
                  </th>
                  <th style={{ width: "170px" }}>Status Membership</th>
                  <th style={{ width: "100px" }}>Tipe</th>
                </tr>
              </thead>
              <tbody>
                {filteredPresensi.length > 0 ? (
                  filteredPresensi.map((item, index) => (
                    <tr key={item.id}>
                      <td>{filteredPresensi.length - index}</td>
                      <td>{item.tipe === "Member" ? item.memberId || "-" : "-"}</td>
                      <td>{item.nama}</td>
                      <td>
                        {mode === "bulanan"
                          ? formatTanggalWaktu(item.waktuCheckIn)
                          : formatWaktu(item.waktuCheckIn)}
                      </td>
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
                    <td colSpan="6" className="empty-row">
                      {mode === "harian"
                        ? "Tidak ada data check-in pada tanggal ini"
                        : "Tidak ada data check-in pada bulan ini"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== GRAFIK KUNJUNGAN ===== */}
      <div className="card-section">
        <div className="section-header">
          <h2 className="section-title">Grafik Kunjungan</h2>
          <div className="grafik-toggle">
            <button
              className={`toggle-btn ${periodeGrafik === "7hari" ? "toggle-active" : ""}`}
              onClick={() => setPeriodeGrafik("7hari")}
            >
              7 Hari
            </button>
            <button
              className={`toggle-btn ${periodeGrafik === "30hari" ? "toggle-active" : ""}`}
              onClick={() => setPeriodeGrafik("30hari")}
            >
              30 Hari
            </button>
          </div>
        </div>
        <div className="grafik-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataGrafik}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="tanggal"
                fontSize={12}
                tick={{ fill: "#666" }}
              />
              <YAxis fontSize={12} tick={{ fill: "#666" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="member"
                name="Member"
                stroke="#4a90d9"
                strokeWidth={2}
                dot={{ fill: "#4a90d9", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="tamu"
                name="Tamu"
                stroke="#9b59b6"
                strokeWidth={2}
                dot={{ fill: "#9b59b6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default LaporanPresensi;