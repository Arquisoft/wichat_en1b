// src/components/AddUser.js
import React, { useEffect, useState } from 'react';
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
  const [errorDisplayed, setErrorDisplayed] = useState('');
  const { t, i18n } = useTranslation();

  const signUp = (e) => {
    e.preventDefault();
    authenticateUser('addUser', username, password, confirmpassword)
  }

  useEffect(() => {
    setErrorDisplayed(t(error));
  }, [error, i18n.language]);

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
              data-testid="reg-username"
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
              data-testid="reg-password"
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
              data-testid="reg-confirmpassword"
              value={confirmpassword}
              onChange={(e) => setConfirmationPassword(e.target.value)}
            />
          </FormControl>
          <Button 
            variant="contained"
            color="primary" 
            data-testid="signup"
            onClick={signUp}>
            {t("signUp.signUp")}
          </Button>
          {error && <p style={{ color: 'red' }}>{errorDisplayed}</p>}

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

