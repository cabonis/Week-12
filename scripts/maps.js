import ChartSvg from "./framework.js";

export default class SideBySideMap {

    constructor(id) {

        const choroplethId = id + "-choropleth";
        const cartogramId = id + "-cartogram";
        const tooltipId = id + "-tooltip";

        const sideBySideMapTemplate = `
        <div class="container">
            <div class="row">
                <div class="col-6 py-4 title">Choropleth</div>   
                <div class="col-6 py-4 title">Cartogram</div>            
            </div>
            <div class="row">
                <div class="col-6" id="${choroplethId}"></div>   
                <div class="col-6" id="${cartogramId}"></div>            
            </div>            
        </div>
        <div id="${tooltipId}"></div>
        `;

        const div = document.createElement("div");
        div.innerHTML = sideBySideMapTemplate;
        document.getElementById(id).appendChild(div);


        const income_data = "data/household_income.csv";
        const geojson_cartogram = "data/states_cartogram.geojson";
        const geojson_choropleth = "data/states.geojson"; 

        Promise.all(
            [
                d3.json(geojson_cartogram),
                d3.json(geojson_choropleth),
                d3.csv(income_data)
            ], d3.autoType()
        ).then((data) => {

            const cartogram = data[0].features;
            const choropleth = data[1].features;
            const incomes = data[2];

            const colorScale = d3.scaleLinear()
                .domain(d3.extent(incomes, d => +d.Income))
                .range(["white", "green"]);
                
            const tooltip = new ToolTip(tooltipId);
            new MapSvg(choroplethId, choropleth, colorScale, tooltip);
            new MapSvg(cartogramId, cartogram, colorScale, tooltip);
        })
    }
}

class ToolTip {

    #id;
    #stateId;
    #incomeId;
    #currencyFormatter;

    constructor(id) {

        this.#id = id + "-main";
        this.#stateId = id + "-state";
        this.#incomeId = id + "-income";

        const tooltipTemplate = `
        <div class="map-tooltip container" id="${this.#id}">
            <div class="row">
                <div class="col header"><span class="tooltip-header" id="${this.#stateId}"></span></div>
            </div>
            <div class="row">
                <div class="col tooltip-body" id="${this.#incomeId}"></div>
            </div>           
        </div>
        `;

        const div = document.createElement("div");
        div.innerHTML = tooltipTemplate;
        document.getElementById(id).appendChild(div);

        this.#currencyFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });
    }

    show(data) {
        d3.select("#" + this.#id)
            .style("opacity",.8)
            .style("left",(window.event.clientX+10).toString()+"px")
            .style("top",(window.event.clientY+10).toString()+"px");
      
        d3.select("#" + this.#stateId)
            .text(data.properties.NAME);              

        d3.select("#" + this.#incomeId)
            .text(this.#currencyFormatter.format(data.properties.Income));
    }

    hide() {
        d3.select("#" + this.#id)
            .style("opacity",0.0);
    }
}

class MapSvg extends ChartSvg {

    constructor(id, geoJson, colorScale, tooltip, scale=1100) {

        const width = 900;
        const height = 900;
        const margin = {top:0, left: 0, right:0, bottom:0};

        super(id, width, height, margin);

        let projection = d3.geoAlbersUsa()
            .scale(scale).translate([width/2, 2*height/5]);

        let geo_generator = d3.geoPath().projection(projection);
        
        let mapArea = this.chart.append('g')
            .attr("class",'mapCanvas');
            
        mapArea.selectAll('path')
            .data(geoJson)
            .enter()
            .append('path')
            .attr("d", geo_generator)
            .attr("fill", (d) => colorScale(d.properties.Income))
            .attr("class", (d) => "cls"+d.properties.GEOID.toString())
            .on('mouseenter',function (d){
                d3.selectAll("path").classed('hover',false);
                d3.selectAll(`.${d3.select(this).attr('class')}`).classed('hover',true);
                tooltip.show(d);
            })
            .on("mouseout",function (mouseData,d){
                tooltip.hide();
                d3.selectAll("*").classed('hover',false);
            });

        this.svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 12])
            .on("zoom", function() {     
                d3.selectAll(".mapCanvas").attr("transform", d3.zoomTransform(this))
            }));
    }
}
