let lang = null;
const lUs = [];
const lU = s => {
    lUs.push(s);
}
const m = s => languages[lang][s];

function setLanguage(l, save = true) {
    lang = l;
    setTimeout(() => lUs.forEach(i => i()), 10);
    if (save) ws.sendPacketForce("set_language", {language: lang})
}

let languages = {};

addWSListener("get_language", res => {
    setLanguage(res.id, false);
    languages = res.languages;
});