import axios from "axios";
import { ENDPOINTS } from "./api";
import {ApiResponse} from '../models/Book'
import { ResponseInstituciones } from "../models/Instituciones";
import { ResponseNivelEducativo } from "../models/NivelEducativo";
import { ResponseEstudiante } from "../models/Estudiante";
import { StudentBookSave } from "../models/StudentBookSave";


  
    export const getBook = async ( serie: string): Promise<ApiResponse> => {
      try {
        const response = await axios.get<ApiResponse>(`${ENDPOINTS.GET_BOOK}?serie=${serie}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching book:", error);
        throw error;
      }
    };

    export const downloadDuplicates = async (): Promise<void> => {
      try {
        const response = await axios.get(`${ENDPOINTS.DOWNLOAD_DUPLICATES}`, {
          responseType: "blob", // Importante para archivos binarios
        });
    
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "duplicados.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Error downloading duplicates Excel:", error);
        alert("No se pudo descargar el archivo.");
        throw error;
      }
    };


    export const saveStudentBook = async (data: StudentBookSave): Promise<ApiResponse> => {
      try {
        const response = await axios.post<ApiResponse>(`${ENDPOINTS.SAVE_LIBRO_ESTUDIANTE}`, data);
        return response.data; // Retorna la respuesta del servidor
      } catch (error) {
        console.error("Error saving student book:", error);
        throw error; // Lanza el error para ser capturado por quien llame la función
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
  


 


  