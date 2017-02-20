const chai = require('chai');
const expect = chai.expect;
var Move = require('../lib/second_module');
var move = new Move();
describe('Move', function(){
	it('即将上映的影视剧', function(done){
		move.showTime('三生三世十里桃花', function(data){
			expect(data).to.equal('三生三世十里桃花');
			done();
		})
	})
})