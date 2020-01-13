import * as core from '@actions/core';
import * as exec from '@actions/exec';
import {chmodSync} from 'fs';

var cliPath: string;

async function main() {
    try{
        let scriptpath = core.getInput("SCRIPT_PATH");
        
        chmodSync(scriptpath, 0o755); 
        await exec.exec(scriptpath);        

    } catch (error) {
        core.error("Executing script failed");
        core.setFailed(error);
    } 
}

main();