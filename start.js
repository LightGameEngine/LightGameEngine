const fs = require("fs");
const fetch = require("node-fetch");
if (!fs.existsSync("./.changes.json")) fs.writeFileSync("./.changes.json", "[]");
const oldChanges = require("./.changes.json");
const Logger = require("./Logger");
const https = require("https");
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);

const setPromptTitle = title => process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));

module.exports.setPromptTitle = setPromptTitle;

Logger.debugging = false;

console.clear = () => {
    console.log("\033[2J");
    process.stdout.write("\033c");
}

const cnv = map => c => {
    let b;
    Object.keys(map).forEach(i => c > map[i] ? b = (c / map[i]).toFixed(1) + i : null);
    return b;
};

const convertBytes = cnv({
    b: 1,
    B: 8,
    KB: 1024 * 8,
    MB: 1024 * 1024 * 8,
    GB: 1024 * 1024 * 1024 * 8,
    TB: 1024 * 1024 * 1024 * 1024 * 8
});

const convertDate = cnv({
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
});

(async () => {
    let n = 0;
    const start = Date.now();
    const isFirstVersion = oldChanges.length === 0;
    setPromptTitle("Light - Checking " + (isFirstVersion ? "connection" : "updates") + "...");
    Logger.info(isFirstVersion ? "Installing Light..." : "Checking updates...");
    try {
        const currentVersion = oldChanges.length * 1;
        const response = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/.changes.json");
        const body = await response.text();
        let bytes = 0;
        if (currentVersion < JSON.parse(body).length) {
            const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
            setPromptTitle("Light - " + (isFirstVersion ? "Installing" : "Updating") + "...");
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
                const b = convertBytes(bytes);
                Logger.info("[" + b + "] [\x1b[47m" + (" ".repeat(Math.floor(i / files.length * spaceCount))) + "\x1b[0m" + (" ".repeat(spaceCount - Math.floor(i / files.length * spaceCount))) + "] " + Math.floor(i / files.length * 100) + "% Downloading " + (files[i] || "").split("/").reverse()[0] + "...");
            };
            const download = file => new Promise(r => {
                const f = fs.createWriteStream("./" + file);
                https.get("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + file, res => {
                    res.pipe(f);
                    const chunks = [];
                    res.on("data", chunk => {
                        chunks.push(chunk);
                        bytes += chunk.toString().length;
                        if (++n % 10 === 0) sendFileMessage();
                    });
                    res.on("error", e => {
                        throw e;
                    });
                    res.on("end", () => {
                        const raw = chunks.join("");
                        r({data: raw, bytes: raw.length});
                    });
                });
            });
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
            Logger.warning("[" + convertBytes(bytes) + "] [" + convertDate(Date.now() - start) + "] Light has been " + (isFirstVersion ? "installed" : "downloaded") + "!")
            Logger.info(isFirstVersion ? "Light has been successfully installed." : "Update completed, please restart.");
            fs.writeFileSync("./.changes.json", body);
            setPromptTitle("Light - " + (isFirstVersion ? "Installed" : "Updated") + ", please restart");
            while (true) {
            }
        } else {
            console.clear();
            Logger.info("Perfect, engine is up to date!");
            setPromptTitle("Light");
            require("./resources/index");
        }
    } catch (e) {
        console.clear();
        console.info(e);
        Logger.alert((isFirstVersion ? "Installation failed" : "Update failed") + ", please check your connection.");
        if (!isFirstVersion) require("./resources/index");
        else {
            setPromptTitle("Light - Installation cancelled, please check your connection");
            while (true) {
            }
        }
    }
})();