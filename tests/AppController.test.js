const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Endpoints', () => {
  describe('GET /status', () => {
    it('it should GET the status', (done) => {
      chai.request(server)
        .get('/status')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('OK');
          done();
        });
    });
  });

  describe('GET /stats', () => {
    it('it should GET the stats', (done) => {
      chai.request(server)
        .get('/stats')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('users').which.is.a('number');
          res.body.should.have.property('files').which.is.a('number');
          done();
        });
    });
  });

});
