import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AgentList from './pages/AgentList';
import AgentDetail from './pages/AgentDetail';
import RegisterAgent from './pages/RegisterAgent';
import Health from './pages/Health';
import Login from './pages/Login';
import GettingStarted from './pages/wiki/GettingStarted';
import HowToUse from './pages/wiki/HowToUse';
import Roadmap from './pages/wiki/Roadmap';
import TermsAndSpecs from './pages/wiki/TermsAndSpecs';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="wiki/getting-started" element={<GettingStarted />} />
              <Route path="wiki/how-to-use" element={<HowToUse />} />
              <Route path="wiki/roadmap" element={<Roadmap />} />
              <Route path="wiki/terms-and-specs" element={<TermsAndSpecs />} />
              <Route path="agents" element={<AgentList />} />
              <Route path="agents/:agentId" element={<AgentDetail />} />
              <Route path="register" element={<RegisterAgent />} />
              <Route path="health" element={<Health />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
