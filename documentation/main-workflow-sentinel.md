
# Architecture et fonctionnement

## Acteurs et rôles

### 1. Fournisseur

- Envoie une **liste de serveurs prêts à l’emploi** sous forme de fichier CSV.
- Cette liste est ensuite intégrée dans le système Sentinel.

### 2. Sentinel

- **Interface d’administration** permettant de :
    - Consulter les ressources disponibles.
    - Ajouter de nouveaux serveurs via l’import d’un fichier CSV.

- **Persistance des serveurs en sessions** :
    - Exemple : _Session 1 → 100 serveurs ajoutés à une date donnée._

- **Initialisation des serveurs avec Ansible** :

    - Un microservice de Sentinel génère un fichier de configuration Ansible unique.
    - Cette configuration est appliquée de manière identique à tous les serveurs.

- **Gestion des IP disponibles** :
    - Une fois les serveurs initialisés, Sentinel répond aux requêtes de l’application **CollectVerything** (service configuration).
    - Il fournit une IP disponible qui est ensuite attribuée à l’utilisateur.

- **Observabilité** :
    - Interface intégrée pour consulter les **logs** et **métriques** de l’ensemble des machines et autres ....


### 3. CollectVerything

- **Service de configuration** :

    - S’appuie sur **Sentinel** pour obtenir une IP disponible et la fournir au client lorsqu’il doit déployer une nouvelle configuration.
    - Déploie automatiquement l’environnement une fois la configuration terminée grâce à la CI/CD. Une requête part du service de config vers l’**action/workflow** de l’application générique client, laquelle est personnalisée en fonction de l’objet reçu dans le workflow. À ce stade, une image dédiée est buildée puis déployée sur le serveur assigné par Sentinel.

- **Produit client** :
    - Possede deux agents qui collectent des données (logs, métriques, autres) et les envoient à Sentinel pour l’observabilité.

## Technologies utilisées

- **Nginx** → Proxy / serveur web.
- **React** → Interface utilisateur (front-end).
- **Ansible** → Automatisation de la configuration des serveurs.
- **Grafana** → Visualisation et tableaux de bord des métriques.
- **Loki** → Agrégation et gestion centralisée des logs.
- **FluentBit** → Collecte et envoi des logs vers Loki.
- **Docker** → Conteneurisation des services.
- **GitHub Action** → Ci CD auto


## 📌 **Note sur la scalabilité**

Pour l’instant, la scalabilité n’est pas encore un enjeu prioritaire. L’orchestration avec **Kubernetes** n’étant pas encore maîtrisée dans notre stack, nous restons sur une approche plus simple avec **Docker Compose** et du déploiement direct.
Cela permet d’avancer efficacement sur la mise en place de la CI/CD et du monitoring, sans complexifier inutilement l’infrastructure.  
La question du passage à Kubernetes (et donc de la montée en charge, de l’auto-scaling et de la haute disponibilité) sera traitée ultérieurement, une fois les bases bien stabilisées.


## 📌 Note sur l’app en général

Pour des raisons de performance, l’application a été découpée en plusieurs parties.  
L’app principale de notre boutique tourne en **local** : lors d’une simulation, un client potentiel navigue normalement jusqu’à la **page de configuration**.

- En local, cette page sert juste de simulation.
- Mais lorsqu’on clique pour **déployer la boutique**, l’utilisateur est redirigé vers notre **config**.

Ce serveur affiche une page identique à celle de l’app locale, sauf qu’ici l’action déclenche un **vrai déploiement**. Une fois la configuration validée, le système déploie le site web sur un autre serveur : le **product**.

Enfin, la gestion de l’infrastructure est assurée par le serveur **sentinel**, qui tourne sur un serveur séparé.

Au total il y'a 3 serveur un local.