'use strict';

const functions = require('firebase-functions');

const API_USERNAME = process.env.NS_API_USERNAME || functions.config().ns_api.username;
const API_PASSWORD = process.env.NS_API_PASSWORD || functions.config().ns_api.password;

const ns = require('ns-api')({
  username: API_USERNAME,
  password: API_PASSWORD
});

class NsHelper {

  static reisadvies(params) {
    return new Promise(function (resolve, reject) {
      ns.reisadvies(params, function (err, data) {
        if (err !== null) return reject(err);

        const resultItems = [];
        for (let i = 0; i < data.length; i++) {
          resultItems.push(wrapReisadviesItem(data[i]));
        }
        resolve(resultItems);
      });
    });

  }
}

function wrapReisadviesItem(data) {
  let obj = {
    vertrekTijd: data.ActueleVertrekTijd,
    vertrekVan: data.ReisDeel[0].ReisStop[0].Naam,
    vertrekNaar: data.ReisDeel[0].ReisStop[data.ReisDeel[0].ReisStop.length - 1].Naam,
    vervoerType: data.ReisDeel[0].VervoerType,
    aankomstTijd: data.ActueleAankomstTijd,
    spoor: data.ReisDeel[0].ReisStop[0].Spoor,
    status: data.Status
  }
  return obj;
}

module.exports = NsHelper;
