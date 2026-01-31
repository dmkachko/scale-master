/**
 * App Component
 * Main application with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScaleCatalogPage from './pages/scale-catalog/ScaleCatalogPage.tsx';
import ScaleFinderPage from './pages/finder/ScaleFinderPage.tsx';
import ScaleDetailsPage from './pages/scale-details/ScaleDetailsPage.tsx';
import ScalePage from './pages/scale/ScalePage.tsx';
import NotFoundPage from './pages/errors/NotFoundPage.tsx';
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
