"use strict";

/**
 * Application Main app.
 * 
 * @constructor
 */
function OpenTrackerApp() {

	this.map = null;
	this.autocenter = true;
	this.last_position = null;
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
	this.last_position = maxBounds.getCenter();

	this.map = L.map("map", {
		attributionControl: false,
		maxBounds: maxBounds,
		minZoom: 12,
		zoomControl: true 
	});

	this.map.DEFAULT_DISTANCE_RESOLUTION = 1;
	this.map.DEFAULT_POSITION = L.latLng(48.1178, -1.67036);
	this.map.DEFAULT_ZOOM = 17;

	this.realtime = L.realtime({
	        url: '/getPos',
	        crossOrigin: false,
	        type: 'json'
	    }, {
	        interval: 1000,
		    pointToLayer: function (feature, latlng) {
		    	console.log(latlng.lng-this.last_position.lng);
		    	this.last_position = latlng;
		        var marker = L.marker(latlng, {
		            'icon': L.icon({
		                iconUrl: "/static/images/car.png",
		                shadowUrl: "",
		                iconSize:     [32, 32],
		                shadowSize:   [0, 0],
		                iconAnchor:   [16, 16],
		                shadowAnchor: [0, 0],
		                popupAnchor:  [0, 0]
		            })
		        });
		        return marker;
		    }.bind(this)
	    }
     );

	this.realtime.on('update', function() {
		this.updatePosition();
	}.bind(this));

	this.realtime.addTo(this.map);

	var tiles_layer = L.tileLayer("http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
		maxZoom: 19,
		bounds: maxBounds,
		opacity: 0.75
	}).addTo(this.map);

	var legal = L.control.attribution({
		prefix: "<div id='legal_attribution'>&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a>"
	}).addAttribution("<a href='http://www.orange.com/fr/Innovation'>Orange Labs</a></div>");
	legal.setPosition("bottomright");
	legal.addTo(this.map);

	var stateChangingButton = L.easyButton({
	    states: [{
	            stateName: 'autocenter-activated',   // name the state
	            icon:      'fa-dot-circle-o',          // and define its properties
	            title:     'stop auto center', // like its title
	            onClick: function(btn, map) {  // and its callback
	            	this.autocenter = false;
	                btn.state('autocenter-disactivated'); // change state on click!
	            }.bind(this)
	        }, {
	            stateName: 'autocenter-disactivated',
	            icon:      'fa-circle-o',
	            title:     'start autocenter',
	            onClick: function(btn, map) {
	            	this.autocenter = true;
	                btn.state('autocenter-activated');
	            }.bind(this)
	    }]
	});

	stateChangingButton.addTo(this.map);


};

OpenTrackerApp.prototype.start = function() {



};

OpenTrackerApp.prototype.updatePosition = function() {
	if(this.autocenter)
	{
		this.map.fitBounds(this.realtime.getBounds(), {maxZoom: this.map.DEFAULT_ZOOM});	
	}
};


