'use strict';

const ul = document.querySelector('.geopoints');
const logo = document.querySelector('.logo');
const form = document.querySelector('.form');
const logoFormRow = document.querySelector('.logo-form-row');
const inputName = document.querySelector('.form__input--name');
const inputDifficulty = document.querySelector('.form__input--difficulty');
const inputSize = document.querySelector('.form__input--size');
const inputTerrain = document.querySelector('.form__input--terrain');
const inputDate = document.querySelector('.form__input--date');

class Geopoint {
  id = (Date.now() + '').slice(-10);

  constructor(coords, name, difficulty, size, terrain, date) {
    this.coords = coords;
    this.name = name;
    this.difficulty = difficulty;
    this.size = size;
    this.terrain = terrain;
    this.date = date;
  }
}

////////////////////////////
// APPLICATION ARCHITECTURE
////////////////////////////
class App {
  #map;
  #newMarker;
  #mapEvent;
  #geopoints = [];

  constructor() {
    // Get User's position
    this._getPosition();
    // Get data from local storage
    this._getLocalStorage();

    form.addEventListener('submit', this._newGeopoint.bind(this));
    logo.addEventListener('click', this._hideForm);
    ul.addEventListener('click', this._moveToPopup.bind(this));
    ul.addEventListener('click', this._removeGeopoint.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on #map
    this.#map.on('click', mapEvent => {
      this.#mapEvent = mapEvent;
      this._showForm();
      clearInputs();
      if (this.#newMarker) {
        this.#newMarker.remove();
      }

      const { lat, lng } = mapEvent.latlng;

      this.#newMarker = L.marker([lat, lng]).addTo(this.#map);
    });
    for (let geopoint of this.#geopoints) {
      this._renderGeopointMarker(geopoint);
    }
  }

  _showForm() {
    form.classList.remove('hidden');
    form.classList.add('form-active');

    logoFormRow.classList.remove('logo-form-row-centered');
    // logo.classList.remove('logo-centered');
    ul.classList.remove('geopoints-up');
    inputName.focus();
  }

  _hideForm() {
    form.classList.add('hidden');
    logoFormRow.classList.add('logo-form-row-centered');
    // logo.classList.add('logo-centered');
    ul.classList.add('geopoints-up');
  }

  _newGeopoint(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    // Get data from the form
    const name = inputName.value;
    const difficulty = +inputDifficulty.value;
    const size = inputSize.value;
    const terrain = +inputTerrain.value;
    const date = inputDate.value;
    const coords = [lat, lng];
    // Check if data is valid

    if (name.length > 50) {
      alert('Name must be shorter than 50 letters.');
      return;
    }
    if (!difficulty || !terrain) {
      alert('Please enter all data before adding new Geocache Point');
      return;
    }
    if (size === '') {
      alert('Please select the size before adding new Geocache Point');
    }
    if (date === '') {
      alert('Please select the date before adding new Geocache Point');
    }
    // Create geopoint object

    const newGeopoint = new Geopoint(
      coords,
      name,
      difficulty,
      size,
      terrain,
      date
    );

    // Add new object to geopoints array
    this.#geopoints.push(newGeopoint);

    // Render marker popup
    this._renderMarkerPopup();

    // Render geopoint on list
    this._renderGeopoint(newGeopoint);

    // Hide form + input fields

    this._hideForm();

    // Set local storage to all geopoints
    this._setLocalStorage();
  }

  _renderMarkerPopup() {
    let popupContent = 'Geocache point';
    if (inputName.value.length > 0) {
      popupContent = inputName.value;
    }
    this.#newMarker
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${addClassName(inputDifficulty.value)}-popup`,
        })
      )
      .setPopupContent(popupContent)
      .openPopup();

    this.#newMarker = undefined;
  }

  _renderGeopointMarker(geopoint) {
    let popupContent = 'Geocache point';
    if (geopoint.name.length > 0) {
      popupContent = geopoint.name;
    }
    const marker = L.marker(geopoint.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${addClassName(geopoint.difficulty)}-popup`,
        })
      )
      .setPopupContent(popupContent)
      .openPopup();
  }

  _renderGeopoint(geopoint) {
    const newGeopoint = document.createElement('li');
    newGeopoint.classList.add('geopoint');
    // prettier-ignore
    newGeopoint.classList.add(`geopoint--${addClassName(geopoint.difficulty)}`);
    newGeopoint.dataset.id = geopoint.id;
    const html = `
          <h2 class="geopoint__title">${geopoint.name}</h2>
           <button class="close-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="geopoint__details">
            <span class="geopoint__icon">⭐</span>
            <span class="geopoint__value">${geopoint.difficulty}</span>
            <span class="geopoint__unit">/5</span>
          </div>
          <div class="geopoint__details">
            <span class="geopoint__icon">📏</span>
            <span class="geopoint__value">${geopoint.size}</span>
            <span class="geopoint__unit"></span>
          </div>
          <div class="geopoint__details">
            <span class="geopoint__icon">⛰️</span>
            <span class="geopoint__value">${geopoint.terrain}</span>
            <span class="geopoint__unit">/5</span>
          </div>
          <div class="geopoint__details">
            <span class="geopoint__icon">🗓️</span>
            <span class="geopoint__value">${getDateMonthAndDay(
              geopoint.date
            )}</span>
            <span class="geopoint__unit"></span>
          </div>
    `;
    newGeopoint.innerHTML = html;
    ul.prepend(newGeopoint);
  }

  _moveToPopup(e) {
    const geopointEl = e.target.closest('.geopoint');
    if (geopointEl) {
      const id = geopointEl.dataset.id;
      for (let geopoint of this.#geopoints) {
        if (geopoint.id === id) {
          this.#map.setView(geopoint.coords, 13, {
            animate: true,
            pan: { duration: 1 },
          });
          return;
        }
      }
    }
  }

  _removeGeopoint(e) {
    const closeButtonEl = e.target.closest('.close-button');
    if (closeButtonEl) {
      const choseGeopoint = e.target.closest('.geopoint');
      let choseGeopointObject;
      for (let geopoint of this.#geopoints) {
        if (geopoint.id === choseGeopoint.dataset.id) {
          choseGeopointObject = geopoint;
          break;
        }
      }

      choseGeopoint.remove();
      this.#geopoints.pop(choseGeopointObject);
      this._setLocalStorage();

      for (let [key, value] of Object.entries(this.#map._layers)) {
        if (value._latlng) {
          const { lat, lng } = value._latlng;
          if (
            lat === choseGeopointObject.coords[0] &&
            lng === choseGeopointObject.coords[1]
          ) {
            if (this.#map._layers[key]) {
              this.#map._layers[key].remove();
            }
          }
        }
      }
    }
  }

  _setLocalStorage() {
    localStorage.setItem('geopoints', JSON.stringify(this.#geopoints));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('geopoints'));
    if (!data) {
      return;
    }
    this.#geopoints = data;
    for (let geopoint of this.#geopoints) {
      this._renderGeopoint(geopoint);
    }
  }

  reset() {
    localStorage.clear();
    location.reload();
  }
}

const app = new App();

// help functions
function addClassName(difficulty) {
  let className;
  if (difficulty <= 2) {
    className = 'easy';
  } else if (difficulty == 3) {
    className = 'medium';
  } else if (difficulty <= 5) {
    className = 'hard';
  }
  return className;
}

function clearInputs() {
  inputName.value = '';
  inputDifficulty.value = '';
  inputSize.value = '';
  inputTerrain.value = '';
  inputDate.value = getTodayDate();
}

function getTodayDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  today = yyyy + '-' + mm + '-' + dd;
  return today;
}

function getDateMonthAndDay(date) {
  let dateObject = new Date(date);

  let dd = dateObject.getDate();
  let mm = dateObject.getMonth() + 1;

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  return dd + '.' + mm;
}
