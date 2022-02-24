// noinspection JSUnusedGlobalSymbols

let _id = 0;
/**
 * @param {number} angle
 * @param {Vector2} middle
 * @return {CanvasRenderingContext2D}
 */
CanvasRenderingContext2D.prototype.rotateComplete = function (angle, middle) {
    this.translate(middle.x, middle.y);
    this.rotate(Math.deg2rad(angle));
    this.translate(-middle.x, -middle.y);
    return this;
}
CanvasRenderingContext2D.prototype.resetRotate = function () {
    this.setTransform(1, 0, 0, 1, 0, 0);
}
Object.prototype.cloneObject = function (...args) {
    const object = new this.constructor.prototype.constructor(...args);
    const {...obj} = this;
    Array.from(Object.entries(obj)).forEach(i => object[i[0]] = i[1]);
    return object;
};
/**
 * @param {number} deg
 * @returns {number}
 */
Math.deg2rad = deg => deg * Math.PI / 180;
/**
 * @param {number} rad
 * @returns {number}
 */
Math.rad2deg = rad => rad / Math.PI * 180;
/**
 * @param {Vector2} from
 * @param {Vector2} to
 * @returns {number}
 */
Math.distance = (from, to) => Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));

class Matrix2 {
    /*** @param {boolean[][]} matrix */
    constructor(matrix = []) {
        this.matrix = matrix;
        this.objectMatrix = this.calculate_added_matrix_object(new Vector2(0, 0));
    }

    /**
     * @param {number} y
     * @returns {boolean[]}
     */
    get_row(y) {
        return this.matrix[y];
    }

    /**
     * @param {number} x
     * @returns {boolean[]}
     */
    get_column(x) {
        const column = [];
        for (let y = 0; y < this.matrix.length; y++) column.push(this.matrix[y][x]);
        return column;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    get(x, y) {
        return this.matrix[y][x];
    }

    /**
     * @param {Vector2} vector2
     * @returns {Object<int, Object<int, boolean>>}
     */
    calculate_added_matrix_object(vector2) {
        const calculated = {};
        for (let y = 0; y < this.matrix.length; y++) {
            calculated[y + vector2.y] = {};
            for (let x = 0; x < this.matrix[y].length; x++) {
                calculated[y + vector2.y][x + vector2.x] = this.matrix[y][x];
            }
        }
        return calculated;
    }

    /**
     * @param {Vector2} vector2
     * @returns {int[][]}
     */
    calculate_added_matrix_object_valid_keys(vector2) {
        const keys = [];
        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x]) keys.push([x + vector2.x, y + vector2.y]);
            }
        }
        return keys;
    }

    /**
     * @param {Vector2} vector2
     * @returns {string[]}
     */
    calculate_added_matrix_object_valid_keys_stringify(vector2) {
        const keys = [];
        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x]) keys.push((x + vector2.x) + ":" + (y + vector2.y));
            }
        }
        return keys;
    }
}

const check_var = {
    bigger_0: (a, b) => {
        if (b <= 0) throw new Error(a + " should be a number that is bigger than 0, '" + b + "' provided.");
    },
    bigger_equal_0: (a, b) => {
        if (b < 0) throw new Error(a + " should be a number that is bigger or equal to 0, '" + b + "' provided.");
    },
    string: (a, b) => {
        if (!b || typeof b !== "string") throw new Error(a + " should be a string, '" + b + "' provided.");
    },
    string_null: (a, b) => {
        if (b && typeof b !== "string") throw new Error(a + " should be a string or null, '" + b + "' provided.");
    }
};

class Vector2 {
    /*** @type {number} */
    x;
    /*** @type {number} */
    y;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Vector2} vector2
     * @returns {Vector2}
     */
    getDirectionTo(vector2) {
        return this.getDirectionFrom(this.getAngleTo(vector2));
    }

    /**
     * @param {number} angle
     * @returns {Vector2}
     */
    getDirectionFrom(angle) {
        return new Vector2(Math.sin(Math.deg2rad(angle)), Math.cos(Math.deg2rad(angle)));
    }

    /**
     * @param {Vector2} vector2
     * @returns {number}
     */
    getAngleTo(vector2) {
        return Math.rad2deg(Math.atan2(this.x - vector2.x, this.y - vector2.y));
    }

    /**
     * @param {number | Vector2} xOrVector2
     * @param {number?} y
     * @returns {Vector2}
     */
    add(xOrVector2, y) {
        if (xOrVector2 instanceof Vector2) return this.add(xOrVector2.x, xOrVector2.y);
        return new Vector2(this.x + xOrVector2, this.y + y);
    }

    /**
     * @param {number | Vector2} xOrVector2
     * @param {number?} y
     * @returns {Vector2}
     */
    subtract(xOrVector2, y) {
        if (xOrVector2 instanceof Vector2) return this.subtract(xOrVector2.x, xOrVector2.y);
        return new Vector2(this.x - xOrVector2, this.y - y);
    }

    /**
     * @param {number | Vector2} xOrVector2
     * @param {number?} y
     * @returns {Vector2}
     */
    multiply(xOrVector2, y) {
        if (xOrVector2 instanceof Vector2) return this.multiply(xOrVector2.x, xOrVector2.y);
        return new Vector2(this.x * xOrVector2, this.y * y);
    }

    /**
     * @param {number | Vector2} xOrVector2
     * @param {number?} y
     * @returns {Vector2}
     */
    divide(xOrVector2, y) {
        if (xOrVector2 instanceof Vector2) return this.divide(xOrVector2.x, xOrVector2.y);
        return new Vector2(this.x / xOrVector2, this.y / y);
    }

    /*** @returns {Vector2} */
    floor() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    /*** @returns {Vector2} */
    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    /*** @returns {Vector2} */
    ceil() {
        return new Vector2(Math.ceil(this.x), Math.ceil(this.y));
    }

    /*** @returns {Vector2} */
    abs() {
        return new Vector2(Math.abs(this.x), Math.abs(this.y));
    }

    /**
     * @param {number | Vector2} xOrVector2
     * @param {number?} y
     * @returns {Vector2}
     */
    set(xOrVector2, y) {
        if (xOrVector2 instanceof Vector2) return this.set(xOrVector2.x, xOrVector2.y);
        this.x = xOrVector2;
        this.y = y;
        return this;
    }

    /*** @returns {Vector2} */
    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Model {
    /*** @type {number} */
    opacity;

    /*** @param {number} opacity */
    constructor(opacity) {
        check_var.bigger_equal_0("Model opacity", opacity);
        this.opacity = opacity || 1.0;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Entity} entity
     * @param {Vector2} position
     */
    draw(ctx, entity, position) {
    }
}

class ImageModel extends Model {
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;
    /*** @type {CanvasImageSource | null} */
    image = null;

    /**
     * @param {number} width
     * @param {number} height
     * @param {number} opacity
     */
    constructor(width, height, opacity = 1.0) {
        super(opacity)
            .setWidth(width)
            .setHeight(height);
    }

    /**
     * @param {number} width
     * @returns {ImageModel}
     */
    setWidth(width) {
        check_var.bigger_0("Model width", width);
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {ImageModel}
     */
    setHeight(height) {
        check_var.bigger_0("Model height", height);
        this.height = height;
        return this;
    }

    /**
     * @param {string} url
     * @returns {Promise<CanvasImageSource >}
     */
    static loadImage(url) {
        return new Promise(r => {
            const img = new Image();
            img.onload = () => r(img);
            img.src = url;
        });
    }

    /*** @param {string | CanvasImageSource} urlOrImage */
    setImage(urlOrImage) {
        if (urlOrImage instanceof Image) return this.image = urlOrImage;
        check_var.string("Model image", urlOrImage);
        console.info("INFO: We don't prefer using Model.setImage function with url");
        ImageModel.loadImage(urlOrImage).then(img => this.setImage(img));
    }

    draw(ctx, entity, position) {
        ctx.rotateComplete(entity.rotation || 0, position.add(this.width / 2, this.height / 2));
        if (this.image) ctx.drawImage(this.image, position.x, position.y, this.width, this.height);
        ctx.resetRotate();
    }
}

class TextModel extends Model {
    /*** @type {string} */
    text;
    /*** @type {string} */
    font;
    /*** @type {number} */
    size;
    /*** @type {string} */
    color;
    /*** @type {number} */
    maxWidth;

    /**
     * @param {string} text
     * @param {string} font
     * @param {number} size
     * @param {string} color
     * @param {number | null} maxWidth
     * @param {number} opacity
     */
    constructor(text, font = "Calibri", size = 16, color = "#000000", maxWidth = null, opacity = 1.0) {
        super(opacity)
            .setText(text)
            .setFont(font || "Calibri")
            .setSize(size || 16)
            .setColor(color || "#000000")
            .setMaxWidth(maxWidth);
    }

    /**
     * @param {string} text
     * @returns {TextModel}
     */
    setText(text) {
        check_var.string("Model text", text);
        this.text = text;
        return this;
    }

    /**
     * @param {string} font
     * @returns {TextModel}
     */
    setFont(font) {
        check_var.string("Model text font", font);
        this.font = font;
        return this;
    }

    /**
     * @param {number} size
     * @returns {TextModel}
     */
    setSize(size) {
        check_var.bigger_0("Model text size", size);
        this.size = size;
        return this;
    }

    /**
     * @param {string} color
     * @returns {TextModel}
     */
    setColor(color) {
        check_var.string("Model color", color);
        this.color = color;
        return this;
    }

    /**
     * @param {number} maxWidth
     * @returns {TextModel}
     */
    setMaxWidth(maxWidth) {
        check_var.string("Model text max width", maxWidth);
        this.maxWidth = maxWidth;
        return this;
    }

    draw(ctx, entity, position) {
        const div = document.createElement("div");
        div.style.fontFamily = this.font;
        div.style.fontSize = this.size.toString();
        div.style.position = "absolute";
        div.style.visibility = "hidden";
        div.style.width = "auto";
        div.style.height = "auto";
        div.style.whiteSpace = "nowrap";
        document.body.appendChild(div);
        const width = div.clientWidth;
        const height = div.clientHeight;
        div.remove();
        ctx.rotateComplete(entity.rotation || 0, position.add(width / 2, height / 2));
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, position.x, position.y, this.maxWidth);
        if (this.image) ctx.drawImage(this.image, position.x, position.y, width, height);
        ctx.resetRotate();
    }
}

class PathModel extends Model {
    /*** @type {{offsetX: number, offsetY: number}[]} */
    path;
    /*** @type {string | null} */
    fillColor;
    /*** @type {string | null} */
    strokeColor;
    /*** @type {[number, number]} */
    middle;

    /**
     * @param {{offsetX: number, offsetY: number}[]} path
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(path, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(opacity)
            .setPath(path)
            .setFillColor(fillColor)
            .setStrokeColor(strokeColor);
        this.middle = [0, 0];
    }

    /**
     * @param {{offsetX: number, offsetY: number}[]} path
     * @returns {PathModel}
     */
    setPath(path) {
        this.path = path;
        return this;
    }

    /**
     * @param {string?} fillColor
     * @returns {PathModel}
     */
    setFillColor(fillColor) {
        check_var.string_null("Model fill color", fillColor);
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {PathModel}
     */
    setStrokeColor(strokeColor) {
        check_var.string_null("Model stroke color", strokeColor);
        this.strokeColor = strokeColor;
        return this;
    }

    draw(ctx, entity, position) {
        ctx.rotateComplete(entity.rotation || 0, position.add(this.middle[0], this.middle[1]));
        ctx.beginPath();
        ctx.moveTo(this.path[0].offsetX + position.x, this.path[0].offsetY + position.y);
        this.path.slice(1).forEach(p => ctx.lineTo(p.offsetX + position.x, p.offsetY + position.y));
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fill();
        }
        if (this.strokeColor) {
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }
        ctx.closePath();
        ctx.resetRotate();
    }
}

class RectangleModel extends PathModel {
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;

    /**
     * @param {number} width
     * @param {number} height
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(width, height, fillColor = null, strokeColor = null, opacity = 1.0) {
        super([
            {offsetX: 0, offsetY: 0},
            {offsetX: width, offsetY: 0},
            {offsetX: width, offsetY: height},
            {offsetX: 0, offsetY: height}
        ], fillColor, strokeColor, opacity)
            .setWidth(width)
            .setHeight(height);
        this.middle = [width / 2, height / 2];
    }

    /**
     * @param {number} width
     * @returns {RectangleModel}
     */
    setWidth(width) {
        check_var.bigger_0("Model width", width);
        this.width = width;
        this.path[1].offsetX = width;
        this.path[2].offsetX = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {RectangleModel}
     */
    setHeight(height) {
        check_var.bigger_0("Model height", height);
        this.height = height;
        this.path[2].offsetY = height;
        this.path[3].offsetY = height;
        return this;
    }
}

class CircleModel extends Model {
    /*** @type {number} */
    radius;
    /*** @type {string} */
    fillColor;
    /*** @type {string} */
    strokeColor;

    /**
     * @param {number} radius
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(radius, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(opacity)
            .setRadius(radius)
            .setFillColor(fillColor)
            .setStrokeColor(strokeColor);
    }

    /**
     * @param {number} radius
     * @returns {CircleModel}
     */
    setRadius(radius) {
        check_var.bigger_0("Model radius", radius);
        this.radius = radius;
        return this;
    }

    /**
     * @param {string?} fillColor
     * @returns {CircleModel}
     */
    setFillColor(fillColor) {
        check_var.string_null("Model fill color", fillColor);
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {CircleModel}
     */
    setStrokeColor(strokeColor) {
        check_var.string_null("Model stroke color", strokeColor);
        this.strokeColor = strokeColor;
        return this;
    }

    draw(ctx, entity, position) {
        ctx.rotateComplete(entity.rotation || 0, position.add(this.radius, this.radius));
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.resetRotate();
    }
}

class Collision {
    /*** @type {number} */
    offsetX;
    /*** @type {number} */
    offsetY;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     */
    constructor(offsetX, offsetY) {
        this.setOffsetX(offsetX)
            .setOffsetY(offsetY);
    }

    /**
     * @param {number} offsetX
     * @returns {Collision}
     */
    setOffsetX(offsetX) {
        this.offsetX = offsetX;
        return this;
    }

    /**
     * @param {number} offsetY
     * @returns {Collision}
     */
    setOffsetY(offsetY) {
        this.offsetY = offsetY;
        return this;
    }

    /**
     * @param {Collision} collision
     * @returns {boolean}
     */
    collides(collision) {
    }
}

class RectangleCollision extends Collision {
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} width
     * @param {number} height
     */
    constructor(offsetX, offsetY, width, height) {
        super(offsetX, offsetY);
        this.width = width;
        this.height = height;
    }

    /**
     * @param {number} width
     * @returns {RectangleCollision}
     */
    setWidth(width) {
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {RectangleCollision}
     */
    setHeight(height) {
        this.height = height;
        return this;
    }
}

class Entity extends Vector2 {
    /*** @type {number} */
    rotation = 0;
    /*** @type {Model} */
    model;
    /*** @type {boolean} */
    gravityEnabled = true;
    /*** @type {boolean} */
    alive = true;
    /*** @type {number} */
    gravity = 1;
    /*** @type {number} */
    gravityVelocity = 1;
    /*** @type {number} */
    terminalGravityVelocity = 128;
    /*** @type {number} */
    fallDistance = 0;
    /*** @type {boolean} */
    onGround = false;
    /*** @type {Vector2} */
    motion = new Vector2(0, 0);
    /*** @type {Vector2} */
    motionDivision = new Vector2(10, 10);
    /*** @type {Collision[]} */
    collisions = [];

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y);
        Scene.getInstance().entities.push(this);
    }

    update() {
        const motion = this.motion.divide(10, 10);
        this.x += motion.x;
        this.y += motion.y;
        this.motion.x -= motion.x;
        this.motion.y -= motion.y;
        if (this.gravityEnabled && this.gravity > 0) {
            this.gravityVelocity += this.gravity;
            if (this.gravityVelocity > this.terminalGravityVelocity) this.gravityVelocity = this.terminalGravityVelocity;
            this.y += this.gravityVelocity;
            this.onGround = false;
            if (this.collidesAnyEntity()) {
                this.y -= this.gravityVelocity;
                this.onGround = true;
                if (this.fallDistance > 0) this.onFall(this.fallDistance);
            } else this.fallDistance += this.gravityVelocity;
        }
    }

    /*** @returns {Entity} */
    enableGravity() {
        this.gravityEnabled = true;
        return this;
    }

    /*** @returns {Entity} */
    disableGravity() {
        this.gravityEnabled = false;
        return this;
    }

    /*** @param {number} fallDistance */
    onFall(fallDistance) {
    }

    /**
     * @param {Entity} entity
     * @returns {boolean}
     */
    collides(entity) {
        return entity.collisions.some(col1 => this.collisions.some(col2 => col1.collides(col2)))
    }

    /**
     * @param {boolean} alive
     * @returns {boolean}
     */
    collidesAnyEntity(alive = true) {
        return Scene.getInstance().entities.some(i => i.alive === alive && i.collides(this));
    }

    /**
     * @param {Model | null} model
     * @returns {Entity}
     */
    setModel(model) {
        this.model = model;
        return this;
    }

    /**
     * @param {Collision[]} collisions
     * @returns {Entity}
     */
    setCollisions(collisions) {
        this.collisions = collisions;
        return this;
    }

    /**
     * @param {Collision} collision
     * @returns {Entity}
     */
    addCollision(collision) {
        this.collisions.push(collision);
        return this;
    }

    /**
     * @param {Collision} collision
     * @returns {Entity}
     */
    removeCollision(collision) {
        this.collisions = this.collisions.filter(col => col !== collision);
        return this;
    }
}

class Tile extends Entity {
    gravityEnabled = false;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y);
    }
}

class TileMapModel extends Model {
    /*** @type {{x: number, y: number, model: Model}[]} */
    subModels = [];

    /*** @param {number} opacity */
    constructor(opacity) {
        super(opacity);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Model} model
     */
    addModel(x, y, model) {
        this.subModels.push({x, y, model});
    }

    draw(ctx, entity, position) {
        this.subModels.forEach(i => i.model !== this ? i.model.draw(ctx, entity, position) : null);
    }
}

class TileMap extends Entity {
    /**
     * @param {number} offsetX
     * @param {number} offsetY
     */
    constructor(offsetX, offsetY) {
        super(offsetX, offsetY);
    }
}

class Scene {
    /*** @type {HTMLCanvasElement | null} */
    canvas = null;
    /*** @type {CanvasRenderingContext2D | null} */
    ctx = null;
    /*** @type {Entity[]} */
    entities = [];
    /*** @type {Worker[]} */
    static scripts = [];
    /*** @type {CanvasRenderingContext2D | null} */
    static ctx = null;
    /*** @type {Scene | null} */
    static instance = null;

    /*** @returns {Scene} */
    static getInstance() {
        return Scene.instance = Scene.instance || new Scene();
    }

    constructor() {
        this.ctx = Scene.ctx;
        this.canvas = this.ctx?.canvas;
        if (!this.ctx) throw new Error("No context found!");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.entities.forEach(i => {
            i.update();
            if (i.model) i.model.draw(this.ctx, i, i.clone());
        });
    }

    addScript(file) {
        let id = _script_id++;
        return new Promise(r => {
            document._load_script[id] = code => {
                this.code = code;
                delete document._load_script[id];
                r(code);
            }
            ws.sendPacket("load_script", {file, id});
        });
    }

    destroy() {
        Scene.instance = null;
        Scene.scripts.forEach(worker => {
            worker.terminate();
        });
        Scene.scripts = [];
    }
}

setInterval(() => Scene.ctx ? Scene.getInstance().update() : (window.on_editor ? window.on_editor() : null), 10);
document._load_script = {};
let _script_id = 0;

addWSListener("load_script", ({id, code}) => document._load_script[id](code));