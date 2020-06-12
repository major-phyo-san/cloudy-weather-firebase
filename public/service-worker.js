var cache_name = "app-cache-v24";
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