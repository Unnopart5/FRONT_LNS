import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  Button,
  Grid,
  FormControlLabel,
  Divider,
  Paper
} from "@mui/material";
import {
  Save as SaveIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { Book } from '../models/Book';
import { saveStudentBook } from "../services/Service";
import { ToastContainer, toast } from 'react-toastify';
import SearchBook from "../components/SearchBook";
import StudentComponent from "../components/StudentComponent";
import { StudentBookSave } from "../models/StudentBookSave";
import 'react-toastify/dist/ReactToastify.css';

const ConsultarLibros: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cedula, setCedula] = useState<string>('');
  const [nombreEstudiante, setNombreEstudiante] = useState<string>('');
  const [unidadEducativa, setUnidadEducativa] = useState<string>('');
  const [ciclo, setCiclo] = useState<string>('');
  const [acceptData, setAcceptData] = useState<boolean>(false);
  const [noExisteUniEdu, setNoExisteUniEdu] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const errores = [
    { 
      condicion: !acceptData, 
      mensaje: "Debe aceptar los términos y condiciones",
      icon: <WarningIcon color="warning" sx={{ mr: 1 }} />
    },
    { 
      condicion: !nombreEstudiante.trim(), 
      mensaje: "El nombre del estudiante es requerido",
      icon: <PersonIcon color="error" sx={{ mr: 1 }} />
    },
    { 
      condicion: !unidadEducativa || !ciclo, 
      mensaje: "La unidad educativa y el ciclo son requeridos",
      icon: <SchoolIcon color="error" sx={{ mr: 1 }} />
    }
  ];

  const grabarlibroestudiante = async () => {
    const error = errores.find(err => err.condicion);
    if (error) {
      toast.error(
        <Box display="flex" alignItems="center">
          {error.icon}
          {error.mensaje}
        </Box>, 
        { position: "top-center" }
      );
      return false;
    }

    const nuevoestudiantelibro: StudentBookSave = {
      codigolibro: selectedBook?.codigoproducto ?? "",
      codigoestudiante: cedula,
      periodo: selectedBook?.periodo ?? "",
      ciclo: ciclo ?? "",
      aceptaterminos: acceptData ? "Sí" : "No",
      unidadeducativa: unidadEducativa ?? "",
      nombreestudiante: nombreEstudiante,
      noexisteunidadeducativa: noExisteUniEdu,
      serie: selectedBook?.serie ?? ''
    };

    try {
      await saveStudentBook(nuevoestudiantelibro);
      toast.success(
        <Box display="flex" alignItems="center">
          <CheckCircleIcon sx={{ mr: 1 }} />
          {`Libro "${selectedBook?.nombre}" registrado para ${nombreEstudiante}`}
        </Box>,
        { position: "top-center" }
      );
      vaciarData();
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      toast.error(
        <Box display="flex" alignItems="center">
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Error al registrar el libro
        </Box>,
        { position: "top-center" }
      );
    }
  }

  const vaciarData = () => {
    setSelectedBook(null);
    setCiclo('');
    setCedula('');
    setUnidadEducativa('');
    setNombreEstudiante('');
    setAcceptData(false);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <ToastContainer style={{ zIndex: 9999 }} />
      
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box 
          sx={{ 
            backgroundColor: 'primary.main', 
            color: 'primary.contrastText',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <BookIcon sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Registro de Textos Escolares
          </Typography>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            {/* Book Search Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <BookIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    Buscar Libro
                  </Typography>
                </Box>
                <SearchBook 
                  key={refreshKey}
                  selectedBook={selectedBook} 
                  setSelectedBook={setSelectedBook} 
                />
              </Paper>
            </Grid>

            {/* Student Information Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    Datos del Estudiante
                  </Typography>
                </Box>
                <StudentComponent
                  cedula={cedula}
                  setCedula={setCedula}
                  nombreEstudiante={nombreEstudiante}
                  setNombreEstudiante={setNombreEstudiante}
                  unidadEducativa={unidadEducativa}
                  setUnidadEducativa={setUnidadEducativa}
                  ciclo={ciclo}
                  setCiclo={setCiclo}
                  acceptData={acceptData}
                  setAcceptData={setAcceptData}
                  noExisteUniEdu={noExisteUniEdu}
                  setNoExisteUniEdu={setNoExisteUniEdu}
                  disableTerminoCondiciones={false}
                  disabledNoUniEducativa={false}
                />
              </Paper>
            </Grid>

            {/* Action Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={grabarlibroestudiante}
                startIcon={<SaveIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                Registrar Libro
              </Button>
            </Grid>
          </Grid>
        </CardContent>

        {/* Info Footer */}
        <Box 
          sx={{ 
            backgroundColor: 'grey.100',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <InfoIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Todos los campos son obligatorios para el registro
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConsultarLibros;