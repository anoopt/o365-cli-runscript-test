import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { which } from '@actions/io';
import { access, constants } from 'fs';

let o365CLIPath: string;

async function main() {
    try {
        o365CLIPath = await which("o365", true);

        const appFilePath: string = core.getInput("APP_FILE_PATH");
        const scope: string = core.getInput("SCOPE");
        const siteCollectionUrl: string = core.getInput("SITE_COLLECTION_URL");
        const skipFeatureDeployment: string = core.getInput("SKIP_FEATURE_DEPLOYMENT") == "true" ? "--skipFeatureDeployment" : "";
        const overwrite: string = core.getInput("OVERWRITE") == "true" ? "--overwrite" : "";
        
        let appId: string;

        access(appFilePath, constants.F_OK, async (err) => {
            if (err) {
                core.error("Please check if the app file path is correct.");
                core.setFailed(err.message);
            } else {
                try {
                    core.info("STarting deployment...");
                    if (scope == "sitecollection") {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} --scope sitecollection --appCatalogUrl ${siteCollectionUrl} ${overwrite}`);
                        await executeO365CLICommand(`spo app deploy --id ${appId} --scope sitecollection --appCatalogUrl ${siteCollectionUrl} ${skipFeatureDeployment}`);
                        await executeO365CLICommand(`spo app install --id ${appId} --siteUrl ${siteCollectionUrl} --scope sitecollection `)
                    } else {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} ${overwrite}`);
                        await executeO365CLICommand(`spo app deploy --id ${appId} ${skipFeatureDeployment}`)
                    }
                    core.info("Deployment complete.");
                } catch (err) {
                    core.error("Executing script failed");
                    core.setFailed(err);
                }
            }
            core.setOutput("APP_ID", appId);
        });
    } catch (err) {
        core.error("Executing script failed");
        core.setFailed(err);
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
        await exec(`"${o365CLIPath}" ${command}`, [], options);
        return o365CLICommandOutput;
    }
    catch (err) {
        core.error("Executing script failed");
        core.setFailed(err);
        throw new Error(err);
    }
}

main();