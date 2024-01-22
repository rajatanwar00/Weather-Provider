import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import fs from "fs";
const app=express();
const port = 3000;
const api_key="a706428f3a1b4cbfbb5131030232812";

app.use(bodyParser.urlencoded({extended:true}));

//app.set('view engine','ejs');

app.get("/",(req,res)=>{
    //res.sendFile(path.join(__dirname, '/index.html'));
    res.sendFile(path.resolve('index.html'));
})

app.get("/finalpage.css",(req,res)=>{
    res.sendFile(path.resolve('finalpage.css'));
})

app.get("/style.css",(req,res)=>{
   res.sendFile(path.resolve('style.css'));
})

app.get("/earth.jpg",(req,res)=>{
    res.sendFile(path.resolve('earth.jpg'));
})

app.post("/submit",async (req,res)=>{
    const city_demanded=req.body.city;
    try{
        const today=new Date().toJSON().slice(0,10);
        const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${city_demanded}&aqi=yes`);

        const astronomyresponse =await axios.get(`http://api.weatherapi.com/v1/astronomy.json?key=${api_key}&q=${city_demanded}&dt=${today}`);

        var locationrows=` `;
        var otherinfo=` `;
        var aqidata=`<h1>Air Quality</h1>`;
        

        locationrows=`
            <h1>Your city</h1>
            <p>${response.data.location.name}, ${response.data.location.region}, ${response.data.location.country}</p>
            <p>Latitude : ${response.data.location.lat}<br>Longitude : ${response.data.location.lon}<br>
                Timezone : ${response.data.location.tz_id}<br>Local Time : ${response.data.location.localtime}</p>
        `;
        /*
        for(const [key,value] of Object.entries(response.data.location)){
            locationrows+=`${key} : ${value}<br>`;
        }*/

        /*
        for(const [key,value] of Object.entries(response.data.current)){
            if(key=='condition')continue;
            tablerows+=`${key}:${value}<br>`;
        }
        */

        otherinfo=`
        <h1>Other Information</h1>
            <p>
               Last Updated : ${response.data.current.last_updated}<br>
               Wind Speed : ${response.data.current.wind_kph} kph<br>
               Wind Degree : ${response.data.current.wind_degree} &deg<br>
               Wind Direction : ${response.data.current.wind_dir}<br>
               Pressure : ${response.data.current.pressure_mb} mb<br>
               Precipitation : ${response.data.current.precip_mm} mm<br>
               Humidity : ${response.data.current.humidity} %<br>
               Cloud : ${response.data.current.cloud} %<br>
               </p>
        `;

        var astronomy=`
            <h1>Astronomy</h1>
            <p>Sunrise : ${astronomyresponse.data.astronomy.astro.sunrise}<br>
                Sunset : ${astronomyresponse.data.astronomy.astro.sunset}<br>
                Moonrise : ${astronomyresponse.data.astronomy.astro.moonrise}<br>
                Moonset : ${astronomyresponse.data.astronomy.astro.moonset}<br>
                Moon Phase : ${astronomyresponse.data.astronomy.astro.moon_phase}<br>
                Moon Illumination : ${astronomyresponse.data.astronomy.astro.moon_illumination}<br>
            </p>
        `;

        
        var usindex='';
        switch(response.data.current.air_quality['us-epa-index']){
            case 1:
                usindex="Good";
                break;
            
            case 2:
                usindex="Moderate";
                break;

            case 3:
                usindex="Unhealthy for sensitive group";
                break;

            case 4:
                usindex="Unhealthy";
                break;

            case 5:
                usindex="Very unhealthy";
                break;

            case 6:
                usindex="Hazardous";
                break;
        }

        
        aqidata+=`
            <p> CO : ${response.data.current.air_quality.co} μg/m3<br>
                NO2 : ${response.data.current.air_quality.no2} μg/m3<br>
                O3 : ${response.data.current.air_quality.o3} μg/m3<br>
                SO2 : ${response.data.current.air_quality.so2} μg/m3<br>
                PM2_5 : ${response.data.current.air_quality.pm2_5} μg/m3<br>
                PM10 : ${response.data.current.air_quality.pm10} μg/m3<br>
                US-EPA INDEX : ${response.data.current.air_quality['us-epa-index']} (${usindex})<br>
            </p>
        `;
        
        //console.log(response.data.current);

        fs.readFile(path.resolve('finalpage.html'),'utf8',(err,dataf)=>{
            if(err){
                res.status(500).send('Error reading file');
                return;
            }

            dataf=dataf.replace('<div id="location"></div>',`<div id="location">${locationrows}</div>`);
            dataf=dataf.replace('<div id="info"></div>',`<div id="info">${otherinfo}</div>`);
            dataf=dataf.replace('<div id="astronomy"></div>',`<div id="astronomy">${astronomy}</div>`);
            dataf=dataf.replace('<div id="aqi"></div>',`<div id="aqi">${aqidata}</div>`);
            dataf=dataf.replace('<div id="weathercard"></div>',`<div id="weathercard"><img src="${response.data.current.condition.icon}" height="120px" width="120px"> <p>${response.data.current.condition.text}, ${response.data.current.temp_c}&#8451  (feels like ${response.data.current.feelslike_c}&#8451)</p></div>`);
            res.send(dataf);
        });
        
        
    }
    catch(error){
        res.status(500).send("Error fetching data");
    }
})

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})