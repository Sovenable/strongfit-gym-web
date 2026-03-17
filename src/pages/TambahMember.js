import React, { useState, useEffect, useCallback } from "react";
import { addMember, cekNamaMemberExist } from "../services/firebaseService";
import "./TambahMember.css";

// URL backend API (sesuaikan kalau beda)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

const paketList = [
  { nama: "1 Bulan", harga: 150000, durasiHari: 30 },
  { nama: "3 Bulan", harga: 400000, durasiHari: 90 },
  { nama: "6 Bulan", harga: 750000, durasiHari: 180 },
];

function TambahMember() {
  const [formData, setFormData] = useState({
    nama: "",
    nomorHp: "",
    paketMembership: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [namaWarning, setNamaWarning] = useState("");

  // State untuk data dari alat sidik jari
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedFpId, setSelectedFpId] = useState("");
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [deviceError, setDeviceError] = useState("");

  // Fetch unassigned users dari alat via backend
  const fetchUnassignedUsers = useCallback(async () => {
    setDeviceLoading(true);
    setDeviceError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/unassigned-users`);
      const data = await response.json();

      if (data.success) {
        setUnassignedUsers(data.unassignedUsers);
        setDeviceConnected(true);

        // Auto-select user pertama (yang paling baru di-enroll)
        if (data.unassignedUsers.length > 0) {
          // Ambil yang terakhir (User ID terbesar = paling baru di-enroll)
          const latest = data.unassignedUsers[data.unassignedUsers.length - 1];
          setSelectedFpId(latest.uid);
        } else {
          setSelectedFpId("");
        }
      } else {
        setDeviceConnected(false);
        setDeviceError(data.message || "Gagal mengambil data dari mesin");
      }
    } catch (error) {
      setDeviceConnected(false);
      setDeviceError("Backend tidak terhubung. Pastikan server backend sedang berjalan.");
      console.error("Error fetch unassigned users:", error);
    }

    setDeviceLoading(false);
  }, []);

  // Fetch saat halaman dibuka
  useEffect(() => {
    fetchUnassignedUsers();
  }, [fetchUnassignedUsers]);

  const formatRupiah = (num) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  // Validasi form
  const validate = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama member tidak boleh kosong";
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = "Nama minimal 2 karakter";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.nama)) {
      newErrors.nama = "Nama hanya boleh huruf dan spasi";
    }

    if (!formData.nomorHp.trim()) {
      newErrors.nomorHp = "Nomor HP tidak boleh kosong";
    } else if (!/^08\d{8,11}$/.test(formData.nomorHp)) {
      newErrors.nomorHp = "Format: 08xxxxxxxxxx (10-13 digit)";
    }

    if (!formData.paketMembership) {
      newErrors.paketMembership = "Pilih paket membership";
    }

    if (!selectedFpId) {
      newErrors.fingerprintId = "Belum ada sidik jari yang terdaftar di alat. Daftarkan sidik jari member di mesin terlebih dahulu, lalu klik tombol Refresh.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Cek nama duplikat
    if (name === "nama" && value.trim().length >= 2) {
      const exist = await cekNamaMemberExist(value);
      if (exist) {
        setNamaWarning(`Nama "${value.trim()}" sudah terdaftar di sistem.`);
      } else {
        setNamaWarning("");
      }
    } else if (name === "nama") {
      setNamaWarning("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (validate()) {
      setLoading(true);
      try {
        const result = await addMember({
          ...formData,
          fingerprintId: selectedFpId,
        });
        setSuccessMsg(
          `Member "${formData.nama}" berhasil ditambahkan dengan ID ${result.memberId}. Fingerprint ID: ${selectedFpId} (dari alat sidik jari).`
        );
        setFormData({
          nama: "",
          nomorHp: "",
          paketMembership: "",
        });
        setErrors({});
        setNamaWarning("");

        // Refresh daftar unassigned users
        await fetchUnassignedUsers();
      } catch (error) {
        console.error("Error tambah member:", error);
        setErrors({ submit: "Gagal menyimpan data. Coba lagi." });
      }
      setLoading(false);
    }
  };

  const handleBatal = () => {
    setFormData({
      nama: "",
      nomorHp: "",
      paketMembership: "",
    });
    setErrors({});
    setSuccessMsg("");
    setNamaWarning("");
  };

  return (
    <div className="tambah-member">
      <h1 className="page-title">Tambah Member</h1>

      <div className="form-card">
        <h2 className="form-card-title">Form Pendaftaran Member Baru</h2>
        <div className="form-divider"></div>

        {/* Info box enrollment */}
        <div className="info-box-enrollment">
          <strong>Langkah Pendaftaran Member:</strong>
          <p>
            1. Daftarkan sidik jari member di mesin ZKTeco terlebih dahulu.
            <br />
            2. Klik tombol <strong>Refresh</strong> pada kolom Fingerprint ID untuk mendeteksi User ID baru dari alat.
            <br />
            3. Pilih Fingerprint ID yang sesuai, isi data member, lalu klik Tambah Member.
          </p>
        </div>

        {successMsg && (
          <div className="alert-success">
            <span>✓</span> {successMsg}
          </div>
        )}

        {errors.submit && (
          <div className="alert-error">
            <span>✕</span> {errors.submit}
          </div>
        )}

        <div className="form-body">
          {/* Fingerprint ID (dari alat) */}
          <div className="form-group">
            <label className="form-label">
              Fingerprint ID <span className="required">*</span>
            </label>

            {deviceLoading ? (
              <div className="device-status loading">
                Mengambil data dari mesin sidik jari...
              </div>
            ) : !deviceConnected ? (
              <div className="device-status error">
                <span>⚠ {deviceError}</span>
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={fetchUnassignedUsers}
                >
                  Coba Lagi
                </button>
              </div>
            ) : unassignedUsers.length === 0 ? (
              <div className="device-status warning">
                <span>
                  Tidak ada User ID baru di alat. Daftarkan sidik jari member di mesin terlebih dahulu.
                </span>
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={fetchUnassignedUsers}
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="fingerprint-select-wrapper">
                {unassignedUsers.length === 1 ? (
                  // Kalau cuma 1, tampilkan langsung sebagai readonly
                  <input
                    type="text"
                    className="form-input"
                    value={`${unassignedUsers[0].uid} (terdeteksi dari alat)`}
                    readOnly
                    style={{ backgroundColor: "#e8f5e9", cursor: "default", fontWeight: "600" }}
                  />
                ) : (
                  // Kalau lebih dari 1, tampilkan dropdown
                  <select
                    className={`form-select ${errors.fingerprintId ? "input-error" : ""}`}
                    value={selectedFpId}
                    onChange={(e) => {
                      setSelectedFpId(e.target.value);
                      if (errors.fingerprintId) {
                        setErrors({ ...errors, fingerprintId: "" });
                      }
                    }}
                  >
                    <option value="">-- Pilih Fingerprint ID --</option>
                    {unassignedUsers.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        User ID: {u.uid} {u.name ? `(${u.name})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="btn-refresh"
                  onClick={fetchUnassignedUsers}
                >
                  Refresh
                </button>
              </div>
            )}

            {errors.fingerprintId && (
              <span className="error-text">{errors.fingerprintId}</span>
            )}

            <span className="form-hint">
              {deviceConnected
                ? `Mesin terhubung — ${unassignedUsers.length} User ID baru terdeteksi`
                : "Mesin tidak terhubung"}
            </span>
          </div>

          {/* Nama */}
          <div className="form-group">
            <label className="form-label">
              Nama <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nama"
              className={`form-input ${errors.nama ? "input-error" : ""}`}
              placeholder="Masukkan nama member"
              value={formData.nama}
              onChange={handleChange}
            />
            {errors.nama && <span className="error-text">{errors.nama}</span>}
            {namaWarning && !errors.nama && (
              <span className="error-text" style={{ color: "#e8a838" }}>
                ⚠ {namaWarning}
              </span>
            )}
          </div>

          {/* Nomor HP */}
          <div className="form-group">
            <label className="form-label">
              Nomor HP <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nomorHp"
              className={`form-input ${errors.nomorHp ? "input-error" : ""}`}
              placeholder="08xxxxxxxxxxx"
              value={formData.nomorHp}
              onChange={handleChange}
            />
            <span className="form-hint">
              Format: 08xxxxxxxxxx (tanpa spasi atau tanda hubung)
            </span>
            {errors.nomorHp && (
              <span className="error-text">{errors.nomorHp}</span>
            )}
          </div>

          {/* Paket Membership */}
          <div className="form-group">
            <label className="form-label">
              Paket Membership <span className="required">*</span>
            </label>
            <select
              name="paketMembership"
              className={`form-select ${
                errors.paketMembership ? "input-error" : ""
              }`}
              value={formData.paketMembership}
              onChange={handleChange}
            >
              <option value="">-- Pilih Paket --</option>
              {paketList.map((p) => (
                <option key={p.nama} value={p.nama}>
                  {p.nama} - {formatRupiah(p.harga)}
                </option>
              ))}
            </select>
            {errors.paketMembership && (
              <span className="error-text">{errors.paketMembership}</span>
            )}
          </div>
        </div>

        <div className="form-divider"></div>

        <div className="form-actions">
          <button type="button" className="btn-batal" onClick={handleBatal}>
            Batal
          </button>
          <button
            type="button"
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Menyimpan..." : "Tambah Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TambahMember;