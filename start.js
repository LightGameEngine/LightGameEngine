const fs = require("fs");
const fetch = require("node-fetch");
if (!fs.existsSync("./.changes.json")) fs.writeFileSync("./.changes.json", "[]");
const oldChanges = require("./.changes.json");
const Logger = require("./Logger");
const https = require("https");
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);

const download = file => new Promise(r => {
    const f = fs.createWriteStream("./" + file);
    https.get("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + file, res => {
        res.pipe(f);
        r();
    });
});

Logger.debugging = false;

console.clear = () => {
    console.log("\033[2J");
    process.stdout.write("\033c");
}

(async () => {
    const isFirstVersion = oldChanges.length === 0;
    Logger.info(isFirstVersion ? "Installing Light..." : "Checking updates...");
    try {
        const currentVersion = oldChanges.length * 1;
        const response = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/.changes.json");
        const body = await response.text();
        if (currentVersion < JSON.parse(body).length) {
            const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
            const sendFileMessage = () => {
                console.clear();
                if (!isFirstVersion) {
                    Logger.warning("Update detected!");
                    Logger.info("Updating...");
                } else {
                    Logger.warning("Installing is available!");
                    Logger.info("Installing...");
                }
                const spaceCount = 20;
                Logger.info("[\x1b[47m" + (" ".repeat(Math.floor(i / files.length * spaceCount))) + "\x1b[0m" + (" ".repeat(spaceCount - Math.floor(i / files.length * spaceCount))) + "] " + Math.floor(i / files.length * 100) + "% Downloading...");
            };
            let i = 0;
            for (i = 0; i < files.length; i++) {
                sendFileMessage();
                const f = files[i];
                Logger.debug("Loading '" + f + "'...");
                const file = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + f);
                const con = await file.text();
                if (con !== "404: Not Found") {
                    const dirs = f.split("/").reverse().slice(1).reverse();
                    dirs.forEach((j, d) => {
                        const dir = dirs.slice(0, d + 1).join("/");
                        if (!fs.existsSync("./" + dir)) {
                            Logger.debug("Directory '" + dir + "' not found, creating directory...");
                            fs.mkdirSync("./" + dir);
                            Logger.debug("Created directory '" + dir + "'!");
                        }
                    });
                    await download(f);
                    Logger.debug("Loaded '" + f + "'!");
                } else if (fs.existsSync("./" + f)) fs.unlinkSync("./" + f);
            }
            console.clear();
            Logger.warning("Light has been " + (isFirstVersion ? "installed" : "downloaded") + "!")
            Logger.info(isFirstVersion ? "Light has been successfully installed." : "Update completed, please restart.");
            fs.writeFileSync("./.changes.json", body);
            while (true) {
            }
        } else {
            console.clear();
            Logger.info("Perfect, engine is up to date!");
            require("./resources/index");
        }
    } catch (e) {
        console.clear();
        console.info(e);
        Logger.alert((isFirstVersion ? "Installation failed" : "Update failed") + ", please check your connection.");
        if (!isFirstVersion) require("./resources/index");
        else while (true) {
        }
    }
})();