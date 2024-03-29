import Graph from './Graph.js';
import { COUNTRIES_LIST_ID, getDefaultGraphData, getDomElement } from './utils.js';

const noop = () => {};

export default class App {
    graphs = [];

    rootElement = getDomElement('<ul class="countriesList"></ul>');

    datalistElement = getDomElement(`<datalist id="${COUNTRIES_LIST_ID}">`);

    onChange = noop;

    constructor(graphsData, countriesData) {
        this.graphsData = graphsData;
        this.countriesData = countriesData;

        this.initialRender();
    }

    initialRender() {
        document.body.append(this.datalistElement);

        for (const graphData of this.graphsData) {
            const graph = new Graph(graphData, this);

            this.graphs.push(graph);

            graph.setCountryData(this.countriesData[graphData.name]);

            this.rootElement.append(graph.rootElement);
        }
    }

    setCountriesData(countriesData) {
        this.countriesData = countriesData;

        const countriesOptions = [];

        for (const countryName of Object.keys(this.countriesData)) {
            countriesOptions.push(`<option value="${countryName}">`);
        }

        this.datalistElement.innerHTML = countriesOptions.join('');

        for (const graph of this.graphs) {
            graph.setCountryData(this.countriesData[graph.data.name]);
        }
    }

    setDisabledAttributes() {
        const isSingle = this.graphs.length <= 1;

        for (let i = 0; i < this.graphs.length; i += 1) {
            const graph = this.graphs[i];

            graph.upElement.disabled = isSingle || i === 0;
            graph.downElement.disabled = isSingle || i === this.graphs.length - 1;
            graph.removeElement.disabled = isSingle;
        }
    }

    upGraph(index) {
        if (index === 0) return;

        [this.graphsData[index - 1], this.graphsData[index]] = [
            this.graphsData[index],
            this.graphsData[index - 1],
        ];

        [this.graphs[index - 1], this.graphs[index]] = [this.graphs[index], this.graphs[index - 1]];

        this.rootElement.childNodes[index - 1].before(this.rootElement.childNodes[index]);

        this.graphs[index - 1].renderScroll();
    }

    downGraph(index) {
        if (index === this.graphsData.length - 1) return;

        [this.graphsData[index + 1], this.graphsData[index]] = [
            this.graphsData[index],
            this.graphsData[index + 1],
        ];

        [this.graphs[index + 1], this.graphs[index]] = [this.graphs[index], this.graphs[index + 1]];

        this.rootElement.childNodes[index + 1].after(this.rootElement.childNodes[index]);

        this.graphs[index + 1].renderScroll();
    }

    addGraph(index) {
        const graphData = getDefaultGraphData();
        const graph = new Graph(graphData, this);

        this.graphsData.splice(index + 1, 0, graphData);
        this.graphs.splice(index + 1, 0, graph);

        graph.setCountryData(this.countriesData[graphData.name]);

        this.rootElement.childNodes[index].after(graph.rootElement);
    }

    removeGraph(index) {
        if (this.graphsData.length === 1) return;

        /* eslint-disable-next-line no-alert, no-restricted-globals */
        if (!confirm('Are you sure you want to delete this graph?')) return;

        const graph = this.graphs[index];

        this.graphsData.splice(index, 1);
        this.graphs.splice(index, 1);

        graph.rootElement.remove();

        for (const key of Object.keys(graph)) {
            graph[key] = undefined;
        }
    }

    renderTo(parentDomElement) {
        parentDomElement.append(this.rootElement);

        for (const graph of this.graphs) {
            graph.renderScroll();
        }
    }
}
