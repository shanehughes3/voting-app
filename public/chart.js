document.addEventListener("DOMContentLoaded", function() {
    drawChart();
});

function drawChart() {
    const margin = {
	left: 50,
	right: 50,
	top: 50,
	bottom: 50
    };
    const height = 400 - margin.top - margin.bottom,
	  width = 500 - margin.left - margin.right;

    var pollData = document.getElementById("poll-data").value;
    var data = JSON.parse(pollData).options;

    const maxVotes = d3.max(data, (d) => d.votes);

    var y = d3.scale.linear()
	.domain([0, maxVotes])
	.range([height, 0]);

    var x = d3.scale.ordinal()
	.domain(data.map((d) => d.option))
	.rangeRoundBands([0, width], 0.5);

    var chart = d3.select(".chart")
	.attr("height", height + margin.top + margin.bottom)
	.attr("width", width + margin.left + margin.right)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg = d3.select(".chart");

    var xAxis = d3.svg.axis().scale(x)
	.orient("bottom");

    var yAxis = d3.svg.axis().scale(y)
	.orient("left")
	.ticks(Math.ceil(maxVotes /
			 Math.pow(10, Math.floor(Math.log10(maxVotes)))));

    var bar = chart.selectAll("g")
	.data(data)
	.enter().append("g")
	.attr("transform", function(d, i) {
	    return "translate(" + x(d.option) + "," + y(d.votes) + ")";
	});

    var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

    bar.append("rect")
	.attr("height", (d) => height - y(d.votes))
	.attr("width", x.rangeBand())
	.on("mouseover", function(d) {
	    div.transition()
		.duration(200)
		.style("opacity", 1);
	    div.html(getTooltipData(d))
		.style("left", d3.event.pageX + "px")
		.style("top", d3.event.pageY - 60 + "px")
	})
	.on("mouseout", function() {
	    div.transition()
		.duration(200)
		.style("opacity", 0);
	});

    chart.append("g")
	.attr("class", "xaxis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    chart.append("g")
	.attr("class", "yaxis")
	.call(yAxis);
}

function getTooltipData(d) {
    return d.option + "<br>" + d.votes + " votes";
}
