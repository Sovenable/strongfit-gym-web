// ============================================================
// seedData.js
// Jalankan SEKALI untuk mengisi Firestore dengan data dummy
// Cara jalankan: buka browser, akses halaman /seed
// ============================================================

import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ==================== DATA DUMMY ====================

const dummyMembers = [
  { memberId: "MBR001", nama: "Ahmad Rizky", username: "ahmadrizky", nomorHp: "081234567801", fingerprintId: "1", paketMembership: "1 Bulan", daysFromNow: 5 },
  { memberId: "MBR002", nama: "Budi Santoso", username: "budisantoso", nomorHp: "081234567802", fingerprintId: "2", paketMembership: "3 Bulan", daysFromNow: 2 },
  { memberId: "MBR003", nama: "Citra Dewi", username: "citradewi", nomorHp: "081234567803", fingerprintId: "3", paketMembership: "1 Bulan", daysFromNow: -5 },
  { memberId: "MBR004", nama: "Doni Pratama", username: "donipratama", nomorHp: "081234567804", fingerprintId: "4", paketMembership: "1 Bulan", daysFromNow: 25 },
  { memberId: "MBR005", nama: "Eka Saputra", username: "ekasaputra", nomorHp: "081234567805", fingerprintId: "5", paketMembership: "3 Bulan", daysFromNow: -10 },
  { memberId: "MBR006", nama: "Fajar Nugroho", username: "fajarnugroho", nomorHp: "081234567806", fingerprintId: "6", paketMembership: "1 Bulan", daysFromNow: 20 },
  { memberId: "MBR007", nama: "Gita Permata", username: "gitapermata", nomorHp: "081234567807", fingerprintId: "7", paketMembership: "1 Bulan", daysFromNow: 6 },
  { memberId: "MBR008", nama: "Hendra Wijaya", username: "hendrawijaya", nomorHp: "081234567808", fingerprintId: "8", paketMembership: "3 Bulan", daysFromNow: 45 },
  { memberId: "MBR009", nama: "Indah Lestari", username: "indahlestari", nomorHp: "081234567809", fingerprintId: "9", paketMembership: "1 Bulan", daysFromNow: 1 },
  { memberId: "MBR010", nama: "Joko Susanto", username: "jokosusanto", nomorHp: "081234567810", fingerprintId: "10", paketMembership: "1 Bulan", daysFromNow: 15 },
  { memberId: "MBR011", nama: "Kartika Sari", username: "kartikasari", nomorHp: "081234567811", fingerprintId: "11", paketMembership: "1 Bulan", daysFromNow: -3 },
  { memberId: "MBR012", nama: "Lukman Hakim", username: "lukmanhakim", nomorHp: "081234567812", fingerprintId: "12", paketMembership: "3 Bulan", daysFromNow: 60 },
  { memberId: "MBR013", nama: "Maya Anggraeni", username: "mayaanggraeni", nomorHp: "081234567813", fingerprintId: "13", paketMembership: "1 Bulan", daysFromNow: 4 },
  { memberId: "MBR014", nama: "Nanda Putra", username: "nandaputra", nomorHp: "081234567814", fingerprintId: "14", paketMembership: "1 Bulan", daysFromNow: 18 },
  { memberId: "MBR015", nama: "Olivia Rahman", username: "oliviarahman", nomorHp: "081234567815", fingerprintId: "15", paketMembership: "1 Bulan", daysFromNow: -7 },
  { memberId: "MBR016", nama: "Putra Pratama", username: "putrapratama", nomorHp: "081234567816", fingerprintId: "16", paketMembership: "1 Bulan", daysFromNow: 7 },
  { memberId: "MBR017", nama: "Rina Marlina", username: "rinamarlina", nomorHp: "081234567817", fingerprintId: "17", paketMembership: "3 Bulan", daysFromNow: 30 },
  { memberId: "MBR018", nama: "Sandi Firmansyah", username: "sandifirmansyah", nomorHp: "081234567818", fingerprintId: "18", paketMembership: "1 Bulan", daysFromNow: 3 },
  { memberId: "MBR019", nama: "Tina Agustina", username: "tinaagustina", nomorHp: "081234567819", fingerprintId: "19", paketMembership: "1 Bulan", daysFromNow: 22 },
  { memberId: "MBR020", nama: "Umar Bakri", username: "umarbakri", nomorHp: "081234567820", fingerprintId: "20", paketMembership: "1 Bulan", daysFromNow: -15 },
];

// Paket membership
const paketMembership = [
  { namaPaket: "1 Bulan", durasiHari: 30, harga: 150000, aktif: true },
  { namaPaket: "3 Bulan", durasiHari: 90, harga: 400000, aktif: true },
];

// ==================== HELPER ====================

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hitungStatus(daysFromNow) {
  if (daysFromNow < 0) return "Expired";
  if (daysFromNow <= 3) return "Aktif (H-3)";
  if (daysFromNow <= 7) return "Aktif (H-7)";
  return "Aktif";
}

// ==================== SEED FUNCTION ====================

export async function seedDatabase() {
  const results = { members: 0, presensi: 0, tamu: 0, paket: 0 };

  try {
    // Cek apakah sudah pernah di-seed
    const existingMembers = await getDocs(collection(db, "members"));
    if (existingMembers.size > 0) {
      return { error: "Database sudah berisi data! Hapus dulu kalau mau seed ulang." };
    }

    // 1. Seed Paket Membership
    for (const paket of paketMembership) {
      await addDoc(collection(db, "paketMembership"), {
        ...paket,
        createdAt: serverTimestamp(),
      });
      results.paket++;
    }

    // 2. Seed Members
    const now = new Date();
    for (const m of dummyMembers) {
      const tanggalExpired = new Date(now);
      tanggalExpired.setDate(tanggalExpired.getDate() + m.daysFromNow);

      const tanggalDaftar = new Date(now);
      tanggalDaftar.setDate(tanggalDaftar.getDate() - 30); // daftar 30 hari lalu

      await addDoc(collection(db, "members"), {
        memberId: m.memberId,
        nama: m.nama,
        username: m.username,
        nomorHp: m.nomorHp,
        fingerprintId: m.fingerprintId,
        paketMembership: m.paketMembership,
        statusMembership: hitungStatus(m.daysFromNow),
        tanggalDaftar: Timestamp.fromDate(tanggalDaftar),
        tanggalMulai: Timestamp.fromDate(tanggalDaftar),
        tanggalExpired: Timestamp.fromDate(tanggalExpired),
        createdAt: Timestamp.fromDate(
          new Date(now.getTime() - (20 - results.members) * 60000)
        ),
        updatedAt: serverTimestamp(),
      });
      results.members++;
    }

    // 3. Seed Presensi (3 hari terakhir)
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      const tanggal = toDateString(date);

      // Random 6-10 member check-in per hari
      const shuffled = [...dummyMembers].sort(() => Math.random() - 0.5);
      const checkInCount = 6 + Math.floor(Math.random() * 5);
      const checkIns = shuffled.slice(0, checkInCount);

      for (let i = 0; i < checkIns.length; i++) {
        const m = checkIns[i];
        const jamCheckIn = new Date(date);
        jamCheckIn.setHours(7 + Math.floor(i / 3), (i * 7 + 10) % 60, 0, 0);

        await addDoc(collection(db, "presensi"), {
          memberId: m.memberId,
          fingerprintId: m.fingerprintId,
          nama: m.nama,
          tipe: "Member",
          statusMembership: hitungStatus(m.daysFromNow),
          waktuCheckIn: Timestamp.fromDate(jamCheckIn),
          tanggal: tanggal,
          sumber: "fingerprint",
          createdAt: Timestamp.fromDate(jamCheckIn),
        });
        results.presensi++;
      }

      // Tambah 1-2 tamu per hari
      const tamuCount = 1 + Math.floor(Math.random() * 2);
      const namasTamu = ["Riko Aditya", "Siska Permata", "Wawan Setiawan", "Dewi Kartini"];
      for (let t = 0; t < tamuCount; t++) {
        const jamTamu = new Date(date);
        jamTamu.setHours(9 + t * 3, 30, 0, 0);
        const namaTamu = namasTamu[(dayOffset * 2 + t) % namasTamu.length];

        // Ke collection tamu
        await addDoc(collection(db, "tamu"), {
          nama: namaTamu,
          nomorHp: "08129999000" + t,
          tanggalKunjungan: tanggal,
          waktuKunjungan: Timestamp.fromDate(jamTamu),
          createdAt: Timestamp.fromDate(jamTamu),
        });

        // Ke collection presensi juga
        await addDoc(collection(db, "presensi"), {
          memberId: null,
          fingerprintId: null,
          nama: namaTamu,
          tipe: "Tamu",
          statusMembership: "-",
          waktuCheckIn: Timestamp.fromDate(jamTamu),
          tanggal: tanggal,
          sumber: "manual",
          createdAt: Timestamp.fromDate(jamTamu),
        });
        results.tamu++;
        results.presensi++;
      }
    }

    return results;
  } catch (error) {
    console.error("Seed error:", error);
    return { error: error.message };
  }
}