var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var votersDetails = new Schema(
    {
        name:{ type: String},
        gender:{ type: String},
        email:{ type: String},
        address:{ type: String},
        building:{ type: String},
        remark:{ type: String},
        note:{ type: String},
        familyid:{ type: Number},
        dob:{ type: String},
        rctno:{ type: String},
        indexno:{ type: Number},
        listno:{ type: Number},
        mobile1:{ type: Number},
        mobile2:{ type: Number},
        createdby:{ type: Number},
        createddate:{ type: Date , default: new Date()}
    });
    
    
    votersDetails.set('toObject', { getters: true, setters: true,virtuals: true });
    votersDetails.set('toJSON', { getters: true, setters: true ,virtuals: true});
    
    mongoose.model('voters', votersDetails);