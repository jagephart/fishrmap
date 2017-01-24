
app = function() {
  
  return {
    
    init : function() {

		//Create map variable - this will give you a zoomable box starting zoomed into "setView( [Lat, Lng] = [38.977043, -76.503371], zoom level = 13)"
			var bounds = [[-85, -180],[85, 180]];
			var map = L.map('map-canvas', {    
				maxBounds: bounds // Sets bounds as max
			}).setView([0, 0], 3);
			
			
			var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
				maxZoom:19,
				minZoom:3,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd'
			}).addTo(map);

			var years = _.uniq(_.pluck(userdata, 'yrs')).sort();
			
//			console.log(years);
			var svg = d3.select(map.getPanes().overlayPane).append("svg"),
					g = svg.append("g").attr("class", "leaflet-zoom-hide");

/*
			var width = +svg.attr("width"),
			height = +svg.attr("height");
*/
			function projectPoint(x, y) {
				var point = map.latLngToLayerPoint(new L.LatLng(y, x));
				this.stream.point(point.x, point.y);
			}
			
			var projection = d3.geoTransform({point: projectPoint})
/*
			var projection = d3.geoEquirectangular()
			.scale(180)
			.rotate([160, 0])
//			.translate([width / 2, height / 2])
			.precision(.1);
*/

			var path = d3.geoPath()
					.projection(projection);
								
			var graticule = d3.geoGraticule();
			
			var svgBound = path.bounds(world),
				topLeft = [svgBound[0][0] + bounds[0][0], svgBound[0][1] + bounds[0][1]],
				bottomRight = [svgBound[1][0] + bounds[1][0], svgBound[1][1] + bounds[1][1]];
				
				svg .attr("width", bottomRight[0] - topLeft[0])
						.attr("height", bottomRight[1] - topLeft[1])
						.style("left", topLeft[0] + "px")
						.style("top", topLeft[1] + "px");

				g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


			
			function whenClicked(e) {
				// e = event
//				console.log(e.target.feature.properties);
//				console.log(e.target.feature);
				var iso_id = e.target.feature.properties[iso];
				
				var imports = _.where(userdata, {imp: parseFloat(iso_id)});
				var exports = _.where(userdata, {exp: parseFloat(iso_id)});
//				console.log({imps: imports, exps: exports})
				
				var sources = _.uniq(_.pluck(imports, 'exp'));
				var targets = _.uniq(_.pluck(exports, 'imp'));
//				console.log({src: sources, tgt: targets})
	
				var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
				
//				e.arcs = {type: "MultiLineString", coordinates = []};
				sources.forEach(function(d){
	//				console.log(d);
					var thisArc = _.find(world.features, function(feat){
						return feat.properties[iso] == d;
					})
					//console.log(thisArc);

					if (typeof thisArc != 'undefined') {
						var thatCoord = thisArc.geometry.coordinates[0][0][0];
						console.log([thisCoord,thatCoord]);
						//d.arc = 0;

						svg.append("path")
							.datum({type: "LineString", coordinates: [thisCoord, thatCoord]})
							.attr("class", "arc")
							.attr("d", path)
							.style("fill", "none")
							.style("stroke", "red")
							.style("stroke-width", "2px");
					}
							
				});
				// You can make your ajax call declaration here
				//$.ajax(... 
			}

			function onEachFeature(feature, layer) {
					//bind click
					layer.on({
							click: whenClicked
					});
			}
			//console.log(world);
			L.geoJSON(world, {onEachFeature: onEachFeature}).addTo(map);

			map.on("viewreset", update);
			update();

			function update() {
				//console.log(path.bounds([[-85, -180],[85, 180]]))
	
				svgBound = path.bounds(world);
				topLeft = [svgBound[0][0] + bounds[0][0], svgBound[0][1] + bounds[0][1]];
				bottomRight = [svgBound[1][0] + bounds[1][0], svgBound[1][1] + bounds[1][1]];
				
				svg .attr("width", bottomRight[0] - topLeft[0])
						.attr("height", bottomRight[1] - topLeft[1])
						.style("left", topLeft[0] + "px")
						.style("top", topLeft[1] + "px");

				g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

//			g.selectAll("path")
					
			}
			
//Junk drawer
/*
			var svg = d3.select(map.getPanes().overlayPane).append("svg"),
			g = svg.append("g").attr("class", "leaflet-zoom-hide");
			
			// code here
			var transform = d3.geoTransform({point: projectPoint}),
				path = d3.geoPath().projection(transform);

			var feature = g.selectAll("path")
				.data(world.features)
				.enter().append("path");		

		function reset() {
        
			bounds = path.bounds(world);

			var topLeft = bounds[0],
				bottomRight = bounds[1];

			svg.attr("width", bottomRight[0] - topLeft[0])
				.attr("height", bottomRight[1] - topLeft[1])
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");

			g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

			// initialize the path data	
			feature.attr("d", path)
				.style("fill-opacity", 0.5)
				.attr('fill','steelblue');
		} 

		map.on("viewreset", reset);

		reset();
		// Use Leaflet to implement a D3 geometric transformation.
		function projectPoint(x, y) {
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		}
*/			
				
		}		
	}
}();

$(function () { app.init(); });