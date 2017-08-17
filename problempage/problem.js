var width = 500,
height = 500;

var centroid = d3.geo.path()
.projection(function(d) { return d; })
.centroid;

var projection = d3.geo.orthographic()
.scale(height / 2.0)
.translate([width / 2, height / 2])
.clipAngle(90);

var path = d3.geo.path()
.projection(projection);

var graticule = d3.geo.graticule()
.extent([[-180, -90], [180 - .1, 90 - .1]]);

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

svg.append("circle")
.attr("class", "world-outline")
.attr("cx", width / 2)
.attr("cy", height / 2)
.attr("r", projection.scale());

var rotate = d3_geo_greatArcInterpolator();

d3.json("https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json", function(error, world) {
var countries = topojson.object(world, world.objects.countries).geometries,
  i = -1,
  n = countries.length;

projection.clipAngle(180);

var backLine = svg.append("path")
  .datum(graticule)
  .attr("class", "back-line")
  .attr("d", path);

var backCountry = svg.selectAll(".back-country")
  .data(countries)
.enter().insert("path", ".back-line")
  .attr("class", "back-country")
  .attr("d", path);

projection.clipAngle(90);

var line = svg.append("path")
  .datum(graticule)
  .attr("class", "line")
  .attr("d", path);

var country = svg.selectAll(".country")
  .data(countries)
.enter().insert("path", ".line")
  .attr("class", "country")
  .attr("d", path);

var title = svg.append("text")
  .attr("x", width / 2)
  .attr("y", height * 3 / 5);

step();

function step() {
if (++i >= n) i = 0;

// title.text(countries[i].id);

country.transition()
  .style("fill", function(d, j) { return j === i ? "red" : "#737368"; });

d3.transition()
    .delay(250)
    .duration(1250)
    .tween("rotate", function() {
      var point = centroid(countries[i]);
      rotate.source(projection.rotate()).target([-point[0], -point[1]]).distance();
      return function(t) {
        projection.rotate(rotate(t)).clipAngle(180);
        backCountry.attr("d", path);
        backLine.attr("d", path);

        projection.rotate(rotate(t)).clipAngle(90);
        country.attr("d", path);
        line.attr("d", path);
      };
    })
  .transition()
    .each("end", step);
}
});

var d3_radians = Math.PI / 180;

function d3_geo_greatArcInterpolator() {
var x0, y0, cy0, sy0, kx0, ky0,
  x1, y1, cy1, sy1, kx1, ky1,
  d,
  k;

function interpolate(t) {
var B = Math.sin(t *= d) * k,
    A = Math.sin(d - t) * k,
    x = A * kx0 + B * kx1,
    y = A * ky0 + B * ky1,
    z = A * sy0 + B * sy1;
return [
  Math.atan2(y, x) / d3_radians,
  Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians
];
}

interpolate.distance = function() {
if (d == null) k = 1 / Math.sin(d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))));
return d;
};

interpolate.source = function(_) {
var cx0 = Math.cos(x0 = _[0] * d3_radians),
    sx0 = Math.sin(x0);
cy0 = Math.cos(y0 = _[1] * d3_radians);
sy0 = Math.sin(y0);
kx0 = cy0 * cx0;
ky0 = cy0 * sx0;
d = null;
return interpolate;
};

interpolate.target = function(_) {
var cx1 = Math.cos(x1 = _[0] * d3_radians),
    sx1 = Math.sin(x1);
cy1 = Math.cos(y1 = _[1] * d3_radians);
sy1 = Math.sin(y1);
kx1 = cy1 * cx1;
ky1 = cy1 * sx1;
d = null;
return interpolate;
};

return interpolate;
}
</script>
