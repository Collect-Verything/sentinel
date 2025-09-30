## 🛠️ Points importants 

| Thème                                                     | Ce qu’il faut maîtriser / vérifier                                                                                               | Pourquoi c’est critique pour ton service                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Inventory / group_vars / host_vars**                    | Comment Ansible lit les variables (groupes, hôtes) selon l’inventaire.                                                           | Pour que `ansible_password` et `ansible_user` soient automatiquement appliqués. Si mal placé, Ansible ne les lira pas. |
| **Ordre de priorité (precedence) des variables**          | Variable définie dans inventory, dans group_vars, dans host_vars, via extra vars, etc.                                           | Pour éviter des conflits ou surprises (ex: host_vars écrase group_vars)                                                |
| **Vault (chiffrement)**                                   | Chiffrer / déchiffrer des fichiers, passer le mot de passe ou utiliser un fichier de mot de passe, gérer plusieurs IDs de vault. | Pour protéger les mots de passe SSH tout en les utilisant dans le playbook.                                            |
| **Exécution de playbook avec `spawn` / processus enfant** | Lancer un processus externe, capturer stdout / stderr, gérer le timeout, erreurs `ENOENT`.                                       | Pour que ton backend puisse contrôler Ansible, détecter les erreurs, retourner des statuts corrects.                   |
| **Gestion d’erreurs / retours structurés**                | Identifier les causes d’erreur (binaire manquant, inventaire invalide, SSH fail, erreur Vault, etc.).                            | Pour que l’utilisateur / dev puisse diagnostiquer rapidement ce qui ne va pas.                                         |
| **Docker / environnement prod vs dev**                    | Installer Ansible dans l’image prod, copier le dossier `ansible/`, variables d’environnement alignées (chemins).                 | Parce que tu as actuellement l’erreur `spawn ENOENT` en prod — le binaire Ansible n’est pas disponible.                |

---

## 📚 Liens de documentation pour approfondir

### Inventory / group_vars / host_vars / variables

* Ansible — guide de l’inventaire : comment structurer un inventory, les formats supportés. ([docs.ansible.com][1])
* Ansible — variable plugin `host_group_vars` (chargement de group_vars / host_vars) ([docs.ansible.com][2])
* Variables dans les playbooks & precedence des variables ([docs.ansible.com][3])
* « Quel fichier dans group_vars ou host_vars » sur StackOverflow — le nom du fichier doit correspondre au groupe/hôte. ([Stack Overflow][4])
* Comportement de l’inventaire + group_vars en tant que répertoires liés à l’inventaire. ([docs.ansible.com][5])
* Article sur les subtilités du dossier `group_vars` (merge, override) ([Medium][6])


[1]: https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html?utm_source=chatgpt.com "How to build your inventory — Ansible Community Documentation"
[2]: https://docs.ansible.com/ansible/latest/collections/ansible/builtin/host_group_vars_vars.html?utm_source=chatgpt.com "ansible.builtin.host_group_vars vars – In charge of loading ..."
[3]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html?utm_source=chatgpt.com "Using variables — Ansible Community Documentation"
[4]: https://stackoverflow.com/questions/62422927/ansible-host-vars-and-groups-for-inventory-file?utm_source=chatgpt.com "Ansible Host_vars and groups for inventory file - Stack Overflow"
[5]: https://docs.ansible.com/ansible/2.7/user_guide/intro_inventory.html?utm_source=chatgpt.com "Working with Inventory - Ansible Documentation"
[6]: https://medium.com/opsops/the-subtlety-of-group-vars-directory-8687d1405bad?utm_source=chatgpt.com "The subtlety of group_vars/ directory | by George Shuklin | OpsOps"
[7]: https://docs.ansible.com/ansible/latest/vault_guide/index.html?utm_source=chatgpt.com "Protecting sensitive data with Ansible vault"
[8]: https://www.digitalocean.com/community/tutorials/how-to-use-vault-to-protect-sensitive-ansible-data?utm_source=chatgpt.com "How To Use Ansible Vault to Protect Sensitive Playbook Data"
[9]: https://stackoverflow.com/questions/66938926/what-is-the-ansible-vault-password-file-format?utm_source=chatgpt.com "What is the Ansible vault password file format? - Stack Overflow"
[10]: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/automating_system_administration_by_using_rhel_system_roles/ansible-vault?utm_source=chatgpt.com "Chapter 3. Ansible vault | Red Hat Enterprise Linux | 10"
[11]: https://nodejs.org/api/child_process.html?utm_source=chatgpt.com "Child process | Node.js v24.3.0 Documentation"
[12]: https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/?utm_source=chatgpt.com "Node.js Child Processes: Everything you need to know"
[13]: https://www.geeksforgeeks.org/node-js/node-js-child-process/?utm_source=chatgpt.com "Node Child Process - GeeksforGeeks"
[14]: https://www.digitalocean.com/community/tutorials/how-to-launch-child-processes-in-node-js?utm_source=chatgpt.com "How To Launch Child Processes in Node.js - DigitalOcean"
[15]: https://docs.ansible.com/ansible/latest/index.html?utm_source=chatgpt.com "Ansible Community Documentation"
