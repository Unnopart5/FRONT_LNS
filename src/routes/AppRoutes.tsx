import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ConsultarLibros from "../pages/ConsultarLibros";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/buscar" element={<ConsultarLibros />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
