import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCt-3LpEQaAbL0kx3raaxUnbi6OSENP9PM",
  authDomain: "testing-a6f07.firebaseapp.com",
  projectId: "testing-a6f07",
  storageBucket: "testing-a6f07.appspot.com",
  messagingSenderId: "762541867739",
  appId: "1:762541867739:web:0c2983a08bf93062b502fe",
  measurementId: "G-2EVPTXB01P",
};

const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);
