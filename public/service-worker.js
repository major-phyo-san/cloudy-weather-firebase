var cache_name = "app-cache-v1";
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
	'/styles/mainstyle.css',
	'/styles/material-design-icon-fonts/icon-font-include.css',
	'/favicon.png'
];

self.addEventListener('install', function(event){
	console.log('service worker installing');
	event.waitUntil(
		caches.open(cache_name)
		.then(function(cache){
			console.log('opened cache');
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request)
		.then(function(response){
			if(response){
				console.log('cache hit');
				return response;
			}
			return fetch(event.request);
		})

	);
});