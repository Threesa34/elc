angular.module('MyApp')
  .factory('Authenticate', ['$resource', function ($resource) {

    return{

        authUser: function () {
            return $resource('/api/authUser',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        SetNewPassword: function () {
            return $resource('/api/SetNewPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        ForgotPassword: function () {
            return $resource('/api/ForgotPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        verifyOTP: function () {
            return $resource('/api/verifyOTP/:otp',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
		getUserDetails: function () {
            return $resource('/api/getUserDetails/:userid', {});
        },
        getSession: function () {
            return $resource('/api/getSession',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
		SignOut: function () {
            return $resource('/api/SignOut/',
            {}, { 'query': { method: 'GET',isArray:false } });
        },
        checkConnection: function()
        {
            return "connected"
        },
        // USERS DETAILS


        getUserList: function()
        {
            return $resource('/api/getUserList',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        deleteUserDetails: function()
        {
            return $resource('/api/deleteUserDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        SaveUserDetails: function()
        {
            return $resource('/api/SaveUserDetails',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyUserEmail: function()
        {
            return $resource('/api/VerifyUserEmail',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyUserMobile: function()
        {
            return $resource('/api/VerifyUserMobile',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

    }

  }]);