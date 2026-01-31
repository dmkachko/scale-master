/**
 * App Component
 * Main application with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScaleCatalogPage from './pages/ScaleCatalogPage';
import ScaleFinderPage from './pages/ScaleFinderPage';
import ScaleDetailsPage from './pages/ScaleDetailsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ScaleCatalogPage />} />
          <Route path="/scale-finder" element={<ScaleFinderPage />} />
          <Route path="/scale-details" element={<ScaleDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
