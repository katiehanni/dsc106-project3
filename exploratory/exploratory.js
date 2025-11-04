// Exploratory Visualizations for Arctic Sky Seasonal Changes

// Mock data for exploratory visualizations
// In final version, this will come from MODIS API

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Daylight hours at Arctic Circle (66.5°N) - approximate
const daylightData = [
    {month: 0, hours: 4, name: 'Jan'},
    {month: 1, hours: 8, name: 'Feb'},
    {month: 2, hours: 12, name: 'Mar'},
    {month: 3, hours: 16, name: 'Apr'},
    {month: 4, hours: 20, name: 'May'},
    {month: 5, hours: 23, name: 'Jun'},
    {month: 6, hours: 23, name: 'Jul'},
    {month: 7, hours: 20, name: 'Aug'},
    {month: 8, hours: 16, name: 'Sep'},
    {month: 9, hours: 12, name: 'Oct'},
    {month: 10, hours: 8, name: 'Nov'},
    {month: 11, hours: 4, name: 'Dec'}
];

// Tooltip creation helper
function createTooltip() {
    return d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
}

// VISUALIZATION 1: Seasonal Daylight Hours Line Chart (DYNAMIC)
function createVis1() {
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#vis1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = createTooltip();

    const x = d3.scaleBand()
        .domain(daylightData.map(d => d.name))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.name) + x.bandwidth() / 2)
        .y(d => y(d.hours))
        .curve(d3.curveMonotoneX);

    // Animated path drawing
    const path = g.append("path")
        .datum(daylightData)
        .attr("fill", "none")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 3)
        .attr("d", line)
        .style("opacity", 0);

    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .style("opacity", 1);

    // Interactive dots with hover effects
    g.selectAll(".dot")
        .data(daylightData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.name) + x.bandwidth() / 2)
        .attr("cy", d => y(d.hours))
        .attr("r", 5)
        .attr("fill", "#2980b9")
        .style("opacity", 0)
        .transition()
        .delay((d, i) => i * 150)
        .duration(500)
        .style("opacity", 1)
        .on("end", function() {
            d3.select(this)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 8)
                        .attr("fill", "#e74c3c");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.name}: ${d.hours} hours of daylight`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 5)
                        .attr("fill", "#2980b9");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis");

    g.append("g")
        .call(d3.axisLeft(y).ticks(8))
        .selectAll("text")
        .attr("class", "axis");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Daylight Hours");
}

// VISUALIZATION 2: Monthly Average Brightness Bar Chart (DYNAMIC)
function createVis2() {
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Simulated brightness data (inversely related to daylight - more daylight = brighter)
    const brightnessData = daylightData.map(d => ({
        ...d,
        brightness: d.hours < 12 ? 20 + d.hours * 2 : 60 + (d.hours - 12) * 2
    }));

    const svg = d3.select("#vis2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = createTooltip();

    const x = d3.scaleBand()
        .domain(brightnessData.map(d => d.name))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
        .domain([0, 100]);

    // Animated bars with hover interactions
    g.selectAll(".bar")
        .data(brightnessData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", d => colorScale(d.brightness))
        .transition()
        .delay((d, i) => i * 100)
        .duration(800)
        .ease(d3.easeBounce)
        .attr("y", d => y(d.brightness))
        .attr("height", d => height - y(d.brightness))
        .on("end", function() {
            d3.select(this)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.7)
                        .attr("stroke", "#2c3e50")
                        .attr("stroke-width", 2);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.name}<br>Brightness: ${d.brightness.toFixed(1)}<br>Daylight: ${d.hours}h`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("stroke", "none");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis");

    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Brightness Index");
}

// VISUALIZATION 3: Summer vs Winter Comparison
function createVis3() {
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const comparisonData = [
        {season: "Winter (Dec-Feb)", hours: 5.3, color: "#34495e"},
        {season: "Spring (Mar-May)", hours: 16, color: "#3498db"},
        {season: "Summer (Jun-Aug)", hours: 22, color: "#f39c12"},
        {season: "Fall (Sep-Nov)", hours: 12, color: "#e67e22"}
    ];

    const svg = d3.select("#vis3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = createTooltip();

    const x = d3.scaleBand()
        .domain(comparisonData.map(d => d.season))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    // Animated bars with hover interactions
    g.selectAll(".bar")
        .data(comparisonData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.season))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", d => d.color)
        .transition()
        .delay((d, i) => i * 200)
        .duration(1000)
        .ease(d3.easeElastic)
        .attr("y", d => y(d.hours))
        .attr("height", d => height - y(d.hours))
        .on("end", function() {
            d3.select(this)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.8)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 3);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.season}<br>Average: ${d.hours.toFixed(1)} hours`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("stroke", "none");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    g.append("g")
        .call(d3.axisLeft(y).ticks(8))
        .selectAll("text")
        .attr("class", "axis");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Average Daylight Hours");
}

// VISUALIZATION 4: Temporal Heatmap
function createVis4() {
    const margin = {top: 40, right: 30, bottom: 50, left: 80};
    const width = 700 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create grid data for heatmap
    const heatmapData = [];
    const latitudes = ['70°N', '75°N', '80°N', '85°N'];
    monthNames.forEach((month, mi) => {
        latitudes.forEach((lat, li) => {
            const baseHours = daylightData[mi].hours;
            const latFactor = [1.0, 0.95, 0.85, 0.7][li]; // More extreme at higher latitudes
            heatmapData.push({
                month: month,
                latitude: lat,
                hours: Math.max(0, Math.min(24, baseHours * latFactor + (24 - baseHours * latFactor) * (1 - latFactor)))
            });
        });
    });

    const svg = d3.select("#vis4")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(monthNames)
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(latitudes)
        .range([0, height])
        .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, 24]);

    const tooltip = createTooltip();

    // Interactive heatmap cells with hover effects
    g.selectAll(".cell")
        .data(heatmapData)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.latitude))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.hours))
        .style("opacity", 0)
        .transition()
        .delay((d, i) => i * 10)
        .duration(300)
        .style("opacity", 1)
        .on("end", function() {
            d3.select(this)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 2);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.month}, ${d.latitude}<br>${d.hours.toFixed(1)} hours of daylight`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("stroke", "none");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis");

    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Latitude");

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = g.append("g")
        .attr("transform", `translate(${width - legendWidth - 10},${-25})`);

    const legendScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => d + "h");

    legend.append("g")
        .attr("transform", `translate(0,${legendHeight})`)
        .call(legendAxis)
        .selectAll("text")
        .attr("class", "axis")
        .style("font-size", "10px");

    for (let i = 0; i <= legendWidth; i++) {
        legend.append("rect")
            .attr("x", i)
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", legendHeight)
            .attr("fill", colorScale(legendScale.invert(i)));
    }
}

// VISUALIZATION 5: Brightness Distribution by Season (DYNAMIC)
function createVis5() {
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Simulated distribution data
    const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
    const distributions = seasons.map(season => {
        const means = {Winter: 30, Spring: 50, Summer: 85, Fall: 45};
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push(means[season] + (Math.random() - 0.5) * 30);
        }
        return {season, values: data};
    });

    const svg = d3.select("#vis5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(seasons)
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const boxWidth = x.bandwidth() * 0.6;
    const tooltip = createTooltip();

    distributions.forEach((dist, i) => {
        const xPos = x(dist.season) + x.bandwidth() / 2 - boxWidth / 2;
        const values = dist.values.sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);

        // Box with animation
        const boxGroup = g.append("g")
            .attr("class", `box-${i}`)
            .style("opacity", 0);

        boxGroup.append("rect")
            .attr("x", xPos)
            .attr("y", y(q3))
            .attr("width", boxWidth)
            .attr("height", y(q1) - y(q3))
            .attr("fill", "#3498db")
            .attr("opacity", 0.6)
            .on("mouseover", function(event) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.9)
                    .attr("stroke", "#2c3e50")
                    .attr("stroke-width", 2);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${dist.season}<br>Q1: ${q1.toFixed(1)}<br>Median: ${median.toFixed(1)}<br>Q3: ${q3.toFixed(1)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.6)
                    .attr("stroke", "none");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        boxGroup.transition()
            .delay(i * 300)
            .duration(500)
            .style("opacity", 1);

        // Median line
        boxGroup.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 2);

        // Whiskers
        boxGroup.append("line")
            .attr("x1", xPos + boxWidth / 2)
            .attr("x2", xPos + boxWidth / 2)
            .attr("y1", y(q3))
            .attr("y2", y(max))
            .attr("stroke", "#34495e")
            .attr("stroke-width", 1.5)
            .transition()
            .delay(i * 300 + 200)
            .duration(400)
            .attr("y1", y(min))
            .attr("y2", y(max));

        boxGroup.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(min))
            .attr("y2", y(min))
            .attr("stroke", "#34495e")
            .attr("stroke-width", 1.5);

        boxGroup.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(max))
            .attr("y2", y(max))
            .attr("stroke", "#34495e")
            .attr("stroke-width", 1.5);
    });

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis");

    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Brightness Index");
}

// VISUALIZATION 6: Circular/Polar Seasonal Pattern (DYNAMIC)
function createVis6() {
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 50;

    const svg = d3.select("#vis6")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const angleScale = d3.scaleLinear()
        .domain([0, 12])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, radius]);

    // Draw grid circles
    for (let i = 6; i <= 24; i += 6) {
        g.append("circle")
            .attr("r", radiusScale(i))
            .attr("fill", "none")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);
    }

    // Draw month labels
    daylightData.forEach((d, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        g.append("text")
            .attr("x", Math.cos(angle) * (radius + 20))
            .attr("y", Math.sin(angle) * (radius + 20))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("class", "axis")
            .text(d.name);
    });

    // Draw hour labels
    [6, 12, 18, 24].forEach(h => {
        const r = radiusScale(h);
        g.append("text")
            .attr("x", r + 5)
            .attr("y", -5)
            .attr("class", "axis")
            .style("font-size", "10px")
            .text(h + "h");
    });

    const tooltip = createTooltip();

    // Draw area with animation
    const area = d3.areaRadial()
        .angle(d => angleScale(d.month))
        .innerRadius(0)
        .outerRadius(d => radiusScale(d.hours))
        .curve(d3.curveCardinalClosed);

    const areaPath = g.append("path")
        .datum(daylightData)
        .attr("d", area)
        .attr("fill", "#3498db")
        .attr("opacity", 0)
        .attr("stroke", "#2980b9")
        .attr("stroke-width", 2);

    // Animated area fill
    areaPath.transition()
        .duration(2000)
        .attr("opacity", 0.6);

    // Draw line with animation
    const line = d3.lineRadial()
        .angle(d => angleScale(d.month))
        .radius(d => radiusScale(d.hours))
        .curve(d3.curveCardinalClosed);

    const linePath = g.append("path")
        .datum(daylightData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#2980b9")
        .attr("stroke-width", 3)
        .style("opacity", 0);

    const totalLength = linePath.node().getTotalLength();
    linePath.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .style("opacity", 1);

    // Interactive month markers
    daylightData.forEach((d, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        const r = radiusScale(d.hours);
        const marker = g.append("circle")
            .attr("cx", Math.cos(angle) * r)
            .attr("cy", Math.sin(angle) * r)
            .attr("r", 4)
            .attr("fill", "#e74c3c")
            .style("opacity", 0)
            .style("cursor", "pointer");

        marker.transition()
            .delay(2500 + i * 50)
            .duration(300)
            .style("opacity", 1)
            .on("end", function() {
                d3.select(this)
                    .on("mouseover", function(event, data) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 7)
                            .attr("fill", "#c0392b");
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(`${d.name}<br>${d.hours} hours`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(event, data) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 4)
                            .attr("fill", "#e74c3c");
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
            });
    });

    // Add center label
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("class", "axis-label")
        .style("font-size", "14px")
        .text("Arctic Circle");
}

// Initialize all visualizations
window.addEventListener('DOMContentLoaded', () => {
    createVis1();
    createVis2();
    createVis3();
    createVis4();
    createVis5();
    createVis6();
});
