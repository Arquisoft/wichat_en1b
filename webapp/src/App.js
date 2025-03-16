import React, { useEffect } from 'react';
import { Login } from './components/LogInSignUp/Login';
import { SignUp } from './components/LogInSignUp/SignUp';
import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { Navbar } from './components/fragments/Navbar';
import { StatisticsPage } from './components/Statistics/StatisticsPage';
import { Question } from './components/Question/Question';


function App() {
  useEffect(() => {
    document.title = 'WiChat';
  }, [])

  return (
    <Container>
      <Navbar />
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh'}}>
        <Container component="main" className="main" maxWidth="lg" style={{ padding: '3em 0em' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />}/>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/game" element={<Question />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
    </Container>
    
  );
}

export default App;
