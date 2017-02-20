const chai = require('chai');
const should = chai.should();

describe('Move', function(){
	it('使用should', function(){
		//来源于commet.ejs
		var words = '评论';
		var img = 'http://www.circler.cn/img/home.jpg';
		words.should.exist;
		words.should.equal('评论');
		img.should.be.a('string');
	})
})