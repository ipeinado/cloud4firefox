const widget = require("sdk/widget");
const self = require("sdk/self");
const panel = require("sdk/panel");
const ss = require("sdk/simple-storage");
const simplePrefs = require("sdk/simple-prefs");
const Request = require('sdk/request').Request;
const notifications = require("sdk/notifications");
const pageMod = require('sdk/page-mod');
const tabs = require('sdk/tabs');

var magnificationPageMod,
	backgroundColorPageMod,
	foregroundColorPageMod,
	fontSizePageMod,
	simplifierPageMod;

var cloud4allPopUp = panel.Panel({
  width: 400,
  contentURL: self.data.url("html/popup.html"),
  contentScriptFile: self.data.url('js/popup.js')
});

var cloud4allWidget = widget.Widget({
	id: "cloud4allWidget",
	label: "Click here to open Cloud4all",
	contentURL: self.data.url("images/logocloud_32.png"),
	panel: cloud4allPopUp
});

cloud4allPopUp.on("show", function() {
	cloud4allPopUp.port.emit("show", simplePrefs.prefs.token);
});

cloud4allPopUp.port.on("text-entered", function(text) {

	var preferencesRequest = Request({
		url: "http://preferences.gpii.net/user/" + text,
		onComplete: function(response) {
			if (response.status == 200) {
				console.log("TOKEN REQUEST. Response status: " + response.status);
				cloud4allPopUp.hide();
				notifications.notify({
					title: "Hi there " + text,
					text: "You are now logged in Cloud4all. If you want to key out, press the icon on the widget area",
					iconURL: self.data.url("images/logocloud_32.png")
				});
				console.log(response.json);
				storePreferences(response.json);

			} else {
				cloud4allPopUp.port.emit("network-error", {status: response.status, statusText: response.statusText});
			}
		}
	});	

	preferencesRequest.get();
});

cloud4allPopUp.port.on("logout", function() {
	simplePrefs.prefs.token = "";
	simplePrefs.prefs.fontSize = "M";
	simplePrefs.prefs.magnification = 1;
	simplePrefs.prefs.backgroundColor = "#FFFFFF";
	simplePrefs.prefs.foregroundColor = "#000000";
	simplePrefs.prefs.simplifier = false;
	simplePrefs.prefs.invertColours = false;
	token = "";
	cloud4allPopUp.hide();
	notifications.notify({
		title: "You have keyed out from Cloud4all",
		text: "You are now logged out of Cloud4all. Remember Cloud4all is available for many other platforms and applications!",
		iconURL: self.data.url("images/logocloud_32.png")
	});
});

function storePreferences(preferencesJson) {
	var prefix = "http://registry.gpii.org/common/";
	var preferences = preferencesJson["preferences"];
	 
	simplePrefs.prefs.token = preferencesJson["token"];


	if (preferences.hasOwnProperty(prefix + "fontSize")) {
		console.log(
			"FONT SIZE: " +
			preferences[prefix + "fontSize"][0]["value"]
		);

		if ((preferences[prefix + "fontSize"][0]["value"]) < 14) {
			simplePrefs.prefs.fontSize = "M";	
		} else if ((preferences[prefix + "fontSize"][0]["value"]) < 24) {
			simplePrefs.prefs.fontSize = "L";
		} else {
			simplePrefs.prefs.fontSize = "XL";
		}
	}

	if (preferences.hasOwnProperty(prefix + "magnification")) {
		console.log(
			"MAGNIFICATION: " +
			preferences[prefix + "magnification"][0]["value"]
		);
		simplePrefs.prefs.magnification = preferences[prefix + "magnification"][0]["value"];
	}
	
	if (preferences.hasOwnProperty(prefix + "backgroundColor")) {
		console.log(
			"BACKGROUND COLOR: " +
			preferences[prefix + "backgroundColor"][0]["value"]
		);
		simplePrefs.prefs.backgroundColor = preferences[prefix + "backgroundColor"][0]["value"];
	}

	if (preferences.hasOwnProperty(prefix + "foregroundColor")) {
		console.log(
			"FOREGROUND COLOR: " +
			preferences[prefix + "foregroundColor"][0]["value"]
		);
		simplePrefs.prefs.foregroundColor = preferences[prefix + "foregroundColor"][0]["value"];
	}

	if (preferences.hasOwnProperty(prefix + "invertColours")) {
		console.log(
			"INVERT COLORS: " +
			preferences[prefix + "invertColours"][0]["value"]
		);
		simplePrefs.prefs.invertColours = preferences[prefix + "invertColours"][0]["value"];

	}
	
}

simplePrefs.on("invertColours", onInvertColoursChange);
simplePrefs.on("magnification", onMagnificationChange);
simplePrefs.on("fontSize", onFontSizeChange);
simplePrefs.on("backgroundColor", onBackgroundColorChange);
simplePrefs.on("foregroundColor", onForegroundColorChange);
simplePrefs.on("simplifier", onSimplifierChange);

function onInvertColoursChange() {
	if (simplePrefs.prefs) {
		console.log("Invert Colours set to true");
	} else {
		console.log("Invert Colours set to false");
	}
}

function onMagnificationChange() {
	var magnificationPageMod = pageMod.PageMod({
		include: "*",
		contentStyle: "body { -moz-transform: scale(" + simplePrefs.prefs.magnification + "); -moz-transform-origin: 0 0;",
		attachTo: ["existing", "top", "frame"]
	});

}

function onFontSizeChange() {
	console.log("Font size set to " + simplePrefs.prefs.fontSize);
}

function onBackgroundColorChange() {
	backgroundColorPageMod = pageMod.PageMod({
		include: "*",
		contentStyle: ["html, body, div, ul, table, tr, td {background: "+ simplePrefs.prefs.backgroundColor + "} "],
		attachTo: ["existing", "top", "frame"]
	});
}

function onForegroundColorChange() {
	foregroundColorPageMod = pageMod.PageMod({
		include: "*",
		contentStyle: ["html, body, p, h1, h2, h3, h4, li {color: "+ simplePrefs.prefs.foregroundColor+"}"],
		attachTo: ["existing", "top", "frame"]
	})
	console.log("Foreground color set to " + simplePrefs.prefs.foregroundColor);
}

function onSimplifierChange() {
	console.log("Simplifier set to " + simplePrefs.prefs.simplifier);
}