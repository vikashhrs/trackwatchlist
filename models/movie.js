/**
 * Created by vikash on 04-Nov-16.
 */
var mongoose = require('mongoose');

var MovieSchema = mongoose.Schema({
    userID : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    videoID : {
        type : String,
        required : true
    },
    arrayOfCheckPoints : []
});
module.exports = mongoose.model('Movie',MovieSchema);