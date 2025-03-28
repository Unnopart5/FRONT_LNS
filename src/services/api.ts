const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tuservicio.com/api";
export const ENDPOINTS = {
    GET_BOOK: `${API_BASE_URL}/LNS/consultar-libro`,
    GET_UnitEducation: `${API_BASE_URL}/LNS/lista-intituciones`,
    GET_LevelEducacion: `${API_BASE_URL}/LNS/lista-nivel-lectivo`,
    SEARCH_STUDENT: `${API_BASE_URL}/LNS/buscar-estudiante`,
    SAVE_LIBRO_ESTUDIANTE: `${API_BASE_URL}/LNS/save-estudiante-libro`,
  };
  