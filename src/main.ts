import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { chmodSync, access, constants } from 'fs';

async function main() {
    try {
        let o365CLIScriptPath = core.getInput("O365_CLI_SCRIPT_PATH", {required: true});
        if (o365CLIScriptPath) {
            access(o365CLIScriptPath, constants.F_OK, async (err) => {
                if (err) {
                    core.error("🚨 Please check if the script path correct.");
                    core.setFailed(err.message);
                } else {
                    core.info("ℹ️ Executing script...");
                    const fileExtension: string = o365CLIScriptPath.split('.').pop();
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
            core.error("🚨 Please provide - O365_CLI_SCRIPT_PATH - path to the file containing commands.");
            core.setFailed("No arguments passed.");
        }
    } catch (error) {
        core.error("🚨 Executing script failed");
        core.setFailed(error);
    }
}

main();