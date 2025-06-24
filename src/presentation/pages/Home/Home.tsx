import { Typography, Button, Paper, Avatar, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useEffect } from 'react';

export const Home = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="home-container">
        <Typography>Cargando...</Typography>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Avatar 
          src={user.photoURL || ''}
          alt={user.displayName || 'Usuario'}
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto 16px',
            bgcolor: 'primary.main'
          }}
        >
          {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </Avatar>
        
        <Typography variant="h4" component="h1" gutterBottom>
          ¡Bienvenido{user.displayName ? `, ${user.displayName}` : ''}!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Has iniciado sesión correctamente con: {user.email}
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Home;
