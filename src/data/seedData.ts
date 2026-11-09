import { Utilisateur, Sujet, DossierInscription, DocumentItem, RapportAvancement, ParametreCalendrier } from '../types';

export const INITIAL_UTILISATEURS: Utilisateur[] = [
  {
    id: 1,
    nom: 'Pr. Alami Driss',
    email: 'alami.directeur@usmba.ac.ma',
    cin: 'CD112233',
    role: 'directeur_these',
    telephone: '+212 6 61 23 45 67',
    laboratoire: 'Laboratoire d\'Ingénierie, Systèmes et Applications (LISA)',
    etablissement: 'Faculté des Sciences et Techniques (FST) de Fès',
  },
  {
    id: 2,
    nom: 'Directeur Pôle Doctoral',
    email: 'pole.doctoral@usmba.ac.ma',
    cin: 'PO998877',
    role: 'pole_doctoral',
    telephone: '+212 5 35 60 80 00',
    laboratoire: 'Pôle des Études Doctorales (PED)',
    etablissement: 'Présidence USMBA - Fès',
  },
  {
    id: 3,
    nom: 'Admin Général GCD',
    email: 'admin.gcd@usmba.ac.ma',
    cin: 'AD000001',
    role: 'admin',
    telephone: '+212 5 35 60 80 01',
    laboratoire: 'Direction des Systèmes d\'Information (DSI)',
    etablissement: 'Présidence USMBA - Fès',
  },
  {
    id: 4,
    nom: 'El Mansouri Youssef (Nouveau)',
    email: 'youssef.candidat@usmba.ac.ma',
    cin: 'CD987456',
    role: 'candidat',
    telephone: '+212 6 72 34 56 78',
    laboratoire: 'Candidat libre',
    etablissement: 'Diplômé Master Université Sidi Mohamed Ben Abdellah',
  },
  {
    id: 5,
    nom: 'Bennani Salma (Réinscription N-1)',
    email: 'salma.doctorante@usmba.ac.ma',
    cin: 'CD654321',
    role: 'candidat',
    telephone: '+212 6 63 98 76 54',
    laboratoire: 'Laboratoire d\'Ingénierie, Systèmes et Applications (LISA)',
    etablissement: 'FST Fès - CED Sciences et Techniques',
  },
  {
    id: 6,
    nom: 'Pr. Tahiri Mohamed (Comité CAT)',
    email: 'cat.commission@usmba.ac.ma',
    cin: 'CT445566',
    role: 'cat',
    telephone: '+212 6 62 11 22 33',
    laboratoire: 'Comité d\'Accompagnement de Thèse (CAT)',
    etablissement: 'Centre d\'Études Doctorales (CED)',
  },
  {
    id: 7,
    nom: 'Tazi Karim (Doctorant Dérogation D4)',
    email: 'karim.tazi@usmba.ac.ma',
    cin: 'CD334455',
    role: 'candidat',
    telephone: '+212 6 78 90 12 34',
    laboratoire: 'Laboratoire d\'Ingénierie, Systèmes et Applications (LISA)',
    etablissement: 'FST Fès',
  },
  {
    id: 8,
    nom: 'Chraibi Amine (Rattrapage J+5)',
    email: 'amine.chraibi@usmba.ac.ma',
    cin: 'CD887766',
    role: 'candidat',
    telephone: '+212 6 65 43 21 09',
    laboratoire: 'Candidat Master Informatique',
    etablissement: 'FS Dhar El Mehraz',
  },
  {
    id: 9,
    nom: 'Idrissi Houda (Doctorante D2 - Instruction CED)',
    email: 'houda.idrissi@usmba.ac.ma',
    cin: 'CD445577',
    role: 'candidat',
    telephone: '+212 6 61 77 88 99',
    laboratoire: 'Laboratoire LISA',
    etablissement: 'FST Fès',
  },
  {
    id: 10,
    nom: 'Alaoui Mehdi (Candidat - Avis Directeur)',
    email: 'mehdi.alaoui@usmba.ac.ma',
    cin: 'CD123987',
    role: 'candidat',
    telephone: '+212 6 63 44 55 66',
    laboratoire: 'Candidat Master Réseaux',
    etablissement: 'FST Fès',
  }
];

export const INITIAL_SUJETS: Sujet[] = [
  {
    id: 1,
    titre: 'IA et Télédétection appliquée aux bassins hydrauliques du Sebou',
    description: 'Modélisation hydrologique prédictive par deep learning et réseaux de neurones graphiques pour la gestion intelligente des crues et de l\'irrigation dans le bassin du Sebou.',
    id_directeur: 1,
    nom_directeur: 'Pr. Alami Driss',
    statut: 'Attribué',
    laboratoire: 'LISA - FST Fès',
    ced: 'CED Sciences & Techniques'
  },
  {
    id: 2,
    titre: 'Systèmes Embarqués et Sécurité IoT dans l\'Industrie 4.0',
    description: 'Conception de mécanismes cryptographiques post-quantiques légers pour microcontrôleurs RISC-V déployés en environnements industriels contraints.',
    id_directeur: 1,
    nom_directeur: 'Pr. Alami Driss',
    statut: 'Disponible',
    laboratoire: 'LISA - FST Fès',
    ced: 'CED Sciences & Techniques'
  },
  {
    id: 3,
    titre: 'Traitement Automatique du Langage Arabe et Dialectes Marocains (Darija)',
    description: 'Modèles de fondation multimodaux optimisés pour la transcription, l\'analyse sémantique et la numérisation des archives administratives marocaines.',
    id_directeur: 1,
    nom_directeur: 'Pr. Alami Driss',
    statut: 'Disponible',
    laboratoire: 'LISA - FST Fès',
    ced: 'CED Sciences & Techniques'
  },
  {
    id: 4,
    titre: 'Valorisation Biotechnologique des Plantes Médicinales et Aromatiques du Moyen Atlas',
    description: 'Extraction éco-responsable de principes actifs antioxydants et antibactériens à partir de plantes endémiques de la région Fès-Meknès.',
    id_directeur: 1,
    nom_directeur: 'Pr. Alami Driss',
    statut: 'Disponible',
    laboratoire: 'Laboratoire de Biotechnologie & Santé',
    ced: 'CED Sciences de la Vie & Santé'
  },
  {
    id: 5,
    titre: 'Nanomatériaux Hybrides pour le Traitement Électrochimique des Eaux Usées Industrielles à Fès',
    description: 'Synthèse verte d\'oxydes métalliques nanostructurés pour la dégradation photocatalytique des colorants de tanneries de la médina de Fès.',
    id_directeur: 1,
    nom_directeur: 'Pr. Alami Driss',
    statut: 'Disponible',
    laboratoire: 'Laboratoire des Matériaux Avancés',
    ced: 'CED Sciences & Techniques'
  }
];

export const INITIAL_CALENDRIER: ParametreCalendrier[] = [
  {
    id: 1,
    nom_phase: 'Dépôt des nouvelles candidatures (1ère Année)',
    description: 'Dépôt en ligne des dossiers d\'admission, formulaires de parcours et pièces d\'identité.',
    date_ouverture: '2026-09-01',
    date_cloture: '2026-11-30',
    public_cible: 'Nouveaux titulaires de Master / Ingénieurs'
  },
  {
    id: 2,
    nom_phase: 'Campagne de réinscription doctorale (D2, D3, D4+)',
    description: 'Dépôt des rapports d\'avancement annuels signés et demandes de dérogation pour années supérieures.',
    date_ouverture: '2026-09-15',
    date_cloture: '2026-12-15',
    public_cible: 'Doctorants déjà inscrits (Promotion N-1)'
  },
  {
    id: 3,
    nom_phase: 'Commissions de sélection et validation Pôle Doctoral',
    description: 'Examen des rapports par les comités d\'accompagnement (CAT) et délibération finale du Conseil.',
    date_ouverture: '2026-12-01',
    date_cloture: '2026-12-30',
    public_cible: 'Directeurs, Membres CAT et Pôle Doctoral'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    id_dossier: 101, // Dossier Salma Bennani N-1
    type_piece: 'CIN',
    chemin_fichier: 'cin_salma_bennani_CD654321.pdf',
    nom_original: 'CIN_Salma_Bennani.pdf',
    taille: '1.2 Mo',
    date_upload: '2025-10-14 09:30',
    est_valide: true
  },
  {
    id: 2,
    id_dossier: 101,
    type_piece: 'Diplome_Master',
    chemin_fichier: 'diplome_master_salma_fst_fes.pdf',
    nom_original: 'Master_Ingenierie_Logicielle_FST.pdf',
    taille: '2.8 Mo',
    date_upload: '2025-10-14 09:35',
    est_valide: true
  },
  {
    id: 3,
    id_dossier: 102, // Dossier Karim Tazi N-1 (D3)
    type_piece: 'CIN',
    chemin_fichier: 'cin_karim_tazi_CD334455.pdf',
    nom_original: 'CIN_Karim_Tazi.pdf',
    taille: '890 Ko',
    date_upload: '2025-10-10 11:20',
    est_valide: true
  },
  {
    id: 4,
    id_dossier: 102,
    type_piece: 'Rapport_Avancement',
    chemin_fichier: 'rapport_avancement_D3_karim_tazi.pdf',
    nom_original: 'Rapport_Avancement_D3_Karim_Tazi.pdf',
    taille: '4.5 Mo',
    date_upload: '2025-10-12 15:00',
    est_valide: true
  },
  {
    id: 5,
    id_dossier: 103, // Dossier Amine Chraibi (Incomplet)
    type_piece: 'CIN',
    chemin_fichier: 'cin_amine_chraibi_CD887766.pdf',
    nom_original: 'CIN_Amine_Chraibi.pdf',
    taille: '1.1 Mo',
    date_upload: '2026-10-28 14:15',
    est_valide: true
  }
];

export const INITIAL_RAPPORTS: RapportAvancement[] = [
  {
    id_rapport: 1,
    id_dossier: 102, // Dossier Karim Tazi D3 -> D4
    annee_universitaire: '2025/2026',
    chemin_fichier: 'rapport_avancement_D3_karim_tazi.pdf',
    avis_cat: 'Favorable',
    commentaire_cat: 'Travail très rigoureux. Deux articles soumis dont un en Q2. Dérogation de 4ème année justifiée pour finalisation de la soutenance.',
    avis_directeur: 'Favorable',
    commentaire_directeur: 'Doctorant exemplaire. Rédaction du manuscrit entamée à 75%. Avis très favorable pour la dérogation.',
    demande_derogation: true,
    motif_derogation: 'Finalisation des campagnes de mesures expérimentales sur le Sebou et rédaction finale du manuscrit de thèse.',
    publications_declarees: 2,
    communications_declarees: 3
  },
  {
    id_rapport: 2,
    id_dossier: 104,
    annee_universitaire: '2026/2027',
    chemin_fichier: 'rapport_avancement_D2_houda_idrissi.pdf',
    avis_cat: 'Favorable',
    commentaire_cat: 'Excellente progression. Validation favorable recommandée en Commission CED.',
    avis_directeur: 'Favorable',
    commentaire_directeur: 'Travaux expérimentaux très prometteurs. Avis très favorable.',
    demande_derogation: false,
    publications_declarees: 1,
    communications_declarees: 1
  }
];

export const INITIAL_DOSSIERS: DossierInscription[] = [
  {
    id: 101,
    id_utilisateur: 5, // Salma Bennani
    id_sujet: 1,
    annee_universitaire: '2025/2026',
    annee_doctorat: 1,
    type_dossier: 'Inscription',
    statut: 'Validé',
    niveau_actuel: '5_DECISION_POLE_DOCTORAL',
    date_creation: '2025-10-15 10:00:00',
    date_limite_rattrapage: null,
    date_notification_rattrapage: null
  },
  {
    id: 102,
    id_utilisateur: 7, // Karim Tazi
    id_sujet: 1,
    annee_universitaire: '2025/2026',
    annee_doctorat: 3,
    type_dossier: 'Reinscription',
    statut: 'Validé',
    niveau_actuel: '5_DECISION_POLE_DOCTORAL',
    date_creation: '2025-10-20 16:30:00',
    date_limite_rattrapage: null,
    date_notification_rattrapage: null
  },
  {
    id: 103,
    id_utilisateur: 8, // Amine Chraibi
    id_sujet: 2,
    annee_universitaire: '2026/2027',
    annee_doctorat: 1,
    type_dossier: 'Inscription',
    statut: 'Incomplet',
    niveau_actuel: '1_DEPOT_CANDIDAT',
    date_creation: '2026-10-28 14:15:00',
    date_limite_rattrapage: '2026-11-12',
    date_notification_rattrapage: '2026-10-28 14:16:05'
  },
  {
    id: 104,
    id_utilisateur: 9, // Houda Idrissi
    id_sujet: 3,
    annee_universitaire: '2026/2027',
    annee_doctorat: 2,
    type_dossier: 'Reinscription',
    statut: 'En cours',
    niveau_actuel: '4_COMMISSION_CED',
    date_creation: '2026-10-25 09:30:00',
    date_limite_rattrapage: null,
    date_notification_rattrapage: null
  },
  {
    id: 105,
    id_utilisateur: 10, // Mehdi Alaoui
    id_sujet: 2,
    annee_universitaire: '2026/2027',
    annee_doctorat: 1,
    type_dossier: 'Inscription',
    statut: 'En cours',
    niveau_actuel: '2_AVIS_DIRECTEUR_THESE',
    date_creation: '2026-10-29 11:00:00',
    date_limite_rattrapage: null,
    date_notification_rattrapage: null
  }
];
