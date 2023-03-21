const fs = require('fs')

function deployPathsPrep(modifiedFilePaths) {
    console.log("running deploy prep");
    const onlyNsFiles = modifiedFilePaths.filter(
        (filePath) => filePath.includes("/SuiteScripts/") || filePath.includes("/Objects/")
    );
    return onlyNsFiles.map((nsFile) => {
        const extension = nsFile.split(".");
        return {
            path: `<path>${nsFile.replace("src", "~")}</path>`,
            type: extension[extension.length - 1],
        };
    });
}
function createDeployFile(filesToDeploy) {
    const filesMarkup = filesToDeploy.filter((file) => file.type === "js").map((file) => file.path);
    const objectsMarkup = filesToDeploy.filter((file) => file.type === "xml").map((file) => file.path);
    const deployContent = `<deploy>
                              <configuration>
                                  <path>~/AccountConfiguration/*</path>
                              </configuration>
                              <files>
                                  ${filesMarkup.join("")}
                              </files>
                              <objects>
                                  ${objectsMarkup.join("")}
                              </objects>
                              <translationimports>
                                  <path>~/Translations/*</path>
                              </translationimports>
                            </deploy>`;

    fs.writeFile(`src/deploy.xml`, deployContent, "utf8", (err) => {
        if (err) throw err;
        console.log(`created deploy.xml file...${deployContent}`);
    });
}

let filesToDeploy = [];

try {
    let [, , modifiedScripts] = process.argv;
    console.log("modified scripts before split: ", modifiedScripts);
    console.log("process.argv: ", process.argv);
    modifiedScripts = modifiedScripts.split('\n');
    console.log("modified scripts: ", modifiedScripts);

    filesToDeploy = deployPathsPrep(modifiedScripts);
    console.log("filesToDeploy: ", filesToDeploy);

    if (!filesToDeploy.length) {
        console.log("No objects to deploy, abandoning...");
        process.exit(0);
    }

    filesToDeploy = deployPathsPrep(modifiedScripts);
    createDeployFile(filesToDeploy);
} catch (err) {
    console.error("Something went wrong creating deploy file holmes: ", err);
    process.exit(1);
}