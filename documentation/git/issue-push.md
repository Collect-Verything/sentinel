# 🚀 Fiche : Problème de push GitHub avec workflows

## Problème rencontré

Lors du `git push` vers GitHub, erreur suivante :

```
! [remote rejected] main -> main (refusing to allow a Personal Access Token to create or update workflow `.github/workflows/deploy.md` without `workflow` scope)
error: failed to push some refs to 'https://github.com/Collect-Verything/sentinel.git'
```

### Explication

* GitHub bloque la mise à jour de fichiers de workflow (`.github/workflows/*`) si :

    1. Le fichier n’est pas en **.yml/.yaml** (ici c’était un `.md`).
    2. Le **Personal Access Token (PAT)** utilisé n’a pas le scope **`workflow`**.
    3. Ou bien l’authentification se fait en HTTPS avec un PAT mal configuré.

---

## Solution adoptée

✅ Passage à l’authentification **SSH** (plus simple et sans problème de scope).

### Étapes :

1. Vérifier le remote :

   ```bash
   git remote -v
   ```
2. Remplacer l’URL HTTPS par SSH :

   ```bash
   git remote set-url origin git@github.com:Collect-Verything/sentinel.git
   ```
3. Tester la connexion :

   ```bash
   ssh -T git@github.com
   ```

   (accepter le fingerprint si demandé).
4. Pousser le code :

   ```bash
   git push -u origin main
   ```
