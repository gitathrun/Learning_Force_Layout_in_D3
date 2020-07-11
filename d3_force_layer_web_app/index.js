d3.json("data.json").then(function (data) {
    // console.log("Got data?", data);
    var simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(data.links)
        .id(function (d) { return d.id; })
        .distance(100))
        .force("center", d3.forceCenter(300, 300));
    var svg = d3.select("#Target");
    var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("stroke", "green")
        .attr("stroke-width", 0.5)
        .style("fill", "blue");
    var link = svg
        .selectAll("path.link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("fill", "none");
    var lineGenerator = d3.line();
    simulation.on("tick", function () {
        console.log("Tick");
        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", (function (d) { return d.y; }));
        link.attr("d", function (d) {
            return lineGenerator([
                [d.source.x, d.source.y],
                [d.target.x, d.target.y]
            ]);
        });
    });
});
