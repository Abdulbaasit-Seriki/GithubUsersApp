const carouselSection = document.querySelector(".carouselSection");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");

// Functions

const fetchUserImages = async () => {
			let response, data;
			try {
				response = await fetch(`https://api.github.com/users`);
				if (!response.ok) {
					throw new Error(`${response.status}`)
				}
			}
			catch(err) {
				return err;
			}

			try {
				data = await response.json();

				for(let userImage of data) {
					// create an image tag
					userImageTag = document.createElement("img");
					// let the source be the url of the image
					userImageTag.src = userImage.avatar_url;
					// add class of userImage to it
					userImageTag.classList.add("userImage");
					// append it to the carouselsection
					carouselSection.append(userImageTag);
					userImageTag.addEventListener("click", event => {
						getUserDetails(userImage)
						.then( user => {
							userDetailsTemplate(user)
						});
					});
				}
				userSlides = document.querySelectorAll(".userImage");
			}
			catch(err) {
				return err;
			}
			return Promise.resolve(data);
		}

const getUserDetails = async (user) => {
let data, response;
    try {
    	if (user.login) {
    		response = await fetch(`https://api.github.com/users/${user.login}`);
    	} else {
    		response = await fetch(`https://api.github.com/users/${user}`);
    	}
        
        // user.login ? response = await fetch(`https://api.github.com/users/${user.login}`) : 
        // 				response = await fetch(`https://api.github.com/users/${user.login}`);

        if (!response.ok) {
            throw new Error(`${response.status}`)
        }
    }
    catch (err) {
            console.log(err);
    }
    data = response.json();
   	return Promise.resolve(data);
}

const userDetailsTemplate = (user) => {

	document.querySelector(".name").style.backgroundImage = `url(${user.avatar_url})`;
	document.querySelector(".name h2").innerHTML = user.name;
	document.querySelector(".about").innerHTML =  `
			<article class="notification black">
	      		<p class="title">${user.login}</p>
	      		<p class="subtitle">GitHub Username</p>
	    	</article>
	    	<article class="notification black">
	      		<p class="content">${user.bio}</p>
	      		<p class="subtitle">A little about ${user.name}</p>
	    	</article>
			<article class="notification">
	      		<a href="${user.blog}" class="title">${user.blog}</a>
	      		<p class="subtitle">Website or Blog</p>
	    	</article>
	    	<article class="notification black">
	      		<p class="title">${user.company}</p>
	      		<p class="subtitle">Workplace</p>
	    	</article>
	    	<article class="notification black">
	      		<p class="title">${user.public_repos}</p>
	      		<p class="subtitle">Repositories</p>
	    	</article>
	    	<article class="notification black">
	      		<p class="title">${user.followers}</p>
	      		<p class="subtitle">Followers</p>
	    	</article>
	    	<article class="notification">
				<a href="${user.html_url}">${user.login}</a>
	      		<p class="subtitle">Visit ${user.login}'s GitHub Account</p>
	    	</article>
		`;
}

const debounceHelperFunc = (callback, delay = 500) => {
	let timeOutId;
	// It returns a function which serves as a shield or better still, a wrapper around the function
	return (...args) => {
		// If timeout is defined as in if time out has a value, clear the time out.
		// This if statment prevents the function from saerching the aPI because it'll have cleared the interval 
		// before 1000 milliseconds
		if (timeOutId) {
			clearTimeout(timeOutId);
		}
		timeOutId = setTimeout(() => {
			callback.apply(null, args);
		}, delay);
	};
}

// Carousel Functionality
let userSlideIndex = 1;

const showUserSlides = n => {

	if (n > userSlides.length) {
		userSlideIndex = 1;
	} 
	if (n < 1) {
		userSlideIndex = userSlides.length;
	}
	for(let userSlide of userSlides) {
		userSlide.style.display = "none";
	}

	userSlides[userSlideIndex - 1].style.display = "block"
};

const displayPrevOrNextSlide = n => {
	clearInterval(slideTimer);

	if (n < 0) {
		showUserSlides(userSlideIndex -= 1);
	} else {
		showUserSlides(userSlideIndex += 1);
	}
	if (n === -1) {
		setInterval(() => {
			displayPrevOrNextSlide(n + 2)
		}, 3000);
	} else {
		slideTimer = setInterval(() => {
			displayPrevOrNextSlide(n + 1)
		}, 3000);
	}
};

// Pausing the slide show

const pauseSlideShow = () => {
	clearInterval(slideTimer);
	userSlides[userSlideIndex - 1].classList.add("pause");
}

// resuming the slideshow

const resumeSlideShow = () => {
	clearInterval(slideTimer);

	userSlides[userSlideIndex - 1].classList.remove("pause");
	slideTimer = setInterval(() => {
		displayPrevOrNextSlide(userSlideIndex)
	}, 3000);
}

						/* END OF CAROUSEL FUNCTIONALITY*/


window.addEventListener("load", (event) => {


	const userName = window.prompt(`Please Enter Your Github Username`);
	
	getUserDetails(userName)
	.then( user => {
		userDetailsTemplate(user)
	});

	fetchUserImages()
	.then( data => {
		showUserSlides(userSlideIndex);
		slideTimer = setInterval(() => {
			displayPrevOrNextSlide(1);
		}, 3000);
	})
	.catch(err => {
		throw new Error(err);
	})

	nextButton.addEventListener("click", (event) => {
		event.preventDefault();
		displayPrevOrNextSlide(1);
	});

	prevButton.addEventListener("click", (event) => {
		event.preventDefault();
		displayPrevOrNextSlide(-1);
	});

	carouselSection.addEventListener("mouseenter", pauseSlideShow);
	carouselSection.addEventListener("mouseleave", resumeSlideShow);

	const autoCompleteWidget = new AutoCompleteWidget (

		// Where to append the searchbar
		document.querySelector(".summary"),

		// Shows how to render an individual option returned from the search
		renderOption = (user) => {
			return `<img src="${user.avatar_url}" />
					${user.login}
			`
		},

		// What to do when an option is clicked on
		onOptionSelection = (user) => {
			getUserDetails(user)
			.then( user => {
				userDetailsTemplate(user)
			});
		},

		getInputValue = (user) => {
			return user.login;
		},

		fetchUsersList = async (user) => {
			let response, data;
			try {
				response = await fetch(`https://api.github.com/search/users?q=${user}+repos:%3E1`);
				if (!response.ok) {
					throw new Error(`${response.status}`)
				}
			}
			catch(err) {
				return err;
			}

			try {
				data = await response.json();
				return data.items;
			}
			catch(err) {
				return err;
			}
		}
	);
});