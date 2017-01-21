/**
 * Created by vikash on 10/2/2016.
 */
var mongoose = require("mongoose");

var MeowSchema = mongoose.Schema({
    text : String,
    user : String,
    email : String,
    name : String
});

module.exports = mongoose.model('Meow',MeowSchema);

