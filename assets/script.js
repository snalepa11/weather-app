
var apiKey = '77b6e16c240d6ac8e0f66b5dd65a3e77'

var searchInput = document.getElementById('search-input')
var searchBtn = document.getElementById('searchBtn')

searchBtn.addEventListener("click", searchCity)

function searchCity(e) {
    if (!searchInput.value) {
        return
    }
    e.preventDefault()
    var search = searchInput.value.trim()
    geoFetch(search)
    searchInput.innerHTML = ""
}
//purpose is to pass search thru to get lat, long, name geo to use in the weather api fetch, calling out next function to pull weather data.

function geoFetch(search) {
    var geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`

    fetch(geoURL)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            historySave(search);
            weatherFetch(data[0]);
        })
}

function historySave(city) {    
    var localStrgCity = localStorage.getItem("savedCities");
    var localStrgCityArr = []
   
    if(typeof localStrgCity == "string"){
        localStrgCityArr = JSON.parse(localStrgCity)
    }

    if(!localStrgCityArr.includes(city)) {
        localStrgCityArr.push(city)
    }    
    localStorage.setItem("savedCities", JSON.stringify(localStrgCityArr))

    
    var locationBtn = document.getElementById("locationBtn");


    for (var i = 0; i < localStrgCityArr.length; i++) {
        if(!document.getElementById(localStrgCityArr[i])) {
            var searchHistoryEntry = document.createElement("button");
            searchHistoryEntry.setAttribute("id", localStrgCityArr[i])
            searchHistoryEntry.setAttribute("class", "btn btn-primary");

            searchHistoryEntry.addEventListener("click", geoFetch(localStrgCityArr[i]))
    
    
            searchHistoryEntry.textContent = `${localStrgCityArr[i]}`
            locationBtn.appendChild(searchHistoryEntry);
        }
    }
}

//fetching weather data, then calling out next functions to display for current/ forecast html divs
function weatherFetch(location) {
    var { lat, lon } = location
    var city = location.name

    //tried exclude hourly to see if I could simplify
    var weatherAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&exclude=hourly`

    fetch(weatherAPI)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            //current day weather data
            currentDisplay(city, data.list[0])
            //forecast by day weather data
            forecastDisplay(data.list)
        })
}

//next function: display current data
function currentDisplay(city, weather) {
    //pull data from api 
    var temp = Math.floor(((weather.main.temp - 273.15) * 1.8) + 32);
    var wind = Math.floor(weather.wind.speed * 2.236936);
    var humidity = weather.main.humidity;
    var currentDate = new Date();


    //create a card
    var mainCard = document.getElementById("card-id")
    mainCard.setAttribute("class", "card")

    var cardBody = document.getElementById("card-body")
    cardBody.innerHTML = null;
    cardBody.setAttribute("class", "card-body")

    var cityEl = document.createElement("h1")
    var tempEl = document.createElement("p")
    var windEl = document.createElement("p")
    var humidityEl = document.createElement("p")

    //join the data with a card - LOOK INTO TIMEZONE
    tempEl.textContent = `Temp: ${temp} ℉`
    windEl.textContent = `Wind: ${wind} mph`
    humidityEl.textContent = `Humidity: ${humidity} %`
    cityEl.textContent = `${city} (${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()})`

    cardBody.appendChild(cityEl);
    cardBody.appendChild(tempEl);
    cardBody.appendChild(windEl);
    cardBody.appendChild(humidityEl);
}

//maybe something wrong with dataList being passed down?
function forecastDisplay(dataList) {   
    //clear container innerHTML
    var forecastContainer = document.getElementById("forecast5")
    forecastContainer.innerHTML=null;
    var forecastHeader = document.createElement("h2")
    forecastHeader.textContent=`5 Day Forecast:`
    forecastContainer.appendChild(forecastHeader)

    function atNoon(weatherItem){
        var text = weatherItem.dt_txt
        return text.includes("12");
    }

    var futureForecast = dataList.filter((weatherItem) => atNoon(weatherItem))
    console.log(futureForecast);

    var forecastContainer = document.getElementById("forecastCardContainer")
    forecastContainer.innerHTML=null;

    for (let i = 0; i < futureForecast.length; i++) {
       
        var card = document.createElement("div")
        card.setAttribute("class", "card text-bg-secondary mb-3")

        // TODO : We want to add Date
        var cardHeader = document.createElement("div")
        cardHeader.setAttribute("class", "card-header")

        var cardBody = document.createElement("div")
        cardBody.setAttribute("class", "card-body")

        var foreTemp = Math.floor(((futureForecast[i].main.temp - 273.15) * 1.8) + 32);
        var foreWind = Math.floor(futureForecast[i].wind.speed * 2.236936);
        var foreHumidity = futureForecast[i].main.humidity;

        var foreDate = new Date(futureForecast[i].dt_txt);
        //             const currentIconSrc = `http://openweathermap.org/img/wn/${currentIcon}@2x.png`;
        //             const date = 
        //            const day = intToDay(date.getDay())

        var dateEl = document.createElement("h3")
        var foreTempEl = document.createElement("p")
        var foreWindEl = document.createElement("p")
        var foreHumidityEl = document.createElement("p")

        foreTempEl.textContent = `Temp: ${foreTemp} ℉`
        foreWindEl.textContent = `Wind: ${foreWind} mph`
        foreHumidityEl.textContent = `Humidity: ${foreHumidity} %`
        
        dateEl.textContent = `${foreDate.getMonth() + 1}/${foreDate.getDate()}/${foreDate.getFullYear()}`

        cardBody.appendChild(dateEl);
        cardBody.appendChild(foreTempEl);
        cardBody.appendChild(foreWindEl);
        cardBody.appendChild(foreHumidityEl);
        
        card.appendChild(cardHeader)
        card.appendChild(cardBody)

        forecastContainer.appendChild(card)
    }
}