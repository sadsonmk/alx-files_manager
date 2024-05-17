const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); 
const should = chai.should();

chai.use(chaiHttp);

describe('POST /users', () => {
  it('it should create a new user', (done) => {
    chai.request(server)
      .post('/users')
      .send({ email: 'bob@dylan.com', password: 'toto1234!' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('email').eql('bob@dylan.com');
        done();
      });
  });

  it('it should not create a user with the same email', (done) => {
    chai.request(server)
      .post('/users')
      .send({ email: 'bob@dylan.com', password: 'toto1234!' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('Already exist');
        done();
      });
  });

  it('it should not create a user without a password', (done) => {
    chai.request(server)
      .post('/users')
      .send({ email: 'bob@dylan.com' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('Missing password');
        done();
      });
  });
});
