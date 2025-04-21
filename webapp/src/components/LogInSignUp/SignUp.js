// src/components/AddUser.js
import React, { useState } from 'react';
import { Typography, TextField, Button, Box, FormControl, Divider } from '@mui/material';
import { SitemarkIcon } from '../CustomIcons';
import { Card, LogInContainer } from '../CustomComponents';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmationPassword] = useState('');
  const { authenticateUser, error } = useAuth();

  const signUp = (e) => {
    e.preventDefault();
    authenticateUser('addUser', username, password, confirmpassword)
  } 

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
              id="username"
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
              id="password"
              name="password"
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              id="confirmpassword"
              name="confirmpassword"
              margin="normal"
              fullWidth
              label="Confirm password"
              type="password"
              value={confirmpassword}
              onChange={(e) => setConfirmationPassword(e.target.value)}
            />
          </FormControl>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={signUp}>
            Sign Up
          </Button>
          {error && <p style={{ color: 'red' }}>{error}</p>}

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

