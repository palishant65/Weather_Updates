// ======================================================
//                 WEATHER APP JAVASCRIPT
// ======================================================


// ======================================================
// 1. HTML ELEMENTS SELECT KARNA
// ======================================================

// Search input
const searchInput = document.querySelector(".search-box input");

// Search button
const searchButton = document.querySelector(".search-box button");

// Main weather image
const weatherImage = document.querySelector(".weather-top img");

// City name
const cityName = document.querySelector(".weather-info h2");

// Date
const dateText = document.querySelector(".weather-info p");

// Main temperature
const temperature = document.querySelector(".weather-info h1");


// ======================================================
// 2. SMALL WEATHER CARDS
// ======================================================

const cards = document.querySelectorAll(".small-cards .card");

// Feels Like
const feelsLike = cards[0].querySelector("p");

// Humidity
const humidity = cards[1].querySelector("p");

// Wind
const wind = cards[2].querySelector("p");

// Precipitation
const precipitation = cards[3].querySelector("p");


// ======================================================
// 3. FORECAST ELEMENTS
// ======================================================

// Daily forecast container
const forecastContainer =
    document.querySelector(".forecast");

// Hourly dropdown
const hourlySelect =
    document.querySelector(".hour-title select");

// Hourly cards container
const hourCard =
    document.querySelector(".hour-card");

// °C / °F dropdown
const unitSelect =
    document.querySelector(".logo select");


// ======================================================
// 4. GLOBAL VARIABLES
// ======================================================

// Default city
let currentCity = "Dehradun";

// Weather data ko store karenge
let weatherData = null;

// Current unit
let currentUnit = "C";


// ======================================================
// 5. SEARCH BUTTON
// ======================================================

searchButton.addEventListener("click", () => {

    // Input se city ka naam lena
    const city = searchInput.value.trim();

    // Agar input empty hai
    if (city === "") {

        alert("Please enter a city name");

        return;
    }

    // Current city update
    currentCity = city;

    // Weather fetch
    getWeather(city);

});


// ======================================================
// 6. ENTER KEY SE SEARCH
// ======================================================

searchInput.addEventListener("keypress", (event) => {

    // Agar Enter press hua
    if (event.key === "Enter") {

        const city = searchInput.value.trim();

        // Agar input empty hai
        if (city === "") {
            return;
        }

        // Current city update
        currentCity = city;

        // Weather fetch
        getWeather(city);
    }

});


// ======================================================
// 7. MAIN WEATHER FUNCTION
// ======================================================

async function getWeather(city) {

    try {

        // ==================================================
        // CITY KI LOCATION FIND KARNA
        // ==================================================

        const locationResponse = await fetch(

            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`

        );


        // Response ko JSON mein convert
        const locationData =
            await locationResponse.json();


        // Agar city nahi mili
        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            alert("City not found!");

            return;
        }


        // First result
        const location =
            locationData.results[0];


        // Latitude
        const latitude =
            location.latitude;


        // Longitude
        const longitude =
            location.longitude;


        // City name
        const cityFromAPI =
            location.name;


        // Country
        const country =
            location.country;


        // ==================================================
        // WEATHER API
        // ==================================================

        const weatherResponse = await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`

        );


        // Weather response ko JSON mein convert
        weatherData =
            await weatherResponse.json();


        // API ke location ko store karna
        weatherData.location = {
            name: cityFromAPI,
            country: country
        };


        // ==================================================
        // CURRENT WEATHER
        // ==================================================

        updateCurrentWeather(
            cityFromAPI,
            country,
            weatherData
        );


        // ==================================================
        // DAILY FORECAST
        // ==================================================

        updateDailyForecast(weatherData);


        // ==================================================
        // HOURLY FORECAST
        // ==================================================

        // Pehle day ka hourly forecast
        updateHourlyForecast(
            weatherData,
            0
        );

    }


    // ==================================================
    // ERROR HANDLE
    // ==================================================

    catch (error) {

        console.log(
            "Weather Error:",
            error
        );

        alert(
            "Something went wrong. Please try again."
        );

    }

}


// ======================================================
// 8. CURRENT WEATHER UPDATE
// ======================================================

function updateCurrentWeather(
    city,
    country,
    data
) {

    // Current weather
    const current =
        data.current;


    // ==================================================
    // CITY
    // ==================================================

    cityName.textContent =
        `${city}, ${country}`;


    // ==================================================
    // TEMPERATURE
    // ==================================================

    temperature.textContent =
        formatTemperature(
            current.temperature_2m
        );


    // ==================================================
    // FEELS LIKE
    // ==================================================

    feelsLike.textContent =
        formatTemperature(
            current.apparent_temperature
        );


    // ==================================================
    // HUMIDITY
    // ==================================================

    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    // ==================================================
    // WIND
    // ==================================================

    wind.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    // ==================================================
    // PRECIPITATION
    // ==================================================

    precipitation.textContent =
        `${current.precipitation} mm`;


    // ==================================================
    // DATE
    // ==================================================

    const date =
        new Date();


    dateText.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // ==================================================
    // WEATHER IMAGE
    // ==================================================

    weatherImage.src =
        getWeatherImage(
            current.weather_code
        );


    weatherImage.alt =
        getWeatherDescription(
            current.weather_code
        );

}


// ======================================================
// 9. DAILY FORECAST
// ======================================================

function updateDailyForecast(data) {

    // Purane cards remove
    forecastContainer.innerHTML = "";


    const daily =
        data.daily;


    // 7 days
    for (let i = 0; i < 7; i++) {

        // Date
        const date =
            new Date(daily.time[i]);


        // Day name
        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        // Maximum temperature
        const maxTemp =
            daily.temperature_2m_max[i];


        // Minimum temperature
        const minTemp =
            daily.temperature_2m_min[i];


        // Weather code
        const weatherCode =
            daily.weather_code[i];


        // ==================================================
        // CREATE DAY CARD
        // ==================================================

        const day =
            document.createElement("div");


        day.classList.add("day");


        // Card HTML
        day.innerHTML = `

            <h4>${dayName}</h4>

            <img
                src="${getWeatherImage(weatherCode)}"
                alt="${getWeatherDescription(weatherCode)}"
            >

            <p>
                ${formatTemperature(maxTemp)}
                /
                ${formatTemperature(minTemp)}
            </p>

        `;


        // ==================================================
        // DAY CARD CLICK
        // ==================================================

        day.addEventListener("click", () => {

            // Selected day ka hourly forecast
            updateHourlyForecast(
                weatherData,
                i
            );


            // Dropdown ko same day par set karo
            hourlySelect.selectedIndex = i;

        });


        // Card ko container mein add
        forecastContainer.appendChild(day);

    }

}


// ======================================================
// 10. HOURLY FORECAST
// ======================================================
//
// IMPORTANT:
// Ab yahan "NOW" wala system hai.
//
// Aaj ke din:
//
// Now
// 2:00 AM
// 3:00 AM
// 4:00 AM
// 5:00 AM
// ...
//
// Future day select karne par:
// 12:00 AM
// 1:00 AM
// 2:00 AM
// ...
//
// ======================================================

function updateHourlyForecast(
    data,
    dayIndex
) {

    // Purane hourly cards remove
    hourCard.innerHTML = "";


    // API se hourly data
    const hourly =
        data.hourly;


    // ==================================================
    // AGAR AAJ KA DIN HAI
    // ==================================================

    if (dayIndex === 0) {

        // Current date/time
        const now =
            new Date();


        // Current hour
        const currentHour =
            now.getHours();


        // API mein current hour ka index
        let startIndex = 0;


        // Current hour find karna
        for (
            let i = 0;
            i < hourly.time.length;
            i++
        ) {

            const time =
                new Date(hourly.time[i]);


            if (
                time.getHours() === currentHour
            ) {

                startIndex = i;

                break;
            }
        }


        // ==================================================
        // NOW CARD
        // ==================================================

        const nowElement =
            document.createElement("div");


        // "hour" class
        nowElement.classList.add("hour");


        // Current temperature
        const nowTemperature =
            data.current.temperature_2m;


        // Current weather code
        const nowWeatherCode =
            data.current.weather_code;


        // Now card HTML
        nowElement.innerHTML = `

            <span>
                ${getWeatherEmoji(nowWeatherCode)}
            </span>

            <span>
                Now
            </span>

            <span>
                ${formatTemperature(nowTemperature)}
            </span>

        `;


        // Sabse pehle Now card add
        hourCard.appendChild(
            nowElement
        );


        // ==================================================
        // NOW KE BAAD KE HOURS
        // ==================================================

        // Current hour ke baad
        // 8 aur hours dikhao

        const endIndex =
            Math.min(
                startIndex + 9,
                hourly.time.length
            );


        for (
            let i = startIndex + 1;
            i < endIndex;
            i++
        ) {

            // Hour ka time
            const time =
                new Date(hourly.time[i]);


            // Hour
            const hour =
                time.getHours();


            // AM / PM
            const ampm =
                hour >= 12
                    ? "PM"
                    : "AM";


            // 12-hour format
            let displayHour =
                hour % 12;


            // 0 ko 12 banana
            if (displayHour === 0) {

                displayHour = 12;

            }


            // Temperature
            const hourTemperature =
                hourly.temperature_2m[i];


            // Weather code
            const weatherCode =
                hourly.weather_code[i];


            // ==================================================
            // HOURLY CARD CREATE
            // ==================================================

            const hourElement =
                document.createElement("div");


            hourElement.classList.add("hour");


            // Card HTML
            hourElement.innerHTML = `

                <span>
                    ${getWeatherEmoji(weatherCode)}
                </span>

                <span>
                    ${displayHour}:00 ${ampm}
                </span>

                <span>
                    ${formatTemperature(hourTemperature)}
                </span>

            `;


            // Card add
            hourCard.appendChild(
                hourElement
            );

        }

    }


    // ==================================================
    // FUTURE DAY
    // ==================================================

    else {

        // Future day ka starting hour
        const startHour =
            dayIndex * 24;


        // 24 hours
        const endHour =
            startHour + 24;


        // Future day ke hours
        for (
            let i = startHour;
            i < endHour &&
            i < hourly.time.length;
            i++
        ) {

            // Time
            const time =
                new Date(hourly.time[i]);


            // Hour
            const hour =
                time.getHours();


            // AM / PM
            const ampm =
                hour >= 12
                    ? "PM"
                    : "AM";


            // 12-hour format
            let displayHour =
                hour % 12;


            if (displayHour === 0) {

                displayHour = 12;

            }


            // Temperature
            const hourTemperature =
                hourly.temperature_2m[i];


            // Weather code
            const weatherCode =
                hourly.weather_code[i];


            // Card
            const hourElement =
                document.createElement("div");


            hourElement.classList.add("hour");


            // Card HTML
            hourElement.innerHTML = `

                <span>
                    ${getWeatherEmoji(weatherCode)}
                </span>

                <span>
                    ${displayHour}:00 ${ampm}
                </span>

                <span>
                    ${formatTemperature(hourTemperature)}
                </span>

            `;


            // Card add
            hourCard.appendChild(
                hourElement
            );

        }

    }

}


// ======================================================
// 11. HOURLY DROPDOWN
// ======================================================

hourlySelect.addEventListener("change", () => {

    // Selected day ka index
    const selectedDay =
        hourlySelect.selectedIndex;


    // Agar weather data available hai
    if (weatherData) {

        // Selected day ka hourly forecast
        updateHourlyForecast(
            weatherData,
            selectedDay
        );

    }

});


// ======================================================
// 12. °C / °F DROPDOWN
// ======================================================

unitSelect.addEventListener("change", () => {

    // Selected unit
    const selectedUnit =
        unitSelect.value;


    // Agar Fahrenheit select kiya
    if (
        selectedUnit.includes("F")
    ) {

        currentUnit = "F";

    }

    // Otherwise Celsius
    else {

        currentUnit = "C";

    }


    // Agar weather data available hai
    if (weatherData) {

        // Current weather update
        updateCurrentWeather(
            weatherData.location.name,
            weatherData.location.country,
            weatherData
        );


        // Daily forecast update
        updateDailyForecast(
            weatherData
        );


        // Hourly forecast update
        updateHourlyForecast(
            weatherData,
            hourlySelect.selectedIndex
        );

    }

});


// ======================================================
// 13. TEMPERATURE FORMAT
// ======================================================

function formatTemperature(temp) {

    // Fahrenheit
    if (currentUnit === "F") {

        // Celsius -> Fahrenheit
        const fahrenheit =
            (temp * 9 / 5) + 32;


        return `${Math.round(fahrenheit)}°`;
    }


    // Celsius
    return `${Math.round(temp)}°`;

}


// ======================================================
// 14. WEATHER CODE -> IMAGE
// ======================================================

function getWeatherImage(code) {


    // Clear sky
    if (code === 0) {

        return "images/sun.png";

    }


    // Partly cloudy
    if (
        code === 1 ||
        code === 2
    ) {

        return "images/cloudy.png";

    }


    // Cloudy
    if (code === 3) {

        return "images/cloudy.png";

    }


    // Rain
    if (
        code >= 51 &&
        code <= 67
    ) {

        return "images/Rainy.png";

    }


    // Snow
    if (
        code >= 71 &&
        code <= 77
    ) {

        return "images/Rainy.png";

    }


    // Rain showers
    if (
        code >= 80 &&
        code <= 82
    ) {

        return "images/Rainy.png";

    }


    // Thunderstorm
    if (
        code >= 95 &&
        code <= 99
    ) {

        return "images/Thunderstorm.png";

    }


    // Default
    return "images/cloudy.png";

}


// ======================================================
// 15. WEATHER CODE -> EMOJI
// ======================================================

function getWeatherEmoji(code) {


    // Sunny
    if (code === 0) {

        return "☀️";

    }


    // Partly cloudy
    if (
        code === 1 ||
        code === 2
    ) {

        return "🌤️";

    }


    // Cloudy
    if (code === 3) {

        return "☁️";

    }


    // Rain
    if (
        code >= 51 &&
        code <= 82
    ) {

        return "🌧️";

    }


    // Thunderstorm
    if (
        code >= 95 &&
        code <= 99
    ) {

        return "⛈️";

    }


    // Default
    return "☁️";

}


// ======================================================
// 16. WEATHER CODE -> DESCRIPTION
// ======================================================

function getWeatherDescription(code) {


    // Clear
    if (code === 0) {

        return "Clear sky";

    }


    // Partly cloudy
    if (
        code === 1 ||
        code === 2
    ) {

        return "Partly cloudy";

    }


    // Cloudy
    if (code === 3) {

        return "Cloudy";

    }


    // Rain
    if (
        code >= 51 &&
        code <= 67
    ) {

        return "Rain";

    }


    // Snow
    if (
        code >= 71 &&
        code <= 77
    ) {

        return "Snow";

    }


    // Rain showers
    if (
        code >= 80 &&
        code <= 82
    ) {

        return "Rain showers";

    }


    // Thunderstorm
    if (
        code >= 95 &&
        code <= 99
    ) {

        return "Thunderstorm";

    }


    // Default
    return "Cloudy";

}


// ======================================================
// 17. WEBSITE LOAD
// ======================================================

// Website open hote hi
// Dehradun ka weather load hoga

getWeather("Dehradun");