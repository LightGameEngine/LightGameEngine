const fs = require("fs");
const lightRoamingPath = require("./start").lightGlobPath;
const defaultProjectFolder = process.env.HOME + "\\LightProjects";
if (!fs.existsSync(defaultProjectFolder)) fs.mkdirSync(defaultProjectFolder);
if (!fs.existsSync(lightRoamingPath)) fs.mkdirSync(lightRoamingPath);
const cachePath = lightRoamingPath + "\\.cache";
const is_folder = path => new Promise(r => fs.readFile(path, err => err ? r(true) : r(false)));
const CAMERA_PROPERTY = (position = 0) => ({
    type: "camera",
    locked: false,
    properties: {
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
        }
    },
    position,
    createdTimestamp: Date.now(),
    group: null
});
const CAMERA_PROPERTY_3D = (position = 1) => ({
    type: "camera3d",
    locked: false,
    properties: {
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
        z: {
            type: "number",
            value: 0,
            default: 0,
            isDefaultProperty: true
        }
    },
    position,
    createdTimestamp: Date.now(),
    group: null
});

class CacheManager {
    /*** @type {{default_project_folder: string | null, theme: string, lang: string, projects: Object<string, {name: string, path: string, actions: {id: "add_node" | "copy_node" | "set_node_position" | "set_node_group" | "set_node_locked" | "remove_node" | "rename_node" | "add_bulk_node" | "remove_bulk_node" | "add_property" | "set_bulk_property" | "set_property" | "remove_property", createdTimestamp: number, from: *, to: *}[], json: {camera: {x: number, y: number}, nodes: Object<string, {type: string, locked: boolean, group?: string | null, properties: Object<string, Object>, position: number, createdTimestamp: number}>}, createdTimestamp: number, lastOpenTimestamp: number}>}} */
    static cache;

    static async getProjects() {
        const p = {};
        for (let i = 0; i < Object.keys(CacheManager.cache.projects).length; i++) {
            let ind = Object.keys(CacheManager.cache.projects)[i];
            if (ind.replaceAll("\\", "/") !== ind) {
                const oldInd = CacheManager.cache.projects[ind];
                delete CacheManager.cache.projects[ind];
                oldInd.path = oldInd.path.replaceAll("\\", "/");
                CacheManager.cache.projects[ind.replaceAll("\\", "/")] = oldInd;
                ind = ind.replaceAll("\\", "/");
            }
            const project = CacheManager.cache.projects[ind];
            project.valid = fs.existsSync(project.path) ? (await is_folder(project.path)) : false;
            if (!project.valid) delete CacheManager.cache.projects[project.path];
            p[project.path] = project;
        }
        return p;
    }

    static existsProjectPath(path) {
        path = path.replaceAll("\\", "/");
        return !!CacheManager.cache.projects[path];
    }

    /*** @param {string} path */
    static createProject(path) {
        path = path.replaceAll("\\", "/");
        if (this.existsProjectPath(path)) return;
        CacheManager.cache.projects[path] = {
            name: path.replaceAll("\\", "/").split("/").reverse()[0],
            path,
            json: {
                camera: {x: 0, y: 0},
                zoom: 1.0,
                nodes: {camera: CAMERA_PROPERTY(), camera3d: CAMERA_PROPERTY_3D()}
            },
            actions: [],
            createdTimestamp: Date.now(),
            lastOpenTimestamp: 0
        };
        if (!fs.existsSync(path)) fs.mkdirSync(path);
    }

    static openProject(socket, path) {
        path = path.replaceAll("\\", "/");
        this.createProject(path);
        if (!CacheManager.cache.projects[path].json.nodes.camera)
            CacheManager.cache.projects[path].json.nodes.camera = CAMERA_PROPERTY((Object.values(CacheManager.cache.projects[path].json.nodes).map(i => i.position).sort((a, b) => b - a)[0] || 0) + 1);
        if (!CacheManager.cache.projects[path].json.nodes.camera3d)
            CacheManager.cache.projects[path].json.nodes.camera3d = CAMERA_PROPERTY_3D((Object.values(CacheManager.cache.projects[path].json.nodes).map(i => i.position).sort((a, b) => b - a)[0] || 0) + 1);
        CacheManager.cache.projects[path].lastOpenTimestamp = Date.now();
        browser.hide();
        socket.sendPacket("open_project", {name: CacheManager.cache.projects[path].name, path});
        browser.maximize();
        browser.show();
    }

    static renameProject(path, name) {
        path = path.replaceAll("\\", "/");
        this.createProject(path);
        CacheManager.cache.projects[path].name = name;
    }

    static removeProject(path) {
        path = path.replaceAll("\\", "/");
        delete CacheManager.cache.projects[path];
    }

    static getProjectActions(path) {
        path = path.replaceAll("\\", "/");
        if (!CacheManager.cache.projects[path].actions) CacheManager.cache.projects[path].actions = [];
        return CacheManager.cache.projects[path].actions;
    }

    /**
     * @param {string} path
     * @param {"add_node" | "copy_node" | "set_node_position" | "set_node_group" | "set_node_locked" | "remove_node" | "rename_node" | "add_bulk_node" | "remove_bulk_node" | "add_property" | "set_property" | "set_bulk_property" | "remove_property"} actionId
     * @param {*} from
     * @param {*} to
     */
    static addAction(path, actionId, from, to) {
        path = path.replaceAll("\\", "/");
        this.getProjectActions(path);
        CacheManager.cache.projects[path].actions.push({
            id: actionId, from, to, createdTimestamp: Date.now()
        });
    }

    static removeLastAction(path) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].actions = CacheManager.cache.projects[path].actions.reverse().slice(1).reverse();
    }

    static setProjectCamera(path, x, y) {
        path = path.replaceAll("\\", "/");
        this.createProject(path);
        CacheManager.cache.projects[path].json.camera = {x, y};
    }

    static setProjectZoom(path, zoom) {
        path = path.replaceAll("\\", "/");
        this.createProject(path);
        CacheManager.cache.projects[path].json.zoom = zoom;
    }

    static getNode(path, node) {
        path = path.replaceAll("\\", "/");
        return CacheManager.cache.projects[path].json.nodes[node];
    }

    static renameNode(path, from, to) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].json.nodes[to] = this.getNode(path, from);
        delete CacheManager.cache.projects[path].json.nodes[from];
    }

    static copyNode(path, from, to) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].json.nodes[to] = JSON.parse(JSON.stringify(this.getNode(path, from)));
        CacheManager.cache.projects[path].json.nodes[to].createdTimestamp = Date.now();
        if (CacheManager.cache.projects[path].json.nodes[from].type === "group") {
            Object.keys(CacheManager.cache.projects[path].json.nodes).filter(i => i !== from && CacheManager.cache.projects[path].json.nodes[i].group === from).forEach(i => {
                let n = 1;
                while (CacheManager.cache.projects[path].json.nodes[i + "" + n]) n++;
                this.copyNode(path, i, i + "" + n);
                this.setNodeGroup(path, i + "" + n, to);
            });
        }
    }

    static setNodeLocked(path, node, value) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].json.nodes[node].locked = value;
    }

    static setNodePosition(path, node, position) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].json.nodes[node].position = position;
    }

    static setNodeGroup(path, node, group) {
        path = path.replaceAll("\\", "/");
        CacheManager.cache.projects[path].json.nodes[node].group = group;
    }

    static getDefaultProjectFolder() {
        if (!CacheManager.cache.default_project_folder || !fs.existsSync(CacheManager.cache.default_project_folder)) CacheManager.cache.default_project_folder = defaultProjectFolder.replaceAll("\\", "/");
        return CacheManager.cache.default_project_folder.replaceAll("\\", "/");
    }

    static setDefaultProjectFolder(folder) {
        CacheManager.cache.default_project_folder = folder;
    }

    static setTheme(theme) {
        CacheManager.cache.theme = theme;
    }

    static setLanguage(lang) {
        CacheManager.cache.lang = lang;
    }

    static save() {
        fs.writeFileSync(cachePath, JSON.stringify(CacheManager.cache));
    }
}

module.exports = CacheManager;

CacheManager.cache = JSON.parse(fs.readFileSync(cachePath).toString());

setInterval(CacheManager.save, 40000);