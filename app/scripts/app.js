angular.module('MyApp', ['ngResource', 
'ngSanitize', 
'ngAnimate',
 'ngRoute', 
 'ui.bootstrap', 
 'ngFileUpload', 
 'ngCookies',
 'ui.date']).config(["$routeProvider","$locationProvider","$httpProvider",function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "public/login.html",
		controller:"LoginController"
    })
    .when("/set_new_password", {
      templateUrl : "public/setNewPassword.html",
       controller:"LoginController"
    })
    .when("/dashboard", {
      templateUrl : "public/dashboard.html",
       controller:"DashboardController"
    })
    
    .when("/users", {
      templateUrl : "public/users.html",
       controller:"LoginController"
    })
    .when("/contacts", {
      templateUrl : "public/contacts.html",
       controller:"EntityController"
    })
    .when("/nearest", {
      templateUrl : "public/nearest.html",
       controller:"EntityController"
    })
    .when("/families", {
      templateUrl : "public/families.html",
       controller:"EntityController"
    })
    .when("/lists", {
      templateUrl : "public/lists.html",
       controller:"EntityController"
    })
    .when("/birthdays", {
      templateUrl : "public/birthdays.html",
       controller:"EntityController"
    })
	.otherwise({
		  redirectTo: ''
		});
}])