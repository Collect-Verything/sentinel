## 📋 Tâches restantes pour ta stack Sentinel (Prometheus + Grafana + Loki)

### 🔧 Monitoring (Prometheus)

-  Configurer quelques **alertes de base** :
    - CPU > 90% pendant 5min
    - Disque < 10% libre
    - Mémoire saturée
-  (Optionnel) Brancher **Alertmanager** pour recevoir les alertes par discord dans le channel d'un groupe


### 📊 Dashboards (Grafana)

-  Créer un **dashboard custom** en partant de rien avec uniquement les métriques importantes (CPU, RAM, disque, uptime)
-  Sauvegarder tes dashboards dans `grafana/dashboards` pour les **reprovisionner automatiquement**


### 📜 Logs (Loki)

-  Déployer **Promtail** sur Sentinel et Product pour envoyer les logs systèmes vers Loki
-  Créer un **dashboard Logs + Metrics corrélés** dans Grafana


### 🛡️ Sécurité & production

-  Ajouter **authentification sécurisée** dans Grafana (users/roles, pas seulement admin/admin)
-  Mettre un **reverse proxy (NGINX ou Traefik)** devant Grafana et Prometheus avec HTTPS (Let’s Encrypt)
-  Sauvegarder les volumes Docker (`prom_data`, `grafana_data`) régulièrement
-  Full setup securité ssh en non root et changement de port sans tout casser 


### 🚀 Améliorations futures

-  Ajouter un **exporter MySQL** (si tu veux suivre la DB de Product)
-  Ajouter un **exporter Docker** pour monitorer les conteneurs eux-mêmes
-  Documenter ton setup (un README avec toutes les étapes pour tout relancer en cas de crash)
    
