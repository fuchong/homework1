
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  ,fs = require ('fs')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app). listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function Serialize(obj){

    switch(obj.constructor){

        case Object:

            var str = "{";

            for(var o in obj){

                str += o + ":" + Serialize(obj[o]) +",";

            }

            if(str.substr(str.length-1) == ",")

                str = str.substr(0,str.length -1);

            return str + "}";

            break;

        case Array:

            var str = "[";

            for(var o in obj){

                str += Serialize(obj[o]) +",";

            }

            if(str.substr(str.length-1) == ",")

                str = str.substr(0,str.length -1);

            return str + "]";

            break;

        case Boolean:

            return "\"" + obj.toString() + "\"";

            break;

        case Date:

            return "\"" + obj.toString() + "\"";

            break;

        case Function:

            break;

        case Number:

            return "\"" + obj.toString() + "\"";

            break;

        case String:

            return "\"" + obj.toString() + "\"";

            break;

    }

}

var Db = require('mongodb').Db;
var ObjectID = require("mongodb").ObjectID;

var Server = require('mongodb').Server;
//TODO 储存后并查询出来。
app.post('/input', function (req, res) {
    console.log("post input");
    var user={};
    user.name=req.body.userName;
    user.miaohao=req.body.miaohao ;
    user.shihao=req.body.shihao ;
    user.nianhao=req.body.nianhao  ;

    if(req.files.image){
        console.log("post saveImage！");
        console.log(req.files);
        var tmp_path = req.files.image.path;
         var target_path = './public/images/' + req.files.image.name;
        fs.rename(tmp_path, target_path, function (err) {
        if (err) throw err;
        fs.unlink(tmp_path, function () {
            if (err) throw err;
            });
         });
        user.Image=target_path;
    }


    var db=new Db('test',new Server('localhost',27017,{auto_reconnect:true}, {}));
    db.open(function(){
        console.log('db opened');
        db.collection('nianhaoList',function(err,collection){
            if (err) callback(err);
            collection.insert(user,{safe:true},function(err,docs){
                console.log(docs[0]._id);
                console.log("we will go to showUsers!!");
                res.redirect('list?userid='+docs[0]._id+"&ImageName="+ req.files.image.name);
               // res.redirect('showUsers?user=' + Serialize(user));

            });
        });
    });
//    res.end();
});

/*app.get('/showUsers',function(req,res){
    var users=[];
    var user={};
    //var jilu=[];
   var jsonuser= req.param['user'];
    user.name=jsonuser.
    user.miaohao=req.body.miaohao ;
    user.shihao=req.body.shihao ;
    user.nianhao=req.body.nianhao  ;
    console.log("get showUsers");

    //console.log(jilu );
    console.log("show xml!");
    res.writeHead(200, {"Content-Type":"text/plain"});
   // res.write(jilu.toXml );
    res.write("Hello World");
    res.write("姓名："+user.name +" 庙号："+user.miaohao+" 谥号："+user.shihao+" 年号："+user.nianhao);
    res.end();
});
*/
var userid;
app.get('/list',function(req,res){
var ary=[];
   // userid= req.param['userid'];
    var ImageName=req.query.ImageName;
    userid=req.query.userid;
    console.log("userid = "+userid);
    var db=new Db('test',new Server('localhost',27017,{auto_reconnect:true}, {}));
    db.open(function(){
        db.collection('nianhaoList',function(err,collection){
            if (err) callback(err);
           /* collection.find({}).toArray(function(err,docs){
                if (err) callback(err);
                console.log("show db collections!!");
                console.log(docs);
            });*/
            var objjson={};

         //      dbstr="{";
           // dbstr +="\"" + "_id"+"\""+":"+"\""+userid+"\""+"}";
            var id= new ObjectID(userid);
            objjson._id=id;
            collection.find(objjson).toArray (function(err,userdocs){
                if (err) callback(err);
                console.log("we find it from db!!")
               // console.log(userdocs);
                ary=userdocs;
                console.log(ary);

                res.writeHead(200, {"Content-Type":"text/html; charset=utf-8"});
              //  res.write("<html><head>");
             //   res.write("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /> ");
             //   res.write("</head><body>");
                res.write("姓名：");
                console.log(ary[0].name );
                res.write(ary[0].name);
                res.write("<br/>");
                res.write("庙号：");
                console.log(ary[0].mianhao);
                res.write(ary[0].miaohao);
                res.write("<br/>");
                res.write("谥号：");
                console.log(ary[0].shihao);
                res.write(ary[0].shihao);
                res.write("<br/>");
                res.write("年号：");
                console.log(ary[0].nianhao);
                res.write(ary[0].nianhao);
               // res.write("</body></html>");
                if(ImageName){
                        // var filePath = './public/images/' +ImageName;
                         //var filePath ="C:\\Users\\chongchong\\WebstormProject\\homework1\\public\\images\\" +ImageName;
                         var filePath="/Images/"+ImageName ;
                         console.log(filePath);
                         console.log(ary[0].image);
                         res.write("<br/>");
                         var htmlstr="<image src=\""+filePath+"\" />"
                         console.log(htmlstr);
                         res.write(htmlstr);
                        // fs.readFile(filePath, "binary", function (error, file) {
                        //     res.write(file, "binary");
                        // });
}
                res.end();

            })
        });
    });

});

// TODO 下载文件
app.post('/saveImage', function (req, res) {
   console.log("post saveImage！");
    console.log(req.files);
    var tmp_path = req.files.image.path;

    var target_path = './public/images/' + req.files.image.name;
    fs.rename(tmp_path, target_path, function (err) {
        if (err) throw err;
        fs.unlink(tmp_path, function () {
            if (err) throw err;
        });
    });
    res.redirect('showImage?ImageName=' + req.files.image.name);
});

app.get('/showImage', function (req, res) {
    console.log("get showImage!");
    var filePath = './public/images/' + req.query.ImageName;
    console.log(filePath);

    fs.readFile(filePath, "binary", function (error, file) {
        res.writeHead(200, {"Content-Type":"image/png"});
        res.write(file, "binary");
        res.end();
    });
});