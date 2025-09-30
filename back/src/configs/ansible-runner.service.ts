import {Injectable} from '@nestjs/common';
import * as fs from "node:fs";
import {spawn} from "node:child_process";

const DEFAULT_BASE = process.env.ANSIBLE_BASE_DIR || '/app/ansible';
const DEFAULT_WORK = process.env.ANSIBLE_WORK_DIR || '/app/ansible-work';
const DEFAULT_BIN = process.env.ANSIBLE_PLAYBOOK_BIN || 'ansible-playbook';

@Injectable()
export class AnsibleRunnerService {
    private readonly ansibleDir = DEFAULT_BASE;
    private readonly workDir = DEFAULT_WORK;
    private readonly timeoutMs = 60_000;

    runPlaybook(relPlaybookPath: string, extraArgs: string[] = []) {
        return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {

            try {
                fs.mkdirSync(this.workDir, {recursive: true});
            } catch {
            }

            const args = [relPlaybookPath, ...extraArgs];
            const child = spawn(DEFAULT_BIN, args, {cwd: this.ansibleDir, env: {...process.env}});
            let stdout = '';
            let stderr = '';

            const timer = setTimeout(() => {
                child.kill('SIGKILL');
                reject(new Error(`Timeout after ${this.timeoutMs}ms`));
            }, this.timeoutMs);

            child.stdout.on('data', d => (stdout += d.toString()));
            child.stderr.on('data', d => (stderr += d.toString()));

            child.on('error', err => {
                clearTimeout(timer);
                reject(err);
            });
            child.on('close', code => {
                clearTimeout(timer);
                resolve({code: code ?? -1, stdout, stderr});
            });
        });
    }

}
