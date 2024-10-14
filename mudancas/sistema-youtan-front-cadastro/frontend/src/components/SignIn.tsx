import React from 'react';
import { Box, TextField, Button, InputAdornment } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person';

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center', // Alinha os itens no topo
        height: '100vh',
        backgroundColor: '#B7EDF975',
        paddingRight: 4,
      }}
    >
      {/* Contêiner para a imagem e os TextFields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Imagem do logo */}
        <Box
          component="img"
          src="/youtan.png"
          alt="logo"
          sx={{ width: 300, height: 'auto', marginBottom: 2, marginRight: 20}} // Margem inferior para espaçamento
        />

        {/* TextFields embaixo da imagem */}
        <TextField
          label="Usuário"
          variant="outlined" // Define o estilo retangular
          sx={{ width: 300, marginBottom: 2, marginTop: 10, marginRight:20 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
              ),
             }} // Margem inferior para espaçamento entre os campos
        />

        <TextField 
          label="Senha"
          variant="outlined" // Define o estilo retangular
          sx={{ width: 300, marginRight:20, marginBottom:2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
              ),}} // Define a largura do campo
        />

          <Button variant="contained" startIcon={<LoginIcon />} sx= {{marginBottom: 25, marginTop:2, marginRight:45}}>
          Entrar
          </Button>
      </Box>

      {/* Imagem ao lado (ou abaixo, dependendo do layout desejado) */}
      <Box
        component="img"
        src="/youtan2.jpg"
        alt="imagem"
        sx={{ width: 800, height: 'auto', borderRadius: '10px', marginLeft: 4 }} // Margem esquerda para afastar da imagem do logo
      />
    </Box>
  );
}

export default App;
