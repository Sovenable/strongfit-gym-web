import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import DaftarMember from "./pages/DaftarMember";
import TambahMember from "./pages/TambahMember";
import InputTransaksi from "./pages/InputTransaksi";
import LaporanPresensi from "./pages/LaporanPresensi";
import PendataanTamu from "./pages/PendataanTamu";
import SeedPage from "./pages/SeedPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Seed page TANPA layout/sidebar */}
        <Route path="/seed" element={<SeedPage />} />

        {/* Semua halaman lain PAKAI layout/sidebar */}
        <Route path="/*" element={
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
        } />
      </Routes>
    </Router>
  );
}

export default App;