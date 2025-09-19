# 19-09-2025
- [ ] Fix localhost et prod fetch utils web *note1
- [x] Fix fetching data error blocked by cors 
- [x] Upgrade DB, modele seed ...
- [x] Create page to display servers
- [ ] Creer interface creation nouvelle config ansible (by path ...)
- [ ] Display configured not-server
- [ ] Display configured server
- [ ] Display ansible config
- [ ] Display providers
- [ ] Creer une branche dev avec regle sur main et dev, tets et lint pour dev sur une branche feature car l'app commence a devenir semnsible



*note1:

Le front en dev effectue des requete sur le backend en localhost:3001
Le front en prod effectue des requete sur le backend en ip_server:3001
1)
donc il faut creer une var dans .env front IP_SERVER=localhost.
Et dans le dockerfile.dev faire rien car IP_SERVER deja initialisé a locahost
Et dans le dockerfile prod faire integrer une var ENV IP_SERVER avec adresse ip

2)
etant donnée la recherche d'automatisation serait 'il pa mieux de overide l'env du Dockerfile avec la commande deploy-back.yaml

3)
Enable cors dans le main.ts en dur ou var ... a voire
