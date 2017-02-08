//WHAT YOU NEED TO DO is: 
// 1. make sure that you're accounting for the CURRENT CENTER when you resize the svg
// 2. select + transform the path? or just redraw? idk yet
app = function() {
  
  return {
    
    init : function() {

		if (typeof(Number.prototype.toRadians) === "undefined") {
			Number.prototype.toRadians = function() {
				return this * Math.PI / 180;
			}
		}

		if (typeof(Number.prototype.toDegrees) === "undefined") {
			Number.prototype.toDegrees = function() {
				return this * 180 / Math.PI;
			}
		}
		var arcLevel = 0;
		var geoCArr = [];
		//based on  http://www.movable-type.co.uk/scripts/latlong.html
		function MidPoint(start, finish, type = "push", arcLimit = 10){
			arcLevel += 1;
			var lat1 = start[0]
			var lon1 = start[1]
			var lat2 = finish[0]; 
			var lon2 = finish[1]
			//console.log(d3.geo.interpolate(thisCoord, thatCoord))
			var R = 6371e3; // meters
			var φ1 = lat1.toRadians();
			var φ2 = lat2.toRadians();
			var λ1 = lon1.toRadians();
			var λ2 = lon2.toRadians();
			var Δφ = (lat2-lat1).toRadians();
			var Δλ = (lon2-lon1).toRadians();
			var Bx = Math.cos(φ2) * Math.cos(λ2-λ1);
			var By = Math.cos(φ2) * Math.sin(λ2-λ1);
			var φ3 = Math.atan2(
				Math.sin(φ1) + Math.sin(φ2),
				Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By ) 
			);
			var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

			var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
							Math.cos(φ1) * Math.cos(φ2) *
							Math.sin(Δλ/2) * Math.sin(Δλ/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

			var d = R * c;
			if(arcLevel < arcLimit){
			 if(arcLevel > 1){
				if(type == "push"){
					geoCArr.push([φ3.toDegrees(), λ3.toDegrees()], finish) 
					MidPoint([φ3.toDegrees(), λ3.toDegrees()], finish, type = "push")
				} else {	
					geoCArr.unshift([φ3.toDegrees(), λ3.toDegrees()])
					MidPoint(start, [φ3.toDegrees(), λ3.toDegrees()], type = "unshift")
				}
				//				return([φ3.toDegrees(), λ3.toDegrees()])
			 } else {
				geoCArr.push([φ3.toDegrees(), λ3.toDegrees()])							 
//				console.log([start,finish])
				MidPoint([φ3.toDegrees(), λ3.toDegrees()], finish, type = "push")

				arcLevel = 1;
//				console.log([start,finish])
				MidPoint(start, [φ3.toDegrees(), λ3.toDegrees()], type = "unshift")
//				return([φ3.toDegrees(), λ3.toDegrees()])
			 }
			} //else {
//				return([φ3.toDegrees(), λ3.toDegrees()])							
//			}
		}

		
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
				minZoom:2,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd'
			});
			tiles.addTo(map);

			var t = d3.transition()
				.duration(350);


			var countries = [];
			var countriesOverlay = L.d3SvgOverlay(function(sel, proj) {
//				function drawCountries(d){
//					console.log(d);
//				}
				console.log(countries);
				var upd = sel.selectAll('path').data(countries);
				upd
				.style('z-index', '-1')
				.enter()
					.append('path')
						.attr('d', proj.pathFromGeojson)
						.attr('stroke', 'orange')
						.attr('stroke-opacity', '0.65')
						.attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
						.attr('fill-opacity', '0.5')
//					.on('click', function(d){drawCountries(d)})
					;
				upd.attr('stroke-width', function() {return(Math.random() * 20 / proj.scale)});
			});

//			var arcs = [];
			var iso_id = 	'';
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

/*
    // we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg 
    var svg = d3.select(map.getPanes().overlayPane).append("svg");

    // if you don't include the leaflet-zoom-hide when a 
    // user zooms in or out you will still see the phantom
    // original SVG 
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");
*/
var linePathGenerator = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");
		

			var arcsOverlay = L.d3SvgOverlay(function(sel, proj) {
				var upd = sel.selectAll('path')
					.data([arcs]);

				console.log([sel, proj, upd])
					upd
					.enter()
						.append('path')
							.attr('d', proj.pathFromGeojson)
							.attr('stroke', 'black')
							.attr('fill', 'none')
							.attr('class', 'arc')
						;
					upd.attr('stroke-width', 1 / proj.scale);
				});

				/*
//Still need to make it a d3SvgOverlay for the sake of projection	- at this stage (and maybe any stage) we're not using this or showArcs
			function addArcs(thisISO){
				var svg = d3.select("#map-canvas > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg:nth-child(3)")	
				var g = svg.append('g').attr("class", "d3-overlay").attr("id", "arcs" + thisISO)
				console.log(g);
				var addThis = L.d3SvgOverlay(function(sel, proj) {
					var upd = g.selectAll('path')
						.data([arcs]);
						
					upd
					.enter()
						.append('path')
							.attr('d', proj.pathFromGeojson)
	//							.transition(t)
							.attr('class', 'arc')
							.attr('stroke', 'black')
	//						.attr('fill', function(){ return d3.hsl(Math.random() * 360, 0.9, 0.5) })
	//						.attr('fill-opacity', '0.5')
	//						.on('click', function(d){drawCountries(d)})
						;
	//				}
	//					upd.transition(t).attr('stroke-width', 1 / proj.scale);
					upd.attr('stroke-width', 1 / proj.scale);
				});
				console.log(addThis);
			}

			function showArcs(thisISO){
				var svg = d3.select("#map-canvas > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg:nth-child(3)")	
				var g =	svg.select("#arcs" + thisISO)
				console.log(g)
				var showThis = L.d3SvgOverlay(function(sel, proj) {
					var upd =	g.selectAll("path");					
					upd.transition(t).attr('stroke-width', 1 / proj.scale)
				});
				console.log(showThis);
			}
*/			
			function whenClicked(e){
				console.log(e);
				selectedISO = e;

//				Hide old arcs				
			map.removeLayer(arcsOverlay);
// 		set id of new arcs (must be done after hiding
				iso_id = e.target.feature.properties[iso];			
				

				var imports = _.where(userdata, {imp: parseFloat(iso_id)});
				var exports = _.where(userdata, {exp: parseFloat(iso_id)});
				
				var sources = _.uniq(_.pluck(imports, 'exp'));
				var targets = _.uniq(_.pluck(exports, 'imp'));

				var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
				console.log(thisCoord)
				//arcs = {type: "MultiLineString", coordinates: []};
				arcs = {type: "FeatureCollection", "features": []};
				sources.forEach(function(d){
					var thisArc = _.find(world.features, function(feat){
						return feat.properties[iso] == d;
					})
					
					if (typeof thisArc != 'undefined') {
						var thatCoord = thisArc.geometry.coordinates[0][0][0];
						geoCArr = [];
						arcLevel = 0;
						//arcs.coordinates.push([thisCoord, thatCoord])
						MidPoint(thisCoord, thatCoord)
						
						arcs.features.push({
							"type" : "feature", 
							"geometry" : {
								"type" : "LineString", 
								"coordinates":	[thisCoord].concat(geoCArr).concat([thatCoord])
							}
						})
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

			
			L.control.layers({"Geo Tiles": tiles}, {"Countries": countriesOverlay, "Trade links": arcsOverlay}).addTo(map);

			countries = world.features; 
			countriesOverlay.addTo(map);			
			L.geoJSON(world, {onEachFeature: onEachFeature, opacity: 0, fillOpacity: 0}).addTo(map);
			arcsOverlay.addTo(map);			

			
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
