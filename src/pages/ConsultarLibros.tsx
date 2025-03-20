import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Container, Button, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';  // Importamos el ícono de la lupa
import { useSearchParams } from "react-router-dom";
import HeaderPages from "../components/HeaderPages";
import { ApiResponse } from "../models/Book";
import { getBook, getUnitEducation, getNivelEducativo, SEARCH_STUDENT } from "../services/Service";
import Grid from '@mui/material/Grid2';
import { ResponseInstituciones } from "../models/Instituciones";
import { ResponseNivelEducativo } from "../models/NivelEducativo";
import { ResponseEstudiante } from "../models/Estudiante";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { ToastContainer, toast } from 'react-toastify';

const ConsultarLibros: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [bookData, setBookData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // States for additional search criteria
  const [cedula, setCedula] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [serie, setSerie] = useState<string>('');
  const [nombreEstudiante, setNombreEstudiante] = useState<string>('');
  const [unidadEducativa, setUnidadEducativa] = useState<string>('');
  const [ciclo, setCiclo] = useState<string>('');
  const [acceptData, setAcceptData] = useState<boolean>(false);
  const [unidadesEducativas, setUnidadesEducativas] = useState<ResponseInstituciones | null>();
  const [nivelEducativo, setNivelEducativo] = useState<ResponseNivelEducativo | null>();
  const [estudiante, setEstudiante] = useState<ResponseEstudiante | null>();
  const [cantidadLibros, setCantidadLibros] = useState<number>(1);
  const [series, setSeries] = useState<string[]>([""]);

  useEffect(() => {
    fetchUnitEducation()
    fetchNivelEducativo()
  }, [])


  const fetchBook = async () => {
    setLoading(true);
    try {
      const data = await getBook(sku, serie);
      setBookData(data);
    } catch (err) {
      setError("Error al obtener los datos del libro.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitEducation = async () => {
    setLoading(true);
    try {
      const data = await getUnitEducation();
      setUnidadesEducativas(data);
    } catch (err) {
      setError("Error al obtener los datos del libro.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNivelEducativo = async () => {
    setLoading(true);
    try {
      const data = await getNivelEducativo();
      setNivelEducativo(data);
    } catch (err) {
      setError("Error al obtener los datos del libro.");
    } finally {
      setLoading(false);
    }
  };

  const fetchestudiante = async () => {
    const esValida = validarCedula(cedula);
    if  (!esValida){
      return toast.error("LA CEDULA INGRESADA NO ES VALIDA",{position: "top-center"});
    }
    try {
      const data = await SEARCH_STUDENT(cedula);  
      if(data.estado === 404 ){
        setNombreEstudiante(data.estado !== 404 ? data.data[0].nombre : "");
        setUnidadEducativa(data.estado !== 404 ? data.data[0].periodo : "")
        setCiclo(data.estado !== 404 ? data.data[0].ciclo : "") 
        return toast.warn("NO SE ENCONTRO ESTUDIANTE, INGRESE SUS DATOS",{position: "top-center"});
      }
      setEstudiante(data);
    } catch (err) {
      setError("Error al obtener los datos del libro.");
    } finally {
      setLoading(false);
    }
  };

  const addCountLibros = () => {
    setCantidadLibros(prev => prev + 1);
    setSeries([...series, ""]); // Agrega un nuevo campo vacío
  };
  
  const removeCountLibros = () => {
    if (cantidadLibros > 1) {
      setCantidadLibros(prev => prev - 1);
      setSeries(series.slice(0, -1)); // Elimina el último campo de la lista
    }
  };
  
  const handleSerieChange = (index:number, value:string) => {
    const newSeries = [...series];
    newSeries[index] = value;
    setSeries(newSeries);
  };

  function validarCedula(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) {
        return false;
    }
    const primerDigito = parseInt(cedula.charAt(0));
    if (primerDigito > 6) {
        return false;
    }
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula.charAt(i));
        if (i % 2 === 0) { // Posiciones impares (0, 2, 4, 6, 8)
            digito *= 2;
            if (digito > 9) {
                digito -= 9; // Si el producto es mayor a 9, se resta 9
            }
        }
        suma += digito;
    }
    const digitoVerificador = (10 - (suma % 10)) % 10;

    return digitoVerificador === parseInt(cedula.charAt(9));
}

  return (
    <Container>
      <ToastContainer />
      <HeaderPages />
      <Box display="flex" justifyContent="center" alignItems="center">
        <Card sx={{ width: 600, textAlign: "center", p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              Registro de Texto
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">Cantidad Libros a registrar:</Typography>
                <Button variant="contained" color="primary" size="small" onClick={addCountLibros}>
                  <AddIcon />
                </Button>
                <Button variant="text" color="primary" >
                  {cantidadLibros.toString()}
                </Button>
                <Button variant="contained" color="primary" size="small" onClick={removeCountLibros}>
                  <RemoveIcon />
                </Button>

              </Grid>
              {series.map((serie, index) => (
                  <Grid size={12} key={index}  sx={{ display: "flex", alignItems: "center", gap: 2, justifyItems:'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Codigo {index + 1}
                    </Typography>
                    <TextField
                      label={`Serie del libro ${index + 1}`}
                      variant="outlined"
                      value={serie}
                      onChange={(e) => handleSerieChange(index, e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                ))}
              <Grid size={12}>
                {loading && <Typography variant="body2" color="textSecondary" mt={2}>Cargando...</Typography>}
                {error && <Typography variant="body2" color="error" mt={2}>{error}</Typography>}
                {bookData && Array.isArray(bookData.data) && bookData.data.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {bookData.data[0].titulo}
                    </Typography>
                  </Box>
                )}

              </Grid>
              <Grid size={12}>
                <Button variant="contained" color="primary" fullWidth onClick={fetchBook}> Buscar Libro</Button>
              </Grid>
            </Grid>



            {/* Nueva sección de filtros de búsqueda */}
            <Box mt={4}>
              <Typography variant="h6" fontWeight="bold" color="primary">Buscar Estudiante</Typography>

              {/* Número de cédula con ícono de lupa y botón */}
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <TextField
                  label="Número de Cédula"
                  variant="outlined"
                  fullWidth
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2 }}
                  onClick={fetchestudiante}
                >
                  Buscar
                </Button>
              </Box>

              {/* Nombre del estudiante */}
              <TextField
                label="Nombre del Estudiante"
                variant="outlined"
                fullWidth
                value={nombreEstudiante}
                onChange={(e) => setNombreEstudiante(e.target.value)}
                sx={{ mt: 2 }}
              />

              {/* Unidad Educativa */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Unidad Educativa</InputLabel>
                <Select
                  value={unidadEducativa}
                  onChange={(e) => setUnidadEducativa(e.target.value)}
                  label="Unidad Educativa"
                >
                  <MenuItem value="">S/A</MenuItem>
                  {unidadesEducativas?.data.map((item, index) => {
                    return <MenuItem key={index} value={item.id}>{item.descripcion}</MenuItem>;
                  })}
                </Select>
              </FormControl>

              {/* Ciclo */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Ciclo</InputLabel>
                <Select
                  value={ciclo}
                  onChange={(e) => setCiclo(e.target.value)}
                  label="Ciclo"
                >
                  {nivelEducativo?.data.map((item, index) => {
                    return <MenuItem key={index} value={item.id}>{item.descripcion}</MenuItem>;
                  })}
                  <MenuItem value="ciclo1">Ciclo 1</MenuItem>
                  <MenuItem value="ciclo2">Ciclo 2</MenuItem>
                  <MenuItem value="ciclo3">Ciclo 3</MenuItem>
                </Select>
              </FormControl>

              {/* Aceptación de datos personales */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptData}
                    onChange={(e) => setAcceptData(e.target.checked)}
                    color="primary"
                  />
                }
                label="Acepto el uso de mis datos personales"
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={fetchestudiante}
                sx={{ mt: 2 }}
              >
                GRABAR
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ConsultarLibros;
