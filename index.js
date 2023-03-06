const userTab = document.querySelector("[data-userWeather]");
const searchTab =document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".user-info-container");
const loadingScreen = document.querySelector(".loading-container");

// initially neede varibale

let currentTab = userTab;
const API_KEY = "fa8d35eee4eeb0b41572d6ae2733f176";
currentTab.classList.add("current-tab");

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        // iss se bas tab ke nam ka background colour change hoga
        // by doin three code background color will be shifted to the clicked tab
        currentTab.classList.remove("current-tab"); //by this the grey color background will be removed
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
        // iss if-else se actual tab me changes aega
        if(!searchForm.classList.contains("active")){
            // pehle your weather wale tab pe tha and search wale tab pe jana he
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // pehle search wale tab pe tha aab ur weather wale pe jana he
            searchForm.classList.remove("active");
            userContainer.classList.remove("active");
            //to get ur current weather data if it's already in session
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }

}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// checks if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else{
        // agar local coordinates milgaye
        // to latitude or longitude use karke api call karo
        const coordinates = JSON.parse(localCoordinates); 
        // in up: localCoordinates converted to json-obj

        fetchUserWeatherInfo(coordinates);
        // this will bring wether info by api call
        // coordinates ke adhar per weather ka info fetch kar lata he ye function
    }
}

// async function kyuki api call hoga (api call me time lag sakta he )
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // make grant-location-access container invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        // data converted to json format
        const data = await response.json();

        // loader hata denge
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        
        // niche ka function: data mese values nikalke ke ui me Render karega
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");

    }
}


// rendering weather info into ui
function renderWeatherInfo(weatherInfo){
    // fetch elements first
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    // we gonna put all these upper values dynamically , the data which we'll get from api call will be shown here

    //fetch values from weatherINfo object and put it UI elements
    // we'll use optional chaining for this 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText =`${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText =`${weatherInfo?.clouds?.all}%`;  

}

function getLocation(){
    // checkuing if geolocation is supported or not
    if(navigator.geolocation){
        // if geolocation supported then find the location
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("No geolocation support available");
    }
}

function showPosition(position){
    const userCoordinates = {
        // to get latitude and longitude
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    // storing these cordinates inside session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // data saved in session storage now we have to show them
    fetchUserWeatherInfo(userCoordinates);  
}
// flowchart 1
// listner on grant access button
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // we don't want to go for default method
    let cityName = searchInput.value;
    // city name entered in input field is stored
    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

// function who does api call on city name
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        // api call on city name
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // by upper we'll get the weather value of entered city

        renderWeatherInfo(data);
    }
    catch(err){
    
    }
}

