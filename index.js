import {icons} from './icons.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const WEEKDAYSFULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

async function fetchWeatherAPI(){
    const lat = 33.6846;
    const long = -117.8265;
    let data = {};
    let isError = false;
    let errorMessage = "";

    const generalInfoRes = await fetch(`https://api.weather.gov/points/${lat},${long}`);
    const generalInfo = await generalInfoRes.json();

    const tempLocation = generalInfo.properties.relativeLocation.properties;
    const location = tempLocation.city + ", " + tempLocation.state;

    //this section is just to get the current temperature
    try {
        const forecastHourlyURL = generalInfo.properties.forecastHourly;
        const forecastHourlyRes = await fetch(forecastHourlyURL);
        const forecaseHourlyJSON = await forecastHourlyRes.json();
        const currentTemperature = forecaseHourlyJSON.properties.periods[0].temperature.toFixed(0);
        data = {...data,currentTemperature}
    } catch(error){
        console.log(error);
    }
    
    try {

        const forecastURL = generalInfo.properties.forecast;
        const forecastRes = await fetch(forecastURL);
        const forecastJSON = await forecastRes.json();
        

        const nextWeekWeather = forecastJSON.properties.periods;
        // const todayWeather = nextWeekWeather[0];
        // const weatherIcon = icons[todayWeather.shortForecast.split(" ").pop().toLowerCase()];
        // const weatherDesc = todayWeather.shortForecast;

        data = {
            ...data,
            location,
            nextWeekWeather
        }
    } catch(error){
        console.log(error)
    }

    return new Promise((resolve,reject)=>{
        resolve(data);
        reject("error");
    })
    
}


function renderWeeklyForcast(data){  
    let nextWeekWeather = data.nextWeekWeather;
    const weekLow = Math.min.apply(Math,nextWeekWeather.map(daily=>daily.temperature));
    const weekHigh = Math.max.apply(Math,nextWeekWeather.map(daily=>daily.temperature));
    const weekDiff = weekHigh - weekLow;
    

    //nextWeekWeather is an array of 14 elements, 2 weather summaries of day and night for each day 
    //we need to convert this to a two dimensional array with 7 elements
    (function (){

        const result = [];
        while(nextWeekWeather[0]){
            result.push(nextWeekWeather.splice(0,2));
        }
        nextWeekWeather = result;
    })();

    
    const elem = nextWeekWeather.map((daily,index)=>{

        const dailyMinTemp = Math.min(daily[0].temperature,daily[1].temperature);
        const dailyMaxTemp = Math.max(daily[0].temperature,daily[1].temperature);

        function getWeatherIcon(){
            const weather = daily[0].shortForecast.split(" ").pop().toLowerCase();
            return icons[weather] ? icons[weather] : `<i class="fa-solid fa-exclamation"></i>`;
        }
        
        function getDay(){
            if(index===0) return WEEKDAYSFULL[new Date().getDay()];
            return daily[0].name.split(" ").shift();
        }

        //show where the current temperature is on the bar
        function getTempDot(){
            if(index===0){
                const temp = data.currentTemperature;
                const left = (temp - weekLow) / weekDiff * 100;
                return `<div class="temp_dot" style="left:${left}%"></div>`
            } else return "";
        }

        function getTemperatureBar(){
            const low = Math.min(daily[0].temperature, daily[1].temperature);
            const high = Math.max(daily[0].temperature, daily[1].temperature);

            const left = (low-weekLow) / weekDiff * 100;
            const right = (weekHigh-high) / weekDiff * 100;
            return `<div class="temp-bar" style="left:${left}%;right:${right}%"></div>`
        }
        
        return `<div class="forcast__daily">
            <div class="day">${getDay()}</div>
            <div class="weather">${getWeatherIcon()}</div>
            <div class="daily-temp">
                <div class="low">${dailyMinTemp}&#176</div>
                <div class="temp-bar-container">
                    ${getTemperatureBar()}
                    ${getTempDot()}
                </div>
                <div class="high">${dailyMaxTemp}&#176</div>
            </div>
        </div>`
    }).join("");

    document.querySelector(".forcast__weekly").innerHTML = elem;



}

function renderTodaySummery(data){

    function getDate(){
        const today = new Date();
        const day = WEEKDAYS[today.getDay()];
        const date = today.getDate();
        const month = MONTHS[today.getMonth()];
        return `${day}, ${date} ${month}`;
    }

    
    const weatherData = data.nextWeekWeather[0];
    const weatherIcon = icons[weatherData.shortForecast.split(" ").pop().toLowerCase()];

    const elem = `<i class="fa-solid fa-cloud cloud1"></i>
    <i class="fa-solid fa-cloud cloud2"></i>
    <i class="fa-solid fa-cloud cloud3"></i>
    <header class="summary-header">

        <div class="icon">
            ${weatherIcon}
        </div>
        <div class="title">
            <h1>TODAY</h1>
            <div class="date">${getDate()}</div>
        </div>
    </header>
    
        <div class="summary__temperature">
            ${data.currentTemperature}
        </div>
    
    <div class="summary__location">
        ${data.location}
    </div>
    
    <div class="summary__desc">
        ${weatherData.shortForecast}
    </div>`;

    document.querySelector(".summary").innerHTML = elem;
}

function fetchWeatherData(){
    // const lat = 33.6846;
    // const long = -117.8265;

    fetchWeatherAPI()
    .then(data=>{
        console.log(data);
        renderTodaySummery(data);
        renderWeeklyForcast(data);
    })

    //old fetching method
    // fetch(`https://api.weather.gov/points/${lat},${long}`)
    // .then(res=>res.json())
    // .then(context=> {
        
    //     let location = context.properties.relativeLocation.properties;
    //     location = location.city + ", " + location.state;
        
    //     fetch(context.properties.forecast)
    //     .then(res=>res.json())
    //     .then(data=>{
    //         renderTodaySummery(data,location);
    //         renderWeeklyForcast(data);
    //         // console.log(data);
    //     }).catch(error=>{
    //         console.log(error)
    //     })


    //     //render current temperature
    //     fetch(context.properties.forecastHourly)
    //     .then(res=>res.json())
    //     .then(data=>{
    //         const elem = document.querySelector(".summary__temperature");
    //         const current_temp = data.properties.periods[0].temperature;
    //         elem.innerHTML = current_temp.toFixed(0);
    //     }).catch(error=>{
    //         console.log(error);
    //     })
    // })
}

function KtoC(kelvin){
    return kelvin - 273.15;
}

//init
fetchWeatherData();