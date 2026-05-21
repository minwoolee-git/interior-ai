import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_iV21q5nGLljNrkMfR_zIklymi2i5bbg",
  authDomain: "interior-ai-e40c1.firebaseapp.com",
  projectId: "interior-ai-e40c1",
  storageBucket: "interior-ai-e40c1.firebasestorage.app",
  messagingSenderId: "30885156802",
  appId: "1:30885156802:web:bb81a3b27ef308049f685b",
  measurementId: "G-7PCH0HXM5Z"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);