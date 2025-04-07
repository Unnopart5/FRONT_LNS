import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  LinearProgress,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface BookData {
  sku: string;
  serie: string;
  titulo: string;
  periodo: string;
}

const UploadBooks: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tuservicio.com/api";
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
      setSuccess(false);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const processChunk = async (chunk: BookData[], chunkNumber: number, totalChunks: number) => {
    console.log(chunk)
    try {
      const response = await fetch(`${API_BASE_URL}/LNS/upload-book-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        throw new Error(`Error en el chunk ${chunkNumber}`);
      }

      setProcessedCount(prev => prev + chunk.length);
      setProgress(Math.round(((chunkNumber + 1) / totalChunks) * 100));
    } catch (err) {
      throw err;
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setIsLoading(true);
    setProgress(0);
    setProcessedCount(0);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: BookData[] = XLSX.utils.sheet_to_json(firstSheet);

      setTotalRecords(jsonData.length);

      // Configuración del tamaño del chunk (ajustar según necesidades)
      const CHUNK_SIZE = 5000;
      const totalChunks = Math.ceil(jsonData.length / CHUNK_SIZE);

      for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
        const chunk = jsonData.slice(i, i + CHUNK_SIZE);
        const chunkNumber = Math.floor(i / CHUNK_SIZE);
        
        await processChunk(chunk, chunkNumber, totalChunks);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
    setProgress(0);
    setProcessedCount(0);
    setTotalRecords(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        Subida Masiva de Libros
      </Typography>
      
      <Typography variant="body1" paragraph>
        Sube un archivo Excel con los datos de los libros (sku, serie, título, periodo).
        El tiempo de carga de los registros depende de la cantidad de registros en el archivo de Excel.
      </Typography>

      {!file && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: '2px dashed #ccc',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
            mb: 2
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography>
            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionar'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Formatos soportados: .xlsx, .xls
          </Typography>
        </Paper>
      )}

      {file && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            Archivo seleccionado: <strong>{file.name}</strong>
          </Typography>
          <Typography variant="body2">
            Tamaño: {(file.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Procesando: {processedCount} de {totalRecords} registros
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" display="block" textAlign="right">
            {progress}% completado
          </Typography>
        </Box>
      )}

      {!isLoading && file && !success && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={uploadFile}
            disabled={isLoading}
            startIcon={<CloudUploadIcon />}
          >
            Subir Archivo
          </Button>
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </Box>
      )}

      {success && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: '#e8f5e9',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CheckCircleIcon color="success" />
          <Typography>
            Archivo procesado exitosamente! {totalRecords} registros fueron cargados.
          </Typography>
          <Button variant="outlined" size="small" onClick={resetForm} sx={{ ml: 'auto' }}>
            Subir otro archivo
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon />
            <Typography>{error}</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadBooks;