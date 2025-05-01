import React, { useEffect } from 'react';
import { Login } from './components/LogInSignUp/Login';
import { SignUp } from './components/LogInSignUp/SignUp';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { Navbar } from './components/fragments/Navbar';
import { Statistics } from './components/Statistics/Statistics';
import { Profile } from './components/Profile/Profile';
import GameWrapper from './components/Game/GameWrapper';
import GameModes from './components/GameModes/GameModes';
import { ProtectedLayout, PublicLayout } from './components/layouts/ProtectedLayout';
import { useTranslation } from 'react-i18next';
import { GameEndScreen } from './components/Game/Question/GameEndScreen';

function App() {
  useEffect(() => {
    document.title = 'WiChat';
  }, []);

  return (
    <Container>
      <Navbar />
      <Router>
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <Container component="main" className="main" maxWidth="lg" style={{ padding: '3em 0em' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />

              {/* Auth routes */}
              <Route element={<PublicLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/game-modes" element={<GameModes />} />
                <Route path="/game">
                  <Route index element={<Navigate to="classical" />} />
                  <Route path="classical" element={<GameWrapper type="classical" />} />
                  <Route path="suddenDeath" element={<GameWrapper type="suddenDeath" />} />
                  <Route path="timeTrial" element={<GameWrapper type="timeTrial" />} />
                  <Route path="qod" element={<GameWrapper type="qod" />} />
                  <Route path="custom" element={<GameWrapper type="custom" />} />
                  <Route path="end-game" element={<GameEndScreen />} />
                </Route>
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </Container>
  );
}

export default App;
