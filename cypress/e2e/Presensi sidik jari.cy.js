// ============================================================
// FT-03: Presensi Sidik Jari
// Pendekatan: Simulasi data presensi langsung ke Firestore
// Sesuai Tabel 3.6 TA — Skenario Pengujian Functional Testing
// ============================================================

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9rdDWSnKEtvJufVsBXUBAOg5q0StXCuI",
  authDomain: "strongfit-gym.firebaseapp.com",
  projectId: "strongfit-gym",
  storageBucket: "strongfit-gym.firebasestorage.app",
  messagingSenderId: "1079863596158",
  appId: "1:1079863596158:web:1c842d2678e48c22f5f42f",
};

const app =
  getApps().find((a) => a.name === "ft03") ||
  initializeApp(firebaseConfig, "ft03");
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "admin@strongfitgym.com";
const ADMIN_PASSWORD = "strongfitgym";

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

describe("FT-03: Presensi Sidik Jari", () => {
  const testMemberId = "TEST_FT03";
  const testNama = "TestPresensi FT Tiga";

  const firebaseSignIn = async () => {
    if (!auth.currentUser) {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    }
  };

  // Cleanup semua doc dengan memberId == testMemberId
  const cleanupData = async () => {
    await firebaseSignIn();
    const q = query(
      collection(db, "presensi"),
      where("memberId", "==", testMemberId)
    );
    const snapshot = await getDocs(q);
    const deletes = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "presensi", docSnap.id))
    );
    await Promise.all(deletes);
  };

  before(() => {
    cy.wrap(cleanupData(), { timeout: 15000 });
  });

  after(() => {
    cy.wrap(cleanupData(), { timeout: 15000 });
  });

  beforeEach(() => {
    cy.login();
  });

  // ----------------------------------------------------------
  // Skenario 1: Member aktif presensi
  // ----------------------------------------------------------
  it("Data presensi member aktif berhasil tampil di Dashboard dan Laporan Presensi", () => {
    const now = new Date();
    const tanggal = toDateString(now);

    const presensiData = {
      memberId: testMemberId,
      fingerprintId: "999",
      nama: testNama,
      tipe: "Member",
      statusMembership: "Aktif",
      waktuCheckIn: Timestamp.fromDate(now),
      tanggal: tanggal,
      sumber: "fingerprint",
      createdAt: serverTimestamp(),
    };

    cy.wrap(
      firebaseSignIn().then(() =>
        addDoc(collection(db, "presensi"), presensiData)
      ),
      { timeout: 15000 }
    ).should("exist");

    cy.visit("/");
    cy.get(".dashboard", { timeout: 10000 }).should("be.visible");
    cy.contains("td", testNama, { timeout: 15000 }).should("be.visible");

    cy.visit("/laporan-presensi");
    cy.get(".laporan-presensi", { timeout: 10000 }).should("be.visible");
    cy.get(".data-table tbody", { timeout: 15000 }).should("contain", testNama);

    cy.contains("tr", testNama).within(() => {
      cy.get(".status-badge").should("contain", "Aktif");
    });
  });

  // ----------------------------------------------------------
  // Skenario 2: Member expired presensi
  // Cleanup dulu data skenario 1, baru tulis data expired
  // dalam satu Promise chain supaya tidak race condition
  // ----------------------------------------------------------
  it("Data presensi member expired tetap tampil dengan status Expired", () => {
    const now = new Date();
    const tanggal = toDateString(now);

    const presensiDataExpired = {
      memberId: testMemberId,
      fingerprintId: "999",
      nama: testNama,
      tipe: "Member",
      statusMembership: "Expired",
      waktuCheckIn: Timestamp.fromDate(now),
      tanggal: tanggal,
      sumber: "fingerprint",
      createdAt: serverTimestamp(),
    };

    // Cleanup dan addDoc dalam satu chain — dijamin cleanup selesai dulu
    cy.wrap(
      cleanupData().then(() =>
        addDoc(collection(db, "presensi"), presensiDataExpired)
      ),
      { timeout: 20000 }
    ).should("exist");

    cy.visit("/laporan-presensi");
    cy.get(".laporan-presensi", { timeout: 10000 }).should("be.visible");
    cy.get(".data-table tbody", { timeout: 15000 }).should("contain", testNama);

    cy.contains("tr", testNama).within(() => {
      cy.get(".status-badge").should("contain", "Expired");
    });
  });
});