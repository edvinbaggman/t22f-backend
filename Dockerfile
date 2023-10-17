# Utilisez une image Node.js officielle comme image de base
FROM node:16

# Définissez le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

ENV FIRESTORE_KEY_LOCAL='{"type":"service_account","project_id":"takes-two-to-fwango","private_key_id":"c4b96ebd425dbfc3be3d4bc9035fa8a593e1a4ac","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2JF1oh/zjy8q/\nt0z/4nRWTrP3DQosH0bSfu+TrQYp/68LqBQrYWerlvgP18FlAuKmltJl5JLrFLD1\njFaoILdhLQoERdQp4A/vPtd8rWpyaZROFe0MhDX9AGf9UNO0B7pDLGJPz4rYYnFo\nT9d/3RDcOzMhZkBX7uHakzllTBJgjDfQYJtV135dtdjPdBeFUJQGj6YYzBBIyE/h\ntj16czSs9c2CCwnu48iZn4c71kgxCJt7AC66bRD4aoaw2WvWWIzkInyIkzX/duZR\nx1udrJQbBhjfvo+CCDAPLzyBQ86JcR2SuPhWZZjmrjAGyrE/JRr8f/hGEO0qHw25\nedQUHMYrAgMBAAECggEABDdvoXmzHTOSDtciUAgriPX1zOx/MEn3EezAr2qsKlu8\nxH3Qcw1PC5YJScCaaF66kCsMqtwxmddBniWbZKABRB15TmOux4YO3bXW4jrXgdeM\n3d6RvXOawQUkjc+JtHC7W05okOVtQZjMfE2Lim5miK/8J96d8wsuLP5chUpPYJnE\nYLCc9ztcIPqurpz7II8veSAwg/2+1tS98PDElU88LIsPHBVUO0kwi570xHwx59ro\noSbF4vEtfNQX/YidaMNTXg9GtDScG5q2FNfwwC5TFnBJeKiDlsQTeJYee1RSd/oN\nLs7/kEgJPIzRHyORcexQ8HgGK2m2uqlYKufcLBOJmQKBgQDkp/oJC0HiZcNZ8t4l\n4U+41W6FW6ZdxBTW8ca60LOEirNy22cH7AWICpsSeLt2E8A9rVAFPZvLHHO2ebvI\nD2IX+2ETICF8QfJBnvIJzfP/B6nOKj/fOdX44KmN0k/PDodZazDD9Eieq24K5ukd\n2l8kr9RW4JabCmoowP4BgS72AwKBgQDL7Gqt4K0PEseqbhCEkwyFiMKVgGLy5/z+\nxSA2+Nw1BbtPzLqfHN3jDgwDBCFrfJCzSTgSeaD4WjFWwquj8Dw08xvICyo2kYlr\nxOmUf2sWXfZ5oG77jA5nVAz3+sbPl9kQBlEbHC8AQ2Wo4uhPnqI2n8AxXdkgT8iq\nUil3aUWquQKBgHbz5CG8V4QeCKjMrkDqm/y+HAcIjN4O2gCQOyCI3js/pOdFuK3o\nXWBOlCnh4TQmRkZP2WdAi8H4hUISxlvnlNKBFhlLB+CKtirpM2ViXWL5a58zX5MT\nlXsp9UswdBB1sHgWSYJHnVfeOxs00WWUaxa82ixwHil+G4gkDoBd4j5dAoGADoJg\nyMReq97jM/4m0LgBwRKM/cQnxi65cosmEqM8T817mV7wvFd6dihOtHw7wIEZbpg8\nFBxxVppcPlcVjVGPhxjxFhetRjqus2tMT1ONlAbVfavrmZxKfhGd5psCQE0GlbxN\nUwd7VKJ2/kA+1UNtOUO+kgSiaUkj9vJnnuZvnYkCgYEA0XoE7LHlUWk1i/nni349\nSUbJ19nBG1rNn+fD8RVuBvR2HQPYG+4RI28VhDRvn8wqkl5qWIOboimgq3nS2ML2\nqERb7w2nVhQ8ZMYI7K3ldP7n2FmAaYoxnp+vNwsscd7f27sktlD6pIhNWyu6bz76\nAWGllPUoM1Y/ZqtO089hXpY=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-49t68@takes-two-to-fwango.iam.gserviceaccount.com","client_id":"109250301655569024779","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-49t68%40takes-two-to-fwango.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'
ENV GCP_KEY_LOCAL='{"type":"service_account","project_id":"takes-two-to-fwango","private_key_id":"5d23d241ec59bd1f015ab48144cfb3151411009c","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3zMLznZB3ee3Z\nnXGOSnOyroVZKAff/HjfC5f4NMtgR0yL4Jewyxxwu5Pm2KIBXYAoyGxQT15+z0np\nlqFX82xQ6uuuihJXIJj+SxG9y7Cm4NI68OzcbkB8okcBmRiNeFse3nipTanktuvi\nEZjjTmhJJQfmPdYfi0sG2+CPDhoNyM5pJ3QcwZkovSz22XnXpcJQECvb58YmnLhI\nqXJ2qpfYNYiYfv9kihkll5qGfyQ8ugxLzXe98dugJsvHkTKZgX5jjL0pJQ5tkMZH\nXQE11mYA9j9yJpWcYKp17sfNAzY+1vq7V16+UCm+f7szFRsnvNJ0cOPlPtlgWz0T\n6o88g7N/AgMBAAECggEACFzyye7zcdxEbFBzqEvO8+RpAOOHaDOutEdsxMhyMJFN\n9Fdlz4+OXbrLQge9Z15/xFtKQmU6IX8BF/XYpY3X8d6elrSFnR1ImNmFlyM7iHxW\nVIQ94tHJcWJY5MO4kEdXrhHlX56/Cj8ggIrYcA9TQ3DB6UILCihmY4uBrkCwAsx6\nYSHiP1AUpwHGHF/haeL2AIYztR6Yv1XWBesAQhHars+XWGa75ATipoU+us4VaHoy\nrLz3733Eoz6J4GWlXW+R2lHYKKKSTAAsAOQHCfa4/W3PFpugdFKp7A6oWWND2UwC\nPysh72ems8+Z++zHjMTEOVTe82SWF5zghBSMmGLHsQKBgQD2eByn8pFJtbzyfde8\nksRWX/XxG0nN0hwG6h57W542Yd3nZW1vFSk2d6LmeESqVa5N61BuvitW7NUBwL2g\nlME2EZJPHmHh3deTQhEnW3LjEMXYy7BOq6bY41ut4jeJ9sFOVAMRBo9gnJ8D+YTv\naV2Ds1aQ+aOwLFbjLHB072/lMwKBgQC+6ENWywpeSyFxDz4F6rUiJwcmuN1WbQFZ\nT1h4pRU+jPuWNicAMRfbWPmTQdbfq6wuaiJSRjJVOag6aGQo2ONepnqldX7CO2FK\nR72FNRCr9fVK+KS3PAE5Ny6fqkVMxReZ7lYY9fFd3jQBnDkqaKscyDhYvEHsO9Tz\nqZMcy9fghQKBgQDM5sZMCaknsmNG5b/5EbsQY+6/Z4RQDCEoznJQ87XwWCR3Pydf\ndiQxF/zhxZKwWVLzjHHt30OAnJvpPSdo3MJUBP+xrvyJHjkeP4qrQaedhlA1EAGf\nJa0sGrgZMzwhAndqewWhneaM1yiL0WDm+J2549pP5Hpk+Dez3ToQvQ41aQKBgQCt\nnmnve0R4sPc+7U/I7cXBw6C7VJDnUsdRQ9oADpKdinYcDC+3+u3pbKe9hrk2Pdif\ndaK1FGYeIAug4uOESoutvtX3uD2Jw5sdhNUVWkdJPKzSfALBKe8q68aZKq9PvEdU\nlO70UGgsqDK/7CYJLZvA1053VO7XOyrWVrgWDkTMSQKBgEHurPE6xQ7+niVp1Avj\nNmc0jQFiB0Li+NJ/cZopH/y1y4Pprogdw260NTz91V0mwI90nizy6GfyTgAFcHez\n78BqL4F4lA9LLlayAKUelyrN78YWAEaWoMp9kpgGIXUagN2p3pqTzzGd9rYrLnj/\nriK25d7vGwOamp22hzYlL0JT\n-----END PRIVATE KEY-----\n","client_email":"takes-two-to-fwango@appspot.gserviceaccount.com","client_id":"105757856409055578426","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/takes-two-to-fwango%40appspot.gserviceaccount.com","universe_domain":"googleapis.com"}'

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
