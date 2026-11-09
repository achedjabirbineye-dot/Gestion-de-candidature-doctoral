import React, { useState } from 'react';
import { useGcd } from '../context/GcdContext';
import { DossierStatut, TypeDossier } from '../types';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  ShieldAlert,
  Save,
  Layers,
  Eye,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { FicheSynthetiqueDrawer } from './FicheSynthetiqueDrawer';
import { NIVEAUX_DETAILS, NIVEAUX_ORDER } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    dossiers,
    sujets,
    utilisateurs,
    calendrier,
    changerStatutDossier,
    avancerNiveau,
    validerEnBatch,
    verifierDelais,
    modifierCalendrier,
    simulationDate,
    setSimulationDate,
    getDossierEnrichi
  } = useGcd();

  const [filtreStatut, setFiltreStatut] = useState<string>('Tous');
  const [filtreType, setFiltreType] = useState<string>('Tous');
  const [recherche, setRecherche] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [drawerDossierId, setDrawerDossierId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Édition calendrier
  const [editingCalendarId, setEditingCalendarId] = useState<number | null>(null);
  const [calDateOuverture, setCalDateOuverture] = useState('');
  const [calDateCloture, setCalDateCloture] = useState('');

  // Notification d'action
  const [feedback, setFeedback] = useState<string | null>(null);

  const role = currentUser?.role;

  // Filtrage selon le rôle :
  // Si le rôle est "directeur_these", isoler uniquement les dossiers dont le sujet lui appartient
  let dossiersFiltres = dossiers.map(d => getDossierEnrichi(d.id)!);

  if (role === 'directeur_these') {
    dossiersFiltres = dossiersFiltres.filter(
      d => d.sujet?.id_directeur === currentUser?.id || d.directeur?.id === currentUser?.id
    );
  }

  // Filtrage par statut
  if (filtreStatut !== 'Tous') {
    dossiersFiltres = dossiersFiltres.filter(d => d.statut === filtreStatut);
  }

  // Filtrage par type (Inscription vs Réinscription)
  if (filtreType !== 'Tous') {
    dossiersFiltres = dossiersFiltres.filter(d => d.type_dossier === filtreType);
  }

  // Filtrage recherche
  if (recherche.trim() !== '') {
    const q = recherche.toLowerCase();
    dossiersFiltres = dossiersFiltres.filter(
      d =>
        d.candidat?.nom.toLowerCase().includes(q) ||
        d.candidat?.cin.toLowerCase().includes(q) ||
        d.sujet?.titre.toLowerCase().includes(q) ||
        d.id.toString().includes(q)
    );
  }

  // Calcul KPI
  const stats = {
    total: dossiers.length,
    incomplets: dossiers.filter(d => d.statut === 'Incomplet').length,
    valides: dossiers.filter(d => d.statut === 'Validé').length,
    derogations: dossiers.filter(d => d.annee_doctorat >= 4 || d.rapport?.demande_derogation).length,
    enCours: dossiers.filter(d => d.statut === 'En cours').length
  };

  const handleSelectAll = () => {
    if (selectedIds.length === dossiersFiltres.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dossiersFiltres.map(d => d.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBatchValidate = () => {
    if (selectedIds.length === 0) return;
    const count = validerEnBatch(selectedIds);
    setFeedback(`${count} dossier(s) validé(s) avec succès par validation groupée.`);
    setSelectedIds([]);
  };

  const handleExecuterVerifierDelais = () => {
    const res = verifierDelais();
    if (res.refuses > 0) {
      setFeedback(`Logique Timeout exécutée : ${res.refuses} dossier(s) incomplet(s) ayant dépassé l'échéance de rattrapage basculé(s) à 'Refusé'.`);
    } else {
      setFeedback(`Logique Timeout exécutée : Aucun dossier incomplet n'a dépassé son échéance de rattrapage (Date courante : ${simulationDate}).`);
    }
  };

  const handleStartEditCal = (id: number, ouv: string, clot: string) => {
    setEditingCalendarId(id);
    setCalDateOuverture(ouv);
    setCalDateCloture(clot);
  };

  const handleSaveCal = (id: number) => {
    modifierCalendrier(id, calDateOuverture, calDateCloture);
    setEditingCalendarId(null);
    setFeedback('Paramétrage de la phase du calendrier doctoral mis à jour.');
  };

  const handleOpenFiche = (id: number) => {
    setDrawerDossierId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-blue-500 hover:text-blue-700">
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Dossiers</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Incomplets (Rattrapage J+5)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-600">{stats.incomplets}</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Validés Définitivement</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">{stats.valides}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Dérogations (D ≥ 4)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{stats.derogations}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">En Cours d'Instruction</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-800">{stats.enCours}</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Calendar Window Administration (Admin & Pôle Doctoral only) */}
      {(role === 'admin' || role === 'pole_doctoral') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-900" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Paramétrage des Fenêtres du Calendrier Doctoral GCD
              </h3>
            </div>
            <button
              onClick={handleExecuterVerifierDelais}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition shadow-xs"
              title="Vérifie et bascule en 'Refusé' tout dossier incomplet dont l'échéance J+5 est dépassée"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              Exécuter verifier_delais() (Logique Timeout)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {calendrier.map(phase => (
              <div key={phase.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 line-clamp-1">{phase.nom_phase}</span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">#{phase.id}</span>
                </div>

                {editingCalendarId === phase.id ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Ouverture</label>
                        <input
                          type="date"
                          value={calDateOuverture}
                          onChange={e => setCalDateOuverture(e.target.value)}
                          className="w-full text-xs p-1 border rounded bg-white"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Clôture</label>
                        <input
                          type="date"
                          value={calDateCloture}
                          onChange={e => setCalDateCloture(e.target.value)}
                          className="w-full text-xs p-1 border rounded bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingCalendarId(null)}
                        className="px-2 py-0.5 text-[10px] text-slate-600 bg-slate-200 rounded"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleSaveCal(phase.id)}
                        className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] bg-blue-900 text-white font-bold rounded"
                      >
                        <Save className="w-3 h-3" /> Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[11px] text-blue-900 font-bold">
                      {phase.date_ouverture} ➔ {phase.date_cloture}
                    </span>
                    <button
                      onClick={() => handleStartEditCal(phase.id, phase.date_ouverture, phase.date_cloture)}
                      className="text-[11px] font-bold text-blue-800 hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls / Filters Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher candidat, CIN, sujet..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Filter Statut */}
            <select
              value={filtreStatut}
              onChange={e => setFiltreStatut(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium bg-white"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="Incomplet">Incomplet (Rattrapage J+5)</option>
              <option value="Validé">Validé</option>
              <option value="Refusé">Refusé</option>
            </select>

            {/* Filter Type */}
            <select
              value={filtreType}
              onChange={e => setFiltreType(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium bg-white"
            >
              <option value="Tous">Tous les types</option>
              <option value="Inscription">Inscription (1ère Année)</option>
              <option value="Reinscription">Réinscription (D2, D3, D4+)</option>
            </select>
          </div>

          {/* Batch Actions */}
          {(role === 'admin' || role === 'pole_doctoral') && (
            <div className="flex items-center gap-2">
              <button
                disabled={selectedIds.length === 0}
                onClick={handleBatchValidate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Valider la Sélection ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                {(role === 'admin' || role === 'pole_doctoral') && (
                  <th className="p-3 w-8">
                    <button onClick={handleSelectAll} className="text-slate-500">
                      {selectedIds.length > 0 && selectedIds.length === dossiersFiltres.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-3">ID</th>
                <th className="p-3">Candidat</th>
                <th className="p-3">CIN</th>
                <th className="p-3">Type & Année</th>
                <th className="p-3">Sujet de Thèse</th>
                <th className="p-3">Niveau Administratif Actuel</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions Métier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dossiersFiltres.length > 0 ? (
                dossiersFiltres.map(d => {
                  const isIncomplet = d.statut === 'Incomplet';
                  const isDerogataire = d.annee_doctorat >= 4 || d.rapport?.demande_derogation;

                  return (
                    <tr
                      key={d.id}
                      className={`transition ${
                        isIncomplet
                          ? 'bg-rose-50/80 border-l-4 border-rose-600 hover:bg-rose-100/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {(role === 'admin' || role === 'pole_doctoral') && (
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleSelect(d.id)}
                            className="text-slate-500 hover:text-blue-900"
                          >
                            {selectedIds.includes(d.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-900" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="p-3 font-mono font-bold text-slate-600">#{d.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{d.candidat?.nom}</div>
                        <div className="text-slate-400 font-normal text-[11px]">{d.candidat?.email}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{d.candidat?.cin}</td>
                      <td className="p-3">
                        <span className="inline-block bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          {d.type_dossier} • D{d.annee_doctorat}
                        </span>
                        {isDerogataire && (
                          <span className="block mt-0.5 text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                            ⚠️ Dérogation
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs truncate" title={d.sujet?.titre}>
                        <div className="font-medium text-slate-900 truncate">{d.sujet?.titre}</div>
                        <div className="text-[10px] text-slate-400">Dir : {d.directeur?.nom || d.sujet?.nom_directeur}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 font-bold text-[11px] px-2.5 py-1 rounded-lg border ${
                            d.statut === 'Validé'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : d.niveau_actuel === '5_DECISION_POLE_DOCTORAL'
                              ? 'bg-purple-50 text-purple-900 border-purple-300'
                              : d.niveau_actuel === '4_COMMISSION_CED'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                              : d.niveau_actuel === '3_VALIDATION_LABO_STRUCTURE'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : d.niveau_actuel === '2_AVIS_DIRECTEUR_THESE'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            <span className="font-mono text-[10px] bg-white/90 px-1.5 py-0.2 rounded font-black border border-slate-200">
                              {NIVEAUX_DETAILS[d.niveau_actuel]?.numero || 1}/5
                            </span>
                            <span className="font-semibold">{NIVEAUX_DETAILS[d.niveau_actuel]?.nomCourt || d.niveau_actuel}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1 truncate">
                          {NIVEAUX_DETAILS[d.niveau_actuel]?.instance}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                            d.statut === 'Validé'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : d.statut === 'Incomplet'
                              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                              : d.statut === 'Refusé'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          {d.statut}
                        </span>
                        {isIncomplet && d.date_limite_rattrapage && (
                          <span className="block text-[10px] text-rose-700 font-mono mt-0.5 font-bold">
                            Échéance : {d.date_limite_rattrapage}
                          </span>
                        )}
                        {isIncomplet && d.date_notification_rattrapage && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-mono mt-0.5"
                            title={`Notification envoyée le ${d.date_notification_rattrapage}`}
                          >
                            📩 Notifié {d.date_notification_rattrapage.slice(5, 16)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {/* Bouton Fiche Synthétique (Tiroir Latéral JS) */}
                        <button
                          onClick={() => handleOpenFiche(d.id)}
                          className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-2.5 py-1.5 rounded shadow-xs text-xs transition inline-flex items-center gap-1"
                          title="Consulter la Fiche Synthétique consolidée"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Fiche</span>
                        </button>

                        {/* Bouton d'action : Transmettre au niveau suivant (➜) */}
                        {d.statut !== 'Validé' && d.statut !== 'Refusé' && (
                          <button
                            onClick={() => {
                              const res = avancerNiveau(d.id);
                              setFeedback(res.message);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded shadow-xs text-xs transition inline-flex items-center gap-1"
                            title="Transmettre au niveau d'instruction supérieur (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5)"
                          >
                            <span>Niveau Suivant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Actions rapides Pôle Doctoral */}
                        {(role === 'admin' || role === 'pole_doctoral') && (
                          <>
                            {d.statut !== 'Validé' && (
                              <button
                                onClick={() => changerStatutDossier(d.id, 'Validé')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded shadow-xs text-xs transition"
                                title="Valider définitivement le dossier (Niveau 5/5)"
                              >
                                ✓
                              </button>
                            )}
                            {d.statut !== 'Refusé' && (
                              <button
                                onClick={() => changerStatutDossier(d.id, 'Refusé')}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded shadow-xs text-xs transition"
                                title="Refuser le dossier"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Aucun dossier ne correspond aux filtres actuels.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Fiche Synthétique */}
      <FicheSynthetiqueDrawer
        dossierId={drawerDossierId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
