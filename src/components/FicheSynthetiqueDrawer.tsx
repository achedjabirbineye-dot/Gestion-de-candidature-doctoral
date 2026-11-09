import React, { useState } from 'react';
import { DossierInscription, AvisCAT, AvisDirecteur, DossierStatut, TypeDocument, NotificationEmail } from '../types';
import { useGcd } from '../context/GcdContext';
import {
  X,
  User,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare,
  ArrowRight,
  Mail,
  RefreshCw
} from 'lucide-react';
import { DocumentViewerModal } from './DocumentViewerModal';
import { EmailViewerModal } from './EmailViewerModal';
import { NiveauStepper } from './NiveauStepper';

interface FicheSynthetiqueDrawerProps {
  dossierId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FicheSynthetiqueDrawer: React.FC<FicheSynthetiqueDrawerProps> = ({
  dossierId,
  isOpen,
  onClose
}) => {
  const {
    getDossierEnrichi,
    currentUser,
    changerStatutDossier,
    avancerNiveau,
    mettreAJourAvisDirecteur,
    mettreAJourAvisCAT,
    genererEmailRattrapage,
    renvoyerNotificationRattrapage
  } = useGcd();

  const [viewerDoc, setViewerDoc] = useState<{
    isOpen: boolean;
    type: TypeDocument;
    title: string;
    fileName: string;
  } | null>(null);

  const [emailModalData, setEmailModalData] = useState<NotificationEmail | null>(null);

  const [dirComment, setDirComment] = useState('');
  const [catComment, setCatComment] = useState('');

  if (!isOpen || !dossierId) return null;

  const dossier = getDossierEnrichi(dossierId);
  if (!dossier) return null;

  const isDerogataire = dossier.annee_doctorat >= 4 || !!dossier.rapport?.demande_derogation;
  const role = currentUser?.role;

  const handleOpenDoc = (type: TypeDocument, title: string, fileName: string) => {
    setViewerDoc({
      isOpen: true,
      type,
      title,
      fileName
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-sm">
              FICHE
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Fiche Synthétique Candidat</h3>
              <p className="text-xs text-blue-200 font-mono">Dossier N° #{dossier.id} • {dossier.annee_universitaire}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 bg-slate-50/50">
          {/* Stepper Interactif à 5 Niveaux */}
          <NiveauStepper
            niveauActuel={dossier.niveau_actuel}
            statut={dossier.statut}
          />

          {/* Status & Priority Ribbon */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Statut Actuel</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    dossier.statut === 'Validé'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : dossier.statut === 'Incomplet'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                      : dossier.statut === 'Refusé'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  {dossier.statut}
                </span>
                <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {dossier.type_dossier} (D{dossier.annee_doctorat})
                </span>
              </div>
            </div>

            {dossier.statut === 'Incomplet' && dossier.date_limite_rattrapage && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Échéance J+5</span>
                <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-600" />
                  {dossier.date_limite_rattrapage}
                </span>
              </div>
            )}
          </div>

          {/* Derogation Warning */}
          {isDerogataire && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Dossier Dérogatoire (Année {dossier.annee_doctorat} ≥ 4)
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Le cycle doctoral réglementaire est de 3 ans. Conformément aux dispositions de l'USMBA, 
                cette réinscription en D{dossier.annee_doctorat} est assujettie à l'approbation conjointe du Directeur de Thèse, 
                du CAT et du Conseil du Pôle Doctoral.
              </p>
              {dossier.rapport?.motif_derogation && (
                <div className="mt-2 p-2 bg-white/70 rounded border border-amber-200 text-xs font-medium text-slate-800">
                  <span className="font-bold text-amber-900">Motif invoqué :</span> {dossier.rapport.motif_derogation}
                </div>
              )}
            </div>
          )}

          {/* Incomplete Warning & Email Proof */}
          {dossier.statut === 'Incomplet' && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Complétude Administrative en Attente (Délai J+5)
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                Le dossier ne comporte pas le diplôme de Master certifié. Un délai de rattrapage impératif de 5 jours est en cours.
                Si la pièce n'est pas régularisée avant le <strong className="font-mono bg-rose-100 px-1.5 py-0.5 rounded text-rose-900">{dossier.date_limite_rattrapage}</strong>, 
                le système automatique <code className="font-mono font-bold text-rose-950">verifier_delais()</code> basculera le dossier en "Refusé".
              </p>

              {/* Accusé / Preuve de notification e-mail */}
              <div className="p-3 bg-white/90 rounded-lg border border-rose-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                      <Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 block">
                        Preuve de Notification Réglementaire :
                      </span>
                      {dossier.date_notification_rattrapage ? (
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>
                            E-mail de relance transmis le <strong className="font-mono text-slate-900">{dossier.date_notification_rattrapage}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 flex items-center gap-1.5 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline" />
                          <span>Notification e-mail en attente d'expédition</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const email = genererEmailRattrapage(dossier.id);
                        if (email) setEmailModalData(email);
                      }}
                      className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                      title="Consulter l'e-mail officiel avec en-têtes et corps"
                    >
                      <Mail className="w-3 h-3 text-amber-400" />
                      Voir l'e-mail
                    </button>
                    {(role === 'pole_doctoral' || role === 'admin') && (
                      <button
                        onClick={() => {
                          renvoyerNotificationRattrapage(dossier.id);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-300 transition"
                        title="Renvoyer un e-mail de relance au candidat"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Renvoyer
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-rose-100 pt-1.5">
                  <span>Destinataire officiel : <strong className="font-mono text-slate-700">{dossier.candidat?.email}</strong></span>
                  <span className="font-semibold text-rose-700">Accusé système archivé</span>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Profile */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-900" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Identité du Candidat</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Nom Complet</span>
                <span className="font-bold text-slate-900 text-sm">{dossier.candidat?.nom}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">CIN</span>
                <span className="font-mono font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {dossier.candidat?.cin}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">E-mail Institutionnel</span>
                <span className="text-slate-700 font-medium break-all">{dossier.candidat?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Téléphone</span>
                <span className="font-mono text-slate-700">{dossier.candidat?.telephone || 'Non renseigné'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold block">Établissement & Filière</span>
                <span className="text-slate-700 font-medium">{dossier.candidat?.etablissement}</span>
              </div>
            </div>
          </div>

          {/* Subject & Research Lab */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-blue-900" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Projet de Recherche & Encadrement</h4>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Intitulé du Sujet</span>
                <p className="font-bold text-slate-900 leading-snug mt-0.5">{dossier.sujet?.titre}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                {dossier.sujet?.description}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 font-semibold block">Directeur de Thèse</span>
                  <span className="font-bold text-slate-800">{dossier.directeur?.nom || dossier.sujet?.nom_directeur}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{dossier.directeur?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Laboratoire / CED</span>
                  <span className="font-medium text-slate-800">{dossier.sujet?.laboratoire}</span>
                  <span className="text-[11px] text-blue-800 font-medium block">{dossier.sujet?.ced}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Opinions (Directeur & CAT) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Avis Académiques & Gouvernance</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Avis Directeur */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Avis Directeur de Thèse</span>
                <span
                  className={`mt-1 inline-block font-bold text-[11px] px-2 py-0.5 rounded ${
                    dossier.rapport?.avis_directeur === 'Favorable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : dossier.rapport?.avis_directeur === 'Défavorable'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dossier.rapport?.avis_directeur || 'En attente'}
                </span>
                {dossier.rapport?.commentaire_directeur && (
                  <p className="text-[11px] text-slate-600 italic mt-1">"{dossier.rapport.commentaire_directeur}"</p>
                )}

                {/* Formulaire si rôle directeur */}
                {(role === 'directeur_these' || role === 'admin') && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex gap-1">
                    <button
                      onClick={() => mettreAJourAvisDirecteur(dossier.id, 'Favorable', dirComment || 'Avis favorable')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      Avis Favorable
                    </button>
                    <button
                      onClick={() => mettreAJourAvisDirecteur(dossier.id, 'Défavorable', dirComment || 'Avis défavorable')}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      Défavorable
                    </button>
                  </div>
                )}
              </div>

              {/* Avis CAT */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Avis Commission CAT</span>
                <span
                  className={`mt-1 inline-block font-bold text-[11px] px-2 py-0.5 rounded ${
                    dossier.rapport?.avis_cat === 'Favorable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : dossier.rapport?.avis_cat === 'Ajourné'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {dossier.rapport?.avis_cat || 'En attente'}
                </span>
                {dossier.rapport?.commentaire_cat && (
                  <p className="text-[11px] text-slate-600 italic mt-1">"{dossier.rapport.commentaire_cat}"</p>
                )}

                {/* Formulaire si rôle CAT */}
                {(role === 'cat' || role === 'admin') && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex gap-1">
                    <button
                      onClick={() => mettreAJourAvisCAT(dossier.id, 'Favorable', catComment || 'Validé en commission CAT')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      Favorable
                    </button>
                    <button
                      onClick={() => mettreAJourAvisCAT(dossier.id, 'Ajourné', catComment || 'Travaux complémentaires demandés')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      Ajourné
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Pièces Justificatives Déposées</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {dossier.documents?.length || 0} document(s)
              </span>
            </div>

            <div className="space-y-2">
              {dossier.documents && dossier.documents.length > 0 ? (
                dossier.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 transition text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="p-1.5 bg-blue-100 text-blue-900 rounded font-mono text-[10px] font-bold">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800 block truncate">{doc.nom_original}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.type_piece} • {doc.taille || '1.5 Mo'} • {doc.date_upload}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleOpenDoc(
                          doc.type_piece,
                          doc.nom_original,
                          doc.chemin_fichier
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] rounded transition shadow-xs whitespace-nowrap"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Consulter
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center border-2 border-dashed border-rose-200 rounded-lg bg-rose-50/50">
                  <p className="text-xs text-rose-700 font-semibold">Aucune pièce justificative enregistrée.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Dossier incomplet au niveau du dépôt initial.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(role === 'pole_doctoral' || role === 'admin') && (
              <>
                {dossier.statut !== 'Validé' && dossier.statut !== 'Refusé' && (
                  <button
                    onClick={() => {
                      avancerNiveau(dossier.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    title="Transmettre au niveau administratif supérieur"
                  >
                    <span>Transmettre Niveau Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {dossier.statut !== 'Validé' && (
                  <button
                    onClick={() => {
                      changerStatutDossier(dossier.id, 'Validé');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider Définitivement (Niv 5)
                  </button>
                )}

                {dossier.statut !== 'Refusé' && (
                  <button
                    onClick={() => {
                      changerStatutDossier(dossier.id, 'Refusé');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </button>
                )}

                {dossier.statut !== 'Incomplet' && (
                  <button
                    onClick={() => {
                      changerStatutDossier(dossier.id, 'Incomplet');
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    title="Déclencher un rattrapage de 5 jours"
                  >
                    <Clock className="w-4 h-4" />
                    Mettre en Incomplet (J+5)
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition"
          >
            Fermer
          </button>
        </div>
      </aside>

      {/* Embedded Document Viewer Modal */}
      {viewerDoc && (
        <DocumentViewerModal
          isOpen={viewerDoc.isOpen}
          onClose={() => setViewerDoc(null)}
          type={viewerDoc.type}
          title={viewerDoc.title}
          candidateName={dossier.candidat?.nom}
          cin={dossier.candidat?.cin}
          subjectTitle={dossier.sujet?.titre}
          fileName={viewerDoc.fileName}
        />
      )}

      {/* Embedded Official Notification Email Viewer */}
      <EmailViewerModal
        isOpen={!!emailModalData}
        onClose={() => setEmailModalData(null)}
        email={emailModalData}
      />
    </>
  );
};
