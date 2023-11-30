const geocodeAPIKey = 'AIzaSyAYUHNleOyguSy_PmYTjtNXjWd0q8nmvnU'; 

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getSunriseSunsetDataAndUpdateDashboard(latitude, longitude);
            },
            (error) => {
                showError("Error getting current location. " + error.message);
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
}

function searchLocation() {
    const locationInput = document.getElementById('locationInput').value;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationInput)}&key=${geocodeAPIKey}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                const latitude = data.results[0].geometry.location.lat;
                const longitude = data.results[0].geometry.location.lng;
                getSunriseSunsetDataAndUpdateDashboard(latitude, longitude);
            } else {
                showError("Location not found.");
            }
        })
        .catch(error => {
            showError("Error fetching location data. " + error.message);
        });
}

function getSunriseSunsetData(latitude, longitude, date) {
    const formattedDate = date.toISOString().split('T')[0];
    const sunriseSunsetApiUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${formattedDate}`;

    return fetch(sunriseSunsetApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.sunrise && data.results.sunset) {
                return data.results;
            } else {
                throw new Error("Invalid response from the sunrise-sunset API.");
            }
        })
        .catch(error => {
            throw new Error("Error fetching sunrise-sunset data. " + error.message);
        });
}

function updateDashboard(todayData, tomorrowData) {
    const dashboardElement = document.getElementById('dashboard');
    dashboardElement.innerHTML = `
        <div id="today-data">
            <h2>Today</h2>
            <p>Sunrise: ${todayData.sunrise}</p>
            <p>Sunset: ${todayData.sunset}</p>
            <p>Dawn: ${todayData.dawn}</p>
            <p>Dusk: ${todayData.dusk}</p>
            <p>Day Length: ${todayData.day_length}</p>
            <p>Solar Noon: ${todayData.solar_noon}</p>
            <p>Time Zone: ${todayData.timezone}</p>
        </div>
        <div id="tomorrow-data">
            <h2>Tomorrow</h2>
            <p>Sunrise: ${tomorrowData.sunrise}</p>
            <p>Sunset: ${tomorrowData.sunset}</p>
            <p>Dawn: ${tomorrowData.dawn}</p>
            <p>Dusk: ${tomorrowData.dusk}</p>
            <p>Day Length: ${tomorrowData.day_length}</p>
            <p>Solar Noon: ${tomorrowData.solar_noon}</p>
        </div>
    `;

    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');

    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.classList.add('hidden');
}

function showError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
}

function getSunriseSunsetDataAndUpdateDashboard(latitude, longitude) {
    const todayPromise = getSunriseSunsetData(latitude, longitude, new Date());
    const tomorrowPromise = getSunriseSunsetData(
        latitude,
        longitude,
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    );

    Promise.all([todayPromise, tomorrowPromise])
        .then(([todayData, tomorrowData]) => updateDashboard(todayData, tomorrowData))
        .catch(error => showError(error.message));
}
