// ======================================================
//                 WEATHER APP JAVASCRIPT
// ======================================================


// ======================================================
// 1. HTML ELEMENTS
// ======================================================


// Search input
const searchInput =
    document.querySelector("#searchInput");


// Search button
const searchButton =
    document.querySelector("#searchButton");


// Weather image
const weatherImage =
    document.querySelector("#weatherImage");


// City name
const cityName =
    document.querySelector("#cityName");


// Date
const dateText =
    document.querySelector("#dateText");


// Main temperature
const temperature =
    document.querySelector("#temperature");


// Feels Like
const feelsLike =
    document.querySelector("#feelsLike");


// Humidity
const humidity =
    document.querySelector("#humidity");


// Wind
const wind =
    document.querySelector("#wind");


// Precipitation
const precipitation =
    document.querySelector("#precipitation");


// Daily forecast container
const forecastContainer =
    document.querySelector("#forecast");


// Hourly dropdown
const hourlySelect =
    document.querySelector("#hourlySelect");


// Hourly cards container
const hourCard =
    document.querySelector("#hourCard");


// Celsius / Fahrenheit dropdown
const unitSelect =
    document.querySelector("#unitSelect");


// ======================================================
// 2. GLOBAL VARIABLES
// ======================================================


// Default city
let currentCity = "Dehradun";


// Weather data
let weatherData = null;


// Current temperature unit
let currentUnit = "C";


// ======================================================
// 3. SEARCH BUTTON
// ======================================================

searchButton.addEventListener("click", () => {

    // Input se city ka naam lena
    const city =
        searchInput.value.trim();


    // Agar input empty hai
    if (city === "") {

        alert("Please enter a city name");

        return;
    }


    // Current city update
    currentCity = city;


    // Weather load
    getWeather(city);

});


// ======================================================
// 4. ENTER KEY SEARCH
// ======================================================

searchInput.addEventListener(
    "keypress",
    (event) => {

        // Agar Enter press hua
        if (event.key === "Enter") {

            // Input se city
            const city =
                searchInput.value.trim();


            // Empty input
            if (city === "") {

                return;
            }


            // Current city
            currentCity = city;


            // Weather
            getWeather(city);

        }

    }
);


// ======================================================
// 5. GET WEATHER
// ======================================================

async function getWeather(city) {

    try {

        // ==================================================
        // LOADING STATE
        // ==================================================

        // Purana weather temporarily hata do
        cityName.textContent =
            "Loading...";

        dateText.textContent =
            "Getting weather data...";

        temperature.textContent =
            "--°";

        feelsLike.textContent =
            "--";

        humidity.textContent =
            "--";

        wind.textContent =
            "--";

        precipitation.textContent =
            "--";


        // Purane daily cards hata do
        forecastContainer.innerHTML = "";


        // Purane hourly cards hata do
        hourCard.innerHTML = "";


        // Purane dropdown options hata do
        hourlySelect.innerHTML = "";


        // ==================================================
        // LOCATION API
        // ==================================================

        /*
            count=10 isliye rakha hai taaki
            same naam ki multiple cities mil saken.

            Example:
            Srinagar -> India / Pakistan
        */

        const locationResponse =
            await fetch(

                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`

            );


        // Response ko JSON mein convert karo
        const locationData =
            await locationResponse.json();


        // ==================================================
        // CITY NOT FOUND
        // ==================================================

        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            cityName.textContent =
                "City not found";

            dateText.textContent =
                "Please try another city";

            temperature.textContent =
                "--°";

            return;
        }


        // ==================================================
        // CORRECT CITY SELECT KARNA
        // ==================================================

        /*
            Agar results mein India ka city hai,
            to pehle India wala result choose karo.

            Example:
            Srinagar search karne par agar
            India + Pakistan dono aaye,
            to India wala select hoga.
        */

        const indianLocation =
            locationData.results.find(
                location =>
                    location.country_code === "IN"
            );


        /*
            India result mila to India wala.
            Nahi mila to first result.
        */

        const location =
            indianLocation ||
            locationData.results[0];


        // ==================================================
        // LOCATION DETAILS
        // ==================================================

        const latitude =
            location.latitude;

        const longitude =
            location.longitude;

        const cityFromAPI =
            location.name;

        const country =
            location.country;


        // ==================================================
        // WEATHER API
        // ==================================================

        const weatherResponse =
            await fetch(

                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`

            );


        // Weather JSON
        const data =
            await weatherResponse.json();


        // ==================================================
        // LOCATION SAVE
        // ==================================================

        data.location = {

            name: cityFromAPI,

            country: country

        };


        // Global weather data
        weatherData =
            data;


        // ==================================================
        // CURRENT WEATHER UPDATE
        // ==================================================

        updateCurrentWeather(
            cityFromAPI,
            country,
            data
        );


        // ==================================================
        // DAILY FORECAST UPDATE
        // ==================================================

        updateDailyForecast(data);


        // ==================================================
        // HOURLY DROPDOWN CREATE
        // ==================================================

        createHourlyDropdown(data);


        // ==================================================
        // DEFAULT HOURLY = TODAY
        // ==================================================

        updateHourlyForecast(
            data,
            0
        );

    }


    catch (error) {

        console.log(
            "Weather Error:",
            error
        );


        cityName.textContent =
            "Unable to load";


        dateText.textContent =
            "Please check your internet connection";


        temperature.textContent =
            "--°";

    }

}


// ======================================================
// 6. CURRENT WEATHER
// ======================================================

function updateCurrentWeather(
    city,
    country,
    data
) {

    // Current weather data
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
        new Date(
            data.current.time
        );


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
// 7. DAILY FORECAST
// ======================================================

function updateDailyForecast(data) {

    // Purane cards remove
    forecastContainer.innerHTML = "";


    // Daily data
    const daily =
        data.daily;


    // ==================================================
    // 7 DAYS
    // ==================================================

    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        // Date
        const date =
            new Date(
                daily.time[i]
            );


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


        // ==================================================
        // DAY CARD HTML
        // ==================================================

        day.innerHTML = `

            <h4>
                ${dayName}
            </h4>

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
        // CLICK DAY CARD
        // ==================================================

        day.addEventListener(
            "click",
            () => {

                // Selected day ka hourly forecast
                updateHourlyForecast(
                    weatherData,
                    i
                );


                // Dropdown ko bhi same day par set karo
                hourlySelect.value =
                    i.toString();

            }
        );


        // Card ko container mein add karo
        forecastContainer.appendChild(day);

    }

}


// ======================================================
// 8. CREATE HOURLY DROPDOWN
// ======================================================

function createHourlyDropdown(data) {

    // Purane options remove
    hourlySelect.innerHTML = "";


    // Daily data
    const daily =
        data.daily;


    // ==================================================
    // TODAY
    // ==================================================

    const todayOption =
        document.createElement("option");


    todayOption.value =
        "0";


    todayOption.textContent =
        "Today";


    hourlySelect.appendChild(
        todayOption
    );


    // ==================================================
    // NEXT DAYS
    // ==================================================

    for (
        let i = 1;
        i < daily.time.length;
        i++
    ) {

        // Date
        const date =
            new Date(
                daily.time[i]
            );


        // Full weekday
        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        // Option create
        const option =
            document.createElement("option");


        // Index
        option.value =
            i.toString();


        // Monday / Tuesday / etc.
        option.textContent =
            dayName;


        // Add option
        hourlySelect.appendChild(
            option
        );

    }

}


// ======================================================
// 9. HOURLY FORECAST
// ======================================================

function updateHourlyForecast(
    data,
    dayIndex
) {

    // ==================================================
    // OLD CARDS REMOVE
    // ==================================================

    hourCard.innerHTML = "";


    // Hourly data
    const hourly =
        data.hourly;


    // ==================================================
    // TODAY
    // ==================================================

    if (dayIndex === 0) {

        // Current time
        const now =
            new Date();


        // Current hour
        const currentHour =
            now.getHours();


        // API current hour index
        let startIndex = 0;


        // ==================================================
        // FIND CURRENT HOUR
        // ==================================================

        for (
            let i = 0;
            i < hourly.time.length;
            i++
        ) {

            const time =
                new Date(
                    hourly.time[i]
                );


            if (
                time.getHours() ===
                currentHour
            ) {

                startIndex =
                    i;

                break;

            }

        }


        // ==================================================
        // NOW CARD
        // ==================================================

        const nowElement =
            document.createElement("div");


        nowElement.classList.add(
            "hour"
        );


        // Current temperature
        const nowTemperature =
            data.current.temperature_2m;


        // Current weather
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


        // Add Now
        hourCard.appendChild(
            nowElement
        );


        // ==================================================
        // NEXT HOURS
        // ==================================================

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

            // Time
            const time =
                new Date(
                    hourly.time[i]
                );


            // Hour
            const hour =
                time.getHours();


            // AM / PM
            const ampm =
                hour >= 12
                    ? "PM"
                    : "AM";


            // 12 hour format
            let displayHour =
                hour % 12;


            // Midnight
            if (
                displayHour === 0
            ) {

                displayHour = 12;

            }


            // Temperature
            const hourTemperature =
                hourly.temperature_2m[i];


            // Weather code
            const weatherCode =
                hourly.weather_code[i];


            // Create card
            const hourElement =
                document.createElement("div");


            hourElement.classList.add(
                "hour"
            );


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


            // Add card
            hourCard.appendChild(
                hourElement
            );

        }

    }


    // ==================================================
    // FUTURE DAY
    // ==================================================

    else {

        /*
            Har day mein 24 hours hote hain.

            Day 1:
            24 - 47

            Day 2:
            48 - 71

            Day 3:
            72 - 95

            etc.
        */

        const startHour =
            dayIndex * 24;


        const endHour =
            startHour + 24;


        // ==================================================
        // FUTURE DAY KA FIRST HOUR
        // ==================================================

        /*
            Selected future day ka
            pehla hour normally 12:00 AM hota hai.

            User ke requested UI ke according
            isko "Now" label diya ja raha hai.
        */

        const firstWeatherCode =
            hourly.weather_code[startHour];


        const firstTemperature =
            hourly.temperature_2m[startHour];


        // ==================================================
        // CREATE NOW CARD
        // ==================================================

        const nowElement =
            document.createElement("div");


        nowElement.classList.add(
            "hour"
        );


        // First hour ko Now dikhana
        nowElement.innerHTML = `

            <span>
                ${getWeatherEmoji(firstWeatherCode)}
            </span>

            <span>
                Now
            </span>

            <span>
                ${formatTemperature(firstTemperature)}
            </span>

        `;


        // Add Now
        hourCard.appendChild(
            nowElement
        );


        // ==================================================
        // REMAINING HOURS
        // ==================================================

        for (
            let i = startHour + 1;
            i < endHour &&
            i < hourly.time.length;
            i++
        ) {

            // Time
            const time =
                new Date(
                    hourly.time[i]
                );


            // Hour
            const hour =
                time.getHours();


            // AM / PM
            const ampm =
                hour >= 12
                    ? "PM"
                    : "AM";


            // 12 hour format
            let displayHour =
                hour % 12;


            // Midnight
            if (
                displayHour === 0
            ) {

                displayHour = 12;

            }


            // Temperature
            const hourTemperature =
                hourly.temperature_2m[i];


            // Weather code
            const weatherCode =
                hourly.weather_code[i];


            // Create card
            const hourElement =
                document.createElement("div");


            hourElement.classList.add(
                "hour"
            );


            // HTML
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


            // Add card
            hourCard.appendChild(
                hourElement
            );

        }

    }

}


// ======================================================
// 10. HOURLY DROPDOWN CHANGE
// ======================================================

hourlySelect.addEventListener(
    "change",
    () => {

        // Selected day
        const selectedDay =
            Number(
                hourlySelect.value
            );


        // Weather data available?
        if (weatherData) {

            // Selected day ka forecast
            updateHourlyForecast(
                weatherData,
                selectedDay
            );

        }

    }
);


// ======================================================
// 11. CELSIUS / FAHRENHEIT
// ======================================================

unitSelect.addEventListener(
    "change",
    () => {

        // Selected unit
        const selectedUnit =
            unitSelect.value;


        // Fahrenheit
        if (
            selectedUnit === "F"
        ) {

            currentUnit =
                "F";

        }


        // Celsius
        else {

            currentUnit =
                "C";

        }


        // Weather data available
        if (weatherData) {

            // Current weather
            updateCurrentWeather(
                weatherData.location.name,
                weatherData.location.country,
                weatherData
            );


            // Daily forecast
            updateDailyForecast(
                weatherData
            );


            // Current hourly selection
            updateHourlyForecast(
                weatherData,
                Number(
                    hourlySelect.value
                )
            );

        }

    }
);


// ======================================================
// 12. FORMAT TEMPERATURE
// ======================================================

function formatTemperature(temp) {

    // Fahrenheit
    if (
        currentUnit === "F"
    ) {

        const fahrenheit =
            (temp * 9 / 5) + 32;


        return `${Math.round(fahrenheit)}°`;

    }


    // Celsius
    return `${Math.round(temp)}°`;

}


// ======================================================
// 13. WEATHER IMAGE
// ======================================================

function getWeatherImage(code) {

    // Clear sky
    if (
        code === 0
    ) {

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
    if (
        code === 3
    ) {

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
// 14. WEATHER EMOJI
// ======================================================

function getWeatherEmoji(code) {

    // Clear
    if (
        code === 0
    ) {

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
    if (
        code === 3
    ) {

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
// 15. WEATHER DESCRIPTION
// ======================================================

function getWeatherDescription(code) {

    // Clear
    if (
        code === 0
    ) {

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
    if (
        code === 3
    ) {

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
// 16. DEFAULT CITY
// ======================================================


// Page load hote hi
// Dehradun ka weather load hoga.
//
// HTML mein Berlin nahi hai,
// isliye refresh par Berlin flash nahi karega.

getWeather("Dehradun");