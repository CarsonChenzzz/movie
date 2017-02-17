var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/school';
var async = require('async');


router.post('/submit',function(req,res){
	var email = req.session.email || '';
	if(email){
		var title = req.body.title;
		var content = req.body.content;

		var insertData = function(db,callback){
			//连接表
			var conn = db.collection('comment');
			//获取参数
			var data = [{title:title,content:content,email:email}];

			// 插入数据
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

					//评论完了以后，我们先回首页去吧
					res.redirect('/comment/list');
					db.close();
				});
			}
		});


	}else{
		res.send("<script>alert('session过期喽,重新登录');location.href='/login';</script>");
	}
	
});


router.get('/list',function(req,res){
	var email = req.session.email || "";

	if(email){

		//初始化参数
		var pageNo = req.query.pageNo,
			pageNo = pageNo?pageNo:1,
			pageSize = 2,
			count = 0,
			totalPages = 0;


		var queryData = function(db,callback){
			//连接表
			var conn = db.collection('comment');
			//并行无关联
			async.parallel([
				function(callback){
					conn.find({}).toArray(function(err,results){
						if(err){
							return;
						}else{
							totalPages = Math.ceil(results.length/pageSize);
							count = results.length;

							// 第一个数组内容，我们返回的是空，并没有将count/totalPages当成回调返回，原因是什么呢？
							// 因为我们已经把total/totalPages设置成了js的全局变量，我在下面可以单独的去启用它们
							callback(null,'');
						}
					})
				},
				function(callback){
					conn.find({}).sort({_id:-1}).skip( (pageNo-1)*pageSize ).limit(pageSize).toArray(function(err,results){
						if(err){
							return;
						}
						callback(null,results);
					});

				}
			],function(err,results){
				callback(results[1]);
			})

		}

		MongoClient.connect(DB_CONN_STR,function(err,db){
			if(err){
				return;
			}else{
				queryData(db,function(results){
					var data = {
						pageNo:pageNo,
						totalPages:totalPages,
						res:results,
						count:count
					}
					res.render('list',data);
				});
				
			}
		});

		
	}else{
		res.send("<script>alert('session过期喽,重新登录');location.href='/login';</script>");
	}

});

module.exports = router;