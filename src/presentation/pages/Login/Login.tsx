import { Button, TextField, Typography, Container, Box, Paper, Divider, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useState } from 'react';

const schema = yup.object({
  email: yup.string().email('Ingrese un correo válido').required('El correo es requerido'),
  password: yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).required();

type FormData = yup.InferType<typeof schema>;

export const Login = () => {
  const { signIn, signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoginError(null);
    const { user, error: signInError } = await signIn({
      email: data.email,
      password: data.password,
      username: '', // These fields are required by the interface but not used for login
      age: 0,
      cellphone: ''
    });
    if (user) {
      navigate('/');
    } else if (signInError) {
      setLoginError(signInError);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    const { user, error: googleError } = await signInWithGoogle();
    if (user) {
      navigate('/');
    } else if (googleError) {
      setLoginError(googleError);
    }
  };

  const handleFacebookLogin = async () => {
    setLoginError(null);
    const { user, error: facebookError } = await signInWithFacebook();
    if (user) {
      navigate('/');
    } else if (facebookError) {
      setLoginError(facebookError);
    }
  };

  return (
    <div className="auth-container">
      <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Correo Electrónico"
              autoComplete="email"
              autoFocus
              disabled={loading}
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              disabled={loading}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            <Divider sx={{ my: 2 }}>O continuar con</Divider>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookLogin}
                disabled={loading}
              >
                Facebook
              </Button>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  ¿No tienes una cuenta? Regístrate
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
    </div>
  );
};

export default Login;
