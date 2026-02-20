import React, { useState, useEffect } from "react";
import {
  onMembersSnapshot,
  addTransaksiMembership,
  hitungStatusMembership,
} from "../services/firebaseService";
import "./InputTransaksi.css";

const paketList = [
  { nama: "1 Bulan", harga: 150000, durasiHari: 30 },
  { nama: "3 Bulan", harga: 400000, durasiHari: 90 },
];

function InputTransaksi() {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPaket, setSelectedPaket] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ===== Realtime listener: Members =====
  useEffect(() => {
    const unsubscribe = onMembersSnapshot((data) => {
      setMembers(data);
    });
    return () => unsubscribe();
  }, []);

  // ===== Cari member =====
  const filteredMembers = members.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nomorHp.includes(searchQuery) ||
      m.memberId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (member) => {
    setSelectedMember({
      ...member,
      statusRealtime: hitungStatusMembership(member.tanggalExpired),
    });
    setSearchQuery(member.nama);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedMember(null);
    setShowDropdown(e.target.value.length > 0);
  };

  // ===== Harga otomatis =====
  const getNominal = () => {
    const paket = paketList.find((p) => p.nama === selectedPaket);
    return paket ? paket.harga : 0;
  };

  const formatRupiah = (num) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  // ===== Format tanggal dari Timestamp =====
  const formatTanggal = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ===== Validasi =====
  const validate = () => {
    const newErrors = {};
    if (!selectedMember) newErrors.member = "Pilih member terlebih dahulu";
    if (!selectedPaket) newErrors.paket = "Pilih paket membership";
    if (!metodePembayaran) newErrors.metode = "Pilih metode pembayaran";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Submit ke Firestore =====
  const handleSubmit = async () => {
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      const transaksiData = {
        memberId: selectedMember.memberId,
        namaMember: selectedMember.nama,
        paketMembership: selectedPaket,
        nominalPembayaran: getNominal(),
        metodePembayaran: metodePembayaran,
      };

      await addTransaksiMembership(transaksiData, selectedMember.id);

      setSuccessMsg(
        `Transaksi membership "${selectedPaket}" untuk ${selectedMember.nama} berhasil dicatat! (${formatRupiah(getNominal())} - ${metodePembayaran})`
      );

      // Reset form
      setSearchQuery("");
      setSelectedMember(null);
      setSelectedPaket("");
      setMetodePembayaran("");
      setErrors({});
    } catch (error) {
      console.error("Error transaksi:", error);
      setErrors({ submit: "Gagal menyimpan transaksi. Coba lagi." });
    }
    setLoading(false);
  };

  // ===== Reset form =====
  const handleBatal = () => {
    setSearchQuery("");
    setSelectedMember(null);
    setSelectedPaket("");
    setMetodePembayaran("");
    setErrors({});
    setSuccessMsg("");
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

  return (
    <div className="input-transaksi">
      <h1 className="page-title">Input Transaksi Membership</h1>

      <div className="form-card">
        <h2 className="form-card-title">Transaksi Perpanjangan Membership</h2>
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
          {/* Cari Member */}
          <div className="form-group">
            <label className="form-label">
              Cari Member <span className="required">*</span>
            </label>
            <div className="search-wrapper">
              <input
                type="text"
                className={`form-input ${errors.member ? "input-error" : ""}`}
                placeholder="Cari berdasarkan nama, nomor HP, atau ID member..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && (
                <div className="search-dropdown">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.slice(0, 8).map((m) => (
                      <div
                        key={m.id}
                        className="search-item"
                        onMouseDown={() => handleSelectMember(m)}
                      >
                        <div>
                          <span className="search-item-name">{m.nama}</span>
                          <span className="search-item-id"> ({m.memberId})</span>
                        </div>
                        <span className="search-item-hp">{m.nomorHp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-empty">Member tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
            {errors.member && (
              <span className="error-text">{errors.member}</span>
            )}
          </div>

          {/* Info Member yang Dipilih */}
          {selectedMember && (
            <div className="member-info-card">
              <div className="member-info-row">
                <span className="info-label">ID Member</span>
                <span className="info-value">{selectedMember.memberId}</span>
              </div>
              <div className="member-info-row">
                <span className="info-label">Nama</span>
                <span className="info-value">{selectedMember.nama}</span>
              </div>
              <div className="member-info-row">
                <span className="info-label">Nomor HP</span>
                <span className="info-value">{selectedMember.nomorHp}</span>
              </div>
              <div className="member-info-row">
                <span className="info-label">Status Saat Ini</span>
                <span className={getStatusClass(selectedMember.statusRealtime)}>
                  {selectedMember.statusRealtime}
                </span>
              </div>
              <div className="member-info-row">
                <span className="info-label">Expired</span>
                <span className="info-value">
                  {formatTanggal(selectedMember.tanggalExpired)}
                </span>
              </div>
            </div>
          )}

          {/* Pilih Paket */}
          <div className="form-group">
            <label className="form-label">
              Paket Membership <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.paket ? "input-error" : ""}`}
              value={selectedPaket}
              onChange={(e) => {
                setSelectedPaket(e.target.value);
                if (errors.paket) setErrors({ ...errors, paket: "" });
              }}
            >
              <option value="">-- Pilih Paket --</option>
              {paketList.map((p) => (
                <option key={p.nama} value={p.nama}>
                  {p.nama} - {formatRupiah(p.harga)}
                </option>
              ))}
            </select>
            {errors.paket && (
              <span className="error-text">{errors.paket}</span>
            )}
          </div>

          {/* Nominal Otomatis */}
          {selectedPaket && (
            <div className="form-group">
              <label className="form-label">Nominal Pembayaran</label>
              <div className="nominal-display">
                {formatRupiah(getNominal())}
              </div>
            </div>
          )}

          {/* Metode Pembayaran */}
          <div className="form-group">
            <label className="form-label">
              Metode Pembayaran <span className="required">*</span>
            </label>
            <select
              className={`form-select ${errors.metode ? "input-error" : ""}`}
              value={metodePembayaran}
              onChange={(e) => {
                setMetodePembayaran(e.target.value);
                if (errors.metode) setErrors({ ...errors, metode: "" });
              }}
            >
              <option value="">-- Pilih Metode --</option>
              <option value="Cash">Cash</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer">Transfer Rekening</option>
            </select>
            {errors.metode && (
              <span className="error-text">{errors.metode}</span>
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
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputTransaksi;