import React from 'react';
import { TypeDocument } from '../types';
import { X, FileText, CheckCircle2, Award, Shield, Download, Printer } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TypeDocument;
  title: string;
  candidateName?: string;
  cin?: string;
  subjectTitle?: string;
  fileName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  candidateName = 'Candidat USMBA',
  cin = 'CD998877',
  subjectTitle = 'Thèse Doctorale USMBA',
  fileName = 'document.pdf'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-800 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide text-white">{title}</h3>
                <span className="text-[10px] font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  {type}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {type === 'CIN' && (
            <div className="w-full max-w-lg bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-600/40 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start border-b border-emerald-200 pb-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Royaume du Maroc</p>
                  <h4 className="text-sm font-extrabold text-slate-900">CARTE NATIONALE D'IDENTITÉ ÉLECTRONIQUE</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {cin}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="w-28 h-36 bg-slate-200 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                  <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-xl mb-1">
                    {candidateName.charAt(0)}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">PHOTO OFFICIELLE</span>
                </div>
                <div className="col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Nom & Prénom</span>
                    <span className="text-sm font-bold text-slate-800">{candidateName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Nationalité</span>
                    <span className="font-semibold text-slate-700">Marocaine</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Date de Validité</span>
                    <span className="font-mono text-slate-700">Valable jusqu'au 15/10/2032</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200 flex justify-between items-center text-[10px] text-emerald-800">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Document Certifié Conforme (Plateforme USMBA)
                </span>
                <span className="font-mono font-bold">DGSN • MAROC</span>
              </div>
            </div>
          )}

          {type === 'Diplome_Master' && (
            <div className="w-full max-w-xl bg-amber-50/70 border-4 border-double border-amber-600/50 rounded-2xl p-8 shadow-lg text-center relative">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-blue-900 border-2 border-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  USMBA
                </div>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Royaume du Maroc</p>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-950 mt-0.5">
                Université Sidi Mohamed Ben Abdellah de Fès
              </p>
              <div className="my-4 border-t border-b border-amber-300 py-3">
                <h4 className="text-lg font-serif font-bold text-amber-900 tracking-wide">DIPLÔME DE MASTER</h4>
                <p className="text-xs text-slate-600 italic mt-1">Vu les délibérations du jury académique réuni le 10 Juillet</p>
              </div>

              <p className="text-xs text-slate-700">Le Diplôme National de Master est conféré à :</p>
              <h5 className="text-base font-extrabold text-slate-900 my-1">{candidateName}</h5>
              <p className="text-xs font-mono text-slate-500">Titulaire de la CIN N° : {cin}</p>
              
              <div className="mt-4 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-slate-800 text-left">
                <p className="font-bold">Filière : <span className="font-normal">Ingénierie des Systèmes Intelligents & Big Data</span></p>
                <p className="font-bold">Mention : <span className="text-emerald-700 font-bold">Très Bien</span></p>
                <p className="font-bold">Établissement : <span className="font-normal">Faculté des Sciences et Techniques (FST) de Fès</span></p>
              </div>

              <div className="mt-6 flex justify-between items-end text-[11px] text-slate-600">
                <div className="text-left">
                  <p className="font-semibold">Le Doyen de la Faculté</p>
                  <p className="font-serif italic text-slate-400 mt-2">Signé & Cacheté</p>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-amber-600/40 flex items-center justify-center text-amber-700 text-[10px] font-bold">
                  SCEAU USMBA
                </div>
                <div className="text-right">
                  <p className="font-semibold">Le Président de l'Université</p>
                  <p className="font-serif italic text-slate-400 mt-2">Pr. Mustapha IJJAALI</p>
                </div>
              </div>
            </div>
          )}

          {type === 'Rapport_Avancement' && (
            <div className="w-full max-w-xl bg-white border border-slate-300 rounded-xl p-8 shadow-sm text-left">
              <div className="flex justify-between items-start border-b-2 border-blue-900 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-extrabold text-blue-950 uppercase">Rapport Annuel d'Avancement des Travaux de Thèse</h4>
                  <p className="text-xs text-slate-500">Centre d'Études Doctorales (CED) • USMBA Fès</p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                  Année 2026/2027
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Doctorant(e)</span>
                    <span className="font-bold text-slate-800">{candidateName} ({cin})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Directeur de Thèse</span>
                    <span className="font-bold text-slate-800">Pr. Alami Driss</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Intitulé du Sujet de Recherche</span>
                  <p className="font-bold text-slate-800 mt-0.5">{subjectTitle}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Production Scientifique & Rayonnement</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                      <span className="text-lg font-black text-emerald-800 block">2</span>
                      <span className="text-[11px] text-emerald-700 font-medium">Articles indexés Scopus / WoS</span>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded border border-blue-200">
                      <span className="text-lg font-black text-blue-800 block">3</span>
                      <span className="text-[11px] text-blue-700 font-medium">Communications orales internationales</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[11px]">Synthèse des travaux réalisés dans l'année :</span>
                  <p className="text-[11px] mt-1 text-slate-700 leading-relaxed">
                    Finalisation de la chaîne algorithmique prédictive. Validation sur le jeu de données historique du bassin hydraulique du Sebou (période 2010-2025). Préparation active du manuscrit de soutenance.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-[11px]">
                  <div>
                    <p className="font-bold text-slate-700">Avis du Comité (CAT)</p>
                    <span className="text-emerald-700 font-bold">Favorable sans réserve</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">Signature Directeur de Thèse</p>
                    <p className="italic text-slate-500 font-serif">Pr. Alami Driss (Validé numériquement)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'Attestation_Bourse' && (
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
              <Award className="w-12 h-12 text-amber-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Attestation d'Excellence & Allocation Doctorale</h4>
              <p className="text-xs text-slate-500 mt-1">Bourse Nationale CNRST / Bourse d'Excellence USMBA</p>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs text-left space-y-1">
                <p><span className="font-bold">Bénéficiaire :</span> {candidateName}</p>
                <p><span className="font-bold">CIN :</span> {cin}</p>
                <p><span className="font-bold">Montant Mensuel :</span> 3 000 MAD</p>
                <p><span className="font-bold">Statut :</span> Actif pour l'exercice 2026/2027</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-800" /> Document archivé sur le serveur sécurisé GCD USMBA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
