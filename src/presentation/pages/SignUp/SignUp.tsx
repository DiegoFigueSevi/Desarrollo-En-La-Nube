import { Button, TextField, Typography, Container, Box, Paper, Link, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useEffect, useState } from 'react';

const schema = yup.object({
  email: yup.string().email('Ingrese un correo válido').required('El correo es requerido'),
  username: yup.string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede tener más de 30 caracteres'),
  age: yup.number()
    .required('La edad es requerida')
    .min(13, 'Debes tener al menos 13 años')
    .max(120, 'Edad no válida'),
  cellphone: yup.string()
    .required('El número de teléfono es requerido')
    .matches(/^[0-9+\-\s]+$/, 'Número de teléfono no válido'),
  password: yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirme la contraseña'),
}).required();

type FormData = yup.InferType<typeof schema>;

export const SignUp = () => {
  const { signUp, error, loading } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (error) {
      setSignupError(error);
    }
  }, [error]);

  const onSubmit = async (data: FormData) => {
    setSignupError(null);
    const { user, error: signUpError } = await signUp({
      email: data.email,
      password: data.password,
      username: data.username,
      age: data.age,
      cellphone: data.cellphone
    });
    
    if (signUpError) {
      setSignupError(signUpError);
    } else if (user) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Crear Cuenta
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
            {signupError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {signupError}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de usuario"
              autoComplete="username"
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="age"
              label="Edad"
              type="number"
              InputProps={{ inputProps: { min: 13, max: 120 } }}
              error={!!errors.age}
              helperText={errors.age?.message}
              {...register('age')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="cellphone"
              label="Teléfono"
              type="tel"
              placeholder="+56912345678"
              error={!!errors.cellphone}
              helperText={errors.cellphone?.message}
              {...register('cellphone')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" color="primary" underline="hover">
                ¿Ya tienes una cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
    </div>
  );
};

export default SignUp;
