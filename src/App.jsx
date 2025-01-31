import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import LoginPage from "./LoginPage";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("ユーザーがログインしています:", user);
        setUser(user);
      } else {
        console.log("ユーザーがログインしていません");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;