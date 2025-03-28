import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { ReportBook } from '../models/ReportBook';
import { getUnitEducation, getNivelEducativo, SEARCH_STUDENT } from "../services/Service";
import { ResponseInstituciones } from '../models/Instituciones';
import { ResponseNivelEducativo } from '../models/NivelEducativo';

const ReportRegisterBook: React.FC = () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tuservicio.com/api";

  const [reportData, setReportData] = useState<ReportBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [unidadEducativa, setUnidadEducativa] = useState<string>('');
  const [ciclo, setCiclo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Opciones para los filtros
    const [unidadesEducativas, setUnidadesEducativas] = useState<ResponseInstituciones | null>(null);
    const [nivelEducativo, setNivelEducativo] = useState<ResponseNivelEducativo | null>(null);
  
  // Estado para controlar la deshabilitación de los filtros
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState<boolean>(false);

  // Cargar opciones para los filtros
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Aquí debes reemplazar con tus endpoints reales para obtener las opciones
        const [unidadesRes, nivelesRes] = await Promise.all([
          axios.get('/api/unidades-educativas'),
          axios.get('/api/niveles-educativos')
        ]);
        
        setUnidadesEducativas(unidadesRes.data);
        setNivelEducativo(nivelesRes.data);
      } catch (err) {
        console.error('Error cargando opciones de filtro:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Función para cargar los datos del reporte
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/LNS/reporte-libros-registrados`, {
        params: {
          institucion: unidadEducativa,
          nivelacademico: ciclo
        }
      });
      
      setReportData(response.data);
    } catch (err) {
      setError('Error al cargar los datos del reporte');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };



  // Filtrar datos localmente por término de búsqueda
  const filteredData = reportData.filter(item =>
    item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cedula.includes(searchTerm) ||
    item.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [unitData, nivelData] = await Promise.all([
        getUnitEducation(),
        getNivelEducativo()
      ]);
      setUnidadesEducativas(unitData);
      setNivelEducativo(nivelData);
    } catch (err) {
      handleError("Error al obtener datos de instituciones educativas", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleError = (message: string, error: any) => {
    setError(message);
  };

    useEffect(() => {
      fetchData();
    }, [fetchData]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Reporte de Libros Registrados
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl fullWidth sx={{ mt: 2 }} disabled={isCheckboxDisabled}>
          <InputLabel>Unidad Educativa</InputLabel>
          <Select
            value={unidadEducativa}
            onChange={(e) => setUnidadEducativa(e.target.value)}
            label="Unidad Educativa"
          >
            <MenuItem value="">Todos</MenuItem>
            {unidadesEducativas?.data.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth sx={{ mt: 2 }} disabled={isCheckboxDisabled}>
          <InputLabel>Ciclo</InputLabel>
          <Select
            value={ciclo}
            onChange={(e) => setCiclo(e.target.value)}
            label="Ciclo"
          >
            <MenuItem value="">Todos</MenuItem>
            {nivelEducativo?.data.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchReportData}>Generar Reporte</Button>
        <Button variant="contained" color='error'>Descargar PDF</Button>

      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="reporte de libros">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Código</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Serie</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Estudiante</TableCell>
                <TableCell>Institución</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Nivel Académico</TableCell>
                <TableCell>Fecha Registro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.codigo}>
                    <TableCell>{row.codigo}</TableCell>
                    <TableCell>{row.nombre_producto}</TableCell>
                    <TableCell>{row.serie}</TableCell>
                    <TableCell>{row.cedula}</TableCell>
                    <TableCell>{row.estudiante}</TableCell>
                    <TableCell>{row.institucion}</TableCell>
                    <TableCell>{row.periodo}</TableCell>
                    <TableCell>{row.nivel_academico}</TableCell>
                    <TableCell>{row.fecharegistro}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ReportRegisterBook;