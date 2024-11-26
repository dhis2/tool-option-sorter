"use strict";

//JS
import { d2Get, d2PostJson } from "./js/d2api.js";

//CSS
import "./css/header.css";
import "./css/style.css";

document.addEventListener("DOMContentLoaded", async () => {
    await fetchOptionSets();
});

async function fetchOptionSets() {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        const selectElement = document.getElementById("optionSetSelect");
        selectElement.innerHTML = optionSets.optionSets.map(optionSet => 
            `<option value="${optionSet.id}">${optionSet.name}</option>`
        ).join("");
    } catch (error) {
        document.getElementById("result").textContent = "Error fetching option sets: " + error;
    }
}

window.fixSortOrder = async function() {
    try {
        const selectedOptionSetId = document.getElementById("optionSetSelect").value;
        const startSort = document.querySelector("input[name=\"startSort\"]:checked").value;
        const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${selectedOptionSetId}&paging=false`);
      
        let options = response.options;
        options.sort((a, b) => a.sortOrder - b.sortOrder);
        options.forEach((option, index) => option.sortOrder = parseInt(startSort) + index);

        const payload = { options };
        await d2PostJson("/api/metadata", payload);

        document.getElementById("result").textContent = `Successfully updated ${options.length} options.`;
    } catch (error) {
        document.getElementById("result").textContent = "Error updating option set: " + error;
    }
};

document.getElementById("sortButton").addEventListener("click", window.fixSortOrder);
