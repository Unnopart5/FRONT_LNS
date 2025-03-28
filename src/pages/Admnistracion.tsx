import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadBooks from '../components/UploadBooks';
import ReportRegisterBook from '../components/ReportRegisterBook';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
      </Box>
      <TabPanel value={value} index={0}>
        
        <UploadBooks/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Contenido para Reportes */}
     <ReportRegisterBook/>
      </TabPanel>
    </Box>
  );
};

export default Administracion;