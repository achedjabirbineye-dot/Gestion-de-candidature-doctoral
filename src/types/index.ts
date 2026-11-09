export type Role = 'candidat' | 'directeur_these' | 'cat' | 'pole_doctoral' | 'admin';

export type DossierStatut = 'En cours' | 'Incomplet' | 'Validé' | 'Refusé';

export type TypeDossier = 'Inscription' | 'Reinscription';

export type TypeDocument = 'CIN' | 'Diplome_Master' | 'Rapport_Avancement' | 'Attestation_Bourse';

export type AvisCAT = 'Favorable' | 'Ajourné' | 'Défavorable';

export type AvisDirecteur = 'Favorable' | 'Défavorable' | 'En attente';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  cin: string;
  role: Role;
  telephone?: string;
  laboratoire?: string;
  etablissement?: string; // e.g., FST Fès, FS Dhar El Mehraz, FLSH Dhar El Mehraz, etc.
}

export interface Sujet {
  id: number;
  titre: string;
  description: string;
  id_directeur: number;
  statut: 'Disponible' | 'Attribué';
  nom_directeur?: string;
  laboratoire?: string;
  ced?: string; // Centre d'Études Doctorales
}

export interface DocumentItem {
  id: number;
  id_dossier: number;
  type_piece: TypeDocument;
  chemin_fichier: string;
  nom_original: string;
  taille?: string;
  date_upload: string;
  est_valide: boolean;
}

export interface RapportAvancement {
  id_rapport: number;
  id_dossier: number;
  annee_universitaire: string;
  chemin_fichier: string;
  avis_cat: AvisCAT;
  commentaire_cat?: string;
  avis_directeur: AvisDirecteur;
  commentaire_directeur?: string;
  demande_derogation: boolean;
  motif_derogation?: string;
  publications_declarees?: number;
  communications_declarees?: number;
}

export type NiveauAdministratif =
  | '1_DEPOT_CANDIDAT'
  | '2_AVIS_DIRECTEUR_THESE'
  | '3_VALIDATION_LABO_STRUCTURE'
  | '4_COMMISSION_CED'
  | '5_DECISION_POLE_DOCTORAL';

export interface NiveauInfo {
  numero: number;
  id: NiveauAdministratif;
  nomCourt: string;
  nomComplet: string;
  instance: string;
  description: string;
  messageCandidat: string;
}

export const NIVEAUX_ORDER: NiveauAdministratif[] = [
  '1_DEPOT_CANDIDAT',
  '2_AVIS_DIRECTEUR_THESE',
  '3_VALIDATION_LABO_STRUCTURE',
  '4_COMMISSION_CED',
  '5_DECISION_POLE_DOCTORAL'
];

export const NIVEAUX_DETAILS: Record<NiveauAdministratif, NiveauInfo> = {
  '1_DEPOT_CANDIDAT': {
    numero: 1,
    id: '1_DEPOT_CANDIDAT',
    nomCourt: 'Dépôt Candidat',
    nomComplet: 'Dépôt Initial des Pièces',
    instance: 'Doctorant(e)',
    description: 'Dépôt initial des pièces par l\'étudiant (CIN, diplôme ou rapport).',
    messageCandidat: 'Votre dossier a été déposé. Il est actuellement en cours de transmission à votre Directeur de Thèse pour évaluation.'
  },
  '2_AVIS_DIRECTEUR_THESE': {
    numero: 2,
    id: '2_AVIS_DIRECTEUR_THESE',
    nomCourt: 'Avis Directeur',
    nomComplet: 'Avis Scientifique de l\'Encadrant',
    instance: 'Directeur de Thèse',
    description: 'Évaluation et avis scientifique de l\'encadrant.',
    messageCandidat: 'Votre dossier est actuellement soumis à l\'évaluation et l\'avis scientifique de votre Directeur de Thèse.'
  },
  '3_VALIDATION_LABO_STRUCTURE': {
    numero: 3,
    id: '3_VALIDATION_LABO_STRUCTURE',
    nomCourt: 'Validation Labo',
    nomComplet: 'Validation Laboratoire / Structure',
    instance: 'Direction du Laboratoire',
    description: 'Vérification et avis du directeur du laboratoire ou de la structure de recherche.',
    messageCandidat: 'Votre dossier est en cours d\'instruction et de vérification par la Direction du Laboratoire de recherche d\'accueil.'
  },
  '4_COMMISSION_CED': {
    numero: 4,
    id: '4_COMMISSION_CED',
    nomCourt: 'Commission CED',
    nomComplet: 'Examen Commission CED / CAT',
    instance: 'Centre d\'Études Doctorales (CED)',
    description: 'Examen par le Centre d\'Études Doctorales et avis CAT / Dérogation.',
    messageCandidat: 'Votre dossier est actuellement en attente d\'évaluation par la Commission du Centre d\'Études Doctorales (CED).'
  },
  '5_DECISION_POLE_DOCTORAL': {
    numero: 5,
    id: '5_DECISION_POLE_DOCTORAL',
    nomCourt: 'Décision Pôle',
    nomComplet: 'Décision Finale Pôle Doctoral',
    instance: 'Pôle des Études Doctorales (PED)',
    description: 'Validation administrative finale au Pôle Doctoral et inscription définitive.',
    messageCandidat: 'Votre dossier est entre les mains du Conseil du Pôle Doctoral pour décision et validation finale.'
  }
};

export interface DossierInscription {
  id: number;
  id_utilisateur: number;
  id_sujet: number;
  annee_universitaire: string;
  annee_doctorat: number; // 1, 2, 3, 4, 5, etc.
  type_dossier: TypeDossier;
  statut: DossierStatut;
  niveau_actuel: NiveauAdministratif;
  date_limite_rattrapage?: string | null;
  date_notification_rattrapage?: string | null;
  date_creation: string;
  
  // Relations enrichies pour l'affichage
  candidat?: Utilisateur;
  sujet?: Sujet;
  directeur?: Utilisateur;
  documents?: DocumentItem[];
  rapport?: RapportAvancement;
}

export interface NotificationEmail {
  id: number;
  dossierId: number;
  destinataireEmail: string;
  destinataireNom: string;
  dateEnvoi: string;
  dateLimite: string;
  objet: string;
  corpsTexte: string;
}

export interface ParametreCalendrier {
  id: number;
  nom_phase: string;
  description?: string;
  date_ouverture: string;
  date_cloture: string;
  public_cible: string;
}
