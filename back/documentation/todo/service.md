# 📌 TODO – Sentinel (backend + gestion serveurs)

## 1. Import & persistance des données

* [ ] Ajouter les fichiers CSV
* [ ] Parser les CSV en JSON
* [ ] Amelirer modele Server, regarder server.csv ...Donc modifier egalement le seed etc ...
* [ ] Envoyer le JSON au backend et persister dans la base **Sentinel DB**

---

## 2. Gestion des serveurs (UI + backend)

* [ ] Créer une section **Serveurs configurés**

    * Tableau listant les serveurs déjà configurés (vue simple dans un premier temps)
* [ ] Créer une section **Serveurs non configurés**

    * Tableau listant les serveurs en attente de configuration
    * Possibilité de :

        * configurer **tous les serveurs d’un coup**
        * ou seulement les serveurs **sélectionnés**

---

## 3. Intégration Ansible (*ans – à faire plus tard*)

⚙️ **Objectif : automatiser la configuration d’un serveur depuis l’interface.**

* [ ] Ajouter un bouton dans le front → déclenche une action
* [ ] Action transmise au backend
* [ ] Le backend lance un service qui exécute Ansible
* [ ] Afficher un **loader** côté front (future amélioration : afficher logs temps réel ou progression)
* [ ] Si succès → rafraîchir la page :

    * les serveurs configurés disparaissent du tableau *non configurés*
    * ils apparaissent dans le tableau *configurés*

---

## 4. Améliorations du serveur config en micro service mono repo front-back toujours en version minimalists de la main app

* [ ] Créer un **microservice “config-serveur”** en nestjs sur notre **serveur-config** actuelle 

    * Le service-config demande une IP dispo à Sentinel
    * Sentinel fournit IP + login/mot de passe
    * Le service-config déploie automatiquement l’app client si des adresse sont dispo, sinon erreur technique veuillez consulter le support
    * Automatiser la **configuration de Grafana** pour que le nouveau client apparaisse dans le dashboard grafana 'ET'
    * Dans l’interface de gestion sentinel admin ou un  **lien direct vers le dashboard Grafana** du serveur selectionné dans le tableau par l'admin 

---

## 5. Sauvegardes

* [ ] Mettre en place le **backup de la base de données Sentinel**

    * Objectif : faire un **proof of concept** avec un petit serveur dédié aux sauvegardes quotidienne de BDD

