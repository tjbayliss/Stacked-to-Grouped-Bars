/*
  PROTOTYPE COMMENTS:

  - currently built in d3 v5
  - build based on this example version code: https://bl.ocks.org/lorenzopub/352ad2e6f577c4abf55e29e6d422535a
  - code can accommodate different number of categories (per group) (tested)
  - code can accommodate zeros (0) for individual categories [within a group] (tested)
  - code can accommodate unbalanced ros across categories across data years (tested)
  - code can accommodate variable date range (tested)

  TO DOs:
  - add to instructions text
  - bring data bars to front
  - fully comment code
*/

console.log("script.js");

var stack = d3.stack();

var margin = { top: 40, right: 10, bottom: 40, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");
var formatNumber = d3.format("d");

// parse the date / time
// to convert the current date to a human-readable string:
const formatTime = d3.timeFormat("%Y");
// formatTime(new Date()); // "June 30, 2015"

// Likewise, to convert a string back to a date, create a parser:
const parseTime = d3.timeParse("%Y");
// parseTime("June 30, 2015"); // Tue Jun 30 2015 00:00:00 GMT-0700 (PDT)
var Tooltip;
// create a tooltip
// var Tooltip = d3
//   .select("#container")
//   .append("div")
//   .style("opacity", 0)
//   .attr("class", "tooltip")
//   .style("background-color", "white")
//   .style("border", "solid")
//   .style("border-width", "1px")
//   .style("border-radius", "0px")
//   .style("width", "200px")
//   .style("z-index", 100)
//   .style("position", "absolute")
//   .style("padding", "5px")
//   .style("font-size", "9px");

function drawChart(data) {
  pearlData.data = data; // extract PEARL data array
  pearlData.numberOfYears = pearlData.data.length; // determine number of x-axis categories
  pearlData.startYear = pearlData.data[0].year; // determine START year of x-axis/data time domain
  pearlData.endYear = pearlData.data[pearlData.data.length - 1].year; // determine END year of x-axis/data time domain
  pearlData.categories = []; // initialise array for the search categories
  pearlData.numberOfCategories = -1; // initial var for number of categories
  pearlData.chartData = []; // initial array to contain data arrays for each data layer on chart
  pearlData.arrayOfYears = []; // initialise array for years to display against on x axism(to be used for x axis labels)

  pearlData.data.forEach(function (d, i) {
    var year = d.year;
    var yearCategoryData = d.categories;
    pearlData.arrayOfYears.push(year); // push year object element onto array

    var categoryCounter = 0;
    for (var category in yearCategoryData) {
      if (!pearlData.chartData[categoryCounter]) {
        pearlData.chartData[categoryCounter] = [];
      }

      pearlData.chartData[categoryCounter].push(yearCategoryData[category]);
      categoryCounter++;
    }
  }); // end forEach

  pearlData.numberOfCategories = Object.keys(
    pearlData.data[0].categories
  ).length;
  pearlData.categories = Object.keys(pearlData.data[0].categories);

  pearlData.chartData = pearlData.chartData[0].map(function (col, i) {
    return pearlData.chartData.map(function (row) {
      return row[i];
    });
  });

  (pearlData.layers = stack.keys(d3.range(pearlData.numberOfCategories))(
    pearlData.chartData
  )),
    (pearlData.yStackMax =
      Math.ceil(
        d3.max(pearlData.layers, function (layer) {
          return d3.max(layer, function (d) {
            return d[1];
          });
        }) / 100
      ) * 100),
    (pearlData.yGroupMax =
      Math.ceil(
        d3.max(pearlData.layers, function (layer) {
          return d3.max(layer, function (d) {
            return d[1] - d[0];
          });
        }) / 10
      ) * 10);

  pearlData.x = d3
    .scaleBand()
    .domain(d3.range(pearlData.numberOfYears))
    .rangeRound([0, width])
    .padding(0.1)
    .align(0.1);

  pearlData.xAxis = d3.axisBottom().scale(pearlData.x);

  pearlData.xTime = d3
    .scaleBand()
    .domain(pearlData.arrayOfYears)
    .rangeRound([0, width])
    .padding(0.1)
    .align(0.1);

  pearlData.xTimeAxis = d3.axisBottom().scale(pearlData.xTime);

  pearlData.color = d3
    .scaleLinear()
    .domain([0, pearlData.numberOfCategories - 1])
    .range(["#d9d9d9", "#525252"]);

  pearlData.y = d3
    .scaleLinear()
    .domain([
      0,
      /* pearlData.yStackMax */ Math.ceil(pearlData.yStackMax / 500) * 500,
    ])
    .rangeRound([height, 0]);

  pearlData.yAxis = d3.axisLeft().scale(pearlData.y).tickSize(2).tickPadding(6);

  pearlData.svg = d3
    .select("#container")
    .append("svg")
    .attr("class", "pearl-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  pearlData.svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(pearlData.xAxis);

  pearlData.svg
    .append("g")
    .attr("class", "xTime axis")
    .attr("transform", "translate(0," + height + ")")
    .call(pearlData.xTimeAxis);

  // initialise and append y-axis main title label
  d3.selectAll(".x.axis")
    .append("text")
    .attr("class", "xAxisTitle")
    .attr("x", width)
    .attr("y", 35)
    .text("Year of Publication")
    .style("fill", "#000")
    .style("font-size", "18px")
    .style("text-anchor", "end");

  pearlData.svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + 0 + ",0)")
    .style("font-size", "10px")
    .call(pearlData.yAxis);

  // initialise and append y-axis main title label
  d3.selectAll(".y.axis")
    .append("text")
    .attr("class", "yAxisTitle")
    .attr("x", 0)
    .attr("y", -10)
    .text("Number of Articles")
    .style("fill", "#000")
    .style("font-size", "18px")
    .style("text-anchor", "start");

  d3.selectAll(".yAxisTicks").remove();

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var yticks = d3.selectAll(".y.axis").selectAll(".tick");
  yticks
    .append("svg:line")
    .attr("class", "yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr("x2", width)
    .style("stroke-width", 0.5)
    .style("stroke", "#a0a0a0")
    .style("opacity", 0.33);

  pearlData.layer = pearlData.svg
    .selectAll(".layer")
    .data(pearlData.layers)
    .enter()
    .append("g")
    .attr("class", function (d, i) {
      return "layer-" + i + " horizon";
    })
    .attr("id", function (d) {
      return d.key;
    })
    .style("fill", function (d, i) {
      return pearlData.color(i);
    });

  pearlData.rect = pearlData.layer
    .selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("class", function (d, i) {
      var pc = this.parentNode.className.baseVal.replace("layer ", "layer-");
      return pc + " dataRect stack-" + i;
    })
    .attr("x", function (d, i) {
      return pearlData.x(i);
    })
    .attr("y", height)
    .attr("width", pearlData.x.bandwidth())
    .attr("height", 0)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", click);

  pearlData.rect
    .transition()
    .delay(function (d, i) {
      return i * 10;
    })
    .attr("y", function (d) {
      return pearlData.y(d[1]);
    })
    .attr("height", function (d) {
      return pearlData.y(d[0]) - pearlData.y(d[1]);
    })
    .style("opacity", 1);

  d3.selectAll("input").on("change", changePearl);

  function changePearl() {
    if (this.value === "grouped") transitionGroupedPearl();
    else if (this.value === "stacked") transitionStackedPearl();
    else if (this.value === "percent") transitionPercentPearl();

    d3.selectAll(".yAxisTicks").remove();

    // draw tick grid lines extending from y-axis ticks on axis across scatter graph
    var yticks = d3.selectAll(".y.axis").selectAll(".tick");
    yticks
      .append("svg:line")
      .attr("class", "yAxisTicks")
      .attr("y0", 0)
      .attr("y1", 0)
      .attr("x1", 0)
      .attr("x2", width)
      .style("stroke-width", 0.5)
      .style("stroke", "#a0a0a0")
      .style("opacity", 0.33);
  }

  function transitionGroupedPearl() {
    pearlData.y.domain([
      0,
      Math.ceil(pearlData.yGroupMax / pearlData.Rounding.yGroupMax) *
        pearlData.Rounding.yGroupMax,
    ]);

    pearlData.rect
      .transition()
      .duration(500)
      .delay(function (d, i) {
        return i * 10;
      })
      .attr("x", function (d, i, j) {
        return (
          pearlData.x(i) +
          (pearlData.x.bandwidth() / pearlData.numberOfCategories) *
            parseInt(this.parentNode.id)
        );
      })
      .attr("width", pearlData.x.bandwidth() / pearlData.numberOfCategories)
      .transition()
      .attr("y", function (d) {
        return height - (pearlData.y(d[0]) - pearlData.y(d[1]));
      })
      .attr("height", function (d) {
        return pearlData.y(d[0]) - pearlData.y(d[1]);
      });

    pearlData.yAxis.tickFormat(d3.format("d"));
    pearlData.svg
      .selectAll(".y.axis")
      .transition()
      .delay(500)
      .duration(500)
      .call(pearlData.yAxis);

    d3.selectAll(".y.axis")
      .selectAll(".tick")
      .selectAll("text")
      .text(function (d, i) {
        return numberWithCommas(d);
      });
  }

  function transitionStackedPearl() {
    // pearlData.y.domain([0, pearlData.yStackMax]);
    pearlData.y.domain([
      0,
      Math.ceil(pearlData.yStackMax / pearlData.Rounding.yStackMax) *
        pearlData.Rounding.yStackMax,
    ]);

    pearlData.rect
      .transition()
      .duration(500)
      .delay(function (d, i) {
        return i * 10;
      })
      .attr("y", function (d) {
        return pearlData.y(d[1]);
      })
      .attr("height", function (d) {
        return pearlData.y(d[0]) - pearlData.y(d[1]);
      })
      .transition()
      .attr("x", function (d, i) {
        return pearlData.x(i);
      })
      .attr("width", pearlData.x.bandwidth());

    pearlData.yAxis.tickFormat(/* formatNumber */ d3.format("d"));

    pearlData.svg
      .selectAll(".y.axis")
      .transition()
      .delay(500)
      .duration(500)
      .call(pearlData.yAxis);
  }

  function transitionPercentPearl() {
    pearlData.y.domain([0, 1]);

    pearlData.rect
      .transition()
      .duration(500)
      .delay(function (d, i) {
        return i * 10;
      })
      .attr("y", function (d) {
        var total = d3.sum(d3.values(d.data));
        return pearlData.y(d[1] / total);
      })
      .attr("height", function (d) {
        var total = d3.sum(d3.values(d.data));
        return pearlData.y(d[0] / total) - pearlData.y(d[1] / total);
      })
      .transition()
      .attr("x", function (d, i) {
        return pearlData.x(i);
      })
      .attr("width", pearlData.x.bandwidth());

    pearlData.yAxis.tickFormat(formatPercent);

    pearlData.svg
      .selectAll(".y.axis")
      .transition()
      .delay(500)
      .duration(500)
      .call(pearlData.yAxis);
  }
}

// Inspired by Lee Byron's test data generator.
function bumpLayer(n, o) {
  function bump(a) {
    var x = 1 / (0.1 + Math.random()),
      y = 2 * Math.random() - 0.5,
      z = 10 / (0.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [],
    i;
  for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
  for (i = 0; i < 5; ++i) bump(a);

  return a.map(function (d, i) {
    return Math.max(0, d);
  });
}

d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d, i) {
  // console.log(this);
  // console.log(d);
  // Tooltip = d3
  //   .selectAll(".pearl-svg")
  //   /*   .select(this) */
  //   .append("rect")
  //   .style("opacity", 1)
  //   .attr("class", "tooltip")
  //   .attr("x", d3.mouse(this)[0] - margin.left + "px")
  //   .attr("y", d3.mouse(this)[1] + "px")
  //   .style("fill", "white")
  //   .style("stroke", "#000")
  //   .style("stroke-width", "1px")
  //   .attr("width", "200px")
  //   .attr("height", "200px")
  //   .style("z-index", 100)
  //   .style("pointer-events", "none");
  // // Tooltip.style("opacity", 1);

  // console.log(d3.mouse(this));

  if (pearlData.layerIsSelected != true) {
    pearlData.selectedLayer = d3.select(this)._groups[0][0].classList[0];
    pearlData.selectedLayerIndex = pearlData.selectedLayer.replaceAll(
      "layer-",
      ""
    );

    d3.selectAll(".horizon." + pearlData.selectedLayer)
      .style("fill", "#0a344b")
      .style("opacity", 1.0);
  }
};

var mousemove = function (d, i) {
  // console.log(d3.mouse(this));
  // Tooltip.attr("x", d3.mouse(this)[0] + "px").attr(
  //   "y",
  //   d3.mouse(this)[1] + "px"
  // );

  var text = "<b>Number of Publications, by Area of Expertise</b></br></br>";
  var data = d.data;
  var total = 0;

  data.forEach(function (d, i) {
    total = total + d;
    text =
      text +
      "<li class='tooltipList'>" +
      pearlData.categories[i] +
      " : " +
      numberWithCommas(d) +
      "</li>";
  });

  text =
    text + "</br><b> Total Number of Articles: </b>" + numberWithCommas(total);

  // Tooltip.html(text)
  //   .style("left", d3.mouse(this)[0] + 70 + "px")
  //   .style("top", d3.mouse(this)[1] + "px");
};

var mouseleave = function (d, i) {
  // Tooltip.style("opacity", 0).remove();

  if (d3.selectAll("." + pearlData.selectedLayer).classed("selected")) {
  } else {
    d3.selectAll("." + pearlData.selectedLayer)
      .style("stroke", "none")
      .style("opacity", 1.0)
      .style("fill", pearlData.color(pearlData.selectedLayerIndex));
  }
};

var click = function (d, i) {
  if (pearlData.layerIsSelected == true) {
    pearlData.layerIsSelected = false;
  } else {
    pearlData.layerIsSelected = true;
  }

  var theLayer = d3.selectAll("." + pearlData.selectedLayer);
  theLayer.classed("selected", !theLayer.classed("selected"));

  d3.select(this).style("fill", "#0070a8");
}; // end function click

// https://codepen.io/jorgemaiden/pen/YgGZMg
var linkToggle = document.querySelectorAll(".js-toggle");

for (i = 0; i < linkToggle.length; i++) {
  linkToggle[i].addEventListener("click", function (event) {
    event.preventDefault();

    var container = document.getElementById(this.dataset.container);

    if (!container.classList.contains("active")) {
      container.classList.add("active");

      container.style.height = "auto";

      var height = container.clientHeight + "px";

      container.style.height = "0px";

      setTimeout(function () {
        container.style.height = height;
      }, 0);
    } else {
      container.style.height = "0px";

      container.addEventListener(
        "transitionend",
        function () {
          container.classList.remove("active");
        },
        {
          once: true,
        }
      );
    }
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
