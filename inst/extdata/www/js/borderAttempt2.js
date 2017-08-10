function BorderToCenter(a, b){
	
	var a0 = []
	var a1 = []
	
	var b0 = []
	var b1 = []
	
	
	
	b.forEach(function(c){
		var c0 = _.unzip(c)[0]
		var c1 = _.unzip(c)[1]
		
		var junk = c0.pop()
		junk = c1.pop()
		
		c0.forEach(function(d){b0.push(d)})
		c1.forEach(function(d){b1.push(d)})
		
	})
	
	var b0Mid = arrAvg(b0)
	var b1Mid = arrAvg(b1)
	
	var midB = [b0Mid, b1Mid]
	
	var dif0 = []
	var dif1 = []
	
	a.forEach(function(c){
		var c0 = _.unzip(c)[0]
		var c1 = _.unzip(c)[1]
		//array will have last value equal to first; we want to avoid overweighting
		var junk = c0.pop()
		junk = c1.pop()
		
		c0.forEach(function(d){
			dif0.push(Math.abs(d[0]-b0Mid))
			a0.push(d)
		})
		
		c1.forEach(function(d){
			dif1.push(Math.abs(d[1]-b1Mid))
			a1.push(d)
		})
		
		
	})

	var a0MinDiff = a0[_.indexOf(dif0, _.min(dif0))]
	var a1MinDiff = a1[_.indexOf(dif1, _.min(dif1))]
	
	var a0Mid = arrAvg(a0)
	var a1Mid = arrAvg(a1)
	
	var midA = [a0Mid, a1Mid]

	var a_to_b = {
			source : [
				(a0Mid + a0MinDiff)/2, 
				(a1Mid + a1MinDiff)/2
			],
			target : midB
		}

	console.log([a, b, midA, midB, a_to_b])

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
