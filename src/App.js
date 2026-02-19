import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Main from "./landing/Main";
import Login from "./login";
import Signup from "./signup";
import Dashboard from "./dashboard";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
