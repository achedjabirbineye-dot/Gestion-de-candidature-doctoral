import React, { useState, useEffect } from 'react';
import { GcdProvider, useGcd } from './context/GcdContext';
import { Navbar } from './components/Navbar';
import { CandidatDashboard } from './components/CandidatDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginView } from './components/LoginView';
import { SourceCodeViewerModal } from './components/SourceCodeViewerModal';
import {
  GraduationCap,
  ShieldCheck,
  Code2,
  Calendar,
  CheckCircle,
  Clock,
  Layers,
  HelpCircle,
  Sparkles
} from 'lucide-react';

import { AccueilPage } from './components/AccueilPage';

const AppContent: React.FC = () => {
  const { currentUser, simulationDate, verifierDelais } = useGcd();
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'accueil' | 'candidat' | 'admin'>('accueil');

  // Exécution automatique de verifierDelais lors des changements de date simulée
  useEffect(() => {
    verifierDelais();
  }, [simulationDate]);

  const role = currentUser?.role;
  const isCandidatRole = role === 'candidat';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Official Top Navigation with View Switcher */}
      <Navbar
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        currentView={currentView}
        onSelectView={view => setCurrentView(view)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Vue 1 : Page d'Accueil Institutionnelle USMBA */}
        {currentView === 'accueil' && (
          <AccueilPage
            onNavigerVers={vue => {
              if (vue === 'sujets') {
                setCurrentView('accueil');
                const el = document.getElementById('catalogue-sujets');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setCurrentView(vue);
              }
            }}
            onOpenSourceModal={() => setIsSourceModalOpen(true)}
          />
        )}

        {/* Vue 2 & 3 : Portail Candidat ou Back-Office Gouvernance */}
        {currentView !== 'accueil' && (
          !currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setCurrentView('accueil')}
                  className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1.5"
                >
                  ← Revenir à la Page d'Accueil
                </button>
                <span className="text-xs text-slate-500 font-medium">Authentification Requise</span>
              </div>
              <LoginView onSuccess={() => {}} />
            </div>
          ) : (
            <>
              {/* Context Navigation Ribbon */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {isCandidatRole ? <GraduationCap className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {currentUser?.nom}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                        Rôle : {currentUser?.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      CIN : <span className="font-mono text-slate-700">{currentUser?.cin}</span> • {currentUser?.email}
                    </p>
                  </div>
                </div>

                {/* View Selector Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setCurrentView('accueil')}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-950 transition"
                    title="Revenir à la page d'accueil"
                  >
                    ← Page d'Accueil
                  </button>
                  <button
                    onClick={() => setCurrentView('candidat')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentView === 'candidat'
                        ? 'bg-blue-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Portail Candidat</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentView === 'admin'
                        ? 'bg-blue-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Back-Office Gouvernance</span>
                  </button>
                </div>
              </div>

              {/* Content Views */}
              {currentView === 'candidat' ? <CandidatDashboard /> : <AdminDashboard />}
            </>
          )
        )}
      </main>

      {/* Official USMBA Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">GCD Doctorat USMBA</span>
            <span>•</span>
            <span>Université Sidi Mohamed Ben Abdellah de Fès</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Version 2026.1 (Production)</span>
            <span>•</span>
            <button
              onClick={() => setIsSourceModalOpen(true)}
              className="hover:text-blue-900 font-semibold underline"
            >
              Voir code source Python/Flask
            </button>
          </div>
        </div>
      </footer>

      {/* Source Code Modal */}
      <SourceCodeViewerModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <GcdProvider>
      <AppContent />
    </GcdProvider>
  );
}
