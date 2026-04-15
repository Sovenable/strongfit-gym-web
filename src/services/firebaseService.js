// ============================================================
// firebaseService.js
// Semua fungsi baca/tulis ke Firestore ada di sini
// Halaman React tinggal import dan panggil fungsinya
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ==================== MEMBERS ====================

// Ambil semua member
export const getAllMembers = async () => {
  const snapshot = await getDocs(
    query(collection(db, "members"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Ambil 1 member by ID dokumen
export const getMemberById = async (docId) => {
  const docRef = doc(db, "members", docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Tambah member baru (field: nama, nomorHp, fingerprintId, paketMembership)
export const addMember = async (memberData) => {
  // Generate memberId otomatis: MBR001, MBR002, dst
  const snapshot = await getDocs(collection(db, "members"));
  const nextNum = snapshot.size + 1;
  const memberId = "SFBDL" + String(nextNum).padStart(3, "0");

  // Hitung tanggal expired berdasarkan paket
  const now = new Date();
  let durasiBulan = 1;
  if (memberData.paketMembership === "3 Bulan") durasiBulan = 3;
  if (memberData.paketMembership === "6 Bulan") durasiBulan = 6;

  const tanggalExpired = new Date(now);
  tanggalExpired.setMonth(tanggalExpired.getMonth() + durasiBulan);

  const newMember = {
    memberId: memberId,
    nama: memberData.nama,
    nomorHp: memberData.nomorHp,
    fingerprintId: memberData.fingerprintId,
    paketMembership: memberData.paketMembership,
    statusMembership: "Aktif",
    tanggalDaftar: Timestamp.fromDate(now),
    tanggalMulai: Timestamp.fromDate(now),
    tanggalExpired: Timestamp.fromDate(tanggalExpired),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "members"), newMember);
  return { id: docRef.id, ...newMember };
};

// Update data member
export const updateMember = async (docId, updatedData) => {
  const docRef = doc(db, "members", docId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// Realtime listener semua member (untuk dashboard)
export const onMembersSnapshot = (callback) => {
  const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(members);
    },
    (error) => {
      console.error("Error onMembersSnapshot:", error.message);
      // Fallback: coba tanpa orderBy
      const fallbackQ = query(collection(db, "members"));
      return onSnapshot(fallbackQ, (snapshot) => {
        const members = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(members);
      });
    }
  );
};

// ==================== PRESENSI ====================

// Ambil presensi berdasarkan tanggal (format: "2025-01-20")
export const getPresensiByDate = async (tanggal) => {
  try {
    const q = query(
      collection(db, "presensi"),
      where("tanggal", "==", tanggal),
      orderBy("waktuCheckIn", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Fallback: jika composite index belum ada, query tanpa orderBy
    console.warn("Composite index belum ada, fallback tanpa orderBy:", error.message);
    const q = query(
      collection(db, "presensi"),
      where("tanggal", "==", tanggal)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort manual di client
    results.sort((a, b) => {
      const timeA = a.waktuCheckIn?.toDate ? a.waktuCheckIn.toDate() : new Date(a.waktuCheckIn || 0);
      const timeB = b.waktuCheckIn?.toDate ? b.waktuCheckIn.toDate() : new Date(b.waktuCheckIn || 0);
      return timeB - timeA;
    });
    return results;
  }
};

// Ambil presensi berdasarkan bulan (format: "2025-01")
export const getPresensiByMonth = async (yearMonth) => {
  try {
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-32`; // akan selalu lebih besar dari tanggal manapun
    const q = query(
      collection(db, "presensi"),
      where("tanggal", ">=", startDate),
      where("tanggal", "<=", endDate)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    results.sort((a, b) => {
      const timeA = a.waktuCheckIn?.toDate ? a.waktuCheckIn.toDate() : new Date(a.waktuCheckIn || 0);
      const timeB = b.waktuCheckIn?.toDate ? b.waktuCheckIn.toDate() : new Date(b.waktuCheckIn || 0);
      return timeB - timeA;
    });
    return results;
  } catch (error) {
    console.error("Error fetch presensi bulanan:", error);
    return [];
  }
};

// Realtime listener presensi hari ini (untuk dashboard)
export const onPresensiTodaySnapshot = (callback) => {
  const today = new Date();
  const tanggal = toDateString(today);

  const q = query(
    collection(db, "presensi"),
    where("tanggal", "==", tanggal)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const presensi = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      presensi.sort((a, b) => {
        const timeA = a.waktuCheckIn?.toDate ? a.waktuCheckIn.toDate() : new Date(a.waktuCheckIn || 0);
        const timeB = b.waktuCheckIn?.toDate ? b.waktuCheckIn.toDate() : new Date(b.waktuCheckIn || 0);
        return timeB - timeA;
      });
      callback(presensi);
    },
    (error) => {
      console.error("Error onPresensiTodaySnapshot:", error.message);
      callback([]);
    }
  );
};

// Tambah presensi (dipanggil dari backend fingerprint, tapi juga bisa manual)
export const addPresensi = async (presensiData) => {
  const docRef = await addDoc(collection(db, "presensi"), {
    ...presensiData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...presensiData };
};

// ==================== TRANSAKSI MEMBERSHIP ====================

// Tambah transaksi + update status member
export const addTransaksiMembership = async (transaksiData, memberDocId) => {
  // Hitung tanggal baru
  const now = new Date();
  let durasiBulan = 1;
  if (transaksiData.paketMembership === "3 Bulan") durasiBulan = 3;
  if (transaksiData.paketMembership === "6 Bulan") durasiBulan = 6;
  // Cek apakah member masih aktif — kalau aktif, tambah dari tanggal expired lama
  const member = await getMemberById(memberDocId);
  let tanggalMulai = now;

  if (member && member.tanggalExpired) {
    const expiredDate = member.tanggalExpired.toDate
      ? member.tanggalExpired.toDate()
      : new Date(member.tanggalExpired);

    // Kalau masih aktif (expired > sekarang), perpanjang dari expired lama
    if (expiredDate > now) {
      tanggalMulai = expiredDate;
    }
  }

  const tanggalExpiredBaru = new Date(tanggalMulai);
  tanggalExpiredBaru.setMonth(tanggalExpiredBaru.getMonth() + durasiBulan);

  // Simpan transaksi
  const newTransaksi = {
    memberId: transaksiData.memberId,
    namaMember: transaksiData.namaMember,
    paketMembership: transaksiData.paketMembership,
    nominalPembayaran: transaksiData.nominalPembayaran,
    metodePembayaran: transaksiData.metodePembayaran,
    tanggalTransaksi: Timestamp.fromDate(now),
    tanggalMulai: Timestamp.fromDate(tanggalMulai),
    tanggalExpired: Timestamp.fromDate(tanggalExpiredBaru),
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "transaksiMembership"), newTransaksi);

  // Update status member
  await updateMember(memberDocId, {
    paketMembership: transaksiData.paketMembership,
    statusMembership: "Aktif",
    tanggalMulai: Timestamp.fromDate(tanggalMulai),
    tanggalExpired: Timestamp.fromDate(tanggalExpiredBaru),
  });

  return newTransaksi;
};
export const onTransaksiSnapshot = (callback) => {
  const q = query(
    collection(db, "transaksiMembership"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const transaksi = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(transaksi);
    },
    (error) => {
      console.error("Error onTransaksiSnapshot:", error.message);
      callback([]);
    }
  );
};
// ==================== TAMU ====================

// Tambah data tamu + otomatis masuk ke presensi
export const addTamu = async (tamuData) => {
  const now = new Date();
  const tanggal = toDateString(now);

  // Simpan ke collection tamu
  const newTamu = {
    nama: tamuData.nama,
    nomorHp: tamuData.nomorHp,
    tanggalKunjungan: tanggal,
    waktuKunjungan: Timestamp.fromDate(now),
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "tamu"), newTamu);

  // Simpan juga ke collection presensi (tipe: Tamu)
  await addPresensi({
    memberId: null,
    fingerprintId: null,
    nama: tamuData.nama,
    tipe: "Tamu",
    statusMembership: "-",
    waktuCheckIn: Timestamp.fromDate(now),
    tanggal: tanggal,
    sumber: "manual",
  });

  return newTamu;
};

// ==================== VALIDASI ====================

// Cek apakah nama member sudah terdaftar
export const cekNamaMemberExist = async (nama) => {
  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map((doc) => doc.data());
  return members.some(
    (m) => m.nama.toLowerCase() === nama.trim().toLowerCase()
  );
};

// Ambil fingerprint ID berikutnya (jumlah member + 1)
export const getNextFingerprintId = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  return String(snapshot.size + 1);
};

// ==================== HELPER ====================

// Format Date ke string "YYYY-MM-DD"
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Format Date ke string "YYYY-MM"
export function toMonthString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
// Ambil semua transaksi berdasarkan memberId (untuk modal riwayat)
export const getTransaksiByMemberId = async (memberId) => {
  const q = query(
    collection(db, "transaksiMembership"),
    where("memberId", "==", memberId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
// Hitung status membership berdasarkan tanggal expired
export function hitungStatusMembership(tanggalExpired) {
  if (!tanggalExpired) return "Expired";

  const now = new Date();
  const expired = tanggalExpired.toDate
    ? tanggalExpired.toDate()
    : new Date(tanggalExpired);

  const diffDays = Math.ceil((expired - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 3) return "Aktif (H-3)";
  if (diffDays <= 7) return "Aktif (H-7)";
  return "Aktif";
}