angular
    .module('myApp', ['ngRoute', 'ngResource'])
    .config(function ($routeProvider) {
        console.log('routeProvider')
        $routeProvider
            .when('/', {
                templateUrl : 'home.html',
                controller  : 'homeController'
            });
    })

    .factory('Activities', function ($resource) {
        return $resource('/activities');
    })

    .controller('homeController', function ($scope, Activities) {
        Activities.get(function (results) {
            $scope.activities = results.activities;
        });
    });
