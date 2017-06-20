 //WHAT YOU NEED TO DO is: 
// 1. make sure that you're accounting for the CURRENT CENTER when you resize the svg
// 2. select + transform the path? or just redraw? idk yet
app = function() {
  
  return {
    
    init : function() {

			//Read user data
		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {

			//Read geoJSON
		d3.json('shared/fishRmap/ajax/world.geojson', function(err, world) {
	
// Extend geojson to accomodate topojson--will be more efficient
//via http://blog.webkid.io/maps-with-leaflet-and-topojson/
var baddies = [];
L.TopoJSON = L.GeoJSON.extend({  
  addData: function(jsonData) {    
    if (jsonData.type === "Topology") {
      for (key in jsonData.objects) {
        geojson = topojson.feature(jsonData, jsonData.objects[key]);
        var newjson = {type:geojson.type, features:[]}
        geojson.features.forEach(function(d){
					var locN = 'c'+d.id
					if(typeof msaTags[locN] != 'undefined'){
						if (locN.length == 6){newjson.features.push(d);} else {baddies.push(d.id)}
					}	else {
						if(typeof stateTags[locN] != 'undefined'){
							if (locN.length == 3 || locN.length == 2){newjson.features.push(d);} else {baddies.push(d.id)}
						} else {baddies.push(d.id)}
					}
        })
        L.GeoJSON.prototype.addData.call(this, newjson);
      }
    }    
    else {
 //     console.log(jsonData);
      if(baddies.indexOf(jsonData.id)==-1){
      	L.GeoJSON.prototype.addData.call(this, jsonData);
      }
    }
  }  
});

var topoLayer = new L.TopoJSON();


	
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

			var projection = d3.geoEquirectangular()
				.rotate([0, 0, 89])
//				.translate([width / 2, height / 2])
				.scale(85)
				.precision(0);

			var path = d3.geoPath()
				.projection(projection);

			var graticule = d3.geoGraticule();		

			var linesOverlay = L.d3SvgOverlay(function(sel, proj) {
				var upd = sel.selectAll('path').data(selJson.features);
//				var upd = sel.data(sArr);
				//console.log([upd, proj, mArr]);
				
				upd
				.enter()
					.append('path')
						.attr('id', function(d){console.log(d);  return 'c'+d.properties.s.data[0].egeoloc+'to'+d.properties.s.state})
						.attr('d', function(d){
							//console.log(proj.pathFromGeojson(d))
							return proj.pathFromGeojson(d)})
//						.attr('d', d3.geoPath())
						.attr('stroke', 'black')
						.attr('class', 'travelLine')
							.attr('stroke-opacity', '0.65')
/* This is actually kind of a neat effect, but we'll drop it for now
						.attr('fill', '#88adea')
						.attr('fill-opacity', '0.35')
*/
						.attr('fill-opacity', '0')
						.attr('stroke-width', function(d) {
//					console.log(d); 
					return 3*d.properties.stroke / proj.scale 
				})
					;
					
					
				upd.enter().append('circle')						
				.attr('id', function(d){console.log(d);  return 'marker'+d.properties.s.data[0].egeoloc+'to'+d.properties.s.state})
				.attr("r", 7 / proj.scale)
				.attr("transform", function(d){
					console.log(proj)
					console.log(proj.stream)
					var point = proj.latLngToLayerPoint([d.properties.s.source[1], d.properties.s.source[0]])
//					var point = proj.latLngToLayerPoint(d.geometry.coordinates[0])
//					var point = proj.pathFromGeojson(d).split('L')[0].split('M')[1].split(',')
					console.log(point)
//					console.log(d3.geoTransform().stream.point(parseFloat(point.x),parseFloat(point.y)))
					return 'translate('+ point.x + ',' + point.y +')'
					//return 'translate('+ (point.x / (10*proj.scale)) +',' + (point.y / (100*proj.scale)) +')'

				})

				//transition(upd);

/*				upd.attr('stroke-width', function(d) {
					console.log(d); 
					return d.properties.stroke / proj.scale 
				});
*/
//				upd.attr('stroke-width', function() {return(Math.random() * 20 / proj.scale)});
			});


			function whenClicked(e){
					selJson = {"type": "FeatureCollection","features": []}
			console.log(e);
				selectedISO = e;

//				Hide old arcs				
			map.removeLayer(linesOverlay);
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
				linesOverlay.addTo(map);			
			}
			
			function onEachFeature(feature, layer) {
				//bind click
				layer.on({
						click: whenClicked
				});
			}

			
			L.control.layers({"Geo Tiles": tiles}, {"Countries": countriesOverlay, "Trade links": linesOverlay}).addTo(map);

			countries = world.features; 
			countriesOverlay.addTo(map);			
			L.geoJSON(world, {onEachFeature: onEachFeature, opacity: 0, fillOpacity: 0}).addTo(map);
			linesOverlay.addTo(map);		

						//Now we add the animation
						
						var paths = d3.selectAll('.travelLine').each(function(ln){
							var pathid = "#c"+ln.properties.s.data[0].egeoloc+'to'+ln.properties.s.state;
							var mrkrid = "#marker"+ln.properties.s.data[0].egeoloc+'to'+ln.properties.s.state;
							console.log(pathid)
						//console.log(paths)
					  var path = d3.select(pathid);
						
 					  var startPoint = pathStartPoint(path);
					  
					  console.log(startPoint)
					  
					  var marker = d3.select(mrkrid);
					  marker.attr("r", function(d){
					  	console.log(d)
					  	return 1+3*d.properties.stroke
					  	})
					    .attr("transform", "translate(" + startPoint[0] + ")");
					
					  ptransition();

					  //Get path start point for placing marker
					  function pathStartPoint(path) {
							console.log(path)
					    var d = path.attr("d"),
					    dsplitted = d.split("M");
					    return dsplitted[1].split(",");
					  }
					
					  function ctransition() {
					    marker.transition()
					        .duration(3500)
					        .attrTween("transform", translateAlong(path.node()))
					        .on("end", ctransition);// infinite loop
					  }

					  function translateAlong(path) {
					    var l = path.getTotalLength();
					    return function(i) {
					      return function(t) {
					        var p = path.getPointAtLength(t * l);
					        return "translate(" + p.x + "," + p.y + ")";//Move marker
					      }
					    }
					  }
										  
					  function ptransition() {
					    path.transition()
					        .duration(3500)
					        .attrTween("stroke-dasharray", tweenDash)
					        .on("end", ptransition); // infinite loop
					  }
					
					  function tweenDash() {
					    var l = path.node().getTotalLength();
					    var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
					    return function(t) {
//					      var marker = d3.select("#marker");
					      var p = path.node().getPointAtLength(t * l);
					      marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
					      return i(t);
					    }
					  }

					});//transition(d)})					
				
				});			
			});
		}
	}
}();

$(function () { app.init(); });
