import {getInput, info, error, setFailed, setOutput} from '@actions/core';
import { exec } from '@actions/exec';
import { which } from '@actions/io';
import { access, constants } from 'fs';

let o365CLIPath: string;

async function main() {
    try {
        o365CLIPath = await which("o365", true);

        const appFilePath: string = getInput("APP_FILE_PATH");
        const scope: string = getInput("SCOPE");
        const siteCollectionUrl: string = getInput("SITE_COLLECTION_URL");
        const skipFeatureDeployment: string = getInput("SKIP_FEATURE_DEPLOYMENT") == "true" ? "--skipFeatureDeployment" : "";
        const overwrite: string = getInput("OVERWRITE") == "true" ? "--overwrite" : "";
        
        let appId: string;

        access(appFilePath, constants.F_OK, async (err) => {
            if (err) {
                error("Please check if the app file path is correct.");
                setFailed(err.message);
            } else {
                try {
                    info("STarting deployment...");
                    if (scope == "sitecollection") {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} --scope sitecollection --appCatalogUrl ${siteCollectionUrl} ${overwrite}`);
                        await executeO365CLICommand(`spo app deploy --id ${appId} --scope sitecollection --appCatalogUrl ${siteCollectionUrl} ${skipFeatureDeployment}`);
                        await executeO365CLICommand(`spo app install --id ${appId} --siteUrl ${siteCollectionUrl} --scope sitecollection `)
                    } else {
                        appId = await executeO365CLICommand(`spo app add -p ${appFilePath} ${overwrite}`);
                        await executeO365CLICommand(`spo app deploy --id ${appId} ${skipFeatureDeployment}`)
                    }
                    info("Deployment complete.");
                } catch (error) {
                    error("Executing script failed");
                    setFailed(error);
                }
            }
            setOutput("APP_ID", appId);
        });
    } catch (err) {
        error("Executing script failed");
        setFailed(err);
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
        throw new Error(err);
    }
}

main();