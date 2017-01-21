/**
 * Created by vikash on 10/2/2016.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var UserSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    name : String
});
module.exports = mongoose.model('User',UserSchema);