const fs = require("fs");
const fetch = require("node-fetch");
const oldChanges = require("./.changes.json");
const Logger = require("./Logger");
const https = require("https");
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);

const download = file => {
    return new Promise(r => {
        const f = fs.createWriteStream("./" + file);
        https.get("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + file, res => {
            res.pipe(f);
            r();
        });
    });
};

Logger.debugging = false;

(async () => {
    Logger.info("Checking updates...");
    try {
        const currentVersion = oldChanges.length * 1;
        const response = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/.changes.json");
        const body = await response.text();
        if (currentVersion < JSON.parse(body).length) {
            const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
            Logger.warning("Update detected!");
            Logger.info("Updating...");
            for (let i = 0; i < files.length; i++) {
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
            Logger.info("Update completed, please restart.");
            fs.writeFileSync("./.changes.json", body);
            process.exit();
        } else {
            Logger.info("Perfect, engine is up to date!");
            require("./resources/index");
        }
    } catch (e) {
        console.info(e);
        Logger.alert("Update failed.");
        require("./resources/index");
    }
})();