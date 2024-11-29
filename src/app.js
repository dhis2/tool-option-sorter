"use strict";

//JS
import { d2Get, d2PostJson } from "./js/d2api.js";
import Choices from "choices.js";

//CSS
import "./css/header.css";
import "./css/style.css";
import "materialize-css/dist/css/materialize.min.css";
import "choices.js/public/assets/styles/choices.min.css";

document.addEventListener("DOMContentLoaded", async () => {
    const selectElement = document.getElementById("optionSetSelect");
    const choices = new Choices(selectElement, { searchEnabled: false });
    await fetchOptionSets(choices);
});

async function fetchOptionSets(choices) {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        choices.setChoices(optionSets.optionSets.map(optionSet => ({
            value: optionSet.id,
            label: optionSet.name
        })), "value", "label", true);
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

        document.getElementById("result-message").textContent = "Success:";
        document.getElementById("result-details").innerHTML = `<li>Successfully updated ${options.length} options.</li>`;
        document.getElementById("result").style.display = "block";
    } catch (error) {
        document.getElementById("result-message").textContent = "Error updating option set:";
        document.getElementById("result-details").innerHTML = `<li>${error}</li>`;
        document.getElementById("result").style.display = "block";
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
        let previousSortOrder = isStartIndexCorrect ? startSort : options[0].sortOrder; // Use the first option's sortOrder if start index is incorrect

        for (let i = 1; i < options.length; i++) {
            if (options[i].sortOrder !== previousSortOrder + 1) {
                gaps++;
            }
            previousSortOrder = options[i].sortOrder;
        }

        let resultMessage = "Validation Result";
        let resultDetails = `
          <li>Start index ${isStartIndexCorrect ? "matches" : "doesn't match"} selection.</li>
          <li>Number of gaps in sort order: ${gaps}</li>
        `;
      
        document.getElementById("result-message").textContent = resultMessage;
        document.getElementById("result-details").innerHTML = resultDetails;
        document.getElementById("result").style.display = "block";

    } catch (error) {
        document.getElementById("result-message").textContent = "Error validating option set:";
        document.getElementById("result-details").innerHTML = `<li>${error}</li>`;
        document.getElementById("result").style.display = "block";
    }
};


document.getElementById("validateButton").addEventListener("click", window.validateSortOrder);
document.getElementById("sortButton").addEventListener("click", window.fixSortOrder);
