import React from 'react';
import { NiveauAdministratif, NIVEAUX_ORDER, NIVEAUX_DETAILS, DossierStatut } from '../types';
import { Check, Clock, AlertTriangle, ShieldCheck, ArrowRight, UserCheck, Building2, BookOpen, Award } from 'lucide-react';

interface NiveauStepperProps {
  niveauActuel: NiveauAdministratif;
  statut?: DossierStatut;
  className?: string;
  compact?: boolean;
}

const STEP_ICONS: Record<NiveauAdministratif, React.ReactNode> = {
  '1_DEPOT_CANDIDAT': <UserCheck className="w-4 h-4" />,
  '2_AVIS_DIRECTEUR_THESE': <BookOpen className="w-4 h-4" />,
  '3_VALIDATION_LABO_STRUCTURE': <Building2 className="w-4 h-4" />,
  '4_COMMISSION_CED': <ShieldCheck className="w-4 h-4" />,
  '5_DECISION_POLE_DOCTORAL': <Award className="w-4 h-4" />
};

export const NiveauStepper: React.FC<NiveauStepperProps> = ({
  niveauActuel,
  statut = 'En cours',
  className = '',
  compact = false
}) => {
  const currentIndex = NIVEAUX_ORDER.indexOf(niveauActuel);
  const currentDetails = NIVEAUX_DETAILS[niveauActuel] || NIVEAUX_DETAILS['1_DEPOT_CANDIDAT'];
  const isValide = statut === 'Validé';
  const isRefuse = statut === 'Refusé';
  const isIncomplet = statut === 'Incomplet';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visual Stepper (Fil d'Ariane à 5 niveaux) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Circuit d'Instruction Administratif
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>Étape {currentIndex + 1} sur 5 : {currentDetails.nomComplet}</span>
              {isValide && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Instruction Complétée (Validé)
                </span>
              )}
              {isIncomplet && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                  En Attente de Rattrapage
                </span>
              )}
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <span className="text-slate-500 font-normal">Instance :</span>
            <span>{currentDetails.instance}</span>
          </div>
        </div>

        {/* 5-Step Bar */}
        <div className="relative">
          {/* Connector Line behind steps */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block" />
          <div
            className="absolute top-5 left-6 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block"
            style={{
              width: isValide
                ? 'calc(100% - 3rem)'
                : `calc(${Math.min(currentIndex, 4) * 25}% - 1rem)`
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
            {NIVEAUX_ORDER.map((niveauKey, idx) => {
              const details = NIVEAUX_DETAILS[niveauKey];
              const isPast = isValide || idx < currentIndex;
              const isCurrent = !isValide && idx === currentIndex;
              const isFuture = !isValide && idx > currentIndex;

              return (
                <div key={niveauKey} className="flex flex-col items-center text-center group">
                  {/* Circle Indicator */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : isCurrent
                        ? 'bg-blue-900 text-white ring-4 ring-blue-100 border-2 border-amber-400 font-black'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <span>{details.numero}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center w-full">
                    <span
                      className={`text-xs block font-bold leading-tight ${
                        isCurrent
                          ? 'text-blue-950 font-black'
                          : isPast
                          ? 'text-emerald-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {details.nomCourt}
                    </span>
                    <span
                      className={`text-[10px] block mt-0.5 leading-tight ${
                        isCurrent ? 'text-blue-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {details.instance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explicit Contextual Information Banner */}
        <div
          className={`mt-5 p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
            isValide
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isIncomplet
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : isRefuse
              ? 'bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200 text-blue-950'
          }`}
        >
          <div className="p-1.5 bg-white rounded-lg shadow-2xs shrink-0 mt-0.5">
            {isValide ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : isIncomplet ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <Clock className="w-4 h-4 text-blue-800" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <span className="font-extrabold uppercase tracking-wide block text-[11px]">
              {isValide
                ? 'Décision Finale : Dossier Validé Définitivement'
                : isIncomplet
                ? 'Statut Incomplet : Pièce Justificative Requise'
                : `Suivi d'Instruction • Instance Active : ${currentDetails.instance}`}
            </span>
            <p className="mt-1 leading-relaxed">
              {isValide
                ? 'Félicitations, l\'intégralité des 5 niveaux d\'instruction a été validée avec succès par le Conseil du Pôle Doctoral. Votre inscription doctorale USMBA est définitivement actée.'
                : isIncomplet
                ? 'L\'avancement du dossier est suspendu en attente du dépôt de votre diplôme de Master certifié dans le délai imparti (J+5).'
                : currentDetails.messageCandidat}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
