import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { VoiceProvider, useVoice } from './contexts/VoiceContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceController from './components/VoiceController';
import AccessibilityPanel from './components/AccessibilityPanel';
import AccessibilityAssistant from './components/AccessibilityAssistant';
import PageLoader from './components/PageLoader';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';
import WebsiteConfirmModal from './components/WebsiteConfirmModal';

// Lazy load page components for better production performance
const Landing   = lazy(() => import('./pages/Landing'));
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Services  = lazy(() => import('./pages/Services'));
const Contact   = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function AppShell() {
  const location = useLocation();
  const { processCommand } = useVoice();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="page-transition">
            <Routes location={location}>
              <Route path="/"          element={<Landing />}  />
              <Route path="/demo"      element={<Home />}     />
              <Route path="/about"     element={<About />}    />
              <Route path="/services"  element={<Services />} />
              <Route path="/contact"   element={<Contact />}  />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* 404 fallback */}
              <Route path="*" element={
                <div tabIndex="-1" className="section pt-32 text-center">
                  <h1 className="font-display text-6xl font-bold mb-4 gradient-text">404</h1>
                  <p className="text-[var(--clr-text-muted)] mb-8">
                    Page not found. Try saying{' '}
                    <strong className="text-[var(--clr-primary)]">&ldquo;Go to Home&rdquo;</strong>.
                  </p>
                </div>
              } />
            </Routes>
          </div>
        </Suspense>
      </main>

      <Footer />

      {/* Floating controls — voice mic (right) + a11y panel (left) */}
      <VoiceController />
      <AccessibilityPanel />
      <AccessibilityAssistant />

      {/* Global Command Palette — Ctrl+K */}
      <CommandPalette processCommand={processCommand} />

      {/* Production Stacked Toast System */}
      <Toast />

      {/* Dynamic External Website Confirmation Overlay */}
      <WebsiteConfirmModal />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <VoiceProvider>
          <AppShell />
        </VoiceProvider>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}
