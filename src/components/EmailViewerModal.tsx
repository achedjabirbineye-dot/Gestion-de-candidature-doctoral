import React from 'react';
import { NotificationEmail } from '../types';
import { X, Mail, Clock, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';

interface EmailViewerModalProps {
  email: NotificationEmail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({ email, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email.corpsTexte);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-900 text-white border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-800 rounded-lg text-amber-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Accusé d'Envoi E-mail & Notification de Rattrapage</h3>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-200 px-2 py-0.5 rounded border border-rose-700">
                  J+5
                </span>
              </div>
              <p className="text-xs text-rose-200 font-mono mt-0.5">Dossier #{email.dossierId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta Headers */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">De :</span>
              <span className="font-semibold text-slate-800">
                Centre d'Études Doctorales USMBA &lt;scolarite.doctorat@usmba.ac.ma&gt;
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              ✓ E-mail Délivré
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase text-[10px]">À :</span>
            <span className="font-bold text-blue-900">
              {email.destinataireNom} &lt;{email.destinataireEmail}&gt;
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Date d'envoi :</span>
              <span className="font-mono text-xs">{email.dateEnvoi}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-rose-700 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Échéance limite : {email.dateLimite}</span>
            </div>
          </div>

          <div className="pt-1 flex items-start gap-2 border-t border-slate-200/60">
            <span className="font-bold text-slate-500 uppercase text-[10px] shrink-0">Objet :</span>
            <span className="font-bold text-slate-900 leading-tight">{email.objet}</span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
          {email.corpsTexte}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Accusé de réception journalisé dans la base SQLite USMBA
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg text-xs transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
