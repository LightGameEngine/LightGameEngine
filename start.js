// noinspection InfiniteLoopJS

const fs = require("fs");
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
Logger.debugging = true;
const cnv = map => c => {
    let b;
    Object.keys(map).forEach(i => c > map[i] ? b = (c / map[i]).toFixed(1) + i : null);
    return b || "0" + Object.keys(map)[0];
};

/**
 * @param {string} file
 * @param {string} to
 * @return {Promise<void>}
 */
function unzip(file, to) {
    if (fs.existsSync(to)) fs.rmSync(to, {recursive: true});
    return new Promise(async (resolve, reject) => fs.createReadStream(file).pipe(require("unzipper").Extract({path: to})).on("error", reject).on("close", resolve));
}

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

/**
 * @param {string} url
 * @param {function(): void} onChunk
 * @param {function(): void} onError
 * @returns {Promise<{raw: string, chunks: Buffer[], bytes: number}>}
 */
const fetch = (url, {
    onChunk = () => {
    },
    onError = () => {
    }
} = {
    onChunk: r => r,
    onError: e => e
}) => new Promise(r => {
    https.get(url, res => {
        const chunks = [];
        res.on("data", chunk => {
            chunks.push(chunk);
            onChunk(chunk);
        });
        res.on("error", e => onError(e));
        res.on("end", () => {
            const raw = chunks.map(i => i.toString()).join("").toString();
            r({raw, chunks, bytes: raw.length});
        });
    });
});

async function kill() {
    if (wss) wss.close();
    if (browser) {
        browser.hide();
        await browser.close();
    }
    app.quit();
    setTimeout(process.exit, 2000);
}

(async () => {
    let n = 0;
    const start = Date.now();
    const isFirstVersion = oldChanges.length === 0;
    setPromptTitle("Light - Checking " + (isFirstVersion ? "connection" : "updates") + "...");
    Logger.info(isFirstVersion ? "Installing Light..." : "Checking updates...");

    try {
        const currentVersion = oldChanges.length * 1;
        const response = await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/.changes.json");
        const updateInfo = JSON.parse((await fetch("https://raw.githubusercontent.com/LightGameEngine/LightGameEngine/main/update_info.json")).raw);
        const body = response.raw;
        let bytes = 0;
        if (currentVersion < JSON.parse(body).length) {
            wss = new (require("ws"))["Server"]({port: 9009});
            wss.on("error", async () => {
                Logger.alert("Light is already being " + (isFirstVersion ? "installed" : "updated") + "!");
                await kill();
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
                if (connected) return kill();
                connected = true;
                socket.sendPacket = (action, data) => socket.send(JSON.stringify({action, data}));
                socket.on("close", async () => {
                    Logger.alert("Connection is gone.");
                    await kill();
                });
                const files = Array.from(new Set([].concat(...JSON.parse(body).slice(currentVersion))));
                const updateFile = "updates/update_setup.zip";
                //" + (isFirstVersion ? "setup" : JSON.parse(body).length) + "
                let totalBytes = updateInfo[updateFile].size;
                setPromptTitle("Light - " + (isFirstVersion ? "Installing" : "Updating") + "...");
                const sendFileMessage = () => {
                    const b = convertBytes(bytes);
                    socket.sendPacket("update", {
                        bytes,
                        byte_converted: b,
                        total_bytes: totalBytes,
                        all: files.length
                    });
                };
                const download = (file, path = "./" + file) => new Promise(r => {
                    if (fs.existsSync(path)) fs.unlinkSync(path);
                    const ff = path.replace("./", "");
                    const dirs = ff.split("/").reverse().slice(1).reverse();
                    dirs.forEach((j, d) => {
                        const dir = dirs.slice(0, d + 1).join("/");
                        if (!fs.existsSync("./" + dir)) fs.mkdirSync("./" + dir);
                    });
                    const f = fs.createWriteStream(path);
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
                            const raw = chunks.map(i => i.toString()).join("").toString();
                            r({data: raw, bytes: raw.length});
                        });
                    });
                });
                await download(updateFile, "./temp.zip");
                await unzip("./temp.zip", "./"); // TODO: it wont delete files that have been deleted by update
                fs.unlinkSync("./temp.zip");
                console.clear();
                Logger.warning("[" + convertBytes(bytes) + "] [" + convertDate(Date.now() - start) + "] Light has been " + (isFirstVersion ? "installed" : "downloaded") + "!")
                Logger.info(isFirstVersion ? "Light has been successfully installed." : "Update completed, please restart.");
                fs.writeFileSync("./.changes.json", body);
                createDesktopShortcut({
                    verbose: false,
                    windows: {
                        filePath: __dirname + "\\Start Light.vbs",
                        name: "Light",
                        comment: "Light Game Engine",
                        icon: __dirname + "\\resources\\assets\\icon.ico"
                    },
                    linux: {
                        filePath: __dirname + "/StartLight.sh",
                        name: "Light",
                        description: "Light Game Engine",
                        icon: __dirname + "/resources/assets/icon.png",
                        type: "Application"
                    },
                    osx: {
                        filePath: __dirname + "/StartLight.sh",
                        name: "Light"
                    }
                });
                fs.writeFileSync("./Start Light.vbs", `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd.exe /C cd ${__dirname} && npm start", 0
Set WshShell = Nothing`);
                setPromptTitle("Light - " + (isFirstVersion ? "Installed" : "Updated") + ", please restart");
                socket.sendPacket("done", {
                    type: isFirstVersion ? "installed" : "updated"
                });
            });
            setTimeout(async () => {
                if (!connected) {
                    Logger.alert("Light didn't connect socket server.");
                    await kill();
                }
            }, 20000);
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
            await kill();
        }
    }
})();