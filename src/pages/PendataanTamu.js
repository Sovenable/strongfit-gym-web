import React, { useState } from "react";
import { addTamu } from "../services/firebaseService";
import "./PendataanTamu.css";

function PendataanTamu() {
  const [formData, setFormData] = useState({
    nama: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const tanggalHariIni = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const validate = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama tamu tidak boleh kosong";
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = "Nama minimal 2 karakter";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.nama)) {
      newErrors.nama = "Nama hanya boleh huruf dan spasi";
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

  const handleSubmit = async () => {
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      await addTamu(formData);
      setSuccessMsg(
        `Tamu "${formData.nama}" berhasil dicatat pada ${tanggalHariIni}.`
      );
      setFormData({ nama: "" });
      setErrors({});
    } catch (error) {
      console.error("Error tambah tamu:", error);
      setErrors({ submit: "Gagal menyimpan data. Coba lagi." });
    }
    setLoading(false);
  };

  const handleBatal = () => {
    setFormData({ nama: "" });
    setErrors({});
    setSuccessMsg("");
  };

  return (
    <div className="pendataan-tamu">
      <h1 className="page-title">Pendataan Tamu</h1>

      <div className="form-card">
        <h2 className="form-card-title">Form Pendataan Tamu</h2>
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
          <div className="form-group">
            <label className="form-label">Tanggal Kunjungan</label>
            <div className="date-auto">{tanggalHariIni}</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nama Tamu <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nama"
              className={`form-input ${errors.nama ? "input-error" : ""}`}
              placeholder="Masukkan nama tamu"
              value={formData.nama}
              onChange={handleChange}
            />
            {errors.nama && <span className="error-text">{errors.nama}</span>}
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
            {loading ? "Menyimpan..." : "Simpan Data Tamu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendataanTamu;