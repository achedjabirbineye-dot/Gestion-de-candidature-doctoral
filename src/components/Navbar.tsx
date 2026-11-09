import React from 'react';
import { useGcd } from '../context/GcdContext';
import {
  GraduationCap,
  Users,
  Calendar,
  Code2,
  RotateCcw,
  LogOut,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenSourceModal: () => void;
  currentView?: 'accueil' | 'candidat' | 'admin';
  onSelectView?: (view: 'accueil' | 'candidat' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSourceModal,
  currentView = 'accueil',
  onSelectView
}) => {
  const {
    currentUser,
    utilisateurs,
    switchUser,
    logout,
    simulationDate,
    setSimulationDate,
    reinitialiserDonnees,
    verifierDelais
  } = useGcd();

  const handleDateChange = (newDate: string) => {
    setSimulationDate(newDate);
  };

  return (
    <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white sticky top-0 z-40 shadow-md border-b-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Institution Branding (Clickable to return Accueil) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectView && onSelectView('accueil')}
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
              title="Retourner à la page d'accueil de l'USMBA"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-amber-400 flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0 group-hover:scale-105 transition">
                <span className="text-amber-400 font-serif">U</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-tight text-white group-hover:text-amber-300 transition">
                    GCD DOCTORAT
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                    USMBA FÈS
                  </span>
                </div>
                <p className="text-[10px] text-blue-200 tracking-wider hidden md:block">
                  Université Sidi Mohamed Ben Abdellah • Centre d'Études Doctorales (CED)
                </p>
              </div>
            </button>

            {/* Navigation Tabs (Accueil, Portail Candidat, Gouvernance) */}
            {onSelectView && (
              <nav className="hidden md:flex items-center gap-1 bg-blue-950/60 p-1 rounded-xl border border-blue-800/80 text-xs">
                <button
                  onClick={() => onSelectView('accueil')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    currentView === 'accueil'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-blue-200 hover:text-white hover:bg-blue-900/60'
                  }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => onSelectView('candidat')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    currentView === 'candidat'
                      ? 'bg-blue-800 text-white font-bold shadow-xs'
                      : 'text-blue-200 hover:text-white hover:bg-blue-900/60'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Portail Candidat</span>
                </button>
                <button
                  onClick={() => onSelectView('admin')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-blue-800 text-white font-bold shadow-xs'
                      : 'text-blue-200 hover:text-white hover:bg-blue-900/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Gouvernance</span>
                </button>
              </nav>
            )}
          </div>

          {/* Center: Virtual Timeline Simulation (Permet de tester le rattrapage et timeout J+5) */}
          <div className="hidden lg:flex items-center gap-2 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800/80 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-blue-200">Date Système Simulée :</span>
            <input
              type="date"
              value={simulationDate}
              onChange={e => handleDateChange(e.target.value)}
              className="bg-blue-900/90 text-white font-mono font-bold text-xs px-2 py-0.5 rounded border border-blue-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              title="Avancez la date pour tester l'échéance J+5 et le timeout automatique verifier_delais()"
            />
            <button
              onClick={() => {
                // Avancer de 6 jours pour tester immédiatement le timeout
                const d = new Date(simulationDate);
                d.setDate(d.getDate() + 6);
                const nextDate = d.toISOString().split('T')[0];
                setSimulationDate(nextDate);
              }}
              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold transition"
              title="Avancer de 6 jours (Dépasse le délai de rattrapage J+5)"
            >
              +6j (Tester Timeout)
            </button>
          </div>

          {/* Right: Quick Role Switcher, Code Modal & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Bouton consultation du code source Flask/Python complet */}
            <button
              onClick={onOpenSourceModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition shrink-0"
              title="Voir l'intégralité du code source Flask/Python (app.py, templates, SQL, etc.)"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code Source Flask</span>
            </button>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-blue-900/90 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs border border-blue-700 shadow-sm transition">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <div className="text-left hidden md:block">
                  <div className="text-[10px] text-blue-300 leading-none">Changer de compte</div>
                  <div className="font-bold truncate max-w-[140px] leading-tight">
                    {currentUser?.nom.split(' ')[0]} ({currentUser?.role})
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 hidden group-hover:block z-50 animate-fade-in text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sélection Rapide des Profils RBAC
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {utilisateurs.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition flex items-center justify-between ${
                        currentUser?.id === u.id ? 'bg-blue-50/80 font-bold text-blue-950' : ''
                      }`}
                    >
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{u.nom}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                      </div>
                      <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Réinitialiser les données */}
            <button
              onClick={() => {
                if (confirm('Réinitialiser toutes les données aux valeurs par défaut de l\'USMBA ?')) {
                  reinitialiserDonnees();
                }
              }}
              className="p-2 text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition"
              title="Réinitialiser le jeu de données initial (Seed Data)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
