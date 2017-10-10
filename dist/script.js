
var circleFill = function(d) {
  if (d['color']) {
    return d.color;
  } else {
    return d.children ? color(d.depth) : '#FFF';
  }
}
var calculateTextFontSize = function(d) {
  var id = d3.select(this).text();
  var radius = 0;
  if (d.fontsize){
    //if fontsize is already calculated use that.
    return d.fontsize;
  }
  if (!d.computed ) {
    //if computed not present get & store the getComputedTextLength() of the text field
    d.computed = this.getComputedTextLength();
    if(d.computed != 0){
      //if computed is not 0 then get the visual radius of DOM
      var r = d3.selectAll("#" + id).attr("r");
      //if radius present in DOM use that
      if (r) {
        radius = r;
      }
      //calculate the font size and store it in object for future
      d.fontsize = (2 * radius - 8) / d.computed * 24 + "px";
      return d.fontsize;  
    }
  }
}

var margin = 20,
  diameter = 960;

var color = d3.scale.linear()
  .domain([-1, 18])
  .range(["hsl(0,0%,100%)", "hsl(228,30%,40%)"])
  .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
  .padding(2)
  .size([diameter - margin, diameter - margin])
  .value(function(d) {
    return d.size;
  })

var svg = d3.select("body").append("svg")
  .attr("id", "packedCircle1")
  .attr("width", 800)
  .attr("height", 800)
  .append("g")
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var focus = root,
  nodes = pack.nodes(root),
  view;

var circle = svg.selectAll("circle")
  .data(nodes)
  .enter().append("circle")
  .attr("class", function(d) {
    return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
  })
  .style("fill", circleFill)
  .attr("r", function(d) {
    return d.r;
  })
  .attr("id", function(d) {
    return d.name;
  })
  .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); })
;

circle.append("svg:title")
  .text(function(d) {
    return d.name;
  })

var text = svg.selectAll("text")
  .data(nodes)
  .enter().append("text")
  .attr("class", "label")
  .style("fill-opacity", function(d) {
    return d.parent === root ? 1 : 0;
  })
  .style("display", function(d) {
   return d.parent === root ? null : "none";
  })
  .text(function(d) {
    return d.name;
  })
  .style("font-size", calculateTextFontSize)
  .attr("dy", ".35em");

var node = svg.selectAll("circle,text");;

d3.select("body")
  .style("background", color(-1))
  .on("click", function() {
    zoom(root);
  });

zoomTo([root.x, root.y, root.r * 2 + margin]);

function zoom(d) {
  var focus0 = focus;
  focus = d;

  var transition = d3.transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .tween("zoom", function(d) {
      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
      return function(t) {
        zoomTo(i(t));
      };
    });

  transition.selectAll("text")
    .filter(function(d) {
      return d.parent === focus || this.style.display === "inline";
    })
    .style("fill-opacity", function(d) {
      return d.parent === focus ? 1 : 0;
    })
    .each("start", function(d) {
      if (d.parent === focus) this.style.display = "inline";
    })
    .each("end", function(d) {
      if (d.parent !== focus) this.style.display = "none";
    });
    setTimeout(function() {
      d3.selectAll("text").filter(function(d) {
        return d.parent === focus || this.style.display === "inline";
      }).style("font-size", calculateTextFontSize);
    }, 500)
}

function zoomTo(v) {
  var k = diameter / v[2];
  view = v;
  node.attr("transform", function(d) {
    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
  });
  circle.attr("r", function(d) {
    return d.r * k;
  });
}

