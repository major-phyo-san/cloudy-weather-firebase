var cloudyWeather = angular.module("cloudyWeather",['ngMaterial','ngMessages','ngRoute']);

cloudyWeather.controller("mainController", function($scope, $mdSidenav, $window, $http){
    $scope.toggleLeftMenu = function()
    {
        $mdSidenav('left').toggle();
    };

    $scope.locationInput= "";
    $scope.cityInputMode = false;
    $scope.idInputMode = false;
    $scope.coordInputMode = false;
    $scope.autoDetectMode = false;

    let baseUrl = "https://api.openweathermap.org/data/2.5"; //"https://api.openweathermap.org/data/2.5"; //"http://localhost:8700";
    let currentWeatherUrl = baseUrl+ "/weather?";
    let fiveDayForecastUrl = baseUrl+ "/forecast?";
    let appKeyUrl = "&APPID=b5d7195fd5362f4602537f2cb5822d55";
    let unitModeUrl = "&units=metric";

    let cityName = "";
    let cityID = "";
    let latitude = "";
    let longitude = "";
    var detectedLat = "";
    var detectedLon = "";

    $scope.currentWeatherObj = "";
    $scope.fiveDayForecastObj = "";
    $scope.uvDataObj = "";

    $scope.tempDegreeSign = "";
    $scope.pressureSign = "";
    $scope.humiditySign = "";
    $scope.visibilitySign = ""    
    $scope.cloudPercentSign = "";
    $scope.windSpeedSign = "";
    $scope.rainVolSign = "";
    $scope.latitudeSign = "";
    $scope.longitudeSign = ""
    $scope.britishUnitMode = false;

    $scope.weatherWarningText = "";
    
    $scope.unitModeChanged = function()
    {
    	if($scope.britishUnitMode)
    		$scope.britishUnitMode = false;
    	else
    		$scope.britishUnitMode = true;
    	if($scope.britishUnitMode)
    		unitModeUrl = "&units=imperial"
    	else
    		unitModeUrl = "&units=metric";
    	$scope.getWeatherRefresh();

    }

    $scope.radioChanged = function()
    {
    	if($scope.locationInput === "city")
    	{
    		$scope.cityInputMode = true;
    		$scope.idInputMode = false;
    		$scope.coordInputMode = false;
    		$scope.autoDetectMode = false;    		
    	}
    	if($scope.locationInput === "id")
    	{
    		$scope.cityInputMode = false;
    		$scope.idInputMode = true;
    		$scope.coordInputMode = false;
    		$scope.autoDetectMode = false;
    	}

    	if($scope.locationInput === "coord")
    	{
    		$scope.cityInputMode = false;
    		$scope.idInputMode = false;
    		$scope.coordInputMode = true;
    		$scope.autoDetectMode = false;
    	}
    	if($scope.locationInput === "auto")
    	{
    		$scope.cityInputMode = false;
    		$scope.idInputMode = false;
    		$scope.coordInputMode = false;
    		$scope.autoDetectMode = true;
    	}
    }

    $scope.unitSignsSet = function(britishUnitMode)
    {
    	if(britishUnitMode)
    	{
    		$scope.tempDegreeSign = "° F";
    		$scope.pressureSign = "hpa";
    		$scope.humiditySign = "%";
    		$scope.visibilitySign = "ft";
    		$scope.cloudPercentSign = "%";
    		$scope.windSpeedSign = "miles/h";
            $scope.rainVolSign = "inch";
    		$scope.latitudeSign = "° N";
    		$scope.longitudeSign = "° E";
    	}

    	else
    	{
    		$scope.tempDegreeSign = "° C";
    		$scope.pressureSign = "hpa";
    		$scope.humiditySign = "%";
    		$scope.visibilitySign = "m";
    		$scope.cloudPercentSign = "%";
    		$scope.windSpeedSign = "km/h";
            $scope.rainVolSign = "mm";
    		$scope.latitudeSign = "° N";
    		$scope.longitudeSign = "° E"
    	}
    }

    $scope.tempIconSet = function(britishUnitMode, weatherObj){
    	temperature = weatherObj.main.temp;
    	$scope.tempIconUrl = "measurements/";
    	if(!britishUnitMode){
    		if(temperature<=20)
    			$scope.tempIconUrl += "temp-cold.svg";
    		if(temperature>20 && temperature<=34)
    			$scope.tempIconUrl += "temp-moderate.svg";
    		if(temperature>34)
    			$scope.tempIconUrl += "temp-hot.svg";    		
    	}

    	else{
    		if(temperature<=68)
    			$scope.tempIconUrl += "temp-cold.svg";
    		if(temperature>68 && temperature<=93)
    			$scope.tempIconUrl += "temp-moderate.svg";
    		if(temperature>93)
    			$scope.tempIconUrl += "temp-hot.svg";    		
    	}
    }

    $scope.unixTimeToNormalTime = function(unixTimeStamp)
    {
    	let datetime = new Date(unixTimeStamp*1000);

    	let year = datetime.getFullYear();

    	let month = datetime.getMonth() + 1;
    	if(month<10)
    		month = "0" + month;

    	let day = datetime.getDate();
    	if(day<10)
    		day = "0" + day;

    	part_of_day = "AM";
    	let hour = datetime.getHours();
    	if(hour<10)
    		hour = "0" + hour;
    	if(hour>12){
    		part_of_day = "PM";
    		hour -= 12;
    		if(hour<10)
    			hour = "0" + hour;
    		hour = hour;
    	}

    	let minute = datetime.getMinutes();
    	if(minute<10)
    		minute = "0" + minute;

    	let time = year + "-" + month + "-" + day + " " + hour + ":" + minute + part_of_day;
    	return time;
    }

    $scope.windDirection = function(deg)
    {
    	let dir = "";
    	if(deg)    	
    		{
    			if(deg>=0 && deg<=22)
    				dir = "North";
    			if(deg>=23 && deg<=75)
    				dir = "North East";
    			if(deg>=76 && deg<=112)
    				dir = "East";
    			if(deg>=113 && deg<=157)
    				dir = "South East";
    			if(deg>=158 && deg<=201)
    				dir = "South";
    			if(deg>=202 && deg<=247)
    				dir = "South West";
    			if(deg>=248 && deg<=292)
    				dir = "West";
    			if(deg>=293 && deg<=337)
    				dir = "North West";
    			if(deg>=338)
    				dir = "North";
    		}   	
    	return dir + " (" + deg + " degree)";
    }

    $scope.weatherIconAndWarning = function(weatherObj) //weatherCode
    {
    	var now = new Date(weatherObj.dt * 1000);    	
    	var weatherCode = weatherObj.weather[0].id;
    	//console.log(weatherObj);
    	var cloudPercent = weatherObj.clouds.all;
    	if(weatherCode>=200 && weatherCode<=232)
    	{
    		$scope.weatherWarningText = "There's a ";
    		if(weatherCode==200){
    			$scope.weatherWarningText += "thunderstorm with light rain";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}
    		if(weatherCode==201){
    			$scope.weatherWarningText += "thunderstorm with rain";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}
    		if(weatherCode==202){
    			$scope.weatherWarningText += "thunderstorm with heavy rain";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}
    		if(weatherCode==210){
    			$scope.weatherWarningText += "light thunderstorm";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-light.svg";
    		}
    		if(weatherCode==211){
    			$scope.weatherWarningText += "thunderstorm";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm.svg";
    		}
    		if(weatherCode==212){
    			$scope.weatherWarningText += "heavy thunderstorm";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm.svg";
    		}
    		if(weatherCode==221){
    			$scope.weatherWarningText += "ragged thunderstorm";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "thunderstorm/isolated-scattered-tstorms-day.svg";
    			else
    				$scope.weatherIconUrl = "thunderstorm/isolated-scattered-tstorms-night.svg";
    		}
    		if(weatherCode==230){
    			$scope.weatherWarningText += "thunderstorm with light drizzle";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}
    		if(weatherCode==231){
    			$scope.weatherWarningText += "thunderstorm with drizzle";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}
    		if(weatherCode==232){
    			$scope.weatherWarningText += "thunderstorm with heavy drizzle";
    			$scope.weatherIconUrl = "thunderstorm/thunderstorm-rain.svg";
    		}  			  		
    			   		
    	}
    	if(weatherCode>=300 && weatherCode<=321)
    	{
    		$scope.weatherWarningText = "There's a ";
    		if(weatherCode==300){
    			$scope.weatherWarningText += "light intensity drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle.svg";
    		}
    		if(weatherCode==301){
    			$scope.weatherWarningText += "drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle.svg";
    		}
    		if(weatherCode==302){
    			$scope.weatherWarningText += "heavy intensity drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle-heavy.svg";
    		}
    		if(weatherCode==310){
    			$scope.weatherWarningText += "light intensity drizzle rain";
    			$scope.weatherIconUrl = "drizzle/drizzle-rain.svg";
    		}
    		if(weatherCode==311){
    			$scope.weatherWarningText += "drizzle rain";
    			$scope.weatherIconUrl = "drizzle/drizzle-rain.svg";
    		}
    		if(weatherCode==312){
    			$scope.weatherWarningText += "heavy intensity drizzle rain";
    			$scope.weatherIconUrl = "drizzle/drizzle-heavy.svg";
    		}
    		if(weatherCode==313){
    			$scope.weatherWarningText += "shower rain and drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle-rain.svg";
    		}
    		if(weatherCode==314){
    			$scope.weatherWarningText += "heavy shower rain and drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle-rain.svg";
    		}
    		if(weatherCode==321){
    			$scope.weatherWarningText += "shower drizzle";
    			$scope.weatherIconUrl = "drizzle/drizzle-heavy.svg";
    		}
    			    		
    	}
    	if(weatherCode>=500 && weatherCode<=531)
    	{
    		$scope.weatherWarningText = "There's a ";
    		if(weatherCode==500){
    			$scope.weatherWarningText += "rain";
    			$scope.weatherIconUrl = "rain/light-rain.svg";
    		}
    		if(weatherCode==501){
    			$scope.weatherWarningText += "moderate rain";
    			$scope.weatherIconUrl = "rain/rain.svg"
    		}
    		if(weatherCode==502){
    			$scope.weatherWarningText += "heavy intensity rain";
    			$scope.weatherIconUrl = "rain/rain.svg"    			
    		}
    		if(weatherCode==503){
    			$scope.weatherWarningText += "very heavy rain";
    			$scope.weatherIconUrl = "rain/heavy-rain.svg";
    		}
    		if(weatherCode==504){
    			$scope.weatherWarningText += "extreme rain";
    			$scope.weatherIconUrl = "rain/heavy-rain.svg";
    		}
    		if(weatherCode==511){
    			$scope.weatherWarningText += "freezing rain";
    			$scope.weatherIconUrl = "rain/freezing-rain.svg";
    		}
    		if(weatherCode==520){
    			$scope.weatherWarningText += "light intensity shower rain";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "rain/showers-day.svg";
    			else
    				$scope.weatherIconUrl = "rain/showers-night.svg";
    		}
    		if(weatherCode==521){
    			$scope.weatherWarningText += "shower rain";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "rain/showers-day.svg";
    			else
    				$scope.weatherIconUrl = "rain/showers-night.svg";
    		}
    		if(weatherCode==522){
    			$scope.weatherWarningText += "heavy intensity shower rain";
    			$scope.weatherIconUrl = "rain/heavy-rain.svg";
    		}
    		if(weatherCode==531){
    			$scope.weatherWarningText += "ragged shower rain";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "rain/scattered-showers-day.svg";
    			else
    				$scope.weatherIconUrl = "rain/scattered-showers-night.svg";
    		}    		
    	}
    	if(weatherCode>=600 && weatherCode<=622)
    	{
    		$scope.weatherWarningText = "There's a ";
    		if(weatherCode==600){
    			$scope.weatherWarningText += "light snow";
    			$scope.weatherIconUrl = "snow/hail.svg";
    		}
    		if(weatherCode==601){
    			$scope.weatherWarningText += "snow";
    			$scope.weatherIconUrl = "snow/snow.svg";
    		}
    		if(weatherCode==602){
    			$scope.weatherWarningText += "heavy snow";
    			$scope.weatherIconUrl = "snow/heavy-snow.svg";
    		}
    		
    		if(weatherCode==611){
    			$scope.weatherWarningText += "sleet";
    			$scope.weatherIconUrl = "snow/sleet.svg";
    		}
    		if(weatherCode==612){
    			$scope.weatherWarningText += "light shower sleet";
    			$scope.weatherIconUrl = "snow/sleet.svg";
    		}
    		if(weatherCode==613){
    			$scope.weatherWarningText += "shower sleet";
    			$scope.weatherIconUrl = "snow/sleet.svg";
    		}
    		if(weatherCode==615){
    			$scope.weatherWarningText += "light rain and snow";
    			$scope.weatherIconUrl = "snow/wintry-mix-rain-snow.svg";
    		}
    		if(weatherCode==616){
    			$scope.weatherWarningText += "rain and snow";
    			$scope.weatherIconUrl = "snow/wintry-mix-rain-snow.svg";
    		}

    		if(weatherCode==620){
    			$scope.weatherWarningText += "light shower snow";
    			$scope.weatherIconUrl = "snow/snow-shower-snow.svg";
    		}
    		if(weatherCode==621){
    			$scope.weatherWarningText += "shower snow";
    			$scope.weatherIconUrl = "snow/snow-shower-snow.svg";
    		}
    		if(weatherCode==622){
    			$scope.weatherWarningText += "heavy shower snow";
    			$scope.weatherIconUrl = "snow/snow-shower-snow.svg";
    		}  			
    	}
    	if(weatherCode>=701 && weatherCode<=781)
    	{
    		$scope.weatherWarningText = "There's a ";
    		if(weatherCode == 701)
    		{
    			$scope.weatherWarningText += "misty weather";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 711)
    		{
    			$scope.weatherWarningText = "The air is polluted with smoke";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 721)
    		{
    			$scope.weatherWarningText += "hazy sky";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 731)
    		{
    			$scope.weatherWarningText = "There are dust whirls in the air";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 741)
    		{
    			$scope.weatherWarningText += "foggy atmosphere";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 751)
    		{
    			$scope.weatherWarningText += "sandy sky";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 761){
    			$scope.weatherWarningText += "dusty sky";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 762)
    		{
    			$scope.weatherWarningText = "There're volcanic ashes in the air";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";
    		}
    		if(weatherCode == 771)
    		{
    			$scope.weatherWarningText = "There're squalls in the air.";
    			$scope.weatherIconUrl = "haze-fog-dust-smoke.svg";

    		}
    		if(weatherCode == 781)
    		{
    			$scope.weatherWarningText += "coming tornado.";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "tornado-day.svg";
    			else
    				$scope.weatherIconUrl = "tornado-night.svg";
    		}
    	}

    	if(weatherCode == 800)
    	{
    		$scope.weatherWarningText = "Clear ";    		
    		if(now.getHours()>=5 && now.getHours()<=18)
    		{
    			$scope.weatherWarningText += "day";
    			$scope.weatherIconUrl = "clear/clear-day.svg";
    		}
    		else
    		{
    			$scope.weatherWarningText += "night";
    			$scope.weatherIconUrl = "clear/clear-night.svg";
    		}
    	}

    	if(weatherCode>=801 && weatherCode<=804)
    	{
    		$scope.weatherWarningText = "Cloudy weather ";
    		if(weatherCode==801)
    		{
    			//mostly clear
    			$scope.weatherWarningText = "Mostly clear ";
    			if(now.getHours()>=5 && now.getHours()<=18){
    				$scope.weatherWarningText += "day";
    				$scope.weatherIconUrl = "clear/mostly-clear-day.svg";
    			}
    			else{
    				$scope.weatherWarningText += "night";
    				$scope.weatherIconUrl = "clear/mostly-clear-night.svg";
    			}
    		}    			
    		
    		if(weatherCode==802)
    		{
    			//partly cloudy
    			$scope.weatherWarningText += "with scattered clouds in the sky";
    			if(now.getHours()>=5 && now.getHours()<=18)
    				$scope.weatherIconUrl = "cloudy/partly-cloudy-day.svg";
    			else
    				$scope.weatherIconUrl = "cloudy/partly-cloudy-night.svg";
    		}

    		if(weatherCode==803)
    		{
    			//mostly cloudy
    			$scope.weatherWarningText += "with broken clouds in the sky";
    			if(now.getHours()>=5 && now.getHours()<=18){
    				if(cloudPercent<55)
    					$scope.weatherIconUrl = "cloudy/mostly-cloudy-day-1.svg";
    				else
    					$scope.weatherIconUrl = "cloudy/mostly-cloudy-day-2.svg";
    			}
    				
    			else{
    				if(cloudPercent<55)
    					$scope.weatherIconUrl = "cloudy/mostly-cloudy-night-1.svg";
    				else
    					$scope.weatherIconUrl = "cloudy/mostly-cloudy-night-2.svg";
    			}			
    		}

    		if(weatherCode==804)
    		{
    			//overcast
    			//    			
    			$scope.weatherWarningText += "with overcast clouds in the sky";
    			if(cloudPercent<=60)
    				$scope.weatherIconUrl = "cloudy/overcast-clouds-1.svg";
    			else if(cloudPercent>60 && cloudPercent<80)
    				$scope.weatherIconUrl = "cloudy/overcast-clouds-2.svg";
    			else
    				$scope.weatherIconUrl = "cloudy/overcast-clouds-3.svg";

    		}
    	}
    	//console.log(weatherCode +"&" + $scope.weatherIconUrl);    	   	
    }

    $scope.uvIndexDataFetch = function(lat, lon)
    {
    	let uvDataReqUrl = baseUrl + "/uvi?" + "lat=" + lat + "&lon=" + lon + appKeyUrl;

    	let uvDataReq = {
    		method: 'GET',
    		url: uvDataReqUrl,
    		headers: {
    			'Content-Type': 'application/json',
    		},
    	};

    	$http(uvDataReq)
    		.then(function succcessCallBack(response){
    			$scope.uvDataObj = response.data;
    		}, function errorCallBack(){
    			//alert('api req fail');
    		});
    }

    $scope.createReqObj = function(currentWeatherReqUrl, fiveDayForecastReqUrl)
    {
    	let currentWeatherReq = {
    		method: 'GET',
    		url: currentWeatherReqUrl,
    		headers: {
    			'Content-Type': 'application/json',
    		},
    	};

    	let fiveDayForecastReq = {
    		method: 'GET',
    		url: fiveDayForecastReqUrl,
    		headers: {
    			'Content-Type': 'application/json',
    		},
    	};

    	$scope.currentWeatherDataFetch(currentWeatherReq,$http);
    	$scope.fiveDayForecastDataFetch(fiveDayForecastReq,$http);
    }

    $scope.currentWeatherDataFetch = function(req, $http)
    {
    	$http(req)
    		.then(function succcessCallBack(response){
    			$scope.currentWeatherObj = response.data;
    			$scope.uvIndexDataFetch($scope.currentWeatherObj.coord.lat, $scope.currentWeatherObj.coord.lon);
    			$scope.unitSignsSet($scope.britishUnitMode);
    			$scope.tempIconSet($scope.britishUnitMode, $scope.currentWeatherObj);
    		}, function errorCallBack(){
    			alert('Fail to retrieve data from server '+ baseUrl);

    		});      
    }

    $scope.fiveDayForecastDataFetch = function(req, $http)
    {
    	$http(req)
    		.then(function succcessCallBack(response){
    			$scope.fiveDayForecastObj = response.data;
    		}, function errorCallBack(){

    		});      
    }

    $scope.getWeatherByCityName = function(cityName)
    {
        cityName = cityName.split(' ').join('+');
    	let cityUrl = "q="+cityName;
    	let currentWeatherReqUrl = currentWeatherUrl + cityUrl + unitModeUrl + appKeyUrl;
    	let fiveDayForecastReqUrl = fiveDayForecastUrl + cityUrl + unitModeUrl + appKeyUrl;
    	$scope.createReqObj(currentWeatherReqUrl,fiveDayForecastReqUrl);
    }

    $scope.getWeatherByCityId = function(cityID)
    {
    	let cityIDUrl = "id="+cityID;
    	let currentWeatherReqUrl = currentWeatherUrl + cityIDUrl + unitModeUrl + appKeyUrl;
	   	let fiveDayForecastReqUrl = fiveDayForecastUrl + cityIDUrl + unitModeUrl + appKeyUrl;
	   	$scope.createReqObj(currentWeatherReqUrl,fiveDayForecastReqUrl);
    }

    $scope.getWeatherByLatLon = function(latitude, longitude)
    {
    	let inputCoordUrl = "lat="+latitude+"&lon="+longitude;
    	let currentWeatherReqUrl = currentWeatherUrl + inputCoordUrl + unitModeUrl + appKeyUrl;
    	let fiveDayForecastReqUrl = fiveDayForecastUrl + inputCoordUrl + unitModeUrl + appKeyUrl;
    	$scope.createReqObj(currentWeatherReqUrl,fiveDayForecastReqUrl);
    }

    $scope.getWeatherByDetectedLatLon = function(detectedLat, detectedLon)
    {
    	if(detectedLat == null || detectedLon == null)
    		alert("This browser dosen't support or is not allowed to access location");
    	else
    	{
    		let detectedCoordUrl = "lat="+ Math.round(detectedLat*100)/100+"&lon="+ Math.round(detectedLon*100)/100;
    		let currentWeatherReqUrl = currentWeatherUrl + detectedCoordUrl + unitModeUrl + appKeyUrl;
    		let fiveDayForecastReqUrl = fiveDayForecastUrl + detectedCoordUrl + unitModeUrl + appKeyUrl;
    		$scope.createReqObj(currentWeatherReqUrl,fiveDayForecastReqUrl);
       	}    	
    	
    }

    $window.navigator.geolocation.getCurrentPosition(function(pos){
    	alert("Location auto detected");
    	detectedLat = pos.coords.latitude;
    	detectedLon = pos.coords.longitude;
    	$scope.autoDetectMode = true;
    	$scope.getWeather();
    }, function(){
    	alert("Location not detected");
    	detectedLat = null;
    	detectedLon = null;
    	$scope.autoDetectMode = false;
    });


    $scope.getWeather = function()
    {    	
    	if($scope.cityInputMode)
    	{
    		cityName = $scope.cityNameInput;
    		$scope.cityNameInput = "";
    		if(cityName)
    		{
    			$scope.getWeatherByCityName(cityName); 
    			$scope.toggleLeftMenu();   		
    		}
    		
    		else
    			alert("Please enter city name");
    	}

    	else if($scope.idInputMode)
    	{
    		cityID = $scope.cityIdInput;
    		$scope.cityIdInput = "";
    		if(cityID)
    		{
    			$scope.getWeatherByCityId(cityID);
    			$scope.toggleLeftMenu();
    		}
    	}

    	else if($scope.coordInputMode)
    	{
    		latitude = $scope.latInput;
    		longitude = $scope.lonInput;    		
    		$scope.latInput = "";
    		$scope.lonInput = "";
    		if(latitude && longitude)
    		{
    			$scope.getWeatherByLatLon(latitude, longitude);
    			$scope.toggleLeftMenu();   
    		}
    		
    		else
    			alert("Please enter latitude and longitude");
    	}

    	else if($scope.autoDetectMode)
    	{    		
    		if(detectedLat && detectedLon)
    		{    			
    			$scope.getWeatherByDetectedLatLon(detectedLat, detectedLon);
    			$scope.toggleLeftMenu();
    		}
    		else
    			alert("Location not detected, please provide manually");
    		$scope.toggleLeftMenu();  		
    	}

    	else
    	{
    		alert("Please provide a location");
    	}
    	
    }

    $scope.getWeatherRefresh = function()
    {    	
    	if($scope.cityInputMode)
    	{
    		$scope.getWeatherByCityName(cityName);
    	}

    	else if($scope.idInputMode)
    	{
    		$scope.getWeatherByCityId(cityID);
    	}

    	else if($scope.coordInputMode)
    	{
    		$scope.getWeatherByLatLon(latitude, longitude);
    	}
    	else if($scope.autoDetectMode)
    	{
    		if(detectedLat && detectedLon)
    			$scope.getWeatherByDetectedLatLon(detectedLat, detectedLon);
    		else
    			alert("Location not detected, please provide manually");
    	}

    }

});