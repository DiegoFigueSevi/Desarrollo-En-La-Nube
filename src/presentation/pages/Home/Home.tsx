import { Typography, Button, Paper, Avatar, Box, Divider, List, ListItem, ListItemIcon, ListItemText, TextField, Container, Card, CardHeader, CardContent, CardActions, IconButton, CircularProgress } from '@mui/material';
import { Image, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/contexts/AuthContext';
import { useEffect, useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import { postRepository } from '../../../infrastructure/repositories';
import type { Post } from '../../../domain/interfaces/services/post.service';

export const Home = () => {
  const { user, userData, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      loadPosts();
    }
  }, [user, authLoading, navigate]);

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const postsList = await postRepository.getPosts();
      setPosts(postsList);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { 
        alert('La imagen no puede ser mayor a 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!postContent.trim() && !selectedImage) || !user || isPosting) return;

    try {
      setIsPosting(true);
      
      const displayName = userData?.displayName || user.displayName || 'Usuario Anónimo';
      const photoURL = userData?.photoURL || user.photoURL || '';
      
      const newPost: Omit<Post, 'id' | 'createdAt'> = {
        uid: user.uid,
        displayName,
        photoURL: photoURL || undefined,
        content: postContent.trim(),
      };

      if (selectedImage) {
        try {
          const { url, path } = await postRepository.uploadImage(selectedImage, user.uid);
          newPost.imageURL = url;
          newPost.imagePath = path;
        } catch (error) {
          console.error('Error uploading image:', error);
          throw new Error('Error al subir la imagen');
        }
      }

      await postRepository.createPost(newPost);
      
      setPostContent('');
      removeImage();
      await loadPosts(); 
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

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

  if (authLoading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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

      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <form onSubmit={handlePostSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              multiline
              rows={3}
              variant="outlined"
              placeholder="¿Qué estás pensando?"
              fullWidth
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              disabled={isPosting}
              sx={{ mb: 2 }}
            />
            
            {imagePreview && (
              <Box sx={{ position: 'relative', mb: 2, maxWidth: '100%' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '4px',
                    display: 'block'
                  }} 
                />
                <IconButton
                  onClick={removeImage}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <Cancel />
                </IconButton>
              </Box>
            )}
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              disabled={isPosting}
            />
            <label htmlFor="image-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<Image />}
                disabled={isPosting}
                sx={{ mr: 1, mb: 2 }}
              >
                {selectedImage ? 'Cambiar imagen' : 'Añadir imagen'}
              </Button>
            </label>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!postContent.trim() && !selectedImage || isPosting}
                startIcon={isPosting ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {isPosting ? 'Publicando...' : 'Publicar'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Publicaciones
        </Typography>
        
        {postsLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay publicaciones aún. ¡Sé el primero en publicar algo!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {posts.map((post) => (
              <Box key={post.id}>
                <Card elevation={2}>
                  <CardHeader
                    avatar={
                      <Avatar 
                        src={post.photoURL} 
                        alt={post.displayName}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {post.displayName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    }
                    title={post.displayName}
                    subheader={post.createdAt ? formatDate(post.createdAt.toString()) : 'Fecha desconocida'}
                  />
                  <CardContent>
                    {post.content && (
                      <Typography variant="body1" component="div" whiteSpace="pre-wrap" sx={{ mb: post.imageURL ? 2 : 0 }}>
                        {post.content}
                      </Typography>
                    )}
                    {post.imageURL && (
                      <Box sx={{ 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        maxWidth: '100%',
                        margin: '0 auto'
                      }}>
                        <img 
                          src={post.imageURL} 
                          alt="Post content" 
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '400px',
                            display: 'block',
                            margin: '0 auto'
                          }} 
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions disableSpacing>
                    <IconButton aria-label="like">
                      <span>👍</span>
                    </IconButton>
                    <IconButton aria-label="comment">
                      <span>💬</span>
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;
