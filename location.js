d3.csv("hyg_exp.csv", location_chart)


d3.select('div#rangeinfo').text('Lum: ')

featurex = 'ci'
feature_y = 'mag'



function openNav() {
    document.getElementById("mySidebar").style.width = "400px";
    document.getElementById("main").style.marginLeft = "400px";
    var containerWidth = +d3.select('div#chart').style('width').slice(0, -2)
    var containerHeight = +d3.select('div#chart').style('height').slice(0, -2)
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.getElementById("chart").style.marginLeft= "0";
    var containerWidth = +d3.select('div#chart').style('width').slice(0, -2)
    var containerHeight = +d3.select('div#chart').style('height').slice(0, -2)
}



function location_chart(error, rows){
    console.log(rows)
    var ymin = d3.min(rows, function(d){ return +d['lum']});
    console.log(ymin)

    rows = rows.filter(d => d.ci >= 0.2 && d.ci <= 0.9)
    rows = rows.filter(d => d.mag >= 1 && d.mag <= 8)

    //get width of the div
            //http://bl.ocks.org/eesur/909c6a83a1d969918a5389966c5f431a

    var containerWidth = +d3.select('div#chart').style('width').slice(0, -2)
    var containerHeight = +d3.select('div#chart').style('height').slice(0, -2)
    var w = window.innerWidth,
    h = window.innerHeight;
    console.log(containerWidth, containerHeight, w, h)
    
    var width = containerWidth
    var height = width

    console.log(width, height)

    

    //scale the value
    
    var xmax = d3.max(rows, function(d){ return +d.x});
    var ymax = d3.max(rows, function(d){ return +d.y});
    var zmax = d3.max(rows, function(d){ return +d.z});
    var xmin = d3.min(rows, function(d){ return +d.x});
    var ymin = d3.min(rows, function(d){ return +d.y});
    var zmin = d3.min(rows, function(d){ return +d.z});
    var sizemax = d3.max(rows, function(d){ return +d.absmag});
    var sizemin = d3.min(rows, function(d){ return +d.absmag});
    var cimax = d3.max(rows, function(d){ return +d.ci});
    var cimin = d3.min(rows, function(d){ return +d.ci});

    console.log('max', xmax, ymax,zmax, cimax)
    console.log('min', xmin, ymin,zmin, cimin)

    var x0 = [xmin, xmax],
        y0 = [ymin, ymax];
    
    var x_range = [xmin, xmax],
        y_range = [ymin, ymax],
        z_range = [zmin, zmax];
    
    var x = d3.scaleLinear()
                .domain(x0)
                .range([0, width])

    var y = d3.scaleLinear()
                .domain(y0)
                .range([height, 0])

    var z = d3.scaleLinear()
                .domain([zmin, zmax])
                .range([height, 0])

    var x_new = d3.scaleLinear()
                .domain(x0)
                .range([0, width])

    var y_new = d3.scaleLinear()
                .domain(y0)
                .range([height, 0])

    var z_new = d3.scaleLinear()
                .domain([zmin, zmax])
                .range([height, 0])

    var size = d3.scaleLinear()
                .domain([sizemin, sizemax])
                .range([1, 3])

    var size1 = d3.scaleLinear()
                    .domain([sizemin, sizemax])
                    .range([1, 10])

    var color = d3.scaleSequential().domain([cimax, cimin]).interpolator(d3.interpolateRdYlBu)

    // //  // Add brushing
    // var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
    // .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    // .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function




    //draw the chart

    var Svg = d3.select("div#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr('id', 'ssvg')
            // .call(d3.zoom().on("zoom", function () {
            //     Svg.attr("transform", d3.event.transform)
            //  }))

    //zoom

    // Svg.call(d3.zoom()
    //     .extent([[0, 0], [width, height]])
    //     .translateExtent([-10000,-10000], [10000,100000])
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoomed));
    // function zoomed() {
    //     Svg.attr("transform", d3.event.transform);
    //     }
        
    //brush

    var brush = d3.brush().on("end", brushended),
    idleTimeout,
    idleDelay = 350;
    
    Svg.append("g")
    .attr("class", "brush")
    .call(brush);

    Svg.selectAll(".domain")
    .style("display", "none");

    var x_ratio = 1,
        y_ratio = 1;

    function brushended() {
        var s = d3.event.selection;
        if (!s) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
          x_new.domain(x_range);
          y_new.domain(y_range);
          x_ratio = 1;
          y_ratio = 1;
          
        } else {
          x_new.domain([s[0][0], s[1][0]].map(x_new.invert, x_new));
          y_new.domain([s[1][1], s[0][1]].map(y_new.invert, y_new));
          console.log('s',s)
          Svg.select(".brush").call(brush.move, null);
          x_ratio = width / Math.abs(s[0][0] - s[1][0]);
          y_ratio = height / Math.abs(s[1][1] - s[0][1]);
          console.log('ratio', x_ratio,y_ratio)
          if(x_ratio > 10){x_ratio = 10}
        }
        zoom(s, x_ratio, y_ratio);
        
      }
      
    function idled() {
        idleTimeout = null;
    }
    
    function zoom(s, x_ratio, y_ratio) {
        var t = Svg.transition().duration(1000);
        // svg.select(".axis--x").transition(t).call(xAxis);
        // svg.select(".axis--y").transition(t).call(yAxis);
        Svg.selectAll("circle").transition(t)
            .attr("cx", function(d) { return x_new(d.x); })
            .attr("cy", function(d) { return y_new(d.y); });
        if (!s) {
                Svg.selectAll("circle").transition(t)
                .attr('r', d=> size(d.absmag));
            } 
            else {
                Svg.selectAll("circle").transition(t)
                .attr('r', d=> size(d.absmag) * x_ratio) * 0.7;
            }
    }

    function zoom_size() {
        var t = Svg.transition().duration(1000);
        Svg.selectAll("circle").transition(t)
             .attr('r', d=> size(d.absmag));
    }

    function zoom_sizechange() {
        var t = Svg.transition().duration(1000);
        Svg.selectAll("circle").transition(t)
             .attr('r', d=> size1(d.absmag));
    }
    
    
    //draw circles
                
   circles = Svg.append('g')
        .selectAll('circle')
        .data(rows)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', d=> size(d.absmag))
        .attr('fill', d => color(d.ci))
        .style('opacity', .8)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
    
    // circles.append("g")
    //     .attr("class", "brush")
    //     .call(brush);
                

   function handleMouseOver (d,i){
        d3.select(this).attr('stroke', 'yellow');

        // Specify where to put label of text
        Svg.append("text")
            .attr('id', "t" + i)
            .attr("x", x(d.x) )
            .attr('y', y(d.y) )
            .text(d.id)
            .style('fill', 'white');
   }

   function handleMouseOut(d,i){
       d3.select(this).attr("stroke",'transparent');

       d3.select("#t" + i).remove();  
   }

   //star position

   var width_po = 200,
        height_po = 200;

    var x_po = d3.scaleLinear()
        .domain(x0)
        .range([0, width_po])

    var y_po = d3.scaleLinear()
            .domain(y0)
            .range([height_po, 0])

    var z_po = d3.scaleLinear()
            .domain([zmin, zmax])
            .range([height_po, 0])

    var size = d3.scaleLinear()
            .domain([sizemin, sizemax])
            .range([1, 3])

   var Svg_po = d3.select("div#star_position")
                .append("svg")
                .attr("width", width_po)
                .attr("height", height_po)
                .attr('id', 'ssvg')

    po_circles = Svg_po
        .selectAll('circle')
        .data(rows)
        .enter()
        .append('circle')
        .attr('cx', d => x_po(d.x))
        .attr('cy', d => y_po(d.y))
        .attr('r', 1)
        .attr('fill', d => color(d.ci))


   //star navigator
   var Svg_nav = d3.select("div#star_navigator")
                .append("svg")
                .attr("width", width_po)
                .attr("height", height_po)
                .attr('id', 'ssvg')

    nav_circle = Svg_nav.append('g')
        .selectAll('circle')
        .data(rows)
        .enter()
        .append('circle')
        .attr('cx', d => x_po(d.x))
        .attr('cy', d => z_po(d.z))
        .attr('r', 1)
        .attr('fill', d => color(d.ci))

  
    
    //brush from the navigator

    var brush_width1 = 0,
    brush_width2 = 200;

    var selected_x = x.domain()
    console.log('selected x', selected_x)

    const brush_po = d3.brush()
    .filter(() => !d3.event.ctrlKey
        && !d3.event.button
        && (d3.event.metaKey
        || d3.event.target.__data__.type !== "overlay"))
    .on("start brush end", brushed_po);

    Svg_po.append("g")
      .attr("class", "brush")
      .call(brush_po)
      .call(brush_po.move, [[30, 30], [170, 170]])
      .call(g => g.select(".overlay").style("cursor", "default"));

    function brushed_po() {
        const selection = d3.event.selection;
        if (selection === null) {
        circles.attr("stroke", null);
        } else {
        const [[x_0, y_0], [x_1, y_1]] = selection;
        // console.log('brush', selection)

        xpo_range = [x_0, x_1];
        ypo_range = [y_1, y_0];
        // console.log('xrange', xpo_range)
        // console.log('yrange', ypo_range)
        x_range = xpo_range.map(x_po.invert)
        y_range = ypo_range.map(y_po.invert)
        x0 = x_range;
        y0 = y_range;
        console.log('x_range', x_range, y_range)
    
        // circles.attr("fill", (d) => {
        //     return x0 <= x_po(d.x) && x_po(d.x) <= x1
        //         && y0 <= y_po(d.y) && y_po(d.y) <= y1
        //         ? color(d.ci) : null;
        // });

        redraw(x_range, y_range, z_range);
        }
    }


    const brush_nav = d3.brush()
    .filter(() => !d3.event.ctrlKey
        && !d3.event.button
        && (d3.event.metaKey
        || d3.event.target.__data__.type !== "overlay"))
    .on("start brush end", brushed_nav);

    Svg_nav.append("g")
      .attr("class", "brush")
      .call(brush_nav)
      .call(brush_nav.move, [[brush_width1, 20], [brush_width2, 180]])
      .call(g => g.select(".overlay").style("cursor", "default"));

    function brushed_nav() {
        const selection = d3.event.selection;
        if (selection === null) {
        circles.attr("stroke", null);
        } else {
        var [[x0, y0], [x1, y1]] = selection;
        xpo_range = [x0, x1];
        zpo_range = [y1, y0]
        x_range = xpo_range.map(x_po.invert)
        z_range = zpo_range.map(z_po.invert)
        console.log('zrange', z_range)
        // circles.attr("fill", (d) => {
        //     return x0 <= x_po(d.x) && x_po(d.x) <= x1
        //         && y0 <= z_po(d.z) && z_po(d.z) <= y1
        //         ? color(d.ci) : null;
        // });

        redraw(x_range, y_range, z_range);
        }
    }

    function redraw(x_range, y_range, z_range){

        

        x0 = x_range[0]
        x1 = x_range[1]
        y0 = y_range[0]
        y1 = y_range[1]
        z0 = z_range[0]
        z1 = z_range[1]

        console.log(x0, x1, y0, y1, z0, z1)
        

        var data_filtered = rows.filter(d=> d.x >= x0 && d.x <= x1
                                    && d.y >= y0 && d.y <= y1
                                    && d.z >= z0 && d.z <= z1)

                                    

        console.log(data_filtered)

        x_new = d3.scaleLinear()
                    .domain(x_range)
                    .range([0, width])

        y_new = d3.scaleLinear()
                    .domain(y_range)
                    .range([height, 0])
        console.log('redraw', data_filtered)

        circles.remove();

        function loadPage(){
            window.location = "https://www.w3schools.com";
        }

        circles = Svg.append('g')
            .selectAll('circle')
            .data(data_filtered)
            .enter()
            .append('circle')
            .attr('cx', d => x_new(d.x))
            .attr('cy', d => y_new(d.y))
            .attr('r', d=> size(d.absmag))
            .attr('fill', d => color(d.ci))
            .style('opacity', .8)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on('click', loadPage)


    }

    



   //reference: http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
}

