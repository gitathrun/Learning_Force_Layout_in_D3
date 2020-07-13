// d3.json("data.json").then( (data) => {
d3.json("org.json").then( (data) => {

    const drag = simulation => {
        const dragstarted = d => {
            if(!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        const dragged = d => {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };

        const dragended = (d) => {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }

            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    }
    // define scale
    const linkWidthScale = d3
        .scaleLinear()
        .domain([0, d3.max(data.links.map(link => link.weight))])
        .range([0.5, 1.25]);

    // define dash links
    const linkDashScale = d3
        .scaleOrdinal()
        .domain([0, 2, 3])
        .range(["4 2", "2 2", null]);

    const nodeScale = d3.scaleLinear()
        .domain([0, d3.max(data.nodes.map(node => node.influence))])
        .range([8, 20]);
    
    const fontSizeScale = d3.scaleLinear()
        .domain([0, d3.max(data.nodes.map(node => node.influence))])
        .range([7, 12]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // console.log("Got data?", data);
    const simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-75))
        .force("link", d3.forceLink(data.links)
            .id(d=> d.id)
            .distance(100))
        .force("center", d3.forceCenter(300, 300))
        .force("gravity", d3.forceManyBody().strength(7.5));
         
    
    const svg = d3.select("#Target");

    // draw links first
    const link = svg
    .selectAll("path.link")
    .data(data.links)
    .enter()
    .append("path")
    .attr("stroke", "#999")
    .attr("stroke-dasharray", (d) => linkDashScale(d.weight))
    .attr("stroke-width", (d)=> linkWidthScale(d.weight))
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
        .attr("r", (d) => nodeScale(d.influence))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .style("fill", (d) => colorScale(d.zone));
    
    node.call(drag(simulation));

    // const imageContainer = svg
    //     .selectAll("g.imageContainer")
    //     .data(data.nodes)
    //     .enter()
    //     .append("g");

    // const image = imageContainer
    //     .append("image")
    //     .attr("height", (d) => nodeScale(d.influence))
    //     .attr("width", (d) => nodeScale(d.influence))
    //     .attr("transform", (d) =>`translate(${-nodeScale(d.influence)/2}, ${-nodeScale(d.influence)/2})`)
    //     .attr("href", (d, i) => `image/img-${i}.png`);


    const textContainer = svg
        .selectAll("g.label")
        .data(data.nodes)
        .enter()
        .append("g");
    
    textContainer
        .append("text")
        .text((d) => d.name)
        .attr("font-size", (d) => fontSizeScale(d.influence))
        .attr("transform", (d) => {
            const scale = nodeScale(d.influence);
            const x = scale + 2;
            const y = scale + 4;
            return `translate($(x), $(y))`
        })
    
    const card = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("display", "none");
    
    const cardBackground = card.append("rect")
        .attr("width", 180)
        .attr("height", 45)
        .attr("fill", "#eee")
        .attr("stroke", "#333")
        .attr("rx", 4);
    
    const cardTextName = card
        .append("text")
        .attr("transform", "translate(8, 20)");

    
    const cardTextRole = card
        .append("text")
        .attr("font-size", "10")
        .attr("transform", "translate(8, 35)");
    
    let currentTarget = null;

    node.on("mouseover", d=> {
        currentTarget = d3.event.target;
        card.attr("display", "block");

        cardTextName.text(d.name);
        cardTextRole.text(d.role);

        const nameWidth = cardTextName.node().getBBox().width;
        const positionWidth = cardTextRole.node().getBBox().width;

        const cardWidth = Math.max(nameWidth, positionWidth);

        cardBackground.attr("width", cardWidth + 16);

        simulation.alphTarget(0).restart();

    })

    node.on("mouseout", () => {
        card.attr("display", "none");
        currentTarget = null;
    })

    const lineGenerator = d3.line()
        .curve(d3.curveCardinal);

    simulation.on("tick", () => {
        console.log("Tick");

        textContainer
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        // imageContainer
        //     .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        node
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        
        link.attr("d", (d) => {

            const mid = [
               (d.source.x + d.target.x)/2,
               (d.source.y + d.target.y)/2
            ];

            if (d.overlap>0) {
                const distance = Math.sqrt(
                    Math.pow(d.target.x - d.source.x, 2) + 
                    Math.pow(d.target.y - d.source.y, 2)
                );
            
                const slopeX = (d.target.x - d.source.x) / distance;
                const slopeY = (d.target.y - d.source.y) / distance;

                const curveSharpness = 10;
                mid[0] += slopeY * curveSharpness;
                mid[1] += slopeX * curveSharpness;
            };

            return lineGenerator([
                [d.source.x, d.source.y],
                mid,
                [d.target.x, d.target.y]
            ])
        });

        if (currentTarget){
            const radius = currentTarget.r.baseVal.value;
            const xPos = currentTarget.cx.baseVal.value + radius +3;
            const yPos = currentTarget.cy.baseVal.value + radius +3;

            card.attr("transform", `translate(${xPos}, ${yPos})`);

        }
    });
});