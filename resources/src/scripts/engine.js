// noinspection JSUnusedGlobalSymbols

// [CREDIT] Source: https://github.com/bgrins/javascript-astar

(() => {
    function pathTo(node, sync) {
        let curr = node, path = [];
        if (sync) {
            while (curr.parent) {
                path.push(curr);
                curr = curr.parent;
            }
            return new Promise(r => r(path.reverse()));
        }
        return new Promise(r => {
            const func = () => {
                if (curr.parent) {
                    path.push(curr);
                    curr = curr.parent;
                    requestAnimationFrame(func);
                } else {
                    r(path.reverse());
                }
            };
            func();
        });
    }

    const PathFinderAStar = {
        search: async function (grid, start, end, options) {
            options = options || {};
            options.sync = options.sync === undefined ? true : options.sync;
            const graph = {
                grid: grid.map((t, r) => t.map((j, i) => [{
                    x: r,
                    y: i,
                    weight: j,
                    f: 0,
                    g: 0,
                    h: 0,
                    visited: false,
                    closed: false,
                    parent: null
                }][0]))
            };
            start = graph.grid[start.x][start.y];
            end = graph.grid[end.x][end.y];
            const heuristic = options["heuristic"] || PathFinderAStar.heuristics.manhattan,
                closest = options.closest || false;
            let openHeap = new BinaryHeap(n => n.f), closestNode = start;
            start.h = heuristic(start, end);
            openHeap.content.push(start);
            await openHeap.sink(openHeap.content.length - 1, options.sync);
            if (options.sync) {
                while (openHeap.content.length > 0) {
                    const currentNode = await openHeap.pop(options.sync);
                    if (currentNode === end) return pathTo(currentNode);
                    currentNode.closed = true;
                    const neighbors = [];
                    if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y]);
                    if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y]);
                    if (graph.grid[currentNode.x] && graph.grid[currentNode.x][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x][currentNode.y - 1]);
                    if (graph.grid[currentNode.x] && graph.grid[currentNode.x][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x][currentNode.y + 1]);
                    if (options.diagonal) {
                        if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y - 1]);
                        if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y - 1]);
                        if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y + 1]);
                        if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y + 1]);
                    }
                    for (let i = 0, il = neighbors.length; i < il; ++i) {
                        const neighbor = neighbors[i];
                        if (neighbor.closed || neighbor.weight === 0) continue;
                        const gScore = currentNode.g + neighbor.weight, beenVisited = neighbor.visited;
                        if (!beenVisited || gScore < neighbor.g) {
                            neighbor.visited = true;
                            neighbor.parent = currentNode;
                            neighbor.h = neighbor.h || heuristic(neighbor, end);
                            neighbor.g = gScore;
                            neighbor.f = neighbor.g + neighbor.h;
                            if (closest && (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g))) closestNode = neighbor;
                            if (!beenVisited) {
                                openHeap.content.push(neighbor);
                                await openHeap.sink(openHeap.content.length - 1, options.sync);
                            } else await openHeap.sink(openHeap.content.indexOf(neighbor), options.sync)
                        }
                    }
                }
            } else {
                const r = await new Promise(async res => {
                    const func = async () => {
                        if (openHeap.content.length > 0) {
                            const currentNode = await openHeap.pop(options.sync);
                            if (currentNode === end) {
                                res(pathTo(currentNode));
                                return;
                            }
                            currentNode.closed = true;
                            const neighbors = [];
                            if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y]);
                            if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y]);
                            if (graph.grid[currentNode.x] && graph.grid[currentNode.x][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x][currentNode.y - 1]);
                            if (graph.grid[currentNode.x] && graph.grid[currentNode.x][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x][currentNode.y + 1]);
                            if (options.diagonal) {
                                if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y - 1]);
                                if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y - 1]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y - 1]);
                                if (graph.grid[currentNode.x - 1] && graph.grid[currentNode.x - 1][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x - 1][currentNode.y + 1]);
                                if (graph.grid[currentNode.x + 1] && graph.grid[currentNode.x + 1][currentNode.y + 1]) neighbors.push(graph.grid[currentNode.x + 1][currentNode.y + 1]);
                            }
                            let i = 0;
                            let il = neighbors.length;
                            await new Promise(async res2 => {
                                const func2 = async () => {
                                    if (i < il) {
                                        const neighbor = neighbors[i];
                                        if (neighbor.closed || neighbor.weight === 0) {
                                            i++;
                                            return requestAnimationFrame(func2);
                                        }
                                        const gScore = currentNode.g + neighbor.weight, beenVisited = neighbor.visited;
                                        if (!beenVisited || gScore < neighbor.g) {
                                            neighbor.visited = true;
                                            neighbor.parent = currentNode;
                                            neighbor.h = neighbor.h || heuristic(neighbor, end);
                                            neighbor.g = gScore;
                                            neighbor.f = neighbor.g + neighbor.h;
                                            if (closest && (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g))) closestNode = neighbor;
                                            if (!beenVisited) {
                                                openHeap.content.push(neighbor);
                                                await openHeap.sink(openHeap.content.length - 1, options.sync);
                                            } else await openHeap.sink(openHeap.content.indexOf(neighbor), options.sync)
                                        }
                                        i++;
                                        requestAnimationFrame(func2);
                                    } else res2();
                                }
                                await func2();
                            });
                            requestAnimationFrame(func);
                        } else res();
                    }
                    await func();
                });
                if (r) return r;
            }
            if (closest) return pathTo(closestNode);
            return [];
        },
        heuristics: {
            manhattan: (p1, p2) => Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y),
            diagonal: (p1, p2) => (Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y)) + ((Math.sqrt(2) - 2) * Math.min(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y)))
        }
    };

    class BinaryHeap {
        constructor(callback) {
            this.content = [];
            this.callback = callback;
        }

        async pop(sync) {
            const result = this.content[0];
            const end = this.content.pop();
            if (this.content.length > 0) {
                this.content[0] = end;
                let n = 0;
                const ES = this.callback(this.content[n]);
                if (sync) {
                    while (true) {
                        const c2N = (n + 1) << 1, c1N = c2N - 1;
                        let sw = null, c1S;
                        if (c1N < this.content.length) {
                            const child1 = this.content[c1N];
                            c1S = this.callback(child1);
                            if (c1S < ES) sw = c1N;
                        }
                        if (c2N < this.content.length && this.callback(this.content[c2N]) < (sw === null ? ES : c1S)) sw = c2N;
                        if (sw !== null) {
                            this.content[n] = this.content[sw];
                            this.content[sw] = this.content[n];
                            n = sw;
                        } else break;
                    }
                } else {
                    await new Promise(r => {
                        const func = () => {
                            const c2N = (n + 1) << 1, c1N = c2N - 1;
                            let sw = null, c1S;
                            if (c1N < this.content.length) {
                                const child1 = this.content[c1N];
                                c1S = this.callback(child1);
                                if (c1S < ES) sw = c1N;
                            }
                            if (c2N < this.content.length && this.callback(this.content[c2N]) < (sw === null ? ES : c1S)) sw = c2N;
                            if (sw !== null) {
                                this.content[n] = this.content[sw];
                                this.content[sw] = this.content[n];
                                n = sw;
                            } else return r();
                            requestAnimationFrame(func);
                        };
                        func();
                    });
                }
            }
            return result;
        }

        sink(n, sync) {
            const el = this.content[n];
            if (sync) {
                while (n > 0) {
                    const parentN = ((n + 1) >> 1) - 1,
                        parent = this.content[parentN];
                    if (this.callback(el) < this.callback(parent)) {
                        this.content[parentN] = el;
                        this.content[n] = parent;
                        n = parentN;
                    } else break;
                }
            } else return new Promise(r => {
                const func = () => {
                    if (n > 0) {
                        const parentN = ((n + 1) >> 1) - 1, parent = this.content[parentN];
                        if (this.callback(el) < this.callback(parent)) {
                            this.content[parentN] = el;
                            this.content[n] = parent;
                            n = parentN;
                        } else return r();
                    } else return r();
                    requestAnimationFrame(func);
                };
                func();
            });
            return new Promise(r => r());
        }
    }

    window.AStar = PathFinderAStar;
})();
const PathFinder = {
    /*** @type {{heuristics: Object<string, function(p1: {x: number, y: number}, p2: {x: number, y: number}): number>, search: function(grid: number[][], start: {x: number, y: number}, end: {x: number, y: number}, options?: {heuristic?: function(p1: {x: number, y: number}, p2: {x: number, y: number}): number, closest?: boolean, diagonal?: boolean, sync?: boolean}): Promise<{x: int, y: int}[]>}} */
    AStar: window.AStar
};

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
/**Object.prototype.cloneObject = function (...args) {
    const object = new this.constructor.prototype.constructor(...args);
    const {...obj} = this;
    Array.from(Object.entries(obj)).forEach(i => object[i[0]] = i[1]);
    return object;
};*/


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
     * @param {Vector2} vector2
     * @returns {boolean}
     */
    equals(vector2) {
        return vector2.x === this.x && vector2.y === this.y;
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

let printHandler = console.log;
let _hK = {};
const _mP = new Vector2(0, 0);
const mouse = new Vector2(0, 0);
addEventListener("keydown", ev => _hK[ev.key] = true);
addEventListener("keyup", ev => delete _hK[ev.key]);
addEventListener("mousemove", ev => {
    mouse.x = ev.offsetX;
    mouse.y = ev.offsetY;
});

function log(str, file) {
    if (str instanceof Error) {
        printHandler((file ? file + " > " : "") + "<span style='color: red'>" + str.message + "</:span>")
    } else printHandler(JSON.stringify(str));
}

function getMouse() {
    return mouse;
}

function getMouseWithCamera() {
    return Scene.getInstance().camera.subtract(mouse);
}

function isPressing(key) {
    return _hK[key] || false;
}

function keysPressing() {
    return Object.keys(_hK);
}

class Model2D {
    /*** @type {number} */
    opacity;
    /*** @type {number} */
    offsetX;
    /*** @type {number} */
    offsetY;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, opacity) {
        this.opacity = !opacity && opacity !== 0 ? 1.0 : opacity;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    init() {
    }

    /**
     * @param {Scene} scene
     * @param {Entity2D} entity
     * @param {Vector2} position
     */
    draw(scene, entity, position) {
    }
}

class ImageModel2D extends Model2D {
    static PROPERTIES = ["offsetX", "offsetY", "rotation", "width", "height", "image"];
    /*** @type {number} */
    rotation;
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;
    /*** @type {CanvasImageSource | null} */
    image = null;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} rotation
     * @param {number} width
     * @param {number} height
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, rotation, width, height, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setWidth(width)
            .setHeight(height)
            .setRotation(rotation);
    }

    /**
     * @param {number} rotation
     * @returns {ImageModel2D}
     */
    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }

    /**
     * @param {number} width
     * @returns {ImageModel2D}
     */
    setWidth(width) {
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {ImageModel2D}
     */
    setHeight(height) {
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
        document._cc.info("INFO: We don't prefer using Model.setImage function with url");
        ImageModel2D.loadImage(urlOrImage).then(img => this.setImage(img));
    }

    /**
     * @param {Scene} scene
     * @param {Entity2D} entity
     * @param {Vector2} position
     */
    draw(scene, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        const {ctx} = scene;
        const width = scene.zoom * this.width;
        const height = scene.zoom * this.height;
        ctx.rotateComplete(this.rotation, position.add(width / 2, height / 2));
        ctx.globalAlpha = this.opacity;
        if (this.image) ctx.drawImage(this.image, position.x, position.y, width, height);
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
}

class TextModel2D extends Model2D {
    static PROPERTIES = ["offsetX", "offsetY", "rotation", "text", "font", "size", "color", "maxWidth"];
    /*** @type {number} */
    rotation;
    /*** @type {string} */
    text;
    /*** @type {string} */
    font;
    /*** @type {number} */
    size;
    /*** @type {string} */
    color;
    /*** @type {number | null} */
    maxWidth;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} rotation
     * @param {string} text
     * @param {string} font
     * @param {number} size
     * @param {string} color
     * @param {number | null} maxWidth
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, rotation, text, font = "Calibri", size = 16, color = "#000000", maxWidth = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setText(text)
            .setFont(font || "Calibri")
            .setSize(size || 16)
            .setColor(color || "#000000")
            .setMaxWidth(maxWidth)
            .setRotation(rotation);
    }

    /**
     * @param {string} text
     * @returns {TextModel2D}
     */
    setText(text) {
        this.text = text;
        return this;
    }

    /**
     * @param {number} rotation
     * @returns {TextModel2D}
     */
    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }

    /**
     * @param {string} font
     * @returns {TextModel2D}
     */
    setFont(font) {
        this.font = font;
        return this;
    }

    /**
     * @param {number} size
     * @returns {TextModel2D}
     */
    setSize(size) {
        this.size = size;
        return this;
    }

    /**
     * @param {string} color
     * @returns {TextModel2D}
     */
    setColor(color) {
        this.color = color;
        return this;
    }

    /**
     * @param {number?} maxWidth
     * @returns {TextModel2D}
     */
    setMaxWidth(maxWidth) {
        this.maxWidth = maxWidth;
        return this;
    }

    /**
     * @param {string} text
     * @param {number} size
     * @param {string} font
     * @param {number | null} maxWidth
     * @returns {{width: number, height: number}}
     */
    static calculateTextSize(text, size, font, maxWidth = null) {
        const div = document.createElement("span");
        // noinspection JSValidateTypes
        div.style = `font-family:${font};font-size:${size}px;position:absolute`;
        div.innerHTML = text;
        document.body.appendChild(div);
        const width = maxWidth || div.clientWidth;
        const height = div.clientHeight;
        div.remove();
        return {width, height};
    }

    /**
     * @param {Scene} scene
     * @param {Entity2D} entity
     * @param {Vector2} position
     */
    draw(scene, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        let {width, height} = TextModel2D.calculateTextSize(this.text, this.size, this.font, this.maxWidth);
        position = position.add(0, height);
        const {ctx} = scene;
        width *= scene.zoom;
        height *= scene.zoom;
        ctx.rotateComplete(this.rotation, position.add(width / 2, height / 2));
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px " + this.font;
        ctx.fillText(this.text, position.x, position.y, this.maxWidth === null ? undefined : this.maxWidth * scene.zoom);
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
}

class PathModel2D extends Model2D {
    static PROPERTIES = ["offsetX", "offsetY", "rotation", "path", "fillColor", "strokeColor", "middle"];
    /*** @type {number} */
    rotation;
    /*** @type {{offsetX: number, offsetY: number}[]} */
    path;
    /*** @type {string | null} */
    fillColor;
    /*** @type {string | null} */
    strokeColor;
    /*** @type {[number, number]} */
    middle;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} rotation
     * @param {{offsetX: number, offsetY: number}[]} path
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, rotation, path, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setPath(path)
            .setFillColor(fillColor)
            .setStrokeColor(strokeColor)
            .setRotation(rotation);
        this.middle = [0, 0];
    }

    /**
     * @param {number} rotation
     * @returns {PathModel2D}
     */
    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }

    /**
     * @param {{offsetX: number, offsetY: number}[]} path
     * @returns {PathModel2D}
     */
    setPath(path) {
        this.path = path;
        return this;
    }

    /**
     * @param {string?} fillColor
     * @returns {PathModel2D}
     */
    setFillColor(fillColor) {
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {PathModel2D}
     */
    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor;
        return this;
    }

    /**
     * @param {Scene} scene
     * @param {Entity2D} entity
     * @param {Vector2} position
     */
    draw(scene, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        const {ctx} = scene;
        ctx.rotateComplete(this.rotation, position.add(this.middle[0], this.middle[1]));
        ctx.beginPath();
        ctx.globalAlpha = this.opacity;
        ctx.moveTo(this.path[0].offsetX * scene.zoom + position.x, this.path[0].offsetY * scene.zoom + position.y);
        [...this.path.slice(1), this.path[0]].forEach(p => ctx.lineTo(p.offsetX * scene.zoom + position.x, p.offsetY * scene.zoom + position.y));
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fill();
        }
        if (this.strokeColor) {
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.closePath();
        ctx.resetTransform();
    }
}

class RectangleModel2D extends PathModel2D {
    static PROPERTIES = ["offsetX", "offsetY", "rotation", "path", "fillColor", "strokeColor", "width", "height", "middle"];
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} rotation
     * @param {number} width
     * @param {number} height
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, rotation, width, height, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, rotation, [
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
     * @returns {RectangleModel2D}
     */
    setWidth(width) {
        this.width = width;
        this.path[1].offsetX = width;
        this.path[2].offsetX = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {RectangleModel2D}
     */
    setHeight(height) {
        this.height = height;
        this.path[2].offsetY = height;
        this.path[3].offsetY = height;
        return this;
    }
}

class EllipseModel2D extends Model2D {
    static PROPERTIES = ["offsetX", "offsetY", "radiusX", "radiusY", "rotation", "fillColor", "strokeColor"];
    /*** @type {number} */
    radiusX;
    /*** @type {number} */
    radiusY;
    /*** @type {number} */
    rotation;
    /*** @type {string} */
    fillColor;
    /*** @type {string} */
    strokeColor;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} radiusX
     * @param {number} radiusY
     * @param {number} rotation
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, radiusX, radiusY, rotation, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setRadiusX(radiusX)
            .setRadiusY(radiusY)
            .setRotation(rotation)
            .setFillColor(fillColor)
            .setStrokeColor(strokeColor);
    }

    /**
     * @param {number} radius
     * @returns {EllipseModel2D}
     */
    setRadiusX(radius) {
        this.radiusX = radius;
        return this;
    }

    /**
     * @param {number} radius
     * @returns {EllipseModel2D}
     */
    setRadiusY(radius) {
        this.radiusY = radius;
        return this;
    }

    /**
     * @param {number} rotation
     * @returns {EllipseModel2D}
     */
    setRotation(rotation) {
        this.rotation = rotation;
        return this;
    }

    /**
     * @param {string?} fillColor
     * @returns {EllipseModel2D}
     */
    setFillColor(fillColor) {
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {EllipseModel2D}
     */
    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor;
        return this;
    }

    /**
     * @param {Scene} scene
     * @param {Entity2D} entity
     * @param {Vector2} position
     */
    draw(scene, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        const {ctx} = scene;
        const radius = scene.zoom * this.radius;
        ctx.rotateComplete(this.rotation || 0, position.add(radius, radius));
        ctx.beginPath();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.arc(this.offsetX + radius + position.x, this.offsetY + radius + position.y, radius, 0, Math.PI * 2);
        if (this.fillColor) ctx.fill();
        if (this.strokeColor) ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.closePath();
        ctx.resetTransform();
    }
}

class Collision2D {
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

    init() {
    }

    /**
     * @param {number} offsetX
     * @returns {Collision2D}
     */
    setOffsetX(offsetX) {
        this.offsetX = offsetX;
        return this;
    }

    /**
     * @param {number} offsetY
     * @returns {Collision2D}
     */
    setOffsetY(offsetY) {
        this.offsetY = offsetY;
        return this;
    }

    /**
     * @param {Vector2} currentPosition
     * @param {Vector2} vector2
     * @param {Collision2D?} collision
     * @returns {boolean}
     */
    collides(currentPosition, vector2, collision = null) {
        return false;
    }
}

class RectangleCollision2D extends Collision2D {
    static PROPERTIES = ["offsetX", "offsetY", "width", "height"];
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
     * @returns {RectangleCollision2D}
     */
    setWidth(width) {
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {RectangleCollision2D}
     */
    setHeight(height) {
        this.height = height;
        return this;
    }

    collides(currentPosition, vector2, collision) {
        if (collision && !(collision instanceof RectangleCollision2D)) return false;
        if (!(collision instanceof RectangleCollision2D)) collision = new RectangleCollision2D(0, 0, 1, 1);
        currentPosition = currentPosition.add(this.offsetX, this.offsetY);
        vector2 = vector2.add(collision.offsetX, collision.offsetY);
        const zoom = Scene.instance.zoom;
        return currentPosition.x <= vector2.x + collision.width * zoom &&
            vector2.x <= currentPosition.x + this.width * zoom &&
            currentPosition.y <= vector2.y + collision.height * zoom &&
            vector2.y <= currentPosition.y + this.height * zoom;
    }
}

class Entity2D extends Vector2 {
    static PROPERTIES = [
        "x", "y", "rotation", "models", "gravityEnabled", "visible", "gravity", "gravityVelocity",
        "terminalGravityVelocity", "fallDistance", "onGround", "motion", "motionDivision", "collisions"
    ];
    /*** @type {number} */
    rotation = 0;
    /*** @type {Model2D[]} */
    models = [];
    /*** @type {boolean} */
    gravityEnabled = true;
    /*** @type {boolean} */
    visible = true;
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
    /*** @type {Collision2D[]} */
    collisions = [];

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y);
    }

    initToScene() {
        Scene.getInstance().entities.push(this);
    }

    /*** @returns {{start: Vector2, end: Vector2}[]} */
    getBoundaries() {
        return [].concat(...this.collisions.filter(i => !i["isInvalid"]).map(col => {
            if (col instanceof RectangleCollision2D) {
                const width = col.width * Scene.instance.zoom;
                const height = col.height * Scene.instance.zoom;
                const offX = col.offsetX;
                const offY = col.offsetY;
                return [
                    {
                        start: this.add(offX, offY),
                        end: this.add(offX + width, offY)
                    },
                    {
                        start: this.add(offX, offY),
                        end: this.add(offX, offY + height)
                    },
                    {
                        start: this.add(offX + width, offY),
                        end: this.add(offX + width, offY + height)
                    },
                    {
                        start: this.add(offX, offY + height),
                        end: this.add(offX + width, offY + height)
                    }
                ];
            }
        }).filter(i => i));
    }

    update() {
        const motion = this.motion.divide(this.motionDivision.x, this.motionDivision.y);
        this.x += motion.x;
        this.y += motion.y;
        this.motion.x -= motion.x;
        this.motion.y -= motion.y;
        if (this.gravityEnabled && this.gravity > 0) this.onGravity();
    }

    onGravity() {
        this.gravityVelocity += this.gravity;
        if (this.gravityVelocity > this.terminalGravityVelocity) this.gravityVelocity = this.terminalGravityVelocity;
        this.y += this.gravityVelocity;
        this.onGround = false;
        if (this.collidesAnyEntity()) {
            this.y -= this.gravityVelocity;
            this.gravityVelocity = 0;
            this.onGround = true;
            if (this.fallDistance > 0) this.onFall(this.fallDistance);
            this.fallDistance = 0;
        } else this.fallDistance += this.gravityVelocity;
    }

    /*** @returns {Entity2D} */
    enableGravity() {
        this.gravityEnabled = true;
        return this;
    }

    /*** @returns {Entity2D} */
    disableGravity() {
        this.gravityEnabled = false;
        return this;
    }

    /*** @param {number} fallDistance */
    onFall(fallDistance) {
    }

    /**
     * @param {Entity2D | Vector2} entityOrVector
     * @returns {boolean}
     */
    collides(entityOrVector) {
        if (!(entityOrVector instanceof Entity2D)) return this.collisions.some(col => col.collides(this.clone(), entityOrVector));
        return entityOrVector.collisions.some(col1 => this.collisions.some(col2 => col1.collides(entityOrVector.clone(), this.clone(), col2)))
    }

    /**
     * @param {boolean} visible
     * @returns {Entity2D | null}
     */
    collidesAnyEntity(visible = true) {
        return Scene.getInstance().entities.find(i => i !== this && i.visible === visible && this.collides(i));
    }

    /**
     * @param {Model2D} model
     * @returns {this}
     */
    addModel(model) {
        this.models.push(model);
        return this;
    }

    /**
     * @param {Model2D} model
     * @returns {Entity2D}
     */
    removeModel(model) {
        this.models = this.models.filter(i => i !== model);
        return this;
    }

    /**
     * @param {Collision2D[]} collisions
     * @returns {Entity2D}
     */
    setCollisions(collisions) {
        this.collisions = collisions;
        return this;
    }

    /**
     * @param {Collision2D} collision
     * @returns {Entity2D}
     */
    addCollision(collision) {
        this.collisions.push(collision);
        return this;
    }

    /**
     * @param {Collision2D} collision
     * @returns {Entity2D}
     */
    removeCollision(collision) {
        this.collisions = this.collisions.filter(col => col !== collision);
        return this;
    }
}

class Tile2D extends Entity2D {
    gravityEnabled = false;
}

class TileMapModel2D extends Model2D {
    /*** @type {{x: number, y: number, model: Model2D}[]} */
    subModels = [];

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, opacity) {
        super(offsetX, offsetY, opacity);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {Model2D} model
     */
    addModel(x, y, model) {
        this.subModels.push({x, y, model});
    }

    draw(scene, entity, position) {
        this.subModels.forEach(i => i.model !== this ? i.model.draw(scene, entity, position) : null);
    }
}

class Vector3 {
    /*** @type {number} */
    x;
    /*** @type {number} */
    y;
    /*** @type {number} */
    z;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @param {Vector3} vector3
     * @returns {Vector3}
     */
    getDirectionTo(vector3) {
        return new Vector3(
            Math.atan2(vector3.y - this.y, vector3.x - this.x),
            Math.atan2(vector3.z - this.z, vector3.x - this.x),
            Math.atan2(vector3.z - this.z, vector3.y - this.y)
        );
    }

    /**
     * @param {number | Vector3} xOrVector3
     * @param {number?} y
     * @param {number?} z
     * @returns {Vector3}
     */
    add(xOrVector3, y, z) {
        if (xOrVector3 instanceof Vector3) return this.add(xOrVector3.x, xOrVector3.y, xOrVector3.z);
        return new Vector3(this.x + xOrVector3, this.y + y, this.z + z);
    }

    /**
     * @param {number | Vector3} xOrVector3
     * @param {number?} y
     * @param {number?} z
     * @returns {Vector3}
     */
    subtract(xOrVector3, y, z) {
        if (xOrVector3 instanceof Vector3) return this.subtract(xOrVector3.x, xOrVector3.y, xOrVector3.z);
        return new Vector3(this.x - xOrVector3, this.y - y, this.z - z);
    }

    /**
     * @param {number | Vector3} xOrVector3
     * @param {number?} y
     * @param {number?} z
     * @returns {Vector3}
     */
    multiply(xOrVector3, y, z) {
        if (xOrVector3 instanceof Vector3) return this.multiply(xOrVector3.x, xOrVector3.y, xOrVector3.z);
        return new Vector3(this.x * xOrVector3, this.y * y, this.z * z);
    }

    /**
     * @param {number | Vector3} xOrVector3
     * @param {number?} y
     * @param {number?} z
     * @returns {Vector3}
     */
    divide(xOrVector3, y, z) {
        if (xOrVector3 instanceof Vector3) return this.divide(xOrVector3.x, xOrVector3.y, xOrVector3.z);
        return new Vector3(this.x / xOrVector3, this.y / y, this.z / z);
    }

    /*** @returns {Vector3} */
    floor() {
        return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    /*** @returns {Vector3} */
    round() {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    /*** @returns {Vector3} */
    ceil() {
        return new Vector3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }

    /*** @returns {Vector3} */
    abs() {
        return new Vector3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    /**
     * @param {Vector3} vector3
     * @returns {boolean}
     */
    equals(vector3) {
        return vector3.x === this.x && vector3.y === this.y && vector3.z === this.z;
    }

    /**
     * @param {number | Vector3} xOrVector3
     * @param {number?} y
     * @param {number?} z
     * @returns {Vector3}
     */
    set(xOrVector3, y, z) {
        if (xOrVector3 instanceof Vector3) return this.set(xOrVector3.x, xOrVector3.y, xOrVector3.z);
        this.x = xOrVector3;
        this.y = y;
        this.z = z;
        return this;
    }

    /*** @returns {Vector3} */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
}

class Model3D {
    /*** @type {number} */
    opacity;
    /*** @type {number} */
    offsetX;
    /*** @type {number} */
    offsetY;
    /*** @type {number} */
    offsetZ;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} offsetZ
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, offsetZ, opacity) {
        this.opacity = !opacity && opacity !== 0 ? 1.0 : opacity;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;
    }

    init() {
    }

    /**
     * @param {Scene} scene
     * @param {Entity3D} entity
     * @param {Vector3} position
     */
    draw(scene, entity, position) {
    }
}

class Collision3D {
    /*** @type {number} */
    offsetX;
    /*** @type {number} */
    offsetY;
    /*** @type {number} */
    offsetZ;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} offsetZ
     */
    constructor(offsetX, offsetY, offsetZ) {
        this.setOffsetX(offsetX)
            .setOffsetY(offsetY)
            .setOffsetZ(offsetZ);
    }

    init() {
    }

    /**
     * @param {number} offsetX
     * @returns {Collision3D}
     */
    setOffsetX(offsetX) {
        this.offsetX = offsetX;
        return this;
    }

    /**
     * @param {number} offsetY
     * @returns {Collision3D}
     */
    setOffsetY(offsetY) {
        this.offsetY = offsetY;
        return this;
    }

    /**
     * @param {number} offsetZ
     * @returns {Collision3D}
     */
    setOffsetZ(offsetZ) {
        this.offsetZ = offsetZ;
        return this;
    }

    /**
     * @param {Vector3} currentPosition
     * @param {Vector3} vector3
     * @param {Collision3D?} collision
     * @returns {boolean}
     */
    collides(currentPosition, vector3, collision = null) {
        return false;
    }
}

class CubicCollision3D extends Collision3D {
    static PROPERTIES = ["offsetX", "offsetY", "offsetZ", "width", "height", "length"];
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;
    /*** @type {number} */
    length;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} offsetZ
     * @param {number} width
     * @param {number} height
     * @param {number} length
     */
    constructor(offsetX, offsetY, offsetZ, width, height, length) {
        super(offsetX, offsetY, offsetZ);
        this.width = width;
        this.height = height;
        this.length = length;
    }

    /**
     * @param {number} width
     * @returns {CubicCollision3D}
     */
    setWidth(width) {
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {CubicCollision3D}
     */
    setHeight(height) {
        this.height = height;
        return this;
    }

    /**
     * @param {number} length
     * @returns {CubicCollision3D}
     */
    setLength(length) {
        this.length = length;
        return this;
    }

    collides(currentPosition, vector3, collision) {
        if (collision && !(collision instanceof CubicCollision3D)) return false;
        if (!(collision instanceof CubicCollision3D)) collision = new CubicCollision3D(0, 0, 0, 1, 1, 1);
        currentPosition = currentPosition.add(this.offsetX, this.offsetY);
        vector3 = vector3.add(collision.offsetX, collision.offsetY);
        const zoom = Scene.instance.zoom;
        return currentPosition.x + this.width * zoom >= vector3.x &&
            currentPosition.x <= vector3.x + collision.width * zoom &&
            currentPosition.y + this.height * zoom >= vector3.y &&
            currentPosition.y <= vector3.y + collision.height * zoom &&
            currentPosition.z + this.length * zoom >= vector3.z &&
            currentPosition.z <= vector3.z + collision.length * zoom;
    }
}

class Entity3D extends Vector3 {
    static PROPERTIES = [
        "x", "y", "z", "rotation", "models", "gravityEnabled", "visible",
        "gravity", "gravityVelocity", "terminalGravityVelocity", "fallDistance", "onGround", "motion",
        "motionDivision", "collisions", "base"
    ];
    /*** @type {Vector3} */
    rotation = new Vector3(0, 0, 0);
    /*** @type {Model3D[]} */
    models = [];
    /*** @type {boolean} */
    gravityEnabled = true;
    /*** @type {boolean} */
    visible = true;
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
    /*** @type {Vector3} */
    motion = new Vector3(0, 0, 0);
    /*** @type {Vector3} */
    motionDivision = new Vector3(10, 10, 10);
    /*** @type {Collision3D[]} */
    collisions = [];
    base;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        super(x, y, z);
    }

    initToScene() {
        Scene.getInstance().addEntity3D(this);
    }

    /*** @returns {{start: Vector3, end: Vector3}[]} */
    getBoundaries() {
        return [].concat(...this.collisions.filter(i => !i["isInvalid"]).map(col => {
            if (col instanceof CubicCollision3D) {
                const width = col.width * Scene.instance.zoom;
                const height = col.height * Scene.instance.zoom;
                const offX = col.offsetX;
                const offY = col.offsetY;
                const offZ = col.offsetZ;
                return [
                    {
                        start: this.add(offX, offY),
                        end: this.add(offX + width, offY)
                    },
                    {
                        start: this.add(offX, offY),
                        end: this.add(offX, offY + height)
                    },
                    {
                        start: this.add(offX + width, offY),
                        end: this.add(offX + width, offY + height)
                    },
                    {
                        start: this.add(offX, offY + height),
                        end: this.add(offX + width, offY + height)
                    }
                ];
            }
        }).filter(i => i));
    }

    update() {
        const motion = this.motion.divide(this.motionDivision.x, this.motionDivision.y);
        this.set(this.add(motion));
        this.motion.set(this.motion.subtract(motion));
        if (this.gravityEnabled && this.gravity > 0) this.onGravity();
    }

    onGravity() {
        this.gravityVelocity += this.gravity;
        if (this.gravityVelocity > this.terminalGravityVelocity) this.gravityVelocity = this.terminalGravityVelocity;
        this.y += this.gravityVelocity;
        this.onGround = false;
        if (this.collidesAnyEntity()) {
            this.y -= this.gravityVelocity;
            this.gravityVelocity = 0;
            this.onGround = true;
            if (this.fallDistance > 0) this.onFall(this.fallDistance);
            this.fallDistance = 0;
        } else this.fallDistance += this.gravityVelocity;
    }

    /*** @returns {Entity3D} */
    enableGravity() {
        this.gravityEnabled = true;
        return this;
    }

    /*** @returns {Entity3D} */
    disableGravity() {
        this.gravityEnabled = false;
        return this;
    }

    /*** @param {number} fallDistance */
    onFall(fallDistance) {
    }

    /**
     * @param {Entity3D | Vector3} entityOrVector
     * @returns {boolean}
     */
    collides(entityOrVector) {
        if (!(entityOrVector instanceof Entity3D)) return this.collisions.some(col => col.collides(this.clone(), entityOrVector));
        return entityOrVector.collisions.some(col1 => this.collisions.some(col2 => col1.collides(entityOrVector.clone(), this.clone(), col2)))
    }

    /**
     * @param {boolean} visible
     * @returns {Entity3D | null}
     */
    collidesAnyEntity(visible = true) {
        return Scene.getInstance().entities3d.find(i => i !== this && i.visible === visible && this.collides(i));
    }

    /**
     * @param {Model3D} model
     * @returns {this}
     */
    addModel(model) {
        this.models.push(model);
        return this;
    }

    /**
     * @param {Model3D} model
     * @returns {Entity3D}
     */
    removeModel(model) {
        this.models = this.models.filter(i => i !== model);
        return this;
    }

    /**
     * @param {Collision3D[]} collisions
     * @returns {Entity3D}
     */
    setCollisions(collisions) {
        this.collisions = collisions;
        return this;
    }

    /**
     * @param {Collision3D} collision
     * @returns {Entity3D}
     */
    addCollision(collision) {
        this.collisions.push(collision);
        return this;
    }

    /**
     * @param {Collision3D} collision
     * @returns {Entity3D}
     */
    removeCollision(collision) {
        this.collisions = this.collisions.filter(col => col !== collision);
        return this;
    }
}


// TODO: Particles

function spawnParticle(x, y, models = []) {
}

// TODO: Particles

class Scene {
    /*** @type {HTMLCanvasElement | null} */
    canvas = null;
    /*** @type {CanvasRenderingContext2D | null} */
    ctx = null;
    /*** @type {Entity2D[]} */
    entities = [];
    /*** @type {Entity3D[]} */
    entities3d = [];
    camera = new Vector2(0, 0);
    zoom = 1.0;
    onUpdateStart = r => r;
    onUpdateEnd = r => r;
    /*** @type {{start: Vector2, end: Vector2, entity: Entity2D}[]} */
    boundaries = [];
    /*** @type {number[]} */
    static intervals = [];
    /*** @type {CanvasRenderingContext2D | null} */
    static ctx = null;
    /*** @type {Scene | null} */
    static instance = null;
    cameraTile;

    /*** @returns {Scene} */
    static getInstance() {
        return Scene.instance = Scene.instance || new Scene();
    }

    static init3D(div = document.body, controls = false, width = 0.601, height = 0.751) {
        const scene3d = new THREE.Scene();
        const camera3d = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        const renderer3d = new THREE.WebGLRenderer({alpha: true});
        const {domElement} = renderer3d;
        div.appendChild(domElement);
        domElement.style.position = "absolute";
        domElement.style.top = "0";
        domElement.style.left = "0";
        camera3d.position.z = 5;
        renderer3d.domElement.style.display = "none";
        Scene.scene3d = scene3d;
        Scene.camera3d = camera3d;
        Scene.renderer3d = renderer3d;
        Scene.scene3dSize = [width, height];
        Scene.gridHelper = new THREE.GridHelper(1000, 100, 0xffffff);
        camera3d.position.z = 100;
        camera3d.position.y = 100;
        camera3d.lookAt(0, 0, 0);
        Scene.cameraSpeed = 1;
        if (controls) {
            const controls = new THREE.OrbitControls(camera3d, renderer3d.domElement);
            controls.listenToKeyEvents(window);
            controls.enablePan = true;
            Scene.controls = controls;
            let hK = {};
            let mouseDown = false;
            let scrollMove = 0;
            addEventListener("keydown", ev => hK[ev.key.toLowerCase()] = 1);
            addEventListener("keyup", ev => hK[ev.key.toLowerCase()] = 0);
            addEventListener("blur", () => hK = {});
            addEventListener("mousewheel", ev => {
                hK["control"] ? Scene.cameraSpeed -= ev.deltaY / 1000 : scrollMove += ev.deltaY > 0 ? 1 : -1;
            });
            addEventListener("mousedown", ev => {
                const v = new THREE.Vector3(0, 0, -1);
                v.applyQuaternion(camera3d.quaternion);
                mouseDown = {
                    x: ev.offsetX,
                    y: ev.offsetY,
                    startX: ev.offsetX,
                    startY: ev.offsetY,
                    xMove: 0,
                    yMove: 0,
                    v,
                    type: ev.button
                };
            });
            addEventListener("mouseup", () => mouseDown = false);
            addEventListener("mousemove", ev => {
                pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
                pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
                if (!mouseDown) return;
                mouseDown.xMove += ev.offsetX - mouseDown.x;
                mouseDown.yMove += ev.offsetY - mouseDown.y;
                mouseDown.x = ev.offsetX;
                mouseDown.y = ev.offsetY;
            });
            const rayCaster = new THREE.Raycaster();
            const pointer = new THREE.Vector2();
            Scene.control = () => {
                if (Scene.cameraSpeed < 0.1) Scene.cameraSpeed = 0.1;
                if (Scene.cameraSpeed > 20) Scene.cameraSpeed = 20;
                if (hK[" "]) camera3d.position.y += Scene.cameraSpeed;
                if (hK["shift"]) camera3d.position.y -= Scene.cameraSpeed;
                scrollMove = 0;
                rayCaster.setFromCamera(pointer, camera3d);
                const intersects = rayCaster.intersectObjects(scene3d.children);
                for (const i of scene3d.children) {
                    if (i.type === "Mesh")
                        i.material.color.set(intersects.some(a => a.object === i) ? 0xff0000 : 0xFFFFFF);
                }
            };
        } else {
            Scene.control = r => r;
            Scene.controls = {
                update: () => {
                }
            };
        }
        Scene.controlsEnabled = controls;
    }

    removeAll3dEntities() {
        Scene.scene3d.children.forEach(child => child.removeFromParent());
    }

    constructor() {
        this.ctx = Scene.ctx;
        this.canvas = this.ctx?.canvas;
        if (!this.ctx) throw new Error("No context found!");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    addEntity3D(entity3d) {
        this.entities3d.push(entity3d);
    }

    addThreeEntity(entity) {
        Scene.scene3d.add(entity);
    }

    update() {
        if (this.zoom < 0.1) this.zoom = 0.1;
        this.boundaries = [].concat(...this.entities.filter(i => i.visible).map(en => en.getBoundaries().map(i => [{
            start: i.start,
            end: i.end,
            entity: en
        }][0]))).map(i => [{
            start: i.start.subtract(this.camera),
            end: i.end.subtract(this.camera),
            entity: i.entity
        }][0]);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.onUpdateStart();
        const resetEffects = () => {
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = "";
            this.ctx.strokeStyle = "";
            this.ctx.lineWidth = 1;
            this.ctx.font = "12px Calibri";
        };
        const {renderer3d, scene3d, camera3d, scene3dSize, control, controlsEnabled} = Scene;
        const w = Math.floor(window.innerWidth * scene3dSize[0]);
        const h = Math.floor(window.innerHeight * scene3dSize[1]);
        if (renderer3d.domElement.width * 1 !== w || renderer3d.domElement.height * 1 !== h) {
            renderer3d.setSize(w, h);
            camera3d.aspect = renderer3d.domElement.width / renderer3d.domElement.height;
            camera3d.updateProjectionMatrix();
        }
        if (renderer3d.domElement.style.display !== "none") {
            if (controlsEnabled) {
                control();
                Scene.controls.update();
            }
            renderer3d.render(scene3d, camera3d);
        }
        this.entities.forEach(i => {
            resetEffects();
            i.update();
            if (i.visible) i.models.forEach(model => model ? model.draw(this, i, i.clone().subtract(this.camera)) : null);
            resetEffects();
        });
        this.onUpdateEnd();
    }

    destroy() {
        _sList.forEach(i => i.stop());
        Scene.intervals.forEach(i => clearInterval(i));
        Scene.instance = null;
        Scene.scripts = [];
        Scene.renderer3d.domElement.style.display = "none";
        this.removeAll3dEntities();
    }
}

const _sList = [];

class Sound {
    constructor(src) {
        _sList.push(this);
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.hidden = true;
        document.body.appendChild(this.sound);
    }

    async play() {
        await this.sound.play();
    }

    stop() {
        this.sound.pause();
    }
}

/**
 * @param {string} src
 * @returns {Promise<Sound>}
 */
async function loadSound(src) {
    const sound = new Sound(src);
    return await new Promise(r => sound.sound.onload = () => r(sound));
}

/**
 * @param {number} x
 * @param {number} y
 * @param {{start: Vector2, end: Vector2}[]} boundaries
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} rayPopulation
 * @returns {{start: Vector2, end: Vector2}[]}
 */
function runRayCast2D({
                          x,
                          y,
                          boundaries = [],
                          startAngle = 0,
                          endAngle = Math.PI * 2,
                          rayPopulation = 1
                      }) {
    const lines = [];
    for (let i = startAngle; i < endAngle; i += rayPopulation) {
        const ray = {x1: x, y1: y, x2: Math.sin(i * Math.PI / 180), y2: Math.cos(i * Math.PI / 180)};
        let m = [Infinity, {}, true];
        for (const b of boundaries) {
            // [CREDIT] Source: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line_segment
            let x1 = b.start.x, y1 = b.start.y, x2 = b.end.x, y2 = b.end.y, x3 = ray.x1, y3 = ray.y1,
                x4 = ray.x1 + ray.x2, y4 = ray.y1 + ray.y2, p = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (p === 0) continue;
            let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / p,
                u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / p,
                n = t > 0 && t < 1 && u > 0 ? {x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1)} : null;
            if (n) {
                const d = Math.sqrt(Math.pow(x - n.x, 2) + Math.pow(y - n.y, 2));
                if (d < m[0]) m = [d, n, false, b];
            }
        }
        if (!m[2]) {
            const l = {start: new Vector2(x, y), end: new Vector2(m[1].x, m[1].y)};
            if (m[3]["entity"]) l.entity = m[3]["entity"];
            lines.push(l);
        }
    }
    return lines;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {{start: Vector2, end: Vector2}[]} boundaries
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} rayPopulation
 * @param {Entity2D[]} entities
 * @returns {{start: Vector2, end: Vector2, entity: Entity2D}[]}
 */
function runRayCastWithEntities2D({
                                      x,
                                      y,
                                      boundaries = [],
                                      startAngle = 0,
                                      endAngle = Math.PI * 2,
                                      rayPopulation = 1
                                  }, entities) {
    // noinspection JSValidateTypes
    return runRayCast2D({
        x,
        y,
        startAngle,
        endAngle,
        rayPopulation,
        boundaries: [...[].concat(...entities.map(en => en.getBoundaries().map(i => [{
            start: i.start,
            end: i.end,
            entity: en
        }][0]))), ...boundaries],
    });
}

class RayCastModel2D extends Model2D {
    static PROPERTIES = ["startAngle", "endAngle", "rayPopulation", "lightenCamera", "inactiveNodes", "lineWidth"];
    startAngle = 0;
    endAngle = 360;
    rayPopulation = 1;
    lightenCamera = true;
    inactiveNodes = [];
    lineWidth = 1;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {string} color
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, color, opacity) {
        super(offsetX, offsetY, opacity)
            .setColor(color);
        this.color = color;
    }

    /**
     * @param {string} color
     * @returns {RayCastModel2D}
     */
    setColor(color) {
        this.color = color;
        return this;
    }

    /**
     * @param {string[]} inactiveNodes
     * @returns {RayCastModel2D}
     */
    setInactiveNodes(inactiveNodes) {
        this.inactiveNodes = inactiveNodes;
        return this;
    }

    /**
     * @param {number} startAngle
     * @returns {RayCastModel2D}
     */
    setStartAngle(startAngle) {
        this.startAngle = startAngle;
        return this;
    }

    /**
     * @param {number} endAngle
     * @returns {RayCastModel2D}
     */
    setEndAngle(endAngle) {
        this.endAngle = endAngle;
        return this;
    }

    /**
     * @param {number} rayPopulation
     * @returns {RayCastModel2D}
     */
    setRayPopulation(rayPopulation) {
        this.rayPopulation = rayPopulation;
        return this;
    }

    /**
     * @param {number} lightenCamera
     * @returns {RayCastModel2D}
     */
    setLightenCamera(lightenCamera) {
        this.lightenCamera = lightenCamera;
        return this;
    }

    /**
     * @param {number} lineWidth
     * @returns {RayCastModel2D}
     */
    setLineWidth(lineWidth) {
        this.lineWidth = lineWidth;
        return this;
    }

    draw(scene, entity, position) {
        const {ctx} = scene;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        const {startAngle, endAngle, rayPopulation, lightenCamera} = this;
        const boundaries = scene.boundaries.filter(i => entity !== i.entity && i.entity["lightTile"] !== entity["__nodeId"] && i.entity["__nodeId"] !== "camera").filter(i => lightenCamera ? true : i.entity["__nodeId"] !== "camera").filter(i => !this.inactiveNodes.filter(i => i !== "camera").includes(i.entity["__nodeId"]));
        if (lightenCamera) {
            const sx = position.x < 0 ? position.x : 0;
            const sy = position.y < 0 ? position.y : 0;
            const w = position.x > scene.canvas.width ? position.x : scene.canvas.width;
            const h = position.y > scene.canvas.height ? position.y : scene.canvas.height;
            boundaries.push(
                {
                    start: new Vector2(sx, sy),
                    end: new Vector2(w, sy),
                    entity: new Entity2D(0, 0)
                },
                {
                    start: new Vector2(sx, sy),
                    end: new Vector2(sx, h),
                    entity: new Entity2D(0, 0)
                },
                {
                    start: new Vector2(w, sy),
                    end: new Vector2(w, h),
                    entity: new Entity2D(0, 0)
                },
                {
                    start: new Vector2(sx, h),
                    end: new Vector2(w, h),
                    entity: new Entity2D(0, 0)
                });
        }
        runRayCast2D({
            x: position.x + this.offsetX,
            y: position.y + this.offsetY,
            boundaries: boundaries.map(i => [{
                start: i.start,
                end: i.end,
                entity: i.entity
            }][0]),
            startAngle, endAngle, rayPopulation
        })
            .forEach(l => {
                ctx.beginPath();
                ctx.moveTo(l.start.x, l.start.y);
                ctx.lineTo(l.end.x, l.end.y);
                ctx.stroke();
                ctx.closePath();
            });
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
    }
}

setInterval(() => Scene.getInstance().update(), 10);
document._load_script = {};
let _script_id = 0;

(async () => {
    try {
        /**
         * @param {string} file
         * @returns {Promise<{id: number, error: boolean, code: string | null}>}
         */
        window.loadScript = file => {
            let id = _script_id++;
            return new Promise(r => {
                document._load_script[id] = res => {
                    delete document._load_script[id];
                    r(res);
                }
                ws.sendPacket("load_script", {file, id});
            });
        }

        addWSListener("load_script", res => document._load_script[res.id](res));
    } catch (e) {
    }
})();