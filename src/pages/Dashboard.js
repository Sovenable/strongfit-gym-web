import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  onMembersSnapshot,
  onPresensiTodaySnapshot,
  hitungStatusMembership,
  toDateString,
} from "../services/firebaseService";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import "./Dashboard.css";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [presensiHariIni, setPresensiHariIni] = useState([]);
  const [periodeGrafik, setPeriodeGrafik] = useState("7hari");
  const [dataGrafik, setDataGrafik] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Realtime listener: Members =====
  useEffect(() => {
    const unsubscribe = onMembersSnapshot((data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===== Realtime listener: Presensi Hari Ini =====
  useEffect(() => {
    const unsubscribe = onPresensiTodaySnapshot((data) => {
      setPresensiHariIni(data);
    });
    return () => unsubscribe();
  }, []);

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

        const q = query(
          collection(db, "presensi"),
          where("tanggal", "==", tanggal)
        );
        const snapshot = await getDocs(q);

        result.push({
          tanggal: date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          kunjungan: snapshot.size,
        });
      }

      setDataGrafik(result);
    };

    fetchGrafik();
  }, [periodeGrafik]);

  // ===== Hitung statistik =====
  const memberAktif = members.filter((m) => {
    const status = hitungStatusMembership(m.tanggalExpired);
    return status !== "Expired";
  }).length;

  const expiredH7 = members.filter((m) => {
    const status = hitungStatusMembership(m.tanggalExpired);
    return status === "Aktif (H-7)";
  }).length;

  const checkInHariIni = presensiHariIni.length;

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

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>
          Memuat data...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* ===== STAT CARDS ===== */}
      <div className="stat-cards">
        <div className="stat-card card-member">
          <span className="stat-label">MEMBER AKTIF</span>
          <span className="stat-value">{memberAktif}</span>
        </div>
        <div className="stat-card card-expired">
          <span className="stat-label">EXPIRED H-7</span>
          <span className="stat-value">{expiredH7}</span>
        </div>
        <div className="stat-card card-checkin">
          <span className="stat-label">CHECK-IN HARI INI</span>
          <span className="stat-value">{checkInHariIni}</span>
        </div>
      </div>

      {/* ===== LOG CHECK-IN TERBARU ===== */}
      <div className="card-section">
        <h2 className="section-title">LOG CHECK-IN TERBARU</h2>
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
              {presensiHariIni.length > 0 ? (
                presensiHariIni.map((item, index) => (
                  <tr key={item.id}>
                    <td>{presensiHariIni.length - index}</td>
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
                          item.tipe === "Member" ? "tipe-member" : "tipe-tamu"
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
                    Belum ada check-in hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== GRAFIK KUNJUNGAN ===== */}
      <div className="card-section">
        <div className="section-header">
          <h2 className="section-title">Grafik Kunjungan</h2>
          <div className="grafik-toggle">
            <button
              className={`toggle-btn ${
                periodeGrafik === "7hari" ? "toggle-active" : ""
              }`}
              onClick={() => setPeriodeGrafik("7hari")}
            >
              7 Hari
            </button>
            <button
              className={`toggle-btn ${
                periodeGrafik === "30hari" ? "toggle-active" : ""
              }`}
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
              <Line
                type="monotone"
                dataKey="kunjungan"
                stroke="#4a90d9"
                strokeWidth={2}
                dot={{ fill: "#4a90d9", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;