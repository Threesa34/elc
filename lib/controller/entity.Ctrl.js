var express = require('express');
var nodemailer = require('nodemailer');
var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var fs = require('fs');
var mailer = require('../config/mailer.config');
var env = require('../config/env');
var moment = require('moment');
var mongoose = require('mongoose');

const mongodb = require("mongodb").MongoClient;
const fastcsv = require("fast-csv");

require('../models/contacts.models');
require('../models/family.model');
require('../models/listnos.model');
require('../models/voters.model');
var contactsDetails = mongoose.model('contacts');
var listsDetails = mongoose.model('lists');
var familyDetails = mongoose.model('family');
var votersDetails = mongoose.model('voters');

const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, // Don't build indexes
    //reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    // reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    socketTimeoutMS: 30000,
    keepAlive: true,
    // reconnectTries: 30000,
    family: 4 // Use IPv4, skip trying IPv6
  };

  function getTotalContactsCount(id, callback)
  {
      var totalcount = 0;
    mongoose.connect(env.MONGOLAB_URI,opts).then(
        ()=>{
            contactsDetails.find({}).count().lean().exec(function (err, recordCount) {
                if(err)
                {
                    console.log(err)
                    callback(0)
                }
                else
                {
                    totalcount = totalcount + recordCount;
                    callback(totalcount); 
                }
            });
           
        });
        
  }
module.exports = {


    getContactList: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('SELECT *,(SELECT COUNT(*) FROM contacts) as totalcontacts FROM contacts ORDER BY id DESC LIMIT 50', function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({contactsList:result})
                    }
                });
                con.release();
            });
        }
    },



    getContactListPagination: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   if(req.body.skip == 1)
                   {
                    var skiplimit = '50';
                   }else
                   {
                    var skiplimit = ((req.body.skip -1) * 50)+', 50';
                   }

                   if(req.body.filter)
                   {
                        var searchFilter = ' WHERE '+req.body.filter.field+' LIKE "%'+req.body.filter.searchinput+'%"';
                   }
                   else
                   {
                    var searchFilter = '';
                   }


                con.query('SELECT * FROM contacts '+searchFilter+' ORDER BY id DESC LIMIT '+skiplimit, function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({contactsList:result})
                    }
                });
                con.release();
            });
        }
    },

    FilterResult: function(req, res)
    {
         if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('SELECT *,(SELECT COUNT(*) FROM contacts WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%") as totalcontacts FROM contacts WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%" ORDER BY id DESC LIMIT 500', function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({contactsList:result})
                    }
                });
                con.release();
            });
        } 
    },
    AddNewContact: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('INSERT INTO contacts (createdby) values ('+req.decoded.logedinuser.id+')', function(err,result){
                    if(err)
                    {
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({status:0, message:"contact added", insertedid: result.insertId})
                    }
                });
                con.release();
            });
        }
    },


    importCsvContactDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            req.body.map(function(value,index){
                connection.acquire(function(err, con){

                    if(value.Name == undefined || value.Name == '')
                    {
                        value.Name = null;
                    }
                    if(value.Gender == undefined || value.Gender == '')
                    {
                        value.Gender = null;
                    }
                    if(value.Email == undefined || value.Email == '')
                    {
                        value.Email = null;
                    }
                    if(value.Mobile_No == undefined || value.Mobile_No == '')
                    {
                        value.Mobile_No = null;
                    }
                    if(value.alt_Mobile == undefined || value.alt_Mobile == '')
                    {
                        value.alt_Mobile = null;
                    }

                    con.query('INSERT INTO `contacts`(`name`, `gender`, `email`, `mobile1`, `mobile2`, `createdby`) VALUES (?,?,?,?,?,?) ',[value.Name,value.Gender,value.Email,value.Mobile_No,value.alt_Mobile,req.decoded.logedinuser.id], function(err,result){
                        if(err)
                        {
                            console.log(err)
                                if(index == req.body.length -1)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                        }
                        else
                        {
                            if(index == req.body.length -1)
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                        }
                    });
                    con.release();
                });
            });
        }
    },


    ImportContactDetails: function(req, res)
    {
        console.log(req.body);
        console.log(req.file)
        if (req.decoded.success == true) {   
              
                
                var sql = 'INSERT INTO `contacts`(`name`, `gender`, `email`, `mobile1`, `mobile2`, `createdby`) VALUES ';
                
                req.body.map(function(value, index){
                    if(value[0] != undefined){value[0].replace(/[^a-zA-Z0-9]/g, '')}else{value[0] = null}
                    if(value[1] != undefined){value[1].replace(/[^a-zA-Z0-9]/g, '')}else{value[1] = null}
                    if(value[2] != undefined){value[2].replace(/[^a-zA-Z0-9]/g, '')}else{value[2] = null}
                    if(value[3] != undefined){value[3].replace(/[^a-zA-Z0-9]/g, '')}else{value[3] = null}
                    if(value[4] != undefined){value[4].replace(/[^a-zA-Z0-9]/g, '')}else{value[4] = null}
        
                    //var ss= '("'+value[0]+'","'+value[1]+'", "'+value[2]+'",'+value[3]+','+value[4]+','+req.decoded.logedinuser.id+');';


                    connection.acquire(function (err, con) {
                    // con.query(sql+ss,function(err,result)
                    con.query(sql+'(?,?,?,?,?,?)',[value[0],value[1],value[2],value[3],value[4],req.decoded.logedinuser.id],function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                if(index == req.body.length -1)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                
                            }
                            else
                            {
                                //console.log(index,'--------',req.body.length);
                                if(index == req.body.length -1)
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                               
                            }
                    });
                    con.release();
                });



                });


                
                //  ss = ss.substr(0, ss.length - 1);
               
                // connection.acquire(function (err, con) {
                    /* con.query(sql+ss,function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                con.release();
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                                con.release();
                            }
                    }); */
                // });
            }
    },


    ImportContactDetailsCustomeSetting: function(req, res)
    {

console.log(JSON.stringify(req.body.setting));


[{"field":"name","title":"Name","excelField":{"field":"1","title":"B"}},{"field":"gender","title":"Gender","excelField":{"field":"0","title":"A"}},{"field":"mobile1","title":"Mobile No.","excelField":{"field":"3","title":"D"}},{"field":"mobile2","title":"Alt. Mobile No.","excelField":{"field":"2","title":"C"}},{"field":"email","title":"Email","excelField":{"field":"4","title":"E"}}]

        var fieldIndex= [];
         if (req.decoded.success == true) {   
            
                var sql = 'INSERT INTO `contacts`(`name`, `gender`, `mobile1`, `mobile2`, `email`, `createdby`) VALUES ';
                var ss = '';

                req.body.setting.map(function(value,index){
                    if(value.excelField && value.excelField.field)
                    {
                        fieldIndex.push(value.excelField.field)
                    }
                    else
                    {
                        fieldIndex.push(index)
                    }
                });

                if(fieldIndex.length == req.body.setting.length)
                {
                    fieldIndex.map(function(flind){
                        req.body.excelDate.map(function(value){
                            if(value[flind] != undefined){value[flind]}else{value[flind] = ""}
                        })
                    });


                    /* fieldIndex.map(function(flind){
                        req.body.excelDate.map(function(value){
                            
                        })
                    }); */


                   

                }


                excelfield.map(function(fields){
                    req.body.map(function(value){
                        if(value[0] != undefined){value[0]}else{value[0] = ""}
                        if(value[1] != undefined){value[1]}else{value[1] = ""}
                        if(value[2] != undefined){value[2]}else{value[2] = ""}
                        if(value[3] != undefined){value[3]}else{value[3] = ""}
                        if(value[4] != undefined){value[4]}else{value[4] = ""}
            
                       
                    });
                });

                
                 ss = ss.substr(0, ss.length - 1);
               
                connection.acquire(function (err, con) {
                    con.query(sql+ss,function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                con.release();
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                                con.release();
                            }
                    });
                });
            } 
    },

    deleteContactDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('DELETE FROM `contacts` WHERE `id` = '+req.params.id, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }
    },

    DeleteSelectedContacts: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('DELETE FROM `contacts` WHERE `id` IN ('+req.body.ids+')', function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }
    },

    saveContact: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                req.body.createddate = moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");

                delete req.body.totalcontacts
                var keys = Object.keys(req.body);

                keys.map(function(value){
                    if(req.body[value] == '')
                    req.body[value] = null;
                });

                con.query('UPDATE contacts SET ? WHERE id = ?',[req.body, req.body.id], function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Contact details saved successfully"
                        });
                    }
                });
                con.release();
            });
        }
    },


// NEAREST CONTACTS

getVoterContactList: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.listnos != '')
                {
                    var listnos = ' WHERE createdby = '+req.decoded.logedinuser.id+' OR'+req.decoded.listnos;
                    var sortfied = 'ORDER BY voters.listno ASC, srno ASC ';
                }
                else
                {
                     var listnos = req.decoded.listnos;
                     var sortfied = 'ORDER BY voters.id '+req.params.sort+' ';
                }

                con.query('SELECT *,CONVERT(voters.indexno,UNSIGNED INTEGER) AS srno,(SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no, (SELECT COUNT(*)  FROM voters '+listnos+') as totalcontacts FROM voters '+listnos+' '+sortfied+' LIMIT 50', function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({voterContactsList:result})
                    }
                });
                con.release();
            });
        }
    },
   /*  FilterNearestResult: function(req, res)
    {
         if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   if(req.decoded.listnos != '')
                   {
                       var listnos = 'AND (createdby = '+req.decoded.logedinuser.id+' OR'+req.decoded.listnos+')';
                   }
                   else
                   {
                        var listnos = req.decoded.listnos
                   }


                   if(req.body.field && req.body.field == 'listno')
                {
                    var sortfied = 'ORDER BY voters.listno ASC, srno ASC ';
                }
                else
                {
                    var sortfied = 'ORDER BY voters.id ASC ';
                }
                console.log('SELECT *,CONVERT(voters.indexno,UNSIGNED INTEGER) AS srno,(SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no, (SELECT COUNT(*)  FROM voters WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%" '+listnos+') as totalcontacts FROM voters WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%" '+listnos+' '+sortfied+' LIMIT 50')

                con.query('SELECT *,CONVERT(voters.indexno,UNSIGNED INTEGER) AS srno,(SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no, (SELECT COUNT(*)  FROM voters WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%" '+listnos+') as totalcontacts FROM voters WHERE '+req.body.field+' LIKE "%'+req.body.searchinput+'%" '+listnos+' '+sortfied+' LIMIT 50', function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({voterContactsList:result})
                    }
                });
                con.release();
            });
        } 
    }, */

    FilterNearestResult: function(req, res)
    {
         if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                  
                if(req.body.filtertext.indexOf("listno") < 0)
                {
                    if(req.decoded.listnos != '')
                   {
                       var listnos = 'AND (createdby = '+req.decoded.logedinuser.id+' OR'+req.decoded.listnos+')';
                   }
                   else
                   {
                        var listnos = ''
                   }
                }
                else
                {
                    var listnos = '';
                }
   
                    var sortfied = 'ORDER BY voters.listno ASC, srno ASC ';

                con.query('SELECT *,CONVERT(voters.indexno,UNSIGNED INTEGER) AS srno,(SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no, (SELECT COUNT(*)  FROM voters WHERE '+req.body.filtertext+' '+listnos+') as totalcontacts FROM voters WHERE '+req.body.filtertext+' '+listnos+' '+sortfied+' LIMIT 50', function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({voterContactsList:result})
                    }
                });
                con.release();
            });
        } 
    },


    AddNewVoterContact: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('INSERT INTO voters (createdby) values ('+req.decoded.logedinuser.id+')', function(err,result){
                    if(err)
                    {
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({status:0, message:"contact added", insertedid: result.insertId})
                    }
                });
                con.release();
            });
        }
    },

    CopyContacttoNearest: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){

                delete req.body.id;
                delete req.body._id;
                delete req.body.createddate;
                delete req.body.totalcontacts;

                   req.body.createdby = req.decoded.logedinuser.id

                con.query('INSERT INTO voters SET ?',req.body, function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Contact copied to nearest successfully"
                        });
                    }
                });
                con.release();
            });
        }
    },



    ImportVoterContactDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
              
                
                var sql = 'INSERT INTO `voters`( `listno`,`indexno`, `rctno`, `name`,`gender`, `email`, `mobile1`, `mobile2`, `dob`, `address`,`building`,`createdby`)  VALUES ';
                
                req.body.map(function(value, index){
                    if(value[0] != undefined){value[0].replace(/[^a-zA-Z0-9]/g, '')}else{value[0] = null}
                    if(value[1] != undefined){value[1].replace(/[^a-zA-Z0-9]/g, '')}else{value[1] = ""}
                    if(value[2] != undefined){value[2].replace(/[^a-zA-Z0-9]/g, '')}else{value[2] = ""}
                    if(value[3] != undefined){value[3].replace(/[^a-zA-Z0-9]/g, '')}else{value[3] = ""}
                    if(value[4] != undefined){value[4].replace(/[^a-zA-Z0-9]/g, '')}else{value[4] = ""}
                    if(value[5] != undefined){value[5].replace(/[^a-zA-Z0-9]/g, '')}else{value[5] = ""}
                    if(value[6] != undefined){value[6].replace(/[^a-zA-Z0-9]/g, '')}else{value[6] = null}
                    if(value[7] != undefined){value[7].replace(/[^a-zA-Z0-9]/g, '')}else{value[7] = null}
                    // if(value[8] != undefined){value[8].replace(/[^a-zA-Z0-9]/g, '')}else{value[8] = ""}
                    if(value[8] != undefined){moment(value[8]).format("YYYY-MM-DD HH:mm:ss")}else{value[8] = null}
                    if(value[9] != undefined){value[9].replace(/[^a-zA-Z0-9]/g, '')}else{value[9] = ""}
                    if(value[10] != undefined){value[10].replace(/[^a-zA-Z0-9]/g, '')}else{value[10] = ""}
        
                    //var ss= '((SELECT listnos.id FROM `listnos` WHERE listnos.listno = "'+value[0]+'" LIMIT 1),"'+value[1]+'", "'+value[2]+'","'+value[3]+'","'+value[4]+'","'+value[5]+'",'+value[6]+','+value[7]+',"'+value[8]+'","'+value[9]+'","'+value[10]+'",'+req.decoded.logedinuser.id+');';

                    var listno = '(SELECT listnos.id FROM `listnos` WHERE listnos.listno = "'+value[0]+'" LIMIT 1)';

                    connection.acquire(function (err, con) {

                    con.query(sql+'('+listno+',?,?,?,?,?,?,?,?,?,?,?)',[value[1],value[2],value[3],value[4],value[5],value[6],value[7],value[8],value[9],value[10],req.decoded.logedinuser.id],function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                if(index == req.body.length -1)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                
                            }
                            else
                            {
                                if(index == req.body.length -1)
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                               
                            }
                            con.release();
                    });

                    
                    
                });
                });

               /*  res.send({
                    status: 1,
                    type: "success",
                    title: "Done!",
                    message: "Importing process will run at background, after importing record notifiation will send back to you."
                }); */
            }
    },


    ImportVoterContactDetails_old: function(req, res)
    {
        if (req.decoded.success == true) {   
                var ss = '';

                   
                var sql = 'INSERT INTO `voters`( `listno`,`indexno`, `rctno`, `name`,`gender`, `email`, `mobile1`, `mobile2`, `dob`, `address`,`createdby`)  VALUES ';
                var ss = '';
                req.body.map(function(value){
                    if(value[0] != undefined){value[0]}else{value[0] = ""}
                    if(value[1] != undefined){value[1]}else{value[1] = ""}
                    if(value[2] != undefined){value[2]}else{value[2] = ""}
                    if(value[3] != undefined){value[3]}else{value[3] = ""}
                    if(value[4] != undefined){value[4]}else{value[4] = ""}
                    if(value[5] != undefined){value[5]}else{value[5] = ""}
                    if(value[6] != undefined){value[6]}else{value[6] = ""}
                    if(value[7] != undefined){value[7]}else{value[7] = ""}
                    if(value[8] != undefined){value[8]}else{value[8] = ""}
                    if(value[9] != undefined){value[9]}else{value[9] = ""}
        
                    ss= ss+ '("'+value[0]+'","'+value[1]+'", "'+value[2]+'","'+value[3]+'","'+value[4]+'","'+value[5]+'",'+value[6]+','+value[7]+',"'+value[8]+'","'+value[9]+'",'+req.decoded.logedinuser.id+'),';
                });
                 ss = ss.substr(0, ss.length - 1);
               
                connection.acquire(function (err, con) {
                    con.query(sql+ss,function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                con.release();
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                                con.release();
                            }
                    });
                });
            }
    },


    ImportVoterContactDetailsCustomeSetting: function(req, res)
    {




            var excelfield = [];

         if (req.decoded.success == true) {   
                var ss = '';
            
                var sql = 'INSERT INTO `voters`( `listno`,`indexno`, `rctno`, `name`,`gender`, `email`, `mobile1`, `mobile2`, `dob`, `address`,`createdby`)  VALUES ';
                var ss = '';


                req.body.setting.map(function(value){
                    value.excelField.field
                })

                    req.body.map(function(value){
                        if(value[0] != undefined){value[0]}else{value[0] = ""}
                        if(value[1] != undefined){value[1]}else{value[1] = ""}
                        if(value[2] != undefined){value[2]}else{value[2] = ""}
                        if(value[3] != undefined){value[3]}else{value[3] = ""}
                        if(value[4] != undefined){value[4]}else{value[4] = ""}
            
                        ss= ss+ '("'+value[0]+'","'+value[1]+'", "'+value[2]+'",'+value[3]+','+value[4]+','+req.decoded.logedinuser.id+'),';
                    });
                

                
                 ss = ss.substr(0, ss.length - 1);
               
                connection.acquire(function (err, con) {
                    con.query(sql+ss,function(err,result)
                    {
                        if(err)
                            {
                                console.log(err)
                                res.send({
                                    status: 0,
                                    type: "error",
                                    title: "Oops!",
                                    message: "Something went worng, Please try again letter"
                                });
                                con.release();
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Record imported successfully"
                                });
                                con.release();
                            }
                    });
                });
            } 
    },

    deleteVoterContactDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('DELETE FROM `voters` WHERE `id` = '+req.params.id, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                });
                con.release();
            });
        }
    },

    saveVoterContact: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                //req.body.createddate= moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");
                delete req.body.totalcontacts;
                delete req.body.list_no;
                delete req.body.srno;
                if(req.body.dob)
                req.body.dob = moment(req.body.dob).format("YYYY-MM-DD HH:mm:ss");
                req.body.createddate = moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");

                var keys = Object.keys(req.body);

                keys.map(function(value){
                    if(req.body[value] == '')
                    req.body[value] = null;
                });

                delete req.body.bool;

                if(req.body.status == 'Active')
                {
                    req.body.status = 1;
                }
                else
                req.body.status = 0;


                con.query('UPDATE voters SET ? WHERE id = ?',[req.body, req.body.id], function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Contact details saved successfully"
                        });
                    }
                });
                con.release();
            });
        }
    },

    getVoterContactListPagination: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.body.skip == 1)
                {
                 var skiplimit = '50';
                }
                else
                {
                 var skiplimit = ((req.body.skip -1) * 50)+', 50';
                }

                if(req.body.filterText)
                {
                     var searchFilter = ' WHERE '+req.body.filterText+' ';
                }
                else
                {
                 var searchFilter = '';
                }
                if(req.body.filterText)
                {
                if(req.body.filterText.indexOf("listno") < 0)
                {
                    if(req.decoded.listnos != '')
                   {
                       var listnos = 'AND (createdby = '+req.decoded.logedinuser.id+' OR'+req.decoded.listnos+')';
                   }
                   else
                   {
                        var listnos = ''
                   }
                }
                else
                {
                    var listnos = ''
                }
                }
                else
                {
                    if(req.decoded.listnos != '')
                   {
                       var listnos = 'WHERE (createdby = '+req.decoded.logedinuser.id+' OR'+req.decoded.listnos+')';
                   }
                   else
                   {
                        var listnos = ''
                   }
                }

                               
                var sortfied = 'ORDER BY voters.listno ASC, srno ASC ';
              

             con.query('SELECT *,CONVERT(voters.indexno,UNSIGNED INTEGER) AS srno, (SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no,(SELECT COUNT(*) FROM voters '+searchFilter+' ' +listnos+') as totalcontacts FROM voters '+searchFilter+' ' +listnos+' '+sortfied+'LIMIT '+skiplimit, function(err,result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({voterContactsList:result})
                    }
                });
                con.release();
            });
        }
    },


    CreateFamily: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.body[0].familyid)
                {
                    var ss = '';
                    req.body.map(function(value){
                        ss = ss+value.id+',';
                    });
                    ss = ss.substr(0, ss.length - 1);


                    con.query('UPDATE voters SET familyid = '+req.body[0].familyid+' WHERE id  IN ('+ss+')', function(err,updateresult){
                        if(err)
                        {
                            console.log(err)
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                        }
                        else
                        {
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Family saved successfully"
                            });
                        }
                    });

                }
                else
                {
                    con.query('INSERT INTO voters_family SET ?',{createdby:req.decoded.logedinuser.id}, function(err,result){
                            if(err)
                            {
                                console.log(err)
                                res.send({status:1, message:"Something went wrong"})
                            }
                            else
                            {
                                var ss = '';
                                req.body.map(function(value){
                                    ss = ss+value.id+',';
                                });
                                ss = ss.substr(0, ss.length - 1);

                                con.query('UPDATE voters SET familyid = '+result.insertId+' WHERE id  IN ('+ss+')', function(err,updateresult){
                                    if(err)
                                    {
                                        console.log(err)
                                        res.send({
                                            status: 1,
                                            type: "error",
                                            title: "Oops!",
                                            message: "Something went wrong, Please try again."
                                        });
                                    }
                                    else
                                    {
                                        res.send({
                                            status: 0,
                                            type: "success",
                                            title: "Done!",
                                            message: "Family saved successfully"
                                        });
                                    }
                                });

                            }
                        });
                 }

            con.release();
            });
        }
    },
    ShowFamilyDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('SELECT * FROM `voters` WHERE `familyid` = '+req.params.familyid, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({status: 0,familyDetails:result});
                    }
                });
                con.release();
            });
        }
    },

    RemoveFromFamily: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('UPDATE voters SET familyid = 0 WHERE id ='+req.params.memberid, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Saved"
                        });
                    }
                });
                con.release();
            });
        }
    },
    SaveListDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   if(req.body.id)
                   {
                    con.query('UPDATE listnos set oldlistno = listno ,modifieddate = CURDATE(),listno = ? WHERE id = ?',[req.body.listno, req.body.id], function(err,result){
                        if(err)
                        {
                            console.log(err)
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                        }
                        else{


                            if(req.body.userAllocation && req.body.userAllocation.length > 0)
                            {
                                
                            var sql = '';
                            req.body.userAllocation.map(function(value){

                                if(value.id)
                                {
                                    sql = sql+ 'UPDATE `listallocation` SET `listid`= '+req.body.id+',`userid`= '+value.userid+' WHERE `id` = '+value.id+';';
                                }
                                else
                                {
                                    sql = sql+'INSERT INTO listallocation (userid, listid) VALUES ('+value.userid+','+req.body.id+');'
                                }

                            });
                        
                            con.query(sql, function(err,result){});

                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "List Details saved successfully."
                            });
                        }
                    }
                    });
                   }
                   else
                   {
                    con.query('INSERT INTO listnos (listno) VALUES (?)',[req.body.listno], function(err,result){
                        if(err)
                        {
                            console.log('-------------1',err)

                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                        }
                        else
                        {
                            if(req.body.userAllocation && req.body.userAllocation.length > 0)
                            {
                            var ss = '';
                            req.body.userAllocation.map(function(value){
                                ss = ss+'('+value.userid+','+result.insertId+'),'
                            });
                            ss = ss.substr(0, ss.length - 1);
                            con.query('INSERT INTO listallocation (userid, listid) VALUES '+ss, function(err,result){
                                if(err)
                                {
                                    console.log('-------------2',err)
                                    res.send({
                                        status: 1,
                                        type: "error",
                                        title: "Oops!",
                                        message: "Something went wrong, Please try again."
                                    });
                                }
                                else
                                {
                                    res.send({
                                        status: 0,
                                        type: "success",
                                        title: "Done!",
                                        message: "List Details saved successfully."
                                    });
                                }
                            });
                        }
                        else{
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "List Details saved successfully."
                            });
                        }
                        }
                    });
                   }
                con.release();
            });
        }
    },
    
    getListRecord:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT * FROM listnos', function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            listNosList:result
                        });
                    }
                });
            });

        }
    },

    RemoveUserFromList:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('DELETE FROM `listallocation` WHERE `id` = '+req.params.allocationid, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "User removed from list"
                        });
                    }
                });
            });

        }
    },

    
    getListRecordDetails:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query('SELECT * FROM `listnos` WHERE `id` = '+req.params.listid, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        con.query('SELECT `id` as allocatedid,(SELECT users.name FROM users WHERE users.id = listallocation.userid) as username,`userid` FROM `listallocation` WHERE `listid` = '+req.params.listid, function(err,alloctedresult){
                            if(err)
                            {
                                res.send({
                                    status: 0,
                                    listrecordDetails:result,
                                    allocatedusers:[]
                                });
                            }
                            else
                            {

                                if(alloctedresult)
                                
                                {res.send({
                                    status: 0,
                                    listrecordDetails:result,
                                    allocatedusers:alloctedresult
                                });
                                }
                                else
                                {
                                    res.send({
                                        status: 0,
                                        listrecordDetails:result,
                                        allocatedusers:[]
                                    });
                                }
                             }
                    });
                    }
                });
            });

        }
    },

    getDashboardValues:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){

                if(req.decoded.listnos != '')
                {
                    var listnos_where = ' WHERE '+req.decoded.listnos
                    var listnos_and = ' AND '+req.decoded.listnos
                }
                else
                {
                     var listnos_where = req.decoded.listnos
                     var listnos_and = req.decoded.listnos
                }

                
                

                con.query('SELECT (SELECT COUNT(*) FROM contacts) AS total_contacts, (SELECT COUNT(*) FROM voters '+listnos_where+') AS total_voters,(SELECT COUNT(*) FROM listnos) as total_lists,(SELECT COUNT(*) FROM voters WHERE DATE_FORMAT(voters.dob,"%d-%m") = DATE_FORMAT(CURDATE(),"%d-%m") '+listnos_and+') AS total_birthdays FROM users WHERE users.id = '+req.decoded.logedinuser.id, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {

                getTotalContactsCount(req.decoded.logedinuser.id,function      callFunction(contactsCount) { 
                        console.log("This is a callback function.",contactsCount)                         
                        result[0]['mdbContacts'] = contactsCount;
                        res.send({
                            status: 0,
                            dashboardValues:result
                        });
                    }
                );
                    }
                });
            });

        }
    },

    getBirthdaysList:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){

                if(req.decoded.listnos != '')
                {
                    var listnos_where = ' WHERE '+req.decoded.listnos
                    var listnos_and = ' AND '+req.decoded.listnos
                }
                else
                {
                     var listnos_where = req.decoded.listnos
                     var listnos_and = req.decoded.listnos
                }


                con.query('SELECT *,(SELECT listnos.listno FROM listnos WHERE listnos.id = voters.listno) as list_no FROM voters WHERE DATE_FORMAT(voters.dob,"%d-%m") = DATE_FORMAT(CURDATE(),"%d-%m") '+listnos_and, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            dashboardValues:result
                        });
                    }
                });
            });

        }
    },

    getStoredFiledsValues:function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){

                if(req.decoded.listnos != '')
                {
                    var listnos_where = ' WHERE '+req.decoded.listnos
                }
                else
                {
                     var listnos_where = req.decoded.listnos
                }
                listnos_where = listnos_where.replace('listno', 'id')
                
                con.query('SELECT listnos.listno, listnos.id FROM listnos '+listnos_where, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            listNos:result
                        });
                    }
                });
            });

        }
    },

    
    // MONGODB CONTACTS


    listContacts: function(req, res)
    {
        if (req.decoded.success == true) {   
            mongoose.connect(env.MONGOLAB_URI,opts).then(
            ()=>{

                var query = {};

                if(req.body.filter != undefined)
                {
                    if(req.body.filter.operator)
                    {
                        if(req.body.filter.operator == "LIKE")
                        {
                            query[req.body.filter.field] = {$regex: new RegExp(req.body.filter.searchinput.toLowerCase() + ".*", "i")}
                        }
                        else
                        {
                            query[req.body.filter.field] = req.body.filter.searchinput
                        }

                    }
                   
                }   
                contactsDetails.find(query, {}).sort({ "_id": -1 }).skip(req.body.skip * 50).limit(50).exec(function (err, result) {
                    if(err)
                    {
                        console.log(err)
                        res.send({status:1, message:"Something went wrong"});
                      
                    }
                    else
                    {
                        contactsDetails.find(query).countDocuments().exec(function (err, recordCount) {
                            if(err)
                            {
                                console.log(err)
                                res.send({contactsList:result});
                              
                            }
                            else
                            {
                                res.send({contactsList:result, totalRecord: recordCount});
                               
                            }
                        });
                    }
                });
              
            });
        }
    },
    saveContacts: function(req, res)
    {
        if (req.decoded.success == true) {   
            mongoose.connect(env.MONGOLAB_URI,opts).then(
            ()=>{
                if(req.body._id)
                {
                    contactsDetails.update({ _id: req.body._id }, req.body,{ multi: true }, function(err) {
                    if(err)
                    {
                        res.send({status:1,message:'Somthing went wrong, Please try again!'});
                      
                    }
                    else
                    {
                        res.send({status:0,message:'Record updated successfully!'});
                      
                    }
                });
                }
                else
                {

                    req.body.createdby = req.decoded.logedinuser.id;
                    var contacts = new contactsDetails(req.body);

                    contacts.save(function(err,result) {
                        if(err)
                        {
                            res.send({status:1,message:'Somthing went wrong, Please try again!'});
                          
                        }
                        else
                        {
                            res.send({status:0,message:'Record inserted successfully!'});
                          
                        }
                    });
                }
            });
            }
    },
    importDataFromCsv :  function(req, res)
    {
        console.log(req.file.path);
        let stream = fs.createReadStream(req.file.path);
        let csvData = [];
        let csvStream = fastcsv
            .parse()
            .on("data", function(data) {
                var dataObj = {
                    createdby:req.decoded.logedinuser.id,
                    name:data[0],
                    gender:data[1],
                    email:data[2],
                    mobile1:data[3],
                    mobile2:data[4] || null
                }
                csvData.push(dataObj);
        })
        .on("end", function() {
        // remove the first line: header
        csvData.shift();
        mongodb.connect(
            env.MONGOLAB_URI,opts,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err, client) => {
        if (err) throw err;

        client
          .db("ln_elc")
          .collection("contacts")
          .insertMany(csvData, (err, result) => {
            if (err) throw err;
            else{
                res.send({
                    status: 0,
                    type: "success",
                    title: "Done!",
                    message: "Record imported Successfully"
                })
            }

            console.log(`Inserted: ${result.insertedCount} rows`);
            client.close();
          });
      }
    );
  });

stream.pipe(csvStream);
    
    },
   

    deleteContactDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            mongoose.connect(env.MONGOLAB_URI,opts).then(
                ()=>{
                    contactsDetails.deleteOne({_id:req.params.id}).exec(function (err, result) {
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                      
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                      
                    }
                });
               
            });
        }
    },

    DeleteSelectedContacts: function(req, res)
    {
        if (req.decoded.success == true) {   
            mongoose.connect(env.MONGOLAB_URI,opts).then(
                ()=>{
                    var contactids = req.body.ids.split(',', 20000);
            contactsDetails.deleteMany({_id:{ $in: contactids } }).exec(function (err, result) {
                
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                      
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                      
                    }
                });
                
            });
        }
    },
 // MONGODB CONTACTS
 // MONGODB NEAREST

 listVoterContacts: function(req, res)
 {
     if (req.decoded.success == true) {   
         mongoose.connect(env.MONGOLAB_URI,opts).then(
         ()=>{

             var query = {};

             if(req.body.filter)
             {
                 if(req.body.filter.operator)
                 {
                     if(req.body.filter.operator == "LIKE")
                     {
                         query[req.body.filter.field] = {$regex: new RegExp(req.body.filter.searchinput.toLowerCase() + ".*", "i")}
                     }
                     else
                     {
                         query[req.body.filter.field] = req.body.filter.searchinput
                     }

                 }
                
             }   

             votersDetails.find(query, {}).sort({ "_id": -1 }).skip(req.body.skip * 50).limit(50).exec(function (err, result) {
                 if(err)
                 {
                     console.log(err)
                     res.send({status:1, message:"Something went wrong"});
                   
                 }
                 else
                 {
                    votersDetails.find({}).countDocuments().exec(function (err, recordCount) {
                         if(err)
                         {
                             res.send({contactsList:result});
                           
                         }
                         else
                         {
                             res.send({contactsList:result, totalRecord: recordCount});
                           
                         }
                     });
                 }
             });
           
         });
     }
 },
 saveVoterContacts: function(req, res)
 {
     if (req.decoded.success == true) {   
         mongoose.connect(env.MONGOLAB_URI,opts).then(
         ()=>{
             if(req.body._id)
             {
                votersDetails.update({ _id: req.body._id }, req.body,{ multi: true }, function(err) {
                 if(err)
                 {
                     res.send({status:1,message:'Somthing went wrong, Please try again!'});
                   
                 }
                 else
                 {
                     res.send({status:0,message:'Record updated successfully!'});
                   
                 }
             });
             }
             else
             {

                 req.body.createdby = req.decoded.logedinuser.id;
                 var voter = new votersDetails(req.body);

                 voter.save(function(err,result) {
                     if(err)
                     {
                         res.send({status:1,message:'Somthing went wrong, Please try again!'});
                       
                     }
                     else
                     {
                         res.send({status:0,message:'Record inserted successfully!'});
                       
                     }
                 });
             }
         });
         }
 },
 importVotersDataFromCsv :  function(req, res)
 {
     let stream = fs.createReadStream(req.file.path);
     let csvData = [];
     let csvStream = fastcsv
         .parse()
         .on("data", function(data) {
             var dataObj = {
                 createdby:req.decoded.logedinuser.id,
                 name:data[0],
                 gender:data[1],
                 email:data[2],
                 mobile1:data[3],
                 mobile2:data[4] || null
             }
             csvData.push(dataObj);
     })
     .on("end", function() {
     // remove the first line: header
     csvData.shift();
     mongodb.connect(
         env.MONGOLAB_URI,opts,
   { useNewUrlParser: true, useUnifiedTopology: true },
   (err, client) => {
     if (err) throw err;

     client
       .db("ln_elc")
       .collection("voters")
       .insertMany(csvData, (err, result) => {
         if (err) throw err;
         else{
             res.send({
                 status: 0,
                 type: "success",
                 title: "Done!",
                 message: "Record imported Successfully"
             })
         }

         console.log(`Inserted: ${result.insertedCount} rows`);
         client.close();
       });
   }
 );
});

stream.pipe(csvStream);
 
 },


 deleteVoterContactDetails_new: function(req, res)
 {
     if (req.decoded.success == true) {   
         mongoose.connect(env.MONGOLAB_URI,opts).then(
             ()=>{
                votersDetails.deleteOne({_id:req.params.id}).exec(function (err, result) {
                 if(err)
                 {
                     res.send({
                         status: 1,
                         type: "error",
                         title: "Oops!",
                         message: "Something went wrong, Please try again."
                     });
                   
                 }
                 else
                 {
                     res.send({
                         status: 0,
                         type: "success",
                         title: "Done!",
                         message: "Record deleted successfully."
                     });
                   
                 }
             });
            
         });
     }
 },

 DeleteSelectedVoterContacts: function(req, res)
 {
     if (req.decoded.success == true) {   
         mongoose.connect(env.MONGOLAB_URI,opts).then(
             ()=>{
                 var voterids = req.body.ids.split(',', 20000);
                 votersDetails.deleteMany({_id:{ $in: voterids } }).exec(function (err, result) {
             
                 if(err)
                 {
                     res.send({
                         status: 1,
                         type: "error",
                         title: "Oops!",
                         message: "Something went wrong, Please try again."
                     });
                   
                 }
                 else
                 {
                     res.send({
                         status: 0,
                         type: "success",
                         title: "Done!",
                         message: "Record deleted successfully."
                     });
                   
                 }
             });
             
         });
     }
 },
// MONGODB NEAREST

};