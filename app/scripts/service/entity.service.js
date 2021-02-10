angular.module('MyApp')
  .factory('Entity', ['$resource', function ($resource) {

    return{

        getContactList: function()
        {
            return $resource('/api/getContactList/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        getContactListPagination: function()
        {
            return $resource('/api/getContactListPagination/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        AddNewContact: function()
        {
            return $resource('/api/AddNewContact/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        deleteContactDetails: function()
        {
            return $resource('/api/deleteContactDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        saveContact: function()
        {
          return $resource('/api/saveContact',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        ImportContactDetails: function()
        {
          return $resource('/api/ImportContactDetails',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        importCsvContactDetails: function()
        {
          return $resource('/api/importCsvContactDetails',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        ImportContactDetailsCustomeSetting: function()
        {
          return $resource('/api/ImportContactDetailsCustomeSetting',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        FilterResult: function()
        {
          return $resource('/api/FilterResult',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        // NEAREST CONTACTS

        getVoterContactList: function()
        {
            return $resource('/api/getVoterContactList/:sort',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        AddNewVoterContact: function()
        {
            return $resource('/api/AddNewVoterContact/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        deleteVoterContactDetails: function()
        {
            return $resource('/api/deleteVoterContactDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        saveVoterContact: function()
        {
          return $resource('/api/saveVoterContact',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        ImportVoterContactDetails: function()
        {
          return $resource('/api/ImportVoterContactDetails',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        ImportVoterContactDetailsCustomeSetting: function()
        {
          return $resource('/api/ImportVoterContactDetailsCustomeSetting',
          {}, { 'save': { method: 'POST',isArray:false } });
        },

        FilterNearestResult: function()
        {
          return $resource('/api/FilterNearestResult',
          {}, { 'save': { method: 'POST',isArray:false } });
        },
        
        getVoterContactListPagination: function()
        {
            return $resource('/api/getVoterContactListPagination/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        CopyContacttoNearest: function()
        {
            return $resource('/api/CopyContacttoNearest/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        CreateFamily: function()
        {
            return $resource('/api/CreateFamily/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        ShowFamilyDetails: function()
        {
            return $resource('/api/ShowFamilyDetails/:familyid',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        RemoveFromFamily: function()
        {
            return $resource('/api/RemoveFromFamily/:memberid',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        SaveListDetails: function()
        {
            return $resource('/api/SaveListDetails/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        getListRecord: function()
        {
            return $resource('/api/getListRecord/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        getListRecordDetails: function()
        {
            return $resource('/api/getListRecordDetails/:listid',
                {}, { 'query': { method: 'GET',isArray:false } });
        },


        RemoveUserFromList: function()
        {
            return $resource('/api/RemoveUserFromList/:allocationid',
                {}, { 'query': { method: 'GET',isArray:false } });
        },


        getBirthdaysList: function()
        {
            return $resource('/api/getBirthdaysList/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        getStoredFiledsValues: function()
        {
            return $resource('/api/getStoredFiledsValues/',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        DeleteSelectedContacts: function()
        {
            return $resource('/api/DeleteSelectedContacts/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        listContacts: function()
        {
            return $resource('/api/listContacts/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        saveContacts: function()
        {
            return $resource('/api/saveContacts/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        importContacts: function()
        {
            return $resource('/api/importContacts/',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

    }
  }]);