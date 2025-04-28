# 📊 MSPR TechStud – Dashboard Grafana avec PostgreSQL et React

Bienvenue dans le projet **MSPR TechStud** ! Ce projet propose une plateforme de visualisation de données COVID en temps réel via un dashboard Grafana connecté à une base PostgreSQL, un backend Node.js et une interface React, le tout exécuté avec Docker.

---

## 🎯 Objectif

Proposer un outil intuitif, simple à déployer, permettant de visualiser les statistiques de la COVID-19 par pays, pour l’analyse et la prise de décision rapide.

---

## 🧰 Stack Technique

- ⚛ **React** (frontend)
- 🐘 **PostgreSQL** (base de données relationnelle)
- 🧠 **Node.js + Express** (API backend)
- 📊 **Grafana** (visualisation des données)
- 🐳 **Docker + Docker Compose** (environnement isolé et reproductible)

---

## ⚙️ Prérequis

Avant tout, il vous faut :

- ✅ [Docker Desktop](https://www.docker.com/products/docker-desktop) installé et lancé
- ✅ [Git](https://git-scm.com/) pour cloner le dépôt
- (optionnel) [Node.js](https://nodejs.org/) pour tester React/Node.js localement

Aucun besoin d'installer PostgreSQL ou Grafana localement ! 🎉

---

## 🚀 Déploiement Automatique

1. **Cloner le projet**

```bash
git clone https://github.com/ton-utilisateur/MSPR-techstud.git
cd MSPR-techstud
```

2. **Lancer le projet**

```bash
docker compose up --build
```

3. **Accéder aux interfaces**

- 🌐 Frontend : [http://localhost:3000](http://localhost:3000)
- 🖥️ Backend : [http://localhost:3005](http://localhost:3005)
- 📊 Grafana : [http://localhost:3001](http://localhost:3001)


---

## 🗂 Structure du projet

```
MSPR-techstud/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   └── ...
├── react-grafana-mspr/
│       ├── Dockerfile
│       └── package.json
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   └── Dashboard-covid.json
│       └── datasources/
│           └── datasource.yaml
│       └── dashboards.yaml
└── dump.sql  
```

---

## 🐘 PostgreSQL via Docker

- Aucun besoin d'installation locale de PostgreSQL ! ✅
- L'image Docker gère automatiquement la création de la base `mspr` avec les tables et données via `dump.sql`

**Configuration** :

- **Utilisateur** : `postgres`
- **Mot de passe** : `postgres`
- **Port** : `5433` (en local)

---

## 📈 Grafana & Dashboards

- Datasource PostgreSQL automatiquement provisionnée
- Dashboard prédéfini chargé via le fichier `Dashboard-covid.json`

**Accès direct au dashboard :** [http://localhost:3001/d/befkuqc7pdbeoc](http://localhost:3001/d/befkuqc7pdbeoc)

## ➕ Ajouter un nouveau dashboard

1. Créez-le sur Grafana local (ou sur l'instance Docker)
2. Cliquez sur "Partager" > "Exporter JSON"
3. Placez-le dans : `grafana/provisioning/dashboards/`
4. Redémarrez Grafana :

```bash
docker restart grafana
```


> 🔧 En cas de souci d'affichage (erreur `X-Frame-Options`), ajoutez la variable suivante dans `docker-compose.yml` puis redémarrez Grafana :
>
> ```yaml
> environment:
>   - GF_SECURITY_ALLOW_EMBEDDING=true
> ```

---

## ⚠️ Dépannage courant

### `ECONNREFUSED` (connexion base)
- Attendez que les services soient bien tous lancés
- Vérifiez que le port `5432` est bien libre sur votre machine

---

## 🧪 Vérification

Vérifiez que tout fonctionne :

```bash
docker ps
```

Vous devriez voir les services suivants actifs :

- `frontend`
- `backend`
- `grafana`
- `postgres_db`

---

## 🧹 Nettoyage

Pour tout arrêter proprement :

```bash
docker compose down -v
```

---

## ♻️ Réinitialiser le projet

```bash
docker-compose down -v
docker-compose up --build
```

---

## 💬 Contacts
👩‍💼 Ceyda Kaplan – Cheffe de Projet [Contacter par mail](mailto:ceyda.kaplan@ecoles-epsi.net?subject=Demande%20de%20contact%20au%20Sujet%20de%20Tech%20Stud&body=Bonjour%20Ceyda,)

📋 Bouh Mahamoud Farah – Product Owner [Contacter par mail](mailto:bouh.mahamoudfarah@ecoles-epsi.net?subject=Demande%20de%20contact%20au%20Sujet%20de%20Tech%20Stud&body=Bonjour%20Bouh,)

🎨 Alex Chassauroux – Développeur Front-End [Contacter par mail](mailto:alex.chaussaroux@ecoles-epsi.net?subject=Demande%20de%20contact%20au%20Sujet%20de%20Tech%20Stud&body=Bonjour%20Alex,)

👨‍💻 Dylan Gay – Développeur Solution IA – [Contacter par mail](mailto:dylan.gay@ecoles-epsi.net?subject=Demande%20de%20contact%20au%20Sujet%20de%20Tech%20Stud&body=Bonjour%20Dylan,)

---

## 👤 Auteurs

Projet réalisé dans le cadre d’un MSPR – TechStud au sein de l'école EPSI.
Ce projets a était dérouler par Ceyda Kaplan, Bouh Mahamoud Farah, Alex Chassauroux, Dylan Gay  



## 📄 Licence

Ce projet est distribué sous licence **MIT**.

---

📢 Propriété intellectuelle :
Ce projet, son code source et ses ressources sont la propriété exclusive de ses auteurs. Toute reproduction, diffusion ou utilisation non autorisée est strictement interdite.

⚠ Toute violation peut engager la responsabilité civile et pénale de son auteur, y compris des peines pouvant aller jusqu'à 3 ans d’emprisonnement et 300 000 euros d’amende (articles L335-2 et suivants du Code de la Propriété Intellectuelle).

---

> "Un dashboard clair vaut mille mots. Merci d’utiliser MSPR TechStud 💡"

✨ Bon dashboarding !
