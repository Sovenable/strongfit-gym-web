import React, { useState } from "react";
import { seedDatabase } from "../services/seedData";

function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await seedDatabase();
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🌱 Seed Database</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Klik tombol di bawah untuk mengisi Firestore dengan data dummy.
        <br />
        <strong>Jalankan SEKALI aja!</strong> Kalau udah ada data, harus hapus
        manual di Firebase Console dulu.
      </p>

      <button
        onClick={handleSeed}
        disabled={loading}
        style={{
          padding: "12px 32px",
          background: loading ? "#999" : "#1a1a2e",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sedang seed..." : "🚀 Seed Database Sekarang"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "8px",
            background: result.error ? "#fde8e8" : "#e6f4ea",
            color: result.error ? "#c62828" : "#1e7e34",
          }}
        >
          {result.error ? (
            <p>❌ Error: {result.error}</p>
          ) : (
            <div>
              <p>✅ Seed berhasil!</p>
              <p>📦 Paket Membership: {result.paket}</p>
              <p>👥 Members: {result.members}</p>
              <p>📋 Presensi: {result.presensi}</p>
              <p>🚶 Tamu: {result.tamu}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SeedPage;