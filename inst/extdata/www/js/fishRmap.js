var testmeta = [];
//TODO: Add slide-in dashboard, figure out why all paths come from a single point for some countries (e.g., brazil) but not others (e.g., bolivia)
//MUST UNSUPPRESS FOR DEPLOYMENT
/*
app = function() {
  
  return {
    
    init : function() {
*/


			var selJson;
			
			var userdata = [];

			//Read user data
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
	function getUserdata(){
		d3.json('shared/fishRmap/ajax/userdata.json', function(err, data) {
			data.forEach(function(d){
				userdata.push(d)				
			})
		})
	}
	//do this asynchronously -- we won't need until click event
	getUserdata();
	
			//Read topojson
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/world.json', function(err, world) {
		d3.json('shared/fishRmap/ajax/world.json', function(err, world) {
		
			//Read metadata dict with IDs for different types of identifier
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
		d3.json('shared/fishRmap/ajax/worldmeta.json', function(err, meta) {
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
				console.log(arcs);
				if (arcs != {}){
				var upd = sel.selectAll('path').data(arcs.features);
//				var upd = sel.data(sArr);
				//console.log([upd, proj, mArr]);
				
				upd
				.enter()
					.append('path')
						.attr('id', function(d){return 'c'+d.properties.s})
						.attr('d', function(d){
							return proj.pathFromGeojson(d)})
//						.attr('d', d3.geoPath())
						.attr('stroke', 'black')
						.attr('class', 'travelLine')
							.attr('stroke-opacity', '0.65')
// This is actually kind of a neat effect, but we'll drop it for now
//						.attr('fill', '#88adea')
//						.attr('fill-opacity', '0.35')
						.attr('fill-opacity', '0')
						.attr('stroke-width', function(d) {
//					console.log(d); 
					return d.properties.stroke / proj.scale 
				})
					;
					
					
				upd.enter().append('circle')						
				.attr('id', function(d){return 'marker'+d.properties.s})
				.attr("r", 7 / proj.scale)
				.attr("transform", function(d){
					var point = proj.latLngToLayerPoint(d.geometry.coordinates[0])
//					var point = proj.latLngToLayerPoint(d.geometry.coordinates[0])
//					var point = proj.pathFromGeojson(d).split('L')[0].split('M')[1].split(',')
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
				}
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
				
				var thisBorder = _.flatten(e.target.feature.geometry.coordinates, true)

//				var thisCoord = e.target.feature.geometry.coordinates[0][0][0];
//				console.log(e.target.feature.geometry.coordinates)
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
//							console.log(thisArc)
							
							//TODO: Handler for multi-landmass countries; right now it just looks at the first multipolygon
								var thatBorder = _.flatten(thisArc.geometry.coordinates,true);
//								var thatCoord = thisArc.geometry.coordinates[0][0][0];
								
								//Just use the funtion we made...
								var A_to_B = BorderToCenter(thisBorder, thatBorder)
								
								var thisCoord = A_to_B.source
								var thatCoord = A_to_B.target
								
//								console.log([thisBorder, thisCoord, thatBorder, thatCoord])
								geoCArr = [];
								arcLevel = 0;
								//arcs.coordinates.push([thisCoord, thatCoord])

								//here's where we do our geographic projection
    						var width = 960,
							    height = 480;

    						var projection = d3.geoEquirectangular()
								    .scale(153)
								    .rotate([160, 0])
								    .translate([width / 2, height / 2])
								    .precision(.1);
								
								var path = d3.geoPath()
								    .projection(projection);
								
								var graticule = d3.geoGraticule();

    						var pathStr = path({type: "LineString", coordinates: [ thisCoord, thatCoord ]})
    						
    						var strArr = pathStr.split('L')
    						
    						strArr[0] = strArr[0].replace('M', '')

//    						console.log(strArr)
								
								var coordArc = []
								
								strArr.forEach(function(c){
									var iC = projection.invert(c.split(','))
									iC = (isNaN(iC[0]) | isNaN(iC[1])) ? 
										coordArc[(coordArc.length-1)] : 
										iC
									coordArc.push(iC)
								})
								
//								console.log(coordArc)
    						
							//try {console.log(d3.geoPath()(s.source, s.target))} catch(err) {console.log(err)}
							//var line = d3.geoInterpolate([s.source[1], s.source[0]], [s.target[1], s.target[0]])
							  var sfeature =  { "type": "Feature", "geometry": 
							  	{ "type": "LineString",
//							    "coordinates": [ s.source, s.target ]
							    "coordinates": coordArc
    							}, 
    						"properties":{"stroke":1, "s":iso_id[iso]+'to'+thisID.id}
    						}

    						arcs.features.push(sfeature)
    						
/*								
								arcs.features.push({
									"type" : "feature", 
									"geometry" : {
										"type" : "LineString", 
										"coordinates":	[thisCoord, thatCoord]
									}
								})
								
*/

						}
					} else {
						console.log('Source not found in geographic data: '+d)
					}
				})
				
//				console.log(arcs)				
				linesOverlay.addTo(map);			
				
						//Now we add the animation
						
						var paths = d3.selectAll('.travelLine').each(function(ln){
					//		console.log(ln)
							var pathid = "#c"+ln.properties.s;
							var mrkrid = "#marker"+ln.properties.s;
					//		console.log(pathid)
						//console.log(paths)
					  var path = d3.select(pathid);
						
 					  var startPoint = pathStartPoint(path);
					  
//					  console.log(startPoint)
					  
					  var marker = d3.select(mrkrid);
					  marker.attr("r", function(d){
//					  	console.log(d)
					  	return 1+3*d.properties.stroke
					  	})
					    .attr("transform", "translate(" + startPoint[0] + ")");
					
					  ptransition();

					  //Get path start point for placing marker
					  function pathStartPoint(path) {
//							console.log(path)
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
				});			
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
		});//transition(d)})					

		
/*
function BorderToCenter(a, b){
	//a and b are arrays of landmasses, each represented by arrays of many 2-item coordinate arrays along their bordes; 
	//we want to return an array of landmass centerpoints, and then, for each border in country a, pick a landmass b closest to a, and a point along a closest to b's centerpoint

	//TODO: could probably make this a lot more concise...
		var avgA0s = [];
		var avgA1s = [];
		
		a.forEach(function(c){
			var c0 = _.reduce(c, function(memo, num){return memo + num[0]/c.length},0)
			var c1 = _.reduce(c, function(memo, num){return memo + num[1]/c.length},0)
			avgA0s.push(c0)
			avgA1s.push(c1)
		})
		
		console.log([avgA0s,avgA1s])
		
		var a0 = _.reduce(avgA0s, function(memo, num){return memo + num/avgA0s.length},0)
		
		var a1 = _.reduce(avgA1s, function(memo, num){return memo + num/avgA1s.length},0)

		
		var avgA = [a0,a1]
		
	
	//first, see if we need to look at multiple landmasses
	if (b.length > 1){
		var bestB;
		var closeB = [360,360];

		b.forEach(function(c){
			var tgt = [
				_.reduce(c, function(memo, num){return memo + num[0]/c.length},0),
				_.reduce(c, function(memo, num){return memo + num[1]/c.length},0)
			]
			
			if (
				(Math.abs(closeB[0] - a0) + Math.abs(closeB[1] - a1)) > 
				(Math.abs(tgt[0] - a0) + Math.abs(tgt[1] - a1)) 
			) {
				closeB = tgt;
				bestB = c;
			}
				 
		})
	} else {
		var bestB = b[0]
		var closeB = [
					_.reduce(bestB, function(memo, num){return memo + num[0]/bestB.length},0),
					_.reduce(bestB, function(memo, num){return memo + num[1]/bestB.length},0)
				]	
	//	var difs = [];				
	}
	//check for multiple landmasses in a
	if(a.length > 1){
		var newA = []
		a.forEach(function(c){
			
			//Look at the closest source for each 
			 newA.push(BorderToCenter([c],[bestB]).source)			
			 
		})
	//	console.log(a, [newA])
		
		var a_to_b = BorderToCenter([newA], [bestB])
		
//			console.log([bestA, bestB, difs,a_to_b,avgA,a,b])
	} else {
		a = a[0]
		var tgt = [
			_.reduce(bestB, function(memo, num){return memo + num[0]/bestB.length},0),
			_.reduce(bestB, function(memo, num){return memo + num[1]/bestB.length},0)
		]

		var difs0 = [];
		var difs1 = [];
		
		a.forEach(function(coord){
			difs0.push(Math.abs(coord[0]-tgt[0])) 
			difs1.push(Math.abs(coord[1]-tgt[1]))
		})
		
		avgA = [arrAvg(_.unzip(a)[0]), arrAvg(_.unzip(a)[1])]

//		console.log([tgt,a,difs0,difs1,_.min(difs0),_.min(difs1),a[difs0.indexOf(_.min(difs0))],a[difs1.indexOf(_.min(difs1))]])
		
		var tri = {
			x: a[difs0.indexOf(_.min(difs0))],
			y: a[difs1.indexOf(_.min(difs1))],
			z: avgA
			
		}
		
		var a_to_b = {
			source : [
				(tri.x[0] + tri.y[0] + tri.z[0])/3, 
				(tri.x[1] + tri.y[1] + tri.z[1])/3
			],
			target : tgt
		}
		
	}
		
	console.log([a, b, a_to_b])
	return a_to_b

}
*/
function BorderToCenter(a, b){
	
	var aF = _.flatten(a, true)
	var bF = _.flatten(b, true)
	aJunk = aF.pop()
	bJunk = bF.pop()
	
	var a0 = _.unzip(aF)[0]
	var a1 = _.unzip(aF)[1]
	
	var b0 = _.unzip(bF)[0]
	var b1 = _.unzip(bF)[1]
	
	
	var b0Mid = arrAvg(b0)
	var b1Mid = arrAvg(b1)
	
	var midB = [b0Mid, b1Mid]
	
	var dif0 = []
	var dif1 = []
	
	var dif2 = []

	aF.forEach(function(c){
			dif0.push(Math.abs(c[0]-b0Mid))
			dif1.push(Math.abs(c[1]-b1Mid))
			dif2.push(Math.abs(c[0]-b0Mid) + Math.abs(c[1]-b1Mid))
	})
		

	var minDiff0 = _.indexOf(dif0, _.min(dif0))
	var minDiff1 = _.indexOf(dif1, _.min(dif1))
	
	var minDiffAvg = (minDiff0 + minDiff1)/2
/*
	var a0MinDiff = a0[_.indexOf(dif0, _.min(dif0))]
	var a1MinDiff = a1[_.indexOf(dif1, _.min(dif1))]
*/
	
	var a0Mid = arrAvg(a0)
	var a1Mid = arrAvg(a1)
	
	var midA = [a0Mid, a1Mid]
	
	//approach 1
//	var mindex = round(minDiffAvg,0)
	
	//approach 2
	var mindex = _.indexOf(dif2, _.min(dif2))
	

	var a_to_b = {
			source : aF[mindex], //[
//				(a0Mid + a0MinDiff)/2, 
//				(a1Mid + a1MinDiff)/2
//			],
			target : midB
		}

//	console.log([a, b, aF, bF, minDiff0, minDiff1, minDiffAvg, midA, midB, a_to_b])

	return a_to_b;
}					
			});
//suppress because we load userdata asynchronously
//			});

function arrAvg(a){
	var sum = 0;
	for( var i = 0; i < a.length; i++ ){
			sum += a[i]
	}

	var avg = sum/a.length;
	return avg;
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

//MUST UNSUPPRESS FOR DEPLOYMENT
/*
		}
	}
}();
$(function () { app.init(); });
*/