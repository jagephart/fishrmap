function BorderToCenter(a, b){
	//a and b are arrays of landmasses, each represented by arrays of many 2-item coordinate arrays along their bordes; 
	//we want to return an array of landmass centerpoints, and then, for each border in country a, pick a landmass b closest to a, and a point along a closest to b's centerpoint
	
	var tgt = []

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
	
	
closeB = [
			_.reduce(bestB, function(memo, num){return memo + num[0]/bestB.length},0),
			_.reduce(bestB, function(memo, num){return memo + num[1]/bestB.length},0)
		]	
//	var difs = [];
	
	var closeA = [360,360]
	var bestA;
	a.forEach(function(c){
		var tgt = [
			_.reduce(c, function(memo, num){return memo + num[0]/c.length},0),
			_.reduce(c, function(memo, num){return memo + num[1]/c.length},0)		
		]
	console.log(Math.abs(closeA[0] - closeB[0]) + Math.abs(closeA[1] - closeB[1]))
		if (
			(Math.abs(closeA[0] - closeB[0]) + Math.abs(closeA[1] - closeB[1])) > 
			(Math.abs(tgt[0] - closeB[0]) + Math.abs(tgt[1] - closeB[1])) 
		) {
			closeA = tgt;
			bestA = c;
		}

	})

	var difs = [];
	bestA.forEach(function(coord){
		difs.push(Math.abs(coord[0]-closeB[0]) + Math.abs(coord[1]-closeB[1]))
	})
//	console.log([tgt,difs,_.min(difs),a[difs.indexOf(_.min(difs))]])
	var a_to_b = {
		source : bestA[difs.indexOf(_.min(difs))], 
		target : closeB
	}
	
		console.log([bestA, bestB, difs,a_to_b,avgA,a,b])

		return a_to_b
	
}
