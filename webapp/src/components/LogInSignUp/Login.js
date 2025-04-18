// src/components/Login.js
import React, { useState } from 'react';
import { SitemarkIcon } from '../CustomIcons';
import { Box, Button, FormControl, TextField, Typography, Divider } from '@mui/material';
import { LogInContainer, Card } from '../CustomComponents';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authenticateUser, error } = useAuth();
  
  const logIn = (e) => {
    e.preventDefault();
    authenticateUser('login', username, password)
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
              data-testid="log-username"
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
              data-testid="log-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={logIn}
          >
            Log in
          </Button>
          {error && <p style={{ color: 'red' }}>{error}</p>}

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