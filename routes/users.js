var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/moive';

/* GET users listing. */


// users/login

router.get('/logout',function(req,res){
	// 方法一
	// req.session.username = undefined;
	// 方法二
	req.session.destroy(function(err){
		res.redirect('/');
	})
});

router.post('/login',function(req,res){

	var username = req.body.username;
	var password = req.body.password;


	var findData = function(db,callback){
		var conn = db.collection('users');
		var data = {username:username,password:password};

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
					req.session.username = results[0].username;

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
	var username = req.param('username');
	var password = req.param('password');


	var insertData = function(db,callback){
		var conn = db.collection('users');

		var data = [{username:username,password:password}];

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
				
				res.redirect('/login')
				db.close();
			});
		}
	});


});


module.exports = router;
