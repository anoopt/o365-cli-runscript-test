import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { join } from 'path';
import { tmpdir } from 'os';
import { chmodSync, access, constants, writeFileSync, existsSync, unlinkSync } from 'fs';

const TEMP_DIRECTORY: string = process.env.RUNNER_TEMP || tmpdir();

function getCurrentTime(): number {
    return new Date().getTime();
}

async function createScriptFile(inlineScript: string): Promise<string> {
    const fileName: string = `O365_CLI_GITHUB_ACTION_${getCurrentTime().toString()}.sh`;
    const filePath: string = join(TEMP_DIRECTORY, fileName);
    writeFileSync(filePath, `${inlineScript}`);
    chmodSync(filePath, 0o755);
    return fileName;
}

async function deleteFile(filePath: string) {
    if (existsSync(filePath)) {
        try {
            unlinkSync(filePath);
        }
        catch (err) {
            core.warning(err.toString());
        }
    }
}

async function main() {
    try {
        let o365CLIScriptPath = core.getInput("O365_CLI_SCRIPT_PATH");
        if (o365CLIScriptPath) {
            core.info("ℹ️ Executing script from file...");
            access(o365CLIScriptPath, constants.F_OK, async (err) => {
                if (err) {
                    core.error("🚨 Please check if the script path correct.");
                    core.setFailed(err.message);
                } else {
                    let fileExtension = o365CLIScriptPath.split('.').pop();
                    chmodSync(o365CLIScriptPath, 0o755);
                    if (fileExtension == "ps1") {
                        await exec('pwsh', ['-f', o365CLIScriptPath]);
                    } else {
                        await exec(o365CLIScriptPath);
                    }

                    core.info("✅ Script execution complete.");
                }
            });
        } else {
            let o365CLIScript: string = core.getInput("O365_CLI_SCRIPT");
            if (o365CLIScript) {
                let o365CLIScriptFileName: string = '';
                try {
                    core.info("ℹ️ Executing script passed...");
                    o365CLIScriptFileName = await createScriptFile(o365CLIScript);
                    await exec(o365CLIScriptFileName);
                    core.info("✅ Script execution complete.");
                } catch (err) {
                    core.error("🚨 Executing script failed.");
                    core.setFailed(err);
                } finally {
                    const o365CLIScriptFilePath: string = join(TEMP_DIRECTORY, o365CLIScriptFileName);
                    await deleteFile(o365CLIScriptFilePath);
                }

            } else {
                core.error("🚨 Please pass either a command or a file containing commands.");
                core.setFailed("No arguments passed.");
            }
        }
    } catch (err) {
        core.error("🚨 Executing script failed.");
        core.setFailed(err);
    }
}

main();