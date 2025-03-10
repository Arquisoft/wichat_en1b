// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Snackbar, Box, FormControl, Divider } from '@mui/material';
import { SitemarkIcon } from '../CustomIcons';
import { Card, LogInContainer } from '../CustomComponents';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

export const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const addUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/adduser`, { username, password });
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

  return (
    <LogInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >        Sign Up
        </Typography>
        <Box
          component="form"
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
              name="username"
              margin="normal"
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              name="password"
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={addUser}>
            Sign Up
          </Button>
          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
          {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
          )}
        </Box>
        <Divider>or</Divider>
        <Typography component="div" align="center" sx={{ marginTop: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account? {' '}
            <Link to="/login" name="gotoregister" component="button" variant="body2" >
              Login here
            </Link>
          </Typography>
        </Typography>
      </Card>
    </LogInContainer>
  );
};

