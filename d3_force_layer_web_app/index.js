// d3.json("data.json").then( (data) => {
d3.json("org.json").then(function (data) {
    // define scale
    var linkWidthScale = d3
        .scaleLinear()
        .domain([0, d3.max(data.links.map(function (link) { return link.weight; }))])
        .range([0.5, 3]);
    // define dash links
    var linkDashScale = d3
        .scaleOrdinal()
        .domain([0, 2, 3])
        .range(["4 2", "2 2", null]);
    // console.log("Got data?", data);
    var simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(data.links)
        .id(function (d) { return d.id; })
        .distance(100))
        .force("center", d3.forceCenter(300, 300));
    var svg = d3.select("#Target");
    // draw links first
    var link = svg
        .selectAll("path.link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", function (d) { return linkWidthScale(d.weight); })
        .attr("strok-dasharray", function (d) { return linkDashScale(d.weight); })
        .attr("fill", "none")
        .attr("marker-mid", function (d) {
        switch (d.type) {
            case "SUPERVISORY":
                return "url(#markerArrow)";
            default:
                return "none";
        }
    });
    // draw nodes later that covers links connection
    var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("stroke", "green")
        .attr("stroke-width", 0.5)
        .style("fill", "blue");
    var lineGenerator = d3.line();
    simulation.on("tick", function () {
        console.log("Tick");
        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
        link.attr("d", function (d) {
            var mid = [
                (d.source.x + d.target.x) / 2,
                (d.source.y + d.target.y) / 2
            ];
            if ()
                debugger;
            overlap > 0;
        });
        {
            var distance = Math.sqrt(Math.pow(d.target.x - d.source.x, 2) +
                Math.pow(d.target.y - d.source.y));
        }
    });
    var slopeX = (d.target.x - d.source.x) / distance;
    var slopeY = (d.target.y - d.source.y) / distance;
    var curveSharpness = 3;
    mid[0] += sloptY * curveSharpness;
    mid[1] += slopeX * curveSharpness;
});
return lineGenerator([
    [d.source.x, d.source.y],
    mid,
    [d.target.x, d.target.y]
]);
;
;
;
