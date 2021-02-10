var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
const nodemailer = require("nodemailer");
var mailer = require('../config/mailer.config');
var env = require('../config/env');
var moment = require('moment');

   function sendMail(mailbody)
   {
        const mailOptions = {
            from: cryptconf.decrypt(env.sendermail), // sender address
            to: mailbody.reciver, // list of receivers
            subject: mailbody.subject, // Subject line
            html: mailbody.content // plain text body
        };


        mailer.transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
   }


function generaterandomPassword()
{
                var passwordtxt = "";
                        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+new Date();
                        for (var i = 0; i < 6; i++) {
                            passwordtxt += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        if(passwordtxt.length == 6)
                        {
                            //passwordtxt
                            return cryptconf.encrypt('321');
                        }
}


module.exports = {
    CustomerTypes: function(req, res)
    {
        res.send(['Type 1', 'Type 2']);
    },

    getCustomerList: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
                {
                    var sql = 'select * from customers WHERE status = 0 ORDER BY name ASC';
                }
                else{
                    var sql = 'select * from customers WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY name ASC';
                }
                con.query(sql, function(err, result)
                {
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({customerList:result});
                    }
                    con.release();
                });
            });
        }
    },

    deleteCustomerDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                    con.query('UPDATE customers SET status = 1 WHERE id =?',[req.params.id], function(err,result){
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

    VerifyCustomerEmail: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                    con.query('SELECT COUNT(*) as emailexist FROM customers WHERE email =?',[req.body.email], function(err,result){
                        if(err)
                        {
                            res.send({status:1, message:"Something went wrong"})
                        }
                        else
                        {
                            res.send({result})
                        }
                    });
                    con.release();
            });
        }
    },

    VerifyCustomerMobile: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('SELECT COUNT(*) as mobileexist FROM customers WHERE mobile =?',[req.body.mobile], function(err,result){
                    if(err)
                    {
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({result})
                    }
                });
                con.release();
            });
        }
    },

    SaveCustomerDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.body.id)
                {

                    req.body.createddate = moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");

                    var sql = 'UPDATE customers SET ? WHERE id = ?';
                    var parametres = [req.body, req.body.id];
                    var message = 'Record updated successfully.';
                    var sql2 = 'UPDATE `users` SET `name`=?,`email`=?,`mobile`=? WHERE  `customerid`= ? ORDER BY id ASC LIMIT 1';
                    var type = 'olduser'
                }
                else
                {
                    var sql = 'INSERT INTO customers SET ?';
                    req.body.createdby = req.decoded.logedinuser.id
                    req.body.companyid = req.decoded.logedinuser.companyid
                    var parametres = req.body;
                    var message = 'Record inserted successfully.';
                    var password = generaterandomPassword();
                    var sql2 = 'INSERT INTO `users`(`name`, `email`, `mobile`, `role`, `customerid`, `password`, `createdby`, `companyid`) VALUES (?,?,?,"customer_admin",?,"'+password+'",'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+')';
                    var type = 'newuser'
                }
                
                con.query(sql, parametres, function(err, result)
                {
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
                        if(req.body.id)
                        {
                            var custid = req.body.id;
                        }
                        else
                        {
                            var custid = result.insertId;
                        }
                        con.query(sql2, [req.body.owner,req.body.email,req.body.mobile,custid], function(err, result){
                            if(err)
                            {

                            }
                            else
                            {
                               if(type == 'newuser')
                               {
                                   var mailbody = {
                                    reciver:req.body.email,
                                    subject:"One Time Password",
                                    content: 'Dear ' + req.body.owner + '<br><br><br><h1 style="font-weight:bold;text-align:center;">' + cryptconf.decrypt(password) + '</h1> <br> <p>enter this as a  password for the app.<br><br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (L.N. software Pvt. Ltd.)</div></p>' // plain text body
                                   }
                                   sendMail(mailbody)
                               }
                            }
                        });
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: message
                        });
                    }
                    con.release();
                });    
            });
        }
    },

    //users details

    getUserList: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
                {
                    var sql = 'select * from users WHERE status = 0 ORDER BY name ASC';
                }
                else if(req.decoded.logedinuser.role == 'Admin'){
                    var sql = 'select * from users WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY name ASC';
                }
                else{
                    var sql = 'select * from users WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND customerid = '+req.decoded.logedinuser.customerid+' ORDER BY name ASC';
                }
                con.query(sql, function(err, result)
                {
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({UsersList:result});
                    }
                    con.release();
                });
            });
        }
    },

    deleteUserDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                    con.query('UPDATE users SET status = 1 WHERE id =?',[req.params.id], function(err,result){
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

    VerifyUserEmail: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                    con.query('SELECT COUNT(*) as emailexist FROM users WHERE email =?',[req.body.email], function(err,result){
                        if(err)
                        {
                            res.send({status:1, message:"Something went wrong"})
                        }
                        else
                        {
                            res.send({result})
                        }
                    });
                    con.release();
            });
        }
    },

    VerifyUserMobile: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   
                con.query('SELECT COUNT(*) as mobileexist FROM users WHERE mobile =?',[req.body.mobile], function(err,result){
                    if(err)
                    {
                        res.send({status:1, message:"Something went wrong"})
                    }
                    else
                    {
                        res.send({result})
                    }
                });
                con.release();
            });
        }
    },

    SaveUserDetails: function(req, res)
    {
        if (req.decoded.success == true) {   
            connection.acquire(function(err, con){
                   if(req.body.id)
                   {
                    req.body.createddate = moment(req.body.createddate).format("YYYY-MM-DD HH:mm:ss");
                        var sql = 'UPDATE `users` SET ? WHERE id = ?';
                        var parameters = [req.body, req.body.id];
                        var message = 'Record updated successfully.';
                   }
                   else
                   {
                    var password = generaterandomPassword();
                    req.body.password = cryptconf.decrypt(password)
                       var sql = 'INSERT INTO `users` SET ?'
                       var parameters = req.body;
                       var message = 'Record inserted successfully.';
                   }

                con.query(sql,parameters, function(err,result){
                    if(err)
                    {
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {


                        if(message == 'Record inserted successfully.')
                               {
                                   var mailbody = {
                                    reciver:req.body.email,
                                    subject:"One Time Password",
                                    content: 'Dear ' + req.body.owner + '<br><br><br><h1 style="font-weight:bold;text-align:center;">' + cryptconf.decrypt(password) + '</h1> <br> <p>enter this as a  password for the app.<br><br><br><br> <div style="float:left;text-align:left;">Thanks, <br> Admin <br> (L.N. software Pvt. Ltd.)</div></p>' // plain text body
                                   }
                                   sendMail(mailbody)
                                }

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: message
                        });
                    }
                });
                con.release();
            });
        }
    },

}