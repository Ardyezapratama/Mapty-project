"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
	date = new Date();
	id = Date.now().toString().slice(-10);
	constructor(coords, distance, duration) {
		this.coords = coords; //[lat, lng]
		this.distance = distance; // in km
		this.duration = duration; // in min
	}
}

class Running extends Workout {
	type = "running";
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
	}

	calcPace() {
		// min/km
		this.pace = this.duration / this.distance;
		return this.pace;
	}
}
class Cycling extends Workout {
	type = "cycling";
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevationGain = elevationGain;
		this.calcSpeed();
	}

	calcSpeed() {
		// Km / h
		this.speed = this.distance / (this.duration / 60);
		return this.speed;
	}
}

// const run1 = new Running([-8.7870211, 115.1745831], 5.2, 24, 178);
// const cycling1 = new Cycling([-8.7870211, 115.1745831], 27, 95, 523);
// console.log(run1, cycling1);

// Application Class

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
	#map;
	#mapEvt;
	#workouts = [];

	constructor() {
		// Get the position
		this._getPosition();

		// Sumbit Handler
		form.addEventListener("submit", this._newWorkout.bind(this));

		// Toggle elevation input
		inputType.addEventListener("change", this._toggleEleveationField);
	}

	_getPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				this._loadMap.bind(this),
				function () {
					alert("Could not get your position");
				}
			);
		}
	}

	_loadMap(position) {
		const { latitude } = position.coords;
		const { longitude } = position.coords;

		const coords = [latitude, longitude];
		this.#map = L.map("map").setView(coords, 15);

		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);
		// Handle Click on map
		this.#map.on("click", this._showForm.bind(this));
	}

	_showForm(mapE) {
		this.#mapEvt = mapE;
		form.classList.remove("hidden");
		inputDistance.focus();
	}

	_toggleEleveationField() {
		inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
		inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
	}

	_newWorkout(evt) {
		const validInput = (...inputs) =>
			inputs.every((inp) => Number.isFinite(inp));

		const positiveInput = (...inputs) => inputs.every((inp) => inp > 0);
		evt.preventDefault();

		// Get data form the form
		const type = inputType.value;
		const distance = Number(inputDistance.value);
		const duration = Number(inputDuration.value);
		const { lat, lng } = this.#mapEvt.latlng;
		let workout;

		// If workout running, create running object;
		if (type === "running") {
			const cadence = Number(inputCadence.value);
			// Check if data is valid
			if (
				!validInput(distance, duration, cadence) ||
				!positiveInput(distance, duration, cadence)
			)
				return alert("Input have to be positive number!");

			workout = new Running([lat, lng], distance, duration, cadence);
		}

		// If workout cycling, create cycling object;
		if (type === "cycling") {
			const elevation = Number(inputElevation.value);
			// Check if data is valid
			if (
				!validInput(distance, duration, elevation) ||
				!positiveInput(distance, duration, elevation)
			)
				return alert("Input have to be positive number");

			workout = new Cycling([lat, lng], distance, duration, elevation);
		}

		// Add new object to workout array
		this.#workouts.push(workout);

		// Render workout on map as a marker
		this.renderWorkoutMarker(workout);

		// Render workout list

		// Hide the form and clear the input field
		inputDistance.value =
			inputDuration.value =
			inputCadence.value =
			inputElevation.value =
				"";
	}

	renderWorkoutMarker(workout) {
		L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					className: `${workout.type}-popup`,
				})
			)
			.setPopupContent(`${workout.type}`)
			.openPopup();
	}
}

const app = new App();
