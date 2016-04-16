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
	this.center_marker = null;
	this.info_control = null;
	this.car_is_stopped = true;
}

/**
 * Init app.
 */
OpenTrackerApp.prototype.init = function() {

	window.onload = function() {
		// TODO
	}.bind(this);

	this.initMap();

	this.initInfoControl();

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
		        var marker = L.marker(latlng, {
		            'icon': L.icon({
		                iconUrl: "/static/images/car_R.png",
		                shadowUrl: "",
		                iconSize:     [32, 32],
		                shadowSize:   [0, 0],
		                iconAnchor:   [16, 16],
		                shadowAnchor: [0, 0],
		                popupAnchor:  [0, 0],
		                className: "iconCar"
		            })
		        });
		        if (latlng.equals(this.last_position))
		        {
		        	this.car_is_stopped = true;
		        }
		        else
		        {
		        	this.car_is_stopped = false;
		        }
		    	if(latlng.lng-this.last_position.lng <0)
		    	{
			        $(".iconCar").attr("src","/static/images/car_L.png");
		    	}
		    	else
		    	{
		    		$(".iconCar").attr("src","/static/images/car_R.png");
		    	}
		    	this.last_position = latlng;
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
	            	this.showCenterMarker(true);
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

	this.map.on("move", this.onMapMove.bind(this));

};

OpenTrackerApp.prototype.showCenterMarker = function(visibility) {
	if(visibility)
	{
		this.center_marker = L.marker(this.map.getCenter());
		this.center_marker.addTo(this.map);
	}
	else
	{
		if(this.center_marker !== null)
		{
			this.map.removeLayer(this.center_marker);
			this.center_marker = null;
		}
	}
};

OpenTrackerApp.prototype.initInfoControl = function() {
	this.info_control = L.control();

	this.info_control.onAdd = function (map) {
	    this.info_control._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.updateInfoControl("Rennes","Rue du clos cortel");
	    return this.info_control._div;
	}.bind(this);

	this.info_control.addTo(this.map);
};

OpenTrackerApp.prototype.updateInfoControl = function(city,road) {
	    this.info_control._div.innerHTML = '<h4>' + city + '</h4>' + road;
}

OpenTrackerApp.prototype.onMapMove = function() {
	if(!this.autocenter)
	{
		this.center_marker.setLatLng(this.map.getCenter());
	}
};

OpenTrackerApp.prototype.updatePosition = function() {
	if(this.autocenter)
	{
		this.map.fitBounds(this.realtime.getBounds(), {maxZoom: this.map.DEFAULT_ZOOM});	
		this.getAddress();
	}
};

OpenTrackerApp.prototype.getAddress = function(lat, lng) {
	if (!this.car_is_stopped) {
		$.getJSON("https://photon.komoot.de/reverse?lon=" + this.last_position.lng + "&lat=" + this.last_position.lat,
			function(data) {
				var road = "";
				var city = "";
				if (_.isObject(data) &&
					_.isObject(data.features) &&
					_.isObject(data.features[0]) &&
					_.isObject(data.features[0].properties)) {
					var p = data.features[0].properties;
					
					if (!_.isUndefined(p.city)) {
						city = p.city;
					}
					if (!_.isUndefined(p.name)) {
						road = p.name;
					}
					this.updateInfoControl(city,road);
				}
			}.bind(this));
	}
};
