document.body.innerHTML = document.body.innerHTML + `<input type="file" id="folder" allowdirs directory webkitdirectory moxdirectory hidden><input type="file" id="file" directory hidden><input type="file" id="multiple_files" multiple hidden>`;
const file_explorer = {
    folder: document.getElementById("folder"),
    file: {
        single: document.getElementById("file"),
        multiple: document.getElementById("multiple_files")
    },
    _listeners: {},
    /**
     * @param {"folder" | "file" | "multiple_files"} type
     */
    async open(type) {
        let el = {
            folder: file_explorer.folder,
            file: file_explorer.file.single,
            multiple_files: file_explorer.file.multiple
        }[type];
        if (!el) return null;
        return await new Promise(r => {
            file_explorer._listeners[type] = r;
            el.click();
        });
    }
};

file_explorer.file.single.addEventListener("change", () => {
    if (file_explorer._listeners["file"]) file_explorer._listeners["file"](Array.from(file_explorer.file.single.files)[0].path.replaceAll("\\", "/"));
});

file_explorer.file.multiple.addEventListener("change", () => {
    if (file_explorer._listeners["multiple_files"]) file_explorer._listeners["multiple_files"](Array.from(file_explorer.file.multiple.files).map(i => i.path.replaceAll("\\", "/")));
});

file_explorer.folder.addEventListener("change", () => {
    const first = Array.from(file_explorer.folder.files)[0];
    if(!first) return;
    const j = first.path.replaceAll("\\","/").search(first["webkitRelativePath"]);
    const folderName = first.path.replaceAll("\\","/").substring(0, j + first["webkitRelativePath"].split("/")[0].length);
    if (file_explorer._listeners["folder"]) file_explorer._listeners["folder"]({
        path: folderName,
        files: Array.from(file_explorer.folder.files).map(i => i.path.replaceAll("\\", "/"))
    });
});