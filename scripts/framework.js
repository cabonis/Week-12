export default class ChartSvg {
    
    #width;
    #height;
    #margin;
    #chart;
    #svg;
    #animationDuration = 500;

    constructor(id, width, height, margin) {

        this.#svg = d3.select("#" + id)
            .append("svg")
            .attr("viewBox", `0, 0, ${width + margin.right + margin.left}, ${height + margin.top + margin.bottom}`); 
        
        this.#chart = this.#svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.#width = width;
        this.#height = height;
        this.#margin = margin;
    }

    get svg() {
        return this.#svg;
    }

    get chart() {
        return this.#chart;
    }           

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get margin() {
        return this.#margin;
    }

    get animationDuration() {
        return this.#animationDuration;
    }

    remove() {
        this.#svg.remove();
    }
}