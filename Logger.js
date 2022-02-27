const chalk = require("chalk");

module.exports = class Logger {
    static debugging = true;

    static DEBUG = chalk.gray;
    static INFO = r => r;
    static ALERT = chalk.redBright;
    static WARNING = chalk.yellowBright;

    static log(type, text) {
        const date = new Date();
        console.info(`${chalk.blueBright(`[${date.getHours().toString().length < 2 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes().toString().length < 2 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds().toString().length < 2 ? "0" + date.getSeconds() : date.getSeconds()}]`)}${this[type](`${" ".repeat((8 - type.length) - Math.floor((8 - type.length) / 2))}[${type}]${" ".repeat(Math.floor((8 - type.length) / 2))}: ${text}`)}`);
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