"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
		evt.preventDefault();

		// Clear input fields
		inputDistance.value =
			inputDuration.value =
			inputCadence.value =
			inputElevation.value =
				"";

		// Display marker
		const { lat, lng } = this.#mapEvt.latlng;
		L.marker([lat, lng])
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					className: "running-popup",
				})
			)
			.setPopupContent("Workout")
			.openPopup();
	}
}

const app = new App();
