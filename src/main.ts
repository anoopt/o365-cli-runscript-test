import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { chmodSync, access, constants } from 'fs';

async function main() {
    try{
        let scriptPath = core.getInput("SCRIPT_PATH");
        access(scriptPath, constants.F_OK, async (err) => {
            if(err) {
                core.error("Please check if the script path correct.");
                core.setFailed(err.message);
            } else {
                let fileExtension = scriptPath.split('.').pop();
                chmodSync(scriptPath, 0o755); 
                if(fileExtension == "ps1") {
                    await exec.exec('pwsh', ['-f', scriptPath]);
                } else {
                    await exec.exec(scriptPath);
                }   
            }
        });       
    } catch (error) {
        core.error("Executing script failed");
        core.setFailed(error);
    } 
}

main();