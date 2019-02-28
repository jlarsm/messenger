var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    var userId = socket.id;
    var usernameId = socket.id.substring(0,9);
    users[socket.id]= 'user-'+usernameId;
    io.emit('chat message', 'Welcome user-' + usernameId);
    io.emit('new username', users[socket.id]);
    console.log(socket);
    console.log(users);
    socket.on('disconnect', function(){
        console.log('a user disconnected');
    });
    socket.on('chat message', function(msg){
        var currentdate = new Date();
        var time = currentdate.getHours() + ":" 
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds() + ' ';
        if(msg.startsWith('/nick ')){
            var oldUsername = users[socket.id];
            var newUsername = msg.split("/nick ")[1];
            var keys = Object.keys(users);
            var usernameTaken = 0;
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                if(users[key] === newUsername){
                    io.emit('chat message', '[SERVER] '+newUsername
                + ' is already in use');
                    usernameTaken = 1;
                }
            }
            if(!usernameTaken){
                users[socket.id] = newUsername;
                io.emit('chat message', '[SERVER] '+oldUsername
                    + ' Changed their name to: '+
                    newUsername);
                io.emit('new username', newUsername);
            }
        }
        console.log(msg);
        var currentUser = users[socket.id];
        io.emit('chat message', time+currentUser+": "+msg);
    });
});

http.listen(3000, function(){
    console.log('listening on :3000');
});