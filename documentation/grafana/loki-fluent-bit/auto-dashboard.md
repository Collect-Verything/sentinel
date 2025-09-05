# Création d'un dashboard auto provisionné

Recuperer un modele de dashboard existant, modifier les job et les tags pour le faire correcpondre a nos besoin

En l'occurence change ler source de chaque target d'element de panels:
```json
      "targets": [
        {
          "datasource": "oizehlqskde", // Avant
          "datasource": "${DS_LOKI}", // Apres
          "expr": "{job=\"system\"} |= \" error \"",
          "refId": "A"
        }
      ],
```