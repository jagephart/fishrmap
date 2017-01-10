
app = function() {
  
  return {
    
    init : function() {
/*
			d3.select('#container-fluid')
				.style('width', '100%')
				.style('height', '100%');
			.append('div')
				.attr('id','mapid')
				.style('width', '100%')
				.style('height', '100%');
*/			
			//Create map variable - this will give you a zoomable box starting zoomed into "setView( [Lat, Lng] = [38.977043, -76.503371], zoom level = 13)"
			var map = L.map('map-canvas').setView([0, 0], 2);
			

			var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				maxZoom:19,
				minZoom:2,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd'
			}).addTo(map);

			var svg = d3.select(map.getPanes().overlayPane).append("svg"),
			g = svg.append("g").attr("class", "leaflet-zoom-hide");


		}		
	}
}();

$(function () { app.init(); });