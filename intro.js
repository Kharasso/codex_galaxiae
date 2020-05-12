
d3.csv("hyg_exp.csv", function(error, rows) {
  if (error) throw error;

  var margin = {top: 100, right: 90, bottom: 30, left: 100},
      width = 960 - margin.left - margin.right,
      height = 560 - margin.top - margin.bottom;

  var columnName = "lum";
  // var x = d3.scale.linear().range([0, width]),
  //     y = d3.scale.linear().range([height, 0]),
  //     z = d3.scale.linear().range(["white", "steelblue"]);
  d3.select("#ci")
    .on("click",function () {
      console.log("i");
      var value = d3.select(this).property("value");
      clicking(value); });

  d3.select("#absmag")
    .on("click",function () {
      console.log("i");
      var value = d3.select(this).property("value");
      clicking(value); });

  d3.select("#mag")
    .on("click",function () {
      console.log("i");
      var value = d3.select(this).property("value");
      clicking(value); });

  d3.select("#lum")
    .on("click",function () {
      console.log("i");
      var value = d3.select(this).property("value");
      clicking(value); });

  function clicking(feature) {
    console.log(columnName);
    columnName = feature;
    console.log(columnName);
    ymin = d3.min(rows, function(d){ return +d[columnName]});
    ymax = d3.max(rows, function(d){ return +d[columnName]});
    ylim = [ymin, ymax];

    y = d3.scaleLinear()
            .nice()
            .domain(ylim)
            .range([height,0]);

    rows.forEach(function(d){
      inputForRectBinning.push([+d.dist, +d[columnName]])
    });
  }


  const svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");


  var xmin = d3.min(rows, function(d){ return +d["dist"]});
  var xmax = d3.max(rows, function(d){ return +d["dist"]});
  var xlim = [xmin, xmax];

  var ymin = d3.min(rows, function(d){ return +d[columnName]});
  var ymax = d3.max(rows, function(d){ return +d[columnName]});
  var ylim = [ymin, ymax];

  var numDivision = 15;


  var x = d3.scaleLinear()
            .nice()
            .domain(xlim)
            .range([0, width]);


  var y = d3.scaleLinear()
            .nice()
            .domain(ylim)
            .range([height,0]);


  var inputForRectBinning = []
  rows.forEach(function(d){
    console.log([+d[columnName]]);
    inputForRectBinning.push([+d.dist, +d[columnName]])
  });

  var size = (ylim[1] - ylim[0])/ numDivision;
  var rectbinData = d3.rectbin()
      .dx(25)
      .dy(size)
      (inputForRectBinning);

  var color = d3.scaleLinear()
        .domain([0,15])
        .range(["#ffffcc", "#e31a1c"]);

  var heightInPx = y(ylim[1] - size);
  var widthInPx = x(xlim[0] + 25);


  svg.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height)
  svg.append("g")
      .attr("clip-path", "url(#clip)")
    .selectAll("myRect")
    .data(rectbinData)
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x) })
      .attr("y", function(d) { return y(d.y) - heightInPx })
      .attr("width", widthInPx )
      .attr("height", heightInPx )
      .attr("fill", function(d) {
        return color(d.length); })
      .attr("fill-opacity", function(d){
        if(d.length === 0)
          return "0.1";
        return "0.9";
      })
      .attr("stroke", "white")
      .attr("stroke-opacity", "1.0")
      .attr("stroke-width", "0.4")

  var axisX = svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0,"+height+")")
                .call(d3.axisBottom(x));

  var axisY = svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y));

  // axisX.attr("line", "white");
  // axisY.attr("line", "white");
  // var width2 = 400;

  // var svg2 = d3.select("#chart2").append("svg")
  //     .attr("width", width2)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .append("g")
  //     .attr("transform", "translate("+(margin.left+width)+","+margin.top+")");


});
