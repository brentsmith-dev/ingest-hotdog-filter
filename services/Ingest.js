const request = require('request');
const nconf = require('nconf');
const IngestSDK = require("@ingest/ingest-node-sdk");

class Ingest {

  constructor(clientId, clientSecret) {

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;

    console.log('Constructed');

    this.requestToken();

  }

  requestToken() {

    var requestParams = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'all'
    };

    console.log('Request : ', requestParams);

    request('https://login.ingest.io/token', {
      qs: requestParams,
      method: 'POST'
    }, this.tokenReceived.bind(this));

  }

  tokenReceived(error, response, body) {
    //console.log('Error : ', error);
    //console.log('Response: ', response);
    //console.log('Body: ', body);
    this.access_token = body.access_token;
    this.service = new IngestSDK({
      token: `Bearer ${this.access_token}`
    });
  }

}

module.exports = new Ingest(nconf.get('APP_KEY'), nconf.get('APP_SECRET'));
