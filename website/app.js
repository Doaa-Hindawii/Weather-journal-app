/* Global Variables */

// Base URL 
const BaseURL = "https://api.openweathermap.org/data/2.5/weather?zip=";
//forcast data api url
const weatherApi = "https://api.openweathermap.org/data/2.5/forecast?zip=";
//My API Key from OpenWeatherMap API
const MyApiKey ="&APPID=173ff8f535f3ee441c0f90792e8acbdb";

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();


//get the user zipcode input
const userInfo = () => {
  const errors = document.querySelectorAll(".error");
  const zip = parseInt(document.querySelector("#zip").value, 10);
  if (isNaN(zip)) {
    error("InCorrect ZipCode!");
  } else if (zip == undefined) {
    error("Please, type a valid ZipCode!");
  } else {
    if (errors.length > 0) {
      errors.forEach(element => element.parentNode.removeChild(element));
    }
    getWeather(zip, document.querySelector("#feelings").value);
    
  }
};

/* Function to GET Web API Data*/
//getWeather -> fetch data from the api and post the data to the server
const getWeather = async (zip, user_feelings) => {
  let [current_weather, future_weather] = await Promise.all([
    fetch(BaseURL + zip + MyApiKey),
    fetch(weatherApi + zip + MyApiKey)
  ]);

   // add data to POST request
  current_weather.json().then(value => {
    postData("/", { value, user_feelings });
  });
  future_weather.json().then(value => {
    postData("/future_weather", value);
    //after posting the data, get the data from the server
    add_server_data();
  });
};

/* Function to POST data */
//post data in json format in cors mode to the server
const postData = async (url = "", data) => {
  const res = await fetch(url, {
    method: "post",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  try {
    const newData = await res.json();
    console.log(newData);
    return newData;
  } catch (err) {
    console.log("Error " + err);
  }
};

//convert kelvin to fahrenheit
const kelvin_to_fahrenheit = kelvin_temp =>
  Math.round(kelvin_temp * 1.8 - 459.67);

//error message to the DOM
const error = mesg => {
  const zip = document.querySelector(".zip");
  const div = element_creator("div", "error");
  div.textContent = mesg;
  zip.appendChild(div);
};
//creates a given element and a class
const element_creator = (element, class_name) => {
  const element_holder = document.createElement(element);
  element_holder.className = class_name;
  return element_holder;
};

//convert unix timestamp to UTC time and return the hour
const unix_timestamp_converter = unix_timestamp => {
  const date_info = new Date(unix_timestamp * 1000);
  return date_info.getHours();
};

//convert military hour in to stand hours
const military_time_converter = time_hour => {
  if (time_hour > 0 && time_hour <= 12) {
    return time_hour;
  } else if (time_hour > 12) {
    return time_hour - 12;
  } else if (time_hour == 0) {
    time_hour = 12;
    return time_hour;
  }
};

//dynamically add the future weather data to the UI
const weather_append = weather_data => {
  const entry = document.querySelector(".entry");
  for (weather of weather_data) {
    let entryHolder = element_creator("div", "entryHolder");
    let icon = element_creator("div", "icon");
    let temp = element_creator("div", "temp");
    let weather_date = element_creator("div", "date");
    const ampm = unix_timestamp_converter(weather.dt) >= 12 ? "pm" : "am";
    weather_date.innerHTML = `<p>${military_time_converter(
      unix_timestamp_converter(weather.dt)
    ) + ampm}</p>`;
    icon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" class="current_weather_icon" />`;
    temp.innerHTML = `<p>${kelvin_to_fahrenheit(weather.main.temp)}&deg</p>`;
    entryHolder.appendChild(icon);
    entryHolder.appendChild(temp);
    entryHolder.appendChild(weather_date);
    entry.appendChild(entryHolder);
  }
};

// GET ROUTE II
//gets weather data from the server and dynamically updates the UI
const add_server_data = async () => {
  const feel_div_children = document.querySelector(".feel").children;
  await fetch("/weather").then(server_data => {
    server_data.json().then(data => {
      if (data[0].current_weather.cod == "400") {
        error(data[0].current_weather.message);
      } else {
        feel_div_children[5].innerHTML = `<p>Feeling: ${data[0].feelings}</p>`;
        feel_div_children[0].children[0].textContent =
          data[0].current_weather.name;
        feel_div_children[1].innerHTML = `<img src="http://openweathermap.org/img/wn/${data[0].current_weather.weather[0].icon}@2x.png" id="current_weather_icon" />`;
        feel_div_children[3].innerHTML = `<p>${kelvin_to_fahrenheit(
          data[0].current_weather.main.temp
        )}&deg</p>`;
        feel_div_children[4].innerHTML = `<p>Feels like: ${kelvin_to_fahrenheit(
          data[0].current_weather.main.feels_like
        )}&deg</p>`;
        feel_div_children[2].innerHTML = `<p>${data[0].current_weather.weather[0].main}</p>`;
        const entryHolder = document.querySelectorAll(".entryHolder");
        if (entryHolder.length > 0) {
          entryHolder.forEach(element =>
            element.parentNode.removeChild(element)
          );
        }
        weather_append(data[0].future_weather.list.splice(0, 5));
      }
    });
  });
};

//listen for a click on the search button
const search = document
.querySelector("#generate")
.addEventListener("click", userInfo);

