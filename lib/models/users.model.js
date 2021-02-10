var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var usersDetails = new Schema(
    {
        name:{ type: String},
        email:{ type: String},
        mobile:{ type: Number},
        role:{ type: String},
        password:{ type: String},
        deviceid:{ type: String},
        lists:[],
        firstlogin:{ type: Number, default: null},
        createdby:{ type: Number},
        createddate:{ type: Date , default: new Date()}
    });
    
    
    usersDetails.set('toObject', { getters: true, setters: true,virtuals: true });
    usersDetails.set('toJSON', { getters: true, setters: true ,virtuals: true});
    
    mongoose.model('users', usersDetails);