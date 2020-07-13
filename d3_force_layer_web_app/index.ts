// d3.json("data.json").then( (data) => {
d3.json("org.json").then( (data) => {

    // define scale
    const linkWidthScale = d3
        .scaleLinear()
        .domain([0, d3.max(data.links.map(link => link.weight))])
        .range([0.5, 3]);

    // define dash links
    const linkDashScale = d3
        .scaleOrdinal()
        .domain([0, 2, 3])
        .range(["4 2", "2 2", null]);

    // console.log("Got data?", data);
    const simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(data.links)
            .id(d=> d.id)
            .distance(100))
        .force("center", d3.forceCenter(300, 300));
    
    const svg = d3.select("#Target");

    // draw links first
    const link = svg
    .selectAll("path.link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", (d)=> linkWidthScale(d.weight))
    .attr("strok-dasharray", (d)=> linkDashScale(d.weight))
    .attr("fill", "none")
    .attr("marker-mid", (d)=>{
        switch(d.type) {
            case "SUPERVISORY":
                return "url(#markerArrow)";
            default:
                return "none";
        }
    });

    // draw nodes later that covers links connection
    const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 15)
        .attr("stroke", "green")
        .attr("stroke-width", 0.5)
        .style("fill", "blue");


    const lineGenerator = d3.line();

    simulation.on("tick", () => {
        console.log("Tick");
        node
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        
        link.attr("d", (d) => {

            const mid = [
               (d.source.x + d.target.x)/2,
               (d.source.y + d.target.y)/2
            ];

            if (debugger.overlap>0) {
                const distance = Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) + 
                    Math.pow(d.target.y - d.source.y);
                );
            
                const slopeX = (d.target.x - d.source.x) / distance;
                const slopeY = (d.target.y - d.source.y) / distance;

                const curveSharpness = 3;
                mid[0] += sloptY * curveSharpness;
                mid[1] += slopeX * curveSharpness;
            };

            return lineGenerator([
                [d.source.x, d.source.y],
                mid,
                [d.target.x, d.target.y]
            ]);
        });
    });
});