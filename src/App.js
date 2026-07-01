import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DaftarMember from "./pages/DaftarMember";
import TambahMember from "./pages/TambahMember";
import InputTransaksi from "./pages/InputTransaksi";
import LaporanPresensi from "./pages/LaporanPresensi";
import PendataanTamu from "./pages/PendataanTamu";
import "./App.css";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ padding: 40, textAlign: "center" }}>Memuat...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/daftar-member" element={<DaftarMember />} />
                  <Route path="/tambah-member" element={<TambahMember />} />
                  <Route path="/input-transaksi" element={<InputTransaksi />} />
                  <Route path="/laporan-presensi" element={<LaporanPresensi />} />
                  <Route path="/pendataan-tamu" element={<PendataanTamu />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
