import React, { useState } from 'react';
import AddUser from './components/AddUser';
import Login from './components/Login';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { LogInContainer, Card } from './components/CustomComponents';


function App() {
  const [showLogin, setShowLogin] = useState(true);

  const handleToggleView = () => {
    setShowLogin(!showLogin);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Typography component="h1" variant="h5" align="center" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginTop: 2 }}>
        Welcome to the 2025 edition of the Software Architecture course!
      </Typography>
      <LogInContainer direction="column" justifyContent="space-between">
        <Card>
          {showLogin ? <Login /> : <AddUser />}
          <Divider>or</Divider>
          <Typography component="div" align="center" sx={{ marginTop: 2 }}>
        {showLogin ? (
          <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
          <Link name="gotoregister" component="button" variant="body2" onClick={handleToggleView}>
            Register here.
          </Link>
          </Typography>
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account? {' '}
          <Link component="button" variant="body2" onClick={handleToggleView}>
            Login here.
          </Link>
          </Typography>
        )}
      </Typography>
        </Card>
      </LogInContainer>
      
    </Container>
  );
}

export default App;
