var key = document.getElementById("key").innerHTML;
var json = JSON.stringify({
    type: 'message',
    userId: key
});

var client = new WebSocket('ws://localhost:3000/', 'echo-protocol');
client.onerror = function() {
    console.log('Connection Error');
};
client.onopen = function() {
    console.log('WebSocket Client Connected');
    client.send(json);
};
client.onclose = function() {
    console.log('echo-protocol Client Closed');
};
client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};
