import React from "react";
import { Box, Typography } from "@mui/material";
import LogoLNS from  "../images/LogoLNS.jpeg"

const HeaderPages: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      bgcolor="#fff"
    >
      <img src={LogoLNS} alt="LNS Logo" height={50} />
    
      <img src={LogoLNS} alt="Salesianos Logo" height={50} />
    </Box>
  );
};

export default HeaderPages;
