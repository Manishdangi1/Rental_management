import React from 'react';
import { Box, Container, Paper } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            minHeight: 'calc(100vh - 120px)',
            backgroundColor: 'transparent',
            p: 0,
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default Layout; 