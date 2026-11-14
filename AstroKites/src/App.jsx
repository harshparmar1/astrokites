import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/navbar';
import Home from './pages/homePage';
import Forecast from './pages/forecast';
import Maps from './pages/maps';
import Trends from './pages/trends';
import Compare from './pages/compare';
import Correlations from './pages/correlations';
import Assistant from './pages/assistant';
import Reports from './pages/reports';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/correlations" element={<Correlations />} />
        <Route path="/relationships" element={<Correlations />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
