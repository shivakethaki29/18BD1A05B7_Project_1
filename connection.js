const express= require('express');
const app=express();
const MongoClient=require('mongodb').MongoClient;

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//connectin server file for AWT
let server = require('./server');
//let config = require('./config');
let middleware = require('./middleware');
//const response = require('./express');

//Database connection
const url='mongodb://127.0.0.1:27017';
const dbName='HospitalEquipment';
let db
MongoClient.connect(url,{useUnifiedTopology:true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
    
});

//Fetching Hospital Details
app.get('/hospitaldetails',middleware.checkToken, function (req,res){
    console.log("Fetching data from Hospital collection");
    var data=db.collection('Hospital').find().toArray()
        .then(result => res.json(result));
    console.log(data);
});

//Fetching Ventilators Details
app.get('/ventilatordetails',middleware.checkToken, function (req,res){
    console.log("Fetching data from Ventilators collection");
    var data=db.collection('Ventilators').find().toArray()
        .then(result => res.json(result));
    console.log(data);
});

//Search Ventilators by status
app.post('/searchventbystatus',middleware.checkToken, function (req,res){
    var status=req.body.status;
    console.log("searching ventilators by status");
    console.log("status : "+status);
    var ventilatordetails=db.collection('Ventilators').find({"status":status}).toArray()
        .then(result => res.json(result));
});

//Searching ventilators by hospital name
app.post('/searchventbyname',middleware.checkToken, function (req,res){
    console.log("searching ventilators by Hospital");
    var name=req.query.name;
    console.log("name : "+name);
    var ventilators=db.collection('Ventilators').find({"name":new RegExp(name,'i')}).toArray()
        .then(result => res.json(result));
});

//Search hospital by name
app.post('/searchHospital',middleware.checkToken, function (req,res){
    console.log("searching by Hospital");
    var name=req.query.name;
    console.log("name : "+name);
    var hospitaldetails=db.collection('Hospital')
        .find({"name":new RegExp(name,'i')}).toArray()
        .then(result => res.json(result));
});

//Update ventilator details
app.put('/updateventilator',middleware.checkToken, function (req,res){
    console.log("Updating ventilator details");
    var ventid={ventilatorId: req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set: {status: req.body.status}};
    console.log("name : "+newvalues);
    var hospitaldetails=db.collection('Ventilators')
        .updateOne(ventid,newvalues,function(err,result){
            res.json("1 Document Uploaded");
            if(err) throw err;
        });
});

//Add Ventilator
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item=
    {
        hId:hId,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('Ventilators')
        .insertOne(item,function(err,result){
            res.json("Item Uploaded");
        });
});

//Delete ventilator by vent id
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);
    var myquery1={ventilatorId:myquery};
    db.collection('Ventilators')
        .deleteOne(myquery1,function(err,obj){
            if(err) throw err;
            res.json("1 document deleted");
        });
});
app.listen(3000);
