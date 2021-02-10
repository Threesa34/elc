var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var contactsDetails = new Schema(
    {
        name:{ type: String},
        gender:{ type: String},
        email:{ type: String},
        mobile1:{ type: Number},
        mobile2:{ type: Number},
        createdby:{ type: Number},
        createddate:{ type: Date , default: new Date()}
    });
    

    contactsDetails.index({ name : 1}, function(err, result) {});
    contactsDetails.index({ gender : 1}, function(err, result) {});
    contactsDetails.index({ email : 1}, function(err, result) {});
    contactsDetails.index({ mobile1 : 1}, function(err, result) {});
    contactsDetails.index({ mobile2 : 1}, function(err, result) {});
    contactsDetails.index({ name : 1, gender : 1}, function(err, result) {});
    contactsDetails.index({ name : 1, gender : 1,email :1, mobile1:1, mobile2: 1}, function(err, result) {});
    
    contactsDetails.set('toObject', { getters: true, setters: true,virtuals: true });
    contactsDetails.set('toJSON', { getters: true, setters: true ,virtuals: true});
    
    mongoose.model('contacts', contactsDetails);