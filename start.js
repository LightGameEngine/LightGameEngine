const fs = require("fs");
const fetch = require("node-fetch");
const oldChanges = require("./.changes.json");
const Logger = require("./Logger");
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);

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
                    fs.writeFileSync("./" + f, con);
                    Logger.debug("Loaded '" + f + "'!");
                }
            }
            Logger.info("Update completed, please restart.");
            fs.writeFileSync("./.changes.json", body);
            process.exit();
        } else {
            Logger.info("Perfect, engine is up to date!");
            require("./resources/index");
        }
    } catch (e) {
        Logger.alert("Update failed.");
        require("./resources/index");
    }
})();