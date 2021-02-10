angular.module('MyApp')
	.controller('LoginController', ['$scope','$rootScope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Authenticate', function ($scope,$rootScope, $http, $route, $location, $window, $timeout, Upload, Authenticate) {

		$scope.fieltype = 'password';
		$scope.AuthenticateUser = function () {
			Authenticate.authUser().save($scope.user).$promise.then(function (response) {
					if (response.success === true) {
						if (response.firstlogin == 0 || response.firstlogin == null) {
							$location.path('/set_new_password');
						} else
							$location.path('/dashboard');
					}
					if (response.success === false) {
						$scope.errormsg = response.message
					}
				},
				function (err) {

				});
		};

		$scope.SignOut = function()
		{
			Authenticate.SignOut().query().$promise.then(function (response) {
                $location.path('/');
            });
		};

		$scope.changeFieldType = function () {
			if ($scope.fieltype == 'password') {
				$scope.fieltype = 'text';
				document.getElementById("password-eye").classList.remove('fa-eye');
				document.getElementById("password-eye").classList.add('fa-eye-slash');
			} else {
				$scope.fieltype = 'password';
				document.getElementById("password-eye").classList.remove('fa-eye-slash');
				document.getElementById("password-eye").classList.add('fa-eye');
			}
		}


		/* PAGINATION */


		$scope.checkcurrpage = function (myValue) {

			if (myValue == null || myValue == 0)
				myValue = 1;

			if (!myValue) {
				window.document.getElementById("mypagevalue").value = $scope.currentPage + 1;
				var element = window.document.getElementById("mypagevalue");
				if (element)
					element.focus();
				$scope.currentPage = $scope.currentPage;
				$scope.myValue = null;
			} else {
				$scope.dispval = "";
				if (myValue - 1 <= 0) {
					$scope.currentPage = 0;
				} else {
					$scope.currentPage = myValue - 1;

					if (!$scope.currentPage) {
						$scope.currentPage = 0;
					}
				}
			}
		};

		$scope.pagination = function (listdata) {
			$scope.recordsdisplay = [{
				value: 10,
				name: 10
			}, {
				value: 25,
				name: 25
			}, {
				value: 50,
				name: 50
			}, {
				value: 100,
				name: 100
			}, {
				value: listdata.length,
				name: 'All'
			}]
			$scope.currentPage = 0;
			$scope.pageSize = 10;
			if ($scope.myValue > listdata.length) {
				$scope.myValue = 1;
			}
			$(".loader").fadeOut("slow");
			$scope.numberOfPages = function () {
				return Math.ceil(listdata.length / $scope.pageSize);
			};
		};


		/* PAGINATION */


		/* PASSWORD STRAINTH */


		function scorePassword(pass) {
			var score = 0;
			if (!pass)
				return score;

			// award every unique letter until 5 repetitions
			var letters = new Object();
			for (var i = 0; i < pass.length; i++) {
				letters[pass[i]] = (letters[pass[i]] || 0) + 1;
				score += 5.0 / letters[pass[i]];
			}

			// bonus points for mixing it up
			var variations = {
				digits: /\d/.test(pass),
				lower: /[a-z]/.test(pass),
				upper: /[A-Z]/.test(pass),
				nonWords: /\W/.test(pass),
			}

			variationCount = 0;
			for (var check in variations) {
				variationCount += (variations[check] == true) ? 1 : 0;
			}
			score += (variationCount - 1) * 10;

			return parseInt(score);
		}

		function checkPassStrength(pass) {
			var score = scorePassword(pass);
			if (score > 80) {
				if ($scope.confirm_password === $scope.UserDetails[0].password) {
					$('#resetpassbtn').prop('disabled', false);
				}
				return "Strong";
			}
			if (score > 60) {
				if ($scope.confirm_password === $scope.UserDetails[0].password) {
					$('#resetpassbtn').prop('disabled', false);
				}
				return "Good";
			}
			if (score >= 30) {
				return "Weak";
			}


			return "";
		}

		function ColorPassword(pass) {
			var score = scorePassword(pass);
			if (score > 80)
				return "green";
			if (score > 60)
				return "#FFDB00";
			if (score >= 30)
				return "red";

			return "";
		}

		$scope.verfiPasswordConf = function (password, confpassword) {
			if (confpassword) {
				if (confpassword != password) {
					$scope.passstrenth = "Password and confirm password does not match";
					$('#resetpassbtn').prop('disabled', true);
				}
				if (confpassword === password) {
					$scope.passstrenth = (checkPassStrength(password));
				}
			}
		};


		$scope.verifyPasswordStrongness = function (passkey) {
			if (!passkey || passkey === '')
				$scope.passwordcalc = false;
			else
				$scope.passwordcalc = true;

			$scope.passstrenth = (checkPassStrength(passkey));
			$scope.passscore = (scorePassword(passkey));
			$scope.prgcol = (ColorPassword(passkey));

			$scope.verfiPasswordConf(passkey, $scope.confirm_password);

		};

		/* PASSWORD STRAINTH */


		$scope.SetNewPassword = function () {
			Authenticate.SetNewPassword().save($scope.UserDetails).$promise.then(function (response) {
				if (response.status == true) {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					}).then(function () {
						if (response.forgotpassword == 1) {
							$location.path('/');
							$scope.$apply();
						} else {
							$location.path('/dashboard');
							$scope.$apply();
						}
					});
				} else {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					})
				}
			});
		};

		//time
		$scope.time = 60;

		//timer callback
		var timer = function () {
			if ($scope.time > 0) {
				$scope.time -= 1;
				$timeout(timer, 1000);
			}
		}

		$scope.arrayObj = [{
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}];
		$scope.focusIndex = 0;

		$scope.SetFocus = function (index) {
			$scope.focusIndex = index;
		};


		$scope.SubmitOtpAnResetpassword = function () {
			var OTP = '';
			$scope.arrayObj.map(function (indval) {
				OTP = OTP + '' + indval.otp;
			});

			Authenticate.verifyOTP().query({otp:OTP.trim()}).$promise.then(function (response) {
				if (response.status === 0) {
					$('#myModal').modal('hide');
					$location.path('/set_new_password');
				} else {
					Swal({
					type: "error",
					title: "Oops!",
					text: "OTP does not match",
				})
				}
			});
		};


		$scope.ForgotPassword = function () {

			Authenticate.ForgotPassword().save($scope.user).$promise.then(function (response) {
				if (response.success === true) {
					$scope.sentotpmessage = response.message;

					$timeout(function () {
						$scope.showbtn = true;
						$timeout(timer, 1000);
					}, 20000);

				} else {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					}).then(function () {
						location.reload();
					})
				}
			});
		};


		$scope.openNav = false;

		$scope.ToggleNavbar = function () {
			$scope.openNav = true;
			var className = $('#sidenav').attr('class');
			if (className == 'main_sidebar animated bg-amin slideInLeft') {
				$("#sidenav").removeClass("slideInLeft").addClass("slideOutLeft");
				$(".container-fluid *").attr("disabled", false);
			} else {
				$("#sidenav").addClass("slideInLeft").removeClass("slideOutLeft");
				$(".container-fluid *").attr("disabled", "disabled");
			}
		};

		$scope.hideNavbar = function () {
			$("#sidenav").removeClass("slideInLeft").addClass("slideOutLeft");
			$(".container-fluid *").attr("disabled", false);
		}


		$scope.RedirectLink = function (path) {
			$location.path(path);
		}


		function getSession()
        {
            Authenticate.getSession().query().$promise.then(function (response) {
				$scope.userDetails = response;    
				 
				if($location.path() != '/')
				{
				if( $scope.userDetails.message == "Unauthorized")
				{
					Swal({
						type: 'error',
						title: 'Session Expire',
						text: 'Your last login session has expire.',
					}).then(function () {
						
					})
					$scope.RedirectLink('/');
				}
			}
            });   
		} getSession();


	// USER DETAILS

	$scope.getUserDetails = function(userdetails)
	{
		$scope.UserDetails = [];
		$scope.UserDetails.push(userdetails);
	};

	$scope.getUserList = function()
	{
		Authenticate.getUserList().query().$promise.then(function (response) {
				 if(!response.status)
					$scope.UsersList = response.UsersList;
			});      
	};

	$scope.deleteUserDetails = function(id)
	{

		Swal({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		  }).then(function(result) {
			if (result.value) {
				Authenticate.deleteUserDetails().query({ id: id}).$promise.then(function (response) {   
				  Swal({
					type: response.type,
					title: response.title,
					text: response.message,
				  }).then(function(){
					$scope.getUserList();
				  })
				});
			  }
			});
	};

	$scope.VerifyUserContacts = function()
	{
		if($scope.UserDetails[0].email && $scope.UserDetails[0].email != '' && $scope.UserDetails[0].email != null)
		{
			Authenticate.VerifyUserEmail().save($scope.UserDetails[0]).$promise.then(function(response){
				if(response.result[0].emailexist > 0)
				{
					$scope.emailexist = "Email ID already exist in record";
				}
				else
				{
					$scope.emailexist = undefined;  
				}
			});
		}

		if($scope.UserDetails[0].mobile && $scope.UserDetails[0].mobile != '' && $scope.UserDetails[0].mobile != 0 && $scope.UserDetails[0].mobile != null)
		{
			Authenticate.VerifyUserMobile().save($scope.UserDetails[0]).$promise.then(function(response){
				if(response.result[0].mobileexist > 0)
				{
					$scope.mobileexist = "Mobile already exist in record";
				}
				else
				{
					$scope.mobileexist = undefined;
				}
			});
		}
	};

	$scope.SaveUserDetails = function()
	{
		Authenticate.SaveUserDetails().save($scope.UserDetails[0]).$promise.then(function(response){
			Swal({
				type: response.type,
				title: response.title,
				text: response.message,
			  }).then(function() {
				$scope.getUserList();
				if(response.status == 0)
				{
					$scope.UserDetails = [];
					$scope.getUserList();
				}
			  })
		});
	};

	$scope.userRoles = [{title:"Staff", value:"staff"},{title:"Admin", value:"admin"}]

	$scope.getUserRole = function(role)
	{
	   var roleexist = $scope.userRoles.filter(function(val){
		   return val.value == role;
	   });
	   if(roleexist != undefined && roleexist.length > 0)
	   {
		   return roleexist[0].title;
	   }
	   else
	   {
		   return role;
	   }
	}


		
	}]);