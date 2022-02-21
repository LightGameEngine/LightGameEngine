let lang = null;
const lUs = [];
const lU = s => {
    lUs.push(s);
}
const m = s => languages[lang][s];

function setLanguage(l, save = true) {
    lang = l;
    lUs.forEach(i => i());
    if (save) ws.sendPacket("set_language", {language: lang})
}

let languages = {};

addWSListener("get_language", res => {
    lang = res.id;
    languages = res.languages;
});