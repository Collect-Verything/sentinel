faire une fiche explicatino sur la diusparition des fichier et dossier que grafana a generé mais qui ne sont plus present maitennat et re generé apres a voire effectué actino github.

Pour quoi a quoi cela sert, qu'est ce que je risque, est vraiment util de les regenerer a chque lancement avec 
une confgi dans le compose environement :       - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-worldmap-panel

A sa voir que Grafana/Prometheus/Loki gérer leurs données dans des volumes nommés Docker.

Sujet a approfondir !