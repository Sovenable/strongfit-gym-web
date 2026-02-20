import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();

  const isMemberPage =
    location.pathname === "/daftar-member" ||
    location.pathname === "/tambah-member" ||
    location.pathname === "/input-transaksi";

  const isKunjunganPage =
    location.pathname === "/laporan-presensi" ||
    location.pathname === "/pendataan-tamu";

  const [memberOpen, setMemberOpen] = useState(isMemberPage);
  const [kunjunganOpen, setKunjunganOpen] = useState(isKunjunganPage);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Strong Fit GYM</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item" end>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-group">
          <div
            className={`nav-item nav-dropdown ${isMemberPage ? "active" : ""}`}
            onClick={() => setMemberOpen(!memberOpen)}
          >
            <span>Kelola Member</span>
            <span className="nav-arrow">{memberOpen ? "▲" : "▼"}</span>
          </div>

          {memberOpen && (
            <div className="nav-submenu">
              <NavLink to="/daftar-member" className="nav-subitem">
                Daftar Member
              </NavLink>
              <NavLink to="/tambah-member" className="nav-subitem">
                Tambah Member
              </NavLink>
              <NavLink to="/input-transaksi" className="nav-subitem">
                Input Transaksi Membership
              </NavLink>
            </div>
          )}
        </div>

        <div className="nav-group">
          <div
            className={`nav-item nav-dropdown ${isKunjunganPage ? "active" : ""}`}
            onClick={() => setKunjunganOpen(!kunjunganOpen)}
          >
            <span>Data Kunjungan</span>
            <span className="nav-arrow">{kunjunganOpen ? "▲" : "▼"}</span>
          </div>

          {kunjunganOpen && (
            <div className="nav-submenu">
              <NavLink to="/laporan-presensi" className="nav-subitem">
                Laporan Presensi
              </NavLink>
              <NavLink to="/pendataan-tamu" className="nav-subitem">
                Pendataan Tamu
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;