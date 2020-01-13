import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { access, constants } from 'fs';

let o365CLIPath: string;

async function main() {
    try {
        o365CLIPath = await io.which("o365", true);

        const appFilePath: string = core.getInput("APP_FILE_PATH");
        const scope: string = core.getInput("SCOPE");
        const siteCollectionUrl: string = core.getInput("SITE_COLLECTION_URL");

        let appId: string;

        access(appFilePath, constants.F_OK, async (err) => {
            if (err) {
                core.error("Please check if the app file path is correct.");
                core.setFailed(err.message);
            } else {
                try {
                    if (scope == "sitecollection") {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} --overwrite --scope sitecollection --appCatalogUrl ${siteCollectionUrl}`);
                        await executeO365CLICommand(`spo app deploy --id ${appId} --scope sitecollection --appCatalogUrl ${siteCollectionUrl}`);
                        await executeO365CLICommand(`spo app install --id ${appId} --siteUrl ${siteCollectionUrl} --scope sitecollection`)
                    } else {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} --overwrite`);
                        await executeO365CLICommand(`spo app deploy --id ${appId}`)
                    }
                } catch (error) {
                    core.error("Executing script failed");
                    core.setFailed(error);
                }
            }
            core.setOutput("APP_ID", appId);
        });
    } catch (error) {
        core.error("Executing script failed");
        core.setFailed(error);
    }
}

async function executeO365CLICommand(command: string): Promise<any> {
    let o365CLICommandOutput = '';
    const options: any = {};
    options.listeners = {
        stdout: (data: Buffer) => {
            o365CLICommandOutput += data.toString();
        }
    };
    try {
        await exec.exec(`"${o365CLIPath}" ${command}`, [], options);
        return o365CLICommandOutput;
    }
    catch (error) {
        throw new Error(error);
    }
}

main();