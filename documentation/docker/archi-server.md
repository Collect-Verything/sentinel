# 📓 Rappel – Répertoires bindés pour Node Exporter

Dans ton `docker-compose.yml` :

```yaml
volumes:
  - /:/host:ro,rslave
  - /proc:/host/proc:ro
  - /sys:/host/sys:ro
```

---

## 🔹 1. `/` (root du système)

* C’est la racine du **système de fichiers hôte** (tout le disque).
* Monté en **lecture seule** (`ro`) dans le conteneur, sous `/host`.
* Utilité pour Node Exporter :

    * Pouvoir explorer la structure du système de fichiers.
    * Exposer des métriques sur l’espace disque, les points de montage (`df`, `disk_free`, `inode_usage`, etc.).

⚠️ Important : on ne donne pas un accès en écriture → juste en lecture pour monitorer.

---

## 🔹 2. `/proc`

* Répertoire spécial géré par le **kernel Linux**.
* Contient des fichiers virtuels donnant une **vue en temps réel** sur :

    * Processus (`/proc/[pid]`)
    * Charge CPU (`/proc/stat`)
    * Utilisation mémoire (`/proc/meminfo`)
    * Réseau (`/proc/net/dev`)
* Utilité pour Node Exporter :

    * Lire les métriques système comme le CPU usage, la mémoire utilisée, le nombre de processus, etc.

---

## 🔹 3. `/sys`

* Système de fichiers virtuel `sysfs`, exposé par le kernel.
* Contient des infos sur le **matériel et périphériques** :

    * Disques, partitions, I/O (`/sys/block/...`)
    * CPU, cores, fréquences (`/sys/devices/system/cpu/...`)
    * Interfaces réseau (`/sys/class/net/...`)
* Utilité pour Node Exporter :

    * Fournir des métriques matérielles → état du CPU, température (si dispo), état des disques, réseau.

---

## 🔹 4. Pourquoi ces montages ?

* Node Exporter tourne dans un **conteneur isolé**.
* Pour collecter les métriques **du vrai hôte** et pas juste celles du conteneur, il a besoin d’accéder à ces répertoires.
* D’où le montage :

    * `/ → /host` (disque)
    * `/proc → /host/proc` (processus & CPU/mem)
    * `/sys → /host/sys` (hardware & périphériques)

Avec l’option :

```yaml
command:
  - '--path.rootfs=/host'
```

👉 On dit à Node Exporter : “ne regarde pas ton `/proc` interne de conteneur, mais celui du vrai host qu’on t’a monté sous `/host`”.

---

✅ Résumé :

* `/` → métriques sur les disques.
* `/proc` → CPU, mémoire, processus.
* `/sys` → hardware, périphériques.
* Grâce à ça, Node Exporter donne une vision **complète de ton serveur Sentinel** même s’il tourne en conteneur.
