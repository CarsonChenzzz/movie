class Move {
	showTime(data,callback){
		setTimeout(function(){
			callback(data)
		},2000)
	}
}
module.exports = Move;