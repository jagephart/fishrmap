var svg = d3.select("svg"),
				width = +svg.attr("width"),
				height = +svg.attr("height"),
				g = svg.append("g").attr("transform", "translate(40,0)");

			
		var tree = d3.tree()
			.size([height, width - 200]);
		
		var stratify = d3.stratify()
			.id(function(d) {
				//console.log([d.name, d.parent]); 
				return d.name; })
			.parentId(function(d) {return d.parent})
//			(data);
	d3.csvParse("nameparentcolorpoint,
Paul Jacobsblackblack,
JencyPaul Jacobsgraygray,
GrahamPaul Jacobsgraygray,
RajaPaul Jacobsgraygray,
SuyanPaul Jacobsgraygray,
Andrea JulcaPaul Jacobssteelbluegoldenrod,
NaveenPaul Jacobsgraygray,
KunalPaul Jacobsgraygray,
ZhenyePaul Jacobsgraygray,
MatthewPaul Jacobsgraygray,
MichaelPaul Jacobsgraygray,
AlexandraPaul Jacobsgraygray,
NicholasPaul Jacobsgraygray,
AlexPaul Jacobsgraygray,
SusanPaul Jacobsgraygray,
TuPaul Jacobsgraygray,
EdelPaul Jacobsgraygray,
Jean-PaulPaul Jacobsgraygray,
SandraPaul Jacobsgraygray,
DimitriPaul Jacobsgraygray,
BinghuanPaul Jacobsgraygray,
XinyunPaul Jacobsgraygray,", function(error, data) {
		if (error) throw error;
		//console.log(data)
		//var table = d3.csvParse(data);
		var root = stratify(data)
				.sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
		tree(root);
		
		//console.log(root)

		var link = g.selectAll(".link")
				.data(root.descendants().slice(1))
			.enter().append("path")
				.style("stroke", function(d) { return d.point; })
				.style("fill", function(d) { return d.point; })
				.attr("class", "link")
				.attr("d", function(d) {
					//console.log(d);
					return "M" + d.y + "," + d.x
							+ "C" + (d.y + d.parent.y) / 2 + "," + d.x
							+ " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
							+ " " + d.parent.y + "," + d.parent.x;
				})

		var node = g.selectAll(".node")
				.data(root.descendants())
			.enter().append("g")
				.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

		node.append("circle")
				.attr("r", 2.5)
			  .style("stroke", function(d) { return d.point; })
				.style("fill", function(d) { return d.point; });

		node.append("text")
				.attr("dy", 3)
				.attr("x", function(d) { return d.children ? -8 : 8; })
				.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
//				.style("fill", function(d) { return d.color; })
				.text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
				
//		var link = g.selectAll("path.link")
//			.style("stroke", function(d) { return d.point; })
//			.style("fill", function(d) { return d.point; });
////				.data(root, function (d) {
////						return d.target.id;
////				});
		link.enter()
			.style("stroke", function(d) { return d.point; })
			.style("fill", function(d) { return d.point; });
		
	});

	
