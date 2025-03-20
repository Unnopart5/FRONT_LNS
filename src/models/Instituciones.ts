interface Institution {
    id: number;
    descripcion: string;
  }
  
  export interface ResponseInstituciones {
    estado: number;
    mensaje: string;
    data: Institution[];
  }