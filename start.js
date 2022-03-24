// noinspection InfiniteLoopJS

const fs = require("fs");
const fetch = require("node-fetch");
if (!fs.existsSync("./.changes.json")) fs.writeFileSync("./.changes.json", "[]");
const oldChanges = require("./.changes.json");
const Logger = require("./Logger");
const https = require("https");
const electron = require("electron");
const {app, BrowserWindow, globalShortcut} = electron;
module.exports.os = {win32: "windows", darwin: "macOS"}[process.platform] || "linux";
module.exports.lightGlobPath = app.getPath("userData");
module.exports.desktopPath = require("path").join(require("os").homedir(), "Desktop");
if (!fs.existsSync(module.exports.lightGlobPath)) fs.mkdirSync(module.exports.lightGlobPath);
const createDesktopShortcut = require("create-desktop-shortcuts");
const setPromptTitle = title => process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
module.exports.setPromptTitle = setPromptTitle;
Logger.debugging = false;
const cnv = map => c => {
    let b;
    Object.keys(map).forEach(i => c > map[i] ? b = (c / map[i]).toFixed(1) + i : null);
    return b || "0" + Object.keys(map)[0];
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

let browser;
let wss;

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
            wss = new (require("ws"))["Server"]({port: 9009});
            wss.on("error", () => {
                Logger.alert("Light is already being " + (isFirstVersion ? "installed" : "updated") + "!");
                if (browser) browser.hide();
                process.exit();
                /*while (true) {
                }*/
            });

            const create_window = async () => {
                const scr = new BrowserWindow({
                    width: 606,
                    height: 269
                }); // 700 600
                scr.setPositionLimits = (w = 700, h = 600) => {
                    scr.unmaximize();
                    scr.setSize(w, h);
                    scr.setResizable(false);
                    scr.setMaximizable(false);
                }
                scr.resetPositionLimits = () => {
                    scr.setResizable(true);
                    scr.setMaximizable(true);
                }
                scr.setPositionLimits(606, 269);
                scr.hide();
                //scr.setIcon(electron.NativeImage.createFromDataURL("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/resources/assets/icon.png"));
                scr.setMenu(null);
                await scr.loadFile(__dirname + "/update.html");
                scr.setTitle("Light - " + (isFirstVersion ? "Setup" : "Update"));
                scr.show();
                browser = scr;
            };
            app.whenReady().then(async () => {
                await create_window();
                globalShortcut.register("F5", Logger.debug);
                globalShortcut.unregister("F5");
                app.on("activate", () => BrowserWindow.getAllWindows().length === 0 ? create_window() : null);
            });
            app.on("window-all-closed", () => {
                Logger.alert("Cancelling " + (isFirstVersion ? "setup" : "update") + "...");
                if (process.platform !== "darwin") app.quit();
            });
            let connected = false;
            wss.on("connection", async socket => {
                if (socket._socket.address().address !== "::1") return socket.close();
                connected = true;
                socket.sendPacket = (action, data) => socket.send(JSON.stringify({action, data}));
                socket.on("close", async () => {
                    Logger.alert("Connection is gone.");
                    wss.close();
                    browser.hide();
                    await browser.close();
                    process.exit();
                    /*while (true) {
                    }*/
                });
                const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
                setPromptTitle("Light - " + (isFirstVersion ? "Installing" : "Updating") + "...");
                const sendFileMessage = () => {
                    const b = convertBytes(bytes);
                    socket.sendPacket("update", {
                        bytes,
                        byte_converted: b,
                        loaded: i,
                        all: files.length,
                        current: files[i]
                    });
                    return;
                    console.clear();
                    if (!isFirstVersion) {
                        Logger.warning("Update detected!");
                        Logger.info("Updating...");
                    } else {
                        Logger.warning("Installing is available!");
                        Logger.info("Installing...");
                    }
                    const spaceCount = 20;
                    Logger.info("[" + b + "] [\x1b[47m" + (" ".repeat(Math.floor(i / files.length * spaceCount))) + "\x1b[0m" + (" ".repeat(spaceCount - Math.floor(i / files.length * spaceCount))) + "] " + Math.floor(i / files.length * 100) + "% Downloading " + (files[i] || "").split("/").reverse()[0] + "...");
                };
                const download = file => new Promise(r => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
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
                    const file = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/" + f);
                    const con = await file.text();
                    if (con !== "404: Not Found") {
                        const dirs = f.split("/").reverse().slice(1).reverse();
                        dirs.forEach((j, d) => {
                            const dir = dirs.slice(0, d + 1).join("/");
                            if (!fs.existsSync("./" + dir)) fs.mkdirSync("./" + dir);
                        });
                        await download(f);
                    } else if (fs.existsSync("./" + f)) fs.unlinkSync("./" + f);
                }
                console.clear();
                Logger.warning("[" + convertBytes(bytes) + "] [" + convertDate(Date.now() - start) + "] Light has been " + (isFirstVersion ? "installed" : "downloaded") + "!")
                Logger.info(isFirstVersion ? "Light has been successfully installed." : "Update completed, please restart.");
                fs.writeFileSync("./.changes.json", body);
                createDesktopShortcut({
                    verbose: true,
                    windows: {
                        filePath: __dirname + "\\Start Light.vbs",
                        name: "Light",
                        comment: "Light Game Engine",
                        icon: __dirname + "\\resources\\assets\\icon.ico"
                    },
                    linux: {
                        filePath: __dirname + "\\Start Light.sh",
                        name: "Light",
                        description: "Light Game Engine",
                        icon: __dirname + "\\resources\\assets\\icon.png",
                        type: "Application"
                    },
                    osx: {
                        filePath: __dirname + "\\Start Light.sh",
                        name: "Light"
                    }
                });
                setPromptTitle("Light - " + (isFirstVersion ? "Installed" : "Updated") + ", please restart");
                if (wss) wss.close();
                if (browser) {
                    browser.hide();
                    await browser.close();
                }
                process.exit();
                /*while (true) {
                }*/
            });
            setInterval(() => !connected ? Logger.alert("Light didn't connect socket server.") : null, 20000);
        } else {
            console.clear();
            Logger.info("Perfect, engine is up to date!");
            setPromptTitle("Light");
            require("./resources/index");
        }
    } catch (e) {
        if (wss) wss.close();
        if (browser) {
            browser.hide();
            await browser.close();
        }
        console.clear();
        console.info(e);
        Logger.alert((isFirstVersion ? "Installation failed" : "Update failed") + ", please check your connection.");
        if (!isFirstVersion) require("./resources/index");
        else {
            setPromptTitle("Light - Installation cancelled, please check your connection");
            process.exit();
            /*while (true) {
            }*/
        }
    }
})();