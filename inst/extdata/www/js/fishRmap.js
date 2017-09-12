var testmeta = [];
//TODO: Add slide-in dashboard, figure out why all paths come from a single point for some countries (e.g., brazil) but not others (e.g., bolivia)
//MUST UNSUPPRESS FOR DEPLOYMENT
/*
app = function() {
  
  return {
    
    init : function() {
*/


			var selJson;

			var species;
			var years;
			
			var selSpec;
			
			var imports;
			var exports;
		
			var impMax;
			var expMax;

			var chartWid = 200;
			var chartHgt = 200;
			var margin = 50;
	
			var userdata = [];

			
//Some functions for dropdown species selector...
	function myFunction() {
			document.getElementById("myDropdown").classList.toggle("show");
	}

	function filterFunction() {
			var input, filter, ul, li, a, i;
			input = document.getElementById("myInput");
			filter = input.value.toUpperCase();
			div = document.getElementById("myDropdown");
			a = div.getElementsByTagName("a");
		//	console.log([a, input, filter, div])
			for (i = 0; i < a.length; i++) {
	//						console.log(a[i])
					if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
							a[i].style.display = "";
							console.log(a[i])
					} else {
							a[i].style.display = "none";
					}
			}
	}

	function selectFunction() {
	//  console.log(this);
	//  console.log(window.location.href);
		if(selSpec != window.location.href.split('#')[1] & typeof window.location.href.split('#')[1] != 'undefined'){
			selSpec = window.location.href.split('#')[1]
			console.log(selSpec);
			updateVis();
		}
	}
				
	function visControls()
	{
		var allObs = [];
		imports.forEach(function(imp){allObs.push(imp.spc)})
		exports.forEach(function(exp){allObs.push(exp.spc)})
		species = _.uniq(allObs)
		species.unshift('All')
		selSpec = 'All'

		var allYrs = [];
		imports.forEach(function(imp){allYrs.push(imp.yrs)})
		exports.forEach(function(exp){allYrs.push(exp.yrs)})
		years = _.uniq(allObs)
//		years.unshift('All')
		
		addVis();
		
	}	
	
	function addVis()
	{
		var dropdiv = d3.select('body').append('div').attr('class', 'dropdown')
		
	 dropdiv.append('button')
		.attr('onclick', 'myFunction()')
		.attr('class', 'dropbtn')
		.text('Species')

		var dropdown = dropdiv.append('div')
		.attr('id', 'myDropdown')
		.attr('class', 'dropdown-content')
		
		dropdown.append('input')
		.attr('type', 'text')
		.attr('placeholder', 'Search...')
		.attr('id', 'myInput')
		.attr('onkeyup', 'filterFunction()')
		
		species.forEach(function(s){
			dropdown.append('a')
				.attr('href', '#'+s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ""))
				.attr('onclick', 'selectFunction()')
				.attr('onmouseup', 'selectFunction()')
//				.attr('onmousemove', 'selectFunction()')
				.text(s)
		})

		d3.select('body').append('svg')
		.attr('id', 'LineCharts')
		.attr('width', 4*chartWid+'px')
		.attr('height', (chartHgt+2*margin)+'px')

		d3.select('#LineCharts')
		.append('g')
		.attr('id', 'importCharts')
		.attr('transform', 'translate('+chartWid+','+margin+')')
		.attr('width', chartWid+'px')
		
		
		d3.select('#LineCharts')
		.append('g')
		.attr('id', 'exportCharts')
		.attr('transform', 'translate('+(2*chartWid + margin)+','+margin+')')
		.attr('width', chartWid+'px')
		

		drawChart(imports, 'import')
		drawChart(exports, 'export')
		
		

		updateVis();
	}

	function updateVis()
	{
		
		
	}	
	
	function drawChart(data, type)
	{
		
				
		var g = d3.select('#'+type+'Charts')

		var x = d3.scaleLinear()
				.rangeRound([0, chartWid]);

		var y = d3.scaleLinear()
				.rangeRound([chartHgt, 0]);


		x.domain([
			_.min(data, function(d){return d.yrs}).yrs, 
			_.max(data, function(d){return d.yrs}).yrs
			]);

//		y.domain(d3.extent(data, function(d) { return d.val; }));
		y.domain([0,_.max(data, function(d) { return d.val; }).val]);

		var line = d3.line()
				.x(function(d) {
					//console.log([d, x(d.yrs), y(d.val), y.domain()]); 
					return x(d.yrs); 
				})
				.y(function(d) { return y(d.val); });

		g.append("g")
				.attr("transform", "translate(0," + chartHgt + ")")
				.call(d3.axisBottom(x))
			.select(".domain")
				.remove();

		g.append("g")
				.call(d3.axisLeft(y))
			.append("text")
				.attr("fill", "#000")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end")
				.text("Trade ($)");
				
		var maxObs = _.max(data, function(d){ return d.val; });		
		
//		var maxID = type == 'export' ? maxObs.exp : maxObs.imp;

		
		if (selSpec == 'All')
		{
			species.forEach(function(spec)
			{
				if(spec != 'All')
				{
					//console.log([spec, maxObs])
					var dat = _.where(data, {spc: spec, exp: maxObs.exp, imp: maxObs.imp}) 
					
					//console.log([data, spec, dat])
				
					g.append("path")
					.datum(dat)
					.attr("id", spec)
					.attr("fill", "none")
					.attr("stroke", "steelblue")
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round")
					.attr("stroke-width", 1.5)
					.attr("d", line);

				}		
			})
		}

	}
			//Read user data
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
	function getUserdata()
	{
		d3.json('shared/fishRmap/ajax/userdata.json', function(err, data) {		
		//d3.csv('shared/fishRmap/ajax/userdata.csv', function(err, data) {
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
	d3.json('shared/fishRmap/ajax/world.json', function(err, world) 
	{
		
			//Read metadata dict with IDs for different types of identifier
			//MUST USE shared/fishRmap version for deployment!!!!
//		d3.json('shared/fishRmap/ajax/userdata.json', function(err, userdata) {
		d3.json('shared/fishRmap/ajax/worldmeta.json', function(err, meta) 
		{
		console.log(meta)
		
		//Should remove this when you can 
		meta.forEach(function(m){testmeta.push(m)})
		
// Extend geojson to accomodate topojson--will be more efficient
//via http://blog.webkid.io/maps-with-leaflet-and-topojson/
		L.TopoJSON = L.GeoJSON.extend(
		{  
			addData: function(jsonData) 
			{    
				if (jsonData.type === "Topology") 
				{
					for (key in jsonData.objects) 
					{
						geojson = topojson.feature(jsonData, jsonData.objects[key]);
		//				console.log('Adding geojson feature');
		//				console.log(geojson);
						L.GeoJSON.prototype.addData.call(this, geojson);
					}
				}
				else 
				{
					L.GeoJSON.prototype.addData.call(this, jsonData);
				}
			}  
		});
//			var worldL = new L.TopoJSON(world);
			
			
//More general conversion of a given TopoJSON to GeoJSON for arcs
          var convertTopojsonToGeojson = function(topojsonString) 
					{
              try 
							{
                  var parsedTopojson = topojsonString;
                  var geJSONobj = new GeoJSON();
                  //iterate over each key in the objects of the topojson
                  for (var col in parsedTopojson.objects) 
									{
                      if (parsedTopojson.objects.hasOwnProperty(col)) 
											{
                          var gJ = topojson.feature(parsedTopojson, parsedTopojson.objects[col]);
                          //merge with the existing GeoJSON Object
                          geJSONobj.merge(gJ);
                      }
                  }
                  //get the complete GeoJSON data
                  var geojson = geJSONobj.getData();
                  //Write it to the geojson text box
                  return geojson;
              } catch (error) 
							{
//                  displayError('There was an unknown error converting your TopoJSON to GeoJSON. Sorry.');
                  console.log(error, error.message);
              }
          };

         //function for building GeoJSON:
          function GeoJSON() 
					{
              var data;
              this.merge = function(input) 
							{
                  if (this.data == null) 
									{
                      this.data = input;
                      return;
                  }
                  //Data already exists, we need to look at the type
                  var type = this.data.type;
                  switch (type) 
									{
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
              this.getFeatures = function(geoJSON) 
							{
                  var type = geoJSON.type;
                  switch (type) 
									{
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
              this.makeFeaturesArray = function(geom) 
							{
                  var feature = {
                      "type": "Feature",
                      "geometry": geom //Note: There can't be properties.
                  };
                  return [feature];
              };
              this.getData = function() 
							{
                  return this.data;
              };
          }					
					
			//console.log(convertTopojsonToGeojson(world));
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

			var countriesOverlay = L.d3SvgOverlay(function(sel, proj) 
			{
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

			var linesOverlay = L.d3SvgOverlay(function(sel, proj) 
			{
				//console.log(arcs);
				if (typeof arcs.features != 'undefined')
				{
					var upd = sel.selectAll('path').data(arcs.features);
	//				var upd = sel.data(sArr);
					//console.log([upd, proj, mArr]);
					//console.log(upd)
					
					upd
					.enter()
						.append('path')
							.attr('id', function(d){return 'c'+d.properties.s})
							.attr('d', function(d){
								return proj.pathFromGeojson(d)})
	//						.attr('d', d3.geoPath())
//							.attr('stroke', 'black')
								.attr('stroke', function(d)
								{
									return d.properties.hue;
								})
							.attr('class', 'travelLine')
								.attr('stroke-opacity', '0.65')
	// This is actually kind of a neat effect, but we'll drop it for now
	//						.attr('fill', '#88adea')
	//						.attr('fill-opacity', '0.35')
							.attr('fill-opacity', '0')
							.attr('stroke-width', function(d) {
	//					console.log(d); 
								return 0.1 + d.properties.stroke / proj.scale 
							})
							;
					
					
					upd.enter().append('circle')						
					.attr('id', function(d){return 'marker'+d.properties.s})
					.attr("r", 7 / proj.scale)
					.attr("fill", function(d){return d.properties.hue})
					.attr("transform", function(d){
						var point = proj.latLngToLayerPoint(d.geometry.coordinates[0])
						return 'translate('+ point.x + ',' + point.y +')'

					})

				}
			});


			function whenClicked(e)
			{
				selJson = {"type": "FeatureCollection","features": []}
//				console.log(e);
				selectedISO = e;

//				Hide old arcs				
				map.removeLayer(linesOverlay);

//				Try to remove charts	
				try{d3.select('#importCharts').remove()} catch(err) {console.log(err)}
				try{d3.select('#exportCharts').remove()} catch(err) {console.log(err)}
// 		set id of new arcs (must be done after hiding
//				iso_id = e.target.feature.properties[iso];			
				iso_id = _.where(meta, {'id': parseFloat(e.target.feature.id)})[0];			
				
//				console.log(e.target);
//				console.log(iso_id);
//				console.log(userdata);
//				console.log([e.target.feature.id, iso_id[iso],iso_id])

				imports = _.where(userdata, {imp: parseFloat(iso_id[iso])});
				exports = _.where(userdata, {exp: parseFloat(iso_id[iso])});
			  
				impMax = _.max(imports, function(trade){return trade.val})
				expMax = _.max(exports, function(trade){return trade.val})

//				console.log(impMax)
//				console.log(expMax)
				
				
				
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
			
				sources.forEach(function(d)
				{
					//console.log(d)
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
							
							var cnt = 0;
//								console.log(coordArc)
    					var theseImps = _.reduce(
								_.pluck(
									_.where(
										imports, {imp: d}
									), 'val'
								), function(memo, num)
								{ 
									cnt += 1;
									return memo + num; 
								}, 0
							);
							
							var modifier = (theseImps/cnt)/impMax.val
							//console.log([theseImps,cnt,modifier])
							//try {console.log(d3.geoPath()(s.source, s.target))} catch(err) {console.log(err)}
							//var line = d3.geoInterpolate([s.source[1], s.source[0]], [s.target[1], s.target[0]])
							  var sfeature =  { "type": "Feature", "geometry": 
							  	{ "type": "LineString",
//							    "coordinates": [ s.source, s.target ]
							    "coordinates": coordArc
    							}, 
//    						"properties":{"stroke":1, "s":iso_id[iso]+'to'+thisID.id}
    						"properties":{
									"stroke":(isNaN(modifier) ? 0 : modifier), 
									"hue":"red", 
									"s":iso_id[iso]+'to'+thisID.id}

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
					} 
					else 
					{
						console.log('Source not found in geographic data: '+d)
					}
				})
				
				targets.forEach(function(d)
				{
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
								
								var thisCoord = A_to_B.target
								var thatCoord = A_to_B.source
								
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
							var cnt = 0;
//								console.log(coordArc)
    					var theseExps = _.reduce(
								_.pluck(
									_.where(
										exports, {exp: d}
									), 'val'
								), function(memo, num)
								{ 
									cnt += 1;
									return memo + num; 
								}, 0
							);
							
							var modifier = (theseExps/cnt)/expMax.val
							  var sfeature =  { "type": "Feature", "geometry": 
							  	{ "type": "LineString",
							    "coordinates": coordArc
    							}, 
    						"properties":{
									"stroke": (isNaN(modifier) ? 0 : modifier), 
									"hue":"black", 
									"s":thisID.id+'to'+iso_id[iso]
								}

 }

    						arcs.features.push(sfeature)
    						
						}
					} 
					else 
					{
						console.log('Source not found in geographic data: '+d)
					}
				})
				
						//First we add lines to the map

				linesOverlay.addTo(map);			
				
						//... Then we add the animation
						
				var paths = d3.selectAll('.travelLine').each(function(ln)
				{
							//console.log(ln)
							var pathid = "#c"+ln.properties.s;
							var mrkrid = "#marker"+ln.properties.s;
					//		console.log(pathid)
						//console.log(paths)
					  var path = d3.select(pathid);
						
 					  var startPoint = pathStartPoint(path);
					  
//					  console.log(startPoint)
					  
					  var marker = d3.select(mrkrid);
					  marker.attr("r", function(d)
						{
//					  	console.log(d)
					  	return 1+3*d.properties.stroke
					  	})
					    .attr("transform", "translate(" + startPoint[0] + ")");
					
					  ptransition();

					  //Get path start point for placing marker
					  function pathStartPoint(path) 
						{
//							console.log(path)
					    var d = path.attr("d"),
					    dsplitted = d.split("M");
					    return dsplitted[1].split(",");
					  }
					
					  function ctransition() 
						{
					    marker.transition()
					        .duration(3500)
					        .attrTween("transform", translateAlong(path.node()))
					        .on("end", ctransition);// infinite loop
					  }

					  function translateAlong(path) 
						{
					    var l = path.getTotalLength();
					    return function(i) 
							{
					      return function(t) 
								{
					        var p = path.getPointAtLength(t * l);
					        return "translate(" + p.x + "," + p.y + ")";//Move marker
					      }
					    }
					  }
										  
					  function ptransition() 
						{
					    path.transition()
					        .duration(3500)
					        .attrTween("stroke-dasharray", tweenDash)
					        .on("end", ptransition); // infinite loop
					  }
					
					  function tweenDash() 
						{
					    var l = path.node().getTotalLength();
					    var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
					    return function(t) 
							{
//					      var marker = d3.select("#marker");
					      var p = path.node().getPointAtLength(t * l);
					      marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
					      return i(t);
					    }
					  }
											
				});
				visControls();
			}
			
			function onEachFeature(feature, layer) 
			{
				//bind click
				layer.on(
				{
						click: whenClicked
				});
			}

			var worldUnderlay = new L.TopoJSON(world, {onEachFeature: onEachFeature, opacity: 0.5, fillOpacity: 0.5}).addTo(map);
			
			L.control.coordinates().addTo(map);

			
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

		
function BorderToCenter(a, b)
{
	
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

	aF.forEach(function(c)
	{
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

function arrAvg(a)
{
	var sum = 0;
	for( var i = 0; i < a.length; i++ )
	{
			sum += a[i]
	}

	var avg = sum/a.length;
	return avg;
}

function round(value, decimals) 
{
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

//MUST UNSUPPRESS FOR DEPLOYMENT
/*
		}
	}
}();
$(function () { app.init(); });
*/