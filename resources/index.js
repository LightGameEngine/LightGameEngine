const electron = require("electron");
const fs = require("fs");
const {app, BrowserWindow, globalShortcut} = electron;
const lightRoamingPath = process.env.HOME.replaceAll("\\", "/") + "/AppData/Roaming/lightge";
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);
const cachePath = lightRoamingPath + "/.cache";
const Logger = require("../Logger");
let screen_info;

if (!fs.existsSync(lightRoamingPath + "/languages")) fs.mkdirSync(lightRoamingPath + "/languages");
fs.writeFileSync(lightRoamingPath + "/languages/en_US.json", JSON.stringify({
    "search-placeholder": "Search project",
    "new-project-button": "New Project",
    "create-project-title": "Create Project",
    "project-name-input": "Enter project name...",
    "create-button": "Create",
    "open-project-button": "Open Project",
    "okay-button": "OK",
    "cancel-button": "Cancel",
    "settings-title": "Settings",
    "default-project-folder": "Default project folder",
    "not-selected": "Not selected",
    "close-button": "Close",
    "default-folder-dont-exist": "Default project folder doesn't exist!",
    "should-define-project-folder": "You should have defined the default project folder in settings",
    "project-exists": "Project %0 already exists!",
    "project-name-invalid": "Project name should not include invalid characters.",
    "project-name-empty": "Project name should have been filled.",
    "properties-title": "Properties",
    "node-entity": "Entity",
    "node-model": "Model",
    "node-collision": "Collision",
    "node-tile": "Tile",
    "node-tile-map": "Tile Map",
    "node-group": "Group",
    "node-text": "Text",
    "enter-node-name": "Enter node name",
    "add-node-title": "Add Node",
    "add-node-button": "Add",
    "remove-project-menu-title": "Remove Project",
    "remove-project-menu-content": "Are you sure to remove project %0?",
    "remove-project-menu-button": "Remove",
    "invalid-node": "Invalid node name!",
    "node-exists": "This node already exists!",
    "remove-node-title": "Remove Node",
    "node-remove-text": "Are you sure to remove node %0?",
    "remove-node-button": "Remove",
    "nodes-title": "Nodes",
    "add-property-title": "Add Property",
    "property-name": "Property name",
    "property-type": "Property type",
    "add-button": "Add",
    "invalid-property-name": "Invalid property name!",
    "property-exists": "This property already exists!",
    "node-not-selected": "You should have selected a node!",
    "property--name": "Name",
    "property--width": "Width",
    "property--height": "Height",
    "property--text": "Text",
    "property--font": "Text Font",
    "property--size": "Font Size",
    "property--color": "Color",
    "property--maxWidth": "Max Width",
    "property--x": "X",
    "property--y": "Y",
    "property--fillColor": "Fill Color",
    "property--strokeColor": "Stroke Color",
    "property--rotation": "Rotation",
    "property--models": "Models",
    "property--motionDivision": "Motion Multiplier",
    "property--collisions": "Collisions",
    "property--image": "Image",
    "property--opacity": "Opacity",
    "property--gravity": "Gravity Multiplier",
    "property--gravityEnabled": "Gravity",
    "property--terminalGravityVelocity": "Max Gravity",
    "property--invisible": "Invisible",
    "property--radius": "Radius",
    "property--file": "File",
    "property--customScript": "Script",
    "property--collisionBorder": "Collision Border",
    "none": "none",
    "model-type-image": "Image",
    "model-type-text": "Text",
    "model-type-rectangle": "Rectangle",
    "model-type-circle": "Circle",
    "model-type-custom": "Custom",
    "select-model-type": "Select model type",
    "rename-node-title": "Rename Node",
    "enter-node-new-name": "Enter node's new name",
    "rename-node-button": "Rename"
}));
fs.writeFileSync(lightRoamingPath + "/languages/tr_TR.json", JSON.stringify({
    "search-placeholder": "Proje ara",
    "new-project-button": "Yeni Proje",
    "create-project-title": "Proje Oluştur",
    "project-name-input": "Proje ismi girin...",
    "create-button": "Oluştur",
    "open-project-button": "Proje Aç",
    "okay-button": "Tamam",
    "cancel-button": "İptal",
    "settings-title": "Ayarlar",
    "default-project-folder": "Varsayılan proje klasörü",
    "not-selected": "Seçilmedi",
    "close-button": "Kapat",
    "default-folder-dont-exist": "Varsayılan proje klasörü bulunamadı!",
    "should-define-project-folder": "Ayarlardan varsayılan proje klasörünü ayarlamalıydın",
    "project-exists": "%0 adlı proje bulunuyor!",
    "project-name-invalid": "Proje adı geçersiz karakter içermemeli.",
    "project-name-empty": "Proje adını doldurmalısın.",
    "properties-title": "Özellikler",
    "node-entity": "Canlı",
    "node-model": "Model",
    "node-collision": "Çarpışma Kutusu",
    "node-tile": "Nesne",
    "node-tile-map": "Nesne Haritası",
    "node-group": "Grup",
    "node-text": "Yazı",
    "enter-node-name": "Nesne adını girin",
    "add-node-title": "Nesne Ekle",
    "add-node-button": "Ekle",
    "remove-project-menu-title": "Projeyi Sil",
    "remove-project-menu-content": "%0 adlı projeyi silmek istediğinden emin misin?",
    "remove-project-menu-button": "Sil",
    "invalid-node": "Geçersiz nesne adı!",
    "node-exists": "Bu nesne zaten var!",
    "remove-node-title": "Nesneyi Kaldır",
    "node-remove-text": "%0 nesnesini silmek istediğinden emin misin?",
    "remove-node-button": "Kaldır",
    "nodes-title": "Nesneler",
    "add-property-title": "Özellik Ekle",
    "property-name": "Özellik adı",
    "property-type": "Özellik türü",
    "add-button": "Ekle",
    "invalid-property-name": "Geçersiz özellik adı!",
    "property-exists": "Bu özellik zaten var!",
    "node-not-selected": "Bir nesne seçmeliydin!",
    "property--width": "Uzunluk",
    "property--height": "Yükseklik",
    "property--text": "Yazı",
    "property--font": "Yazı Tipi",
    "property--size": "Büyüklük",
    "property--color": "Renk",
    "property--maxWidth": "Max Uzunluk",
    "property--x": "X",
    "property--y": "Y",
    "property--fillColor": "Doldurma Rengi",
    "property--strokeColor": "Çevre Rengi",
    "property--rotation": "Yön",
    "property--models": "Modeller",
    "property--motionDivision": "Hareket Oranı",
    "property--collisions": "Çarpışma Kutuları",
    "property--image": "Resim",
    "property--opacity": "Opaklık",
    "property--gravity": "Yer Çekimi İvmesi",
    "property--gravityEnabled": "Yer Çekimi",
    "property--terminalGravityVelocity": "Max Yer Çekimi",
    "property--invisible": "Görünmez",
    "property--radius": "Yarıçap",
    "property--file": "Dosya",
    "property--customScript": "Skript",
    "property--collisionBorder": "Sınır Çizgisi",
    "none": "yok",
    "model-type-image": "Resim",
    "model-type-text": "Yazı",
    "model-type-rectangle": "Kare",
    "model-type-circle": "Yuvarlak",
    "model-type-custom": "Özel",
    "select-model-type": "Model türü seç",
    "rename-node-title": "Nesneyi Yeniden Adlandır",
    "enter-node-new-name": "Nesnenin yeni adını gir",
    "rename-node-button": "Yeniden Adlandır"
}));
if (!fs.existsSync(lightRoamingPath + "/themes")) fs.mkdirSync(lightRoamingPath + "/themes");
fs.writeFileSync(lightRoamingPath + "/themes/dark.json", JSON.stringify({
    id: "dark",
    name: {
        "tr_TR": "Karanlık",
        "en_US": "Dark"
    },
    json: {
        "background": "#3a3737",
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
        "property-name-color": "white",
        "node-hover-background": "rgba(169, 159, 159, 0.5)",
        "container-nav-background": "#5b5b5b",
        "node-selected-background": "#4a7aa9",
        "node-selected-hover-background": "#5e95cb",
        "node-menu-background": "#545454"
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
        "property-name-color": "#000000",
        "node-hover-background": "rgba(169, 159, 159, 0.5)",
        "container-nav-background": "#868686",
        "node-selected-background": "#4a7aa9",
        "node-selected-hover-background": "#5e95cb",
        "node-menu-background": "#7a7a7a"
    }
}));

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
/*** @type {{default_project_folder: string | null, theme: string, lang: string, projects: Object<string, {name: string, path: string, json: {camera: {x: number, y: number}, nodes: Object<string, {type: number, properties: Object<string, number | string>, position: number, createdTimestamp: number}>}, createdTimestamp: number, lastOpenTimestamp: number}>}} */
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
                camera: {x: 0, y: 0},
                nodes: {}
            },
            createdTimestamp: Date.now(),
            lastOpenTimestamp: 0
        };
        if (!fs.existsSync(path)) fs.mkdirSync(path);
    }

    static openProject(socket, path) {
        this.createProject(path);
        cache.projects[path].lastOpenTimestamp = Date.now();
        browser.hide();
        socket.sendPacket("open_project", {name: cache.projects[path].name, path});
        browser.resetPositionLimits();
        browser.maximize();
        browser.show();
    }

    static renameProject(path, name) {
        this.createProject(path);
        cache.projects[path].name = name;
    }

    static removeProject(path) {
        delete cache.projects[path];
    }

    static setProjectCamera(path, x, y) {
        this.createProject(path);
        cache.projects[path].json.camera = {x, y};
    }

    static getNode(path, node) {
        return cache.projects[path].json.nodes[node];
    }

    static setNodePosition(path, node, position) {
        cache.projects[path].json.nodes[node].position = position;
    }

    static getDefaultProjectFolder() {
        if (!fs.existsSync(cache.default_project_folder)) cache.default_project_folder = null;
        return cache.default_project_folder;
    }

    static setDefaultProjectFolder(folder) {
        cache.default_project_folder = folder;
    }

    static setTheme(theme) {
        cache.theme = theme;
    }

    static setLanguage(lang) {
        cache.lang = lang;
    }

    static save() {
        fs.writeFileSync(cachePath, JSON.stringify(cache));
    }
}

setInterval(CacheManager.save, 40000);

const wss = new (require("ws"))["Server"]({port: 9009});
let socketClients = [];

const is_folder = path => new Promise(r => fs.readFile(path, err => err ? r(true) : r(false)));

const property_list = {
    "model-image": {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        width: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        height: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        image: {
            type: "image",
            value: "../assets/icon.png",
            default: "../assets/icon.png",
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        }
    },
    "model-text": {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        text: {
            type: "string",
            value: "Light",
            default: "Light",
            isDefaultProperty: true
        },
        font: {
            type: "string",
            value: "Calibri",
            default: "Calibri",
            isDefaultProperty: true
        },
        size: {
            type: "number",
            value: 12,
            default: 12,
            isDefaultProperty: true
        },
        color: {
            type: "color",
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        maxWidth: {
            type: "number",
            nullAllowed: true,
            value: null,
            default: null,
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        }
    },
    "model-rectangle": {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        fillColor: {
            type: "color",
            nullAllowed: true,
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        strokeColor: {
            type: "color",
            nullAllowed: true,
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        width: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        height: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        }
    },
    "model-circle": {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        fillColor: {
            type: "color",
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        strokeColor: {
            type: "color",
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        radius: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        }
    },
    "model-custom": {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        customScript: {
            type: "script",
            value: "",
            default: "",
            isDefaultProperty: true
        }
    },
    collision: {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        width: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        height: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        },
        customScript: {
            type: "script",
            value: "",
            default: "",
            isDefaultProperty: true
        }
    },
    script: {
        file: {
            type: "file",
            value: null,
            default: null,
            isDefaultProperty: true
        }
    },
    entity: {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        rotation: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        models: {
            type: "model",
            array: true,
            value: "",
            default: "",
            isDefaultProperty: true
        },
        invisible: {
            type: "boolean",
            value: false,
            default: false,
            isDefaultProperty: true
        },
        gravityEnabled: {
            type: "boolean",
            value: true,
            default: true,
            isDefaultProperty: true
        },
        gravity: {
            type: "number",
            value: 0.3,
            default: 0.3,
            isDefaultProperty: true
        },
        terminalGravityVelocity: {
            type: "number",
            value: 128,
            default: 128,
            isDefaultProperty: true
        },
        motionDivision: {
            type: "number",
            value: 10,
            default: 10,
            isDefaultProperty: true
        },
        collisions: {
            type: "collision",
            array: true,
            value: "",
            default: "",
            isDefaultProperty: true
        },
        customScript: {
            type: "script",
            value: "",
            default: "",
            isDefaultProperty: true
        },
        collisionBorder: {
            type: "boolean",
            value: true,
            default: true,
            isDefaultProperty: true
        }
    },
    text: {
        x: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        y: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        rotation: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        },
        collisionBorder: {
            type: "boolean",
            value: true,
            default: true,
            isDefaultProperty: true
        },
        text: {
            type: "string",
            value: "Light",
            default: "Light",
            isDefaultProperty: true
        },
        font: {
            type: "string",
            value: "Calibri",
            default: "Calibri",
            isDefaultProperty: true
        },
        size: {
            type: "number",
            value: 12,
            default: 12,
            isDefaultProperty: true
        },
        color: {
            type: "color",
            value: "#000000",
            default: "#000000",
            isDefaultProperty: true
        },
        maxWidth: {
            type: "number",
            nullAllowed: true,
            value: null,
            default: null,
            isDefaultProperty: true
        },
        opacity: {
            type: "number",
            value: 1,
            default: 1,
            isDefaultProperty: true
        }
    }
};

property_list.tile = JSON.parse(JSON.stringify(property_list.entity));
delete property_list.tile.gravityEnabled;
delete property_list.tile.gravity;
delete property_list.tile.terminalGravityVelocity;
delete property_list.tile.motionDivision;
property_list["tile-map"] = JSON.parse(JSON.stringify(property_list.tile));
property_list["tile-map"].subModels = {
    value: [],
    default: [],
    visible: false
};

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
                case "screen_info":
                    screen_info = json.data;
                    setTimeout(async () => {
                        let browser = global.browser;
                        browser.hide();
                        browser.setResizable(true);
                        browser.setSize(700, 600);
                        browser.setPosition(screen_info.width / 2 - 350, screen_info.height / 2 - 300)
                        browser.setResizable(false);
                        await browser.loadFile(__dirname + "/src/index.html");
                        url = __dirname + "/src/index.html";
                        browser.show();
                    }, 8000);
                    break;
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
                case "remove_project":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    CacheManager.removeProject(json.data.path);
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
                    if (!fs.existsSync(json.data.file) || await is_folder(json.data.file))
                        return socket.sendPacket("load_script", {
                            id: json.data.id,
                            error: true
                        });
                    socket.sendPacket("load_script", {
                        id: json.data.id,
                        code: fs.readFileSync(json.data.file).toString()
                    });
                    break;
                case "add_node":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    cache.projects[json.data.path].json.nodes[json.data.node.name] = {
                        type: json.data.node.type,
                        properties: property_list[json.data.node.type],
                        position: (Object.values(cache.projects[json.data.path].json.nodes).sort((a, b) => b.position - a.position)[0] || {position: -1}).position + 1,
                        createdTimestamp: Date.now()
                    };
                    break;
                case "remove_node":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    delete cache.projects[json.data.path].json.nodes[json.data.name];
                    break;
                case "set_node_properties":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    cache.projects[json.data.path].json.nodes[json.data.name].properties = json.data.properties;
                    break;
                case "set_node_type":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    cache.projects[json.data.path].json.nodes[json.data.name].type = json.data.type;
                    break;
                case "switch_node_positions":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    const a = CacheManager.getNode(json.data.path, json.data.from).position;
                    CacheManager.setNodePosition(json.data.path, json.data.from, CacheManager.getNode(json.data.path, json.data.to).position);
                    CacheManager.setNodePosition(json.data.path, json.data.to, a);
                    break;
                case "set_node_position":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    CacheManager.setNodePosition(json.data.path, json.data.node, json.data.position);
                    break;
                case "set_project_camera":
                    if (!CacheManager.existsProjectPath(json.data.path)) return;
                    CacheManager.setProjectCamera(json.data.path, json.data.x, json.data.y);
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
        width: 600,
        height: 240
    }); // 700 600
    browser.setPositionLimits = (w = 700, h = 600) => {
        browser.unmaximize()
        browser.setSize(w, h);
        browser.setResizable(false);
        browser.setMaximizable(false);
    }
    browser.resetPositionLimits = () => {
        browser.setResizable(true);
        browser.setMaximizable(true);
    }
    browser.setPositionLimits(606, 269);
    browser.hide();
    browser.setIcon(__dirname + "/assets/icon.png");
    browser.setMenu(null);
    browser.setTitle("Light");
    await browser.loadFile("./resources/src/start.html");
    url = __dirname + "/resources/src/start.html";
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
    Logger.alert("Closing Light, saving cache...");
    CacheManager.save();
    if (process.platform !== "darwin") app.quit();
});
