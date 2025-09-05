# Alert rules

## 📁 Emplacement

Avec ton bind dans `docker-compose.yml` :

```
./grafana/provisioning:/etc/grafana/provisioning
```

👉 crée un dossier local `grafana/provisioning/alerting/rules/` et ajoute ton fichier YAML dedans (ex: `nginx-requests.yml`).

---

## 📌 Exemple : alerte sur >20 requêtes en 10s

```yaml
apiVersion: 1
groups:
  - orgId: 1
    name: nginx-rules
    folder: "Nginx Alerts"
    interval: 10s   # fréquence d’évaluation
    rules:
      - uid: "nginx-20req-10s"
        title: "Trop de requêtes Nginx"
        condition: C
        data:
          - refId: A
            datasourceUid: loki
            queryType: range
            relativeTimeRange:
              from: 10s
              to: 0s
            model:
              expr: "count_over_time({job=\"nginx\"}[10s])"
              interval: ""
              datasource:
                type: loki
                uid: loki
          - refId: B
            datasourceUid: __expr__
            model:
              type: threshold
              conditions:
                - evaluator:
                    type: gt
                    params: [20]
                  operator:
                    type: and
                  reducer:
                    type: last
                  type: query
              datasource:
                type: __expr__
                uid: __expr__
              expression: A
              label: ""
              refId: B
        noDataState: NoData
        execErrState: Alerting
        for: 0s
        annotations:
          summary: "Plus de 20 requêtes Nginx en 10 secondes"
        labels:
          severity: warning
```

---

## 🔎 Explications rapides

* `interval: 10s` → Grafana évalue la règle toutes les 10 secondes.
* `expr: count_over_time({job="nginx"}[10s])` → on compte les logs Nginx sur 10 secondes.
* `threshold > 20` → déclenchement si plus de 20 logs.
* `folder: "Nginx Alerts"` → dans Grafana, les règles apparaîtront dans ce dossier.
* `uid: loki` → doit correspondre à l’UID de ta datasource Loki (souvent `"loki"` si tu l’as nommé ainsi dans `datasources.yml`).
* `noDataState: NoData` et `execErrState: Alerting` → définissent le comportement si pas de données ou erreur.
* `annotations/labels` → utiles pour le tri et les notifications.

---

## 🔄 Étapes pratiques

1. Ajoute ce fichier sous `grafana/provisioning/alerting/rules/nginx-requests.yml`
2. `docker compose restart grafana`
3. Vérifie dans l’UI Grafana → **Alerting → Alert rules** → tu devrais voir ta règle.
4. Quand la condition est atteinte, ton **Contact Point** (email, Slack…) sera utilisé automatiquement.
