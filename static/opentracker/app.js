"use strict";

/**
 * Application Main app.
 * 
 * @constructor
 */
function OpenTrackerApp() {

	this.map = null;
	this.position = null;
	this.carmarker = null;
}

/**
 * Init app.
 */
OpenTrackerApp.prototype.init = function() {

	window.onload = function() {
		this.start();
	}.bind(this);

	this.initMap();
}

OpenTrackerApp.prototype.initMap = function() {

	var southWest = L.latLng(47.9690, -1.95019);
	var northEast = L.latLng(48.30274, -1.4649);
	var maxBounds = L.latLngBounds(southWest, northEast);

	this.map = L.map("map", {
		attributionControl: false,
		maxBounds: maxBounds,
		minZoom: 12,
		zoomControl: true 
	});

	this.map.DEFAULT_DISTANCE_RESOLUTION = 1;
	this.map.DEFAULT_POSITION = L.latLng(48.1178, -1.67036);
	this.map.DEFAULT_ZOOM = 17;

	// Ajout des tuiles
	var tiles_layer = L.tileLayer("http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
		maxZoom: 19,
		bounds: maxBounds,
		opacity: 0.75
	}).addTo(this.map);

	tiles_layer.once("loading", function() {
		this.addWaitCenterSpinner();
	}.bind(this));
	tiles_layer.once("load", function() {
		this.removeWaitCenterSpinner();
	}.bind(this));

	// Spinner d'attente de chargement des données
	this.waitSpinner = L.control();
	this.waitSpinner.onAdd = function() {
		this._div = L.DomUtil.create("div", "wait");
		this.update();
		return this._div;
	};
	this.waitSpinner.update = function() {
		this._div.innerHTML = "<div data-role='preloader' data-type='ring' data-style='dark'></div>";
	};

	this.carmarker = L.marker(this.map.DEFAULT_POSITION).addTo(this.map);

	// Ajout des mentions légals
	var legal = L.control.attribution({
		prefix: "<div id='legal_attribution'>&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a>"
	}).addAttribution("<a href='http://www.orange.com/fr/Innovation'>Orange Labs</a></div>");
	legal.setPosition("bottomright");
	legal.addTo(this.map);
};

OpenTrackerApp.prototype.start = function() {

	this.getPositionLoop();
	this.moveMapTo(this.map.DEFAULT_POSITION, this.map.DEFAULT_ZOOM);
};

OpenTrackerApp.prototype.isMapHere = function(latlng, zoom) {
	var res = false;
	try {
		res = this.map.getCenter().distanceTo(latlng) < this.map.DEFAULT_DISTANCE_RESOLUTION && this.map.getZoom() === zoom;
	} catch (e) {}
	return res;
};

OpenTrackerApp.prototype.moveMapTo = function(latlng, zoom, onFinish) {
	if (typeof onFinish === "undefined") {
		onFinish = function() {};
	}
	
	this.carmarker.setLatLng(latlng);

	if (!this.isMapHere(latlng, zoom)) {
		this.map.once("moveend", function() {
			onFinish();
		});
		this.map.setView(latlng, zoom);
	} else {
		onFinish();
	}
};

OpenTrackerApp.prototype.addWaitCenterSpinner = function() {

	if (this.waitSpinner !== null && !this.waitSpinnerDisplayed) {
		this.waitSpinner.addTo(this.map);
		this.waitSpinnerDisplayed = true;
		this.waitSpinner.setPosition("topright");
		var spinner_size_px = 52;

		var padding_right = Math.round(Number($(window).width() / 2 - spinner_size_px / 2));
		var padding_top = Math.round(Number($(window).height() / 2 - spinner_size_px / 2 ));

		$("div.wait").css("padding-top", padding_top);
		$("div.wait").css("padding-right", padding_right);
	}
};

OpenTrackerApp.prototype.removeWaitCenterSpinner = function() {
	if (this.waitSpinner !== null && this.waitSpinnerDisplayed) {
		this.waitSpinner.removeFrom(this.map);
		this.waitSpinnerDisplayed = false;
	}
};

OpenTrackerApp.prototype.getPosition = function() {
	var request = pegasus("/getPos");
	request.then(function(pos) {
		this.localisation = L.latLng(pos.lat,pos.lng);
		this.moveMapTo(this.localisation,this.map.getZoom());
		}.bind(this));
}

OpenTrackerApp.prototype.getPositionLoop = function() {
    setTimeout(function () {
    	this.getPosition();
        this.getPositionLoop();
    }.bind(this), 1000);
}