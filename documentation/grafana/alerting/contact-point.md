## 📁 Arborescence de provisioning Grafana

Tu as déjà :

* `/etc/grafana/provisioning/datasources/` → `datasource.yml`
* `/etc/grafana/provisioning/dashboards/` → `dashboard.yml` + fichiers JSON 

Tu peux ajouter :

* `/etc/grafana/provisioning/alerting/` → `contact-points.yml`, `notification-policies.yml`, `rules.yml`

Dans ton `docker-compose.yml`, tu as bindé :

```yaml
volumes:
  - ./grafana/provisioning:/etc/grafana/provisioning  
```

👉 donc tu peux créer localement `grafana/provisioning/alerting/` et Grafana le prendra en compte.

---

## 📌 Exemple simple de `contact-points.yml`

```yaml
apiVersion: 1
contactPoints:
  - orgId: 1
    name: "default-email"
    receivers:
      - uid: "email-default"
        type: "email"
        settings:
          addresses: "tonadresse@mail.com"
```
---

## 🔄 Workflow global

1. Tu crées `grafana/provisioning/alerting/contact-points.yml` et `notification-policies.yml`
2. Tu relances Grafana (`docker compose restart grafana`)
3. Tu devrais voir ton **Contact point** directement dans l’UI Grafana (Alerting → Contact points)
4. Tu pourras ensuite créer tes règles (via l’UI ou via un fichier `rules.yml` si tu veux aussi les versionner).
