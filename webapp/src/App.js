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
import GameModes from './components/GameModes/GameModes';

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
            <Route path="/statistics" element={isLoggedIn ? <Statistics /> : <Navigate to="/login" /> } />
            <Route path="/profile/:username" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/game/classical" element={isLoggedIn ? <GameWrapper type={"classical"}/> : <Navigate to="/login" />} />
            <Route path="/game/suddenDeath" element={isLoggedIn ? <GameWrapper type={"suddenDeath"}/> : <Navigate to="/login" />} />
            <Route path="/game/timeTrial" element={isLoggedIn ? <GameWrapper type={"timeTrial"}/> : <Navigate to="/login" />} />
            <Route path="/game/qod" element={isLoggedIn ? <GameWrapper type={"qod"}/> : <Navigate to="/login" />} />
            <Route path="/game/custom" element={isLoggedIn ? <GameWrapper type={"custom"}/> : <Navigate to="/login" />} />
            <Route path="/game" element={isLoggedIn ? <Navigate to="/game/classical" /> : <Navigate to="/login" />} />
            <Route path="/game-modes" element={isLoggedIn ? <GameModes /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Container>
      </div>
    </Router>
    </Container>
    
  );
}

export default App;
