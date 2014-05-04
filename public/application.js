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
    .factory('Chefs', function ($resource) {
        return $resource('/chefs');
    })

    .filter('count', function () {
        return function (arr, status) {
            var count = 0;
            if (arr && Array.isArray(arr)) {
                arr.forEach(function (el) {
                    if (el.status === status) {
                        count += 1;
                    }
                });
            }
            return count;
        };
    })

    .controller('homeController', function ($scope, Activities, Stalkers, Chefs) {
        Activities.get(function (results) {
            $scope.activities = results.activities;
        });

        Chefs.get(function (results) {
            $scope.chefs = results.chefs;
        });

        $scope.addEmail = function () {
            if ($scope.stalkersForm.$valid) {
                Stalkers.save({email: $scope.email}, function (results) {
                    console.log(results);
                });
            }
        };
    });
