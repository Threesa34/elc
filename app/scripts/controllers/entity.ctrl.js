angular.module('MyApp')
    .controller('EntityController', ['$scope', '$rootScope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Entity', 'Authenticate', '$filter', '$sce', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, Upload, Entity, Authenticate, $filter, $sce) {


        


        // socket
        
        $scope.dateOptionsFilters = {
            changeYear: true,
            changeMonth: true,
            yearRange: '1971:-0',
        };


        $scope.model = {
            selected: {}
        };

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

        $scope.bigCurrentPage = 1;
        function paginationSetting(totalRecord)
        {
            if(totalRecord < 50)
            totalRecord = totalRecord;
            $scope.totlaCount = totalRecord;
            $scope.maxSize = 10;
            $scope.bigTotalItems = $scope.totlaCount;
           
        }


        $scope.getUserList = function()
        {
            Authenticate.getUserList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.UsersList = response.UsersList;
                });      
        };

        $scope.getContactList = function (status) {
            Entity.getContactList().query({}).$promise.then(function (response) {
                if (!response.status)
                    $scope.contactsList = response.contactsList;
                if (status) {
                    $scope.editContact($scope.contactsList[0])
                }
                if($scope.contactsList.length > 0)
                    paginationSetting($scope.contactsList[0].totalcontacts);
            });
        }

        $scope.AddNewContact = function () {
            Entity.AddNewContact().query({}).$promise.then(function (response) {
                if (response.status == 0)
                    $scope.getContactList('newEntry');
            });
        }

        // gets the template to ng-include for a table row / item
        $scope.getTemplate = function (contact) {
            if (contact.id === $scope.model.selected.id) return 'edit';
            else return 'display';
        };

        $scope.editContact = function (contact) {
            $scope.model.selected = angular.copy(contact);
        };



        $scope.saveContact = function (idx) {

            Entity.saveContact().save($scope.contactsList[idx]).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                        $scope.reset();
                        $scope.getContactList();
                    }
                })
            });

        };

        $scope.deleteContactDetails = function (id) {

            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(function (result) {
                if (result.value) {
                    Entity.deleteContactDetails().query({
                        id: id
                    }).$promise.then(function (response) {
                        Swal({
                            type: response.type,
                            title: response.title,
                            text: response.message,
                        }).then(function () {
                            $scope.getContactList();
                        })
                    });
                }
            });
        };


        $scope.reset = function () {
            $scope.isEdit = false;
            $scope.model.selected = {};
        };


        $scope.SelectedFileForUpload = null;

        $scope.UploadFile = function (files) {
            $scope.$apply(function () { //I have used $scope.$apply because I will call this function from File input type control which is not supported 2 way binding
                $scope.Message = "";
                $scope.SelectedFileForUpload = files[0];
            })
            $scope.ReadExcelData();
        }

        $scope.ReadExcelData = function () {
            $scope.showspinner = true;
            var file = $scope.SelectedFileForUpload;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //XLSX from js-xlsx library , which I will add in page view page
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    $scope.sheetName = workbook.SheetNames;
                    $scope.showspinner = false;
                    $scope.$apply();
                }
                reader.onerror = function (ex) {
                    console.log(ex);
                }

                reader.readAsBinaryString(file);
            }
        }

        $scope.CustomersFields = [{
            field: 'name',
            title: "Name",
             operator:'LIKE'
        },
        {
            field: 'gender',
            title: "Gender",
            operator:'='
        },
        {
            field: 'mobile1',
            title: "Mobile No.",
            operator:'='
        },
        {
            field: 'mobile2',
            title: "Alt. Mobile No.",
            operator:'='
        },
        {
            field: 'email',
            title: "Email",
            operator:'LIKE'
        },
    ]

        $scope.nearestContcatFields = [{
                field: 'listno',
                title: "Yadi No.",
                operator:'='
            },
            {
                field: 'indexno',
                title: "SR. No.",
                operator:'='
            },
            {
                field: 'rctno',
                title: "RCT.No.",
                operator:'LIKE'
            },
            {
                field: 'name',
                title: "Name",
                operator:'LIKE'
            },
            {
                field: 'gender',
                title: "Gender",
                operator:'='
            },
            {
                field: 'email',
                title: "Email",
                operator:'LIKE'
            },
            {
                field: 'mobile1',
                title: "Mobile No.",
                operator:'LIKE'
            },
            {
                field: 'mobile2',
                title: "Alt. Mobile No.",
                operator:'LIKE'
            },
            {
                field: 'dob',
                title: "Date of Birth",
                operator:'LIKE'
            },
            {
                field: 'address',
                title: "Address",
                operator:'LIKE'
            },
            {
                field: 'building',
                title: "Building Name",
                operator:'LIKE'
            },
        ]

        var alphabetsCars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        $scope.getdataFromSheet = function (sheetName) {
            var file = $scope.SelectedFileForUpload;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //XLSX from js-xlsx library , which I will add in page view page
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (excelData.length > 0) {
                        $scope.ExcelFields = [];
                        $scope.Fileds = Object.keys(excelData[0]);
                        $scope.Fileds.map(function (value) {
                            $scope.ExcelFields.push({
                                field: value,
                                title: alphabetsCars[value]
                            });
                        });

                        //   $scope.ImporProductsDetails(excelData);
                    } else {
                        $scope.Message = "No data found";
                    }
                }
                reader.onerror = function (ex) {
                    console.log(ex);
                }

                reader.readAsBinaryString(file);
            }
        }

        $scope.setSettingBehavior = function (behavior) {
            $scope.settingBehavior = behavior;
        }

        $scope.setColumnForField = function (fieldObj) {


            $scope.CustomersFields.map(function (custvalue) {

                var recordExist = $filter('filter')($scope.ExcelFields, custvalue.excelField)
                if (recordExist.length > 0)
                    recordExist[0].disabled = true;
            });

            
        }

        $scope.resetSelection = function () {
            angular.element("input[type='file']").val(null);
            $(".custom-file-input").siblings(".custom-file-label").removeClass("selected").html("Choose file");
        }

        $scope.startImporting = function (excelData) {
            if ($scope.settingBehavior == 'default') {
                Entity.ImportContactDetails().save(excelData).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#myModalImportContacts').modal('hide');
                            $scope.startImport  = false;
                            $scope.getContactList();
                        }
                    });
                });
            } else {
                Entity.ImportContactDetailsCustomeSetting().save({
                    excelDate: excelData,
                    setting: $scope.CustomersFields
                }).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#ModalImportProductsDetails').modal('hide');
                            $scope.getProductList();
                        }
                    });
                });
            }
        }

        $scope.ImportContactData = function () {

            $scope.startImport  = true;

            var file = $scope.SelectedFileForUpload;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //XLSX from js-xlsx library , which I will add in page view page
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    var sheetName = workbook.SheetNames[0];
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (excelData.length > 0) {
                        $scope.startImporting(excelData);
                    } else {
                        $scope.Message = "No data found";
                    }
                }
                reader.onerror = function (ex) {
                    console.log(ex);
                }

                reader.readAsBinaryString(file);
            }


        }

        $scope.FilterResult = function (filter) {
            if ((filter.field == undefined || filter.field == "") && (filter.searchinput == undefined || filter.searchinput == "")) {

            } else {
                Entity.FilterResult().save(filter).$promise.then(function (response) {
                    if (!response.status)
                        $scope.contactsList = response.contactsList;
                        if($scope.contactsList.length > 0)
                        paginationSetting($scope.contactsList[0].totalcontacts);
                });
            }
        }


        $scope.getContactListFromPagination = function(value)
        {   
            if($scope.filter)         
            {
                if (($scope.filter.field == undefined || $scope.filter.field == "") && ($scope.filter.searchinput == undefined || $scope.filter.searchinput == "")) {
                    var query = {skip:value}
                }
                else
                {
                    var query = {skip:value, filter:$scope.filter}
                }
            }
            else
            {
                var query = {skip:value}
            }


            if(value == ($scope.totlaCount/50))
            {
                query.islast = true;
            }

            Entity.getContactListPagination().save(query).$promise.then(function (response) {
                if (!response.status)
                    $scope.contactsList = response.contactsList;
            });
        }


        // NEAREST CONTACTS


        $scope.getVoterContactList = function (status,sort) {
            if(sort == undefined || sort == null || sort == '')
            {
                sort = 'ASC'
            }
            Entity.getVoterContactList().query({sort:sort}).$promise.then(function (response) {
                if (!response.status)
                    $scope.voterContactsList = response.voterContactsList;
                if (status) {
                    $scope.editContact($scope.voterContactsList[0])
                }
                $scope.isEdit = false;
                if($scope.voterContactsList.length > 0)
                paginationSetting($scope.voterContactsList[0].totalcontacts);

            });
        }


         $scope.getVoterContactListPagination = function(value)
        {            

           /*  if($scope.filter)         
            {
                if (($scope.filter.field == undefined || $scope.filter.field == "") && ($scope.filter.searchinput == undefined || $scope.filter.searchinput == "")) {
                    var query = {skip:value}
                }
                else
                {
                    var query = {skip:value, filter:$scope.filter}
                }
            } */
            if($scope.filterText && $scope.filterText != '')
            {
                var query = {skip:value, filterText:$scope.filterText}
            }
            else
            {
                var query = {skip:value}
            }


            if(value == ($scope.totlaCount/50))
            {
                query.islast = true;
            }

            Entity.getVoterContactListPagination().save(query).$promise.then(function (response) {
                if (!response.status)
                $scope.voterContactsList = response.voterContactsList;
            });            
        }

        $scope.FilterNearestResult = function (filter) {
            if ((filter.field == undefined || filter.field == "") && (filter.searchinput == undefined || filter.searchinput == "")) {

            } else {
                Entity.FilterNearestResult().save(filter).$promise.then(function (response) {
                    if (!response.status)
                        $scope.voterContactsList = response.voterContactsList;
                        if($scope.voterContactsList.length > 0)
                        paginationSetting($scope.voterContactsList[0].totalcontacts);
                });
            }
        }





        $scope.startImportingContacts = function (excelData) {
            if ($scope.settingBehavior == 'default') {
                Entity.ImportContactDetails().save(excelData).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#myModalImportContacts').modal('hide');
                            $scope.startImport  = false;
                            $scope.getContactList();
                        }
                    });
                });
            } else {
                Entity.ImportContactDetailsCustomeSetting().save({
                    excelDate: excelData,
                    setting: $scope.CustomersFields
                }).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#myModalImportContacts').modal('hide');
                            $scope.getContactList();
                        }
                    });
                });
            }
        }

        $scope.startImportingVoterContacts = function (excelData) {
            if ($scope.settingBehavior == 'default') {
                Entity.ImportVoterContactDetails().save(excelData).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#myModalImportVoterContacts').modal('hide');
                            $scope.startImport  = false;
                            $scope.getVoterContactList();
                        }
                    });
                });
            } else {
                Entity.ImportVoterContactDetailsCustomeSetting().save({
                    excelDate: excelData,
                    setting: $scope.CustomersFields
                }).$promise.then(function (response) {
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function () {
                        if (response.status == 0) {

                        } else {
                            $scope.resetSelection();
                            $('#myModalImportVoterContacts').modal('hide');
                            $scope.getVoterContactList();
                        }
                    });
                });
            }
        }

        $scope.ImportContactData = function () {

            $scope.startImport  = true;

            var file = $scope.SelectedFileForUpload;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //XLSX from js-xlsx library , which I will add in page view page
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    var sheetName = workbook.SheetNames[0];
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (excelData.length > 0) {
                        $scope.startImportingContacts(excelData);
                    } else {
                        $scope.Message = "No data found";
                    }
                }
                reader.onerror = function (ex) {
                    console.log(ex);
                }

                reader.readAsBinaryString(file);
            }


        }


        $scope.ImportVoterContactData = function () {

            $scope.startImport  = true;

            var file = $scope.SelectedFileForUpload;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    //XLSX from js-xlsx library , which I will add in page view page
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    var sheetName = workbook.SheetNames[0];
                    var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (excelData.length > 0) {
                        $scope.startImportingVoterContacts(excelData);
                    } else {
                        $scope.Message = "No data found";
                    }
                }
                reader.onerror = function (ex) {
                    console.log(ex);
                }

                reader.readAsBinaryString(file);
            }


        }





        $scope.AddNewVoterContact = function () {
            Entity.AddNewVoterContact().query({}).$promise.then(function (response) {
                if (response.status == 0)
                    $scope.getVoterContactList('newEntry','DESC');
            });
        }

        $scope.CopyContacttoNearest = function (contactData) {
            Entity.CopyContacttoNearest().save(contactData).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                        // $scope.reset();
                        // $scope.getVoterContactList();
                    }
                })
            });

        };


        $scope.saveVoterContact = function (idx) {

            Entity.saveVoterContact().save($scope.voterContactsList[idx]).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                        $scope.reset();
                        $scope.getVoterContactList('','ASC');
                    }
                })
            });

        };
        $scope.deleteVoterContactDetails = function (id) {

            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(function (result) {
                if (result.value) {
                    Entity.deleteVoterContactDetails().query({
                        id: id
                    }).$promise.then(function (response) {
                        Swal({
                            type: response.type,
                            title: response.title,
                            text: response.message,
                        }).then(function () {
                            $scope.getVoterContactList('','ASC');
                        })
                    });
                }
            });
        };
        $scope.isEdit = false;
        $scope.editVoterContact = function (contact) {
            $scope.isEdit = true;
            $scope.model.selected = angular.copy(contact);
            $scope.getListRecord();
        };

        $scope.FamilyGroup = [];
        $scope.CheckEntry = function(data)
        {
            if($scope.FamilyGroup.length <= 0)
            {
                $scope.FamilyGroup.push(data)
            }
            else
            {
                var recordExist = $scope.FamilyGroup.filter(function(value){
                    return value.id == data.id
                });

                if(recordExist.length > 0)
                {
                    $scope.FamilyGroup.splice( $scope.FamilyGroup.indexOf(recordExist[0]), 1);
                }
                else
                {
                    $scope.FamilyGroup.push(data)
                }
            }
        }

        $scope.ConfirmToFamily = function()
        {
            if($scope.ConfirmFamily && $scope.ConfirmFamily.length > 0)
            {
                $scope.FamilyGroup.map(function(value){
                    $scope.ConfirmFamily.push(value);
                });
            }
            else
            $scope.ConfirmFamily = angular.copy($scope.FamilyGroup);
        }

        $scope.RemoveFromFamily = function(familyrcd)
        {
            if(familyrcd.id)
            {
                Entity.RemoveFromFamily().query({memberid:familyrcd.id}).$promise.then(function (response) {
                    if (response.status == 0)
                        {
                            $scope.ConfirmFamily.splice( $scope.ConfirmFamily.indexOf(familyrcd), 1);
                        }
                }); 
            }
            else
            $scope.ConfirmFamily.splice( $scope.ConfirmFamily.indexOf(familyrcd), 1);
        }

        $scope.CreateFamily = function()
        {
            Entity.CreateFamily().save($scope.ConfirmFamily).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                        $scope.ConfirmFamily = [];
                        $scope.FamilyGroup = [];
                        $('#myModalCreateFamily').modal('hide');
                        $scope.getVoterContactList('','ASC');
                    }
                })
            });
        }

        $scope.ShowFamilyDetails = function(familyid)
        {
            if(familyid && familyid > 0)
            {
                Entity.ShowFamilyDetails().query({familyid:familyid}).$promise.then(function (response) {
                    if (response.status == 0)
                        {
                            $scope.ConfirmFamily = response.familyDetails;
                            $('#myModalCreateFamily').modal('show');
                        }
                }); 
            }
            else
            {
                Swal({
                    type: 'error',
                    title: '',
                    text: 'No family members available',
                }).then(function () {
                });
            }
        }

        $scope.allocateUserForList = function(userdetails)
        {
            if($scope.ListusersAllocation && $scope.ListusersAllocation.length > 0)
            $scope.ListusersAllocation.push({name:userdetails.name,userid:userdetails.id})
                else
                {
                    $scope.ListusersAllocation = [];
                    $scope.ListusersAllocation.push({name:userdetails.name,userid:userdetails.id})
                }

                $scope.selecteduser = undefined;
        }


        $scope.getListRecord = function()
        {
            Entity.getListRecord().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.listNosList = response.listNosList;
                });      
        };

        $scope.SaveListDetails = function()
        {
            $scope.ListDetails[0].userAllocation = $scope.ListusersAllocation;

            Entity.SaveListDetails().save($scope.ListDetails[0]).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                        $scope.getListRecord();
                    }
                })
            });    
        }

/*         $scope.getListDetails = function(data)
        {
            $scope.ListDetails = [];
            $scope.ListDetails[0] = angular.copy(data)
        } */
       
        $scope.getListRecordDetails = function(listid)
        {
            Entity.getListRecordDetails().query({listid:listid}).$promise.then(function (response) {
                if(response.status == 0)
                   {
                     $scope.ListDetails = response.listrecordDetails;
                     $scope.allocatedusers = response.allocatedusers;
                     $scope.ListusersAllocation = [];
                     $scope.allocatedusers.map(function(value){
                        $scope.ListusersAllocation.push({name:value.username,userid:value.userid,id:value.allocatedid})
                     });
                    
                   }
           });      
            
        }


        $scope.RemoveUserFromList = function(allocationid,listid)
        {
            Entity.RemoveUserFromList().query({allocationid:allocationid}).$promise.then(function (response) {
                $scope.getListRecordDetails(listid);
           });      
            
        }


        $scope.getBirthdaysList = function(listid)
        {
            Entity.getBirthdaysList().query().$promise.then(function (response) {
                if(response.status == 0)
                   {
                     $scope.birthdaysList = response.dashboardValues;
                   }
           });      
            
        }
       
        $scope.excel = true;
        $scope.SwitchTab = function(tab,disabletab)
        {
            eval('$scope.'+tab+' = true');
            eval('$scope.'+disabletab+' = false');
        }

        $scope.DownloadSampleCSV = function(){
            var a = document.createElement("a");
            var json_pre = '[{"Name":"","Gender":"","Email":"","Mobile_No":"","alt_Mobile":""}]'
            
            var csv = Papa.unparse(json_pre);
       
            if (window.navigator.msSaveOrOpenBlob) {
              var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
                type: "text/csv;charset=utf-8;"
              });
              navigator.msSaveBlob(blob, 'sample.csv');
            } else {
       
              a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
              a.target = '_blank';
              a.download = 'Contacts.csv';
              document.body.appendChild(a);
              a.click();
            }
          }

          $scope.ImportCsvContactData = function () {
            $scope.startImport  = true;

            var file = document.getElementById("bulkDirectFile").files[0];
            if (file) {
                
                Papa.parse(file, {
                    download: true,
                    header: true,
                    skipEmptyLines: true,
                    error: function(err, file, inputElem, reason) { },
                    complete: function(results) {
                       
                        Entity.importCsvContactDetails().save(results.data).$promise.then(function (response) {
                            Swal({
                                type: response.type,
                                title: response.title,
                                text: response.message,
                            }).then(function () {
                                if (response.status == 0) {
                                    $scope.getListRecord();
                                }
                            })
                        });    

                         
                    }
                  });   
            }


        }

        $scope.FiltersObj = [{}];
        $scope.Conditions = ['AND', 'OR'];

        $scope.getStoredFiledsValues = function(fieldname)
        {
            if(fieldname == 'listno')
            {
                Entity.getStoredFiledsValues().query({}).$promise.then(function (response) {
                        if (response.status == 0) {
                            $scope.ListNumbers = response.listNos;
                        }
                });    
            }
        }

        $scope.ApplyFilterOnRecpord = function()
        {
            $scope.filterText = '';
    if($scope.FiltersObj.length > 0)            
    {
        var filterInputs = $scope.FiltersObj.filter(function(value){
            return (!value.field && !value.searchinput)
        });
        if(filterInputs.length > 0)
        {
            Swal({
                type: 'error',
                title: 'Blank fileds',
                text: 'Please fill the blank fields ro remove from filter if not required.',
            }).then(function () {
            })
        }
        else
        {
            


            for(var i = 0 ; i < $scope.FiltersObj.length ; i++)
            {
                if($scope.FiltersObj[i].field == 'listno')
                {
                    if(!$scope.FiltersObj[i].condition && $scope.FiltersObj[i].condition == undefined)
                    {
                        if(i > 0)
                            $scope.FiltersObj[i].condition = 'AND';
                            else
                            $scope.FiltersObj[i].condition = '';
                    }

                    var filterOperator = $scope.nearestContcatFields.filter(function(value){
                        return value.field == $scope.FiltersObj[i].field;
                    });
                    if(filterOperator.length > 0)
                    {
                        var operator = filterOperator[0].operator;
                    }
                    else
                    {
                        var operator = '='
                    }

                     $scope.filterText =  $scope.filterText+' '+$scope.FiltersObj[i].condition+' '+$scope.FiltersObj[i].field+' '+operator+' '+$scope.FiltersObj[i].searchinput+'';
                }
                else
                {
                    if(!$scope.FiltersObj[i].condition && $scope.FiltersObj[i].condition == undefined)
                    {
                            if(i > 0)
                            $scope.FiltersObj[i].condition = 'AND';
                            else
                            $scope.FiltersObj[i].condition = '';
                    }

                    var filterOperator = $scope.nearestContcatFields.filter(function(value){
                        return value.field == $scope.FiltersObj[i].field;
                    });
                    if(filterOperator.length > 0)
                    {
                        var operator = filterOperator[0].operator;
                    }
                    else
                    {
                        var operator = '='
                    }

                       if(operator == '=') 
                       {
                        $scope.filterText =  $scope.filterText+' '+$scope.FiltersObj[i].condition+' '+$scope.FiltersObj[i].field+' '+operator+' "'+$scope.FiltersObj[i].searchinput+'"';
                       }
                       else
                     $scope.filterText =  $scope.filterText+' '+$scope.FiltersObj[i].condition+' '+$scope.FiltersObj[i].field+' LIKE "%'+$scope.FiltersObj[i].searchinput+'%"';
                }
            }       
            Entity.FilterNearestResult().save({filtertext: $scope.filterText}).$promise.then(function (response) {
                if (!response.status)
                    $scope.voterContactsList = response.voterContactsList;
                    if($scope.voterContactsList.length > 0)
                    paginationSetting($scope.voterContactsList[0].totalcontacts);
                    else
                    {
                        paginationSetting(0);
                    }
            });
            
        }
    }
        }

        $scope.checkFilterCount = function()
        {
            if($scope.FiltersObj.length > 0)
            {
                if(!$scope.FiltersObj[0].field && !$scope.FiltersObj[0].searchinput)
                {
                    return false;
                }
                else
                return true;
            }
        }

        $scope.spliceFilter =function(index)
        {
            $scope.FiltersObj.splice(index, 1);
            $scope.filterText = '';
        }

        $scope.selectedContacts = [];

        $scope.selectDeselectItem = function(data)
        {
            if($scope.selectedContacts.length <= 0)
            {
                $scope.selectedContacts.push(data)
            }
            else
            {
                var recordExist = $scope.selectedContacts.filter(function(value){
                    return value.id == data.id
                });

                if(recordExist.length > 0)
                {
                    $scope.selectedContacts.splice( $scope.selectedContacts.indexOf(recordExist[0]), 1);
                }
                else
                {
                    $scope.selectedContacts.push(data)
                }
            }
        }

        $scope.DeleteSelectedContacts = function()
        {
            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(function (result) {
                if (result.value) {

                        var ss = '';
                    $scope.selectedContacts.map(function(value){
                        ss = ss+value.id+',';
                    });
                    ss = ss.substr(0, ss.length - 1);

                    Entity.DeleteSelectedContacts().save({
                        ids: ss
                    }).$promise.then(function (response) {
                        Swal({
                            type: response.type,
                            title: response.title,
                            text: response.message,
                        }).then(function () {
                            $scope.selectedContacts = [];
                            $scope.getContactList();
                        })
                    });
                }
            });  
        }

        $scope.CheckRowExist = function(data)
        {
            var existContactinList =  $scope.selectedContacts.filter(function(value){
                return value.id == data.id;
            });
            if(existContactinList.length > 0)
            {
                return true;
            }
            return false;

        }

        $('[data-toggle="popover"]').popover();   


        $scope.listContacts = function (status,skip) {

            if(skip > 0)
            {
                var skiprcd = skip - 1;
            }
            else
            {
                var skiprcd = 0
            }
            var query = {skip:skiprcd};

            if ($scope.filter && ($scope.filter.field != undefined || $scope.filter.field != "") && ($scope.filter.searchinput != undefined || $scope.filter.searchinput != ""))
            {

                 var filterObj = $filter('filter')($scope.CustomersFields,  $scope.filter.field)

                /* var filterObj = $scope.CustomersFields.filter(function(val){
                        return val.field == $scope.filter.field;
                }); */
                if(filterObj.length > 0)
                {
                    $scope.filter.operator = filterObj[0].operator;
                }
                query['filter'] = $scope.filter;
            }
            Entity.listContacts().save(query).$promise.then(function (response) {
                if (!response.status)
                    $scope.contactsList = response.contactsList;
                if (status) {
                    $scope.editContact($scope.contactsList[0])
                }
                if($scope.contactsList.length > 0)
                    paginationSetting(response.totalRecord);
            });
        }

        $scope.newContactAdd = function(xdata)
        {
            
            if(xdata)
            {
             var contactsDetails = xdata;
            }
            else
            {
                var contactsDetails = {};
            }
            
            Entity.saveContacts().save(contactsDetails).$promise.then(function (response) {
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function () {
                    if (response.status == 0) {
                    }
                })
                $scope.reset();
                if(contactsDetails == {})
                $scope.listContacts('true');
            });
            
        }

        $scope.ImportContactsDetails = function()
        {
            $scope.startImport  = true;

            var file = document.getElementById("bulkDirectFile").files[0];
            if (file) {
                
                Papa.parse(file, {
                    download: true,
                    header: true,
                    skipEmptyLines: true,
                    error: function(err, file, inputElem, reason) { },
                    complete: function(results) {
                       
                        Entity.importContacts().save(results.data).$promise.then(function (response) {
                            Swal({
                                type: response.type,
                                title: response.title,
                                text: response.message,
                            }).then(function () {
                                if (response.status == 0) {
                                    $('#myModalImportContacts').modal('hide');
                                    $scope.startImport  = false;
                                    $scope.listContacts();
                                }
                            })
                        });    

                         
                    }
                  });   
            }
        }

        $scope.importDataFromCsv = function()
        {
            $scope.progressPercentage = 0;
            if ($scope.import_data.file.$valid && $scope.dataFile) {
				var passeddata = {
				  file: $scope.dataFile,
				}
			  } else {
				Swal({
                    type: 'error',
                    title: 'Error',
                    text: 'Invalid file format or file not selected.',
                  }).then(function()  {
                    location.reload();
                  })
			  }
			  Upload.upload({
				url: '/api/importDataFromCsv',
				data: passeddata
			  }).then(function (resp) {
                $scope.progressPercentage  = 100;
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (resp) {
                $scope.progressPercentage  = 100;
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (evt) {

                
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                ;
				
				// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			  });
        }


    }]);