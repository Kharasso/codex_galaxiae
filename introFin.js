d3.csv("hyg_exp.csv", function(error, rows){
  if(error) throw error;

  var total = rows.length;
  var margin = {top: 30, right: 90, bottom: 160, left: 300},
      tileSize = 24,
      numberOfTiles = 20,
      graphSize = tileSize * numberOfTiles;

  var xLabel = "lum",
      yLabel = "mag";

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

  d3.select("h2").text(rows.length);

  var x = d3.scaleLinear()
            .nice()
            .domain(xlim)
            .range([0, graphSize]);

  var y = d3.scaleLinear()
            .nice()
            .domain(ylim)
            .range([graphSize, 0]);

  //x, y scaler variables for resizing
  // var xR = d3.scaleLinear()
  //           .nice()
  //           .domain(xlim)
  //           .range([0, graphSize]);
  //
  // var yR = d3.scaleLinear()
  //           .nice()
  //           .domain(ylim)
  //           .range([graphSize, 0]);
  var xR = x;
  var yR = y;

  //x, y range variables for resizing
  var xRange = xlim;
  var yRange = ylim;

  var inputForRectBinning = []
  rows.forEach(function(d){

    inputForRectBinning.push([x(+d[xLabel]), y(+d[yLabel])])
  });
  inputForRectBinning.push([graphSize, graphSize]);

  // var valueDivX = (xlim[1] - xlim[0]) / numberOfTiles;
  // var valueDivY = (ylim[1] - ylim[0]) / numberOfTiles;
  var binning = d3.bin()
                  .size([graphSize, graphSize])
                  .side(tileSize)

  var rectbinData = d3.rectbin()
      .dx(tileSize)
      .dy(tileSize)
      (inputForRectBinning);

  var bins = binning(inputForRectBinning);

  console.log(bins);
  var color = d3.scaleLinear()
        .domain([0,10])
        .range(["#ffffcc", "#e31a1c"]);

// setting up the 2D histogram with rectangles
  svg.append("clipPath")
     .attr("id", "clip")
     .append("rect")
     .attr("width", graphSize)
     .attr("height", graphSize);

  console.log(rectbinData.length);

  const tiles = svg.append("g").attr("clip-path", "url(#clip)")
                   .selectAll("myRect")
                   .data(rectbinData)
                   .enter()
                   .append("rect")
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
                     if(d.length === 0){
                       d3.select(this).attr("fill-opacity","0.9");
                       d3.select(this).attr("fill", "white");
                       d3.select("h2").text(0);
                     }
                     else{
                     d3.select("h2").text(d.length);
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

 // adding X axis
 var axisX = svg.append("g")
               .attr("class", "axis")
               .attr("transform", "translate(0,"+graphSize+")")
               .call(d3.axisBottom(x).ticks(10))

 var labelX = svg.append("g")
               .append("text")
               .attr("text-anchor", "middle")
               .attr("font-size","14px")
               .attr("x", graphSize/2)
               .attr("y", graphSize + 48)
               .attr("fill", "#d3d3d3")
               .text("Luminance")

 // adding Y axis
 var axisY = svg.append("g")
               .attr("class", "axis")
               .call(d3.axisLeft(y).ticks(10))


 var labelY = svg.append("g")
               .append("text")
               .attr("text-anchor", "middle")
               .attr("font-size","14px")
               .attr("x", -graphSize/2)
               .attr("y", -36)
               .attr("fill", "#d3d3d3")
               .attr("transform", "rotate(-90)")
               .text("Apparent Magnitude")


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
// var bandwidth = 0.1;
// density = kde(epanechnikov(bandwidth), x.ticks(100), dataX);
// console.log(dataX.length);
// console.log(d3.max(binsX, d => d.length)/dataX.length);
// console.log(binsX);
var lineX = [];
binsX.forEach(function(d,i){
  // console.log([+d[columnName]]);
  if(i===0){
    lineX.push([2 * thresholdX[0]- thresholdX[1],d.length/dataX.length]);
  }
  else
  lineX.push([thresholdX[i-1],d.length/dataX.length]);
});

var lineY = [];
binsY.forEach(function(d,i){
  // console.log([+d[columnName]]);
  if(i===0){
    lineY.push([2 * thresholdY[0]- thresholdY[1],d.length/dataY.length]);
  }
  else
  lineY.push([thresholdY[i-1],d.length/dataY.length]);
});

//
// console.log(threshold.length);
//   console.log(binsX.length);
var xHist = d3.scaleLinear()
              // .domain([0, d3.max(binsX, d => d.length)/dataX.length])
              .domain([0, d3.max(binsX, d => d.length)/dataX.length])
              .range([0, chartHeight])

var yHist = d3.scaleLinear()
              .domain([0, d3.max(binsY, d => d.length)/dataY.length])
              .range([0, chartHeight])
// // line constructor
// var xline = d3.line().curve(d3.curveBasis)
//            .x(d => x(d[0]))
//            .y(d => xhist(d[1]))

// area constructor
var xArea = d3.area().curve(d3.curveBasis)
             .x(d => x(d[0]))
             .y0(0)
             .y1(d => xHist(d[1]))
// console.log("d0");
// console.log(lineX[0]);
// console.log(x(lineX[0][0]));
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
            .attr("transform", "translate(0, "+(graphSize+90)+")");

const histY = svg.append("g").attr("class","histo histo-y")
            .datum(lineY)
            .append("path")
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", "0")
            .attr("d", yArea(lineY))
            .attr("transform", "translate(-90, 0),rotate(90)");

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
// interval = thresholdX.every(12);
const defaultSelection = [0, graphSize];
var currentXSelection = defaultSelection;
var currentYSelection = defaultSelection;

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
      console.log(d3.event.selection);

      const selection = [ Math.round(d3.event.selection[0]/roundFactor) * roundFactor,
                          Math.round(d3.event.selection[1]/roundFactor) * roundFactor];
      // console.log(selection);
      const d0 = selection.map(x.invert);
      // console.log(d0)
      // const d1 = d0.map(interval.round);
      //
      if(d0[0] === d0[1]){
        d0[1] = d0[0] + roundFactor;
      }
      //
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
      console.log(selection);
      const d0 = selection.map(y.invert);
      // console.log(d0)
      // const d1 = d0.map(interval.round);
      //
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
    // const selection = this.children[1];
    // console.log(selection);
    // const windowWidth = selection.width.baseVal.value;
    // const dx = windowWidth; // Use a fixed width when recentering.
    // const [cx] = d3.mouse(this);
    // const [x0, x1] = [cx - dx / 2, cx + dx / 2];
    // const [X0, X1] = [0, graphSize];
    // d3.select(this.parentNode)
    //     .call(brushX.move, x1 > X1 ? [X1 - dx, X1]
    //         : x0 < X0 ? [X0, X0 + dx]
    //         : [x0, x1]);
}

function brushendedY() {
    if (!d3.event.selection) {
      brushGroupY.call(brushY.move, currentYSelection);
    }
}
// function beforebrushstartedX() {
//   console.log("outer")
//   console.log(d3.event.selection);
//   const selection = this.parentNode.children[1];
//   const windowWidth = selection.width.baseVal.value;
//   const dx = windowWidth; // Use a fixed width when recentering.
//   const [cx] = d3.mouse(this);
//   const [x0, x1] = [cx - dx / 2, cx + dx / 2];
//   const [X0, X1] = [0, graphSize];
//   d3.select(this.parentNode)
//       .call(brushX.move, x1 > X1 ? [X1 - dx, X1]
//           : x0 < X0 ? [X0, X0 + dx]
//           : [x0, x1]);
// }

//
// function beforebrushstartedY() {
//   const selection = d3.brushSelection(brushY);
//   const dx = y(selection[1]) - y(selection[0]); // Use a fixed width when recentering.
//   const [cx] = d3.mouse(this);
//   const [x0, x1] = [cx - dx / 2, cx + dx / 2];
//   const [X0, X1] = y.range();
//   d3.select(this.parentNode)
//       .call(brush.move, x1 > X1 ? [X1 - dx, X1]
//           : x0 < X0 ? [X0, X0 + dx]
//           : [x0, x1]);
// }
//
const brushGroupX = svg.append("g")
                 .attr("class","brush-x")
                 .call(brushX)
                 .call(brushX.move, defaultSelection)
                 // .call(g => g.select(".overlay")
                 //  // .datum({type: "selection"})
                 //  .on("mousedown touchstart", beforebrushstartedX))
                 .attr("transform", "translate(0, "+(graphSize+90)+")");

const brushGroupY = svg.append("g")
                  .attr("class","brush-y")
                  .call(brushY)
                  .call(brushY.move, defaultSelection)
                  // .call(g => g.select(".overlay")
                  //   .datum({type: "selection"})
                  //   .on("mousedown touchstart", beforebrushstartedY))
                  .attr("transform", "translate(-90, 0),rotate(90)");
// var brushMargin = {top: 10, right: 0, bottom: 20, left: 0};
// const brush = d3.brushX()
//                 .extent([[margin.left, margin.top],[graphSize - margin.right, chartHeight - margin.bottom]])
//                 .on("start brush end", brushed);



// kde function
// function kde(kernel, thresholds, data){
//   return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
// }

// the Epanechnikov Kernel function
// function epanechnikov(bandwidth){
//   return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
// }

// Setting Y axis buttons
 d3.selectAll(".simple-button-y")
   .on("click",function () {
     // console.log("i");
     var value = d3.select(this).property("value");
     brushGroupY.call(brushY.move, defaultSelection);
     clicking('y', value);});

// Setting X axis buttons
d3.selectAll(".simple-button-x")
  .on("click",function () {
    // console.log("i");
    var value = d3.select(this).property("value");
    brushGroupX.call(brushX.move, defaultSelection);
    clicking('x', value);});

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
   // console.log(feature);
   // var num = Math.floor(Math.random() * Math.floor(476));
   d3.select("h2").text(total);

   if(axis === 'y'){
   // console.log(columnName);
   yLabel = feature;
   ymin = d3.min(rows, function(d){ return +d[yLabel]});
   ymax = d3.max(rows, function(d){ return +d[yLabel]});
   ylim = [ymin, ymax];

   dataY = [];
   rows.forEach(function(d){
     // console.log([+d[columnName]]);
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
     // console.log([+d[columnName]]);
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
     // console.log([+d[columnName]]);
     dataX.push(+d[xLabel]);

   binsX = d3.histogram()
             .domain(x.domain())
             .thresholds(thresholdX)
             (dataX)
   });

   lineX = [];
   binsX.forEach(function(d,i){
     // console.log([+d[columnName]]);
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

   }

   xR = x;
   yR = y;

   //x, y range variables for resizing
   xRange = xlim;
   yRange = ylim;

   inputForRectBinning = []
   rows.forEach(function(d){
     // console.log([+d[columnName]]);
     inputForRectBinning.push([x(+d[xLabel]), y(+d[yLabel])])
   });

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

   textX = subToFeature(xLabel);
   textY = subToFeature(yLabel);

   labelX.text(textX);
   labelY.text(textY);

   axisX.call(d3.axisBottom(x).ticks(10));
   axisY.call(d3.axisLeft(y).ticks(10));

 }


 // function to resize the graph
 function resize(axis, range){
   // console.log(range);

   if(axis === 'y'){
     // console.log(columnName);

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
     // console.log([+d[columnName]]);
     if(+d[yLabel] <= yRange[1] && +d[yLabel] >= yRange[0]){
        if(+d[xLabel] <= xRange[1] && +d[xLabel] >= xRange[0]){
            inputForRectBinning.push([xR(+d[xLabel]), yR(+d[yLabel])]);
          }
    }
   });

   inputForRectBinning.push([0,0]);
   inputForRectBinning.push([graphSize, graphSize]);
   // console.log(yRange);
   // console.log(xRange);
   // console.log(inputForRectBinning);
   // console.log([xR(xRange[0]), xR(xRange[1])]);
   // console.log([yR(yRange[0]), yR(yRange[1])]);
   // console.log([Math.min(inputX), Math.max(inputX)]);
   // console.log([Math.min(inputY), Math.max(inputY)]);
   var rectbinData = d3.rectbin()
       .dx(tileSize)
       .dy(tileSize)
       (inputForRectBinning);

   console.log(rectbinData.length);
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

});
