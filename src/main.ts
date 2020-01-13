import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { chmodSync } from 'fs';

var cliPath: string;

async function main() {
    try{
        let scriptpath = core.getInput("SCRIPT_PATH");
        let fileExtension = scriptpath.split('.').pop();
        chmodSync(scriptpath, 0o755); 

        if(fileExtension == "ps1") {
            await exec.exec('pwsh', ['-f', scriptpath]);
        } else {
            await exec.exec(scriptpath);
        }       

    } catch (error) {
        core.error("Executing script failed");
        core.setFailed(error);
    } 
}

main();