import React, { useState } from "react";
import { addMember } from "../services/firebaseService";
import "./TambahMember.css";

const paketList = [
  { nama: "1 Bulan", harga: 150000, durasiHari: 30 },
  { nama: "3 Bulan", harga: 400000, durasiHari: 90 },
];

function TambahMember() {
  const [formData, setFormData] = useState({
    nama: "",
    nomorHp: "",
    fingerprintId: "",
    paketMembership: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!formData.fingerprintId.trim()) {
      newErrors.fingerprintId = "Fingerprint ID tidak boleh kosong";
    } else if (!/^\d+$/.test(formData.fingerprintId)) {
      newErrors.fingerprintId = "Fingerprint ID hanya boleh angka";
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
          `Member "${formData.nama}" berhasil ditambahkan dengan ID ${result.memberId}. Fingerprint ID: ${formData.fingerprintId} telah terhubung. Status membership: Aktif.`
        );
        setFormData({
          nama: "",
          nomorHp: "",
          fingerprintId: "",
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
      nomorHp: "",
      fingerprintId: "",
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

        {/* Info box enrollment */}
        <div className="info-box-enrollment">
          <strong>Langkah Pendaftaran Member:</strong>
          <p>
            1. Daftarkan sidik jari member di mesin ZKTeco terlebih dahulu dan catat User ID-nya.
            <br />
            2. Masukkan data member beserta Fingerprint ID (User ID dari mesin) pada form di bawah ini.
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

          {/* Fingerprint ID */}
          <div className="form-group">
            <label className="form-label">
              Fingerprint ID <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fingerprintId"
              className={`form-input ${errors.fingerprintId ? "input-error" : ""}`}
              placeholder="Masukkan User ID dari mesin ZKTeco"
              value={formData.fingerprintId}
              onChange={handleChange}
            />
            <span className="form-hint">
              User ID yang terdaftar di mesin fingerprint saat enrollment sidik jari
            </span>
            {errors.fingerprintId && (
              <span className="error-text">{errors.fingerprintId}</span>
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