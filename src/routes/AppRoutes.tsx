import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ConsultarLibros from "../pages/ConsultarLibros";
import Administracion from "../pages/Admnistracion";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/buscar" element={<ConsultarLibros />} />
        <Route path="/administracion" element={<Administracion />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
