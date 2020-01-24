function Graph(id,width,height)
{
	this.margin={top:5,bottom:30+5,left:20,right:20};
	this.width=width-this.margin.left+this.margin.right;
	this.height=height-this.margin.top+this.margin.bottom;
	this.values=[];
	var color = "steelblue";
	var svg = this.svg;

	var initNbBins = 10;


	svg = d3.select("#"+id).append("svg")
		.attr("class","graph")
		.attr("width",this.width+this.margin.left+this.margin.right)
		.attr("height",this.height+this.margin.top+this.margin.bottom)
		.append("g")
			.attr("transform","translate("+this.margin.left+","+this.margin.top+")");



	d3.select("body").append("p")
		.text("Slider histogramme")
		.style("color", color);

	
	d3.select("body").append("input")
			.attr("type", "range")
			.attr("id", "sliderHisto")
			.attr("min", "1")
			.attr("max", "20")
			.attr("value", initNbBins);



	d3.select("body").append("p")
	.text("Slider regression")
	.style("color", color);

	d3.select("body").append("input")
			.attr("type", "range")
			.attr("id", "sliderReg")
			.attr("min", "1")
			.attr("max", "20")
			.attr("value", initNbBins);



	var max = d3.max(values);
	var min = d3.min(values);

	// Axe x
	var x = d3.scaleLinear()
		.domain([min, max])
	    .range([0, width]);

	// Axe y
	var y = d3.scaleLinear()
          .range([height, 0]);
	
    var init = d3.histogram()
    	.domain(x.domain())
    	.thresholds(max);
	var bins = init(values);

	// Création du graphe
	function makeHistogram(nbBins) {

		svg.selectAll("rect")
		  .data(bins)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", 1)
		  .attr("height", "0")

		updateHistogram(nbBins);

		// affichage de l'axe x
		svg.append("g")
			.attr("id", "xAxis")
		  	.attr("transform", "translate(0," + height + ")")
		  	.call(d3.axisBottom(x));

		// affichage de l'axe y
		svg.append("g")
		.attr("id", "yAxis")
		  .call(d3.axisLeft(y));

	}


	// mise à jour de l'histogramme en fonction du nombre de bins du slider
	function updateHistogram(nbBins) {
	
	    var histogram = d3.histogram()
		    .domain(x.domain())
		    .thresholds(nbBins);

		var bins = histogram(values);

		y.domain([0, d3.max(bins, function(d) { return d.length; })]);



		svg.selectAll("rect")
			.attr("height", "0");

		svg.selectAll("rect")
		  .data(bins)
		  .attr("transform", function(d) {
			  return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
		  .attr("width", function(d) { return x(d.x1) - x(d.x0)- 5; })
		  .attr("height", function(d) { return height - y(d.length); })
		  .attr("fill", color);

		svg.select("#yAxis")
				.call(d3.axisLeft(y));
	}
	

	makeHistogram(initNbBins);

	d3.select("#sliderHisto").on("change", function(d){
		updateHistogram(this.value)
	});



	// appel des calculs de densité
	var kde = kernelDensityEstimator(kernelGauss(), x.ticks(initNbBins))
	var density =  kde( values.map(function(d){  return d; }) )

	// Affichage de la courbe de densité
	var curve = svg
	    .append('g')
	    .append("path")
	    .attr("class", "mypath")
	    .datum(density)
	    .attr("fill", "none")
	    .attr("opacity", ".8")
	    .attr("stroke", "#000")
	    .attr("stroke-width", 1)
	    .attr("stroke-linejoin", "round")
	    .attr("d",  d3.line()
	        .curve(d3.curveBasis)
	        .x(function(d) { return x(d[0]); })
	        .y(function(d) { return y(d[1]*initNbBins); })
	      );



	// Mise à jour de la courbe en fonction du nombre de bins du slider
	function updateChart(binNumber) {

	    kde = kernelDensityEstimator(kernelGauss(), x.ticks(binNumber))
	    density =  kde( values.map(function(d){  return d; }) )

	    curve
	      .datum(density)
	      .attr("d", d3.line()
	        .curve(d3.curveBasis)
	          .x(function(d) { return x(d[0]); })
	          .y(function(d) { return y(d[1]*binNumber); })
	        );
	}

	d3.select("#sliderReg").on("change", function(d){
		updateChart(this.value)
	});


	// Calcul de la densité
	function kernelDensityEstimator(kernel, X) {
	  return function(V) {
	    return X.map(function(x) {
	      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
	    });
	  };
	}


	// Calcul du coefficient de Gauss
	function kernelGauss() {
	  return function(v) {
	    return (Math.sqrt(2*3.14)*Math.exp(-0.5*(v*v)));
	  };
	}

	this.setValues=function(values){this.values=values;return(this);};

}


