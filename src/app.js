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

window.validateSortOrder = async function() {
    try {
        const selectedOptionSetId = document.getElementById("optionSetSelect").value;
        const startSort = parseInt(document.querySelector("input[name=\"startSort\"]:checked").value);
        const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${selectedOptionSetId}&paging=false`);
      
        let options = response.options;
        options.sort((a, b) => a.sortOrder - b.sortOrder);

        let gaps = 0;
        let isStartIndexCorrect = options.length > 0 && options[0].sortOrder === startSort;

        options.reduce((prevSortOrder, currentOption) => {
            if (currentOption.sortOrder !== prevSortOrder + 1) {
                gaps++;
            }
            return currentOption.sortOrder;
        }, startSort - 1);

        let resultMessage = `Validation Result:\n- Start index is ${isStartIndexCorrect ? "correct" : "incorrect"}.\n- Number of gaps in sort order: ${gaps}`;
        document.getElementById("result").textContent = resultMessage;
      
    } catch (error) {
        document.getElementById("result").textContent = "Error validating option set: " + error;
    }
};


document.getElementById("validateButton").addEventListener("click", window.validateSortOrder);
document.getElementById("sortButton").addEventListener("click", window.fixSortOrder);
