angular.module('MyApp')
	.controller('DashboardController', ['$scope','$rootScope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Dashboard','Authenticate', function ($scope,$rootScope, $http, $route, $location, $window, $timeout, Upload, Dashboard, Authenticate) {
        

        $scope.dateOptionsFilters = {
            changeYear: true,
            changeMonth: true,
            yearRange:'2019:-0',
            };

        function formatDate(date){
           
            if(date)
            {
                var dd = new Date(date).getDate();
                var mm = new Date(date).getMonth()+1;
                var yy = new Date(date).getFullYear();
            }
        
            return yy+'/'+mm+'/'+dd;
    }
        
        $scope.getDashboardValues = function(Date_from, date_to)
        {

            // if(Date_from ||  date_to)
            {
                if(Date_from)
                {
                    var from_dsDate =  Date_from;
                }
                else
                {
                    var from_dsDate =  new Date();
                }

                if(date_to)
                {
                    var to_dsDate =  date_to;
                }
                else
                {
                    var to_dsDate =  from_dsDate;
                }
            }

            Dashboard.getDashboardValues().save([{from_dsDate:formatDate(from_dsDate),to_dsDate:formatDate(to_dsDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.dashboardValues = response.dashboardValues;
            });
        };

        $scope.SendNotifuication = function()
        {
            Dashboard.ExeNotification('sample User',"Sample message sent from device")
        }


        $scope.RedirectLink = function (path) {
			$location.path(path);
        }

        function getSession()
        {
            Authenticate.getSession().query().$promise.then(function (response) {
				$scope.userDetails = response;    
            });   
		} getSession();

    }]);

