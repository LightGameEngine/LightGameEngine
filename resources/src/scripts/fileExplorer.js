const style = document.createElement("link");
style.href = "./styles/fileExplorer.css";
style.rel = "stylesheet";
document.head.appendChild(style);

let _path_id = 0;
document.path_callbacks = {};
let last_success_path = null;
let current_folder = null;
let selected_file = null;
let file_ok = null;
let file_cancel = null;
let file_folder_mode = false;
let lastFileClick = {file: null, time: Date.now()};

addWSListener("get_folder", ({path, files, error, id}) => {
    inRequest = false;
    if (error === 2) {
        console.error("Couldn't load folder " + path);
    }
    if (error === 2) {
        return setFolder(last_success_path);
    } else last_success_path = path;
    document.path_callbacks[id](path, files, error === 1);
});

function setSelectedFile(path) {
    selected_file = {folder: current_folder, file: path};
    setFolder(current_folder);
}

let home = "";
ws.sendPacket("get_home_path");
addWSListener("get_home_path", ({path}) => home = path.replaceAll("\\", "/"));
let inRequest = false;

function setFolder(path, cb = r => r, click = false) {
    if(inRequest) return;
    current_folder = path;
    const file_list = document.getElementById("file_list");
    const file_path = document.getElementById("file_path");
    const id = _path_id++;
    let inner = "";
    const back = path.split("/").reverse().slice(1).reverse().join("/") + (path.split("/").length === 3 ? "/" : "");
    if (path.length !== 4)
        inner += `<div class="file_element" onclick="setFolder('${back}')">...</div>`;
    document.path_callbacks[id] = (path, files, isFile) => {
        if (isFile) {
            if (!file_folder_mode) {
                setSelectedFile(path);
                setFolder(back);
            }
            return;
        }
        if (click && file_folder_mode) {
            if (lastFileClick.time < Date.now() || lastFileClick.file !== path) lastFileClick = {
                file: null,
                time: Date.now() + 1000
            };
            if (lastFileClick.file !== path) {
                current_folder = back;
                setSelectedFile(path);
                lastFileClick.file = path;
                lastFileClick.time = Date.now() + 1000;
                return;
            }
            file_list.scrollTop = 0;
        }
        localStorage.setItem("last_folder", path);
        file_path.value = path;
        file_path.scrollLeft = file_path.scrollWidth;
        files = files.sort((a, b) => a.type === b.type ? [a.name.toLowerCase(), b.name.toLowerCase()].sort().indexOf(a.name) === 0 ? -1 : 1 : a.type === "folder" ? -1 : 1);
        files.forEach(i => {
            const fullPath = path.length === 4 ? path + i.name : path + "/" + i.name;
            if ((i.type === "folder") === file_folder_mode) inner += `<div style="color: var(--file-element-color)" class="file_element" id="${fullPath}" onclick="setFolder('${fullPath}', r => r, true)">${`<div style="position: absolute; margin-top: -3px"><img draggable="false" width="20" src="../assets/${i.type}.png"></div>${"&nbsp;".repeat(8)}` + i.name}</div>`;
        });
        file_list.innerHTML = inner;
        if (selected_file) {
            if (selected_file.folder === path) {
                const c = document.getElementById(selected_file.file);
                if (c) c.classList.add("file_element_selected");
            } else selected_file = null;
        } else file_list.scrollTop = 0;
        cb();
    }
    inRequest = true;
    ws.sendPacket("get_folder", {path, id});
}

function openFileExplorerPopup(path, folderMode = false, ok = r => r, cancel = closeFileExplorerPopup) {
    if(inRequest) return;
    path = path || localStorage.getItem("last_folder") || "C://";
    file_ok = ok;
    file_cancel = cancel;
    file_folder_mode = folderMode;
    let fileExplorer = document.getElementById("fileExplorer");
    if (fileExplorer) fileExplorer.remove();
    fileExplorer = document.createElement("div");
    fileExplorer.hidden = true;
    fileExplorer.id = "fileExplorer";
    document.body.appendChild(fileExplorer);
    fileExplorer.classList.add("file_explorer");
    const fileExplorerBack = document.createElement("div");
    fileExplorerBack.classList.add("file_explorer_back");
    const fL = [
        home + "/Documents", home + "/Downloads", home + "/Desktop",
        home + "/Music", home + "/Pictures", home + "/Videos", home
    ];
    // noinspection HtmlUnknownTarget
    fileExplorerBack.innerHTML = `
<svg class="file_close" id="file_close" onclick="file_cancel()" width="50" height="35">
    <path d="M20 12 L30 22 Z" stroke="white"></path>
    <path d="M30 12 L20 22 Z" stroke="white"></path>
</svg>
<div class="fav_list">
    ${fL.map(f => `<div style="color: var(--file-element-color)" class="file_element" onclick="setFolder('${f}', r => r, false)">${`<div style="position: absolute; margin-top: -3px"><img draggable="false" width="20" src="../assets/folder.png"></div>${"&nbsp;".repeat(8)}` + m("file-" + (f !== home ? f.split("/").reverse()[0] : "home"))}</div>`).join("")}
</div>
<div id="file_search" class="file_search">
    <input id="file_path" maxlength="128" spellcheck="false" value="${path}" placeholder="${m("file-explorer-placeholder")}" style="background: none;color: var(--file-search-input-color);border: none;outline: none;width: 330px">
</div>
<img draggable="false" src="../assets/refresh.png" width="17" style="position: absolute; right: 58px; top: 12px; cursor: pointer" onclick="selected_file = null;setFolder(current_folder)">
<div class="file_list" id="file_list"></div>
<button class="btn btn_okay file_ok_btn" onclick="selected_file ? file_ok(selected_file) : null">${m("okay-button")}</button>
<button class="btn file_cancel_btn" onclick="file_cancel()">${m("cancel-button")}</button>`;
    fileExplorer.appendChild(fileExplorerBack);
    const file_path = document.getElementById("file_path");
    setFolder(path, () => fileExplorer.hidden = undefined);
    file_path.addEventListener("change", () => setFolder(file_path.value));
}

function closeFileExplorerPopup() {
    const fileExplorer = document.getElementById("fileExplorer");
    if (fileExplorer) fileExplorer.remove();
}

function refreshFileExplorer() {
    const file_list = document.getElementById("file_list");
    if (!file_list) return;
    const before = file_list.scrollTop;
    setFolder(current_folder, () => file_list.scrollTop = before);
}

window.addEventListener("blur", refreshFileExplorer);
window.addEventListener("focus", refreshFileExplorer);