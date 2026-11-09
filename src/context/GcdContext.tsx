import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Utilisateur,
  Sujet,
  DossierInscription,
  DocumentItem,
  RapportAvancement,
  ParametreCalendrier,
  DossierStatut,
  AvisCAT,
  AvisDirecteur,
  NiveauAdministratif,
  NIVEAUX_ORDER,
  NIVEAUX_DETAILS,
  NotificationEmail
} from '../types';
import {
  INITIAL_UTILISATEURS,
  INITIAL_SUJETS,
  INITIAL_CALENDRIER,
  INITIAL_DOCUMENTS,
  INITIAL_RAPPORTS,
  INITIAL_DOSSIERS
} from '../data/seedData';

interface GcdContextType {
  currentUser: Utilisateur | null;
  utilisateurs: Utilisateur[];
  sujets: Sujet[];
  dossiers: DossierInscription[];
  documents: DocumentItem[];
  rapports: RapportAvancement[];
  calendrier: ParametreCalendrier[];
  simulationDate: string; // YYYY-MM-DD
  setSimulationDate: (date: string) => void;
  
  // Auth
  login: (email: string, mdp: string) => boolean;
  logout: () => void;
  switchUser: (id: number) => void;
  
  // Actions Candidat
  soumettreInscription: (params: {
    id_sujet: number;
    cinNom: string;
    cinTaille?: string;
    masterFourni: boolean;
    masterNom?: string;
    masterTaille?: string;
  }) => { success: boolean; message: string; statut: DossierStatut };
  
  soumettreReinscription: (params: {
    rapportNom: string;
    rapportTaille?: string;
    motifDerogation?: string;
    publications?: number;
    communications?: number;
  }) => { success: boolean; message: string; estDerogataire: boolean };
  
  rattrapagePiece: (dossierId: number, masterNom: string, masterTaille?: string) => { success: boolean; message: string };
  
  // Actions Métier & Back-Office
  verifierDelais: () => { traites: number; refuses: number };
  changerStatutDossier: (dossierId: number, nouveauStatut: DossierStatut) => void;
  avancerNiveau: (dossierId: number) => { success: boolean; message: string; nouveauNiveau: NiveauAdministratif; statut: DossierStatut };
  mettreAJourAvisDirecteur: (dossierId: number, avis: AvisDirecteur, commentaire?: string) => void;
  mettreAJourAvisCAT: (dossierId: number, avis: AvisCAT, commentaire?: string) => void;
  validerEnBatch: (dossierIds: number[]) => number;
  renvoyerNotificationRattrapage: (dossierId: number) => { success: boolean; message: string; dateNotification: string };
  genererEmailRattrapage: (dossierId: number) => NotificationEmail | null;
  modifierCalendrier: (id: number, date_ouverture: string, date_cloture: string, nom_phase?: string) => void;
  reinitialiserDonnees: () => void;
  
  // Helpers
  getDossierEnrichi: (dossierId: number) => DossierInscription | null;
  getDossierActifCandidat: (userId: number) => DossierInscription | null;
  getDossierN1Candidat: (userId: number) => DossierInscription | null;
}

const GcdContext = createContext<GcdContextType | undefined>(undefined);

const STORAGE_KEY = 'gcd_usmba_data_v1';

export const GcdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Date de base pour la simulation (aujourd'hui : 2026-11-02)
  const [simulationDate, setSimulationDate] = useState<string>('2026-11-02');

  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_UTILISATEURS;
  });

  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(() => {
    // Par défaut, débuter connecté en tant que Pôle Doctoral ou Nouveau Candidat
    const savedId = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    if (savedId) {
      const found = INITIAL_UTILISATEURS.find(u => u.id === Number(savedId));
      if (found) return found;
    }
    return INITIAL_UTILISATEURS[1]; // Directeur Pôle Doctoral par défaut pour montrer la puissance du Back-Office
  });

  const [sujets, setSujets] = useState<Sujet[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sujets`);
    return saved ? JSON.parse(saved) : INITIAL_SUJETS;
  });

  const [dossiers, setDossiers] = useState<DossierInscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dossiers`);
    return saved ? JSON.parse(saved) : INITIAL_DOSSIERS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_docs`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [rapports, setRapports] = useState<RapportAvancement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rapports`);
    return saved ? JSON.parse(saved) : INITIAL_RAPPORTS;
  });

  const [calendrier, setCalendrier] = useState<ParametreCalendrier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_calendrier`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDRIER;
  });

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(utilisateurs));
    localStorage.setItem(`${STORAGE_KEY}_sujets`, JSON.stringify(sujets));
    localStorage.setItem(`${STORAGE_KEY}_dossiers`, JSON.stringify(dossiers));
    localStorage.setItem(`${STORAGE_KEY}_docs`, JSON.stringify(documents));
    localStorage.setItem(`${STORAGE_KEY}_rapports`, JSON.stringify(rapports));
    localStorage.setItem(`${STORAGE_KEY}_calendrier`, JSON.stringify(calendrier));
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUser.id.toString());
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);
    }
  }, [utilisateurs, sujets, dossiers, documents, rapports, calendrier, currentUser]);

  // Authentification
  const login = (email: string, mdp: string) => {
    const found = utilisateurs.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (id: number) => {
    const found = utilisateurs.find(u => u.id === id);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Helper date add days
  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // -------------------------------------------------------------
  // RÈGLE MÉTIER : VERIFICATION AUTOMATIQUE DES DELAIS DE RATTRAPAGE
  // -------------------------------------------------------------
  const verifierDelais = () => {
    let traites = 0;
    let refuses = 0;

    setDossiers(prev => {
      const updated = prev.map(dossier => {
        if (dossier.statut === 'Incomplet' && dossier.date_limite_rattrapage) {
          traites++;
          // Comparaison ISO string YYYY-MM-DD
          if (dossier.date_limite_rattrapage < simulationDate) {
            refuses++;
            return {
              ...dossier,
              statut: 'Refusé' as DossierStatut
            };
          }
        }
        return dossier;
      });
      return updated;
    });

    return { traites, refuses };
  };

  // -------------------------------------------------------------
  // WORKFLOW 1 : INSCRIPTION INITIALE (NOUVEAU CANDIDAT)
  // -------------------------------------------------------------
  const soumettreInscription = ({
    id_sujet,
    cinNom,
    cinTaille = '1.4 Mo',
    masterFourni,
    masterNom = 'Diplome_Master.pdf',
    masterTaille = '2.3 Mo'
  }: {
    id_sujet: number;
    cinNom: string;
    cinTaille?: string;
    masterFourni: boolean;
    masterNom?: string;
    masterTaille?: string;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'Utilisateur non connecté', statut: 'Incomplet' as DossierStatut };
    }

    // Vérifier si un dossier 2026/2027 existe déjà pour ce candidat
    const anneeUniversitaire = '2026/2027';
    const existant = dossiers.find(
      d => d.id_utilisateur === currentUser.id && d.annee_universitaire === anneeUniversitaire
    );
    if (existant) {
      return {
        success: false,
        message: 'Vous disposez déjà d\'une candidature pour l\'année universitaire 2026/2027.',
        statut: existant.statut as DossierStatut
      };
    }

    // Règle Métier : Si le diplôme de Master manque lors de la soumission,
    // le dossier passe au statut 'Incomplet' et une date_limite_rattrapage à J+5 est attribuée.
    const statutInitial: DossierStatut = masterFourni ? 'En cours' : 'Incomplet';
    const dateLimiteRattrapage = masterFourni ? null : addDays(simulationDate, 5);

    const nouveauId = Date.now();
    const nouveauDossier: DossierInscription = {
      id: nouveauId,
      id_utilisateur: currentUser.id,
      id_sujet,
      annee_universitaire: anneeUniversitaire,
      annee_doctorat: 1,
      type_dossier: 'Inscription',
      statut: statutInitial,
      niveau_actuel: '1_DEPOT_CANDIDAT',
      date_limite_rattrapage: dateLimiteRattrapage,
      date_notification_rattrapage: masterFourni ? null : `${simulationDate} 10:05:00`,
      date_creation: `${simulationDate} 10:00:00`
    };

    // Documents
    const docsToAdd: DocumentItem[] = [];
    docsToAdd.push({
      id: Date.now() + 1,
      id_dossier: nouveauId,
      type_piece: 'CIN',
      chemin_fichier: `cin_${currentUser.id}_${cinNom}`,
      nom_original: cinNom,
      taille: cinTaille,
      date_upload: `${simulationDate} 10:00`,
      est_valide: true
    });

    if (masterFourni) {
      docsToAdd.push({
        id: Date.now() + 2,
        id_dossier: nouveauId,
        type_piece: 'Diplome_Master',
        chemin_fichier: `master_${currentUser.id}_${masterNom}`,
        nom_original: masterNom,
        taille: masterTaille,
        date_upload: `${simulationDate} 10:00`,
        est_valide: true
      });
    }

    setDossiers(prev => [nouveauDossier, ...prev]);
    setDocuments(prev => [...prev, ...docsToAdd]);

    // Marquer le sujet comme Attribué si validé ultérieurement ou en cours
    if (masterFourni) {
      return {
        success: true,
        message: 'Dossier complet déposé avec succès. Votre candidature est actuellement en cours d\'instruction par le CED.',
        statut: 'En cours' as DossierStatut
      };
    } else {
      return {
        success: true,
        message: `Dossier enregistré au statut "Incomplet" : Diplôme de Master manquant. Un délai de rattrapage de 5 jours ouvrés vous a été alloué jusqu'au ${dateLimiteRattrapage}.`,
        statut: 'Incomplet' as DossierStatut
      };
    }
  };

  // -------------------------------------------------------------
  // RATTRAPAGE D'UNE PIÈCE MANQUANTE (MASTER)
  // -------------------------------------------------------------
  const rattrapagePiece = (dossierId: number, masterNom: string, masterTaille = '2.5 Mo') => {
    const target = dossiers.find(d => d.id === dossierId);
    if (!target) return { success: false, message: 'Dossier introuvable' };

    // Ajouter le document
    const docId = Date.now();
    const newDoc: DocumentItem = {
      id: docId,
      id_dossier: dossierId,
      type_piece: 'Diplome_Master',
      chemin_fichier: `master_rattrapage_${target.id_utilisateur}_${masterNom}`,
      nom_original: masterNom,
      taille: masterTaille,
      date_upload: `${simulationDate} 12:00`,
      est_valide: true
    };

    setDocuments(prev => [...prev, newDoc]);

    // Mettre à jour le dossier vers 'En cours' et vider date_limite_rattrapage
    setDossiers(prev =>
      prev.map(d =>
        d.id === dossierId
          ? {
              ...d,
              statut: 'En cours' as DossierStatut,
              date_limite_rattrapage: null
            }
          : d
      )
    );

    return {
      success: true,
      message: 'Diplôme de Master téléversé avec succès. Votre dossier de candidature est désormais complet et repasse au statut "En cours".'
    };
  };

  // -------------------------------------------------------------
  // WORKFLOW 2 : RÉINSCRIPTION DOCTORALE (DOCTORANT N-1)
  // -------------------------------------------------------------
  const soumettreReinscription = ({
    rapportNom,
    rapportTaille = '3.8 Mo',
    motifDerogation,
    publications = 1,
    communications = 2
  }: {
    rapportNom: string;
    rapportTaille?: string;
    motifDerogation?: string;
    publications?: number;
    communications?: number;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'Utilisateur non connecté', estDerogataire: false };
    }

    // Recherche du dossier N-1 validé
    const dossierN1 = dossiers
      .filter(d => d.id_utilisateur === currentUser.id && d.statut === 'Validé')
      .sort((a, b) => b.annee_doctorat - a.annee_doctorat)[0];

    if (!dossierN1) {
      return {
        success: false,
        message: 'Aucun dossier validé en N-1 n\'a été détecté pour votre compte.',
        estDerogataire: false
      };
    }

    const nouvelleAnneeDoctorat = dossierN1.annee_doctorat + 1;
    const estDerogataire = nouvelleAnneeDoctorat >= 4;
    const anneeUniversitaire = '2026/2027';

    const nouveauId = Date.now();
    const nouveauDossier: DossierInscription = {
      id: nouveauId,
      id_utilisateur: currentUser.id,
      id_sujet: dossierN1.id_sujet,
      annee_universitaire: anneeUniversitaire,
      annee_doctorat: nouvelleAnneeDoctorat,
      type_dossier: 'Reinscription',
      statut: 'En cours',
      niveau_actuel: '1_DEPOT_CANDIDAT',
      date_creation: `${simulationDate} 11:30:00`,
      date_limite_rattrapage: null,
      date_notification_rattrapage: null
    };

    // Document Rapport d'avancement
    const docId = Date.now() + 10;
    const newDoc: DocumentItem = {
      id: docId,
      id_dossier: nouveauId,
      type_piece: 'Rapport_Avancement',
      chemin_fichier: `rapport_avancement_D${nouvelleAnneeDoctorat}_${currentUser.id}_${rapportNom}`,
      nom_original: rapportNom,
      taille: rapportTaille,
      date_upload: `${simulationDate} 11:30`,
      est_valide: true
    };

    // Rapport d'avancement avec métadonnées
    const nouveauRapport: RapportAvancement = {
      id_rapport: Date.now() + 20,
      id_dossier: nouveauId,
      annee_universitaire: anneeUniversitaire,
      chemin_fichier: newDoc.chemin_fichier,
      avis_cat: 'Favorable',
      avis_directeur: 'En attente',
      demande_derogation: estDerogataire,
      motif_derogation: motifDerogation || (estDerogataire ? 'Poursuite et finalisation des travaux de thèse et rédaction du manuscrit.' : undefined),
      publications_declarees: publications,
      communications_declarees: communications
    };

    setDossiers(prev => [nouveauDossier, ...prev]);
    setDocuments(prev => [...prev, newDoc]);
    setRapports(prev => [...prev, nouveauRapport]);

    let msg = `Demande de réinscription en ${nouvelleAnneeDoctorat}ème année soumise avec succès.`;
    if (estDerogataire) {
      msg += ` AVIS : Cycle standard de 3 ans dépassé (D${nouvelleAnneeDoctorat}). La procédure de dérogation réglementaire USMBA a été automatiquement enclenchée auprès du Pôle Doctoral.`;
    }

    return {
      success: true,
      message: msg,
      estDerogataire
    };
  };

  // -------------------------------------------------------------
  // ACTIONS DE GOUVERNANCE & BACK-OFFICE
  // -------------------------------------------------------------
  const changerStatutDossier = (dossierId: number, nouveauStatut: DossierStatut) => {
    setDossiers(prev =>
      prev.map(d =>
        d.id === dossierId
          ? {
              ...d,
              statut: nouveauStatut,
              niveau_actuel: nouveauStatut === 'Validé' ? '5_DECISION_POLE_DOCTORAL' : d.niveau_actuel,
              date_limite_rattrapage:
                nouveauStatut === 'Incomplet' ? addDays(simulationDate, 5) : null,
              date_notification_rattrapage:
                nouveauStatut === 'Incomplet' ? `${simulationDate} 12:00:00` : d.date_notification_rattrapage
            }
          : d
      )
    );
  };

  const avancerNiveau = (dossierId: number) => {
    let nouveauNiveau: NiveauAdministratif = '1_DEPOT_CANDIDAT';
    let nouveauStatut: DossierStatut = 'En cours';
    let message = '';

    setDossiers(prev =>
      prev.map(d => {
        if (d.id === dossierId) {
          const idx = NIVEAUX_ORDER.indexOf(d.niveau_actuel);
          if (idx < NIVEAUX_ORDER.length - 1) {
            nouveauNiveau = NIVEAUX_ORDER[idx + 1];
            nouveauStatut = d.statut;
            message = `Dossier #${dossierId} transmis avec succès au niveau ${idx + 2}/5 : ${NIVEAUX_DETAILS[nouveauNiveau].nomComplet}.`;
            return {
              ...d,
              niveau_actuel: nouveauNiveau
            };
          } else {
            // Déjà au niveau 5 : décision finale du Pôle Doctoral (validation finale)
            nouveauNiveau = '5_DECISION_POLE_DOCTORAL';
            nouveauStatut = 'Validé';
            message = `Dossier #${dossierId} validé définitivement par le Conseil du Pôle Doctoral (Niveau 5/5). Statut global : 'Validé'.`;
            return {
              ...d,
              niveau_actuel: nouveauNiveau,
              statut: 'Validé' as DossierStatut
            };
          }
        }
        return d;
      })
    );

    return { success: true, message, nouveauNiveau, statut: nouveauStatut };
  };

  const validerEnBatch = (dossierIds: number[]) => {
    setDossiers(prev =>
      prev.map(d =>
        dossierIds.includes(d.id)
          ? { ...d, statut: 'Validé' as DossierStatut, niveau_actuel: '5_DECISION_POLE_DOCTORAL' as NiveauAdministratif }
          : d
      )
    );
    return dossierIds.length;
  };

  const mettreAJourAvisDirecteur = (dossierId: number, avis: AvisDirecteur, commentaire?: string) => {
    setRapports(prev => {
      const exists = prev.find(r => r.id_dossier === dossierId);
      if (exists) {
        return prev.map(r =>
          r.id_dossier === dossierId
            ? { ...r, avis_directeur: avis, commentaire_directeur: commentaire }
            : r
        );
      } else {
        const dossier = dossiers.find(d => d.id === dossierId);
        return [
          ...prev,
          {
            id_rapport: Date.now(),
            id_dossier: dossierId,
            annee_universitaire: dossier?.annee_universitaire || '2026/2027',
            chemin_fichier: 'rapport_auto.pdf',
            avis_cat: 'Favorable',
            avis_directeur: avis,
            commentaire_directeur: commentaire,
            demande_derogation: (dossier?.annee_doctorat || 1) >= 4
          }
        ];
      }
    });
  };

  const mettreAJourAvisCAT = (dossierId: number, avis: AvisCAT, commentaire?: string) => {
    setRapports(prev => {
      const exists = prev.find(r => r.id_dossier === dossierId);
      if (exists) {
        return prev.map(r =>
          r.id_dossier === dossierId ? { ...r, avis_cat: avis, commentaire_cat: commentaire } : r
        );
      } else {
        const dossier = dossiers.find(d => d.id === dossierId);
        return [
          ...prev,
          {
            id_rapport: Date.now(),
            id_dossier: dossierId,
            annee_universitaire: dossier?.annee_universitaire || '2026/2027',
            chemin_fichier: 'rapport_auto.pdf',
            avis_cat: avis,
            commentaire_cat: commentaire,
            avis_directeur: 'En attente',
            demande_derogation: (dossier?.annee_doctorat || 1) >= 4
          }
        ];
      }
    });
  };

  const modifierCalendrier = (
    id: number,
    date_ouverture: string,
    date_cloture: string,
    nom_phase?: string
  ) => {
    setCalendrier(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              date_ouverture,
              date_cloture,
              nom_phase: nom_phase || c.nom_phase
            }
          : c
      )
    );
  };

  const reinitialiserDonnees = () => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_sujets`);
    localStorage.removeItem(`${STORAGE_KEY}_dossiers`);
    localStorage.removeItem(`${STORAGE_KEY}_docs`);
    localStorage.removeItem(`${STORAGE_KEY}_rapports`);
    localStorage.removeItem(`${STORAGE_KEY}_calendrier`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);

    setUtilisateurs(INITIAL_UTILISATEURS);
    setSujets(INITIAL_SUJETS);
    setDossiers(INITIAL_DOSSIERS);
    setDocuments(INITIAL_DOCUMENTS);
    setRapports(INITIAL_RAPPORTS);
    setCalendrier(INITIAL_CALENDRIER);
    setCurrentUser(INITIAL_UTILISATEURS[1]);
    setSimulationDate('2026-11-02');
  };

  // Helpers pour enrichir les entités
  const getDossierEnrichi = (dossierId: number): DossierInscription | null => {
    const raw = dossiers.find(d => d.id === dossierId);
    if (!raw) return null;

    const candidat = utilisateurs.find(u => u.id === raw.id_utilisateur);
    const sujet = sujets.find(s => s.id === raw.id_sujet);
    const directeur = sujet ? utilisateurs.find(u => u.id === sujet.id_directeur) : undefined;
    const docs = documents.filter(doc => doc.id_dossier === raw.id);
    const rapport = rapports.find(r => r.id_dossier === raw.id);

    return {
      ...raw,
      candidat,
      sujet,
      directeur,
      documents: docs,
      rapport
    };
  };

  const getDossierActifCandidat = (userId: number): DossierInscription | null => {
    // Dossier le plus récent
    const userDossiers = dossiers.filter(d => d.id_utilisateur === userId);
    if (userDossiers.length === 0) return null;
    const sorted = [...userDossiers].sort((a, b) => b.id - a.id);
    return getDossierEnrichi(sorted[0].id);
  };

  const getDossierN1Candidat = (userId: number): DossierInscription | null => {
    const valides = dossiers.filter(d => d.id_utilisateur === userId && d.statut === 'Validé');
    if (valides.length === 0) return null;
    const sorted = [...valides].sort((a, b) => b.annee_doctorat - a.annee_doctorat);
    return getDossierEnrichi(sorted[0].id);
  };

  const renvoyerNotificationRattrapage = (dossierId: number) => {
    const nowStr = `${simulationDate} 12:30:00`;
    setDossiers(prev =>
      prev.map(d =>
        d.id === dossierId
          ? {
              ...d,
              date_notification_rattrapage: nowStr
            }
          : d
      )
    );
    const target = getDossierEnrichi(dossierId);
    return {
      success: true,
      message: `E-mail officiel de relance et accusé de rattrapage (J+5) transmis avec succès à ${target?.candidat?.email || 'l\'étudiant'}.`,
      dateNotification: nowStr
    };
  };

  const genererEmailRattrapage = (dossierId: number): NotificationEmail | null => {
    const target = getDossierEnrichi(dossierId);
    if (!target || !target.candidat) return null;

    const emailDate = target.date_notification_rattrapage || `${simulationDate} 10:00:00`;
    const deadline = target.date_limite_rattrapage || addDays(simulationDate, 5);

    return {
      id: target.id,
      dossierId: target.id,
      destinataireEmail: target.candidat.email,
      destinataireNom: target.candidat.nom,
      dateEnvoi: emailDate,
      dateLimite: deadline,
      objet: `[USMBA - CED] URGENT : Complétude administrative de votre dossier doctoral #${target.id} (Délai J+5)`,
      corpsTexte: `Royaume du Maroc
Université Sidi Mohamed Ben Abdellah de Fès
Centre d'Études Doctorales (CED) • Pôle des Études Doctorales

À l'attention de : ${target.candidat.nom} (CIN: ${target.candidat.cin})
Adresse institutionnelle : ${target.candidat.email}
Dossier N° : #${target.id}
Projet de Thèse : ${target.sujet?.titre || 'Thèse Doctorale'}
Directeur de Thèse : ${target.directeur?.nom || target.sujet?.nom_directeur || 'CED'}

-----------------------------------------------------------------------------------
ACCUSÉ DE RÉCEPTION ET NOTIFICATION OFFICIELLE DE RATTRAPAGE (J+5)
-----------------------------------------------------------------------------------

Madame, Monsieur,

Lors de la vérification de conformité administrative initiale de votre dossier de candidature doctorale pour l'année universitaire 2026/2027, les services de scolarité doctorale ont constaté l'absence d'une pièce justificative obligatoire :

• PIÈCE MANQUANTE : Copie certifiée conforme du Diplôme de Master / Attestation définitive de réussite.

Conformément aux statuts régissant les inscriptions au cycle doctoral de l'Université Sidi Mohamed Ben Abdellah :
Un délai impératif de rattrapage de 5 jours ouvrés vous est accordé.

DATE LIMITE IMPÉRATIVE DE TÉLÉVERSEMENT : ${deadline} à 23h59.

ATTENTION :
Passée cette date d'échéance, la fonction de contrôle automatique de la plateforme (verifier_delais) basculera irréversiblement votre dossier au statut "Refusé".

Veuillez vous connecter sans délai à votre espace candidat sur la plateforme GCD pour téléverser le document requis :
Portail GCD USMBA : https://gcd.usmba.ac.ma/candidat/dashboard

Pour le Conseil de Pôle Doctoral,
Service des Inscriptions et de la Scolarité Doctorale
Université Sidi Mohamed Ben Abdellah - Fès`
    };
  };

  return (
    <GcdContext.Provider
      value={{
        currentUser,
        utilisateurs,
        sujets,
        dossiers,
        documents,
        rapports,
        calendrier,
        simulationDate,
        setSimulationDate,
        login,
        logout,
        switchUser,
        soumettreInscription,
        soumettreReinscription,
        rattrapagePiece,
        verifierDelais,
        changerStatutDossier,
        avancerNiveau,
        mettreAJourAvisDirecteur,
        mettreAJourAvisCAT,
        validerEnBatch,
        renvoyerNotificationRattrapage,
        genererEmailRattrapage,
        modifierCalendrier,
        reinitialiserDonnees,
        getDossierEnrichi,
        getDossierActifCandidat,
        getDossierN1Candidat
      }}
    >
      {children}
    </GcdContext.Provider>
  );
};

export const useGcd = () => {
  const context = useContext(GcdContext);
  if (!context) {
    throw new Error('useGcd must be used within a GcdProvider');
  }
  return context;
};
