var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var listsDetails = new Schema(
    {
        listno:{type: String},
        oldlistno:{type: String},
        createdby:{ type: Number},
        createddate:{ type: Date , default: new Date()}
    });
    
    
    listsDetails.set('toObject', { getters: true, setters: true,virtuals: true });
    listsDetails.set('toJSON', { getters: true, setters: true ,virtuals: true});
    
    mongoose.model('lists', listsDetails);