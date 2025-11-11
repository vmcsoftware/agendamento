import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXyk7JdlLx1V41dfPptMAaM5wYQlSKt5E",
  authDomain: "agendar-92c07.firebaseapp.com",
  projectId: "agendar-92c07",
  storageBucket: "agendar-92c07.firebasestorage.app",
  messagingSenderId: "476296568739",
  appId: "1:476296568739:web:ddefc073d3a22370464416",
  measurementId: "G-BWDRM9L1K6",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);