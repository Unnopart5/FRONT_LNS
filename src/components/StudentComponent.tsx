import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Collapse,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Autocomplete
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { getUnitEducation, getNivelEducativo, SEARCH_STUDENT } from "../services/Service";
import { toast } from 'react-toastify';
import { validarCedula } from "../helpers/ValidarCedula";

// Interfaces para los tipos de datos
interface Institucion {
  id: number;
  descripcion: string;
}

interface NivelEducativo {
  id: number | string;
  descripcion: string;
}

interface Estudiante {
  nombre: string;
  periodo: string;
  ciclo: string;
}

interface ApiResponse<T> {
  estado: number;
  data: T[];
}

interface StudentComponentProps {
  cedula: string;
  setCedula: React.Dispatch<React.SetStateAction<string>>;
  nombreEstudiante: string;
  setNombreEstudiante: React.Dispatch<React.SetStateAction<string>>;
  unidadEducativa: string;
  setUnidadEducativa: React.Dispatch<React.SetStateAction<string>>;
  ciclo: string;
  setCiclo: React.Dispatch<React.SetStateAction<string>>;
  acceptData: boolean;
  setAcceptData: React.Dispatch<React.SetStateAction<boolean>>;
  noExisteUniEdu: boolean;
  setNoExisteUniEdu: React.Dispatch<React.SetStateAction<boolean>>;
  disabledNoUniEducativa?: boolean;
  disableTerminoCondiciones?: boolean;
  onStudentFound?: () => void;
}

const StudentComponent: React.FC<StudentComponentProps> = ({
  cedula,
  setCedula,
  nombreEstudiante,
  setNombreEstudiante,
  unidadEducativa,
  setUnidadEducativa,
  ciclo,
  setCiclo,
  acceptData,
  setAcceptData,
  noExisteUniEdu,
  setNoExisteUniEdu,
  disabledNoUniEducativa = false,
  disableTerminoCondiciones = false,
  onStudentFound,
}) => {
  // Estados
  const [loading, setLoading] = useState<boolean>(false);
  const [unidadesEducativas, setUnidadesEducativas] = useState<Institucion[]>([]);
  const [nivelEducativo, setNivelEducativo] = useState<NivelEducativo[]>([]);
  const [studentFound, setStudentFound] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Carga datos institucionales
  const fetchInstitutionalData = useCallback(async (): Promise<void> => {
    try {
      const [unitData, nivelData] = await Promise.all<[
        Promise<ApiResponse<Institucion>>,
        Promise<ApiResponse<NivelEducativo>>
      ]>([
        getUnitEducation(),
        getNivelEducativo()
      ]);
      
      setUnidadesEducativas(unitData?.data || []);
      setNivelEducativo(nivelData?.data || []);
    } catch (error) {
      toast.error("Error al cargar datos institucionales");
      console.error("Error fetching institutional data:", error);
    }
  }, []);

  // Busca estudiante
  const fetchStudentData = useCallback(async (): Promise<void> => {
    if (!validarCedula(cedula)) {
      toast.error("CÉDULA INVÁLIDA");
      return;
    }

    try {
      setLoading(true);
      const response: ApiResponse<Estudiante> = await SEARCH_STUDENT(cedula);

      if (response?.estado === 202 && response.data?.length > 0) {
        const student = response.data[0];
        setNombreEstudiante(student.nombre || "");
        setUnidadEducativa(student.periodo || "");
        setCiclo(student.ciclo || "");
        setStudentFound(true);
        setShowAlert(true);
        setAcceptData(true);
        setNoExisteUniEdu(false);
        onStudentFound?.();
      } else {
        toast.warn("Estudiante no encontrado. Complete los datos manualmente.");
        setStudentFound(false);
      }
    } catch (error) {
      toast.error("Error al buscar estudiante");
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    cedula, 
    setNombreEstudiante, 
    setUnidadEducativa, 
    setCiclo, 
    setAcceptData, 
    setNoExisteUniEdu, 
    onStudentFound
  ]);

  // Manejador de cambio de cédula
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCedula(value);
  };

  // Reinicia búsqueda
  const handleNewSearch = (): void => {
    setCedula("");
    setNombreEstudiante("");
    setUnidadEducativa("");
    setCiclo("");
    setAcceptData(false);
    setStudentFound(false);
  };

  // Efecto para carga inicial
  useEffect(() => {
    fetchInstitutionalData();
  }, [fetchInstitutionalData]);

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Datos del Estudiante
      </Typography>

      <Collapse in={showAlert && studentFound}>
        <Alert
          severity="success"
          action={
            <IconButton
              size="small"
              onClick={() => setShowAlert(false)}
              aria-label="cerrar-alerta"
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2, mt: 2 }}
        >
          Estudiante encontrado: {nombreEstudiante}
        </Alert>
      </Collapse>

      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
        <TextField
          label="Número de Cédula"
          variant="outlined"
          fullWidth
          value={cedula}
          onChange={handleCedulaChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            inputProps: {
              maxLength: 10,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              'aria-label': 'Ingrese número de cédula'
            },
          }}
          disabled={studentFound}
          autoComplete="off"
        />
        {studentFound ? (
          <Button
            variant="outlined"
            color="primary"
            sx={{ ml: 2, height: '56px' }}
            onClick={handleNewSearch}
            aria-label="cambiar-estudiante"
          >
            Cambiar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2, height: '56px' }}
            onClick={fetchStudentData}
            disabled={loading || cedula.length !== 10}
            aria-label="buscar-estudiante"
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        )}
      </Box>

      <Collapse in={!studentFound || !showAlert}>
        <Box>
          <TextField
            label="Nombre del Estudiante"
            variant="outlined"
            fullWidth
            value={nombreEstudiante}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setNombreEstudiante(e.target.value.toUpperCase())
            }
            sx={{ mt: 2 }}
            disabled={studentFound}
            aria-label="nombre-estudiante"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={noExisteUniEdu}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNoExisteUniEdu(e.target.checked)
                }
                color="primary"
                disabled={studentFound || disabledNoUniEducativa}
              />
            }
            label="No encontré mi Unidad Educativa"
            sx={{ mt: 2, display: 'block' }}
          />

          {noExisteUniEdu ? (
            <TextField
              label="Nombre de la Institución"
              variant="outlined"
              fullWidth
              value={unidadEducativa}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setUnidadEducativa(e.target.value.toUpperCase())
              }
              sx={{ mt: 2 }}
              disabled={studentFound || disabledNoUniEducativa}
              aria-label="nombre-institucion"
            />
          ) : (
            <Autocomplete
              options={unidadesEducativas}
              getOptionLabel={(option: Institucion) => option.descripcion || ''}
              value={unidadesEducativas.find((item: Institucion) => 
                item.id.toString() === unidadEducativa) || null}
              onChange={(
                _: React.SyntheticEvent, 
                newValue: Institucion | null
              ) => {
                setUnidadEducativa(newValue?.id?.toString() || '');
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Unidad Educativa" 
                  sx={{ mt: 2 }} 
                />
              )}
              disabled={studentFound}
              fullWidth
              aria-label="unidad-educativa"
            />
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Ciclo/Nivel</InputLabel>
            <Select
              value={ciclo}
              onChange={(e: any) => 
                setCiclo(e.target.value as string)
              }
              label="Ciclo/Nivel"
              disabled={studentFound}
              aria-label="ciclo-nivel"
            >
              {nivelEducativo.map((item: NivelEducativo) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setAcceptData(e.target.checked)
                }
                color="primary"
                disabled={studentFound || disableTerminoCondiciones}
              />
            }
            label="Acepto el uso de mis datos personales"
            sx={{ mt: 2, display: 'block' }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(StudentComponent);