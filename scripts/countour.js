import ChartSvg from "./framework.js";

export default class Contour extends ChartSvg {

    #dataWidth;
    #dataHeight;
    #data;
    #min;
    #max;
    #threshold

    constructor(id, file, dataWidth, dataHeight){

        const width = 500;
        const height = 500;
        const margin = {top:0, left: 0, right:0, bottom:0};

        const rangeLabel = id + "-range-label";
        const rangeSlider = id + "-range-slider";
        const thresholdLabel = id + "-threshold-label";
        const threholdSlider = id + "-threshold-slider";
        const contourSvg = id + "-contourSvg";

        const contourTemplate = `
        <div class="container">
            <div class="row mt-4">
                <div class="col-2 m-3">
                    <p>Range: <span id="${rangeLabel}"></span></span></p>
                </div>
                <div class="col m-4">
                    <div id="${rangeSlider}"></div>                          
                </div>
            </div>
            <div class="row">
                <div class="col-2 m-3">
                    <p>Threshold: <span id="${thresholdLabel}"></span></span></p>
                </div>
                <div class="col m-4">
                    <div id="${threholdSlider}"></div>                          
                </div>
            </div>
            <div class="row">
                <div class="col m-2">
                    <div class="contour" id="${contourSvg}"></div>
                </div>
            </div>
        </div>
        `;

        const div = document.createElement("div");
        div.innerHTML = contourTemplate;
        document.getElementById(id).appendChild(div);

        super(contourSvg, width, height, margin);

        this.#dataWidth = dataWidth;
        this.#dataHeight = dataHeight;

        d3.csv(file).then(contourData => {
            
            this.#data = [];
            contourData.forEach(element => {
                this.#data.push(Number(element[0]));
            });

            const extent = d3.extent(this.#data, (d) => d);

            const rangeMin = this.#min = extent[0];
            const rangeMax = this.#max = extent[1];

            $("#" + rangeSlider).slider({
                range: true,
                min: rangeMin,
                max: rangeMax,
                values: [ this.#min, this.#max ],
                slide: () => {
                    const slider = $("#" + rangeSlider);
                    this.#min = slider.slider("values", 0);
                    this.#max = slider.slider("values", 1);
                    $("#" + rangeLabel).text(`${this.#min}-${this.#max}`);
                    this.#draw(this.#min, this.#max, this.#threshold);
                }
            });

            $("#" + rangeLabel).text(`${this.#min}-${this.#max}`);

            const quarterBand = Math.floor((rangeMax - rangeMin) / 4);
            this.#threshold = quarterBand * 2;

            $("#" + threholdSlider).slider({
                min: quarterBand,
                max: quarterBand * 3,
                value: this.#threshold,
                slide: () => {
                    const slider = $("#" + threholdSlider);
                    this.#threshold = slider.slider("value");
                    $("#" + thresholdLabel).text(this.#threshold);
                    this.#draw(this.#min, this.#max, this.#threshold);
                }
            });

            $("#" + thresholdLabel).text(this.#threshold);

            this.#draw(this.#min, this.#max, this.#threshold);
        })

    }

    #draw(min, max, threshold) {

        this.chart.selectAll('*').remove();

        const contour = d3.contours().size([this.#dataWidth, this.#dataHeight])
            .thresholds(d3.range(min, max, threshold))(this.#data);

        const contourExtent = d3.extent(contour, (d) => d.value);  
        const path = d3.geoPath();

        const colorScale = d3.scaleSequential()
            .domain(contourExtent)
            .interpolator(d3.interpolateViridis);
       
        this.chart.selectAll('path')
            .data(contour)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', 'black').attr('fill', "none")
            .attr("stroke-linejoin", "round")
            .attr('stroke-width', '0px')
            .attr('fill', (d) => colorScale(d.value));
    }


}