module.exports = class Logger {
    static debugging = true;

    static Reset = "\x1b[0m";
    static Bright = "\x1b[1m";
    static Dim = "\x1b[2m";
    static Underscore = "\x1b[4m";
    static Blink = "\x1b[5m";
    static Reverse = "\x1b[7m";
    static Hidden = "\x1b[8m";

    static FgBlack = "\x1b[30m";
    static FgRed = "\x1b[31m";
    static FgGreen = "\x1b[32m";
    static FgYellow = "\x1b[33m";
    static FgBlue = "\x1b[34m";
    static FgMagenta = "\x1b[35m";
    static FgCyan = "\x1b[36m";
    static FgWhite = "\x1b[37m";

    static BgBlack = "\x1b[40m";
    static BgRed = "\x1b[41m";
    static BgGreen = "\x1b[42m";
    static BgYellow = "\x1b[43m";
    static BgBlue = "\x1b[44m";
    static BgMagenta = "\x1b[45m";
    static BgCyan = "\x1b[46m";
    static BgWhite = "\x1b[47m";

    static DEBUG = this.FgCyan;
    static INFO = this.FgWhite;
    static ALERT = this.FgRed;
    static WARNING = this.FgYellow;

    static log(type, text) {
        const date = new Date();
        console.info(`${this.FgBlue}[${date.getHours().toString().length < 2 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes().toString().length < 2 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds().toString().length < 2 ? "0" + date.getSeconds() : date.getSeconds()}]${this.Reset}${this[type]}${" ".repeat((8 - type.length) - Math.floor((8 - type.length) / 2))}[${type}]${" ".repeat(Math.floor((8 - type.length) / 2))}: ${text}`);
    }

    static info(text) {
        this.log("INFO", text);
    }

    static alert(text) {
        this.log("ALERT", text);
    }

    static warning(text) {
        this.log("WARNING", text);
    }

    static debug(text) {
        if (!this.debugging) return;
        this.log("DEBUG", text);
    }
}