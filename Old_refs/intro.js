
// var width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
// var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
// //var svg = d3.select("body").append("svg").attr("height", "100%").attr("width", "100%");
//var margin = {top: 20, right: 10, bottom: 20, left: 10};
// //var width = 900;
// //var height = width;

// console.log("width", width)
// console.log("height", height)
// //var length = 960;
// // var width = length - margin.left - margin.right,
// //     height = length - margin.top - margin.bottom;

// if (width > height){ width = height} else {height = width}
// console.log("new width", width)
// console.log("new height", height)

win_size = 966;
width = win_size;
height = win_size;

// DEFINE FUNCTIONS: FORMA, COLOR, PACK
format = d3.format(",d")

// color = d3.scaleLinear()
//     .domain([0, 3])
//     .range(["hsl(300,70%,90%)", "hsl(350,70%,50%)"])
//     .interpolate(d3.interpolateHcl)

color = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 20])
console.log(color(10));

function color_count(datacount) {
    if (datacount > 700)datacount = 700;
    if (datacount < 100)datacount = 100;

    c = d3.scaleLinear()
    .domain([1, 970])
    .range(["hsla(0,0%,100%,0.2)", "hsla(0,0%,100%,0.6)"])
    .interpolate(d3.interpolateHcl)

    return c(datacount)

}



// color_count = d3.scaleLinear()
//     .domain([1, 970])
//     .range(["#FFD1EA", '#FF4AAD'])
//     .interpolate(d3.interpolateHcl)


//     function innercolor(p_index, count) {
//         inner_color = d3.scaleLinear()
//                         .domain([0, 970])
//                         .range(["white", color(p_index)])
//                         .interpolate(d3.interpolateHcl)
//         return inner_color(count);
// }
// console.log("inner", innercolor(16, 800));

pack = data => d3.pack()
    .size([width, height])
    .padding(3)
    (d3.hierarchy(data)
    .sum(d => d.count)
    .sort((a, b) => b.count - a.count))

 // GET DATA
d3.json("tree_ds.json").get(function(error, data){
    console.log("DATA", data);
    console.log("test", data)
    console.log("test", data.children[0])
    console.log("test", data.children[0].children[0].count)
    console.log("parent", data.children[0].children.parent)
const root = pack(data);
console.log(root);
let focus = root;
let view;

console.log("H", d3.hierarchy(data));

//margin = ({top: 20, right: 3, bottom: 3, left: 40})
//aspectRatio = "1:1";

const svg0 = d3.select("h4")
    .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    //.attr("viewBox", '0 0' + aspectRatio.split(':').join(''))
    .attr("width","100%").attr("height","100%")
    .style("display", "block")
    // .style("margin", "0 -14px")
    // .style("background", color(0))
    // .style("stroke", "blue")
    .style("background", "white");

const svg = d3.select("div")
    .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    //.attr("viewBox", '0 0' + aspectRatio.split(':').join(''))
    .attr("viewBox", `-${win_size / 2} -${win_size / 2} ${win_size} ${win_size}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .classed("svg-content", true)
    .style("display", "block")
    // .style("margin", "0 -14px")
    // .style("background", color(0))
    // .style("stroke", "blue")
    .style("background", "white")
    .style("cursor", "pointer")
    .on("click", () => zoom(root));

d3.select("svg").attr("align", "center");
//.css({top: 200, left: 200, position:'absolute'});

// var svg_selectd = d3.select('svg');
// d3.select(window)
//   .on("resize", function() {
//     var targetWidth = chart.node().getBoundingClientRect().width;
//     var targetHeight = chart.node().getBoundingClientRect().Height;
//     if (targetWidth > targetHeight){ targetWidth = targetHeight} else {targetHeight = targetWidth}
//     svg_selectd.attr("width", targetWidth);
//     svg_selectd.attr("height", targetWidth);

//   });
var message = "In the discipline of _____, designers are learning: "

const title = svg0.append("text")
              .text(message)
              .attr("y","80%")
              .attr("dominant-baseline", "top")
              .style("text-anchor", "start")
              .style("fill", "black")
              .style("fill-opacity", 1)
              .style("font", "24px sans-serif");


const node = svg.append("g").style("align"," center")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .selectAll("circle")
    //.style("background", color(0))
    .data(root.descendants().slice(1))
    .enter().append("circle")
    // .attr("fill", d => d.children ? color(d.depth) : "white")
    // .attr("fill", d => color(d.depth))
    .attr("fill", (d,i) => d.parent === root ? color(i) : color_count(d.data.count))
    //.attr("fill", (d,i) => color(d.depth))
    .attr("pointer-events", d => !d.children ? "none" : null)
    .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
    .on("mouseout", function() { d3.select(this).attr("stroke", null); })
    .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));

const label = svg.append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("font", "14px sans-serif")
    .style("align"," center")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().slice(1))
        .enter().append("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        // .style("stroke", d =>"purple" )
        .style("font-size", d => d.parent === root ? "18" : (d.r/d.parent.r)*100)
        //.attr("stroke",(d,i) => d.parent === root ? color(i) : color_count(d.data.count))
        .attr("stroke",d => d.parent === root ? "grey": "#451943")
        // .text(d => d.data.name);
        .text(d => d.parent === root? d.data.name: d.data.name);

function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
}

function zoom(d) {
    const focus0 = focus;

    focus = d;

    if(focus.depth === 1){
      message = "In " + focus.data.name.toUpperCase() + ", designers are learning:";
      title.transition().duration(800).text(message);
    }
    else{
      message = "In the discipline of ____, designers are learning: ";
      title.transition().duration(800).text(message);
    }

    const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return t => zoomTo(i(t));
        });

    label
    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });



}

zoomTo([root.x, root.y, root.r * 2]);
});
