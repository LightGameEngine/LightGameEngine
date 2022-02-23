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
                if(curr.parent) {
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
