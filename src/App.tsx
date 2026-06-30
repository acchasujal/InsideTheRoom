import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { DemoProvider } from './context/DemoContext';
import { Home } from './pages/Home';
import { IncidentContainer } from './pages/IncidentContainer';
import { LiveGeneration } from './pages/LiveGeneration';
import { HeatmapDemo } from './pages/HeatmapDemo';
import { GovernanceDiagnostics } from './pages/GovernanceDiagnostics';
import { Layout } from './layouts/Layout';
import './App.css';

const IncidentContainerWrapper = () => {
  const { id } = useParams();
  return <IncidentContainer key={id} />;
};

function App() {
  return (
    <Router>
      <DemoProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/incident/:id" element={<IncidentContainerWrapper />} />
            <Route path="/live" element={<LiveGeneration />} />
            <Route path="/heatmap" element={<HeatmapDemo />} />
            <Route path="/governance" element={<GovernanceDiagnostics />} />
          </Routes>
        </Layout>
      </DemoProvider>
    </Router>
  );
}

export default App;
