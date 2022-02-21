const fs = require("fs");
const fetch = require("node-fetch");
const oldChanges = require("./.changes.json");
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);

(async () => {
    console.log("Checking updates...");
    try {
        const currentVersion = oldChanges.length * 1;
        const response = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/.changes.json");
        const body = await response.text();
        if (currentVersion < JSON.parse(body).length) {
            const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
            console.log("Update detected!");
            console.log("Updating...");
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                console.log("Loading '" + f + "'...");
                const file = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + f);
                fs.writeFileSync("./" + f, await file.text());
                console.log("Loaded '" + f + "'!");
            }
            console.log("Update completed, please restart.");
            fs.writeFileSync("./.changes.json", body);
            process.exit();
        } else {
            console.log("No update found.");
            require("./resources/index");
        }
    } catch (e) {
        console.log("Update failed.");
        require("./resources/index");
    }
})();