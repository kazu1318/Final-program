import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

export const addClass = async (userId, classData) => {
  const docRef = await addDoc(collection(db, "classes"), { ...classData, userId });
  return docRef;
};

export const getClasses = async (userId) => {
  const q = query(collection(db, "classes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addTask = async (userId, taskData) => {
  await addDoc(collection(db, "tasks"), { ...taskData, userId });
};

export const getTasks = async (userId) => {
  const q = query(collection(db, "tasks"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};