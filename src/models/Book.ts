export interface Book {
codigoproducto: string;
sku: string;
serie: string;
titulo: string;
periodo: string;
codigoestudiante: string;
nombre: string;
}

export interface ApiResponse {
estado: number;
mensaje: string;
data: Book[];
}