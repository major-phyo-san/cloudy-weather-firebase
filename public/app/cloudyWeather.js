var cloudyWeather = angular.module("cloudyWeather",['ngMaterial','ngMessages','ngRoute','md.data.table']);

cloudyWeather.config(['$routeProvider', function($routeProvider){
	$routeProvider
	.when("/cities-list",{
		templateUrl: "cities-list.html",
		controller: "citiesListController"
	})
	.otherwise({
		redirectTo: "/"
	})
}]);

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

    let baseUrl = "https://api.openweathermap.org/data/2.5"
    let currentWeatherUrl = baseUrl+"/weather?";
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
    $scope.weatherIconUrl = "clear-day.svg";

    $scope.today = new Date();
    $scope.tomorrow = new Date();
    $scope.nextTwoDays = new Date();
    $scope.nextThreeDays = new Date();
    $scope.nextFourDays = new Date();
    $scope.nextFiveDays = new Date();

    $scope.tomorrow.setDate($scope.today.getDate()+1);
    $scope.nextTwoDays.setDate($scope.today.getDate()+2);
    $scope.nextThreeDays.setDate($scope.today.getDate()+3);
    $scope.nextFourDays.setDate($scope.today.getDate()+4);
    $scope.nextFiveDays.setDate($scope.today.getDate()+5);
    
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

    $scope.dateObjectToNormalDate = function(dateObj)
    {
        let year = dateObj.getFullYear();
        let month = dateObj.getMonth() + 1;
        if(month<10)
            month = "0" + month;
        let day = dateObj.getDate();
        if(day<10)
            day = "0" + day;
        let date = year + "-" + month + "-" + day;
        return date;
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

    	let hour = datetime.getHours();
    	if(hour<10)
    		hour = "0" + hour;

    	let minute = datetime.getMinutes();
    	if(minute<10)
    		minute = "0" + minute;

    	let second = datetime.getSeconds();
    	if(second<10)
    		second = "0" + second;

    	let time = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
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
    	return deg + " degree " + "(" + dir + ")";
    }

    $scope.weatherIconAndWarning = function(weatherCode)
    {
    	let now = new Date($scope.currentWeatherObj.dt * 1000);
    	if(weatherCode>=200 && weatherCode<=232)
    	{
    		$scope.weatherWarningText = "There's a thunderstorm, ";
    		if(weatherCode>=200 && weatherCode<=202)
    		{
    			$scope.weatherWarningText += "you should prepare for light to heavy rain.";
    			$scope.weatherIconUrl = "thunderstorm.svg";
    		}
    		if(weatherCode>=210 && weatherCode<=212)
    		{
    			$scope.weatherWarningText += "you'd better not go out in case of heavy thunderstorm.";
    			$scope.weatherIconUrl = "thunderstorm.svg";
    		}
    		if(weatherCode == 221)
    		{
    			$scope.weatherWarningText += "go out and see the ragged thunderstorm.";
    			$scope.weatherIconUrl = "thunderstorm.svg";
    		}
    		if(weatherCode>=230 && weatherCode<=232)
    		{
    			$scope.weatherWarningText += "feel the drizzle out there."; 
    			$scope.weatherIconUrl = "thunderstorm.svg";
    		}    		
    			   		
    	}
    	if(weatherCode>=300 && weatherCode<=321)
    	{
    		$scope.weatherWarningText = "There's a drizzle, ";
    		if(weatherCode>=300 && weatherCode<=302)
    		{
    			$scope.weatherWarningText += "feel the drizzle out there.";
    			$scope.weatherIconUrl = "sleet.svg";
    		}
    		if(weatherCode>=310 && weatherCode<=312)
    		{
    			$scope.weatherWarningText += "feel the drizzle with rain.";
    			$scope.weatherIconUrl = "rain.svg";
    		}
    		if(weatherCode>=313 && weatherCode<=321)
    		{
    			$scope.weatherWarningText += "you should bring your umbrella for shower rain.";
    			$scope.weatherIconUrl = "rain.svg";
    		}	
    			    		
    	}
    	if(weatherCode>=500 && weatherCode<=531)
    	{
    		$scope.weatherWarningText = "There's a rain, ";
    		if(weatherCode>=500 && weatherCode<=501)
    		{
    			$scope.weatherWarningText += " feel the rain out there.";
    			$scope.weatherIconUrl = "rain.svg";
    		}
    		if(weatherCode>=502 && weatherCode<=504)
    		{
    			$scope.weatherWarningText += " a very heavy rain, better not go out.";
    			$scope.weatherIconUrl = "thunderstorm.svg";
    		}
    		if(weatherCode == 511)
    		{
    			$scope.weatherWarningText += " get a blanket and coffee, it's very cold outside.";
    			$scope.weatherIconUrl = "hail.svg";
    		}
    		if(weatherCode>=520 && weatherCode<=531)
    		{
    			$scope.weatherWarningText += "you should bring your umbrella for shower rain.";
    			$scope.weatherIconUrl = "rain.svg";
    		}
    	}
    	if(weatherCode>=600 && weatherCode<=622)
    	{
    		$scope.weatherWarningText = "There's snowing, ";
    		if(weatherCode>=600 && weatherCode<=602)
    		{
    			$scope.weatherWarningText += "keep yourself warm.";
    			$scope.weatherIconUrl = "snow.svg";
    		}
    		if(weatherCode>=611 && weatherCode<=613)
    		{
    			$scope.weatherWarningText += "feel the icy sleet.";
    			$scope.weatherIconUrl = "sleet.svg";
    		}
    		if(weatherCode>=615 && weatherCode<=616)
    		{
    			$scope.weatherWarningText += "kee yourself warm in the icy rain.";
    			$scope.weatherIconUrl = "hail.svg"
    		}
    		if(weatherCode>=620 && weatherCode<=622)
    		{
    			$scope.weatherWarningText += "bring your umbrella for the icy shower.";
    			$scope.weatherIconUrl = "hail.svg";
    		}
    	}
    	if(weatherCode>=701 && weatherCode<=781)
    	{
    		$scope.weatherWarningText = "The sky is not clear ";
    		if(weatherCode == 701)
    		{
    			$scope.weatherWarningText += "with mist.";
    			$scope.weatherIconUrl = "fog.svg";
    		}
    		if(weatherCode == 711)
    		{
    			$scope.weatherWarningText += "with smoke. Put on your facial mask.";
    			$scope.weatherIconUrl = "fog.svg";
    		}
    		if(weatherCode == 721)
    		{
    			$scope.weatherWarningText += "with haze.";
    			$scope.weatherIconUrl = "fog.svg";
    		}
    		if(weatherCode == 731 || weatherCode == 761)
    		{
    			$scope.weatherWarningText += "with dusts. Put on your facial mask.";
    			$scope.weatherIconUrl = "wind.svg";
    		}
    		if(weatherCode == 741)
    		{
    			$scope.weatherWarningText += "with fog in the air.";
    			$scope.weatherIconUrl = "fog.svg";
    		}
    		if(weatherCode == 751)
    		{
    			$scope.weatherWarningText += "with sand.";
    			$scope.weatherIconUrl = "wind.svg";
    		}
    		if(weatherCode == 762)
    		{
    			$scope.weatherWarningText += "with volcanic ash. Breath with care.";
    			$scope.weatherIconUrl = "fog.svg";
    		}
    		if(weatherCode == 771)
    		{
    			$scope.weatherWarningText += "with squalls in the air.";
    			$scope.weatherIconUrl = "fog.svg";

    		}
    		if(weatherCode == 781)
    		{
    			$scope.weatherWarningText += "with the coming tornado.";
    			$scope.weatherIconUrl = "tornado.svg";
    		}
    	}

    	if(weatherCode == 800)
    	{
    		$scope.weatherWarningText = "Clear ";    		
    		if(now.getHours()<=18)
    		{
    			$scope.weatherWarningText += "day.";
    			$scope.weatherIconUrl = "clear-day.svg";
    		}
    		if(now.getHours()>18)
    		{
    			$scope.weatherWarningText += "night.";
    			$scope.weatherIconUrl = "clear-night.svg";
    		}
    	}
    	if(weatherCode>=801 && weatherCode<=804)
    	{
    		$scope.weatherWarningText = "Cloudy weather ";
    		if(weatherCode==801)
    		{
    			$scope.weatherWarningText += "with few clouds in the sky.";
    			if(now.getHours()<=18)
    				$scope.weatherIconUrl = "partly-cloudy-day.svg";
    			if(now.getHours()>18)
    				$scope.weatherIconUrl = "partly-cloudy-night.svg";
    		}
    		if(weatherCode==802)
    		{
    			$scope.weatherWarningText += "with scattered clouds in the sky.";
    			if(now.getHours()<=18)
    				$scope.weatherIconUrl = "partly-cloudy-day.svg";
    			if(now.getHours()>18)
    				$scope.weatherIconUrl = "partly-cloudy-night.svg";
    		}
    		if(weatherCode==803)
    		{
    			$scope.weatherWarningText += "with broken clouds in the sky.";    			
    			$scope.weatherIconUrl = "cloudy.svg";
    		}
    		if(weatherCode==804)
    		{
    			$scope.weatherWarningText += "with overcast clouds in the sky.";
    			$scope.weatherIconUrl = "cloudy.svg";
    		}
    	}
    }

    $scope.addCurrentCityToAvailableCities =function(weatherObj)
    {
    	var db = firebase.firestore();
    	db.collection("available-cities").doc(String(weatherObj.id)).set({
    	cityId: weatherObj.id,
    	cityName: weatherObj.name,
    	latitude: weatherObj.coord.lat,
    	longitude: weatherObj.coord.lon,
    	countryCode: weatherObj.sys.country
    	}).then(function(){
    		alert("A New City info: added.");
    	}).catch(function(error){
    		alert("Error adding new city info: ", error);
    	});
    }

    $window.navigator.geolocation.getCurrentPosition(function(pos){
    	detectedLat = pos.coords.latitude;
    	detectedLon = pos.coords.longitude;
    }, function(){
    	alert("this browser dosen't support or is not allowed location access");
    });

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
    			alert('api req fail');
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
    			$scope.weatherIconAndWarning($scope.currentWeatherObj.weather[0].id);
    			$scope.addCurrentCityToAvailableCities($scope.currentWeatherObj);
    		}, function errorCallBack(){
    			alert('api req fail');
    			$scope.toggleLeftMenu();
    		});      
    }

    $scope.fiveDayForecastDataFetch = function(req, $http)
    {
    	$http(req)
    		.then(function succcessCallBack(response){
    			$scope.fiveDayForecastObj = response.data;
    		}, function errorCallBack(){
    			alert('api req fail');
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
    	let detectedCoordUrl = "lat="+ Math.round(detectedLat*100)/100+"&lon="+ Math.round(detectedLon*100)/100;
    	let currentWeatherReqUrl = currentWeatherUrl + detectedCoordUrl + unitModeUrl + appKeyUrl;
    	let fiveDayForecastReqUrl = fiveDayForecastUrl + detectedCoordUrl + unitModeUrl + appKeyUrl;
    	$scope.createReqObj(currentWeatherReqUrl,fiveDayForecastReqUrl);
    }

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
    			alert("no location detected automatically, please provide location manually");    		
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
    			alert("no location detected automatically, please provide location manually");
    	}

    }

});

cloudyWeather.controller("citiesListController", function($scope,$http){
	var db = firebase.firestore();
	$scope.retrievedCityList = [];
	db.collection("available-cities").get().then((querySnapshot)=>{
		querySnapshot.forEach((doc)=>{			
			$scope.retrievedCityList.push({
				"cityId": `${doc.id}`,
				"cityName": `${doc.data().cityName}`,
				"latitude": `${doc.data().latitude}`,
				"longitude": `${doc.data().longitude}`,
				"countryCode": `${doc.data().countryCode}`
			});
		});
	});

});
