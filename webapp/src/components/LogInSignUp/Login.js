// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { SitemarkIcon } from '../CustomIcons';
import { Box, Button, FormControl, TextField, Typography, Snackbar, Divider } from '@mui/material';
import { LogInContainer, Card } from '../CustomComponents';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });
      let oneHourAfter = new Date().getTime() + (1 * 60 * 60 * 1000)
      Cookies.set('user', JSON.stringify({ username: response.data.username, token: response.data.token })
        , { expires: oneHourAfter });
      navigate('/home');
      window.location.reload();
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const validateInputs = () => {
    console.log({
      user: username,
      password: password,
    })
  }

  return (
    <LogInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined" margin="1em">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Log in
        </Typography>
        <Box
          component="form"
          onSubmit={loginUser}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Log in
          </Button>
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
          )}
        </Box>
        <Divider>or</Divider>
        <Typography component="div" align="center" sx={{ marginTop: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="gotoregister" variant="body2" >
              Sign up here </Link>
          </Typography>
        </Typography>
      </Card>
    </LogInContainer>
  );
};

export default Login;
