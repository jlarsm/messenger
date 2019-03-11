var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var users = {};
var colors = {};
var messages = [];
var usersocket ={};

app.use(cookieParser());

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    var userId ='';
    socket.on('connected', function(){
        for(var i=0;i<messages.length;i++){
            socket.emit('update messages',messages[i][0],messages[i][1],messages[i][2],messages[i][3],messages[i][4],socket.id);
        }
    });
    socket.on('get user', function(uid,username){
        userId=uid;
        if(uid in users){
            users[socket.id] = username;
            colors[socket.id] = colors[uid];
            usersocket[socket.id] = uid;
        }
        else{
            users[socket.id]= username;
            colors[uid] = '#ffffff';
        }
        io.emit('server message', 'Welcome '+username);
        io.emit('update userlist', JSON.stringify(users));
    });
    
    
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        io.emit('server message', '[SERVER] '+users[socket.id]+' has disconnected');
        users[socket.id] = '';
        io.emit('update userlist', JSON.stringify(users));
    });
    socket.on('store message', function(msg){
        messages.push(msg);
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
                    io.emit('server message', '[SERVER] '+newUsername
                + ' is already in use');
                    usernameTaken = 1;
                }
            }
            if(!usernameTaken){
                users[socket.id] = newUsername;
                io.emit('server message', '[SERVER] '+oldUsername
                    + ' Changed their name to: '+
                    newUsername);
                io.emit('change username',usersocket[socket.id],newUsername)
                io.emit('update userlist', JSON.stringify(users));
            }
        }
        else if(msg.startsWith('/nickcolor ')){
            var usernamecolor = msg.split('/nickcolor ');
            var hexcheck = /([0-9A-F]{6}$)|([0-9A-F]{3}$)/i.test(usernamecolor);
            if(hexcheck){
                colors[socket.id] = '#'+usernamecolor[1];
            }
            else{
                console.log("Incorrect color");
            }
        }
        else{
            var currentuser = users[socket.id];
            var socketid = socket.id;
            var color = colors[socket.id];
            var array = [time,socketid,currentuser,msg,color];
            messages.push(array);
            io.emit('chat message', time,socketid,currentuser,msg,color);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on :3000');
});