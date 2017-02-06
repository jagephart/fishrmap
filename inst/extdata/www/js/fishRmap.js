//WHAT YOU NEED TO DO is: 
// 1. make sure that you're accounting for the CURRENT CENTER when you resize the svg
// 2. select + transform the path? or just redraw? idk yet
app = function() {
  
  return {
    
    init : function() {
			//empty string to be populated later
			var selectedISO;

			//Create map variable - this will give you a zoomable box starting zoomed into "setView( [Lat, Lng] = [38.977043, -76.503371], zoom level = 13)"
			var initBounds = [[-85, -180],[85, 180]];
					initTopLeft = initBounds[0],
					initBottomRight = initBounds[1];

			var map = L.map('map-canvas', {    
				maxBounds: initBounds // Sets bounds as max
			}).setView([0, 0], 3);
			
			var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				maxZoom:19,
				minZoom:3,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd'
			});
			tiles.addTo(map);

			var countries = [];
			var countriesOverlay = L.d3SvgOverlay(function(sel, proj) {
//				function drawCountries(d){
//					console.log(d);
//				}
				var upd = sel.selectAll('path').data(countries);
				upd
				.style('z-index', '-1')
				.enter()
					.append('path')
					.attr('d', proj.pathFromGeojson)
					.attr('stroke', 'black')
					.attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
					.attr('fill-opacity', '0.5')
//					.on('click', function(d){drawCountries(d)})
					;
				upd.attr('stroke-width', 1 / proj.scale);
			});

//			var arcs = [];
			var arcs = {};

			var projection = d3.geo.equirectangular()
				.rotate([0, 0, 89])
//				.translate([width / 2, height / 2])
				.scale(85)
				.precision(0);

			var path = d3.geo.path()
				.projection(projection);

			var graticule = d3.geo.graticule();

//			var arcs = {type: "MultiLineString", coordinates: []};

			var arcsOverlay = L.d3SvgOverlay(function(sel, proj) {

//				d3.select("#arcSVG").remove();				
					d3.select("#map-canvas > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg:nth-child(3) > g")
						.selectAll("path")
						.remove();				
				
				var upd = sel.selectAll('path')
					.data([arcs]);

				console.log([sel, proj, upd])

				upd
//				.style('z-index', '-1')
				.enter()
					.append('path')
//						.attr('id', 'arcG')
						.attr('d', proj.pathFromGeojson)
						.attr('stroke', 'black')
//						.attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
//						.attr('fill-opacity', '0.5')
//						.on('click', function(d){drawCountries(d)})
					;
				upd.attr('stroke-width', 1 / proj.scale);
			});


			function whenClicked(e){
				console.log(e);
				selectedISO = e;

				var iso_id = e.target.feature.properties[iso];
				var imports = _.where(userdata, {imp: parseFloat(iso_id)});
				var exports = _.where(userdata, {exp: parseFloat(iso_id)});
				
				var sources = _.uniq(_.pluck(imports, 'exp'));
				var targets = _.uniq(_.pluck(exports, 'imp'));

				var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
				console.log(thisCoord)
				arcs = {type: "MultiLineString", coordinates: []};
				sources.forEach(function(d){
	//				console.log(d);
					var thisArc = _.find(world.features, function(feat){
						return feat.properties[iso] == d;
					})
					//console.log(thisArc);
					
					if (typeof thisArc != 'undefined') {
						var thatCoord = thisArc.geometry.coordinates[0][0][0];
						arcs.coordinates.push([thisCoord, thatCoord])
					}
				})
				console.log(arcs)
				arcsOverlay.addTo(map);			
			}
			
			function onEachFeature(feature, layer) {
				//bind click
				layer.on({
						click: whenClicked
				});
			}

			
			L.control.layers({"Geo Tiles": tiles}, {"Countries": countriesOverlay}).addTo(map);

			countries = world.features; countriesOverlay.addTo(map);			

			L.geoJSON(world, {onEachFeature: onEachFeature, opacity: 0, fillOpacity: 0}).addTo(map);
/*
			var years = _.uniq(_.pluck(userdata, 'yrs')).sort();
	
			var svg = d3.select(map.getPanes().overlayPane).append("svg"),
				g = svg.append("g").attr("class", "leaflet-zoom-hide");

			var transform = d3.geoTransform({
				point: projectPoint
			});
			var d3path = d3.geoPath().projection(transform);

			var toLine = d3.line()
//			.interpolate("arc")
			.x(function(d) {
					return applyLatLngToLayer(d).x
			})
			.y(function(d) {
					return applyLatLngToLayer(d).y
			});

			function applyLatLngToLayer(d) {
				var y = d.geometry.coordinates[1]
				var x = d.geometry.coordinates[0]
				return map.latLngToLayerPoint(new L.LatLng(y, x))
			}
			
			function projectPoint(x, y) {
				var point = map.latLngToLayerPoint(new L.LatLng(y, x));
				this.stream.point(point.x, point.y);
			}

//			var featuresdata = []
			// here is the line between points
			var linePath = g.selectAll(".lineConnect")
 
 
		function whenClicked(e) {
			selectedISO = e;

			var iso_id = e.target.feature.properties[iso];
			var imports = _.where(userdata, {imp: parseFloat(iso_id)});
			var exports = _.where(userdata, {exp: parseFloat(iso_id)});
			
			var sources = _.uniq(_.pluck(imports, 'exp'));
			var targets = _.uniq(_.pluck(exports, 'imp'));

			var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
			console.log(thisCoord)
			var arcs = {type: "MultiLineString", coordinates: []};
			sources.forEach(function(d){
//				console.log(d);
				var thisArc = _.find(world.features, function(feat){
					return feat.properties[iso] == d;
				})
				//console.log(thisArc);

				if (typeof thisArc != 'undefined') {
					var thatCoord = thisArc.geometry.coordinates[0][0][0];
					arcs.coordinates.push([thisCoord, thatCoord])
				}
			});
		//	L.control.layers({"Geo Tiles": tiles}, {"MultiLineString": arcsOverlay}).addTo(map);
			
		map.on("viewreset", reset);

		// this puts stuff on the map! 
		reset();

		function reset() {
				var bounds = d3path.bounds(collection),
						topLeft = bounds[0],
						bottomRight = bounds[1];


				begend.attr("transform",
						function(d) {
								return "translate(" +
										applyLatLngToLayer(d).x + "," +
										applyLatLngToLayer(d).y + ")";
						});

				//...do same thing to text, ptFeatures and marker...
				
				svg.attr("width", bottomRight[0] - topLeft[0] + 120)
						.attr("height", bottomRight[1] - topLeft[1] + 120)
						.style("left", topLeft[0] - 50 + "px")
						.style("top", topLeft[1] - 50 + "px");


				linePath
					.data(arcs)
					.enter()
					.append("path")
					.attr("class", "lineConnect");

//					.attr("d", toLine)
				g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
				
			} // end reset

		
		}
		
		
			function onEachFeature(feature, layer) {
					//bind click
					layer.on({
							click: whenClicked
					});
			}
			//console.log(world);
			
			L.geoJSON(world, {onEachFeature: onEachFeature}).addTo(map);
*/	

		}
	}
}();

$(function () { app.init(); });
