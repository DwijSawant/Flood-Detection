/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Predict from "./pages/Predict";
import Analytics from "./pages/Analytics";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="pt-16">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/predict" replace />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}
