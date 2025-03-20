interface Estudiante {
    id: string;
    nombre: string;
    ciclo: string;
    periodo: string;

  }
  
  export interface ResponseEstudiante {
    estado: number;
    mensaje: string;
    data: Estudiante[];
  }