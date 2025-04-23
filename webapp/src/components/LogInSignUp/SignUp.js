// src/components/AddUser.js
import React, { useState } from 'react';
import { Typography, TextField, Button, Box, FormControl, Divider } from '@mui/material';
import { SitemarkIcon } from '../CustomIcons';
import { Card, LogInContainer } from '../CustomComponents';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmationPassword] = useState('');
  const { authenticateUser, error } = useAuth();
  const { t } = useTranslation();

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
        >        {t("signUp.signUp")}
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
              label={t("signUp.username")}
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
              label={t("signUp.password")}
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
              label={t("signUp.confirmPassword")}
              type="password"
              value={confirmpassword}
              onChange={(e) => setConfirmationPassword(e.target.value)}
            />
          </FormControl>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={signUp}>
            {t("signUp.signUp")}
          </Button>
          {error && <p style={{ color: 'red' }}>{error}</p>}

        </Box>
        <Divider>{t("signUp.or")}</Divider>
        <Typography component="div" align="center" sx={{ marginTop: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            {t("signUp.alreadyHaveAccount") + ' '}
            <Link to="/login" name="gotoregister" component="button" variant="body2" >
              {t("signUp.logInHere")}
            </Link>
          </Typography>
        </Typography>
      </Card>
    </LogInContainer>
  );
};

