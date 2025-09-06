# 📄 Fiche : `notification-policies.yml` [Bugé Actuellement]

## 🎯 Rôle du fichier

Ce fichier définit les **Notification Policies** dans Grafana.
Elles servent à **relier les alertes (Alert Rules)** aux **Contact points** (destinataires).

En clair :

* **Alert Rule** = condition qui déclenche une alerte.
* **Contact Point** = où envoyer l’alerte (mail, Slack, etc.).
* **Notification Policy** = règles de routage qui disent *quelle alerte va vers quel contact point, avec quel regroupement et quelle fréquence*.

---

## 📂 Contenu du fichier (ligne par ligne)

```yaml
apiVersion: 1
```

* Version du schéma de configuration Grafana.
* Toujours `1` aujourd’hui.

```yaml
policies:
```

* Liste des politiques de notification.
* On peut en définir plusieurs, mais ici il y en a une seule (la racine).

```yaml
  - orgId: 1
```

* ID de l’organisation Grafana.
* Par défaut `1` si tu n’utilises pas plusieurs organisations.

```yaml
    receiver: "collect-verything"
```

* Définit le **Contact point par défaut** (ici `collect-verything`).
* Toutes les alertes qui ne matchent pas une route spécifique iront vers ce contact point.

```yaml
    group_by: ['alertname']
```

* Définit comment Grafana regroupe les alertes avant de les envoyer.
* Ici : toutes les alertes avec le **même `alertname`** sont regroupées en un seul message.
  👉 Évite de recevoir 100 mails identiques pour 100 instances d’alerte identiques.

```yaml
    group_wait: 30s
```

* Temps d’attente avant d’envoyer la première notification d’un nouveau groupe d’alertes.
* Ici : Grafana attend 30 secondes → pratique pour éviter les faux positifs instantanés.

```yaml
    group_interval: 5m
```

* Temps minimum entre deux notifications pour un même groupe.
* Ici : si le problème persiste, Grafana renverra un rappel toutes les 5 minutes max.

```yaml
    repeat_interval: 1h
```

* Temps après lequel Grafana renverra la même alerte même si rien n’a changé.
* Ici : rappel toutes les 1 heure tant que l’alerte est toujours active.

---

## ✅ Exemple concret

👉 Une règle (`nginx-20req-10s`) déclenche avec `alertname = "Pormanov Ddos"`.
👉 Grafana applique la policy :

* Groupement = par `alertname` → toutes les occurrences de cette alerte sont regroupées.
* Premier envoi = 30s après déclenchement.
* Rappel = toutes les 5 min si toujours actif.
* Rappel forcé = toutes les 1h, même si rien n’a changé.
  👉 Notification envoyée à : **`collect-verything`** (contact point email).
