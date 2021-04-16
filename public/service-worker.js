var cache_name = "app-cache-v27";
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
               'images/weahter-icons/tornado-day.svg',
               'images/weahter-icons/tornado-night.svg',
               'images/weahter-icons/clear/clear-day.svg',
               'images/weahter-icons/clear/clear-night.svg',
               'images/weahter-icons/clear/mostly-clear-day.svg',
               'images/weahter-icons/clear/mostly-clear-night.svg',
               'images/weahter-icons/cloudy/mostyl-cloudy-day-1.svg',
               'images/weahter-icons/cloudy/mostly-cloudy-day-2.svg',
               'images/weahter-icons/cloudy/mostly-cloudy-night-1.svg',
               'images/weahter-icons/cloudy/mostly-cloudy-night-2.svg',
               'images/weahter-icons/cloudy/overcast-clouds-1.svg',
               'images/weahter-icons/cloudy/overcast-clouds-2.svg',
               'images/weahter-icons/cloudy/overcast-clouds-3.svg',
               'images/weahter-icons/cloudy/partly-cloudy-day.svg',
               'images/weahter-icons/cloudy/partly-cloudy-night.svg',
               'images/weahter-icons/drizzle/drizzle.svg',
               'images/weahter-icons/drizzle/drizzle-heavy.svg',
               'images/weahter-icons/drizzle/drizzle-rain.svg',
               'images/weahter-icons/measurements/humidity.svg',
               'images/weahter-icons/measurements/rain.svg',
               'images/weahter-icons/measurements/temp-cold.svg',
               'images/weahter-icons/measurements/temp-hot.svg',
               'images/weahter-icons/measurements/temp-moderate.svg',
               'images/weahter-icons/measurements/wind-day.svg',
               'images/weahter-icons/measurements/wind-night.svg',
               'images/weahter-icons/rain/freezing-rain.svg',
               'images/weahter-icons/rain/heavy-rain.svg',
               'images/weahter-icons/rain/light-rain.svg',
               'images/weahter-icons/rain/scattered-showers-day.svg',
               'images/weahter-icons/rain/scattered-showers-night.svg',
               'images/weahter-icons/rain/showers-day.svg',
               'images/weahter-icons/rain/showers-night.svg',
               'images/weahter-icons/snow/hail.svg',
               'images/weahter-icons/snow/heavy-snow.svg',
               'images/weahter-icons/snow/sleet.svg',
               'images/weahter-icons/snow/snow-shower-snow.svg',
               'images/weahter-icons/snow/wintry-mix-rain-snow.svg',
               'images/weahter-icons/thunderstorm/isolated-scattered-tstorms-day.svg',
               'images/weahter-icons/thunderstorm/isolated-scattered-tstorms-night.svg',
               'images/weahter-icons/thunderstorm/thunderstorm.svg',
               'images/weahter-icons/thunderstorm/thunderstorm-light.svg',
               'images/weahter-icons/thunderstorm/thunderstorm-rain.svg',
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