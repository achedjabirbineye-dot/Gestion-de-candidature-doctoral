import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Download, ExternalLink, Terminal } from 'lucide-react';

interface SourceCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES: { name: string; path: string; lang: string; content: string }[] = [
  {
    name: 'app.py',
    path: 'app.py',
    lang: 'python',
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Application GCD - Gestion des Candidatures Doctorales
Université Sidi Mohamed Ben Abdellah (USMBA) - Fès

Fonctionnalités Clés :
- Workflow d'instruction transparent en 5 niveaux (1_DEPOT -> 5_DECISION_POLE_DOCTORAL)
- Détection des dérogations réglementaires (Années D >= 4)
- Gestion des dossiers incomplets avec délai strict de rattrapage (J+5)
- Notification automatique par e-mail et horodatage de preuve (date_notification_rattrapage)
- Purge/Refus automatique par timer métier verifier_delais()
"""

import os
import sqlite3
import logging
from datetime import datetime, timedelta, date
from functools import wraps

from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, jsonify, send_from_directory
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
app.secret_key = "usmba_gcd_secret_production_key_2026_fes"

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(BASE_DIR, "gcd.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------------------------------------------------------
# GESTION BASE DE DONNÉES & SÉLECTION
# -----------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# -----------------------------------------------------------------------------
# NOTIFICATION E-MAIL OFFICIELLE ET ACCUSÉ DE RATTRAPAGE (J+5)
# -----------------------------------------------------------------------------

def envoyer_email_rattrapage(email, nom, dossier_id, date_limite):
    """
    Simule et consigne l'envoi de l'e-mail officiel d'avertissement et de rattrapage
    pour dossier incomplet (J+5) émis par le Pôle des Études Doctorales de l'USMBA.
    """
    sujet = f"[USMBA - GCD] AVERTISSEMENT : Complétude administrative requise (Dossier #{dossier_id})"
    corps = f"""
    ================================================================================
    ROYAUME DU MAROC
    UNIVERSITÉ SIDI MOHAMED BEN ABDELLAH (USMBA) - FÈS
    CENTRE D'ÉTUDES DOCTORALES (CED) & PÔLE DES ÉTUDES DOCTORALES
    ================================================================================
    Date d'émission : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    Destinataire    : {nom} <{email}>
    Objet           : Notification formelle de dossier incomplet & délai de grâce (J+5)
    Référence       : GCD-USMBA-DOSSIER-{dossier_id}

    Madame, Monsieur {nom},

    L'instruction administrative préliminaire de votre dossier d'inscription doctorale
    (Réf. #{dossier_id}) auprès de l'Université Sidi Mohamed Ben Abdellah a révélé
    l'absence ou la non-conformité de pièces obligatoires (Diplôme de Master ou
    attestation de réussite originale certifiée conforme).

    Conformément à la charte des études doctorales de l'USMBA :
    - Un délai de rattrapage impératif de CINQ (5) JOURS CALENDAIRES vous est accordé.
    - DATE LIMITE DE RÉGULARISATION : {date_limite} à 23h59 (GMT+1).

    ATTENTION : Passé ce délai de rigueur, le système automatisé de l'Université
    (procédure verifier_delais()) basculera irrévocablement votre candidature
    au statut "Refusé".

    Veuillez vous connecter sans délai à votre espace candidat sur la plateforme GCD :
    https://doctorat.usmba.ac.ma/candidat

    Pôle des Études Doctorales - USMBA Fès
    Campus Dhar El Mahraz, BP 1796 Fès-Atlas, Maroc
    ================================================================================
    """
    logging.info(f"📧 [NOTIFICATION E-MAIL ENVOYÉE] Candidat: {email} | Dossier: #{dossier_id} | Échéance: {date_limite}")
    logging.info(corps)
    return {
        "success": True,
        "email": email,
        "date_envoi": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "sujet": sujet
    }

# -----------------------------------------------------------------------------
# RÈGLE MÉTIER : VERIFICATION AUTOMATIQUE DES TIMEOUTS DE RATTRAPAGE
# -----------------------------------------------------------------------------

def verifier_delais():
    """
    Règle Métier : Bascule automatiquement à 'Refusé' tout dossier au statut
    'Incomplet' dont la date limite de rattrapage (J+5) est dépassée.
    """
    conn = get_db()
    today_str = date.today().isoformat()
    cur = conn.execute(
        """
        UPDATE Dossier_Inscription
        SET statut = 'Refusé'
        WHERE statut = 'Incomplet'
          AND date_limite_rattrapage IS NOT NULL
          AND date_limite_rattrapage < ?
        """,
        (today_str,)
    )
    nb_refuses = cur.rowcount
    conn.commit()
    conn.close()
    if nb_refuses > 0:
        logging.warning(f"⚠️ [verifier_delais] {nb_refuses} dossier(s) incomplet(s) basculé(s) en 'Refusé' (Délai J+5 forclos).")
    return nb_refuses

# -----------------------------------------------------------------------------
# INITIALISATION ET SEED DATA (AVEC date_notification_rattrapage)
# -----------------------------------------------------------------------------

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS Utilisateur (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mot_de_passe TEXT NOT NULL,
        cin TEXT,
        role TEXT CHECK(role IN ('candidat', 'directeur_these', 'cat', 'pole_doctoral', 'admin')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Sujet (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        description TEXT,
        id_directeur INTEGER NOT NULL,
        statut TEXT CHECK(statut IN ('Disponible', 'Attribué')) DEFAULT 'Disponible',
        FOREIGN KEY (id_directeur) REFERENCES Utilisateur(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Dossier_Inscription (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_utilisateur INTEGER NOT NULL,
        id_sujet INTEGER NOT NULL,
        annee_universitaire TEXT NOT NULL,
        annee_doctorat INTEGER DEFAULT 1,
        type_dossier TEXT CHECK(type_dossier IN ('Inscription', 'Reinscription')) NOT NULL,
        statut TEXT CHECK(statut IN ('En cours', 'Incomplet', 'Validé', 'Refusé')) DEFAULT 'En cours',
        niveau_actuel TEXT CHECK(niveau_actuel IN (
            '1_DEPOT_CANDIDAT',
            '2_AVIS_DIRECTEUR_THESE',
            '3_VALIDATION_LABO_STRUCTURE',
            '4_COMMISSION_CED',
            '5_DECISION_POLE_DOCTORAL'
        )) DEFAULT '1_DEPOT_CANDIDAT',
        date_limite_rattrapage DATE,
        date_notification_rattrapage DATETIME,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id) ON DELETE CASCADE,
        FOREIGN KEY (id_sujet) REFERENCES Sujet(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Document (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_dossier INTEGER NOT NULL,
        type_piece TEXT CHECK(type_piece IN ('CIN', 'Diplome_Master', 'Rapport_Avancement', 'Attestation_Bourse')) NOT NULL,
        chemin_fichier TEXT NOT NULL,
        est_valide BOOLEAN DEFAULT 1,
        FOREIGN KEY (id_dossier) REFERENCES Dossier_Inscription(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Rapport_Avancement (
        id_rapport INTEGER PRIMARY KEY AUTOINCREMENT,
        id_dossier INTEGER NOT NULL,
        annee_universitaire TEXT NOT NULL,
        chemin_fichier TEXT NOT NULL,
        avis_cat TEXT CHECK(avis_cat IN ('Favorable', 'Ajourné', 'Défavorable')) DEFAULT 'Favorable',
        avis_directeur TEXT CHECK(avis_directeur IN ('Favorable', 'Défavorable', 'En attente')) DEFAULT 'En attente',
        demande_derogation BOOLEAN DEFAULT 0,
        FOREIGN KEY (id_dossier) REFERENCES Dossier_Inscription(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Parametre_Calendrier (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom_phase TEXT NOT NULL,
        date_ouverture DATE NOT NULL,
        date_cloture DATE NOT NULL
    );
    """)

    cursor.execute("SELECT COUNT(*) FROM Utilisateur")
    if cursor.fetchone()[0] == 0:
        pwd_hash = generate_password_hash("Usmba2026!")

        cursor.execute("""
            INSERT INTO Utilisateur (nom, email, mot_de_passe, cin, role) VALUES
            ('Pr. Alami Driss', 'alami.directeur@usmba.ac.ma', ?, 'CD112233', 'directeur_these'),
            ('Directeur Pôle Doctoral', 'pole.doctoral@usmba.ac.ma', ?, 'PO998877', 'pole_doctoral'),
            ('Admin Général GCD', 'admin.gcd@usmba.ac.ma', ?, 'AD000001', 'admin'),
            ('El Mansouri Youssef', 'youssef.candidat@usmba.ac.ma', ?, 'CD987456', 'candidat'),
            ('Bennani Salma (D2)', 'salma.doctorante@usmba.ac.ma', ?, 'CD654321', 'candidat'),
            ('Chraibi Amine (Incomplet)', 'amine.chraibi@usmba.ac.ma', ?, 'CD445566', 'candidat')
        """, (pwd_hash, pwd_hash, pwd_hash, pwd_hash, pwd_hash, pwd_hash))

        cursor.execute("""
            INSERT INTO Sujet (titre, description, id_directeur, statut) VALUES
            ('IA et Télédétection appliquée aux bassins hydrauliques du Sebou', 'Modélisation hydrologique prédictive.', 1, 'Attribué'),
            ('Systèmes Embarqués et Sécurité IoT dans l''Industrie 4.0', 'Cryptographie post-quantique sur architectures RISC-V.', 1, 'Attribué'),
            ('Optimisation des Réseaux Électriques Intelligents par Multi-Agents', 'Smart grids et énergies renouvelables.', 1, 'Attribué')
        """)

        # Dossier Validé N-1
        cursor.execute("""
            INSERT INTO Dossier_Inscription (id, id_utilisateur, id_sujet, annee_universitaire, annee_doctorat, type_dossier, statut, niveau_actuel, date_creation)
            VALUES (101, 5, 1, '2025/2026', 1, 'Inscription', 'Validé', '5_DECISION_POLE_DOCTORAL', '2025-10-15 10:00:00')
        """)

        # Dossier En cours au niveau 3
        cursor.execute("""
            INSERT INTO Dossier_Inscription (id, id_utilisateur, id_sujet, annee_universitaire, annee_doctorat, type_dossier, statut, niveau_actuel, date_creation)
            VALUES (102, 4, 2, '2026/2027', 1, 'Inscription', 'En cours', '3_VALIDATION_LABO_STRUCTURE', '2026-10-20 09:30:00')
        """)

        # Dossier Incomplet avec Notification J+5
        date_notif = datetime.now() - timedelta(hours=18)
        date_limite = (date.today() + timedelta(days=5)).isoformat()
        cursor.execute("""
            INSERT INTO Dossier_Inscription (id, id_utilisateur, id_sujet, annee_universitaire, annee_doctorat, type_dossier, statut, niveau_actuel, date_limite_rattrapage, date_notification_rattrapage, date_creation)
            VALUES (103, 6, 3, '2026/2027', 1, 'Inscription', 'Incomplet', '1_DEPOT_CANDIDAT', ?, ?, '2026-10-22 11:00:00')
        """, (date_limite, date_notif.strftime('%Y-%m-%d %H:%M:%S')))

        cursor.execute("""
            INSERT INTO Parametre_Calendrier (nom_phase, date_ouverture, date_cloture) VALUES
            ('Dépôt des nouvelles candidatures', '2026-09-01', '2026-11-30'),
            ('Campagne de réinscription doctorale', '2026-09-15', '2026-12-15'),
            ('Commissions de sélection et validation Pôle', '2026-12-01', '2026-12-30')
        """)

        conn.commit()

    conn.close()

# Décorateur RBAC
def login_required(roles=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "user_id" not in session:
                flash("Veuillez vous authentifier.", "warning")
                return redirect(url_for("login"))
            if roles and session.get("user_role") not in roles:
                flash("Accès non autorisé : Privilèges insuffisants.", "danger")
                return redirect(url_for("login"))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# -------------------------------------------------------------
# PAGE D'ACCUEIL INSTITUTIONNELLE USMBA (ROUTE PUBLIQUE)
# -------------------------------------------------------------
@app.route("/")
def accueil():
    conn = get_db()
    sujets = conn.execute("""
        SELECT s.*, u.nom as nom_directeur 
        FROM Sujet s 
        JOIN Utilisateur u ON s.id_directeur = u.id
    """).fetchall()
    calendrier = conn.execute("SELECT * FROM Parametre_Calendrier ORDER BY date_ouverture ASC").fetchall()
    stats = {
        "total_sujets": len(sujets),
        "total_dossiers": conn.execute("SELECT COUNT(*) FROM Dossier_Inscription").fetchone()[0],
        "total_inscrits": conn.execute("SELECT COUNT(*) FROM Dossier_Inscription WHERE statut = 'Validé'").fetchone()[0]
    }
    conn.close()
    return render_template("accueil.html", sujets=sujets, calendrier=calendrier, stats=stats)

# -------------------------------------------------------------
# SOUMISSION CANDIDATURE : GESTION INCOMPLET & NOTIFICATION J+5
# -------------------------------------------------------------
@app.route("/candidat/soumettre", methods=["POST"])
@login_required(roles=["candidat"])
def soumettre_candidature():
    id_utilisateur = session["user_id"]
    id_sujet = request.form.get("id_sujet")
    master_fourni = "diplome_master" in request.files and request.files["diplome_master"].filename != ""

    conn = get_db()
    candidat = conn.execute("SELECT nom, email FROM Utilisateur WHERE id = ?", (id_utilisateur,)).fetchone()

    # Règle Orthogonale de Complétude Administrative
    if not master_fourni:
        statut = "Incomplet"
        date_limite = (date.today() + timedelta(days=5)).isoformat()
        date_notification = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    else:
        statut = "En cours"
        date_limite = None
        date_notification = None

    cur = conn.execute("""
        INSERT INTO Dossier_Inscription (
            id_utilisateur, id_sujet, annee_universitaire, annee_doctorat,
            type_dossier, statut, niveau_actuel, date_limite_rattrapage,
            date_notification_rattrapage
        ) VALUES (?, ?, '2026/2027', 1, 'Inscription', ?, '1_DEPOT_CANDIDAT', ?, ?)
    """, (id_utilisateur, id_sujet, statut, date_limite, date_notification))

    dossier_id = cur.lastrowid

    # Déclenchement automatique de l'e-mail de notification
    if statut == "Incomplet":
        envoyer_email_rattrapage(
            email=candidat["email"],
            nom=candidat["nom"],
            dossier_id=dossier_id,
            date_limite=date_limite
        )
        flash(
            f"Dossier #{dossier_id} enregistré avec le statut 'Incomplet' (Diplôme Master manquant). "
            f"Un e-mail d'alerte vous a été envoyé. Délai strict de 5 jours accordé jusqu'au {date_limite}.",
            "warning"
        )
    else:
        flash(f"Dossier #{dossier_id} soumis avec succès. Instruction en cours.", "success")

    conn.commit()
    conn.close()
    return redirect(url_for("candidat_dashboard"))

# -------------------------------------------------------------
# WORKFLOW : AVANCEMENT DU NIVEAU ADMINISTRATIF (1 -> 5)
# -------------------------------------------------------------
@app.route("/admin/avancer_niveau/<int:dossier_id>", methods=["POST"])
@login_required(roles=["admin", "pole_doctoral"])
def avancer_niveau(dossier_id):
    conn = get_db()
    dossier = conn.execute("SELECT * FROM Dossier_Inscription WHERE id = ?", (dossier_id,)).fetchone()
    if not dossier:
        conn.close()
        flash("Dossier introuvable.", "danger")
        return redirect(url_for("admin_dashboard"))

    niveaux_order = [
        '1_DEPOT_CANDIDAT',
        '2_AVIS_DIRECTEUR_THESE',
        '3_VALIDATION_LABO_STRUCTURE',
        '4_COMMISSION_CED',
        '5_DECISION_POLE_DOCTORAL'
    ]
    current_niveau = dossier["niveau_actuel"] if "niveau_actuel" in dossier.keys() else '1_DEPOT_CANDIDAT'
    current_idx = niveaux_order.index(current_niveau) if current_niveau in niveaux_order else 0

    if current_idx < len(niveaux_order) - 1:
        nouveau_niveau = niveaux_order[current_idx + 1]
        conn.execute("UPDATE Dossier_Inscription SET niveau_actuel = ? WHERE id = ?", (nouveau_niveau, dossier_id))
        flash(f"Dossier #{dossier_id} transmis au niveau {current_idx + 2}/5 ({nouveau_niveau}).", "success")
    else:
        conn.execute(
            "UPDATE Dossier_Inscription SET niveau_actuel = '5_DECISION_POLE_DOCTORAL', statut = 'Validé' WHERE id = ?",
            (dossier_id,)
        )
        flash(f"Dossier #{dossier_id} validé définitivement par le Conseil du Pôle Doctoral.", "success")

    conn.commit()
    conn.close()
    return redirect(url_for("admin_dashboard"))

# -------------------------------------------------------------
# ACTION ADMIN : RENVOYER LA NOTIFICATION E-MAIL DE RATTRAPAGE
# -------------------------------------------------------------
@app.route("/admin/renvoyer_notification/<int:dossier_id>", methods=["POST"])
@login_required(roles=["admin", "pole_doctoral"])
def renvoyer_notification(dossier_id):
    conn = get_db()
    dossier = conn.execute("""
        SELECT d.*, u.nom, u.email 
        FROM Dossier_Inscription d 
        JOIN Utilisateur u ON d.id_utilisateur = u.id 
        WHERE d.id = ?
    """, (dossier_id,)).fetchone()

    if not dossier or dossier["statut"] != "Incomplet":
        conn.close()
        flash("Action non applicable : le dossier n'est pas incomplet.", "warning")
        return redirect(url_for("admin_dashboard"))

    nouvelle_date_notif = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn.execute(
        "UPDATE Dossier_Inscription SET date_notification_rattrapage = ? WHERE id = ?",
        (nouvelle_date_notif, dossier_id)
    )
    conn.commit()
    conn.close()

    envoyer_email_rattrapage(
        email=dossier["email"],
        nom=dossier["nom"],
        dossier_id=dossier["id"],
        date_limite=dossier["date_limite_rattrapage"]
    )
    flash(f"E-mail de relance renvoyé avec succès au candidat {dossier['email']}.", "success")
    return redirect(url_for("admin_dashboard"))

if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
`
  },
  {
    name: 'templates/accueil.html',
    path: 'templates/accueil.html',
    lang: 'html',
    content: `<!DOCTYPE html>
<html lang="fr" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portail Doctorat - Université Sidi Mohamed Ben Abdellah Fès</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-full flex flex-col text-slate-800">

    <!-- En-tête Institutionnel USMBA -->
    <header class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-md border-b-4 border-amber-500">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-serif font-black text-xl shadow">
                    U
                </div>
                <div>
                    <h1 class="text-base sm:text-lg font-black tracking-tight uppercase">Université Sidi Mohamed Ben Abdellah</h1>
                    <p class="text-xs text-blue-200">Centre d'Études Doctorales (CED) • Portail Public GCD</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ url_for('login') }}" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm">
                    Connexion Institutionnelle
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">

        <!-- Bannière Hero Institutionnelle -->
        <section class="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border-2 border-amber-500/40 space-y-6">
            <p class="text-xs font-mono font-bold uppercase text-amber-400 tracking-widest">
                Royaume du Maroc • Année Universitaire 2026/2027
            </p>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-3xl">
                Portail Officiel des Candidatures & Réinscriptions Doctorales (GCD)
            </h2>
            <p class="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Suivez votre cycle doctoral à l'USMBA : Dépôt D1 avec contrôle de complétude, 
                réinscription annuelle N-1 « Zéro-Saisie » et suivi en 5 niveaux d'instruction.
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
                <a href="{{ url_for('login') }}" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg">
                    Accéder au Portail Candidat 🎓
                </a>
                <a href="#sujets" class="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs border border-blue-700 transition">
                    Consulter les Sujets de Thèse 🔍
                </a>
            </div>
        </section>

        <!-- Les 2 Parcours Doctoraux -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <span class="text-xs font-bold text-blue-900 uppercase">Voie 1</span>
                <h3 class="font-black text-base text-slate-900">Nouvelle Inscription Doctorale (D1)</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                    Dépôt de Master et CIN avec vérification administrative orthogonale et délai de grâce J+5 automatique.
                </p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <span class="text-xs font-bold text-amber-700 uppercase">Voie 2</span>
                <h3 class="font-black text-base text-slate-900">Réinscription Annuelle (D2, D3 & D4+)</h3>
                <p class="text-xs text-slate-600 leading-relaxed">
                    Pré-remplissage 100% N-1, rapport d'avancement annuel, avis CAT/Directeur et gestion des dérogations.
                </p>
            </div>
        </section>

        <!-- Calendrier Officiel -->
        <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-sm text-slate-900 uppercase">Calendrier des Campagnes Doctorales</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {% for cal in calendrier %}
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span class="font-bold text-slate-800 block">{{ cal['nom_phase'] }}</span>
                    <span class="text-slate-500 font-mono text-[11px] block mt-1">Du {{ cal['date_ouverture'] }} au {{ cal['date_cloture'] }}</span>
                </div>
                {% endfor %}
            </div>
        </section>

    </main>

    <footer class="bg-white border-t py-6 text-center text-xs text-slate-500">
        Université Sidi Mohamed Ben Abdellah • Fès, Maroc
    </footer>

</body>
</html>`
  },
  {
    name: 'templates/dashboard_candidat.html',
    path: 'templates/dashboard_candidat.html',
    lang: 'html',
    content: `<!DOCTYPE html>
<html lang="fr" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espace Candidat - Doctorat USMBA Fès</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @keyframes blinkPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.002); }
      }
      .alert-incomplet-blink {
        animation: blinkPulse 2.5s ease-in-out infinite;
      }
    </style>
</head>
<body class="min-h-full flex flex-col text-slate-800">

    <!-- En-tête Institutionnel USMBA -->
    <header class="bg-gradient-to-r from-blue-950 to-blue-900 text-white shadow-md border-b-4 border-amber-500">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-blue-950 text-xl shadow">
                    U
                </div>
                <div>
                    <h1 class="text-lg font-black tracking-tight uppercase">Université Sidi Mohamed Ben Abdellah</h1>
                    <p class="text-xs text-blue-200">Centre d'Études Doctorales (CED) • Espace Candidat</p>
                </div>
            </div>
            <div class="flex items-center space-x-4 text-xs">
                <span class="font-bold text-amber-300">{{ session.get('user_nom') }} (Candidat)</span>
                <a href="{{ url_for('logout') }}" class="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 rounded-lg text-white font-bold transition">Déconnexion</a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        <!-- ============================================================== -->
        <!-- BANNIÈRE D'ALERTE CLIGNOTANTE : DOSSIER INCOMPLET & RELANCE (J+5)-->
        <!-- ============================================================== -->
        {% if dossier and dossier['statut'] == 'Incomplet' %}
        <section class="alert-incomplet-blink rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white p-5 shadow-xl border-2 border-rose-400">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
                        📩 ⏱️
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider">
                                Urgent • Délai de Grâce J+5 Actif
                            </span>
                            <span class="text-xs text-rose-200 font-mono">Dossier N° #{{ dossier['id'] }}</span>
                        </div>
                        <h2 class="text-base sm:text-lg font-black tracking-tight text-white">
                            Complétude Administrative Requise : Diplôme de Master Manquant
                        </h2>
                        <p class="text-xs sm:text-sm text-rose-100 max-w-3xl leading-relaxed">
                            Votre candidature a été instruite avec des pièces manquantes. Une notification formelle avec accusé a été expédiée à votre adresse :
                            <strong class="text-amber-300 underline font-mono">{{ session.get('user_email') }}</strong>.
                        </p>
                        <div class="pt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-rose-200">
                            <span>
                                ⏳ Date limite impérative : 
                                <strong class="text-white font-mono bg-rose-950/80 px-2 py-0.5 rounded border border-rose-400/50">
                                    {{ dossier['date_limite_rattrapage'] }} à 23h59
                                </strong>
                            </span>
                            <span>
                                🛡️ Avertissement : À l'échéance, la fonction <code class="text-amber-300 font-mono font-bold">verifier_delais()</code> basculera le dossier en "Refusé".
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                    <button onclick="document.getElementById('modal-email-preview').classList.remove('hidden')" class="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 font-black text-xs rounded-xl shadow transition text-center">
                        Consulter l'e-mail officiel reçu ✉️
                    </button>
                    <a href="#section-depot-complement" class="px-4 py-2.5 bg-amber-500 text-blue-950 hover:bg-amber-400 font-black text-xs rounded-xl shadow transition text-center">
                        Régulariser mon Master 📄
                    </a>
                </div>
            </div>
        </section>
        {% endif %}

        <!-- ============================================================== -->
        <!-- STEPPER INTERACTIF EN 5 NIVEAUX ADMINISTRATIFS                 -->
        <!-- ============================================================== -->
        {% if dossier %}
        <section class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                Suivi Transparent de l'Instruction Administrative (Workflow en 5 Niveaux)
            </h3>
            
            {% set niv = dossier['niveau_actuel'] %}
            {% set num_niv = 1 %}
            {% if niv == '2_AVIS_DIRECTEUR_THESE' %}{% set num_niv = 2 %}
            {% elif niv == '3_VALIDATION_LABO_STRUCTURE' %}{% set num_niv = 3 %}
            {% elif niv == '4_COMMISSION_CED' %}{% set num_niv = 4 %}
            {% elif niv == '5_DECISION_POLE_DOCTORAL' %}{% set num_niv = 5 %}{% endif %}

            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                <!-- Niveau 1 -->
                <div class="p-3 rounded-xl border {{ 'bg-emerald-50 border-emerald-300 text-emerald-900' if num_niv > 1 else ('bg-blue-50 border-blue-400 ring-4 ring-blue-100 text-blue-950' if num_niv == 1 else 'bg-slate-50 border-slate-200 text-slate-400') }}">
                    <span class="text-[10px] font-black uppercase">Niveau 1</span>
                    <h4 class="font-bold text-xs mt-0.5">Dépôt Candidat</h4>
                    <p class="text-[11px] mt-1">{{ 'Dépôt validé' if num_niv > 1 else ('En cours d’instruction' if num_niv == 1 else 'En attente') }}</p>
                </div>
                <!-- Niveau 2 -->
                <div class="p-3 rounded-xl border {{ 'bg-emerald-50 border-emerald-300 text-emerald-900' if num_niv > 2 else ('bg-blue-50 border-blue-400 ring-4 ring-blue-100 text-blue-950' if num_niv == 2 else 'bg-slate-50 border-slate-200 text-slate-400') }}">
                    <span class="text-[10px] font-black uppercase">Niveau 2</span>
                    <h4 class="font-bold text-xs mt-0.5">Avis Encadrant</h4>
                    <p class="text-[11px] mt-1">{{ 'Avis Favorable' if num_niv > 2 else ('Examen scientifique' if num_niv == 2 else 'En attente') }}</p>
                </div>
                <!-- Niveau 3 -->
                <div class="p-3 rounded-xl border {{ 'bg-emerald-50 border-emerald-300 text-emerald-900' if num_niv > 3 else ('bg-blue-50 border-blue-400 ring-4 ring-blue-100 text-blue-950' if num_niv == 3 else 'bg-slate-50 border-slate-200 text-slate-400') }}">
                    <span class="text-[10px] font-black uppercase">Niveau 3</span>
                    <h4 class="font-bold text-xs mt-0.5">Validation Labo</h4>
                    <p class="text-[11px] mt-1">{{ 'Conforme laboratoire' if num_niv > 3 else ('Évaluation structure' if num_niv == 3 else 'En attente') }}</p>
                </div>
                <!-- Niveau 4 -->
                <div class="p-3 rounded-xl border {{ 'bg-emerald-50 border-emerald-300 text-emerald-900' if num_niv > 4 else ('bg-blue-50 border-blue-400 ring-4 ring-blue-100 text-blue-950' if num_niv == 4 else 'bg-slate-50 border-slate-200 text-slate-400') }}">
                    <span class="text-[10px] font-black uppercase">Niveau 4</span>
                    <h4 class="font-bold text-xs mt-0.5">Commission CED</h4>
                    <p class="text-[11px] mt-1">{{ 'Avis CAT rendu' if num_niv > 4 else ('Commission d’arbitrage' if num_niv == 4 else 'En attente') }}</p>
                </div>
                <!-- Niveau 5 -->
                <div class="p-3 rounded-xl border {{ 'bg-emerald-50 border-emerald-300 text-emerald-900' if dossier['statut'] == 'Validé' else ('bg-blue-50 border-blue-400 ring-4 ring-blue-100 text-blue-950' if num_niv == 5 else 'bg-slate-50 border-slate-200 text-slate-400') }}">
                    <span class="text-[10px] font-black uppercase">Niveau 5</span>
                    <h4 class="font-bold text-xs mt-0.5">Décision Pôle</h4>
                    <p class="text-[11px] mt-1">{{ 'Inscription Validée' if dossier['statut'] == 'Validé' else ('Conseil du Pôle' if num_niv == 5 else 'En attente') }}</p>
                </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Instance de traitement actuelle : <strong class="text-blue-900 font-bold">{{ niv }}</strong></span>
                <span>Statut général : <strong class="font-bold uppercase {{ 'text-emerald-700' if dossier['statut'] == 'Validé' else ('text-rose-700' if dossier['statut'] == 'Incomplet' else 'text-blue-800') }}">{{ dossier['statut'] }}</strong></span>
            </div>
        </section>
        {% endif %}

    </main>

    <!-- Modal d'inspection de l'e-mail officiel de rattrapage -->
    <div id="modal-email-preview" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
                <h4 class="font-bold text-slate-900 text-sm">Copie certifiée de la notification officielle transmise</h4>
                <button onclick="document.getElementById('modal-email-preview').classList.add('hidden')" class="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-700 space-y-2 border">
                <p><strong>De:</strong> no-reply.ced@usmba.ac.ma (Pôle des Études Doctorales USMBA)</p>
                <p><strong>À:</strong> {{ session.get('user_email') }}</p>
                <p><strong>Objet:</strong> [USMBA - GCD] AVERTISSEMENT : Complétude administrative requise (Dossier #{{ dossier['id'] if dossier else '' }})</p>
                <hr class="my-2 border-slate-200">
                <p>Madame, Monsieur {{ session.get('user_nom') }},</p>
                <p>L'instruction administrative a révélé l'absence de votre Diplôme de Master certifié conforme.</p>
                <p class="text-rose-700 font-bold">Délai accordé (J+5) : jusqu'au {{ dossier['date_limite_rattrapage'] if dossier else '' }} à 23h59.</p>
                <p class="text-slate-500 text-[11px]">Passé ce délai, verifier_delais() basculera le dossier en Refusé.</p>
            </div>
            <div class="text-right">
                <button onclick="document.getElementById('modal-email-preview').classList.add('hidden')" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold">Fermer</button>
            </div>
        </div>
    </div>

</body>
</html>`
  },
  {
    name: 'templates/dashboard_admin.html',
    path: 'templates/dashboard_admin.html',
    lang: 'html',
    content: `<!DOCTYPE html>
<html lang="fr" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gouvernance GCD - Pôle Doctoral USMBA</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-full flex flex-col text-slate-800">

    <!-- En-tête Back-Office -->
    <header class="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-md border-b-4 border-amber-500">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center font-black">
                    PED
                </div>
                <div>
                    <h1 class="text-base sm:text-lg font-black tracking-tight uppercase">Pôle des Études Doctorales</h1>
                    <p class="text-xs text-blue-200">USMBA Fès • Module de Gouvernance & Instruction</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <form action="{{ url_for('declencher_verifier_delais') }}" method="POST">
                    <button type="submit" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow">
                        Exécuter verifier_delais() ⏱️
                    </button>
                </form>
                <a href="{{ url_for('logout') }}" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-white">Déconnexion</a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        <!-- Tableau des Dossiers avec Suivi Administratif -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 class="font-bold text-sm text-slate-800 uppercase tracking-wider">Candidatures & Réinscriptions Doctorales</h3>
                <span class="text-xs text-slate-500 font-mono">{{ dossiers|length }} dossier(s) répertorié(s)</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b">
                        <tr>
                            <th class="p-3">ID</th>
                            <th class="p-3">Candidat & Contact</th>
                            <th class="p-3">Type / Cycle</th>
                            <th class="p-3">Niveau Administratif Actuel</th>
                            <th class="p-3">Statut & Échéance</th>
                            <th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {% for d in dossiers %}
                        <tr class="{{ 'bg-rose-50/80 border-l-4 border-rose-600' if d['statut'] == 'Incomplet' else 'hover:bg-slate-50' }}">
                            <td class="p-3 font-mono font-bold text-slate-700">#{{ d['id'] }}</td>
                            <td class="p-3">
                                <div class="font-bold text-slate-900">{{ d['candidat_nom'] }}</div>
                                <div class="text-[11px] text-slate-400 font-mono">{{ d['candidat_email'] }}</div>
                            </td>
                            <td class="p-3 font-medium">
                                <span class="px-2 py-0.5 rounded bg-slate-200 font-bold text-slate-800">{{ d['type_dossier'] }} D{{ d['annee_doctorat'] }}</span>
                                {% if d['annee_doctorat'] >= 4 %}
                                <span class="block text-[10px] text-amber-700 font-bold uppercase mt-0.5">⚠️ Dérogation</span>
                                {% endif %}
                            </td>
                            <td class="p-3">
                                <span class="px-2.5 py-1 rounded-lg text-xs font-bold border {{ 'bg-emerald-50 text-emerald-800 border-emerald-300' if d['statut'] == 'Validé' else 'bg-blue-50 text-blue-900 border-blue-300' }}">
                                    {{ d['niveau_actuel'] }}
                                </span>
                            </td>
                            <td class="p-3">
                                <span class="px-2 py-0.5 rounded-full font-bold text-[11px] uppercase {{ 'bg-emerald-100 text-emerald-800' if d['statut'] == 'Validé' else ('bg-rose-100 text-rose-800 animate-pulse' if d['statut'] == 'Incomplet' else 'bg-blue-100 text-blue-800') }}">
                                    {{ d['statut'] }}
                                </span>
                                {% if d['statut'] == 'Incomplet' %}
                                <div class="text-[10px] text-rose-700 font-mono font-bold mt-0.5">
                                    Échéance : {{ d['date_limite_rattrapage'] }}
                                </div>
                                {% if d['date_notification_rattrapage'] %}
                                <div class="text-[10px] text-blue-900 font-mono mt-0.5">
                                    📩 Relance : {{ d['date_notification_rattrapage'] }}
                                </div>
                                {% endif %}
                                {% endif %}
                            </td>
                            <td class="p-3 text-right space-x-1 whitespace-nowrap">
                                <button onclick="ouvrirFicheSynthetique({{ d['id'] }})" class="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded text-xs">
                                    Fiche
                                </button>
                                {% if d['statut'] != 'Validé' and d['statut'] != 'Refusé' %}
                                <form action="{{ url_for('avancer_niveau', dossier_id=d['id']) }}" method="POST" class="inline">
                                    <button type="submit" class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs" title="Transmettre au niveau suivant">
                                        ➜ Transmettre
                                    </button>
                                </form>
                                {% endif %}
                            </td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <!-- Fiche Synthétique Consolidation (Tiroir Modal JS) -->
    <div id="drawer-fiche" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end hidden">
        <div class="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col p-6 space-y-4 overflow-y-auto">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 class="font-black text-slate-900 text-base">Fiche Synthétique Candidat</h3>
                <button onclick="document.getElementById('drawer-fiche').classList.add('hidden')" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <!-- Bloc Accusé Notification E-mail de Relance (J+5) -->
            <div id="fiche-bloc-incomplet" class="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl space-y-2 hidden">
                <div class="font-bold text-rose-900 text-xs uppercase flex items-center gap-1.5">
                    <span>⚠️</span> Complétude Administrative en Attente (Délai J+5)
                </div>
                <p class="text-xs text-rose-800">
                    Diplôme de Master non fourni. Échéance stricte fixée au <strong id="fiche-date-limite" class="font-mono"></strong>.
                </p>
                <div class="p-2.5 bg-white rounded-lg border border-rose-200 text-xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 block uppercase">Preuve de Notification</span>
                        <span id="fiche-preuve-email" class="font-mono text-slate-800 font-semibold"></span>
                    </div>
                    <form id="form-renvoyer-notif" method="POST" action="">
                        <button type="submit" class="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-bold">
                            Renvoyer ✉️
                        </button>
                    </form>
                </div>
            </div>

            <div id="fiche-details" class="space-y-4 text-xs text-slate-700">
                <!-- Rempli dynamiquement en JS -->
            </div>
        </div>
    </div>

    <script>
    function ouvrirFicheSynthetique(dossierId) {
        fetch('/api/dossier/' + dossierId)
            .then(res => res.json())
            .then(data => {
                const bloc = document.getElementById('fiche-bloc-incomplet');
                if (data.statut === 'Incomplet') {
                    bloc.classList.remove('hidden');
                    document.getElementById('fiche-date-limite').textContent = data.date_limite_rattrapage || 'N/A';
                    const preuve = data.date_notification_rattrapage
                        ? 'E-mail de relance transmis le ' + data.date_notification_rattrapage
                        : 'En attente de transmission';
                    document.getElementById('fiche-preuve-email').textContent = preuve;
                    document.getElementById('form-renvoyer-notif').action = '/admin/renvoyer_notification/' + data.id;
                } else {
                    bloc.classList.add('hidden');
                }
                document.getElementById('drawer-fiche').classList.remove('hidden');
            });
    }
    </script>

</body>
</html>`
  },
  {
    name: 'Instructions Déploiement',
    path: 'README.md',
    lang: 'markdown',
    content: `# Procédure de déploiement GCD USMBA Fès

1. Prérequis :
   - Python 3.11+
   - pip

2. Création de l'environnement virtuel :
   python3 -m venv venv
   source venv/bin/activate  # ou venv\\Scripts\\activate sous Windows

3. Installation des dépendances :
   pip install flask werkzeug

4. Lancement :
   python app.py

5. Comptes de test pré-configurés (Mot de passe commun : Usmba2026!) :
   - Nouveau Candidat : youssef.candidat@usmba.ac.ma
   - Doctorante N-1 : salma.doctorante@usmba.ac.ma
   - Directeur de Thèse : alami.directeur@usmba.ac.ma
   - Pôle Doctoral : pole.doctoral@usmba.ac.ma
   - Administrateur : admin.gcd@usmba.ac.ma`
  }
];

export const SourceCodeViewerModal: React.FC<SourceCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = FILES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Livrables du Projet GCD (Flask & SQLite)</h3>
              <p className="text-xs text-slate-400">Architecture complète pour l'Université Sidi Mohamed Ben Abdellah</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs">
          {FILES.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="relative flex-1 overflow-y-auto p-4 bg-slate-950/80 font-mono text-xs">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </button>
          </div>

          <pre className="text-slate-300 leading-relaxed overflow-x-auto">
            <code>{currentFile.content}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{currentFile.path}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
