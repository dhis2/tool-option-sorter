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
    const selectElement = document.getElementById("optionSetSelect");

    sortButton.addEventListener("click", window.fixSortOrder);
    selectElement.addEventListener("change", () => {
        const isOptionSetSelected = selectElement.value !== "";
        sortButton.disabled = !isOptionSetSelected;
        updateValidateDropdown(isOptionSetSelected); // Update validate dropdown state
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
    validateButton.disabled = false;
});



async function fetchOptionSets(choices) {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        choices.setChoices(optionSets.optionSets.map(optionSet => ({
            value: optionSet.id,
            label: optionSet.name
        })), "value", "label", false);

        const selectElement = document.getElementById("optionSetSelect");
        selectElement.disabled = false; // Enable the dropdown after options are added
        choices.enable(); // Enable the choices dropdown as well

        document.getElementById("validateButton").disabled = false; // Enable the validate button

        console.log(selectElement.value);
        updateValidateDropdown(false);
    } catch (error) {
        document.getElementById("result").textContent = "Error fetching option sets: " + error;
    }
}


function updateValidateDropdown(isOptionSetSelected) {
    const selectedOption = document.getElementById("validateSelectedDropdown");
    if (isOptionSetSelected) {
        selectedOption.style.display = "block";
    } else {
        selectedOption.style.display = "none";
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

async function validateSelectedOptionSet() {
    try {
        const selectedOptionSetId = document.getElementById("optionSetSelect").value;
        const response = await d2Get(`/api/options.json?fields=:owner&filter=optionSet.id:eq:${selectedOptionSetId}&paging=false`);

        let options = response.options;
        options.sort((a, b) => a.sortOrder - b.sortOrder);

        let gaps = 0;
        let actualStartIndex = options.length > 0 ? options[0].sortOrder : null;
        let previousSortOrder = actualStartIndex;

        for (let i = 1; i < options.length; i++) {
            if (options[i].sortOrder !== previousSortOrder + 1) {
                gaps++;
            }
            previousSortOrder = options[i].sortOrder;
        }

        let resultTableBody = `
            <tr>
                <td>${document.getElementById("optionSetSelect").selectedOptions[0].text}</td>
                <td>${selectedOptionSetId}</td>
                <td>${actualStartIndex}</td>
                <td>${gaps}</td>
            </tr>
        `;

        document.getElementById("result-details").style.display = "none";
        document.getElementById("result-table").querySelector("tbody").innerHTML = resultTableBody;
        document.getElementById("result").style.display = "block";
        document.getElementById("result-table").style.display = "table";

    } catch (error) {
        document.getElementById("result-message").textContent = "Error validating option set:";
        document.getElementById("result-details").innerHTML = `<li>${error}</li>`;
        document.getElementById("result-details").style.display = "block";
        document.getElementById("result-table").style.display = "none";
    }
}

async function validateAllOptionSets() {
    try {
        const optionSets = await d2Get("/api/optionSets.json?fields=name,id&paging=false");
        const expectedStartIndex = parseInt(document.querySelector("input[name=\"startSort\"]:checked").value);
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
            let actualStartIndex = options.length > 0 ? options[0].sortOrder : null;
            let previousSortOrder = actualStartIndex;

            for (let j = 1; j < options.length; j++) {
                if (options[j].sortOrder !== previousSortOrder + 1) {
                    gaps++;
                }
                previousSortOrder = options[j].sortOrder;
            }
            console.log("OptionSet: ", optionSet.name, "StartIndex: ", actualStartIndex, "Gaps: ", gaps);

            if (actualStartIndex != expectedStartIndex || gaps > 0) {
                validationResults.push({
                    name: optionSet.name,
                    id: optionSet.id,
                    startIndex: actualStartIndex,
                    gaps: gaps
                });
            }

            // Update progress bar
            const progress = ((i + 1) / optionSets.optionSets.length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        progressContainer.style.display = "none";

        let resultTableBody = validationResults.map(result => `
            <tr>
                <td>${result.name}</td>
                <td>${result.id}</td>
                <td>${result.startIndex}</td>
                <td>${result.gaps}</td>
            </tr>
        `).join("");

        document.getElementById("result-details").style.display = "none";
        document.getElementById("result-table").querySelector("tbody").innerHTML = resultTableBody;
        document.getElementById("result").style.display = "block";
        document.getElementById("result-table").style.display = "table";

    } catch (error) {
        document.getElementById("result-message").textContent = "Error validating option sets:";
        document.getElementById("result-details").innerHTML = `<li>${error}</li>`;
        document.getElementById("result-details").style.display = "block";
        document.getElementById("result-table").style.display = "none";
        document.getElementById("validationProgress").style.display = "none";
    }
}


