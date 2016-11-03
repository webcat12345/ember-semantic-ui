import Ember from 'ember';
var color = ["#3b5998", "#FF0000", "#00FF00", "#FFFF00", "#66CCFF", "#FF00FF", "#C0C0C0"];

var DATA = [
  {age: '<5', population: 2704659},
  {age: '5-13', population: 4499890},
  {age: '14-17', population: 2159981},
  {age: '18-24', population: 3853788},
  {age: '25-44', population: 14106543},
  {age: '45-64', population: 8819342},
  {age: '≥65', population: 612463}
];

var treeData = {
  name: "/",
  contents: [{
    name: "Applications",
    contents: [{
      name: "Mail.app"
    }, {
      name: "iPhoto.app"
    }, {
      name: "Keynote.app"
    }, {
      name: "iTunes.app"
    }, {
      name: "XCode.app"
    }, {
      name: "Numbers.app"
    }, {
      name: "Pages.app"
    }]
  }, {
    name: "System",
    contents: []
  }, {
    name: "Library",
    contents: [{
      name: "Application Support",
      contents: [{
        name: "Adobe"
      }, {
        name: "Apple"
      }, {
        name: "Google"
      }, {
        name: "Microsoft"
      }]
    }, {
      name: "Languages",
      contents: [{
        name: "Ruby"
      }, {
        name: "Python"
      }, {
        name: "Javascript"
      }, {
        name: "C#"
      }]
    }, {
      name: "Developer",
      contents: [{
        name: "4.2"
      }, {
        name: "4.3"
      }, {
        name: "5.0"
      }, {
        name: "Documentation"
      }]
    }]
  }, {
    name: "opt",
    contents: []
  }, {
    name: "Users",
    contents: [{
      name: "pavanpodila"
    }, {
      name: "admin"
    }, {
      name: "test-user"
    }]
  }]
};

function visit(parent, visitFn, childrenFn) {
  if (!parent) {
    return;
  }
  visitFn(parent);
  var children = childrenFn(parent);
  if (children) {
    var count = children.length;
    for (var i = 0; i < count; i++) {
      visit(children[i], visitFn, childrenFn);
    }
  }
}

export default Ember.Component.extend({
  tagName: 'svg',
  didInsertElement: function () {
    // build the options object
    var options = {
      nodeRadius: 5,
      fontSize: 12
    };

    var id = this.$().attr('id');


    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    visit(treeData, function (d) {
      totalNodes++;
      maxLabelLength = Math.max(d.name.length, maxLabelLength);
    }, function (d) {
      return d.contents && d.contents.length > 0 ? d.contents : null;
    });
    // size of the diagram
    var size = {
      //   width: _this.$(containerName).outerWidth(),
      width: 400,
      height: totalNodes * 15
    };
    var tree = d3.layout.tree().sort(null).size([size.height, size.width - maxLabelLength * options.fontSize]).children(function (d) {
      return (!d.contents || d.contents.length === 0) ? null : d.contents;
    });
    var nodes = tree.nodes(treeData);
    var links = tree.links(nodes);
    /*

     <svg>

     <g class="container"/>

     </svg>

     */
    var layoutRoot = d3.select("#" + id).append("svg:svg").attr("width", size.width).attr("height", size.height).append("svg:g").attr("class", "container").attr("transform", "translate(" + maxLabelLength + ",0)");
    // Edges between nodes as a <path class="link"/>
    var link = d3.svg.diagonal().projection(function (d) {
      return [d.y, d.x];
    });
    layoutRoot.selectAll("path.link").data(links).enter().append("svg:path").attr("class", "link").attr("d", link);
    /*

     Nodes as

     <g class="node">

     <circle class="node-dot"/>

     <text/>

     </g>

     */
    var nodeGroup = layoutRoot.selectAll("g.node").data(nodes).enter().append("svg:g").attr("class", "node").attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
    nodeGroup.append("svg:circle").attr("class", "node-dot").attr("r", options.nodeRadius);
    nodeGroup.append("svg:text").attr("text-anchor", function (d) {
      return d.children ? "end" : "start";
    }).attr("dx", function (d) {
      var gap = 2 * options.nodeRadius;
      return d.children ? -gap : gap;
    }).attr("dy", 3).text(function (d) {
      return d.name;
    });
  }
});
