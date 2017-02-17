var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/school';

/* GET users listing. */
// 

router.get('/', function(req, res, next) {
  res.send('respond with a resource');

});

// users/login
router.get('/login',function(req,res){
	console.log(req.query.email,req.query.password,req.param('email'));
	res.send('login end');
});

router.post('/login',function(req,res){
	console.log(req.body.email,req.body.password,req.param('email'));

	var email = req.body.email;
	var password = req.body.password;


	var findData = function(db,callback){
		var conn = db.collection('user');
		var data = {email:email,password:password};

		conn.find(data).toArray(function(err,results){
			if(err){
				return;
			}
			callback(results);
		})
	}



	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err);
		}else{
			findData(db,function(results){
				if(results.length>0){

					//登录成功了以后，将用户名存储到session对象里面去，其它地方就可以使用了
					req.session.email = results[0].email;

					// res.send('login success');
					res.redirect('/');
				}else{
					res.send('login fail');
				}

				db.close();
			})
		}
	})

});


router.post('/register',function(req,res){
	var email = req.param('email');
	var password = req.param('password');

	var insertData = function(db,callback){
		var conn = db.collection('user');

		var data = [{email:email,password:password}];

		conn.insert(data,function(err,results){
			if(err){
				return;
			}
			callback(results);
		});
	}


	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			return;
		}else{
			insertData(db,function(results){
				res.send('注册成功');
				db.close();
			});
		}
	});
});


router.get('/ab*cd',function(req,res){
	res.send('路由正则支持');	
});

router.get('/showfile',function(req,res){
	// res.sendFile('D:/chengdu1609/week01/express/package.json');
	// res.send(path.join(__dirname,'../public','json/package.json'));
	// res.sendFile(path.join(__dirname,'../public','json/package.json'));
	res.sendFile(path.join(__dirname,'../public','images/logo.png'));

});


module.exports = router;
