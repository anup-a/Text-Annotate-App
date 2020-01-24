var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    expressSanitizer = require("express-sanitizer");

//APP CONFIG
mongoose.connect("mongodb+srv://aglaweanup22:0RCglRVXVmSruWmH@cluster0-pvkv9.gcp.mongodb.net/test?retryWrites=true&w=majority", {dbName: 'chat', useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //has to be after bodyparser
app.use(methodOverride("_method"));

//MONGOOSE / MODEL CONFIG

var db = "anup" //Replace anup with your name 
var chatSchema = new mongoose.Schema({
    data: String,
    media_url: String,
}, { collection : db });

var markedSchema = new mongoose.Schema({
    data: String,
    media_url: String,
    isPolitical : Boolean,
    favour:[
        String
    ],
    against:[
        String
    ],
    sentements:[
        String
    ],
    user: String,
    language: String
}, { collection : 'marked' });

var chat = mongoose.model("Chat", chatSchema);
var mark = mongoose.model("Marked", markedSchema);
var user = db
let user_count;

function getArray(params){
    if(!params){
        return
    }
    if(params.length>1){
        return params
    }
    return [params]
}

function parseText(param){
    if(!param){
        return false
    }
    return true
}
//--------RESTful ROUTES--------//

app.get("/", function(req, res) {

    mark.countDocuments({user : user}, function(err, count){
        user_count = count;
    });
    res.redirect("/chats")
});

//INDEX ROUTE
app.get("/chats", function(req, res) {

    chat.aggregate([{$limit : 50}], function(err, texts) {
        if (err) {
            console.log(err);
        } else {
            texts = texts.sort(() => .5 - Math.random()).slice(0,5);
            res.render("index", { texts: texts , user: user, user_count: user_count});
        }
    });
});

//CREATE ROUTE
app.post("/submit", function(req, res) {
    //create blog
    // req.body = req.sanitize(req.body);
    let data = req.body
    console.log(data)
    
    for(var key in data){
        let msg = data[key];
        let deleted;
        console.log(msg);
        chat.findByIdAndRemove(
            {_id : key},
            function(err, document){
                if(err){
                    return;
                } else{
                    deleted = document
                    if(!deleted){
                        return;
                    }
                    mark.create([{
                        data: deleted['data'],
                        media_url: deleted['media_url'],        
                        isPolitical : parseText(msg['political']),
                        favour : getArray(msg['favour']),
                        against : getArray(msg['against']),
                        sentements : getArray(msg['sentements']),
                        user: user,
                        language: msg['language']
                        }
                    ])
                }
            }
        )
        user_count += 1;
    }
    res.redirect("/chats")
});



app.listen("3000", function() {
    console.log("Annotate App running on server 3000");
});