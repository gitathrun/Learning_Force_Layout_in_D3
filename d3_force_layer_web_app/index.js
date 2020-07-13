// d3.json("data.json").then( (data) => {
d3.json("org.json").then(function (data) {
    var drag = function (simulation) {
        var dragstarted = function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        };
        var dragged = function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        };
        var dragended = function (d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        };
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };
    // define scale
    var linkWidthScale = d3
        .scaleLinear()
        .domain([0, d3.max(data.links.map(function (link) { return link.weight; }))])
        .range([0.5, 1.25]);
    // define dash links
    var linkDashScale = d3
        .scaleOrdinal()
        .domain([0, 2, 3])
        .range(["4 2", "2 2", null]);
    var nodeScale = d3.scaleLinear()
        .domain([0, d3.max(data.nodes.map(function (node) { return node.influence; }))])
        .range([8, 20]);
    var fontSizeScale = d3.scaleLinear()
        .domain([0, d3.max(data.nodes.map(function (node) { return node.influence; }))])
        .range([7, 12]);
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // console.log("Got data?", data);
    var simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-75))
        .force("link", d3.forceLink(data.links)
        .id(function (d) { return d.id; })
        .distance(function (d, i) {
        // for specific node
        // if (i ===0){
        //     return 250;
        // } else {
        //     return 50;
        // }
        // for specific link
        if (d.source.id === 0 || d.target.id === 0) {
            return 75;
        }
        else {
            return 50;
        }
    })
        .strength(function (d) {
        if (d.source.id === 1 || d.target.id === 1) {
            return 1.15;
        }
        else {
            return 0.25;
        }
    }))
        .force("center", d3.forceCenter(300, 300))
        .force("gravity", d3.forceManyBody().strength(7.5));
    var svg = d3.select("#Target");
    // draw links first
    var link = svg
        .selectAll("path.link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("stroke", "#999")
        .attr("stroke-dasharray", function (d) { return linkDashScale(d.weight); })
        .attr("stroke-width", function (d) { return linkWidthScale(d.weight); })
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
        .attr("r", function (d) { return nodeScale(d.influence); })
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .style("fill", function (d) { return colorScale(d.zone); });
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
    var textContainer = svg
        .selectAll("g.label")
        .data(data.nodes)
        .enter()
        .append("g");
    textContainer
        .append("text")
        .text(function (d) { return d.name; })
        .attr("font-size", function (d) { return fontSizeScale(d.influence); })
        .attr("transform", function (d) {
        var scale = nodeScale(d.influence);
        var x = scale + 2;
        var y = scale + 4;
        return "translate($(x), $(y))";
    });
    var card = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("display", "none");
    var cardBackground = card.append("rect")
        .attr("width", 180)
        .attr("height", 45)
        .attr("fill", "#eee")
        .attr("stroke", "#333")
        .attr("rx", 4);
    var cardTextName = card
        .append("text")
        .attr("transform", "translate(8, 20)");
    var cardTextRole = card
        .append("text")
        .attr("font-size", "10")
        .attr("transform", "translate(8, 35)");
    var currentTarget = null;
    node.on("mouseover", function (d) {
        currentTarget = d3.event.target;
        card.attr("display", "block");
        cardTextName.text(d.name);
        cardTextRole.text(d.role);
        var nameWidth = cardTextName.node().getBBox().width;
        var positionWidth = cardTextRole.node().getBBox().width;
        var cardWidth = Math.max(nameWidth, positionWidth);
        cardBackground.attr("width", cardWidth + 16);
        simulation.alphTarget(0).restart();
    });
    node.on("mouseout", function () {
        card.attr("display", "none");
        currentTarget = null;
    });
    var lineGenerator = d3.line()
        .curve(d3.curveCardinal);
    simulation.on("tick", function () {
        console.log("Tick");
        textContainer
            .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });
        // imageContainer
        //     .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
        link.attr("d", function (d) {
            var mid = [
                (d.source.x + d.target.x) / 2,
                (d.source.y + d.target.y) / 2
            ];
            if (d.overlap > 0) {
                var distance = Math.sqrt(Math.pow(d.target.x - d.source.x, 2) +
                    Math.pow(d.target.y - d.source.y, 2));
                var slopeX = (d.target.x - d.source.x) / distance;
                var slopeY = (d.target.y - d.source.y) / distance;
                var curveSharpness = 10;
                mid[0] += slopeY * curveSharpness;
                mid[1] += slopeX * curveSharpness;
            }
            ;
            return lineGenerator([
                [d.source.x, d.source.y],
                mid,
                [d.target.x, d.target.y]
            ]);
        });
        if (currentTarget) {
            var radius = currentTarget.r.baseVal.value;
            var xPos = currentTarget.cx.baseVal.value + radius + 3;
            var yPos = currentTarget.cy.baseVal.value + radius + 3;
            card.attr("transform", "translate(" + xPos + ", " + yPos + ")");
        }
    });
});
