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
  id: string;
  nombre: string;
  periodo: any;
  ciclo: any;
}

interface ApiResponse<T> {
  estado: number;
  mensaje?: string;
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
  const [eshabilitadoCicloPeriodo, setEsHabilitadoCicloPeriodo] = useState<boolean>(false);
  // Determina si el estudiante tiene datos completos de institución y ciclo
  const hasCompleteSchoolData = Boolean(unidadEducativa) && Boolean(ciclo) && 
                              unidadEducativa !== "{}" && ciclo !== "{}";

  // Carga datos institucionales
  const fetchInstitutionalData = useCallback(async (): Promise<void> => {
    try {
      const [unitData, nivelData] = await Promise.all([
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
        
        // Verificar si periodo y ciclo tienen datos válidos
        const periodoValido = student.periodo && student.periodo !== "{}" && 
                            (typeof student.periodo === 'string' || Object.keys(student.periodo).length > 0);
        const cicloValido = student.ciclo && student.ciclo !== "{}" && 
                          (typeof student.ciclo === 'string' || Object.keys(student.ciclo).length > 0);
        
        setUnidadEducativa(periodoValido ? String(student.periodo) : "");
        setCiclo(cicloValido ? String(student.ciclo) : "");
        
        setStudentFound(true);
        setShowAlert(true);
        setAcceptData(periodoValido && cicloValido);
        setNoExisteUniEdu(false);
        onStudentFound?.();


        if (!periodoValido || !cicloValido) {
          toast.warn("Complete los datos de institución y ciclo/nivel");
          
        }
      } else {
        toast.warn("Estudiante no encontrado. Complete todos los datos.");
        setEsHabilitadoCicloPeriodo(false)
        setStudentFound(false);
        setAcceptData(false);
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
    setNoExisteUniEdu(false);
    setShowAlert(false);
  };

  // Efecto para validar cuando los datos están completos
  useEffect(() => {
    if (!studentFound && nombreEstudiante && unidadEducativa && ciclo) {
      setAcceptData(true);
    } else if (studentFound && !hasCompleteSchoolData) {
      setAcceptData(false);
    }
  }, [nombreEstudiante, unidadEducativa, ciclo, studentFound, hasCompleteSchoolData, setAcceptData]);

  // Efecto para carga inicial
  useEffect(() => {
    fetchInstitutionalData();
  }, [fetchInstitutionalData]);

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Datos del Estudiante
      </Typography>

      {/* Alerta cuando se encuentra estudiante */}
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

      {/* Campo de cédula */}
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

      {/* Campos que se muestran SOLO si no tiene datos completos */}
      <Collapse in={!studentFound || !hasCompleteSchoolData}>
        {studentFound && (
          <TextField
            label="Nombre del Estudiante"
            variant="outlined"
            fullWidth
            value={nombreEstudiante}
            sx={{ mt: 2 }}
            disabled
            aria-label="nombre-estudiante-disabled"
          />
        )}

        {(!studentFound || !hasCompleteSchoolData) && (
          <>
            {!studentFound && (
              <TextField
                label="Nombre del Estudiante"
                variant="outlined"
                fullWidth
                value={nombreEstudiante}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNombreEstudiante(e.target.value.toUpperCase())
                }
                sx={{ mt: 2 }}
                aria-label="nombre-estudiante"
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={noExisteUniEdu}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNoExisteUniEdu(e.target.checked)
                  }
                  color="primary"
                  disabled={eshabilitadoCicloPeriodo}
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
                    aria-label="unidad-educativa"
                  />
                )}
                disabled={eshabilitadoCicloPeriodo}
                fullWidth
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
                disabled={eshabilitadoCicloPeriodo}
                aria-label="ciclo-nivel"
              >
                {nivelEducativo.map((item: NivelEducativo) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Collapse>

      {/* Checkbox de aceptación - siempre visible */}
      <FormControlLabel
        control={
          <Checkbox
            checked={acceptData}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAcceptData(e.target.checked)
            }
            color="primary"
            disabled={eshabilitadoCicloPeriodo || studentFound}
          />
        }
        label="Acepto el uso de mis datos personales"
        sx={{ mt: 2, display: 'block', marginLeft: '2px' }}
      />
    </Box>
  );
};

export default React.memo(StudentComponent);