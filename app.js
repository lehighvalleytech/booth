var boothApp = angular.module('boothApp', []);

boothApp.controller('BoothBlogCtrl', ['$scope', '$http', '$sce',
    function ($scope, $http, $sce) {
        $scope.trustUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        }

        $scope.page = function(url)
        {
            console.log(url);

            $http.get(url).success(function(data){
                $scope.collection = data;
                console.log($scope.collection);
            });
        };

        $scope.page('https://ewp-tjlytle.fwd.wf/shoots?count=3');
    }]);

boothApp.controller('BoothShootCtrl', ['$scope', '$http', '$sce', '$location', '$timeout',
    function ($scope, $http, $sce, $location, $timeout) {
        $scope.id = $location.path();
        $scope.url = 'https://ewp-tjlytle.fwd.wf/shoots' + $scope.id;

        $scope.trustUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        }

        $scope.refresh = function(){
            console.log($scope.url);
            $http.get($scope.url).success($scope.setData);
        };

        $scope.save = function(){
            console.log($scope.phone);
            console.log($scope.email);
            $http.put($scope.url, {
                email: $scope.email,
                phone: $scope.phone
            }).success($scope.setData);
        };

        $scope.start = function(){
            $http.put($scope.url, {
                status: 'shoot'
            }).success($scope.setData);
        };

        $scope.setData = function(data){
            //allow email / phone to be set without a refresh clearing
            if(data.email){
                $scope.email = data.email;
            }

            if(data.phone){
                $scope.phone = data.phone;
            }

            $scope.shoot = data;

            $scope.done = (data.status == 'done');
            $scope.pose = (data.status == 'pose');
            $scope.shooting = (data.status == 'shoot');

            //done, but nothing to show yet
            $scope.processing = !(data.images.length || data.videos.length) && (data.status == 'done');

            //track if the user was on this page before the shoot was done, only show the email / phone box to them
            $scope.org = ($scope.org || data.status == 'pose' || data.status == 'shoot');

            //clear the original flag if phone and email are set
            if(data.phone && data.email){
                $scope.org = false;
            }


            //poll until we're done and not processing
            //when posting, check every second
            if($scope.pose){
                console.log('posing');
                $timeout($scope.refresh, 1000);
                return;
            }

            //shooting, check every half second
            if ($scope.shooting) {
                console.log('shooting');
                $timeout($scope.refresh, 500);
                return;
            }

            //no video, check 5 seconds
            if ($scope.shoot.videos.length == 0) {
                console.log('waiting for vid');
                $timeout($scope.refresh, 5000);
                return;
            }

            //have video, but not enough images
            if (!($scope.shoot.images.length == 4)) {
                console.log('waiting for images');
                $timeout($scope.refresh, 1000);
                return;
            }
        };

        //initial load & poll
        $scope.refresh();


    }]);