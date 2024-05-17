const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Endpoints', () => {
  let token;

  // Test the GET /connect route
  describe('GET /connect', () => {
    it('it should GET a token', (done) => {
      chai.request(server)
        .get('/connect')
        .set('Authorization', 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          token = res.body.token; // Save the token for the next tests
          done();
        });
    });
  });

  // Test the POST /files route
  describe('POST /files', () => {
    it('it should POST a new file', (done) => {
      chai.request(server)
        .post('/files')
        .set('X-Token', token)
        .set('Content-Type', 'application/json')
        .send({ name: 'myText.txt', type: 'file', data: 'SGVsbG8gV2Vic3RhY2shCg==' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name').eql('myText.txt');
          res.body.should.have.property('type').eql('file');
          done();
        });
    });

    it('it should POST a new folder', (done) => {
      chai.request(server)
        .post('/files')
        .set('X-Token', token)
        .set('Content-Type', 'application/json')
        .send({ name: 'images', type: 'folder' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name').eql('images');
          res.body.should.have.property('type').eql('folder');
          done();
        });
    });

    it('it should GET all the files with a specific parentId', (done) => {
      chai.request(server)
        .get('/files?parentId=5f1e881cc7ba06511e683b23')
        .set('X-Token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
  });

  describe('GET /files/:id', () => {
    it('it should GET a file by the given id', (done) => {
      chai.request(server)
        .get('/files/5f1e8896c7ba06511e683b25')
        .set('X-Token', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql('5f1e8896c7ba06511e683b25');
          done();
        });
    });
  });
});
