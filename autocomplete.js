
class AutoCompleteWidget {

	constructor( autoCompleteSection, renderOption, onOptionSelection, getInputValue, fetchData) {

		this.autoCompleteSection = autoCompleteSection;
		this.renderOption = renderOption;
		this.onOptionSelection = onOptionSelection;
		this.getInputValue = getInputValue;
		this.fetchData = fetchData;

		this.template = `
			 <label><b></b></label>
			  <input class="searchbar" placeholder="Search By Username"/>
			  <div class="dropdown">
			    <div class="dropdown-menu">
			      <div class="dropdown-content optionMenuDisplay"></div>
			    </div>
			  </div>
		`;

		this.autoCompleteSection.insertAdjacentHTML("afterbegin", this.template);

		 this.input = this.autoCompleteSection.querySelector(".searchbar");
		 this.optionDisplay = this.autoCompleteSection.querySelector(".dropdown");
		 this.optionMenuDisplay = this.autoCompleteSection.querySelector(".optionMenuDisplay");

		 this.input.addEventListener("input", debounceHelperFunc(this.searchOnInput));

		// Closing the dropdown menu after clicking anywhere on the screen apart from the contents of the dropdown element
		document.addEventListener("click", event => {
			// if the autocomplete widget doesn't contain the element that was clicked on
			if (!this.autoCompleteSection.contains(event.target)) {
				this.optionDisplay.classList.remove("is-active");
			}
		});

	} 
	 // Search the API anytime the input changes
	searchOnInput = async event => {
		const optionsResult = await this.fetchData(String(event.target.value));

		// Clears the dropdown menu if there's any content there
		this.optionMenuDisplay.innerHTML = ``;

		this.optionDisplay.classList.add("is-active");

		// Renders the option
		optionsResult.forEach(option => {
			const optionLink = document.createElement("a");

			// Closes the dropdown menu if there's no return value for option i.e no text in the input box
			if (!optionsResult.length) {
				this.optionDisplay.classList.remove("is-active");
				// Jumps out of the function
				return;
			}

			optionLink.classList.add("dropdown-item");
			optionLink.innerHTML = this.renderOption(option);

			// What to do when an option returned from the search is clicked on
			optionLink.addEventListener("click", event => {
				this.optionDisplay.classList.remove("is-active");
				this.input.value = this.getInputValue(option);
				this.onOptionSelection(option);
			});

			this.optionMenuDisplay.appendChild(optionLink);
		});
	}

};