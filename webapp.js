var socket = io();

var logs = {};
var containers_container = document.getElementById('containers');


function adjustHeight() {
	var count = 0;
	for (var f in logs)
		count++;

	var eachhightpercent = window.innerHeight / count;

	for (var f in logs) {
		var targetelement = logs[f].logentry_log;
		var setto = (eachhightpercent - 50) + "px";

		['height', 'max-height', 'min-height'].forEach(function(prop) {
			targetelement.style[prop] = setto;
		});
	}
}

function newLogEntry(msg) {
	//create a new log output, and write it to logs[msg.file]
	var logentry = document.createElement('div');

	var logentry_clearbutton = document.createElement('button');
	logentry_clearbutton.innerHTML = "Clear " + msg.file;
	logentry.appendChild(logentry_clearbutton);
	logentry_clearbutton.onclick = function() {
		console.log("clear!", msg.file);
		logs[msg.file].logentry_log.innerHTML = "";
	}

	var logentry_log = document.createElement('pre');
	logentry_log.classList.add("log");
	logentry.appendChild(logentry_log);

	containers_container.appendChild(logentry);

	return {
		logentry: logentry,
		logentry_clearbutton: logentry_clearbutton,
		logentry_log: logentry_log
	};

}

var autoscrollarea = 100;

function scrollBottom(element) {
	element.scrollTo(0, element.scrollHeight);
}

function handleScroll(element) {
	// The scrollHeight property returns the entire height of an element in pixels, including padding, but not the border, scrollbar or margin.
	// The scrollTop property sets or returns the number of pixels an element's content is scrolled vertically.
	var totalHeight = element.scrollHeight;
	var currentPosition = element.scrollTop;
	var viewedHeight = parseInt(element.style.height.replace("px",""));

	//only scroll down, if difference between scrollHeight and scrollTop is smaller then viewed height
	var diff = totalHeight-currentPosition;
	console.log(diff, viewedHeight, totalHeight);
	if(!(diff > (viewedHeight+20))) scrollBottom(element);
}

socket.on('log message', function(msg) {
	if (!logs[msg.file]) {
		logs[msg.file] = newLogEntry(msg);
	}

	if (msg.text.match(/RESET LOG/)) {
		logs[msg.file].logentry_log.innerHTML = msg.text;
	} else {
		logs[msg.file].logentry_log.innerHTML += msg.text;
	}

	handleScroll(logs[msg.file].logentry_log);
	adjustHeight();
	// window.scrollTo(0, document.body.scrollHeight);
});

socket.on('disconnect', function() {
	logs = {};
	containers_container.innerHTML = ""
	console.log("socket disconnected!");
});
