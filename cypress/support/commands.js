// ============================================================
// cypress/support/commands.js
// Custom command cy.login() untuk Firebase Auth
//
// Strategi: Login via Firebase REST API, lalu inject token ke
// localStorage dengan format yang dikenali Firebase SDK v9+.
// Ini bypass UI login sepenuhnya — lebih cepat & reliable.
// onAuthStateChanged di App.js akan otomatis detect token ini.
// ============================================================

const FIREBASE_API_KEY = "AIzaSyD9rdDWSnKEtvJufVsBXUBAOg5q0StXCuI";
const ADMIN_EMAIL = "admin@strongfitgym.com";
const ADMIN_PASSWORD = "strongfitgym";

Cypress.Commands.add("login", () => {
  cy.session(
    "firebase-admin-session",
    () => {
      // Login via REST API — tidak perlu buka halaman login sama sekali
      cy.request({
        method: "POST",
        url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        body: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          returnSecureToken: true,
        },
        failOnStatusCode: true,
      }).then((response) => {
        const { idToken, refreshToken, localId, email, expiresIn } = response.body;

        // Key format yang dipakai Firebase SDK v9: firebase:authUser:{apiKey}:[DEFAULT]
        const authKey = `firebase:authUser:${FIREBASE_API_KEY}:[DEFAULT]`;

        const authUser = {
          uid: localId,
          email: email,
          emailVerified: true,
          isAnonymous: false,
          providerData: [
            {
              providerId: "password",
              uid: email,
              displayName: null,
              email: email,
              phoneNumber: null,
              photoURL: null,
            },
          ],
          stsTokenManager: {
            refreshToken: refreshToken,
            accessToken: idToken,
            expirationTime: Date.now() + parseInt(expiresIn) * 1000,
          },
          createdAt: Date.now().toString(),
          lastLoginAt: Date.now().toString(),
          apiKey: FIREBASE_API_KEY,
          appName: "[DEFAULT]",
        };

        window.localStorage.setItem(authKey, JSON.stringify(authUser));
      });
    },
    {
      // Validasi session masih valid — cek token masih ada di localStorage
      validate() {
        const authKey = `firebase:authUser:${FIREBASE_API_KEY}:[DEFAULT]`;
        const stored = window.localStorage.getItem(authKey);
        expect(stored, "Firebase auth token harus ada di localStorage").to.not.be.null;
      },
      cacheAcrossSpecs: true,
    }
  );
});
