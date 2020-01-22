var cache_name = "app-cache-v2";
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
		navigator.serviceWorker.register('/service-worker.js').
		then(function(registration){
		}, function(err){
		});
	});
}

self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open(cache_name).
		then(function(cache){
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request)
		.then(function(response){
			if(response){
				return response;
			}
			var fetchRequest = event.request.clone();

			return fetch(fetchRequest)
			.then(function(response){
				if(!response || response.status !== 200){
					return response;
				}
			var responseToCache = response.clone();

			caches.open(cache_name)
			.then(function(cache){
				cache.put(event.request, responseToCache);
				});
			return response;
			});
		})

	);
});