import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Autocomplete
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { getUnitEducation, getNivelEducativo, SEARCH_STUDENT } from "../services/Service";
import { ResponseEstudiante } from "../models/Estudiante";
import { ResponseInstituciones } from "../models/Instituciones";
import { ResponseNivelEducativo } from "../models/NivelEducativo";
import { toast } from 'react-toastify';
import { validarCedula } from "../helpers/ValidarCedula";

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
}) => {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState<boolean>(false);
  const [isCheckboxDisabledUnitAcad, setIsCheckboxDisabledUnitAcad] = useState<boolean>(false);
  const [unidadesEducativas, setUnidadesEducativas] = useState<ResponseInstituciones | null>(null);
  const [nivelEducativo, setNivelEducativo] = useState<ResponseNivelEducativo | null>(null);
  const [estudiante, setEstudiante] = useState<ResponseEstudiante | null>(null);

  // Data fetching functions
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

  const fetchStudentData = useCallback(async () => {
    if (!validarCedula(cedula)) {
      toast.error("LA CÉDULA INGRESADA NO ES VÁLIDA", { position: "top-center" });
      resetStudentData();
      return;
    }

    try {
      setLoading(true);
      const response = await SEARCH_STUDENT(cedula);

      if (isValidStudentResponse(response)) {
        updateStudentData(response.data[0]);
        handleStudentFound();
      } else {
        handleStudentNotFound();
      }

      setEstudiante(response);
    } catch (err) {
      handleError("Error al obtener datos del estudiante", err);
    } finally {
      setLoading(false);
    }
  }, [cedula]);

  // Helper functions
  const isValidStudentResponse = (response: any): boolean => {
    return response?.estado === 202 &&
      Array.isArray(response.data) &&
      response.data.length > 0;
  };

  const resetStudentData = () => {
    setNombreEstudiante("");
    setUnidadEducativa("");
    setCiclo("");
  };

  const updateStudentData = (studentData: any) => {
    setNombreEstudiante(studentData.nombre || "");
    setUnidadEducativa(studentData.periodo || "");
    setCiclo(studentData.ciclo || "");
  };

  const handleStudentFound = () => {
    setIsCheckboxDisabled(true);
    setIsCheckboxDisabledUnitAcad(true);
    setAcceptData(true);
    setNoExisteUniEdu(false);
  };

  const handleStudentNotFound = () => {
    resetStudentData();
    setIsCheckboxDisabled(false);
    setIsCheckboxDisabledUnitAcad(false);
    toast.warn("NO SE ENCONTRÓ ESTUDIANTE, INGRESE SUS DATOS", {
      position: "top-center"
    });
  };

  const handleError = (message: string, error: any) => {
    console.error(message, error);
    setError(message);
    toast.error(message, { position: "top-center" });
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCedula(value);
    }
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (cedula && cedula.length === 10) {
      fetchStudentData();
    }
  }, [cedula, fetchStudentData]);

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Ingresé el número de cédula del estudiante
      </Typography>

      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
        <TextField
          label="Número de Cédula"
          variant="outlined"
          fullWidth
          value={cedula}
          onChange={handleCedulaChange}
          inputProps={{ maxLength: 10 }}
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
          onClick={fetchStudentData}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </Box>

      <TextField
        disabled={isCheckboxDisabled}
        label="Nombre del Estudiante"
        variant="outlined"
        fullWidth
        value={nombreEstudiante}
        onChange={(e) => setNombreEstudiante(e.target.value.toUpperCase())}
        sx={{ mt: 2 }}
      />

      <FormControlLabel
        disabled={isCheckboxDisabledUnitAcad || disabledNoUniEducativa}
        control={
          <Checkbox
            checked={noExisteUniEdu}
            onChange={(e) => setNoExisteUniEdu(e.target.checked)}
            color="primary"
          />
        }
        label="Si no encontraste tu unidad educativa, haz clic aquí y regístrala en el casillero."
        sx={{ mt: 2 }}
      />

      {noExisteUniEdu ? (
        <TextField
          label="NOMBRE DE LA INSTITUCIÓN"
          variant="outlined"
          fullWidth
          value={unidadEducativa}
          onChange={(e) => setUnidadEducativa(e.target.value.toUpperCase())}
          sx={{ mt: 2 }}
          disabled={disabledNoUniEducativa}
        />
      ) : (
        <FormControl fullWidth sx={{ mt: 2 }} disabled={isCheckboxDisabled}>
          <Autocomplete
            fullWidth
            disabled={isCheckboxDisabled}
            options={unidadesEducativas?.data || []}
            getOptionLabel={(option: any) => option.descripcion || ''}
            value={
              unidadesEducativas?.data.find((item: any) => item.id === unidadEducativa) || null
            }
            onChange={(_, newValue) => {
              setUnidadEducativa(newValue ? newValue.id.toString() : '');
            }}
            renderInput={(params) => (
              <TextField {...params} label="Unidad Educativa" />
            )}
          />
        </FormControl>
      )}

      <FormControl fullWidth sx={{ mt: 2 }} disabled={isCheckboxDisabled}>
        <InputLabel>Ciclo</InputLabel>
        <Select
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
          label="Ciclo"
        >
          {nivelEducativo?.data.map((item: any) => (
            <MenuItem key={item.id} value={item.id}>
              {item.descripcion}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        disabled={isCheckboxDisabled || disableTerminoCondiciones}
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
    </Box>
  );
};

export default React.memo(StudentComponent);