import axios from "axios";
import { ENDPOINTS } from "./api";
import {ApiResponse} from '../models/Book'
import { ResponseInstituciones } from "../models/Instituciones";
import { ResponseNivelEducativo } from "../models/NivelEducativo";
import { ResponseEstudiante } from "../models/Estudiante";


  
  export const getBook = async ( sku: string, serie:string): Promise<ApiResponse> => {
    try {
      const response = await axios.get<ApiResponse>(`${ENDPOINTS.GET_BOOK}?sku=${sku}&serie=${serie}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  };

    
  export const getUnitEducation = async (): Promise<ResponseInstituciones> => {
    try {
      const response = await axios.get<ResponseInstituciones>(`${ENDPOINTS.GET_UnitEducation}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  };


  export const SEARCH_STUDENT = async (cedula:string): Promise<ResponseEstudiante> => {
    try {
      const response = await axios.get<ResponseEstudiante>(`${ENDPOINTS.SEARCH_STUDENT}?cedula=${cedula}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  };


  export const getNivelEducativo = async (): Promise<ResponseNivelEducativo> => {
    try {
      const response = await axios.get<ResponseNivelEducativo>(`${ENDPOINTS.GET_LevelEducacion}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  };
  


 


  