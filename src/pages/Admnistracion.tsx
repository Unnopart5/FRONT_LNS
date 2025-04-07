import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import UploadBooks from '../components/UploadBooks';
import ReportRegisterBook from '../components/ReportRegisterBook';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tuservicio.com/api";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface User {
  coduser: string;
  username: string;
  status: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Administracion: React.FC = () => {
  const [value, setValue] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Función para verificar y actualizar el estado de autenticación
  const checkAuth = () => {
    const storedUser = localStorage.getItem('adminUser');
    const userExists = storedUser !== null;
    
    // Sincronizar estado interno con localStorage
    if (userExists) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    return userExists;
  };

  useEffect(() => {
    // Verificar autenticación al cargar
    checkAuth();

    // Configurar listener para cambios en localStorage desde otras pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminUser') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Configurar intervalo para verificar cambios en la pestaña actual
    const intervalId = setInterval(() => {
      checkAuth();
    }, 1000); // Verificar cada segundo

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/LNS/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const userData = data[0];
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setIsAuthenticated(true);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpiar localStorage y estado
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
    
    // Disparar evento para otras pestañas
    window.dispatchEvent(new Event('storage'));
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" gutterBottom>
          Iniciar sesión en Administración
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 300,
            p: 4,
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField
            label="Usuario"
            name="username"
            value={loginData.username}
            onChange={handleLoginChange}
            required
            fullWidth
          />
          
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
            fullWidth
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Administración tabs"
          centered
        >
          <Tab
            label="Subir archivos"
            icon={<FileUploadIcon />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            label="Reportes"
            icon={<AssessmentIcon />}
            iconPosition="start"
            {...a11yProps(1)}
          />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Bienvenido, {user?.username}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>
      
      <TabPanel value={value} index={0}>
        <UploadBooks />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ReportRegisterBook />
      </TabPanel>
    </Box>
  );
};

export default Administracion;