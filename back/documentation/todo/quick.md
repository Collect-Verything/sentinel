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

## Hot fix
- [x] Fix migration server prod + doc issue
- [x] Fix rendu des pages /servers en prod qui renvoi un 404 ngingx.conf


## Note : 
- Dans interface home supprimer serveur ? Pourquoi faire, gerer suppression dans consulter, avec selection, puis supprimer depuis selection

- *note1 : page add range va juste persister dans le tableau des PENDING server, les news Pending perisiter va generer un nouvelle id de range, id range renvoyé en response qui va ouvrire une pop up,
pop up qui permet de congirurer tous les serveur ajouter de la range ajouté, si ignoré, alors ces noueau serveur persisté vont juste rester dans la liste des pending serveurs.