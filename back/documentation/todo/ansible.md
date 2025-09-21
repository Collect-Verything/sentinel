# 1) Préparer le code & l’arbo

* Crée ces dossiers (côté repo `back/`) :

  ```
  back/
    ansible/
      playbooks/
        base.yml
      roles/           # (facultatif au début)
    jobs/              # généré à l’exécution (inventories & logs)
  ```
* Ajoute un **playbook minimal** `back/ansible/playbooks/base.yml` :

  ```yaml
  ---
  - name: Base config
    hosts: all
    gather_facts: false
    become: true
    tasks:
      - name: Ping
        ansible.builtin.ping:
  ```

---

# 2) Dockerfile du back (runtime = API + Ansible)

* Ajoute Ansible et SSH client dans l’image **runtime** :

  ```Dockerfile
  # --- build (inchangé) ---
  FROM node:20-bookworm-slim AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npx prisma generate && npm run build

  # --- runtime ---
  FROM node:20-bookworm-slim
  WORKDIR /app
  ENV NODE_ENV=production
  RUN apt-get update && apt-get install -y --no-install-recommends \
      ansible openssh-client ca-certificates python3 \
    && rm -rf /var/lib/apt/lists/*
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/prisma ./prisma
  COPY back/ansible /app/ansible   # <- adapte le chemin si besoin
  RUN mkdir -p /app/jobs
  EXPOSE 3001
  CMD ["node","dist/src/main.js"]
  ```

---

# 3) docker-compose (dev) : volumes utiles

* Dans le service `back-dev`, monte les dossiers :

  ```yaml
  back-dev:
    # ...
    volumes:
      - ./back:/back
      - ./back/ansible:/app/ansible
      - ./jobs:/app/jobs
  ```
* En prod : utilise un **volume nommé** pour `/app/jobs` (ex. `jobs-data:/app/jobs`).

---

# 4) Modèle Prisma pour le suivi des jobs

* Ajoute un modèle simple (si pas déjà existant) :

  ```prisma
  enum JobStatus {
    PENDING
    RUNNING
    SUCCESS
    ERROR
  }

  model ProvisionJob {
    id        Int       @id @default(autoincrement())
    recipe    String
    serverIds Json       // ex: [1,2,3]
    status    JobStatus @default(PENDING)
    startedAt DateTime?
    endedAt   DateTime?
    logPath   String?   // ex: "jobs/123/ansible.log"
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
  }
  ```
* `npx prisma migrate dev --name add_provision_job` (dev) → puis “deploy” en prod via ta CI/CD.

+ Seed

---

# 5) Service NestJS (AnsibleService)

* Responsabilités :

    1. **Créer un job** (DB) : `PENDING`.
    2. **Résoudre les serveurs** en DB (via `serverIds`).
    3. **Écrire un inventory** `jobs/<jobId>/hosts.ini`.
    4. **Lancer** `ansible-playbook` via `child_process.spawn`.
    5. **Streamer** stdout/stderr vers `jobs/<jobId>/ansible.log`.
    6. Mettre le job `RUNNING` → puis `SUCCESS`/`ERROR` + timestamps.
* Inventory minimal (mot de passe au début, tu évolueras vers clé SSH) :

  ```
  [all]
  111.11.11.11 ansible_user=root ansible_password=password ansible_port=22 ansible_ssh_common_args='-o StrictHostKeyChecking=no'
  222.22.22.22 ansible_user=admin ansible_password=password ansible_port=2222 ansible_ssh_common_args='-o StrictHostKeyChecking=no'
  ```
* Commande lancée :

  ```bash
  ansible-playbook -i jobs/<jobId>/hosts.ini /app/ansible/playbooks/<recipe>.yml -vv
  ```

---

# 6) Controller NestJS

* Endpoints proposés :

    * `POST /ansible/run` → body : `{ serverIds: number[], recipe: string }` → retourne `{ jobId }`.
    * `GET /ansible/jobs/:id` → status du job, dates, etc.
    * `GET /ansible/jobs/:id/log` → renvoie le log (fichier).
* Validation basique (`class-validator`) côté controller si tu veux.

---

# 7) Env & sécurité (POC → prod)

* **POC** : mot de passe SSH dans la DB (ok temporaire).
* **Rapide à améliorer** :

    * Passer à **clé SSH** (montée dans le container via secret/volume).
    * Ne **jamais** passer de `recipe` arbitraire → **liste blanche** de playbooks.
    * Timeout process Ansible (ex. kill au bout de N minutes).
    * User non-root dans le container (plus tard).

---

# 8) Tests rapides (dev)

1. Build/run dev :

   ```bash
   docker compose --profile dev up -d --build back-dev
   ```
2. Vérifie Ansible dans le container :

   ```bash
   docker compose --profile dev exec back-dev ansible --version
   ```
3. Seed/serveurs OK → lance :

   ```bash
   curl -X POST http://localhost:3001/ansible/run \
     -H 'Content-Type: application/json' \
     -d '{"serverIds":[1,2], "recipe":"base.yml"}'
   ```
4. Suis le log :

   ```bash
   tail -f back/jobs/<jobId>/ansible.log
   ```
5. Suivi API :

   ```bash
   curl http://localhost:3001/ansible/jobs/<jobId>
   ```

---

# 9) Logs & Observabilité

* Écris **tout** stdout/stderr vers `jobs/<jobId>/ansible.log`.
* Ajoute un champ `logPath` en DB.
* Expose `GET /ansible/jobs/:id/log` pour afficher côté front (ou streaming SSE plus tard).

---

# 10) CI/CD (rappels)

* L’image back contient Ansible (voir Dockerfile runtime).
* Montre en prod un volume `jobs-data:/app/jobs`.
* Tu as déjà la partie DB & healthcheck dans ton `deploy-back.yaml`. Rien à changer tant qu’Ansible est dans l’image du back.

---

# 11) Front (intégration)

* Après persistance de serveurs, propose “**Configurer maintenant**”.
* `POST /ansible/run` avec `{ serverIds, recipe }`.
* Poll `GET /ansible/jobs/:id` pour le statut, puis “Terminé ✅ / Erreur ❌”.
* Lien “voir logs” → `GET /ansible/jobs/:id/log`.

---

# 12) Prochaines évolutions (quand tu seras prêt)

* **Option B** : extraire le runner dans un **worker** (BullMQ + Redis).
* **Secrets** : passer à **clé SSH** + **Ansible Vault** (ou secret manager Docker/host).
* **Rôles Ansible** : découper les playbooks en `roles/` + variables par environnement.
* **Idempotence** : playbooks safe à relancer.
* **SSE/WebSocket** : stream live des logs côté front.
* **Permissions** : users/roles pour limiter qui peut lancer quoi.

---

## TL;DR

* On **intègre Ansible** dans le container du **back**.
* Le back **écrit un inventory**, **lance ansible-playbook**, **logge**, **met à jour un job** en DB.
* Le front **crée le job**, **poll le statut**, **lit le log** → UX simple.

Quand tu veux, je te file un **exemple de service/controller Nest** prêt à coller (avec `spawn`, rédaction `hosts.ini`, logs, updates Prisma).
