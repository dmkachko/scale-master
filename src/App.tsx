/**
 * App Component
 * Main application with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScaleCatalogPage from './pages/ScaleCatalogPage';
import ScaleFinderPage from './pages/ScaleFinderPage';
import ScaleDetailsPage from './pages/ScaleDetailsPage';
import ScalePage from './pages/ScalePage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ScaleCatalogPage />} />
          <Route path="/scale/:scaleId" element={<ScalePage />} />
          <Route path="/scale-finder" element={<ScaleFinderPage />} />
          <Route path="/scale-details" element={<ScaleDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
