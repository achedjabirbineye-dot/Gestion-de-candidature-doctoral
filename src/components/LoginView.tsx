import React, { useState } from 'react';
import { useGcd } from '../context/GcdContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, utilisateurs, switchUser } = useGcd();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Usmba2026!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (success) {
      if (onSuccess) onSuccess();
    } else {
      setError('Identifiants incorrects. Veuillez vérifier votre adresse institutionnelle USMBA.');
    }
  };

  const handleQuickSelect = (uEmail: string, uId: number) => {
    setEmail(uEmail);
    setPassword('Usmba2026!');
    switchUser(uId);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex justify-center items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center text-amber-400 font-black text-2xl shadow-xl border-2 border-amber-500">
            USMBA
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          Plateforme GCD Doctorat
        </h2>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">
          Université Sidi Mohamed Ben Abdellah • Fès
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase">
                Adresse e-mail institutionnelle
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@usmba.ac.ma"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition"
            >
              <span>Se connecter au portail doctoral</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>

          {/* Quick-Access Seed Accounts */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Accès Démonstration Rapide (1-Clic) :</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {utilisateurs.slice(0, 6).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickSelect(u.email, u.id)}
                  className="w-full text-left py-2 px-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-slate-700 font-medium transition flex items-center justify-between"
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{u.nom}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{u.email}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-900 font-bold shrink-0">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
