d3.csv("hyg_med_small.csv", function(error, rows){
  if(error) throw error;


  var loc_circles_bool = false;

  var total = rows.length;
  var margin = {top: 90, right: 90, bottom: 160, left: 200},
      tileSize = 22,
      numberOfTiles = 20,
      graphSize = tileSize * numberOfTiles;

  var urlObj = new URL(window.location.href);
  var urlVars = urlObj.searchParams;

  var featurex = urlVars.get("labelX");
  var feature_y = urlVars.get("labelY");

  var xLabel, yLabel;

  if(featurex){
     xLabel = featurex;
  }else{
     xLabel = "lum";
  }

  if(feature_y){
    yLabel = feature_y;
  }else{
    yLabel = "mag";
  }



  var orginalRangeText = "";

  const svg = d3.select("body").append("svg")
                .attr("width", graphSize + margin.left + margin.right)
                .attr("height", graphSize + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate("+margin.left+","+margin.top+")");

  var xmin = d3.min(rows, function(d){ return +d[xLabel]});
  var xmax = d3.max(rows, function(d){ return +d[xLabel]});
  var xlim = [xmin, xmax];

  var ymin = d3.min(rows, function(d){ return +d[yLabel]});
  var ymax = d3.max(rows, function(d){ return +d[yLabel]});
  var ylim = [ymin, ymax];

  var x = d3.scaleLinear()
            .nice()
            .domain(xlim)
            .range([0, graphSize]);

  var y = d3.scaleLinear()
            .nice()
            .domain(ylim)
            .range([graphSize, 0]);

  //x, y scaler variables for resizing\
  //x, y range variables for resizing
  var xR, yR;
  var xRange, yRange;

  var lowerXBrush = parseFloat(urlVars.get("lowerXBrush"));
  var upperXBrush = parseFloat(urlVars.get("upperXBrush"));
  var lowerYBrush = parseFloat(urlVars.get("lowerYBrush"));
  var upperYBrush = parseFloat(urlVars.get("upperYBrush"));

  if(lowerXBrush){
    xRange = [lowerXBrush, upperXBrush];
    yRange = [lowerYBrush, upperYBrush];

    yR = d3.scaleLinear()
            .nice()
            .domain(yRange)
            .range([graphSize,0]);

    xR = d3.scaleLinear()
            .nice()
            .domain(xRange)
            .range([0,graphSize]);
  }else{
    xR = x;
    yR = y;

    xRange = xlim;
    yRange = ylim;
  }

  var original = "X Range:(" + xRange[0].toFixed(2) + ", " + xRange[1].toFixed(2)
            + "), Y Range:(" + yRange[0].toFixed(2) + ", " + yRange[1].toFixed(2) + ")";
  var textRange = d3.select("h3").text(original);

  var inputForRectBinning = []
  rows.forEach(function(d){
    if(+d[yLabel] <= yRange[1] && +d[yLabel] >= yRange[0]){
       if(+d[xLabel] <= xRange[1] && +d[xLabel] >= xRange[0]){
           inputForRectBinning.push([xR(+d[xLabel]), yR(+d[yLabel])]);
         }
    }
  });
  inputForRectBinning.push([0,0]);
  inputForRectBinning.push([graphSize, graphSize]);

  //set current overall Count
  d3.select(".Count").text(inputForRectBinning.length - 2);
  // var binning = d3.bin()
  //                 .size([graphSize, graphSize])
  //                 .side(tileSize)

  var rectbinData = d3.rectbin()
      .dx(tileSize)
      .dy(tileSize)
      (inputForRectBinning);
  // var bins = binning(inputForRectBinning);

  var color = d3.scaleLinear()
        .domain([0,20])
        .range(["#ffffcc", "#e31a1c"]);

// setting up the 2D histogram with rectangles
  svg.append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", graphSize)
     .attr("height", graphSize);

  // console.log(rectbinData.length);
  const title = svg.append("g")
                   .append("text")
                   .attr("text-anchor", "middle")
                   .attr("font-size","14px")
                   .attr("fill", "white")
                   .attr("transform","translate(215,-40)")
                   .text("HISTOGRAM OF STARS IN DIFFERENT RANGES")

   const subtitle = svg.append("g")
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("font-size","14px")
                    .attr("fill", "white")
                    .attr("transform","translate(215,-20)")
                    .text("(Double-click on a tile to inspect the stars in that range in space)")

  const tiles = svg.append("g").attr("clip-path", "url(#clip)")
                   .selectAll("myRect")
                   .data(rectbinData)
                   .enter()
                   .append("rect")
                   .on("dblclick", function(d){
                     if(d.length > 0){
                        // console.log(x.invert(d.x));
                        // console.log(x.invert(d.x + tileSize));
                        // console.log(y.invert(d.y));
                        // console.log(y.invert(d.y - tileSize));
                        var rangeH = [xR.invert(d.x), xR.invert(d.x + tileSize)];
                        var rangeV = [yR.invert(d.y + tileSize), yR.invert(d.y)];

                        loadPage(xLabel, yLabel, rangeH, rangeV, xRange, yRange);
                      }
                     else{
                       return d;
                     };})
                   .attr("x", function(d){ return d.x; })
                   .attr("y", function(d) { return d.y - tileSize; })
                   .attr("width", tileSize)
                   .attr("height", tileSize)
                   .attr("fill", function(d) {
                     return color(d.length); })
                   .attr("fill-opacity", function(d){
                     if(d.length === 0)
                       return "0.1";
                     return "0.9";
                   })
                   .on("mouseover", function(d){

                     original = "X Range:(" + xR.invert(d.x).toFixed(2) + ", " + xR.invert(d.x + tileSize).toFixed(2)
                               + "), Y Range:(" + yR.invert(d.y + tileSize).toFixed(2) + ", " + yR.invert(d.y).toFixed(2) + ")";
                     textRange = d3.select("h3").text(original);

                     //redraw prview

                     var loc_x_range = [xR.invert(d.x),xR.invert(d.x + tileSize)],
                     loc_y_range = [yR.invert(d.y + tileSize), yR.invert(d.y)];

                     if(loc_circles_bool == true){loc_circles.remove();}
                     draw_preview(loc_x_range, loc_y_range);


                     //change text

                     if(d.length === 0){

                       d3.select(this).attr("fill-opacity","0.9");
                       d3.select(this).attr("fill", "white");
                       d3.select(".Count").text(0);
                     }
                     else{
                     d3.select(".Count").text(d.length);
                     d3.select(this).attr("fill", "white");}


                   })
                   .on("mouseout", function(d){
                     opacity = 0;
                     if(d.length === 0)
                       opacity = "0.1";
                     else
                       opacity = "0.9";
                     d3.select(this).attr("fill", function(d) {
                       return color(d.length); });
                     d3.select(this).attr("fill-opacity", opacity);})
                   .attr("stroke", "white")
                   .attr("stroke-opacity", "1.0")
                   .attr("stroke-width", "0.4")

var brushXOffset = 90;
var brushYOffset = 90;

 // adding X axis
var axisX = svg.append("g")
               .attr("class", "axis")
               .attr("transform", "translate(0,"+graphSize+")")
               .call(d3.axisBottom(xR).ticks(10))

 var axisXBrush = svg.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(0,"+(graphSize+brushXOffset)+")")
             .call(d3.axisTop(x).ticks(10))

 var labelX = svg.append("g")
               .append("text")
               .attr("text-anchor", "middle")
               .attr("font-size","14px")
               .attr("x", graphSize/2)
               .attr("y", graphSize + 48)
               .attr("fill", "#d3d3d3")
               .text(subToFeature(xLabel))

 // adding Y axis
 var axisY = svg.append("g")
               .attr("class", "axis")
               .call(d3.axisLeft(yR).ticks(10))

 var axisYBrush = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+(-brushYOffset)+",0)")
            .call(d3.axisRight(y).ticks(10))

 var labelY = svg.append("g")
               .append("text")
               .attr("text-anchor", "middle")
               .attr("font-size","14px")
               .attr("x", -graphSize/2)
               .attr("y", -40)
               .attr("fill", "#d3d3d3")
               .attr("transform", "rotate(-90)")
               .text(subToFeature(yLabel))


// adding scroll brush
var dataX = [];
rows.forEach(function(d){
  dataX.push(+d[xLabel]);
});

var dataY = [];
rows.forEach(function(d){
  dataY.push(+d[yLabel]);
});

var thresholdX = x.ticks(75);
var thresholdY = y.ticks(75);

var binsX = d3.histogram()
              .domain(x.domain())
              .thresholds(thresholdX)
              (dataX)
var binsY = d3.histogram()
              .domain(y.domain())
              .thresholds(thresholdY)
              (dataY)

var chartHeight = graphSize/8;

var lineX = [];
binsX.forEach(function(d,i){
  if(i===0){
    lineX.push([2 * thresholdX[0]- thresholdX[1],d.length/dataX.length]);
  }
  else
  lineX.push([thresholdX[i-1],d.length/dataX.length]);
});

var lineY = [];
binsY.forEach(function(d,i){
  if(i===0){
    lineY.push([2 * thresholdY[0]- thresholdY[1],d.length/dataY.length]);
  }
  else
  lineY.push([thresholdY[i-1],d.length/dataY.length]);
});


var xHist = d3.scaleLinear()
              .domain([0, d3.max(binsX, d => d.length)/dataX.length])
              .range([0, chartHeight])

var yHist = d3.scaleLinear()
              .domain([0, d3.max(binsY, d => d.length)/dataY.length])
              .range([0, chartHeight])

// area constructor
var xArea = d3.area().curve(d3.curveBasis)
             .x(d => x(d[0]))
             .y0(0)
             .y1(d => xHist(d[1]))

var yArea = d3.area().curve(d3.curveBasis)
             .x(d => y(d[0]))
             .y0(0)
             .y1(d => yHist(d[1]))

const histX = svg.append("g").attr("class","histo histo-x")
            .datum(lineX)
            .append("path")
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", "0")
            .attr("d", xArea(lineX))
            .attr("transform", "translate(0, "+(graphSize+brushXOffset)+")");

const histY = svg.append("g").attr("class","histo histo-y")
            .datum(lineY)
            .append("path")
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", "0")
            .attr("d", yArea(lineY))
            .attr("transform", "translate("+(-brushYOffset)+", 0),rotate(90)");

// Setting up X brush region
// rectangular filters
var rectDivision = 4;
var rectWidth = tileSize / rectDivision;
var rectArray = [];

for(var i = 1; i <= rectDivision * numberOfTiles; i++){
  rectArray.push(i);
}


const rectFiltersX = svg.append("g").attr("class","rect-filters")
                       .selectAll("myRectFilterX")
                       .data(rectArray)
                       .enter().append("rect")
                       .attr("x", function(d){ return (d - 1) * rectWidth;})
                       .attr("y", graphSize+90)
                       .attr("opacity", function(d){
                          return 0;
                       })
                       .attr("width", tileSize / rectDivision)
                       .attr("height", chartHeight);

// Setting up Y brush region
// rectangular filters
const rectFiltersY = svg.append("g").attr("class","rect-filters")
                       .selectAll("myRectFilterY")
                       .data(rectArray)
                       .enter().append("rect")
                       .attr("x", function(d){ return (d - 1) * rectWidth;})
                       .attr("y", 0)
                       .attr("opacity", function(d){
                         return 0;
                       })
                       .attr("width", tileSize / rectDivision)
                       .attr("height", chartHeight)
                       .attr("transform", "translate(-90, 0),rotate(90)");


var marginBrush = ({top: 0, right: 0, bottom: 0, left: 0});
var width2 = graphSize;
var height2 = chartHeight;
var roundFactor = tileSize / rectDivision;
const defaultSelection = [0, graphSize];

var currentXSelection, currentYSelection;

    if(lowerXBrush){
      currentXSelection = [x(xRange[0]), x(xRange[1])];
      currentYSelection = [y(yRange[1]), y(yRange[0])];
    }else{
      currentXSelection = defaultSelection;
      currentYSelection = defaultSelection;
    }

const brushX = d3.brushX()
     .extent([[marginBrush.left, marginBrush.top], [width2 - marginBrush.right, height2 - marginBrush.bottom]])
     .on("brush", brushedX)
     .on("end", brushendedX);

const brushY = d3.brushX()
    .extent([[marginBrush.left, marginBrush.top], [width2 - marginBrush.right, height2 - marginBrush.bottom]])
    .on("brush", brushedY)
    .on("end", brushendedY);

// function for brush snapping
function brushedX() {
  if(d3.event.sourceEvent){
      if(d3.event.sourceEvent.type === "brush") return;
      // console.log(d3.event.selection);

      const selection = [ Math.round(d3.event.selection[0]/roundFactor) * roundFactor,
                          Math.round(d3.event.selection[1]/roundFactor) * roundFactor];
      const d0 = selection.map(x.invert);

      if(d0[0] === d0[1]){
        d0[1] = d0[0] + roundFactor;
      }

      const d1 = d0.map(x);
      d3.select(this).call(brushX.move, d1);
      currentXSelection = d1;
      rectFiltersX.attr("opacity", function(d){
        rectLoc = (d - 1) * rectWidth;
        if(rectLoc >= d1[0] && rectLoc < d1[1]){
          return 0;
        }
        else{
          return 0.6;
        }
      });
      resize("x", d1.map(x.invert));
    }
  }

function brushedY() {
    if(d3.event.sourceEvent){
      if(d3.event.sourceEvent.type === "brush") return;
      const selection = [ Math.round(d3.event.selection[0]/roundFactor) * roundFactor,
                          Math.round(d3.event.selection[1]/roundFactor) * roundFactor];
      // console.log(selection);
      const d0 = selection.map(y.invert);
      if(d0[0] === d0[1]){
        d0[1] = d0[0] + roundFactor;
      }
      //
      const d1 = d0.map(y);

      d3.select(this).call(brushY.move, d1);
      currentYSelection = d1;
      rectFiltersY.attr("opacity", function(d){
        rectLoc = (d - 1) * rectWidth;
        if(rectLoc >= d1[0] && rectLoc < d1[1]){
          return 0;
        }
        else{
          return 0.6;
        }

      });
      resize("y", d1.map(y.invert));
    }
  }


function brushendedX() {
    if (!d3.event.selection) {
      brushGroupX.call(brushX.move, currentXSelection);
    }

}

function brushendedY() {
    if (!d3.event.selection) {
      brushGroupY.call(brushY.move, currentYSelection);
    }
}

const brushGroupX = svg.append("g")
                 .attr("class","brush-x")
                 .call(brushX)
                 .call(brushX.move, currentXSelection)
                 .attr("transform", "translate(0, "+(graphSize+90)+")");

const brushGroupY = svg.append("g")
                  .attr("class","brush-y")
                  .call(brushY)
                  .call(brushY.move, currentYSelection)
                  .attr("transform", "translate(-90, 0),rotate(90)");



// Setting Y axis buttons
 d3.selectAll(".simple-button-y")
   .on("click",function () {
     var value = d3.select(this).property("value");
     brushGroupY.call(brushY.move, defaultSelection);
     clicking('y', value);});

// Setting X axis buttons
d3.selectAll(".simple-button-x")
  .on("click",function () {
    var value = d3.select(this).property("value");
    brushGroupX.call(brushX.move, defaultSelection);
    clicking('x', value);});

var xLabelID = "#" + xLabel;
var yLabelID = "#" + yLabel;

d3.select(xLabelID)
  .attr("background-color", "white")
  .attr("color", "black")

d3.select(yLabelID)
  .attr("background", "white")
  .attr("color", "black")

// function that maps subscript to full feature name
function subToFeature(sub){

     if(sub === "absmag")
        return "Absolute Magnitude";
     else if(sub === "mag")
        return "Apparent Magnitude";
     else if(sub === "ci")
        return "Color Index";
     else
        return "Luminance";

}

// function to update the graph
 function clicking(axis, feature) {
   d3.select(".Count").text(total);

   if(axis === 'y'){
   yLabel = feature;
   ymin = d3.min(rows, function(d){ return +d[yLabel]});
   ymax = d3.max(rows, function(d){ return +d[yLabel]});
   ylim = [ymin, ymax];

   dataY = [];
   rows.forEach(function(d){
     dataY.push(+d[yLabel]);
   });

   y = d3.scaleLinear()
           .nice()
           .domain(ylim)
           .range([graphSize,0]);

   thresholdY = y.ticks(75);

   binsY = d3.histogram()
             .domain(y.domain())
             .thresholds(thresholdY)
             (dataY)

   lineY = [];
   binsY.forEach(function(d,i){
     if(i===0){
       lineY.push([2 * thresholdY[0]- thresholdY[1],d.length/dataY.length]);
     }
     else
     lineY.push([thresholdY[i-1],d.length/dataY.length]);
   });

   yHist = d3.scaleLinear()
             .domain([0, d3.max(binsY, d => d.length)/dataY.length])
             .range([0, chartHeight])

   yArea = d3.area().curve(d3.curveBasis)
              .x(d => y(d[0]))
              .y0(0)
              .y1(d => yHist(d[1]))

   histY.datum(lineY)
        .attr("d",yArea);

   yR = y;
   yRange = ylim;
   }
   else{
   xLabel = feature;
   xmin = d3.min(rows, function(d){ return +d[xLabel]});
   xmax = d3.max(rows, function(d){ return +d[xLabel]});
   xlim = [xmin, xmax];

   x = d3.scaleLinear()
           .nice()
           .domain(xlim)
           .range([0, graphSize]);

   thresholdX = x.ticks(75);

   dataX = [];
   rows.forEach(function(d){
     dataX.push(+d[xLabel]);

   binsX = d3.histogram()
             .domain(x.domain())
             .thresholds(thresholdX)
             (dataX)
   });

   lineX = [];
   binsX.forEach(function(d,i){
     if(i===0){
       lineX.push([2 * thresholdX[0]- thresholdX[1],d.length/dataX.length]);
     }
     else
     lineX.push([thresholdX[i-1],d.length/dataX.length]);
   });

   xHist = d3.scaleLinear()
             .domain([0, d3.max(binsX, d => d.length)/dataX.length])
             .range([0, chartHeight])

   xArea = d3.area().curve(d3.curveBasis)
              .x(d => x(d[0]))
              .y0(0)
              .y1(d => xHist(d[1]))

   histX.datum(lineX)
        .attr("d",xArea);

   xR = x;
   xRange = xlim;
   }

   // inputForRectBinning = []
   // rows.forEach(function(d){
   //   inputForRectBinning.push([x(+d[xLabel]), y(+d[yLabel])])
   // });
   //
   // rectbinData = d3.rectbin()
   //     .dx(tileSize)
   //     .dy(tileSize)
   //     (inputForRectBinning);
   var inputForRectBinning = [];

   rows.forEach(function(d){
     if(+d[yLabel] <= yRange[1] && +d[yLabel] >= yRange[0]){
        if(+d[xLabel] <= xRange[1] && +d[xLabel] >= xRange[0]){
            inputForRectBinning.push([xR(+d[xLabel]), yR(+d[yLabel])]);
          }
    }
   });

   inputForRectBinning.push([0,0]);
   inputForRectBinning.push([graphSize, graphSize]);

   rectbinData = d3.rectbin()
       .dx(tileSize)
       .dy(tileSize)
       (inputForRectBinning);

   tiles.data(rectbinData)
         .attr("x", function(d) { return d.x })
         .attr("y", function(d) { return d.y - tileSize })
         .attr("width", tileSize )
         .attr("height", tileSize )
         .attr("fill", function(d) {
             return color(d.length); })
         .attr("fill-opacity", function(d){
             if(d.length === 0)
               return "0.1";
             return "0.9";
           })

   original = "X Range:(" + xRange[0].toFixed(2) + ", " + xRange[1].toFixed(2)
             + "), Y Range:(" + yRange[0].toFixed(2) + ", " + yRange[1].toFixed(2) + ")";
   textRange = d3.select("h3").text(original);

   textX = subToFeature(xLabel);
   textY = subToFeature(yLabel);

   labelX.text(textX);
   labelY.text(textY);

   axisX.call(d3.axisBottom(x).ticks(10));
   axisY.call(d3.axisLeft(y).ticks(10));
   axisXBrush.call(d3.axisTop(x).ticks(10));
   axisYBrush.call(d3.axisRight(y).ticks(10));

 }


 // function to resize the graph
 function resize(axis, range){

   if(axis === 'y'){

     yRange = [range[1], range[0]];

     yR = d3.scaleLinear()
             .nice()
             .domain(yRange)
             .range([graphSize,0]);
   }else{
     xRange = range;

     xR = d3.scaleLinear()
             .nice()
             .domain(xRange)
             .range([0,graphSize]);
   }

   var inputForRectBinning = [];

   rows.forEach(function(d){
     if(+d[yLabel] <= yRange[1] && +d[yLabel] >= yRange[0]){
        if(+d[xLabel] <= xRange[1] && +d[xLabel] >= xRange[0]){
            inputForRectBinning.push([xR(+d[xLabel]), yR(+d[yLabel])]);
          }
    }
   });

   inputForRectBinning.push([0,0]);
   inputForRectBinning.push([graphSize, graphSize]);

   d3.select(".Count").text(inputForRectBinning.length - 2);
   original = "X Range:(" + xRange[0].toFixed(2) + ", " + xRange[1].toFixed(2)
             + "), Y Range:(" + yRange[0].toFixed(2) + ", " + yRange[1].toFixed(2) + ")";
   textRange = d3.select("h3").text(original);

   rectbinData = d3.rectbin()
       .dx(tileSize)
       .dy(tileSize)
       (inputForRectBinning);

   count = 0;
   tiles.data(rectbinData)
         .attr("x", function(d) { return d.x })
         .attr("y", function(d) { return d.y - tileSize })
         .attr("width", tileSize )
         .attr("height", tileSize )
         .attr("fill", function(d) {
             return color(d.length); })
         .attr("fill-opacity", function(d){
             if(d.length === 0)
               return "0.1";
             return "0.9";
           })

   axisX.call(d3.axisBottom(xR).ticks(10));
   axisY.call(d3.axisLeft(yR).ticks(10));
  }

//function to change page on click
  function loadPage(xLabel, yLabel, xTileRange,
    yTileRange, xBrushRange, yBrushRange){
    var var0 = "labelX=" + xLabel;
    var var1 = "labelY=" + yLabel;
    var var2 = "lowerX=" + xTileRange[0].toString();
    var var3 = "upperX=" + xTileRange[1].toString();
    var var4 = "lowerY=" + yTileRange[0].toString();
    var var5 = "upperY=" + yTileRange[1].toString();
    var var6 = "lowerXBrush=" + xBrushRange[0].toString();
    var var7 = "upperXBrush=" + xBrushRange[1].toString();
    var var8 = "lowerYBrush=" + yBrushRange[0].toString();
    var var9 = "upperYBrush=" + yBrushRange[1].toString();

    var dest = [var0, var1, var2, var3, var4, var5, var6, var7,
                var8, var9].join('&');
    var url = "location_index.html?" + dest;

    window.location = url;
  }


  //preview

var width_pre = 180,
    height_pre = 180;

var Svg_location = d3.select("div#preview")
          .append("svg")
          .attr("width", width_pre)
          .attr("height", height_pre)
          .attr('id', 'location')


function draw_preview(xR_loc, yR_loc){

  loc_circles_bool = true;



  filtered_location_data = rows.filter(d => d[xLabel] > xR_loc[0] && d[xLabel] < xR_loc[1])
  filtered_location_data = filtered_location_data.filter(d => d[yLabel] > yR_loc[0] && d[yLabel] < yR_loc[1])


  var cimax = d3.max(rows, function(d){ return +d.ci});
  var cimin = d3.min(rows, function(d){ return +d.ci});


  var loc_xmax = d3.max(rows, function(d){ return +d.x});
  var loc_ymax = d3.max(rows, function(d){ return +d.y});

  var loc_xmin = d3.min(rows, function(d){ return +d.x});
  var loc_ymin = d3.min(rows, function(d){ return +d.y});
  // console.log('rj',xLabel, xR_loc[0],xR_loc[1], yLabel, yR_loc, filtered_location_data.length)

  //scale

  var x_loc = d3.scaleLinear()
  .domain([loc_xmin, loc_xmax])
  .range([0, width_pre])

  var y_loc = d3.scaleLinear()
  .domain([loc_ymin, loc_ymax])
  .range([height_pre, 0])

  var color = d3.scaleSequential().domain([cimax, cimin]).interpolator(d3.interpolateRdYlBu)

  //draw circle

  loc_circles = Svg_location.append('g')
        .selectAll('circle')
        .data(filtered_location_data)
        .enter()
        .append('circle')
        .attr('cx', d => x_loc(d.x))
        .attr('cy', d => y_loc(d.y))
        .attr('r', 1.5)
        .attr('fill', d => color(d.ci))
        .style('opacity', .8)



}



});
