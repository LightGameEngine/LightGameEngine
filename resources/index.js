const electron = require("electron");
const fs = require("fs");
const {app, BrowserWindow, globalShortcut} = electron;
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);
const cachePath = lightRoamingPath + "/.cache";
const Logger = require("../Logger");

if (!fs.existsSync(lightRoamingPath + "/languages")) {
    fs.mkdirSync(lightRoamingPath + "/languages");
    fs.writeFileSync(lightRoamingPath + "/languages/en_US.json", JSON.stringify({
        "search-placeholder": "Search project",
        "new-project-button": "New Project",
        "create-project-title": "Create Project",
        "project-name-input": "Enter project name...",
        "create-button": "Create",
        "open-project-button": "Open Project",
        "file-explorer-placeholder": "Path",
        "okay-button": "OK",
        "cancel-button": "Cancel",
        "settings-title": "Settings",
        "default-project-folder": "Default project folder",
        "close-button": "Close",
        "default-folder-dont-exist": "Default project folder doesn't exist!",
        "should-define-project-folder": "You should have defined the default project folder in settings",
        "project-exists": "Project %0 already exists!",
        "project-name-invalid": "Project name should not include invalid characters.",
        "project-name-empty": "Project name should have been filled.",
        "file-Documents": "Documents",
        "file-Downloads": "Downloads",
        "file-Desktop": "Desktop",
        "file-Music": "Music",
        "file-Pictures": "Pictures",
        "file-Videos": "Videos",
        "file-home": "Local User"
    }));
    fs.writeFileSync(lightRoamingPath + "/languages/tr_TR.json", JSON.stringify({
        "search-placeholder": "Proje ara",
        "new-project-button": "Yeni Proje",
        "create-project-title": "Proje Oluştur",
        "project-name-input": "Proje ismi girin...",
        "create-button": "Oluştur",
        "open-project-button": "Proje Aç",
        "file-explorer-placeholder": "Yol",
        "okay-button": "Tamam",
        "cancel-button": "İptal",
        "settings-title": "Ayarlar",
        "default-project-folder": "Varsayılan proje klasörü",
        "close-button": "Kapat",
        "default-folder-dont-exist": "Varsayılan proje klasörü bulunamadı!",
        "should-define-project-folder": "Ayarlardan varsayılan proje klasörünü ayarlamalıydın",
        "project-exists": "%0 adlı proje bulunuyor!",
        "project-name-invalid": "Proje adı geçersiz karakter içermemeli.",
        "project-name-empty": "Proje adını doldurmalısın.",
        "file-Documents": "Belgeler",
        "file-Downloads": "İndirilenler",
        "file-Desktop": "Masaüstü",
        "file-Music": "Müzikler",
        "file-Pictures": "Resimler",
        "file-Videos": "Videolar",
        "file-home": "Yerel Kullanıcı"
    }));
}
if (!fs.existsSync(lightRoamingPath + "/themes")) {
    fs.mkdirSync(lightRoamingPath + "/themes");
    fs.writeFileSync(lightRoamingPath + "/themes/dark.json", JSON.stringify({
        id: "dark",
        name: {
            "tr_TR": "Karanlık",
            "en_US": "Dark"
        },
        json: {
            "background": "#3a3737",
            "file-explorer-background": "rgba(0,0,0,0.2)",
            "file-search-background": "#444141",
            "file-search-input-color": "#9d9c9c",
            "file-element-color": "white",
            "file-element-hover-background": "#5d6060",
            "file-element-selected-background": "#4b6eaf",
            "file-element-selected-hover-background": "#4b6eaf",
            "file-close-hover": "red",
            "bar-a-hover": "#6a97ea",
            "body-background": "#232323",
            "canvas-background": "#3a3737",
            "right-container-background": "#494545",
            "console-background": "#595454",
            "general-color": "white",
            "webkit-scrollbar-track": "white",
            "scrollbar-thumb": "#888888",
            "scrollbar-thumb-hover": "#555555",
            "project-hover": "#232323",
            "code": "#212020",
            "popup": "#333131",
            "search": "#9d9c9c",
            "btn-border": "#5d6060",
            "btn-background": "#515557",
            "btn-color": "#ada3a3",
            "btn-okay-border": "#4c708c",
            "btn-okay-background": "#365880",
            "btn-okay-color": "#babaa7",
            "btn-hover-background": "#484c4d",
            "hr": "#565050",
            "popup-input-color": "#ffffff",
            "bar-color": "white",
            "popup-close-hover-background": "red",
            "property-name-color": "white"
        }
    }));
    fs.writeFileSync(lightRoamingPath + "/themes/light.json", JSON.stringify({
        id: "light",
        name: {
            "tr_TR": "Açık",
            "en_US": "Light"
        },
        json: {
            "background": "#faf8f8",
            "file-explorer-background": "rgba(203,203,203,0.4)",
            "file-search-background": "#b2b2b2",
            "file-search-input-color": "#4f4f4f",
            "file-element-color": "#4f4f4f",
            "file-element-hover-background": "#858585",
            "file-element-selected-background": "#4b6eaf",
            "file-element-selected-hover-background": "#4b6eaf",
            "file-close-hover": "red",
            "bar-a-hover": "#6a97ea",
            "body-background": "#c7c7c7",
            "canvas-background": "#eaeaea",
            "right-container-background": "#afa5a5",
            "console-background": "#8f8585",
            "general-color": "black",
            "webkit-scrollbar-track": "white",
            "scrollbar-thumb": "#888888",
            "scrollbar-thumb-hover": "#555555",
            "project-hover": "#c0c0c0",
            "code": "#d5d5d5",
            "popup": "#e1e1e1",
            "search": "#9d9c9c",
            "btn-border": "#8f9a9a",
            "btn-background": "#cbcbcb",
            "btn-color": "#575050",
            "btn-okay-border": "#718ea8",
            "btn-okay-background": "#507398",
            "btn-okay-color": "#babaa7",
            "btn-hover-background": "#dae3e5",
            "hr": "#565050",
            "popup-input-color": "#504f4f",
            "bar-color": "black",
            "popup-close-hover-background": "red",
            "property-name-color": "white"
        }
    }));
}
const themes = {};
Logger.debug("Reading themes from " + lightRoamingPath + "/themes");
fs.readdirSync(lightRoamingPath + "/themes").forEach(i => {
    Logger.debug("Loading theme " + i.split(".")[0] + "...");
    themes[i.split(".")[0]] = JSON.parse(fs.readFileSync(lightRoamingPath + "/themes/" + i).toString());
    Logger.debug("Loaded theme " + i.split(".")[0] + ".");
});
const languages = {};
Logger.debug("Reading languages from " + lightRoamingPath + "/languages");
fs.readdirSync(lightRoamingPath + "/languages").forEach(i => {
    Logger.debug("Loading language " + i.split(".")[0] + "...");
    languages[i.split(".")[0]] = JSON.parse(fs.readFileSync(lightRoamingPath + "/languages/" + i).toString());
    Logger.debug("Loaded language " + i.split(".")[0] + ".");
});

if (!fs.existsSync(cachePath)) {
    const dateLang = Intl.DateTimeFormat()["resolvedOptions"]()["locale"].replace("-", "_");
    fs.writeFileSync(cachePath, JSON.stringify({
        projects: {},
        theme: "dark",
        lang: languages[dateLang] ? dateLang : "en_US",
        default_project_folder: null
    }));
}
/*** @type {{default_project_folder: string | null, theme: string, lang: string, projects: Object<string, {name: string, path: string, json: {objects: {type: number, properties: Array}[]}, createdTimestamp: number, lastOpenTimestamp: number}>}} */
const cache = JSON.parse(fs.readFileSync(cachePath).toString());

class CacheManager {
    static async getProjects() {
        const p = {};
        for (let i = 0; i < Object.keys(cache.projects).length; i++) {
            const project = cache.projects[Object.keys(cache.projects)[i]];
            project.valid = fs.existsSync(project.path) ? (await is_folder(project.path)) : false;
            if (!project.valid) delete cache.projects[project.path];
            p[project.path] = project;
        }
        this.save();
        return p;
    }

    static existsProjectPath(path) {
        return !!cache.projects[path];
    }

    /*** @param {string} path */
    static createProject(path) {
        if (this.existsProjectPath(path)) return;
        cache.projects[path] = {
            name: path.split("/").reverse()[0],
            path,
            json: {
                objects: []
            },
            createdTimestamp: Date.now(),
            lastOpenTimestamp: 0
        };
        this.save();
        if (!fs.existsSync(path)) fs.mkdirSync(path);
    }

    static openProject(socket, path) {
        this.createProject(path);
        cache.projects[path].lastOpenTimestamp = Date.now();
        this.save();
        browser.hide();
        socket.sendPacket("open_project", {name: cache.projects[path].name, path});
        browser.resetPositionLimits();
        browser.maximize();
        browser.show();
    }

    static renameProject(path, name) {
        this.createProject(path);
        cache.projects[path].name = name;
        this.save();
    }

    static removeProject(path) {
        delete cache.projects[path];
        this.save();
    }

    static getDefaultProjectFolder() {
        if (!fs.existsSync(cache.default_project_folder)) cache.default_project_folder = null;
        return cache.default_project_folder;
    }

    static setDefaultProjectFolder(folder) {
        cache.default_project_folder = folder;
        this.save();
    }

    static setTheme(theme) {
        cache.theme = theme;
        this.save();
    }

    static setLanguage(lang) {
        cache.lang = lang;
        this.save();
    }

    static save() {
        fs.writeFileSync(cachePath, JSON.stringify(cache));
    }
}

const wss = new (require("ws")).Server({port: 9009});
let socketClients = [];

const is_folder = path => new Promise(r => fs.readFile(path, err => err ? r(true) : r(false)));

wss.on("connection", async socket => {
    if (socket._socket.address().address !== "::1") return socket.close();
    socketClients.push(socket);
    socket.sendPacket = (action, data) => socket.send(JSON.stringify({action, data}));
    socket.on("disconnect", () => socketClients = socketClients.filter(i => i !== socket));
    socket.sendPacket("project_folder", {folder: CacheManager.getDefaultProjectFolder()});
    socket.sendPacket("get_theme", {id: cache.theme, themes});
    socket.sendPacket("get_language", {id: cache.lang, languages});
    socket.on("message", async message => {
        const browser = global.browser;
        try {
            const json = JSON.parse(message.toString());
            switch (json.action) {
                case "set_theme":
                    CacheManager.setTheme(json.data.theme);
                    break;
                case "set_language":
                    CacheManager.setLanguage(json.data.language);
                    break;
                case "set_project_folder":
                    if (fs.existsSync(json.data.folder)) CacheManager.setDefaultProjectFolder(json.data.folder);
                    break;
                case "get_home_path":
                    socket.sendPacket("get_home_path", {path: process.env.HOME});
                    break;
                case "get_projects":
                    socket.sendPacket("get_projects", {projects: await CacheManager.getProjects()});
                    break;
                case "get_folder":
                    if (fs.existsSync(json.data.path)) {
                        if (await is_folder(json.data.path)) {
                            const files = [];
                            const f = fs.readdirSync(json.data.path);
                            for (let i = 0; i < f.length; i++) {
                                if (fs.existsSync(json.data.path + (json.data.path.length === 4 ? "" : "/") + f[i])) files.push({
                                    name: f[i],
                                    type: (await is_folder(json.data.path + "/" + f[i])) ? "folder" : "file"
                                });
                            }
                            socket.sendPacket("get_folder", {
                                path: json.data.path,
                                files,
                                error: 0,
                                id: json.data.id
                            });
                        } else {
                            socket.sendPacket("get_folder", {
                                path: json.data.path,
                                files: [],
                                error: 1,
                                id: json.data.id
                            });
                        }
                    } else socket.sendPacket("get_folder", {
                        path: json.data.path,
                        files: [],
                        error: 2,
                        id: json.data.id
                    });
                    break;
                case "project_folder":
                    if (!fs.existsSync(json.data.folder)) socket.sendPacket("invalid_project_folder");
                    break;
                case "create_project":
                    if (!fs.existsSync(CacheManager.getDefaultProjectFolder())) return socket.sendPacket("folder_invalid");
                    const path = CacheManager.getDefaultProjectFolder() + "/" + json.data.name;
                    if (fs.existsSync(path)) return socket.sendPacket("project_exists", {name: json.data.name});
                    CacheManager.openProject(socket, path);
                    break;
                case "open_project":
                    if (!fs.existsSync(json.data.path) || !(await is_folder(json.data.path))) return;
                    CacheManager.openProject(socket, json.data.path);
                    break;
                case "get_file":
                    const exists = fs.existsSync(json.data.path);
                    const is_folderA = await is_folder(json.data.path);
                    socket.sendPacket("get_file", {
                        path: json.data.path,
                        content: exists && !is_folderA ? fs.readFileSync(json.data.path).toString() : null,
                        exists,
                        type: exists ? is_folderA ? "folder" : "file" : null
                    });
                    break;
                case "load_script":
                    if (!fs.existsSync(json.data.file) || await is_folder(json.data.file)) return;
                    socket.sendPacket("load_script", {
                        id: json.data.id,
                        code: fs.readFileSync(json.data.file).toString()
                    });
                    break;
                case "main_menu":
                    browser.setPositionLimits();
                    break;
            }
        } catch (e) {
        }
    })
});

let url;

const create_window = async () => {
    const browser = new BrowserWindow({
        width: 700,
        height: 600
    });
    browser.setPositionLimits = () => {
        browser.unmaximize()
        browser.setSize(700, 600);
        browser.setResizable(false);
        browser.setMaximizable(false);
    }
    browser.resetPositionLimits = () => {
        browser.setResizable(true);
        browser.setMaximizable(true);
    }
    browser.setPositionLimits();
    browser.hide();
    browser.setMenu(null);
    browser.setTitle("Light");
    await browser.loadFile(__dirname + "/src/index.html");
    url = __dirname + "/src/index.html";
    browser.show();
    browser.webContents.on("update-target-url", (ev, ur) => url = ur);
    global.browser = browser;
};

app.whenReady().then(async () => {
    await create_window();
    globalShortcut.register("F5", Logger.debug);
    globalShortcut.unregister("F5");
    globalShortcut.register("CommandOrControl+R", () => global.browser.reload());
    globalShortcut.register("CommandOrControl+D", () => global.browser.webContents.openDevTools());
    app.on("activate", () => BrowserWindow.getAllWindows().length === 0 ? create_window() : null);
});

app.on("window-all-closed", () => {
    Logger.alert("Closing Light...");
    if (process.platform !== "darwin") app.quit();
});