var app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/static/views/home.html",
            controller: "HomeController"
        })
        .when("/signup", {
            templateUrl: "/static/views/signup.html",
            controller: "SignUpController"
        })
        .when("/trackwatchlist", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (!$rootScope.token) {
                        $location.path("/");
                    }
                }
            },
            templateUrl: "/static/views/trackwatchlist.html",
            controller: "TrackWatchList"
        }).when("/tracker",{
        templateUrl: "/static/views/tracker.html",
        controller: "TrackerController"
    });
});

app.run(function ($cookies, $rootScope) {
    if ($cookies.get('token') && $cookies.get('currentUser')) {
        $rootScope.token = $cookies.get('token');
        $rootScope.currentUser = $cookies.get('currentUser');
    }
})

app.controller('HomeController', ['$scope', '$http', '$cookies', '$rootScope', '$timeout', function ($scope, $http, $cookies, $rootScope, $timeout) {
    $scope.show = false;
    loadMeows();
    function loadMeows() {
        $http.get('/meows').success(function (response) {
            console.log(response);
            $scope.meows = response.reverse();
            //$timeout(loadMeows(),5000);
        });
    }

    $scope.addMeow = function (meow) {
        //$scope.meows.push(meow);
        $http.post('/meows', {text: meow.text}, {headers: {'authorization': $rootScope.token}}).then(function (response) {
            console.log(response);
            loadMeows();
        });
    }
    $scope.removeMeow = function (meow) {
        $http.put('/meows/remove', {meow: meow}, {headers: {'authorization': $rootScope.token}}).then(function (response) {
            console.log(response);
            loadMeows();
        });
    }
    $scope.login = function () {
        if (!$scope.email && !$scope.password) {
            console.log("email and Password cannot be empty!");
            $scope.show = true;
            $scope.error = "email and Password cannot be empty!";
            $scope.show = true;
        } else {
            if (!$scope.email) {
                //alert("1")
                console.log("email cannot be empty");
                $scope.error = "email cannor be empty";
                $scope.show = true;
            } else if (!$scope.password) {
                //alert("2");
                console.log("Password cannot be empty");
                $scope.error = "Password cannot be empty";
                $scope.show = true;
            } else if (!validateEmail($scope.email)) {
                console.log("Please enter a valid email");
                $scope.error = "Please enter a valid email";
                $scope.show = true;
            } else {
                //alert("3");
                $http.put('/users/signin', {
                    email: $scope.email,
                    password: $scope.password
                }).then(function (response) {
                    console.log(response.data.token);
                    $cookies.put('token', response.data.token);
                    $cookies.put('currentUserEmail', $scope.email);
                    $cookies.put('currentUser', response.data.name);
                    $rootScope.token = response.data.token;
                    $rootScope.currentUserEmail = $scope.email;
                    $rootScope.currentUser = response.data.name;
                    $scope.show = false;
                    $scope.email = null;
                    $scope.password = null;
                    //alert(response.data);
                }, function (err) {
                    console.log(err);
                    //alert(err.data);
                    $scope.show = true;
                    $scope.error = err.data;
                });
            }
        }
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }
    $scope.logout = function () {
        $cookies.remove('token');
        $cookies.remove('currentUser');
        $cookies.remove('currentUserEmail');
        $rootScope.token = null;
        $rootScope.currentUser = null;
    }
}]);
app.controller('SignUpController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.modalHeader = "Fill in details to signup!"
    $scope.welcome = false;
    $scope.signupform = true;
    $scope.showError = false;
    $scope.signup = function () {
        if (!$scope.name && !$scope.email && !$scope.password && !$scope.matchpassword) {
            $scope.showError = true;
            $scope.error = "Please fill in all the fields!";
        } else if (!$scope.name) {
            $scope.showError = true;
            $scope.error = "Please enter your name!";
        } else if (!$scope.email) {
            $scope.showError = true;
            $scope.error = "Please enter our email!";
        } else if (!validateEmail($scope.email)) {
            $scope.showError = true;
            $scope.error = "Please enter a valid email!";
        } else if (!$scope.password) {
            $scope.showError = true;
            $scope.error = "Please enter your password!";
        } else if (!$scope.matchpassword) {
            $scope.showError = true;
            $scope.error = "Please re enter your password!";
        } else {
            if ($scope.password !== $scope.matchpassword) {
                $scope.showError = true;
                $scope.error = "Passwords do not match.Enter again!";
                $scope.password = null;
                $scope.matchpassword = null;
            } else {
                $http.post('/check/users', {email: $scope.email}).success(function (response) {
                    console.log(response);
                    if (response.status === "present") {
                        $scope.showError = true;
                        $scope.error = "Email ID already used";
                        $scope.email = null;
                    } else {
                        $http.post('/users', {
                            name: $scope.name,
                            email: $scope.email,
                            password: $scope.password
                        }).then(function (response) {
                            $location.path('/');
                            $scope.welcome = true;
                            $scope.signupform = false;
                            $scope.modalHeader = "Succesfully signed up."
                            console.log(response);
                        })
                    }
                });
            }
        }
        /*$http.post('/users', {name : $scope.name ,email: $scope.email, password: $scope.password}).then(function (response) {
         $location.path('/');
         $scope.welcome = true;
         $scope.signupform = false;
         $scope.modalHeader = "Succesfully signed up."
         console.log(response);
         })*/
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    }
}]);
app.controller('TrackWatchList', ['$scope', '$http', '$rootScope','$location', function ($scope, $http, $rootScope, $location) {
    // $scope.movies = [
    //     {
    //         description: "sjhbxjgxghsvxsvx h vxhscfscxsh  svxscx",
    //         url: "sbhcscvsjcsjgcv"
    //     },
    //     {
    //         description: "sjhbxjgxghsvxsvx h vxhscfscxsh  svxscx",
    //         url: "sbhcscvsjcsjgcv"
    //     },
    //     {
    //         description: "sjhb",
    //         url: "sbhcscvsjcsjgcv"
    //     }
    // ]
    $scope.movies = null;
    getMovies();
    function getMovies() {
        console.log("get Movies called")
        $http.get('/get/movies',{headers : {authorization : $rootScope.token}}).success(function (response) {
            console.log(response);
            $scope.movies = response;
        })
    }

    $scope.addMovie = function () {
        $scope.addMovieError = "";
        console.log("addMovie called");
        if (!$scope.url && !$scope.description) {
            $scope.addMovieError = "You need to add description and url to add a watchit";
        } else if (!$scope.description) {
            $scope.addMovieError = "Description for watchIT is required";
        } else if (!$scope.url) {
            $scope.addMovieError = "WatchIt cannot be added without url";
        }else if (!$scope.title) {
            $scope.addMovieError = "WatchIt cannot be added without title";
        } else if (!validateURL($scope.url)) {
            $scope.addMovieError = "This is not a valid youtube url";
        }
        else {
            var videoID = getVideoID($scope.url);
            // if(checkForMovie(videoID)){
            //     var movie = {
            //         description : $scope.description,
            //         url : $scope.url,
            //         arrayOfCheckPoints: []
            //     }
            //     $http.post('/add/movie',{movie : movie},{headers:{authorization  : $rootScope.token}}).then(function (response) {
            //         console.log(response)
            //     },function (error) {
            //         console.log(error + "error is this");
            //     });
            // }
            var movie = {
                description: $scope.description,
                videoID: videoID,
                title : $scope.title,
                arrayOfCheckPoints: []
            }
            $http.post('/add/movie', {movie: movie}, {headers: {authorization: $rootScope.token}}, function (response) {
                $scope.addMovieError = "A new WatchIt created";
                getMovies();
            }, function (err) {

            })
        }


        function validateURL(url) {
            var re = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
            return re.test(url);
        }

        function getVideoID(url) {
            var videoID = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
            if (videoID != null) {
                console.log("video id = ", videoID[1]);
                return videoID[1];
            }
            return null;
        }

        function checkForMovie(url) {
            console.log(url)
            $http.get('/validate/youtube/url', {headers: {url: url}}).then(function (res) {
                //console.log(res)
                return true;
            }, function (err) {
                console.log(err);
                return false;
            })
        }
    }

    $scope.play = function (movie) {
        $rootScope.trackingMovie = movie;
        $location.path('/tracker');
        console.log(movie);
    }
    $scope.delete = function (movie) {
        console.log(movie);
    }
    $scope.callMe = function (movie) {
        $scope.forDescriptionMovie = movie;
        console.log("Working")
    }

}]);
app.controller('TrackerController',['$scope','$http',function ($scope,$http) {
    $scope.consoleProgress = function () {
        var player = document.getElementById('player');
        console.log(player.getDuration());
    }
}]);
// app.directive('youtube', function() {
//     return {
//         restrict: 'E',
//         scope: { code:'=' },
//         template: '/views/youtube.html'
//     };
// });
// app.config(function($sceDelegateProvider) {
//     $sceDelegateProvider.resourceUrlWhitelist([
//         'self',
//         '*://www.youtube.com/**'
//     ]);
// });
