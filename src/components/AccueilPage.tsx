import React, { useState } from 'react';
import { useGcd } from '../context/GcdContext';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Users,
  Building,
  Mail,
  Award,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

interface AccueilPageProps {
  onNavigerVers: (vue: 'accueil' | 'candidat' | 'admin' | 'sujets') => void;
  onOpenSourceModal: () => void;
}

export const AccueilPage: React.FC<AccueilPageProps> = ({ onNavigerVers, onOpenSourceModal }) => {
  const {
    currentUser,
    sujets,
    dossiers,
    calendrier,
    utilisateurs,
    switchUser,
    simulationDate,
    setSimulationDate
  } = useGcd();

  const [domaineFiltre, setDomaineFiltre] = useState<string>('Tous');
  const [rechercheSujet, setRechercheSujet] = useState<string>('');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'candidats' | 'encadrants' | 'gouvernance'>('candidats');

  // Sujets filtrés
  const sujetsFiltres = sujets.filter(s => {
    const matchDomaine =
      domaineFiltre === 'Tous' ||
      (domaineFiltre === 'IA & Informatique' && (s.titre.includes('IA') || s.titre.includes('IoT') || s.titre.includes('Langage'))) ||
      (domaineFiltre === 'Énergie & Environnement' && (s.titre.includes('Hydrauliques') || s.titre.includes('Électriques') || s.titre.includes('Dessalement') || s.titre.includes('argiles'))) ||
      (domaineFiltre === 'Économie & Gestion' && s.titre.includes('Économie'));

    const matchRecherche =
      s.titre.toLowerCase().includes(rechercheSujet.toLowerCase()) ||
      (s.laboratoire || '').toLowerCase().includes(rechercheSujet.toLowerCase()) ||
      (s.nom_directeur || '').toLowerCase().includes(rechercheSujet.toLowerCase());

    return matchDomaine && matchRecherche;
  });

  // Calcul statistiques
  const totalSujets = sujets.length;
  const sujetsDisponibles = sujets.filter(s => s.statut === 'Disponible').length;
  const totalDossiers = dossiers.length;
  const dossiersValides = dossiers.filter(d => d.statut === 'Validé').length;
  const dossiersDerogatoires = dossiers.filter(d => d.annee_doctorat >= 4).length;

  return (
    <div className="space-y-12 pb-12 animate-fade-in text-slate-800">
      {/* ========================================================================= */}
      {/* 1. HERO INSTITUTIONNEL MAJESTUEUX USMBA                                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl border-2 border-amber-500/40">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-10 lg:p-14 space-y-8">
          {/* Sceau & Kicker Institutionnel */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-800/60 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-xl shrink-0">
                <div className="w-full h-full bg-blue-950 rounded-[14px] flex items-center justify-center text-amber-400 font-serif font-black text-2xl border border-amber-400/40">
                  U
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  Royaume du Maroc • Université Sidi Mohamed Ben Abdellah de Fès
                </p>
                <h2 className="text-sm font-semibold text-blue-200">
                  Centre d'Études Doctorales (CED) & Pôle des Études Doctorales (PED)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-blue-200">
                Campagne Universitaire <strong className="text-white">2026 / 2027</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                ● Plateforme Ouverte
              </span>
            </div>
          </div>

          {/* Titre & Proposition de Valeur */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Portail Officiel de Gestion des Candidatures & Réinscriptions Doctorales
            </h1>
            <p className="text-sm sm:text-base text-blue-150 text-slate-300 leading-relaxed max-w-3xl font-normal">
              La plateforme numérique unifiée de l'USMBA orchestrant l'intégralité du cycle de vie du doctorant : 
              dépôt initial avec vérification administrative orthogonale, réinscription annuelle optimisée 
              « Zéro-Saisie » N-1, suivi transparent en 5 niveaux d'instruction et gouvernance académique collégiale.
            </p>
          </div>

          {/* Boutons d'Action Principaux */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigerVers('candidat')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <GraduationCap className="w-5 h-5 text-slate-950" />
              <span>Espace Candidat & Doctorant</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onNavigerVers('admin')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-900/80 hover:bg-blue-800 text-white font-bold rounded-xl text-sm border border-blue-700 shadow-md transition"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Back-Office Gouvernance & Pôle</span>
            </button>

            <a
              href="#catalogue-sujets"
              className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/15 transition"
            >
              <Search className="w-4 h-4 text-blue-300" />
              <span>Consulter les Sujets de Thèse</span>
            </a>
          </div>

          {/* Bandeau Indicateurs Clés Métier */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-blue-800/60">
            <div className="p-3.5 rounded-xl bg-blue-900/40 border border-blue-800/60">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Sujets de Recherche</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{totalSujets}</span>
                <span className="text-xs text-blue-200">thématiques accréditées</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-900/40 border border-blue-800/60">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Sujets Disponibles</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">{sujetsDisponibles}</span>
                <span className="text-xs text-blue-200">ouverts au concours</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-900/40 border border-blue-800/60">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Dossiers Instruits</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{totalDossiers}</span>
                <span className="text-xs text-blue-200">candidatures actives</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-900/40 border border-blue-800/60">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Workflow Niveaux</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-indigo-300">5/5</span>
                <span className="text-xs text-blue-200">étapes transparentes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LES DEUX PARCOURS DOCTORAUX MAJEURS                                    */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Réglementation & Modalités d'Admission
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Deux Parcours Distincts Selon Votre Situation Académique
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            L'USMBA garantit un traitement individualisé avec respect rigoureux des délais légaux et des instances d'arbitrage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parcours 1 : Nouvelle Inscription (1ère Année Doctorat - D1) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-black">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                  Doctorat 1ère Année (D1)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Nouvelle Candidature Initiale
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Destiné aux titulaires d'un Master, Diplôme d'Ingénieur d'État ou équivalent reconnu par le Ministère de l'Enseignement Supérieur.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Choix d'un sujet habilité</strong> parmi les laboratoires accrédités de l'USMBA.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Complétude Administrative Orthogonale</strong> : Dépôt simultané de la CIN et du Diplôme de Master certifié.</span>
                </div>
                <div className="flex items-start gap-2.5 text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Délai de grâce J+5 & Notification e-mail</strong> : En cas de pièce manquante, un délai strict de 5 jours est déclenché avant refus automatique par <code className="font-mono font-bold">verifier_delais()</code>.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  switchUser(4); // Youssef El Mansouri (Nouveau)
                  onNavigerVers('candidat');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <span>Déposer ma Candidature D1</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Parcours 2 : Réinscription Annuelle (D2, D3 & D4+ Dérogatoire) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  Réinscriptions (D2, D3, D4+)
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Réinscription Doctorale N-1 « Zéro-Saisie »
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Destiné aux doctorants déjà immatriculés à l'USMBA ayant validé leur année antérieure au Pôle Doctoral.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pré-remplissage automatique à 100%</strong> de l'ensemble des données d'état-civil, sujet et encadrement N-1.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Dépôt du Rapport Annuel d'Avancement</strong> pour examen par le Directeur de Thèse et le Comité CAT.</span>
                </div>
                <div className="flex items-start gap-2.5 text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Gestion des Dérogations (Années ≥ 4)</strong> : Cycle légal de 3 ans. Toute réinscription en D4+ impose une demande dérogatoire formelle soumise à l'arbitrage du Conseil du Pôle.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  switchUser(5); // Salma Bennani (Réinscription N-1)
                  onNavigerVers('candidat');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
              >
                <span>Effectuer ma Réinscription N-1 (Salma Bennani)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WORKFLOW TRANSPARENT EN 5 NIVEAUX SÉQUENTIELS                          */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Transparence Administrative & Gouvernance
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Le Workflow d'Instruction en 5 Niveaux de Traitement
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Conformément aux directives de l'Université Sidi Mohamed Ben Abdellah, chaque dossier franchit successivement 
            les 5 paliers académiques et administratifs, consultables en temps réel par le candidat et l'administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Palier 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-blue-50/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Entrée</span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">1. Dépôt Initial Candidat</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Téléversement des pièces justificatives. Contrôle strict de complétude et déclenchement éventuel du délai J+5.
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-900">Instance : Candidat & Scolarité</span>
          </div>

          {/* Palier 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-blue-50/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Avis Thèse</span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">2. Avis Directeur de Thèse</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Évaluation scientifique du candidat, analyse du rapport d'avancement pour les réinscriptions et émission de l'avis formel.
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-900">Instance : Directeur de Thèse</span>
          </div>

          {/* Palier 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-blue-50/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Structure</span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">3. Validation Structure Recherche</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Vérification de l'adéquation avec les axes scientifiques du laboratoire et disponibilité des équipements requis.
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-900">Instance : Direction du Laboratoire</span>
          </div>

          {/* Palier 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-blue-50/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Arbitrage</span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">4. Commission du CED & CAT</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Examen collégial des candidatures, avis du Comité d'Accompagnement de Thèse et instruction des demandes de dérogation D4+.
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-900">Instance : Commission CED & CAT</span>
          </div>

          {/* Palier 5 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-blue-50/50 transition">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                5
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Final</span>
            </div>
            <h4 className="font-bold text-xs text-slate-900">5. Décision Pôle Doctoral</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Validation administrative définitive par le Conseil du Pôle Doctoral et bascule automatique au statut "Validé".
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700">Instance : Conseil du Pôle Doctoral</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CALENDRIER OFFICIEL DES CAMPAGNES GCD 2026/2027                        */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Calendrier Réglementaire Universitaire
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Fenêtres Officielles de Dépôt et d'Instruction
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-blue-900" />
            <span>Date Système Actuelle :</span>
            <strong className="font-mono text-slate-900">{simulationDate}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calendrier.map((phase, idx) => {
            const isOuvert = simulationDate >= phase.date_ouverture && simulationDate <= phase.date_cloture;
            const isPasse = simulationDate > phase.date_cloture;

            return (
              <div
                key={phase.id}
                className={`p-5 rounded-2xl border text-xs space-y-3 transition ${
                  isOuvert
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100'
                    : isPasse
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">PHASE 0{idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      isOuvert
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isPasse
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {isOuvert ? 'En cours' : isPasse ? 'Clôturé' : 'À venir'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{phase.nom_phase}</h3>

                <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-600">
                  <div className="flex justify-between font-mono">
                    <span className="text-[11px] text-slate-400">Ouverture :</span>
                    <span className="font-bold text-slate-800">{phase.date_ouverture}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[11px] text-slate-400">Clôture :</span>
                    <span className="font-bold text-slate-800">{phase.date_cloture}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CATALOGUE DES SUJETS DE RECHERCHE ACCRÉDITÉS                           */}
      {/* ========================================================================= */}
      <section id="catalogue-sujets" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Laboratoires & Thématiques Accréditées
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Catalogue des Sujets de Thèse (Année 2026/2027)
            </h2>
          </div>

          {/* Recherche rapide */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={rechercheSujet}
              onChange={e => setRechercheSujet(e.target.value)}
              placeholder="Rechercher sujet, labo, encadrant..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        {/* Filtres par domaine */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs overflow-x-auto">
          {['Tous', 'IA & Informatique', 'Énergie & Environnement', 'Économie & Gestion'].map(dom => (
            <button
              key={dom}
              onClick={() => setDomaineFiltre(dom)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                domaineFiltre === dom
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Grille des Sujets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sujetsFiltres.map(sujet => {
            const isDispo = sujet.statut === 'Disponible';

            return (
              <div
                key={sujet.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">RÉF #{sujet.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isDispo
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {sujet.statut}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                    {sujet.titre}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {sujet.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Directeur de Thèse</span>
                      <span className="font-bold text-slate-800">{sujet.nom_directeur}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Structure & CED</span>
                      <span className="text-slate-700 font-medium line-clamp-1">{sujet.laboratoire}</span>
                      <span className="text-[11px] text-blue-900 font-semibold">{sujet.ced}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      switchUser(4); // Sélectionne le candidat
                      onNavigerVers('candidat');
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                      isDispo
                        ? 'bg-blue-900 hover:bg-blue-800 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isDispo ? 'Postuler sur ce sujet' : 'Consulter le dossier rattaché'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DÉMONSTRATEUR MULTI-PROFILS RBAC (ACCÈS EN 1 CLIC)                     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Espace de Test & Démonstration Immédiate
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Accédez Immédiatement à la Plateforme selon Votre Profil
            </h2>
          </div>
          <p className="text-xs text-blue-200 max-w-sm">
            Cliquez sur un profil préconfiguré pour explorer immédiatement les vues respectives de l'USMBA.
          </p>
        </div>

        {/* Onglets Profils */}
        <div className="flex items-center gap-1 bg-blue-950/80 p-1 rounded-xl border border-blue-800/80 text-xs w-fit">
          <button
            onClick={() => setSelectedRoleTab('candidats')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedRoleTab === 'candidats' ? 'bg-amber-500 text-slate-950' : 'text-blue-200 hover:text-white'
            }`}
          >
            Candidats & Doctorants (3)
          </button>
          <button
            onClick={() => setSelectedRoleTab('encadrants')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedRoleTab === 'encadrants' ? 'bg-amber-500 text-slate-950' : 'text-blue-200 hover:text-white'
            }`}
          >
            Directeur de Thèse & CAT (2)
          </button>
          <button
            onClick={() => setSelectedRoleTab('gouvernance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedRoleTab === 'gouvernance' ? 'bg-amber-500 text-slate-950' : 'text-blue-200 hover:text-white'
            }`}
          >
            Pôle Doctoral & Administration (2)
          </button>
        </div>

        {/* Grille des comptes selon onglet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedRoleTab === 'candidats' && (
            <>
              {/* Profil 1 : Youssef (Nouveau) */}
              <div
                onClick={() => {
                  switchUser(4);
                  onNavigerVers('candidat');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    D1
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                    Nouveau Dépôt
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    El Mansouri Youssef
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">youssef.candidat@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Candidat en 1ère année avec dossier complet déposé au niveau 3 (Validation Laboratoire).
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Se connecter en tant que Youssef</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Profil 2 : Salma (Réinscription N-1 Zéro saisie) */}
              <div
                onClick={() => {
                  switchUser(5);
                  onNavigerVers('candidat');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    D2
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                    Réinscription N-1
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Bennani Salma
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">salma.doctorante@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Doctorante D2 : pré-remplissage 100% N-1, rapport annuel d'avancement et avis CAT favorable.
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Se connecter en tant que Salma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Profil 3 : Amine (Incomplet J+5 & E-mail) */}
              <div
                onClick={() => {
                  switchUser(8);
                  onNavigerVers('candidat');
                }}
                className="p-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/40 hover:border-rose-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    📩
                  </span>
                  <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded">
                    Rattrapage J+5
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-rose-300 transition">
                    Chraibi Amine
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">amine.chraibi@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-rose-200 leading-snug">
                  Dossier Incomplet (Master manquant) : bannière d'alerte rouge, e-mail officiel transmis et délai de 5 jours.
                </p>
                <div className="pt-2 text-[11px] text-rose-300 font-bold flex items-center gap-1">
                  <span>Tester le cas Amine (Incomplet)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </>
          )}

          {selectedRoleTab === 'encadrants' && (
            <>
              {/* Profil Directeur de Thèse */}
              <div
                onClick={() => {
                  switchUser(1); // Pr. Alami Driss
                  onNavigerVers('admin');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    DIR
                  </span>
                  <span className="text-[10px] font-mono text-blue-200 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                    Encadrement
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Pr. Alami Driss
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">alami.directeur@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Directeur de thèse : évaluation scientifique, avis d'encadrement et consultation des rapports.
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Se connecter en tant que Pr. Alami</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Profil CAT */}
              <div
                onClick={() => {
                  switchUser(6); // Pr. Tahiri Mohamed
                  onNavigerVers('admin');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    CAT
                  </span>
                  <span className="text-[10px] font-mono text-indigo-200 font-bold bg-indigo-500/20 px-2 py-0.5 rounded">
                    Comité Thèse
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Pr. Tahiri Mohamed (CAT)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">cat.commission@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Membre du Comité d'Accompagnement : émission de l'avis collégial Favorable/Ajourné.
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Se connecter en tant que membre CAT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </>
          )}

          {selectedRoleTab === 'gouvernance' && (
            <>
              {/* Profil Pôle Doctoral */}
              <div
                onClick={() => {
                  switchUser(2); // Pôle Doctoral
                  onNavigerVers('admin');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    PED
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                    Gouvernance
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Directeur du Pôle Doctoral
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">pole.doctoral@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Arbitrage des dérogations D4+, transmission en lot et validation finale Niveau 5.
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Accéder à la Gouvernance du Pôle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Profil Administrateur Général */}
              <div
                onClick={() => {
                  switchUser(3); // Admin GCD
                  onNavigerVers('admin');
                }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 cursor-pointer transition space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                    ADM
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-500/20 px-2 py-0.5 rounded">
                    Système
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    Administrateur Général GCD
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">admin.gcd@usmba.ac.ma</p>
                </div>
                <p className="text-[11px] text-blue-200 leading-snug">
                  Paramétrage des fenêtres du calendrier doctoral et contrôle des timeouts verifier_delais().
                </p>
                <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span>Accéder à l'Administration Système</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ RÉGLEMENTAIRE & CONTACT INSTITUTIONNEL USMBA                        */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Aide & Réglementation Doctorale
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Foire Aux Questions & Cadre Juridique
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              Comment fonctionne le délai de rattrapage de 5 jours (J+5) ?
            </h4>
            <p className="leading-relaxed">
              Lors du dépôt, la complétude administrative est vérifiée orthogonalement. Si le diplôme de Master certifié est manquant, 
              le dossier est placé au statut <strong>Incomplet</strong> et un e-mail officiel est automatiquement expédié au candidat. 
              Un délai de rigueur de 5 jours est alors accordé avant que la procédure automatique <code className="font-mono font-bold">verifier_delais()</code> ne bascule le dossier en "Refusé".
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              Quelle est la procédure pour les dérogations en 4ème année et plus ?
            </h4>
            <p className="leading-relaxed">
              La durée réglementaire de préparation du doctorat à l'USMBA est de 3 ans. Toute réinscription en 4ème année ou plus (D4+) 
              est automatiquement identifiée comme <strong>dérogatoire</strong>. Elle requiert la production d'un motif motivé 
              dans le rapport d'avancement, visé conjointement par l'encadrant, le CAT et validé par le Conseil du Pôle Doctoral.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              En quoi consiste la réinscription « Zéro-Saisie » N-1 ?
            </h4>
            <p className="leading-relaxed">
              Pour éviter les ressaisies fastidieuses, la plateforme GCD recharge automatiquement l'ensemble des données administratives 
              de l'année précédente (sujet, directeur, CIN, laboratoire). Le doctorant n'a plus qu'à déposer son rapport annuel 
              d'avancement pour lancer l'instruction N+1.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              Comment contacter le Pôle des Études Doctorales ?
            </h4>
            <p className="leading-relaxed">
              Le Pôle des Études Doctorales est situé au Campus Universitaire Dhar El Mahraz, BP 1796 Fès-Atlas. 
              Pour toute assistance technique sur la plateforme GCD, écrivez à 
              <strong className="text-blue-950 font-mono"> pole.doctoral@usmba.ac.ma</strong> ou contactez le service scolarité de votre CED.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
