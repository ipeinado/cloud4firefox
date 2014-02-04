self.port.on("show", function(token) {
	var inputFormDiv = document.querySelector("#inputFormDiv");
	var logInfoDiv = document.querySelector("#logInfoDiv");
	var tokenForm = document.querySelector("#tokenForm");
	var tokenInput = document.querySelector("#tokenInput");
	var logoutButton = document.querySelector("#logoutButton");

	if (token == "") {
		inputFormDiv.style.display = 'block';
		logInfoDiv.style.display = 'none';

		tokenInput.focus();

	} else {
		inputFormDiv.style.display = 'none';
		logInfoDiv.style.display = 'block';
		document.querySelector("#logInfoName").innerHTML = "Hi there, " + token;
	}

	logoutButton.addEventListener("click", function(e) {
		self.port.emit("logout");
	});

	self.port.on('network-error', function(response) {
		document.querySelector('#warning').innerHTML = "ERROR " + response.status + ": " + response.statusText;
		document.querySelector('#warning').style.display = 'block';

	});

	tokenInput.onkeyup = function(event) {
		document.querySelector('#warning').style.display = 'none';
		if (event.keyCode == 13) {
			text = tokenInput.value.replace(/(\r\n|\n|\r)/gm,""); 
			self.port.emit("text-entered", text);
		}
	}

});