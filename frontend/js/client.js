var key = document.getElementById("key").innerHTML;

function keydown() {
    var email = document.getElementById("email").value;
    // var password = document.getElementById("password").value;
    console.log(email);
    var json = JSON.stringify({
        type: 'message',
        event: 'email',
        userId: key,
        email: email
    });
    client.send(json);
}

var client = new WebSocket('ws://localhost:3000/', 'echo-protocol');
client.onerror = function() {
    console.log('Connection Error');
};
client.onopen = function() {
    console.log('WebSocket Client Connected');
    var json = JSON.stringify({
        type: 'message',
        event: 'connect',
        userId: key
    });
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
