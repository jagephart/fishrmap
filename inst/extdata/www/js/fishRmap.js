var testmeta = [];

 //WHAT YOU NEED TO DO is: 
// 1. make sure that you're accounting for the CURRENT CENTER when you resize the svg
// 2. select + transform the path? or just redraw? idk yet

//MUST UNSUPPRESS FOR DEPLOYMENT
/*
app = function() {
  
  return {
    
    init : function() {
*/


			var selJson;

			//Read user data
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
		d3.json('ajax/userdata.json', function(err, userdata) {

			//Read topojson
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/world.json', function(err, world) {
		d3.json('ajax/world.json', function(err, world) {
		
			//Read metadata dict with IDs for different types of identifier
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
		d3.json('ajax/worldmeta.json', function(err, meta) {
		console.log(meta)
		
		//Should remove this when you can 
		meta.forEach(function(m){testmeta.push(m)})
		
// Extend geojson to accomodate topojson--will be more efficient
//via http://blog.webkid.io/maps-with-leaflet-and-topojson/
L.TopoJSON = L.GeoJSON.extend({  
  addData: function(jsonData) {    
    if (jsonData.type === "Topology") {
      for (key in jsonData.objects) {
        geojson = topojson.feature(jsonData, jsonData.objects[key]);
//				console.log('Adding geojson feature');
//				console.log(geojson);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    }
    else {
//				console.log('Adding jsonData');
//				console.log(jsonData);
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
  }  
});
//			var worldL = new L.TopoJSON(world);
			
			
//More general conversion of a given TopoJSON to GeoJSON for arcs
          var convertTopojsonToGeojson = function(topojsonString) {
              try {
                  var parsedTopojson = topojsonString;
                  var geJSONobj = new GeoJSON();
                  //iterate over each key in the objects of the topojson
                  for (var col in parsedTopojson.objects) {
                      if (parsedTopojson.objects.hasOwnProperty(col)) {
                          var gJ = topojson.feature(parsedTopojson, parsedTopojson.objects[col]);
                          //merge with the existing GeoJSON Object
                          geJSONobj.merge(gJ);
                      }
                  }
                  //get the complete GeoJSON data
                  var geojson = geJSONobj.getData();
                  //Write it to the geojson text box
                  return geojson;
              } catch (error) {
//                  displayError('There was an unknown error converting your TopoJSON to GeoJSON. Sorry.');
                  console.log(error, error.message);
              }
          };

         //function for building GeoJSON:
          function GeoJSON() {
              var data;
              this.merge = function(input) {
                  if (this.data == null) {
                      this.data = input;
                      return;
                  }
                  //Data already exists, we need to look at the type
                  var type = this.data.type;
                  switch (type) {
                      case "FeatureCollection":
                          //Featurecollection already exists. We just need to add the Features from the input
                          // to the data's Features
                          this.data.features = this.data.features.concat(this.getFeatures(input));
                          break;
                      case "Feature":
                          // we need to create a new FeatureCollection & then concatenate the input
                          var ob = {
                              "type": "FeatureCollection",
                              "features": [this.data]
                          };
                          //now set the data to this new FeatureCollection
                          this.data = ob;
                          this.data.features = this.data.features.concat(this.getFeatures(input));
                          break;
                          //For the 7 types of Geometry objects, We need to make the FeatureCollection & then concatenate
                      case "Point":
                      case "MultiPoint":
                      case "LineString":
                      case "MultiLineString":
                      case "Polygon":
                      case "MultiPolygon":
                      case "GeometryCollection":
                          var ob = {
                              "type": "FeatureCollection",
                              "features": this.getFeatures(this.data)
                          };
                          this.data = ob;
                          this.data.features = this.data.features.concat(this.getFeatures(input));
                          break;
                      default:
                          //UnExpected data type
                          throw "UnExpected data type";
                  }
              };
              this.getFeatures = function(geoJSON) {
                  var type = geoJSON.type;
                  switch (type) {
                      case "FeatureCollection":
                          return geoJSON.features;
                      case "Feature":
                          return [geoJSON];
                          //For the 7 types of Geometry objects, just fall through to makeFeaturesArray object
                      case "Point":
                      case "MultiPoint":
                      case "LineString":
                      case "MultiLineString":
                      case "Polygon":
                      case "MultiPolygon":
                      case "GeometryCollection":
                          return this.makeFeaturesArray(geoJSON);
                      default:
                          //UnExpected Input; Return Empty Array
                          return [];
                  }
              };
              this.makeFeaturesArray = function(geom) {
                  var feature = {
                      "type": "Feature",
                      "geometry": geom //Note: There can't be properties.
                  };
                  return [feature];
              };
              this.getData = function() {
                  return this.data;
              };
          }					
					
			console.log(convertTopojsonToGeojson(world));
			var newworld = convertTopojsonToGeojson(world);

	
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


//			var countries = [];
			var countries = newworld.features; 

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
//				iso_id = e.target.feature.properties[iso];			
				iso_id = _.where(meta, {'id': parseFloat(e.target.feature.id)})[0];			
				
//				console.log(e.target);
//				console.log(iso_id);
//				console.log(userdata);
				console.log([e.target.feature.id, iso_id[iso],iso_id])

				var imports = _.where(userdata, {imp: parseFloat(iso_id[iso])});
				var exports = _.where(userdata, {exp: parseFloat(iso_id[iso])});
			
				//Pick up the imports of selected country
				var sources = _.uniq(_.pluck(imports, 'exp'));

				//Pick up the exports of selected country
				var targets = _.uniq(_.pluck(exports, 'imp'));

				var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
				console.log(thisCoord)
				//arcs = {type: "MultiLineString", coordinates: []};
				arcs = {type: "FeatureCollection", "features": []};
//				console.log(sources)
			
				sources.forEach(function(d){
					var thisID = _.filter(meta, function(m){return m[iso] == d})[0];
					if (typeof thisID != 'undefined') {
//					console.log([thisID,thisID.id]);
					var thisArc = _.find(newworld.features, function(feat){
//						console.log([feat.properties.id, thisID.id])
						return feat.id ==  thisID.id
					});
						if (typeof thisArc != 'undefined') {
							console.log(thisArc)
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
					} else {
						console.log('Source not found in geographic data: '+d)
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

			var worldUnderlay = new L.TopoJSON(world, {onEachFeature: onEachFeature, opacity: 0.5, fillOpacity: 0.5}).addTo(map);
			
			L.control.layers({"Geo Tiles": tiles}, {
				//	"Countries": countriesOverlay, 
					"Countries": worldUnderlay, 
					"Trade links": linesOverlay
				}).addTo(map);

//			countries = world.features; 
//			countriesOverlay.addTo(map);			
			worldUnderlay.addTo(map);
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
			});

//MUST UNSUPPRESS FOR DEPLOYMENT
/*
		}
	}
}();
$(function () { app.init(); });
*/