import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'svg',
  fisheye: null,
  svg: null,
  force: null,
  setupViz: function () {
    var force = this.get("force");
    force = d3.layout.force().charge(-120).linkDistance(30);
    this.set("force", force);
  }.on('init'),
  didInsertElement: function () {
    var fisheye = d3.fisheye.circular().radius(120);
    var id = this.get("id");
    var w = this.get("width");
    var h = this.get("height");
    var graph = this.get("graph");
    var svg = this.get("svg");
    //svg = d3.select("#"+id).attr('width', w).attr('height', h);

    svg = d3.select("#" + id).attr('width', w).attr('height', h).append("g").call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom)).append("g");
    //var container = svg.append('g');
    //svg = container;
    function zoom() {
      //alert("hi");
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    svg.on("mousemove", function () {
      fisheye.focus(d3.mouse(this));
    });
    //var min_zoom = 0.1;
    //var max_zoom = 7;
    //var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]);
    //svg.call(zoom);

    var force = this.get("force");
    force.size([w, h]);
    var color = d3.scale.category20();
    force.nodes(graph.nodes).links(graph.links).start();
    var link = svg.selectAll(".link")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", function (d) {
        return Math.sqrt(d.value);
      });


    // Create the groups under svg
    var gnodes = svg.selectAll('g.gnode').data(graph.nodes).enter().append('g').classed('gnode', true);

    //Toggle stores whether the highlighting is on
    var toggle = 0;
    //Create an array logging what is connected to what
    var linkedByIndex = {};
    for (var i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[i + "," + i] = 1;
    }
    graph.links.forEach(function (d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
    }

    function connectedNodes() {
      if (toggle === 0) {
        //Reduce the opacity of all but the neighbouring nodes
        var d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
          return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
          return d.index === o.source.index | d.index === o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
      } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
      }
    }

    // Add one circle in each group
    var node = gnodes.append("circle").attr("class", "node").attr("r", function (d) {
      return Math.max(5, d.score / 5000000);
    }).style("fill", function (d) {
      return color(d.color);
    }).call(force.drag).on('dblclick', connectedNodes);
    // Append the labels to each group

    //node.append("title").text("test");

    force.on("tick", function () {
      link.attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });


      // Translate the groups
      gnodes.attr("transform", function (d) {
        return 'translate(' + [d.x, d.y] + ')';
      });
    });


    svg.on("mousemove", function () {
      fisheye.focus(d3.mouse(this));

      gnodes.each(function (d) {
          d.fisheye = fisheye(d);
        })
        .attr("transform", function (d) {
          return 'translate(' + [d.fisheye.x, d.fisheye.y] + ')';
        });
      node.each(function (d) {
          d.fisheye = fisheye(d);
        })
        .attr("r", function (d) {
          return d.fisheye.z * Math.log(d.score);
        });

      /*lables.each(function(d) { d.fisheye = fisheye(d); })
       .attr("dx", function(d) { return d.fisheye.dx; })
       .attr("dy", function(d) { return d.fisheye.dy; })*/


      link.attr("x1", function (d) {
          return d.source.fisheye.x;
        })
        .attr("y1", function (d) {
          return d.source.fisheye.y;
        })
        .attr("x2", function (d) {
          return d.target.fisheye.x;
        })
        .attr("y2", function (d) {
          return d.target.fisheye.y;
        });
    });

    force.start();
  }
});
