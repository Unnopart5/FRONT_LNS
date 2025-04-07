import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Tooltip,
  InputAdornment
} from '@mui/material';
import axios from 'axios';
import { ReportBook } from '../models/ReportBook';
import { getUnitEducation, getNivelEducativo, SEARCH_STUDENT } from "../services/Service";
import { ResponseInstituciones } from '../models/Instituciones';
import { ResponseNivelEducativo } from '../models/NivelEducativo';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'ts-debounce';

const ReportRegisterBook: React.FC = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tuservicio.com/api";

  const [reportData, setReportData] = useState<ReportBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [unidadEducativa, setUnidadEducativa] = useState<string>('');
  const [ciclo, setCiclo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchParam, setSearchParam] = useState<string>('');


  // Opciones para los filtros
  const [unidadesEducativas, setUnidadesEducativas] = useState<ResponseInstituciones | null>(null);
  const [nivelEducativo, setNivelEducativo] = useState<ResponseNivelEducativo | null>(null);

  // Estado para controlar la deshabilitación de los filtros
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState<boolean>(false);

  // Cargar opciones para los filtros
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
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
          nivelacademico: ciclo,
          parameterSearch: searchParam
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

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      setError('No hay datos para exportar');
      return;
    }

    // Preparar los datos para Excel
    const dataForExcel = filteredData.map(item => ({
      'Producto': item.nombre_producto,
      'Serie': item.serie,
      'Cédula': item.cedula,
      'Estudiante': item.estudiante,
      'Institución': item.institucion,
      'Periodo': item.periodo,
      'Nivel Académico': item.nivel_academico,
      'Fecha Registro': item.fecharegistro,
      'Latitud': item.latitud,
      'Longitud': item.longitud
    }));

    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 30 }, // Producto
      { wch: 15 }, // Serie
      { wch: 15 }, // Cédula
      { wch: 30 }, // Estudiante
      { wch: 30 }, // Institución
      { wch: 15 }, // Periodo
      { wch: 20 }, // Nivel Académico
      { wch: 20 }, // Fecha Registro
      { wch: 15 }, // Latitud
      { wch: 15 }  // Longitud
    ];
    worksheet['!cols'] = wscols;

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Libros Registrados");

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Obtener fecha actual para el nombre del archivo
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    saveAs(data, `Reporte_Libros_${dateStr}.xlsx`);
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

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
      if (term) {
        fetchReportData(); // Ejecutar la búsqueda solo si hay término
      } else {
        // Si el término está vacío, puedes resetear los datos o mantenerlos
        setReportData([]); // Opcional: limpiar resultados cuando no hay búsqueda
      }
    }, 500), // 500ms de delay
    [] // Dependencias vacías porque no necesitamos recrear el debounce
  );

  // Limpiar el debounce al desmontar el componente
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Actualizar el estado local inmediatamente para mostrar lo que se escribe
    setSearchParam(value);
    // Ejecutar la búsqueda debounceada
    debouncedSearch(value);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Reporte de Libros Registrados
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        variant='standard'
        label="Busqueda por Nombre Estudiante/Cedula/Serie Libro"
        fullWidth
        value={searchParam} // Usamos searchParam para mostrar el texto actual
        onChange={handleSearchChange} // Nuevo handler
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
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

        <Button
          variant="contained"
          onClick={fetchReportData}
          sx={{ mt: 2, height: '56px' }}
        >
          Generar Reporte
        </Button>

        <Tooltip title="Descargar reporte en Excel">
          <Button
            variant="contained"
            color="success"
            onClick={exportToExcel}
            disabled={filteredData.length === 0}
            startIcon={<FileDownloadIcon />}
            sx={{ mt: 2, height: '56px' }}
          >
            Excel
          </Button>
        </Tooltip>


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
        <>


          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="reporte de libros">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Producto</TableCell>
                  <TableCell>Serie</TableCell>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Institución</TableCell>
                  <TableCell>Periodo</TableCell>
                  <TableCell>Nivel Académico</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                  <TableCell>Latitud</TableCell>
                  <TableCell>Longitud</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow key={row.codigo}>
                      <TableCell>{row.nombre_producto}</TableCell>
                      <TableCell>{row.serie}</TableCell>
                      <TableCell>{row.cedula}</TableCell>
                      <TableCell>{row.estudiante}</TableCell>
                      <TableCell>{row.institucion}</TableCell>
                      <TableCell>{row.periodo}</TableCell>
                      <TableCell>{row.nivel_academico}</TableCell>
                      <TableCell>{row.fecharegistro}</TableCell>
                      <TableCell>{row.latitud}</TableCell>
                      <TableCell>{row.longitud}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default ReportRegisterBook;