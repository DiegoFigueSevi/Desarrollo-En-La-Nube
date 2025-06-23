import { Typography, Container, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <Container component="main" maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h3" gutterBottom>
          ¡Bienvenido a la Aplicación!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Has iniciado sesión correctamente en tu cuenta.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          sx={{ mt: 3 }}
        >
          Cerrar Sesión
        </Button>
        </Paper>
      </Container>
    </div>
  );
};

export default Home;
