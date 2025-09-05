# Creation d'un dashboard manuel


```json
{
  "__inputs": [
    {
      "name": "DS_LOKI",
      "label": "Loki",
      "type": "datasource",
      "pluginId": "loki",
      "pluginName": "Loki"
    }
  ],
  "uid": "logs-nginx-system-v3",
  "title": "Logs – Nginx & System (Loki)",
  "tags": ["loki","nginx","system","fluent-bit"],
  "schemaVersion": 39,
  "version": 1,
  "time": { "from": "now-6h", "to": "now" },
  "refresh": "30s",
  "panels": [
    {
      "type": "stat",
      "title": "Requêtes reçues (1m)",
      "id": 1,
      "gridPos": { "x": 0, "y": 0, "w": 6, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "expr": "count_over_time({job=\"nginx\"}[1m])"
        }
      ]
    },
    {
      "type": "stat",
      "title": "Erreurs 500 (5m)",
      "id": 2,
      "gridPos": { "x": 6, "y": 0, "w": 6, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "expr": "count_over_time({job=\"nginx\"} |= \" 500 \"[5m])"
        }
      ]
    },
    {
      "type": "stat",
      "title": "Erreurs 404 (5m)",
      "id": 3,
      "gridPos": { "x": 12, "y": 0, "w": 6, "h": 4 },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "expr": "count_over_time({job=\"nginx\"} |= \" 404 \"[5m])"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "Codes HTTP (200/404/500)",
      "id": 4,
      "gridPos": { "x": 0, "y": 4, "w": 12, "h": 6 },
      "options": { "legend": { "displayMode": "list", "placement": "right" } },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "legendFormat": "{{status}}",
          "expr": "sum by (status)(count_over_time({job=\"nginx\"} | regexp \"HTTP/\\\\S+\\\" (?P<status>\\\\d{3}) \" | label_format status=\"{{.status}}\" [$__interval]))"
        }
      ]
    },
    {
      "type": "table",
      "title": "Top 5 Endpoints (5m)",
      "id": 5,
      "gridPos": { "x": 12, "y": 4, "w": 12, "h": 6 },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "expr": "topk(5, sum by (uri) (count_over_time({job=\"nginx\"} | regexp \"\\\"(?:GET|POST|PUT|DELETE|PATCH|HEAD) (?P<uri>\\\\S+)\" | label_format uri=\"{{.uri}}\" [5m])))"
        }
      ],
      "options": { "showHeader": true },
      "transformations": [{ "id": "seriesToRows" }]
    },
    {
      "type": "table",
      "title": "Top 5 IPs (5m)",
      "id": 6,
      "gridPos": { "x": 0, "y": 10, "w": 12, "h": 6 },
      "targets": [
        {
          "refId": "A",
          "datasource": "${DS_LOKI}",
          "queryType": "range",
          "expr": "topk(5, sum by (client) (count_over_time({job=\"nginx\"} | regexp \"^(?P<client>\\\\S+) \" | label_format client=\"{{.client}}\" [5m])))"
        }
      ],
      "options": { "showHeader": true },
      "transformations": [{ "id": "seriesToRows" }]
    },
    {
      "type": "logs",
      "title": "Flux Nginx",
      "id": 7,
      "gridPos": { "x": 12, "y": 10, "w": 12, "h": 8 },
      "targets": [
        { "refId": "A", "datasource": "${DS_LOKI}", "expr": "{job=\"nginx\"}" }
      ],
      "options": { "dedupStrategy": "none", "showTime": true, "showLabels": true, "wrapLogMessage": true }
    },
    {
      "type": "logs",
      "title": "SSH échoués (system)",
      "id": 8,
      "gridPos": { "x": 0, "y": 16, "w": 12, "h": 6 },
      "targets": [
        { "refId": "A", "datasource": "${DS_LOKI}", "expr": "{job=\"system\"} |= \"Failed password\"" }
      ],
      "options": { "dedupStrategy": "signature", "showTime": true, "showLabels": true, "wrapLogMessage": true }
    },
    {
      "type": "logs",
      "title": "Erreurs système",
      "id": 9,
      "gridPos": { "x": 12, "y": 18, "w": 12, "h": 6 },
      "targets": [
        { "refId": "A", "datasource": "${DS_LOKI}", "expr": "{job=\"system\"} |= \" error \"" }
      ],
      "options": { "dedupStrategy": "none", "showTime": true, "showLabels": true, "wrapLogMessage": true }
    }
  ]
}
```