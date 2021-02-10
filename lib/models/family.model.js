var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var familyDetails = new Schema(
    {
        createdby:{ type: Number},
        createddate:{ type: Date , default: new Date()}
    });
    
    
    familyDetails.set('toObject', { getters: true, setters: true,virtuals: true });
    familyDetails.set('toJSON', { getters: true, setters: true ,virtuals: true});
    
    mongoose.model('family', familyDetails);