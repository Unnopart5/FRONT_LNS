interface NivelEducativo {
    id: number;
    descripcion: string;
  }
  
  export interface ResponseNivelEducativo {
    estado: number;
    mensaje: string;
    data: NivelEducativo[];
  }