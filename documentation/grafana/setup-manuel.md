

## 🎯 Objectif

Mettre en place à l amain une collecte locale des **logs** et des **métriques** sur une application React servie par **nginx + Docker**, afin de valider que les agents remontent bien les données avant de les envoyer vers le serveur central **Sentinel**.

## ⚙️ Décisions prises
- 📡 **Logs → Push** : utilisation de **Fluent Bit** pour collecter les logs (nginx + système) et les envoyer (stdout pour l’instant, puis Loki plus tard).
- 📊 **Métriques → Pull** : utilisation de **Node Exporter** pour exposer les métriques système, qui seront scrappées par Prometheus (plus tard depuis Sentinel).
- 📂 Les logs nginx sont montés depuis le conteneur vers le host (`./logs/nginx`) pour être accessibles à Fluent Bit.
- 🛡️ Le serveur central de supervision a été nommé **Sentinel** (gardien de l’infra).

### État actuel du serveur Sentinel

Pour le moment, **le serveur Sentinel n’est pas versionné ni intégré dans un processus CI/CD**.  
Dans le répertoire `/root`, on trouve un dossier `/sentinel` contenant :

- `docker-compose.yml`
- `grafana/` (répertoire)
- `prometheus.yml`


Le fichier **docker-compose.yml**  et  **prometheus.yml**  ont été rédigé manuellement, tandis que le répertoire **grafana/** a été générés automatiquement lors du déploiement via Docker Compose.

# 1. Configuration
### 🐳 Docker Compose

Check Collect-Verything/sentinel/docker-compose.yaml


### 🗿 Prometheus

Check Collect-Verything/sentinel/prometheus.yaml

Le troisieme element grafana sera generé automatiquement, plus tard on ajoutera le provisionning et dashboard à la main pour tout automatiser

### Demarage de la stack

```bash
docker-compose up -d --build
```

### Services et interfaces disponibles

- **Grafana** : accessible sur le port **3000**
- **Prometheus** : accessible sur le port **9090**

---

### Deroulé des actions effectuées

- Configuration de **Grafana** avec une source de données **Loki**.
- Vérification des premiers logs grâce à des **requêtes simples**.
- Création d’un **dashboard personnalisé** en important un objet **JSON**.
- Ajout d’une **adresse e-mail Collect Verything** comme _contact point_ pour les alertes avec la config smtp sur que l'on peut voire dans l'extrait du docker compose au dessus.
- Mise en place d’une **alerte** : lorsqu’il y a plus de 20 requêtes en moins de 20 secondes, un e-mail est automatiquement envoyé à `collect...@gmail.com`.


# 1.  Interface Grafana config

Connections > Datasource > Choisir Loki > Installer

# 2.Exemple de requête simple & verification des logs

Explore > Switcher Builder et ce mettre en code > Taper la query > Lancer le live > Les logs apparaissent en bas

Voici un exemple de requete tres simpe qui necessite biensur d'avoir configuré l'app et serveur sur le squel on ecoute, ici produits-Cms-Ui:

##### Voir tous les logs Nginx (access + error)

```logql
{job="nginx"}
```
##### Séparer **access logs**

```logql
{job="nginx"} |= "GET"
```

ou plus large (tout access car ils passent dans `/dev/stdout`):

```logql
{job="nginx"} |~ "HTTP"
```

##### Séparer **error logs**

```logql
{job="nginx"} |= "error"
```

#####  Filtrer par **status code**

- Tous les **erreurs 4xx**

```logql
{job="nginx"} |~ " 4[0-9]{2} "
```

- Tous les **erreurs 5xx**

```logql
{job="nginx"} |~ " 5[0-9]{2} "
```

- Exemple : uniquement **404**

```logql
{job="nginx"} |= " 404 "
```

##### Nombre de requêtes par seconde (RPS)

```logql
rate({job="nginx"}[1m])
```

##### Nombre de 500 par seconde

```logql
rate({job="nginx"} |~ " 500 "[1m])
```

##### Pourcentage d’erreurs (error rate)

```logql
sum(rate({job="nginx"} |~ " 5[0-9]{2} "[1m]))
  /
sum(rate({job="nginx"}[1m]))
```

##### Logs système (syslog, auth.log)
- Voir les logs du système :
```logql
{job="nginx", filename="/var/log/syslog"}
```
- Voir les logs d’authentification :
```logql
{job="nginx", filename="/var/log/auth.log"}
```

C'est a partir de ce genre query que je vais baser mon dashboard

# 3.Creation dashboard important en 3 points

### 🔹 1. Logs applicatifs (ton client/nginx)

Évidemment, pour que ça marche vraiment, il ne suffit pas de croiser les doigts : il faut **configurer correctement l’application** que l’on veut écouter.  
Dans notre cas, l’app **Produits-Cms-Ui** a deux fichiers  : `fluent-bit.conf` et `parsers.conf`.

Plutôt que de me répéter, je te renvoie à la fiche **Suivi et mise en place de Product** où tout est déjà décortiqué. Mais voici le rappel des bases:

- **Respecter la définition des `job`** pour une identification claire des flux de logs.
- Bien configurer les **`Match`** (y compris les `*` globaux) en tenant compte de leur priorité.
- Soigner les **bindings de volumes dans le `docker-compose.yml`**, afin que Fluent Bit puisse accéder aux bons répertoires de logs.
-  ...

Tout ça est expliqué en détail dans l’autre fiche, mais retiens qu’ignorer ces points, c’est comme brancher une prise sans électricité : ça fait joli, mais ça sert à rien.

*Plan de notre dashboard*:
- 📈 un graphe du trafic ->  Vue d’ensemble (requêtes / erreurs)
- 🔴 un graphe d’erreurs -> Vue d’ensemble (requêtes / erreurs)
- 📊 un top des endpoints -> Codes HTTP (200, 404, 500) & Top endpoint
- 📜 un panneau de logs bruts -> Logs système (auth, syslog)

Dashboard > New > New Dashboard > Import Dashboard (en bas a droite) > Coller > Ok ------ Consulter le dashboard dans les panels.

Telecharger JSON : https://grafana.com/grafana/dashboards/1860-node-exporter-full/
ref : 1860-node-exporter-full

👉 Tu peux les mettre dans un panel **"HTTP Traffic"** avec un **Pie Chart** ou un **Bar Chart**.

##### 4. Activer SMTP dans Grafana avec Gmail

L'envoi de mail n'est aps auto, il faut le configurer dans le docker compose.

Il y a **2 façons** :
- **A. Avec un fichier `grafana.ini` monté en volume**
- **B. Avec des variables d’environnement (plus simple)** ✅ → on part là-dessus pour éviter les galères.

##### Modifier ton `docker-compose.yml` (serveur Sentinel)

Ajout des variables env Gmail :

```yaml
grafana:
  image: grafana/grafana:latest
  container_name: grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SMTP_ENABLED=true
    - GF_SMTP_HOST=smtp.gmail.com:587
    - GF_SMTP_USER=ton.email@gmail.com
    - GF_SMTP_PASSWORD=xxxxxxxxxxxxxxxx // pas d espace ni de quote
    - GF_SMTP_SKIP_VERIFY=true
    - GF_SMTP_FROM_ADDRESS=ton.email@gmail.com
    - GF_SMTP_FROM_NAME=Grafana
```

⚠️ Important :
- Créer un **App Password** dans ton gestionnaire de mail.  (chiant a trouver)
##### Redémarrer Grafana

```bash
docker-compose down
docker-compose up -d
```

##### Vérifier

1. Connecte-toi à Grafana → ⚙️ → Alerting → Notification channels.
2. Envoie un test email.
3. Tu devrais recevoir un mail depuis ton Gmail.
4. Sinon spam la page de l'app avec ctrl + r pendant 10 seconde et un mail sera envoyé


# 5 Mise en place d’une **alerte**

Inutile de rêver : si tu n’as pas configuré ton **Contact Point**, tu ne recevras strictement rien. Commence donc par aller le créer :

**Contact Points > Create contact point**

👉 Donne-lui un nom + choisis le type d’intégration (ici : **Email**) + ton adresse mail (exemple : `sxyprn@pormanov.org`).

Une fois sauvegardé, direction **Alert rules** pour créer une règle d’alerte :

**Alert rules > + New alert rule**

- Donne un nom à ton alerte (exemple : _20 R IN 20 S_ → 20 requêtes en 20 secondes).
- Défini la **source** : dans notre cas, c’est simple, on n’a que **Loki**.
- Ajoute ta **requête** (celle que tu as testée dans l’explorateur de logs, mais ici dans la zone code).() sum(rate({job="nginx"} |~ " 5[0-9]{2} "[5m])) > 5)
- Plus bas : crée un **folder**, choisis un **intervalle** (ou laisse celui par défaut).
- Très important : assigne ton **Contact Point** (l’adresse email qu’on vient de configurer).
- Tu peux personnaliser l’**objet** et le **message** du mail (exemple : _⚠️ Trop de requêtes détectées_ → « Ici, il y a beaucoup de requêtes d’un coup, check ça vite »).

Ensuite, tu sauvegardes.
Maintenant, tu peux retourner sur ton app, **spammer `Ctrl + R`**, et constater :

- Un **mail** envoyé automatiquement.
- Une **notification** visible directement dans Grafana.
- Et dans ton **dashboard**, un joli **pic de requêtes** sur le diagramme.



