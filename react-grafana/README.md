# Dashboard React Grafana COVID

Ce projet est un tableau de bord interactif pour visualiser les données COVID utilisant React et des composants de visualisation modernes.

## Prérequis

- Node.js (version 12 ou supérieure)
- npm (généralement installé avec Node.js)

## Installation

1. Clonez le dépôt :
```bash
git clone [URL_DU_REPO]
cd react-grafana-dashboard-master
```

2. Installez les dépendances :
```bash
npm install
```

## Démarrage du projet

Pour lancer le projet en mode développement :
```bash
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts disponibles

- `npm start` : Lance l'application en mode développement
- `npm test` : Lance les tests
- `npm run build` : Crée une version de production
- `npm run eject` : Éjecte la configuration (⚠️ attention : opération irréversible)

## Technologies utilisées


- React 16.7
- Redux pour la gestion d'état
- Styled Components pour le styling
- Recharts pour les graphiques
- React Grid Layout pour la mise en page
- PapaParse pour le parsing de données

## Structure du projet

```
src/
  ├── components/     # Composants React
  ├── graphs/        # Composants de visualisation
  └── App.jsx        # Point d'entrée de l'application
```
