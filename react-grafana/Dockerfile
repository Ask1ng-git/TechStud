# Étape de build avec Node.js
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Correction de l'erreur Webpack avec OpenSSL
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Construire l'application React
RUN npm run build

# Utilisation de Nginx pour servir le frontend
FROM nginx:alpine

# Copier les fichiers build dans Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Ajouter la config nginx personnalisée
COPY default.conf /etc/nginx/conf.d/default.conf

# Exposer le port 3000
EXPOSE 3000

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]


