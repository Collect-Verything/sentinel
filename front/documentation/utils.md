### 📦 Ajout de dépendances dans Docker

Quand j'ajoute une lib, il faut penser à l’installer **dans le conteneur**en plus du local :

```bash
docker compose exec client-dev npm install <ma-lib>
```

J’aurais pu binder le dossier `node_modules` avec 

 ```yaml
 - ./node_modules:/app/node_modules
 ```

mais comme ce montage m’a déjà causé des soucis de compatibilité, je préfère maintenant installer les dépendances **directement dans le conteneur**.
