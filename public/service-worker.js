var cache_name = "app-cache-v3";
var urlsToCache = [
	'/',
	'/index.html',
	'/app/main.js',

	'/app/angular-1.7.8/angular.min.js',
	'/app/angular-1.7.8/angular-animate.min.js',
	'/app/angular-1.7.8/angular-aria.min.js',
	'/app/angular-1.7.8/angular-material-icons.min.js',
	'/app/angular-1.7.8/angular-messages.min.js',
	'/app/angular-1.7.8/angular-route.min.js',

	'/app/angular-material-1.1.12/angular-material.min.js',
	'/app/angular-material-1.1.12/angular-material.min.css',

	'/app/angular-material-table-0.10.9/md-data-table.min.css',
	'/app/angular-material-table-0.10.9/md-data-table.min.js',

	'/styles/mainstyle.css',
	'/styles/material-design-icon-fonts/icon-font-include.css',
	'/styles/material-design-icon-fonts/icon-fonts.woff2',

	'/favicon.png',
	'images/icons/icon-32x32.png',
	'images/icons/banner.png',

	'images/weather-icons/clear-day.svg',
	'images/weather-icons/clear-night.svg',
	'images/weather-icons/cloudy.svg',
	'images/weather-icons/fog.svg',
	'images/weather-icons/hail.svg',
	'images/weather-icons/partly-cloudy-day.svg',
	'images/weather-icons/partly-cloudy-night.svg',
	'images/weather-icons/rain.svg',
	'images/weather-icons/sleet.svg',
	'images/weather-icons/snow.svg',
	'images/weather-icons/thunderstorm.svg',
	'images/weather-icons/tornado.svg',
	'images/weather-icons/wind.svg'
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