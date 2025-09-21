# 19-09-2025
- [x] Fix localhost et prod fetch utils web 
- [x] Fix fetching data error blocked by cors 
- [x] Upgrade DB, modele seed ...
- [x] Create page to display servers
- [ ] Creer interface creation nouvelle config ansible (by path ...)
- [x] Display configured not-server avec configurer les serveurs => Uniquelent les serveur non configuré
- [x] Display configured server => Avec consulter les serveur => Uniquement les configuré
- [ ] Create config interface
    - [ ] Display ansible config
    - [ ] Button to create ansible config ( ... )
- [ ] Creer une branche dev avec regle sur main et dev, tets et lint pour dev sur une branche feature car l'app commence a devenir semnsible
- [ ] Creer un credential dans le header des requete (util web) accepté par le back end (main.ts) secret github ..;
- [ ] Creer Dto pour accepter list object server a configurer, gestion erreur minimal, fichier doit contenir mninmum adresseIp et sshPasssword, si le reste pas present osef. (*note1)
- [ ] Creer un boutton config auto, qui permet de configurer un nombre choisi de serveur, dans l'ordre des date de creation restante toujorus pas configuré.(dans le but de ne jalmais laisser de serveur sur le coté) 
- [x] possibilité de delete server pour facilité de dev et verification

## Hot fix
- [x] Fix migration server prod + doc issue
- [x] Fix rendu des pages /servers en prod qui renvoi un 404 ngingx.conf


## Note : 
- Dans interface home supprimer serveur ? Pourquoi faire, gerer suppression dans consulter, avec selection, puis supprimer depuis selection

- *note1 : page add range va juste persister dans le tableau des PENDING server, les news Pending perisiter vont generer de nouveau [id,...], id's renvoyé en response qui va ouvrire une pop up,
pop up qui permet de congirurer tous les serveur ajouter de cette serie ajouté, si ignoré, alors ces noueau serveur persisté vont juste rester dans la liste des pending serveurs.


# 20_09_2025
- [ ] La selecton all du tableau ne selectionne rien 
- [x] Ajouter les nouvelle page dans le menu bar deroulant en haut a droite + optimiser la bar avec une itteration
- [x] Retourner la liste d'id des serveur ajouté a la creation
- [x] Modal qui porpose de lancer une config sur tout les id crée retourné, sinon ignorer
- [x] Pre traitement et parsing dans le front avec un util pour le csv
- [x] Try catch back error response durant persistance => get error dans le front dans la modal de config si erreur back
- [ ] Il faudrait que quand on persisite des serveur deja existant, la liste des ip deja existate en base remonte dans le front pour en informer l'admin
- [x] Creer alert sur la convention du fichier csv
- [x] Generer config ressources et creer endpoint get all et end point config avec logique commenté 
- [ ] Creer un web socket pour suivre la configuration en cours des serveur, donc petit onglet rabatable de suivi dans le front, du coup changer la logique de la dialog sur la response (...)
- [ ] Gerer erreur a l'ajout des serveur avec precision, genre unique constraint key et ce genre de chose, mais en vrai pas urgent
- [ ] Fusionner page servers et config-servers quand tout sera terminé