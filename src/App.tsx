import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { Home } from './pages/Home';
import { IncidentContainer } from './pages/IncidentContainer';
import './App.css';

function App() {
  return (
    <Router>
      <DemoProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/incident/:id" element={<IncidentContainer />} />
        </Routes>
      </DemoProvider>
    </Router>
  );
}

export default App;
