import React, { useState, useEffect } from "react";
import {
  onMembersSnapshot,
  onPresensiTodaySnapshot,
  hitungStatusMembership,
} from "../services/firebaseService";
import "./Dashboard.css";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [presensiHariIni, setPresensiHariIni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(15);
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
  // Fetch polling interval dari backend (sekali saat mount)
  useEffect(() => {
    const fetchPollingInfo = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/polling-info");
        const data = await res.json();
        const detik = Math.round(data.pollingInterval / 1000);
        setPollingInterval(detik);
        setCountdown(detik);
      } catch {
        setCountdown(15); // default kalau backend offline
      }
    };
    fetchPollingInfo();
  }, []);

  // Countdown timer — reset tiap kali habis
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(pollingInterval);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, pollingInterval]);
  // ===== Hitung statistik =====
  const memberAktif = members.filter((m) => {
    const status = hitungStatusMembership(m.tanggalExpired);
    return status !== "Expired" && status !== "Belum Aktif";
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
    if (status === "Belum Aktif") return "status-badge status-default";
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
      {/* Countdown refresh */}
      {countdown !== null && (
        <div className="refresh-countdown">
          <span className="refresh-icon">🔄</span>
          <span className="refresh-text">
            Refresh data fingerprint dalam{" "}
            <strong style={{ color: countdown <= 5 ? "#e74c3c" : "#4a90d9" }}>
              {countdown}
            </strong>{" "}
            detik
          </span>
        </div>
      )}
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
                <th style={{ width: "50px" }}>No</th>
                <th style={{ width: "100px" }}>No Member</th>
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
                    <td>{item.tipe === "Member" ? item.memberId || "-" : "-"}</td>
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
                  <td colSpan="6" className="empty-row">
                    Belum ada check-in hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;