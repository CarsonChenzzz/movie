var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/movie';
var async = require('async');
//评论开始
router.get('/', function (req, res, next) {
  Date.prototype.Format = function (fmt) {  
      var o = {
          "M+": this.getMonth() + 1, //月份 
          "d+": this.getDate(), //日 
          "h+": this.getHours(), //小时 
          "m+": this.getMinutes(), //分 
          "s+": this.getSeconds(), //秒 
          "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
          "S": this.getMilliseconds() //毫秒 
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
  }
  var movieid=req.param("id"),
      userid=req.session.username,
      pageNo=req.param("pageNo")||1,
      pageSize=req.param("pageSize")||5,
      collection=req.param("table"),
      count = 0,
      totalPages = 0;
      req.session.infourl=req.originalUrl;
      
  //评论分页
  var findData = function(db,callback){      
      //串行无关联
      async.parallel([
        function(callback){
          var movieid=req.param("id");
          var conn = db.collection('comment');
          conn.find({movieid:movieid}).toArray(function(err,results){
            if(err){
              console.log(err);
            }else {
              req.session.totalPages = Math.ceil(results.length/pageSize);
              req.session.count = results.length;
              console.log(req.session.count,req.session.totalPages);
              callback(null,'');
            }
          });
        },
        function(callback){
            var movieid=req.param("id"),
                collection=req.param("table");
            var conn = db.collection(collection);
            var data = {id:movieid};
            conn.find(data).toArray(function(err,results){
                if(err){
                  return;
                }else{
                  req.session.movieres=results;
                  callback(null,results);
                }
            });
        },
        function(callback){
          var movieid=req.param("id");
          var conn=db.collection('comment');
          // conn.find({movieid:movieid}).sort({_id:-1}).toArray(function(err,results){
          //   if(err){
          //     console.log(err);
          //   }else {
          //     req.session.res=results;
          //     callback(null,results);
          //   }
          // });
          conn.find({movieid:movieid}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray(function(err,results){
            if(err){
              console.log(err);
            }else {
              req.session.res=results;
              console.log(results);
              callback(null,results);
            }
          });
        }
      ],function(err,results){
        res.render('comment', { 
              pageNo:pageNo,
              totalPages:req.session.totalPages,
              commentres:req.session.res,
              count:req.session.count,
              movieres:req.session.movieres
            });
        db.close();
    });
  };

  MongoClient.connect(DB_CONN_STR,function(err,db){
      if(err){
          console.log(err);
      }else{ 
          findData(db,function(results){});
      }
  });
});
//提交评论
router.post('/submit_comment', function (req, res, next) {
  var username = req.session.username || '';
	if(username){
  var comment = req.body.comment_text,
      username = req.session.username,
      movieid = req.body.movieid,
      subtime=new Date().Format("yyyy-MM-dd hh:mm:ss"); 
  var insertComment = function (db, callback) {
    var conn = db.collection('comment');
    var data = [{ movieid: movieid, username: username, comment: comment,subtime:subtime }];
    conn.insert(data, function (err, results) {
      if (err) { console.log(err); return }
      callback(results);
    })
    conn.find({movieid: movieid}).toArray(function(err,results){
      req.session.res=results;
      res.send('<script>alert("评论成功");location.href="http://10.7.186.143:3000'+req.session.infourl+'#btm";</script>')
    });
  };
  MongoClient.connect(DB_CONN_STR, function (err, db) {
    if (err)
      console.log(err);
    else {
        console.log(' ----- connect success ----- ');
        insertComment(db,function(results){
          console.log(' ----- insert success ----- ');
        });
    }
  });
}else{
  res.send('<script>alert("session过期，重新登录");location.href="/login";</script>')
}
});
//评论结束


// router.post('/submit',function(req,res){
// 	var email = req.session.email || '';
// 	if(email){
// 		var title = req.body.title;
// 		var content = req.body.content;

// 		var insertData = function(db,callback){
// 			//连接表
// 			var conn = db.collection('comment');
// 			//获取参数
// 			var data = [{title:title,content:content,email:email}];

// 			// 插入数据
// 			conn.insert(data,function(err,results){
// 				if(err){
// 					return;
// 				}
// 				callback(results);
// 			});
// 		};


// 		MongoClient.connect(DB_CONN_STR,function(err,db){
// 			if(err){
// 				return;
// 			}else{
// 				insertData(db,function(results){

// 					//评论完了以后，我们先回首页去吧
// 					res.redirect('/comment/list');
// 					db.close();
// 				});
// 			}
// 		});


// 	}else{
// 		res.send("<script>alert('session过期喽,重新登录');location.href='/login';</script>");
// 	}
	
// });


// router.get('/list',function(req,res){
// 	var email = req.session.email || "";

// 	if(email){

// 		//初始化参数
// 		var pageNo = req.query.pageNo,
// 			pageNo = pageNo?pageNo:1,
// 			pageSize = 2,
// 			count = 0,
// 			totalPages = 0;


// 		var queryData = function(db,callback){
// 			//连接表
// 			var conn = db.collection('comment');
// 			//并行无关联
// 			async.parallel([
// 				function(callback){
// 					conn.find({}).toArray(function(err,results){
// 						if(err){
// 							return;
// 						}else{
// 							totalPages = Math.ceil(results.length/pageSize);
// 							count = results.length;

// 							// 第一个数组内容，我们返回的是空，并没有将count/totalPages当成回调返回，原因是什么呢？
// 							// 因为我们已经把total/totalPages设置成了js的全局变量，我在下面可以单独的去启用它们
// 							callback(null,'');
// 						}
// 					})
// 				},
// 				function(callback){
// 					conn.find({}).sort({_id:-1}).skip( (pageNo-1)*pageSize ).limit(pageSize).toArray(function(err,results){
// 						if(err){
// 							return;
// 						}
// 						callback(null,results);
// 					});

// 				}
// 			],function(err,results){
// 				callback(results[1]);
// 			})

// 		};

// 		MongoClient.connect(DB_CONN_STR,function(err,db){
// 			if(err){
// 				return;
// 			}else{
// 				queryData(db,function(results){
// 					var data = {
// 						pageNo:pageNo,
// 						totalPages:totalPages,
// 						res:results,
// 						count:count
// 					}
// 					res.render('list',data);
// 				});
				
// 			}
// 		});

		
// 	}else{
// 		res.send("<script>alert('session过期喽,重新登录');location.href='/login';</script>");
// 	}

// });

module.exports = router;