(() => {
    let popup;

    function closePopup() {
        if (!popup) return;
        popup.style.display = 'none';
        popup.remove();
    }

    function setPopup({
                          title,
                          content,
                          inputCallback = null,
                          buttons = [{text: "Tamam", onclick: () => closePopup()}]
                      } = {}) {
        closePopup();
        popup = document.createElement("div");
        popup.style.position = "absolute";
        popup.style.top = "5px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "white";
        popup.style.borderRadius = "5px";
        popup.style.padding = "10px";
        popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        popup.style.zIndex = "9999";
        popup.style.display = "flex";
        popup.style.flexDirection = "column";
        popup.style.width = "300px";
        popup.style.height = "auto";
        popup.style.maxHeight = "90%";
        popup.style.overflowY = "auto";
        popup.style.overflowX = "hidden";
        popup.style.fontSize = "1.2em";
        popup.style.fontFamily = "sans-serif";
        popup.style.color = "black";
        popup.style.textAlign = "center";
        popup.style.border = "1px solid black";
        popup.innerHTML = `<div>${title}</div><div class="pp-content">${content}</div>${inputCallback ? `<input id="pp-inp" type="text" placeholder="Bir cevap girin...">` : ''}<div class="pp-buttons">${buttons.map((button, i) => `<button class="pp-button" onclick="document._popup.buttons[${i}].onclick()">${button.text}</button>`).join('')}</div>`;
        document._popup = {buttons, inputCallback};
        document.body.appendChild(popup);
    }

    async function alert(content) {
        return await new Promise(r => setPopup({
            title: "Mesaj", content, buttons: [{
                text: "Tamam", onclick: () => {
                    r();
                    closePopup();
                }
            }]
        }));
    }

    async function prompt(content) {
        return await new Promise(r => setPopup({
            title: "Soru", content, inputCallback: r, buttons: [{
                text: "Tamam", onclick: () => {
                    r(document.getElementById("pp-inp").value);
                    closePopup();
                }
            }]
        }));
    }

    async function confirm(content) {
        return await new Promise(r => setPopup({
            title: "Onayla", content, buttons: [{
                text: "Tamam", onclick: () => {
                    r(true);
                    closePopup();
                }
            }, {
                text: "İptal", onclick: () => {
                    r(false);
                    closePopup();
                }
            }]
        }));
    }

    window.popup = {
        alert,
        prompt,
        confirm,
        setPopup
    };
})();

const {alert, prompt, confirm} = window.popup;
window.alert = alert;
window.prompt = prompt;
window.confirm = confirm;