import React, { useEffect } from 'react';
import { Login } from './components/LogInSignUp/Login';
import { SignUp } from './components/LogInSignUp/SignUp';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { Navbar } from './components/fragments/Navbar';
import { Statistics } from './components/Statistics/Statistics';
import { Profile } from './components/Profile/Profile';
import Cookies from 'js-cookie';
import GameWrapper from './components/Game/GameWrapper';


function App() {
  useEffect(() => {
    document.title = 'WiChat';
  }, [])

  const isLoggedIn = !!Cookies.get('user'); 

  return (
    <Container>
      <Navbar />
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh'}}>
        <Container component="main" className="main" maxWidth="lg" style={{ padding: '3em 0em' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />}/>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
            <Route path="/signup" element={isLoggedIn ? <Navigate to="/home" /> : <SignUp />} />
            <Route path="/game" element={isLoggedIn ? <GameWrapper /> : <Navigate to="/login" />} />
            <Route path="/statistics" element={isLoggedIn ? <Statistics /> : <Navigate to="/login" /> } />
            <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" /> } />
          </Routes>
        </Container>
      </div>
    </Router>
    </Container>
    
  );
}

export default App;
