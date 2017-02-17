var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/school';

// 图处上传引用包
var multiparty = require('multiparty');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

    console.log(req.session.email);

    var findData = function(db,callback){
        var conn = db.collection('movie');
        var data = {};
        var fileds = {title:1};

        conn.find(data,fileds).toArray(function(err,results){
            if(err){
                return;
            }
            callback(results);
        })
    }

    MongoClient.connect(DB_CONN_STR,function(err,db){
        if(err){
            return;
        }else{
            findData(db,function(results){
                console.log(results);
                req.session.movieTitle = results;
                db.close();
                res.render('index', { title: 'Express',htmlView:'<b>htmlView blod</b>',email:req.session.email,movieTitle:req.session.movieTitle});
            })
        }
    });

});


router.get('/login',function(req,res){
	// res.send('login page');
	res.render('login',{});
});

router.get('/register',function(req,res){
	// res.send('register page');
	res.render('register',{});
});

router.get('/logout',function(req,res){
	// 方法一
	// req.session.email = undefined;
	// 方法二
	req.session.destroy(function(err){
		res.redirect('/');
	})
	

});

router.get('/comment',function(req,res){
	res.render('comment',{});
});


router.post('/uploadImg', function(req, res) {
    var form = new multiparty.Form();
    //设置编码
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = './uploadtemp';
    //设置文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;

    form.parse(req,function(err,fields,files){
        var uploadurl = './images/upload/';
        file = files['filedata'];
        originalFilename = file[0].originalFilename; // 原始文件名
        tmpPath = file[0].path;

        var timestamp = new Date().getTime();
        uploadurl += timestamp + originalFilename;
        newPath = './public/' + uploadurl;

        var fileReadStream = fs.createReadStream(tmpPath);
        var fileWriteStream = fs.createWriteStream(newPath);
        fileReadStream.pipe(fileWriteStream); //管道流
        fileWriteStream.on('close',function(){
            fs.unlinkSync(tmpPath);
            res.send('{"err":"","msg":"'+uploadurl+'"}');
        })
    });
});

module.exports = router;


// express 解析url 
// ---> 到app.js里找模块 
// ---> 指定的模块有没有对应到相应的路由 
// ---> 寻找支持的js模板引擎 
// ---> 对应的路由匹配对应的ejs模板引擎进行渲染 
// --->将指定的对应渲染到相应的模板引擎页面中

// http://localhost:3000/login
// http://localhost:3000/register
