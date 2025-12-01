import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import AgentList from './pages/AgentList';
import AgentDetail from './pages/AgentDetail';
import AgentWorkbench from './pages/AgentWorkbench';
import Statistics from './pages/Statistics';
import RegisterAgent from './pages/RegisterAgent';
import DockerImages from './pages/DockerImages';
import Health from './pages/Health';
import GettingStarted from './pages/wiki/GettingStarted';
import Roadmap from './pages/wiki/Roadmap';
import TermsAndSpecs from './pages/wiki/TermsAndSpecs';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/agents" replace />} />
            <Route path="agents" element={<AgentList />} />
            <Route path="agents/:agentId" element={<AgentDetail />} />
            <Route path="workbench/:agentName" element={<AgentWorkbench />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="docker-images" element={<DockerImages />} />
            <Route path="wiki/getting-started" element={<GettingStarted />} />
            <Route path="wiki/roadmap" element={<Roadmap />} />
            <Route path="wiki/terms-and-specs" element={<TermsAndSpecs />} />
            <Route path="register" element={<RegisterAgent />} />
            <Route path="health" element={<Health />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
