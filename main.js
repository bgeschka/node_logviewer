const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const spawn = require('child_process').spawn;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/webapp.js', (req, res) => {
  res.sendFile(__dirname + '/webapp.js');
});

var logfiles = []
// var logfiles = [
// 	"/tmp/log",
// 	"/tmp/log2",
// 	"/tmp/foo/bar/log3"
// ];

var start_from_argv = 2;
for(var i = start_from_argv; process.argv[i]; i++)
	logfiles.push(process.argv[i]);


function tailWithRetry(file) {
	var p = spawn("tail", ["-F", file]);
	p.on('close', (code) => {
		console.log("tail on ", file, "has closed!");
	});

	return p;
}


var tails = logfiles.map((file) => {
	var p = {
		process : tailWithRetry(file),
		file: file
	}
	return p;
});

io.on('connection', (socket) => {
	tails.forEach(function(tail) {
  		tail.process.stdout.on("data", function (data) {
  			socket.emit('log message', {
				file: tail.file,
				text : data.toString()
			});
  		}); 
	});
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

