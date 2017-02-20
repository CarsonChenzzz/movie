const chai = require('chai');
const expect = chai.expect;

describe('Demo', function(){
	it('使用expect', function(){
		//来源于index.ejs
		var words = '即将上映';
		expect(words).exist;
		expect(words).equal('即将上映');
	})
})