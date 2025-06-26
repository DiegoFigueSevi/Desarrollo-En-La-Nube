import { Typography, Button, Paper, Avatar, Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useEffect } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';

export const Home = () => {
  const { user, userData, signOut, loading } = useAuth();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (loading || !user) {
    return (
      <div className="home-container">
        <Typography>Cargando información del usuario...</Typography>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          <Avatar 
            src={user.photoURL || ''}
            alt={userData?.displayName || user.displayName || 'Usuario'}
            sx={{ 
              width: 100, 
              height: 100, 
              margin: '0 auto 16px',
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
              textTransform: 'uppercase',
            }}
          >
            {(userData?.displayName?.[0] || user.displayName?.[0] || user.email?.[0] || 'U')}
          </Avatar>
          
          <Typography variant="h4" component="h1" gutterBottom>
            ¡Bienvenido{userData?.displayName ? `, ${userData.displayName}` : user.displayName ? `, ${user.displayName}` : ''}!
          </Typography>
          
          {userData?.email && (
            <Typography variant="subtitle1" color="text.secondary">
              {userData.email}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <List>
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Correo electrónico" 
              secondary={user.email || 'No disponible'}
            />
          </ListItem>
          
          {userData?.username && (
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Nombre de usuario" 
                secondary={userData.username}
              />
            </ListItem>
          )}
          
          {(userData?.displayName || user.displayName) && (
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Nombre para mostrar" 
                secondary={userData?.displayName || user.displayName}
              />
            </ListItem>
          )}
          
          {user.phoneNumber && (
            <ListItem>
              <ListItemIcon>
                <PhoneIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Teléfono" 
                secondary={user.phoneNumber}
              />
            </ListItem>
          )}
          
          <ListItem>
            <ListItemIcon>
              <EventIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Último inicio de sesión" 
              secondary={formatDate(user.metadata.lastSignInTime)}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CakeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Cuenta creada" 
              secondary={formatDate(user.metadata.creationTime)}
            />
          </ListItem>
        </List>
        
        <Box mt={4} textAlign="center">
          <Button 
            variant="contained" 
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth
          >
            Cerrar sesión
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Home;
