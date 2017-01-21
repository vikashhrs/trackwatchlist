/**
 * Created by vikash on 10/2/2016.
 */
var express = require('express');
var jwt = require('jwt-simple');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bcrypt = require('bcrypt-nodejs');
var validator = require('youtube-validator');
var Meow = require('./models/meow');
var User = require('./models/user');
var Movie = require('./models/movie');
var PORT = process.env.PORT || 3000;
var JWT_SECRET = "24446666688888889";
var app = express();

mongoose.connect("mongodb://localhost:27017/mittens");
//mongoose.connect("mongodb://vikashhrs:12345@ds133388.mlab.com:33388/trackwatchlist");

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/public'));

app.get('/',function (req,res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/meows',function (req,res) {
    var meows = [
        'Hello I am flipped over a cup.',
        'My owner just said hi to me.',
        'I ran around the house today and made a mess.',
        'Just climbing around.'
    ];
    Meow.find(function (err,result) {
        if(err)
            throw err;
        meows = result;
        //console.log(result);
        res.send(result);
    })
    //res.send(meows);
});
app.post('/meows',function (req,res) {
    //console.log("========================================================")
    var token = req.headers.authorization;
    //console.log(token);
    var user = jwt.decode(token,JWT_SECRET);
    //console.log(user);
    //console.log("========================================================")
    //console.log('Request to save received '+ req.body);
    var newMeow  = new Meow({
        text : req.body.text,
        user : user._id,
        email : user.email,
        name : user.name
    });
    newMeow.save(function (err) {
        if(err)
            throw err;
        res.send('received');
    })
    //res.send('Received');
});
app.put('/meows/remove',function (req,res) {
    var token = req.headers.authorization;
    //console.log(token);
    var user = jwt.decode(token,JWT_SECRET);
    //console.log(req.body);
    //console.log(req.body.meow);
    Meow.remove({_id:req.body.meow._id,user : user.email,user : user._id},function (err) {
        if(err)
            throw err;
        res.send("Data deleted");
    });
    //res.send('Saved');
});
app.post('/users',function (req,res) {
    //console.log(req.body);
    req.body.password = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(9));
    //console.log(req.body);
    var user = new User(req.body);
    /*var newUser = req.body.user
    newUser.password = bcrypt.hashSync(req.body.user.password,bcrypt.genSaltSync(9));
    var user = new User(newUser);*/
    user.save(function (err) {
        if(err){
            throw err;
        }

    })
    res.status(200);
    res.send('Saved');
});
app.put('/users/signin',function (req,res) {
    if(!req.body){
        console.log("parameters received");
    }
    console.log(req.body);
    console.log(req.body.email);
    User.findOne({ email : req.body.email},function (err,user) {
        console.log(err);
        console.log(user);
        if(err)
            throw err;
        if(user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                var token = jwt.encode(user,JWT_SECRET);
                res.status(200).send({token : token,name : user.name});
            } else {
                res.status(400).send("Incorrect password");
            }
        }
        if(!user){
            res.status(400).send("No user found");
        }
    });
    //res.status(200);
    //res.send("ok");
});
app.post('/check/users',function (req,res) {
    console.log(req.body);
    User.findOne({email : req.body.email},function (err,user) {
        if(err)
            throw err;
        if(user){
            res.send({status : "present"});
        }
        if(!user){
            res.send({status : "notpresent"});
        }
    })
    //res.send({status : "Happening"});
});

app.get('/get/movies',function (req,res) {
    var token = req.headers.authorization;
    //console.log(token);
    var user = jwt.decode(token,JWT_SECRET);
    User.find({_id : user._id},function (err,foundUser) {
        if(err)
            throw err;
        if(foundUser){
            console.log(foundUser);
            //var id = String.valueOf(user._id);
            Movie.find({userID : user._id},function (err,movies) {
                if(err)
                    throw err;
                console.log(movies);
                res.status(200).send(movies);

            })
        }

    })
})

app.post('/add/movie',function (req,res) {
    console.log(req.body.movie);
    console.log(req.headers.authorization);
    var token = req.headers.authorization;
    //console.log(token);
    var user = jwt.decode(token,JWT_SECRET);
    console.log(user);
    var movie = new Movie({
        userID : user._id,
        description : req.body.movie.description,
        title : req.body.movie.title,
        videoID : req.body.movie.videoID,
        arrayOfCheckPoints : []
    });
    movie.save(function (err) {
        if (err)
            throw err
        res.status(200).send({status : "New WatchIt created"});
    })
    //res.status(404).send({status : "working"});
})

app.get('/validate/youtube/url',function (req,res) {
    // console.log(req.body);
    // /validator.validateUrl(req.body.url,function (result,err) {
    //     if(err)
    //         res.status(400).send({status : "does not exists"});
    //     console.log(result);
    //     res.status(200).send({status : result});
    // })
    console.log(req.headers.url);
    validator.validateUrl(req.headers.videoTD,function (result,err) {
        if(err)
            res.status(400).send(err);
        else
            res.status(200).send(result);
    })
})

app.listen(PORT,function () {
   console.log("Server running on port " + PORT);
});
