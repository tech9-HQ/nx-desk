import React from "react";
import { Routes, Route } from "react-router-dom";
import NXHeader from "./components/NXHeader";
import NXFooter from "./components/NXFooter";
import Landing from "./components/Landing";
import CategoryShell from "./pages/CategoryShell";

export default function App() {
  return (
    <div>
      <NXHeader />
      <div style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/category/:slug" element={<CategoryShell />} />
        </Routes>
      </div>
      <NXFooter />
    </div>
  );
}
