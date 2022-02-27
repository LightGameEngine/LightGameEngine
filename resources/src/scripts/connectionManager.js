const ws = new WebSocket("ws://localhost:9009/");
const waitingPackets = [];
ws.onopen = () => {
    ws.connected = true;
    (document._cc || console).info("[WS] Connected.");
    Object.values(waitingPackets).forEach(i => ws.sendPacket(i.action, i.data));
    ws._emit("connected");
}
ws.onclose = () => alert("Connection gone.");
ws.onmessage = message => {
    message = JSON.parse(message.data);
    ws._emit(message.action, message.data);
};
ws._on = {};
ws._once = {};
ws._emit = (action, data) => {
    [...(ws._on[action] || []), ...(ws._once[action] || [])].forEach(i => i(data));
    delete ws._once[action];
}
const addWSListener = (action, cb) => {
    if (!ws._on[action]) ws._on[action] = [];
    ws._on[action].push(cb);
};

const addWSOnceListener = (action, cb) => {
    if (!ws._once[action]) ws._once[action] = [];
    ws._once[action].push(cb);
};

ws.sendPacket = (action, data) => ws.connected ? ws.send(JSON.stringify({action, data})) : waitingPackets.push({
    action,
    data
});