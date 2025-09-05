
# Normaliser des fichiers

```shell
# 1) ${DS_*} -> "Prometheus"
sed -i 's/"datasource":[ ]*"\${[^"]*}"/"datasource": "Prometheus"/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 2) objets datasource {type:"prometheus", uid:"..."} -> "Prometheus"
sed -i 's/"datasource":[ ]*{[^}]*"type"[ ]*:[ ]*"prometheus"[^}]*}/"datasource": "Prometheus"/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 3) id numérique -> null
sed -i 's/"id"[ ]*:[ ]*[0-9]\+/"id": null/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 4) uid (pose/écrase une valeur stable)
sed -i 's/"uid"[ ]*:[ ]*"[^"]*"/"uid": "node-exporter-full-1860"/' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 5) titre propre (facultatif)
sed -i 's/"title"[ ]*:[ ]*"[^"]*"/"title": "Node Exporter Full (1860)"/' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json
```



### Normaliser un fichier

```shell

# 1) ${DS_*} -> "Prometheus"
sed -i 's/"datasource":[ ]*"\${[^"]*}"/"datasource": "Prometheus"/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 2) objets datasource {type:"prometheus", uid:"..."} -> "Prometheus"
sed -i 's/"datasource":[ ]*{[^}]*"type"[ ]*:[ ]*"prometheus"[^}]*}/"datasource": "Prometheus"/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 3) id numérique -> null
sed -i 's/"id"[ ]*:[ ]*[0-9]\+/"id": null/g' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 4) uid (pose/écrase une valeur stable)
sed -i 's/"uid"[ ]*:[ ]*"[^"]*"/"uid": "node-exporter-full-1860"/' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json

# 5) titre propre (facultatif)
sed -i 's/"title"[ ]*:[ ]*"[^"]*"/"title": "Node Exporter Full (1860)"/' \
/root/sentinel/grafana/dashboards/Infra/node-exporter-full-1860.json
```