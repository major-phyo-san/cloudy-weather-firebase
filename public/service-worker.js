var cache_name = "app-cache-v25";
var urlsToCache = [
	'/',
	'/index.html',
	'/app/app.js',

	'/app/angular-1.7.8/angular.min.js',
	'/app/angular-1.7.8/angular-animate.min.js',
	'/app/angular-1.7.8/angular-aria.min.js',
	'/app/angular-1.7.8/angular-material-icons.min.js',
	'/app/angular-1.7.8/angular-messages.min.js',
	'/app/angular-1.7.8/angular-route.min.js',

	'/app/angular-material-1.1.12/angular-material.min.js',
	'/app/angular-material-1.1.12/angular-material.min.css',

	'/styles/main-style.css',
	'/styles/material-design-icon-fonts/icon-font-include.css',
	'/styles/material-design-icon-fonts/icon-fonts.woff2',

	'/favicon.png',
	'images/icons/icon-32x32.png',
	'images/icons/banner.png',

	'images/weather-icons/haze-fog-dust-smoke.svg',
	'images/weather-icons/tornado-day.svg',
	'images/weather-icons/tornado-night.svg',

	'images/weather-icons/clear/clear-day.svg',
	'images/weather-icons/clear/clear-night.svg',
	'images/weather-icons/clear/mostly-clear-day.svg',
	'images/weather-icons/clear/mostly-clear-night.svg',

	'images/weather-icons/cloudy/mostly-cloudy-day-1.svg',
	'images/weather-icons/cloudy/mostly-cloudy-day-2.svg',
	'images/weather-icons/cloudy/mostly-cloudy-night-1.svg',
	'images/weather-icons/cloudy/mostly-cloudy-night-2.svg',
	'images/weather-icons/cloudy/overcast-clouds-1.svg',
	'images/weather-icons/cloudy/overcast-clouds-2.svg',
	'images/weather-icons/cloudy/overcast-clouds-3.svg',
	'images/weather-icons/cloudy/partly-cloudy-day.svg',
	'images/weather-icons/cloudy/partly-cloudy-night.svg',

	'images/weather-icons/drizzle/drizzle-heavy.svg',
	'images/weather-icons/drizzle/drizzle-rain.svg',
	'images/weather-icons/drizzle/drizzle.svg',

	'images/weather-icons/rain/freezing-rain.svg',
	'images/weather-icons/rain/heavy-rain.svg',
	'images/weather-icons/rain/light-rain.svg',
	'images/weather-icons/rain/rain.svg',
	'images/weather-icons/rain/scattered-showers-day.svg',
	'images/weather-icons/rain/scattered-showers-night.svg',
	'images/weather-icons/rain/showers-day.svg',
	'images/weather-icons/rain/showers-night.svg',

	'images/weather-icons/snow/hail.svg',
	'images/weather-icons/snow/heavy-snow.svg',
	'images/weather-icons/snow/sleet.svg',
	'images/weather-icons/snow/snow-shower-snow.svg',
	'images/weather-icons/snow/snow.svg',
	'images/weather-icons/snow/wintry-mix-snow.svg',

	'images/weather-icons/thunderstorm/isolated-scattered-tstorms-day.svg',
	'images/weather-icons/thunderstorm/isolated-scattered-tstorms-night.svg',
	'images/weather-icons/thunderstorm/thunderstorm-light.svg',
	'images/weather-icons/thunderstorm/thunderstorm-rain.svg',
	'images/weather-icons/thunderstorm/thunderstorm.svg',

	'images/weather-icons/measurements/humidity.svg',
	'images/weather-icons/measurements/temp-cold.svg',
	'images/weather-icons/measurements/temp-moderate.svg',
	'images/weather-icons/measurements/temp-hot.svg'
	'images/weather-icons/measurements/wind-day.svg',
	'images/weather-icons/measurements/wind-night.svg'
];

if('serviceWorker' in navigator){
	window.addEventListener('load', function(){
		navigator.serviceWorker.register('service-worker.js').
		then(function(registration){
			console.log("registered");
		}, function(err){
			console.log("not registered");
		});
	});
}

self.addEventListener('install', function(event){
	event.waitUntil(
		caches.keys().then(function(cacheNames){ 
			return Promise.all(
				cacheNames.map(function(cacheName){
						console.log("deleting old caches");
						return caches.delete(cacheName);					
					})
				);
			})
		);

	event.waitUntil(
		caches.open(cache_name).
		then(function(cache){
			console.log("installing new caches");
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event){
	if(event.request.url.includes("cloudy-weather-2019.firebaseapp.com")){
		event.respondWith(
		caches.match(event.request)
		.then(function(response){
			if(response){
				return response;
			}
			return fetch(event.request);
			})

		);
	}
});