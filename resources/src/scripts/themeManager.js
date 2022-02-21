const rootDiv = document.createElement("div");
document.head.appendChild(rootDiv);

let themes = {};
let theme;

function setTheme(th, save = true) {
    theme = th;
    const t = themes[theme];
    rootDiv.innerHTML = `
<style>
:root {
${Object.keys(t.json).map(key => `    --${key}: ${t.json[key]};`).join("\n")}
}
</style>`;
    if (save) ws.sendPacket("set_theme", {theme});
}

addWSListener("get_theme", res => {
    themes = res.themes;
    setTheme(res.id, false);
});

setTimeout(() => !theme ? window.location.href = window.location.href + "" : null, 1000);