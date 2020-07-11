d3.json("data.json").then( (data) => {
    // console.log("Got data?", data);
    const simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(data.links)
            .id(d=> d.id)
            .distance(100))
        .force("center", d3.forceCenter(300, 300));
    
    const svg = d3.select("#Target");

    const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("stroke", "green")
        .attr("stroke-width", 0.5)
        .style("fill", "blue");

    const link = svg
        .selectAll("path.link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("fill", "none");
    
    const lineGenerator = d3.line();

    simulation.on("tick", () => {
        console.log("Tick");
        node
            .attr("cx", (d) => d.x)
            .attr("cy", (d => d.y));
        
        link.attr("d", (d) => {
            return lineGenerator([
                [d.source.x, d.source.y],
                [d.target.x, d.target.y]
            ]);
        });
    });
});