angular
    .module('myApp', ['ngRoute', 'ngResource'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'home.html',
                controller  : 'homeController'
            });
    })

    .factory('Activities', function ($resource) {
        return $resource('/activities');
    })
    .factory('Stalkers', function ($resource) {
        return $resource('/stalkers');
    })

    .controller('homeController', function ($scope, Activities, Stalkers) {
        Activities.get(function (results) {
            $scope.activities = results.activities;
        });

        $scope.addEmail = function () {
            if ($scope.stalkersForm.$valid) {
                Stalkers.save({email: $scope.email}, function (results) {
                    console.log(results);
                });
            }
        };
    });
