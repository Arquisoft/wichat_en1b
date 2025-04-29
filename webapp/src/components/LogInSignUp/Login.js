// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { SitemarkIcon } from '../CustomIcons';
import { Box, Button, FormControl, TextField, Typography, Divider } from '@mui/material';
import { LogInContainer, Card } from '../CustomComponents';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorDisplayed, setErrorDisplayed] = useState('');
  const { authenticateUser, error } = useAuth();
  const { t, i18n } = useTranslation();
 
  const logIn = (e) => {
    e.preventDefault();
    authenticateUser('login', username, password)
  }

  useEffect(() => {
    setErrorDisplayed(t(error));
  }, [error, i18n.language]);

  return (
    <LogInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined" margin="1em">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          {t("logIn.logIn")}
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
              label={t("logIn.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              margin="normal"
              fullWidth
              label={t("logIn.password")}
              type="password"
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
            {t("logIn.logIn")}  
          </Button>
          {error && <p style={{ color: 'red' }}>{errorDisplayed}</p>}

        </Box>
        <Divider>{t("logIn.or")}</Divider>
        <Typography component="div" align="center" sx={{ marginTop: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            {t("logIn.dontHaveAccount") + ' '}
            <Link to="/signup" className="gotoregister" variant="body2" >
              {t("logIn.signUpHere")}</Link>
          </Typography>
        </Typography>
      </Card>
    </LogInContainer>
  );
};