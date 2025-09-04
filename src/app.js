"use strict";

//JS
import { d2Get, d2PostJson } from "./js/d2api.js";
import Choices from "choices.js";
import M from "materialize-css";

//CSS
import "./css/header.css";
import "./css/style.css";
import "materialize-css/dist/css/materialize.min.css";
import "choices.js/public/assets/styles/choices.min.css";

document.addEventListener("DOMContentLoaded", async () => {
    const sortButton = document.getElementById("sortButton");
    const validateButton = document.getElementById("validateButton");
    const validateAllButton = document.getElementById("validateAllButton");
    const selectElement = document.getElementById("optionSetSelect");

    sortButton.addEventListener("click", window.fixSortOrder);
    validateButton.addEventListener("click", () => window.validateSortOrder("selected"));
    validateAllButton.addEventListener("click", () => window.validateSortOrder("all"));
    selectElement.addEventListener("change", () => {
        const isOptionSetSelected = selectElement.value !== "";
        sortButton.disabled = !isOptionSetSelected;
        validateButton.disabled = !isOptionSetSelected;
    });

    const choices = new Choices(selectElement, {
        searchEnabled: false,
        placeholder: true,
        placeholderValue: "Choose an OptionSet"
    });

    const elems = document.querySelectorAll(".dropdown-trigger");
    M.Dropdown.init(elems, {coverTrigger: false});

    const modalElems = document.querySelectorAll(".modal");
    M.Modal.init(modalElems);

    await fetchOptionSets(choices);
    validateButton.disabled = true;
    sortButton.disabled = true;
});



async function fetchOptionSets(choices) {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        choices.setChoices(optionSets.optionSets.map(optionSet => ({
            value: optionSet.id,
            label: optionSet.name
        })), "value", "label", false);

        const selectElement = document.getElementById("optionSetSelect");
        if (selectElement) {
            selectElement.disabled = false; // Enable the dropdown after options are added
        }
        choices.enable(); // Enable the choices dropdown as well

        const validateButton = document.getElementById("validateButton");
        if (validateButton) {
            validateButton.disabled = false; // Enable the validate button
        }
    } catch (error) {
        console.error("Error fetching option sets:", error);
        const resultElem = document.getElementById("result");
        if (resultElem) {
            resultElem.textContent = "Error fetching option sets: " + error;
        }
    }
}


window.fixSortOrder = async function() {
    try {
        const selectedOptionSetId = document.getElementById("optionSetSelect").value;
        const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${selectedOptionSetId}&paging=false`);
      
        let options = response.options;
        options.sort((a, b) => a.sortOrder - b.sortOrder);
        // Only fix gaps, start from the minimum sortOrder
        const minSortOrder = options.length > 0 ? options[0].sortOrder : 1;
        options.forEach((option, index) => option.sortOrder = minSortOrder + index);

        const payload = { options };
        await d2PostJson("/api/metadata", payload);

        M.toast({html: `Successfully updated ${options.length} options.`});
    } catch (error) {
        document.getElementById("modal-error-message").textContent = error;
        const errorModal = M.Modal.getInstance(document.getElementById("errorModal"));
        errorModal.open();
    }
};

window.validateSortOrder = async function(validateOption) {
    if (validateOption === "selected") {
        await validateSelectedOptionSet();
    } else {
        await validateAllOptionSets();
    }
};

function addToResultTable(resultTableBody) {
    const resultTableBodyElem = document.getElementById("result-body");
    resultTableBodyElem.innerHTML = resultTableBody; // Set innerHTML to tbody
}

async function validateSelectedOptionSet() {
    try {
        const selectedOptionSetId = document.getElementById("optionSetSelect").value;
        const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${selectedOptionSetId}&paging=false`);
        let options = response.options;
        options.sort((a, b) => a.sortOrder - b.sortOrder);
        let gaps = 0;
        let previousSortOrder = options.length > 0 ? options[0].sortOrder : null;

        for (let i = 1; i < options.length; i++) {
            if (options[i].sortOrder !== previousSortOrder + 1) {
                gaps++;
            }
            previousSortOrder = options[i].sortOrder;
        }

        let resultTableBody = "";
        if (gaps > 0) {
            resultTableBody = `
                <tr>
                    <td>${document.getElementById("optionSetSelect").selectedOptions[0].text}</td>
                    <td>${selectedOptionSetId}</td>
                    <td>${gaps}</td>
                </tr>
            `;
        }

        addToResultTable(resultTableBody);

        // Display the result section
        document.getElementById("result").style.display = "block";

    } catch (error) {
        console.error("Error validating option set:", error);
        let resultMessageElem = document.getElementById("result-message");
        resultMessageElem.textContent = "Error validating option set:" + error;
        resultMessageElem.style.display = "block";
    }
}

async function validateAllOptionSets() {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        let validationResults = [];

        const progressBar = document.getElementById("validationProgressBar");
        const progressContainer = document.getElementById("validationProgress");
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";

        for (let i = 0; i < optionSets.optionSets.length; i++) {
            const optionSet = optionSets.optionSets[i];
            const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${optionSet.id}&paging=false`);
            let options = response.options;
            options.sort((a, b) => a.sortOrder - b.sortOrder);

            let gaps = 0;
            let previousSortOrder = options.length > 0 ? options[0].sortOrder : null;

            for (let j = 1; j < options.length; j++) {
                if (options[j].sortOrder !== previousSortOrder + 1) {
                    gaps++;
                }
                previousSortOrder = options[j].sortOrder;
            }
            if (gaps > 0) {
                validationResults.push({
                    name: optionSet.name,
                    id: optionSet.id,
                    gaps: gaps
                });
            }
            // Update progress bar
            const progress = ((i + 1) / optionSets.optionSets.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        progressContainer.style.display = "none";

        let resultTableBody = "";
        if (validationResults.length > 0) {
            resultTableBody = validationResults.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.id}</td>
                    <td>${result.gaps}</td>
                </tr>
            `).join("");
            document.getElementById("result-message").style.display = "none";
            document.getElementById("result-table").style.display = "table";
        } else {
            let resultMessageElem = document.getElementById("result-message");
            resultMessageElem.textContent = "No sort order gaps found";
            resultMessageElem.style.display = "block";
            document.getElementById("result-table").style.display = "none";
        }
        
        addToResultTable(resultTableBody);
        
        document.getElementById("result").style.display = "block";
    } catch (error) {
        document.getElementById("result-message").textContent = "Error validating option sets:";
        document.getElementById("result-details").innerHTML = `<li>${error}</li>`;
        document.getElementById("result-table").style.display = "none";
        document.getElementById("validationProgress").style.display = "none";
    }
}
