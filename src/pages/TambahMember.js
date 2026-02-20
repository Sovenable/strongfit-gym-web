import React, { useState } from "react";
import { addMember } from "../services/firebaseService";
import "./TambahMember.css";

function TambahMember() {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    nomorHp: "",
    paketMembership: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!formData.username.trim()) {
      newErrors.username = "Username tidak boleh kosong";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      newErrors.username = "Username hanya huruf kecil dan angka, tanpa spasi";
    }

    if (!formData.nomorHp.trim()) {
      newErrors.nomorHp = "Nomor HP tidak boleh kosong";
    } else if (!/^08\d{8,11}$/.test(formData.nomorHp)) {
      newErrors.nomorHp = "Format: 08xxxxxxxxxx (10-13 digit)";
    }

    if (!formData.paketMembership) {
      newErrors.paketMembership = "Pilih paket membership";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (validate()) {
      setLoading(true);
      try {
        const result = await addMember(formData);
        setSuccessMsg(
          `Member "${formData.nama}" berhasil ditambahkan dengan ID ${result.memberId} (Fingerprint ID: ${result.fingerprintId}). Silakan lakukan pendaftaran sidik jari di perangkat presensi dengan ID: ${result.fingerprintId}`
        );
        setFormData({
          nama: "",
          username: "",
          nomorHp: "",
          paketMembership: "",
        });
        setErrors({});
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
      username: "",
      nomorHp: "",
      paketMembership: "",
    });
    setErrors({});
    setSuccessMsg("");
  };

  return (
    <div className="tambah-member">
      <h1 className="page-title">Tambah Member</h1>

      <div className="form-card">
        <h2 className="form-card-title">Form Pendaftaran Member Baru</h2>
        <div className="form-divider"></div>

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
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              name="username"
              className={`form-input ${errors.username ? "input-error" : ""}`}
              placeholder="Masukkan username"
              value={formData.username}
              onChange={handleChange}
            />
            <span className="form-hint">
              Username akan digunakan untuk generate email:{" "}
              <strong>{formData.username || "username"}@strongfitgym.id</strong>
            </span>
            {errors.username && (
              <span className="error-text">{errors.username}</span>
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
              <option value="1 Bulan">1 Bulan - Rp 150.000</option>
              <option value="3 Bulan">3 Bulan - Rp 400.000</option>
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