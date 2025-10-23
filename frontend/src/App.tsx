import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AgentList from './pages/AgentList';
import AgentDetail from './pages/AgentDetail';
import RegisterAgent from './pages/RegisterAgent';
import Health from './pages/Health';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="agents" element={<AgentList />} />
            <Route path="agents/:agentId" element={<AgentDetail />} />
            <Route path="register" element={<RegisterAgent />} />
            <Route path="health" element={<Health />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
