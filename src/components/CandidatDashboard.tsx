import React, { useState } from 'react';
import { useGcd } from '../context/GcdContext';
import { TypeDocument } from '../types';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Lock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
  ShieldAlert,
  Mail
} from 'lucide-react';
import { DocumentViewerModal } from './DocumentViewerModal';
import { NiveauStepper } from './NiveauStepper';
import { EmailViewerModal } from './EmailViewerModal';
import { NotificationEmail } from '../types';

export const CandidatDashboard: React.FC = () => {
  const {
    currentUser,
    calendrier,
    sujets,
    getDossierActifCandidat,
    getDossierN1Candidat,
    soumettreInscription,
    soumettreReinscription,
    rattrapagePiece,
    genererEmailRattrapage,
    simulationDate
  } = useGcd();

  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'danger' | 'info';
    message: string;
  } | null>(null);

  const [emailModalData, setEmailModalData] = useState<NotificationEmail | null>(null);

  // Formulaire Inscription Initiale
  const [selectedSujetId, setSelectedSujetId] = useState<number | ''>('');
  const [cinFile, setCinFile] = useState<File | null>(null);
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [masterManquant, setMasterManquant] = useState(false);

  // Formulaire Réinscription
  const [rapportFile, setRapportFile] = useState<File | null>(null);
  const [motifDerogation, setMotifDerogation] = useState('');
  const [publicationsCount, setPublicationsCount] = useState<number>(1);
  const [communicationsCount, setCommunicationsCount] = useState<number>(2);

  // Formulaire Rattrapage
  const [rattrapageFile, setRattrapageFile] = useState<File | null>(null);

  // Document Viewer
  const [viewerDoc, setViewerDoc] = useState<{
    isOpen: boolean;
    type: TypeDocument;
    title: string;
    fileName: string;
  } | null>(null);

  if (!currentUser) return null;

  const dossierActif = getDossierActifCandidat(currentUser.id);
  const dossierN1 = getDossierN1Candidat(currentUser.id);

  // Vérifier si le dossier N-1 permet la réinscription directe
  const peutSeReinscrire = !!dossierN1 && (!dossierActif || dossierActif.annee_universitaire !== '2026/2027');
  const nouvelleAnneeDoctorat = dossierN1 ? dossierN1.annee_doctorat + 1 : 1;
  const estDerogationRequise = nouvelleAnneeDoctorat >= 4;

  const handleSubmitInscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSujetId) {
      setNotification({ type: 'danger', message: 'Veuillez sélectionner un sujet de thèse agréé.' });
      return;
    }

    const cinName = cinFile ? cinFile.name : `CIN_${currentUser.nom.replace(/\s+/g, '_')}.pdf`;
    const masterName = masterFile ? masterFile.name : 'Diplome_Master.pdf';
    const isMasterProvided = !masterManquant && !!masterFile;

    const res = soumettreInscription({
      id_sujet: Number(selectedSujetId),
      cinNom: cinName,
      masterFourni: isMasterProvided,
      masterNom: masterName
    });

    if (res.success) {
      setNotification({
        type: res.statut === 'Incomplet' ? 'warning' : 'success',
        message: res.message
      });
      setSelectedSujetId('');
      setCinFile(null);
      setMasterFile(null);
      setMasterManquant(false);
    } else {
      setNotification({ type: 'danger', message: res.message });
    }
  };

  const handleSubmitReinscription = (e: React.FormEvent) => {
    e.preventDefault();
    const rapportName = rapportFile ? rapportFile.name : `Rapport_Avancement_D${nouvelleAnneeDoctorat}.pdf`;

    const res = soumettreReinscription({
      rapportNom: rapportName,
      motifDerogation,
      publications: publicationsCount,
      communications: communicationsCount
    });

    if (res.success) {
      setNotification({
        type: res.estDerogataire ? 'warning' : 'success',
        message: res.message
      });
      setRapportFile(null);
      setMotifDerogation('');
    } else {
      setNotification({ type: 'danger', message: res.message });
    }
  };

  const handleRattrapageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossierActif) return;
    const masterName = rattrapageFile ? rattrapageFile.name : 'Master_Rattrapage.pdf';

    const res = rattrapagePiece(dossierActif.id, masterName);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
      setRattrapageFile(null);
    } else {
      setNotification({ type: 'danger', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-start justify-between shadow-xs border ${
            notification.type === 'danger'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'danger' && <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-4"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Bannière d'Alerte Rouge Clignotante E-mail & Chronomètre (Rattrapage J+5) */}
      {dossierActif && dossierActif.statut === 'Incomplet' && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white p-5 rounded-2xl shadow-xl border-2 border-rose-400 relative overflow-hidden animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="text-3xl p-2.5 bg-rose-950/80 rounded-xl border border-rose-500/50 shadow-inner shrink-0 flex items-center justify-center">
                <span>📩</span>
                <span className="ml-1">⏱️</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    Alerte Rattrapage J+5
                  </span>
                  <span className="text-xs font-mono text-rose-200">Dossier #{dossierActif.id}</span>
                </div>
                <h3 className="text-base font-black tracking-tight mt-1 text-white">
                  Action Requise : Dossier Incomplet (Diplôme de Master Manquant)
                </h3>
                <p className="text-xs text-rose-100 mt-1 leading-relaxed max-w-2xl">
                  Un e-mail officiel d'avertissement vous a été adressé à : <strong className="underline font-mono text-amber-300">{currentUser.email}</strong>
                  {dossierActif.date_notification_rattrapage && (
                    <span> (Envoyé le <span className="font-mono text-white font-bold">{dossierActif.date_notification_rattrapage}</span>)</span>
                  )}.
                  Vous disposez d'un délai impératif de <strong>5 jours ouvrés</strong> pour régulariser votre dossier avant le refus automatique par la fonction <code className="font-mono font-bold bg-rose-950/80 px-1.5 py-0.5 rounded text-amber-200">verifier_delais()</code>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
              <div className="bg-rose-950/90 border border-rose-400/60 p-2.5 rounded-xl text-center w-full sm:w-auto">
                <span className="text-[10px] uppercase tracking-wider text-rose-300 font-bold block">Date Limite de Rattrapage</span>
                <span className="text-sm font-black font-mono text-amber-300 block">{dossierActif.date_limite_rattrapage}</span>
              </div>

              <button
                onClick={() => {
                  const emailData = genererEmailRattrapage(dossierActif.id);
                  setEmailModalData(emailData);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Consulter l'e-mail officiel transmis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Calendar Milestone Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jalons & Fenêtres du Calendrier Doctoral USMBA
            </h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400">
            Date de référence : {simulationDate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {calendrier.map(phase => {
            const isOpened = simulationDate >= phase.date_ouverture && simulationDate <= phase.date_cloture;
            const isClosed = simulationDate > phase.date_cloture;
            return (
              <div
                key={phase.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                  isOpened
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-xs'
                    : isClosed
                    ? 'border-slate-200 bg-slate-50 opacity-75'
                    : 'border-blue-200 bg-blue-50/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full text-slate-600 bg-white border border-slate-200">
                      Phase #{phase.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOpened
                          ? 'bg-emerald-100 text-emerald-800'
                          : isClosed
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isOpened ? '● En cours' : isClosed ? 'Clôturée' : 'À venir'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 leading-snug">{phase.nom_phase}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{phase.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Période :</span>
                  <span className="font-bold text-blue-900">
                    {phase.date_ouverture} ➔ {phase.date_cloture}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CAS 1 : DOSSIER ACTIF POUR L'ANNÉE EN COURS (2026/2027) */}
      {dossierActif && dossierActif.annee_universitaire === '2026/2027' ? (
        <div className="space-y-5">
          {/* Composant Visuel de Progression : Fil d'Ariane / Stepper Interactif à 5 Niveaux */}
          <NiveauStepper
            niveauActuel={dossierActif.niveau_actuel}
            statut={dossierActif.statut}
          />

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">
                  Dossier Doctoral {dossierActif.annee_universitaire}
                </h2>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                    dossierActif.statut === 'Validé'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : dossierActif.statut === 'Incomplet'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                      : dossierActif.statut === 'Refusé'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  {dossierActif.statut}
                </span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {dossierActif.type_dossier} • {dossierActif.annee_doctorat}ère / ème Année (D{dossierActif.annee_doctorat})
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Sujet : <span className="font-bold text-slate-900">{dossierActif.sujet?.titre}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Directeur de Thèse : <span className="font-semibold">{dossierActif.directeur?.nom || dossierActif.sujet?.nom_directeur}</span>
              </p>
            </div>

            {/* Incomplete / Catch-Up Callout box J+5 */}
            {dossierActif.statut === 'Incomplet' && (
              <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-xl flex flex-col items-start gap-2 max-w-md">
                <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Complétude Administrative Requise (Rattrapage J+5)</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Votre dossier est en attente du diplôme de Master certifié. 
                  Date d'échéance impérative : <strong className="font-mono">{dossierActif.date_limite_rattrapage}</strong>.
                </p>

                {/* Formulaire de Rattrapage */}
                <form onSubmit={handleRattrapageSubmit} className="w-full mt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setRattrapageFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-200 file:text-rose-900 hover:file:bg-rose-300"
                  />
                  <button
                    type="submit"
                    className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition shrink-0"
                  >
                    Téléverser Master
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Documents du dossier */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Pièces Justificatives Associées au Dossier
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {dossierActif.documents && dossierActif.documents.length > 0 ? (
                dossierActif.documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() =>
                      setViewerDoc({
                        isOpen: true,
                        type: doc.type_piece,
                        title: doc.nom_original,
                        fileName: doc.chemin_fichier
                      })
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 rounded-xl text-xs font-medium transition shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>{doc.nom_original}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {doc.type_piece}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Aucune pièce justificative archivée.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      ) : peutSeReinscrire ? (
        /* CAS 2 : DOCTORANT N-1 VALIDÉ -> WORKFLOW DE RÉINSCRIPTION OPTIMISÉ (0 SAISIE) */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                <CheckCircle className="w-3 h-3" /> Dossier N-1 Validé Détecté
              </span>
              <span className="text-xs text-slate-400">Promotion {dossierN1?.annee_universitaire}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Campagne de Réinscription Doctorale 2026/2027
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Workflow optimisé à <strong>0 ressaisie</strong> : Vos données académiques et votre sujet de thèse sont automatiquement hérités et verrouillés.
            </p>
          </div>

          {/* Détection Dérogation si annee_doctorat >= 4 */}
          {estDerogationRequise && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Procédure de Dérogation Enclenchée Automatiquement (Année {nouvelleAnneeDoctorat} ≥ 4)
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Le cycle doctoral réglementaire à l'USMBA est de 3 ans. Votre réinscription en <strong>{nouvelleAnneeDoctorat}ème année</strong> constitue une dérogation. 
                Le système transmettra automatiquement votre dossier en commission de dérogation du Conseil de Pôle Doctoral avec obligation d'avis motivé du CAT et du Directeur.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmitReinscription} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Nom & Prénom (Données Verrouillées N-1)
                </label>
                <input
                  type="text"
                  value={currentUser.nom}
                  disabled
                  className="mt-1 w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  CIN (Données Verrouillées N-1)
                </label>
                <input
                  type="text"
                  value={currentUser.cin}
                  disabled
                  className="mt-1 w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm font-mono font-semibold cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Intitulé du Sujet de Thèse Déposé (Verrouillé)
                </label>
                <input
                  type="text"
                  value={dossierN1?.sujet?.titre || 'IA et Télédétection appliquée aux bassins hydrauliques du Sebou'}
                  disabled
                  className="mt-1 w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Directeur de Thèse</label>
                <input
                  type="text"
                  value={dossierN1?.directeur?.nom || 'Pr. Alami Driss'}
                  disabled
                  className="mt-1 w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 uppercase">
                  Année de Doctorat Calculée Automatiquement
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-full bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-2.5 text-sm font-black font-mono">
                    {nouvelleAnneeDoctorat}ème Année (D{nouvelleAnneeDoctorat})
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">Formule : N-1 ({dossierN1?.annee_doctorat}) + 1</span>
                </div>
              </div>
            </div>

            {/* Bilan scientifique de l'année */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Activités de Recherche & Rayonnement Réalisés dans l'Année
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Articles scientifiques publiés ou soumis (Scopus / Web of Science) :
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={publicationsCount}
                    onChange={e => setPublicationsCount(Number(e.target.value))}
                    className="mt-1 w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Communications orales ou posters dans des congrès :
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={communicationsCount}
                    onChange={e => setCommunicationsCount(Number(e.target.value))}
                    className="mt-1 w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold"
                  />
                </div>
              </div>

              {estDerogationRequise && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-amber-900">
                    Justification détaillée de la demande de dérogation (Obligatoire pour Année {nouvelleAnneeDoctorat}) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={motifDerogation}
                    onChange={e => setMotifDerogation(e.target.value)}
                    placeholder="Précisez l'état d'avancement de la rédaction du manuscrit, les expérimentations restantes et le calendrier prévisionnel de soutenance..."
                    className="mt-1 w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Dépôt du Rapport d'avancement annuel */}
            <div className="p-4 bg-blue-50/60 rounded-xl border-2 border-dashed border-blue-300 space-y-2">
              <label className="block text-sm font-bold text-blue-950">
                Dépôt du Rapport Annuel d'Avancement (PDF Obligatoire) *
              </label>
              <p className="text-xs text-slate-600">
                Le rapport doit être contresigné par le Directeur de Thèse et synthétiser les résultats obtenus.
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setRapportFile(e.target.files ? e.target.files[0] : null)}
                className="mt-2 block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Valider et Soumettre ma Réinscription en {nouvelleAnneeDoctorat}ème Année</span>
            </button>
          </form>
        </div>
      ) : (
        /* CAS 3 : INSCRIPTION INITIALE (NOUVEAU CANDIDAT) */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Session 2026/2027
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Dossier de Première Inscription en Doctorat (1ère Année)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Workflow d'entrée à deux régions orthogonales : <strong>Complétude administrative</strong> (pièces d'identité & diplômes) vs <strong>Parcours candidat</strong> (Sujet de recherche agréé).
            </p>
          </div>

          <form onSubmit={handleSubmitInscription} className="space-y-6">
            {/* RÉGION 1 : PARCOURS CANDIDAT & SUJET VALIDÉ */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <BookOpen className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Région 1 : Parcours Candidat & Sujet de Thèse Validé
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Sélectionnez le Sujet de Thèse Validé par le Centre d'Études Doctorales (CED) *
                </label>
                <select
                  required
                  value={selectedSujetId}
                  onChange={e => setSelectedSujetId(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  <option value="">-- Choisissez un sujet parmi la liste agréée --</option>
                  {sujets.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.titre} — Encadrant : {s.nom_directeur} ({s.statut})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSujetId && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-blue-950 block">Descriptif du laboratoire d'accueil :</span>
                  <p className="text-slate-600 mt-0.5">
                    {sujets.find(s => s.id === selectedSujetId)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* RÉGION 2 : COMPLÉTUDE ADMINISTRATIVE & CHECK-LIST */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Région 2 : Complétude Administrative & Pièces Justificatives
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pièce 1 : CIN */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Copie de la Carte Nationale d'Identité (CIN) *
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Recto-verso en un seul fichier (PDF, PNG ou JPEG).
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => setCinFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700"
                  />
                </div>

                {/* Pièce 2 : Diplôme Master */}
                <div className={`p-4 rounded-xl border space-y-2 transition ${
                  masterManquant ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
                }`}>
                  <label className="block text-xs font-bold text-slate-800">
                    Diplôme de Master ou Attestation de Réussite Définitive
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Délivré par un établissement d'enseignement supérieur accrédité.
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={masterManquant}
                    onChange={e => setMasterFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-900 disabled:opacity-50"
                  />

                  {/* Toggle Rattrapage simulation */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-amber-900 font-semibold">
                      <input
                        type="checkbox"
                        checked={masterManquant}
                        onChange={e => setMasterManquant(e.target.checked)}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>
                        Simuler : Diplôme non disponible à la soumission (Attestation en cours).
                        <span className="block text-[11px] text-amber-700 font-normal">
                          Active la règle métier : Statut <strong>Incomplet</strong> + délai de rattrapage J+5.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Déposer ma Candidature Doctorale</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        </div>
      )}

      {/* Embedded Document Viewer */}
      {viewerDoc && (
        <DocumentViewerModal
          isOpen={viewerDoc.isOpen}
          onClose={() => setViewerDoc(null)}
          type={viewerDoc.type}
          title={viewerDoc.title}
          candidateName={currentUser.nom}
          cin={currentUser.cin}
          subjectTitle={dossierActif?.sujet?.titre}
          fileName={viewerDoc.fileName}
        />
      )}

      {/* Embedded Email Viewer Modal */}
      <EmailViewerModal
        email={emailModalData}
        isOpen={!!emailModalData}
        onClose={() => setEmailModalData(null)}
      />
    </div>
  );
};
