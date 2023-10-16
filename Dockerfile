# Utilisez une image Node.js officielle comme image de base
FROM node:16

# Définissez le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

ENV FIRESTORE_KEY=$FIRESTORE_KEY
ENV GCP_KEY=$GCP_KEY

# Copiez les fichiers package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances de l'application
RUN npm install

# Copiez le reste du code de l'application dans le conteneur
COPY . .

# Exposez le port que NestJS utilise
EXPOSE 8080

# Définissez la commande pour exécuter votre application
CMD ["npm", "run", "start"]
