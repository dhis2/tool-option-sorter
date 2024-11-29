# User Manual for OptionSet Sorter Tool

This user manual provides step-by-step instructions on how to install and use the OptionSet Sorter app in DHIS2. Please follow the guidelines carefully to ensure the application works as intended.

---

## Table of Contents
1. [Installation](#installation)
2. [Using the App](#using-the-app)
    - [Navigating the UI](#navigating-the-ui)
    - [Selecting an OptionSet](#selecting-an-optionset)
    - [Validating OptionSets](#validating-optionsets)
    - [Updating Sort Order](#updating-sort-order)
3. [Warnings and Recommendations](#warnings-and-recommendations)
4. [Troubleshooting](#troubleshooting)

---

## Installation

### Step-by-Step Installation Guide

1. **Download the ZIP file:**
    - Obtain the `.zip` file of the OptionSet Sorter application.

2. **Log in to DHIS2:**
    - Open your DHIS2 instance in a web browser.
    - Log in with the appropriate credentials.

3. **Access the App Management:**
    - Navigate to the App Management section from the main menu.

4. **Upload the Application:**
    - Click on the "Install App" button.
    - Choose the "ZIP file" option.
    - Browse and select the OptionSet Sorter `.zip` file that you downloaded previously.
    - Confirm to install the application.

5. **Verify Installation:**
    - After the upload, the OptionSet Sorter app should be visible in the list of installed applications.
    - If not, refresh the page and check again.

---

## Using the App


### Selecting an OptionSet

1. **OptionSet Dropdown:**
    - A dropdown labeled "Select Option Set" will initially be disabled while loading OptionSets.
    - Once loaded, select the desired OptionSet from the dropdown list.
    - **Note:** The dropdown enables once the OptionSets have been loaded from the DHIS2 instance.

2. **Validation Start Index:**
    - Choose whether the sort order should start at 0 or 1 by selecting the corresponding radio button under "Start sort order at".
    - This used both for validation (i.e. identifying the optionSets where the start index does not match) and when updating (the updated sort order will start at 0 or 1 depending on selection)

2. **Validate Button:**
    - Click the "Validate" button. This will provide two options:
        - **Selected:** Validates the currently selected OptionSet (only available when an OptionSet is selected)
        - **All:** Validates all OptionSets available in the DHIS2 instance.

    - **Results:**
        - The validation results will be displayed in a table format, showing the OptionSet name, ID, start index, and any index gaps found.

### Updating Sort Order

1. **Update Sort Button:**
    - Click the "Update Sort" button to fix the sort order of the selected OptionSet based on the chosen start index.
    - A confirmation message will be displayed once the sort order has been updated successfully.

---

## Warnings and Recommendations

### Important Notices:

1. **Development/Test Environment:**
    - It is strongly recommended to use and test the app in a development or test environment. Avoid making changes directly in the production environment unless thoroughly tested.
    
2. **Metadata Access:**
    - The app only operates on metadata that the user has access to. Ensure you have the necessary permissions for all metadata you wish to manage.
    - For a full review, the user must have access to all relevant data in the metadata schema (e.g. with the ALL authority)
    - Ensure that all changes made using the app are reviewed and validated correctly to maintain the integrity of the metadata.

