Pour debuger le vault depuis le service:

```typescript

/**
 * Debug Vault (safe) — ne loggue jamais les secrets en clair.
 * @param groupName nom du groupe inventaire (ex: "demo")
 * @param vaultFilePath chemin relatif (depuis ansibleDir) du fichier vault (par défaut: group_vars/<group>/vault.yml)
 */
debugVault(groupName = 'demo', vaultFilePath?: string) {
    const vaultPassFile = process.env.ANSIBLE_VAULT_PASSWORD_FILE || '/run/secrets/vault_pass';
    const relVaultPath = vaultFilePath ?? `inventory/group_vars/${groupName}/vault.yml`;
    const absVaultPath = path.join(this.ansibleDir, relVaultPath);

    // 1) Vérifier le fichier de mot de passe du coffre
    let pass = "";
    let passLen = 0;
    let passHashShort = 'n/a';
    try {
        const raw = fs.readFileSync(vaultPassFile, 'utf8').replace(/\r?\n$/, '');
        pass = raw;
        passLen = raw.length;
        passHashShort = crypto.createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 8);
    } catch (e: any) {
        this.logger.error(`[vault] Fichier pass introuvable: ${vaultPassFile} (${e?.message})`);
        return {
            ok: false,
            step: 'read_pass',
            vaultPassFile,
            pass,
            passLen,
            passHashShort,
            vaultPath: absVaultPath,
        };
    }

    // 2) Tenter un `ansible-vault view` pour confirmer le déchiffrement
    const view = spawnSync('ansible-vault', ['view', absVaultPath], {
        cwd: this.ansibleDir,
        env: { ...process.env },
        encoding: 'utf8',
    });

    if (view.status !== 0) {
        this.logger.error(
            `[vault] Dechiffrement KO (status=${view.status}) vault=${relVaultPath} stderr=${(view.stderr || '').trim()}`
        );
        return {
            ok: false,
            step: 'decrypt',
            vaultPassFile,
            pass,
            passLen,
            passHashShort,
            vaultPath: absVaultPath,
            stderr: view.stderr,
        };
    }

    // 3) Vérifier la présence des variables attendues (sans afficher les valeurs)
    const content = view.stdout || '';
    const hasPassword = /^\s*ansible_password\s*:/m.test(content);
    const hasUser = /^\s*ansible_user\s*:/m.test(content);

    // (optionnel) mesurer la longueur du password sans l'exposer
    const pwdMatch = content.match(/^\s*ansible_password\s*:\s*["']?(.+?)["']?\s*$/m);
    const pwdLen = pwdMatch?.[1]?.length ?? 0;

    this.logger.log(
        `[vault] OK: passLen=${passLen} passvault=${pass} pass=${content} sha256=${passHashShort}… vault=${relVaultPath} vars: ansible_password=${hasPassword ? 'present' : 'missing'} (len=${pwdLen}), ansible_user=${hasUser ? 'present' : 'missing'}`
    );

    return {
        ok: true,
        step: 'done',
        vaultPassFile,
        passLen,
        passHashShort,
        vaultPath: absVaultPath,
        hasPassword,
        content,
        passwordLength: pwdLen,
        hasUser,
    };
}

resolveWorkPath(...parts: string[]) {
    return path.join(this.workDir, ...parts);
}

```