// noinspection JSUnusedGlobalSymbols

// Source: https://github.com/bgrins/javascript-astar

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
addEventListener("keydown", ev => _hK[ev.key] = true);
addEventListener("keyup", ev => delete _hK[ev.key]);
addEventListener("mousemove", ev => {
    mouse.x = ev.offsetX;
    mouse.y = ev.offsetY;
});

function log(str) {
    printHandler(JSON.stringify(str));
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

class Model {
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
     * @param {CanvasRenderingContext2D} ctx
     * @param {Entity} entity
     * @param {Vector2} position
     */
    draw(ctx, entity, position) {
    }
}

class ImageModel extends Model {
    static PROPERTIES = ["offsetX", "offsetY", "width", "height", "image"];
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;
    /*** @type {CanvasImageSource | null} */
    image = null;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} width
     * @param {number} height
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, width, height, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setWidth(width)
            .setHeight(height);
    }

    /**
     * @param {number} width
     * @returns {ImageModel}
     */
    setWidth(width) {
        this.width = width;
        return this;
    }

    /**
     * @param {number} height
     * @returns {ImageModel}
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
        ImageModel.loadImage(urlOrImage).then(img => this.setImage(img));
    }

    draw(ctx, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        ctx.rotateComplete(entity.rotation || 0, position.add(this.width / 2, this.height / 2));
        ctx.globalAlpha = this.opacity;
        if (this.image) ctx.drawImage(this.image, position.x, position.y, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
}

class TextModel extends Model {
    static PROPERTIES = ["offsetX", "offsetY", "text", "font", "size", "color", "maxWidth"];
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
     * @param {string} text
     * @param {string} font
     * @param {number} size
     * @param {string} color
     * @param {number | null} maxWidth
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, text, font = "Calibri", size = 16, color = "#000000", maxWidth = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
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
        this.text = text;
        return this;
    }

    /**
     * @param {string} font
     * @returns {TextModel}
     */
    setFont(font) {
        this.font = font;
        return this;
    }

    /**
     * @param {number} size
     * @returns {TextModel}
     */
    setSize(size) {
        this.size = size;
        return this;
    }

    /**
     * @param {string} color
     * @returns {TextModel}
     */
    setColor(color) {
        this.color = color;
        return this;
    }

    /**
     * @param {number?} maxWidth
     * @returns {TextModel}
     */
    setMaxWidth(maxWidth) {
        this.maxWidth = maxWidth;
        return this;
    }

    /**
     * @param {string} text
     * @param {number} size
     * @param {string} font
     * @returns {{width: number, height: number}}
     */
    static calculateTextSize(text, size, font) {
        const div = document.createElement("span");
        div.style = `font-family:${font};font-size:${size}px`;
        div.innerHTML = text;
        document.body.appendChild(div);
        const width = div.clientWidth;
        const height = div.clientHeight;
        div.remove();
        return {width, height};
    }

    draw(ctx, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        const {width, height} = TextModel.calculateTextSize(this.text, this.size, this.font);
        position = position.add(0, height);
        ctx.rotateComplete(entity.rotation || 0, position.add(width / 2, height / 2));
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px " + this.font;
        ctx.fillText(this.text, position.x, position.y, this.maxWidth === null ? undefined : this.maxWidth);
        ctx.globalAlpha = 1;
        ctx.resetTransform();
    }
}

class PathModel extends Model {
    static PROPERTIES = ["offsetX", "offsetY", "path", "fillColor", "strokeColor", "middle"];
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
     * @param {{offsetX: number, offsetY: number}[]} path
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, path, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
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
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {PathModel}
     */
    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor;
        return this;
    }

    draw(ctx, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        ctx.rotateComplete(entity.rotation || 0, position.add(this.middle[0], this.middle[1]));
        ctx.beginPath();
        ctx.globalAlpha = this.opacity;
        ctx.moveTo(this.path[0].offsetX + position.x, this.path[0].offsetY + position.y);
        [...this.path.slice(1), this.path[0]].forEach(p => ctx.lineTo(p.offsetX + position.x, p.offsetY + position.y));
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

class RectangleModel extends PathModel {
    static PROPERTIES = ["offsetX", "offsetY", "path", "fillColor", "strokeColor", "width", "height", "middle"];
    /*** @type {number} */
    width;
    /*** @type {number} */
    height;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} width
     * @param {number} height
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, width, height, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, [
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
        this.height = height;
        this.path[2].offsetY = height;
        this.path[3].offsetY = height;
        return this;
    }
}

class CircleModel extends Model {
    static PROPERTIES = ["offsetX", "offsetY", "radius", "fillColor", "strokeColor"];
    /*** @type {number} */
    radius;
    /*** @type {string} */
    fillColor;
    /*** @type {string} */
    strokeColor;

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {number} radius
     * @param {string | null} fillColor
     * @param {string | null} strokeColor
     * @param {number} opacity
     */
    constructor(offsetX, offsetY, radius, fillColor = null, strokeColor = null, opacity = 1.0) {
        super(offsetX, offsetY, opacity)
            .setRadius(radius)
            .setFillColor(fillColor)
            .setStrokeColor(strokeColor);
    }

    /**
     * @param {number} radius
     * @returns {CircleModel}
     */
    setRadius(radius) {
        this.radius = radius;
        return this;
    }

    /**
     * @param {string?} fillColor
     * @returns {CircleModel}
     */
    setFillColor(fillColor) {
        this.fillColor = fillColor;
        return this;
    }

    /**
     * @param {string?} strokeColor
     * @returns {CircleModel}
     */
    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor;
        return this;
    }

    draw(ctx, entity, position) {
        if (this.opacity <= 0) return;
        position = position.add(this.offsetX, this.offsetY);
        ctx.rotateComplete(entity.rotation || 0, position.add(this.radius, this.radius));
        ctx.beginPath();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.arc(this.offsetX + this.radius + position.x, this.offsetY + this.radius + position.y, this.radius, 0, Math.PI * 2);
        if (this.fillColor) ctx.fill();
        if (this.strokeColor) ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.closePath();
        ctx.resetTransform();
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

    init() {
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
     * @param {Vector2} currentPosition
     * @param {Vector2} vector2
     * @param {Collision?} collision
     * @returns {boolean}
     */
    collides(currentPosition, vector2, collision = null) {
        return false;
    }
}

class RectangleCollision extends Collision {
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

    collides(currentPosition, vector2, collision) {
        if (collision && !(collision instanceof RectangleCollision)) return false;
        if (!(collision instanceof RectangleCollision)) collision = new RectangleCollision(0, 0, 1, 1);
        currentPosition = currentPosition.add(this.offsetX, this.offsetY);
        vector2 = vector2.add(collision.offsetX, collision.offsetY);
        return currentPosition.x <= vector2.x + collision.width &&
            vector2.x <= currentPosition.x + this.width &&
            currentPosition.y <= vector2.y + collision.height &&
            vector2.y <= currentPosition.y + this.height;
    }
}

class Entity extends Vector2 {
    static PROPERTIES = [
        "x", "y", "rotation", "models", "gravityEnabled", "visible", "gravity", "gravityVelocity",
        "terminalGravityVelocity", "fallDistance", "onGround", "motion", "motionDivision", "collisions"
    ];
    /*** @type {number} */
    rotation = 0;
    /*** @type {Model[]} */
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
    /*** @type {Collision[]} */
    collisions = [];

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super(x, y);
    }

    init() {
        Scene.getInstance().entities.push(this);
    }

    update() {
        const motion = this.motion.divide(10, 10);
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
        } else this.fallDistance += this.gravityVelocity;
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
     * @param {Entity | Vector2} entityOrVector
     * @returns {boolean}
     */
    collides(entityOrVector) {
        if (!(entityOrVector instanceof Entity)) return this.collisions.some(col => col.collides(this.clone(), entityOrVector));
        return entityOrVector.collisions.some(col1 => this.collisions.some(col2 => col1.collides(entityOrVector.clone(), this.clone(), col2)))
    }

    /**
     * @param {boolean} visible
     * @returns {Entity | null}
     */
    collidesAnyEntity(visible = true) {
        return Scene.getInstance().entities.find(i => i !== this && i.visible === visible && this.collides(i));
    }

    /**
     * @param {Model} model
     * @returns {Entity}
     */
    addModel(model) {
        this.models.push(model);
        return this;
    }

    /**
     * @param {Model} model
     * @returns {Entity}
     */
    removeModel(model) {
        this.models = this.models.filter(i => i !== model);
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

    update() {
    }
}

class TileMapModel extends Model {
    /*** @type {{x: number, y: number, model: Model}[]} */
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
    camera = new Vector2(0, 0);
    onUpdateStart = r => r;
    onUpdateEnd = r => r;
    /*** @type {number[]} */
    static intervals = [];
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
        this.onUpdateStart();
        this.entities.forEach(i => {
            i.update();
            if (i.visible) i.models.forEach(model => model ? model.draw(this.ctx, i, i.clone().add(this.camera)) : null);
        });
        this.onUpdateEnd();
    }

    destroy() {
        _sList.forEach(i => i.stop());
        Scene.intervals.forEach(i => clearInterval(i));
        Scene.instance = null;
        Scene.scripts = [];
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

setInterval(() => Scene.getInstance().update(), 10);
document._load_script = {};
let _script_id = 0;

/**
 * @param {string} file
 * @returns {Promise<{id: number, error: boolean, code: string | null}>}
 */
const loadScript = file => {
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