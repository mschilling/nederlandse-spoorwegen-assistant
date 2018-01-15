'use strict';

require('dotenv').config({silent: true});

const functions = require('firebase-functions');
const moment = require('moment');

const API_USERNAME = process.env.NS_API_USERNAME || functions.config().ns_api.username;
const API_PASSWORD = process.env.NS_API_PASSWORD || functions.config().ns_api.password;

const UTC_OFFSET = 1;

const ns = require('ns-api')({
  username: API_USERNAME,
  password: API_PASSWORD
});

class NsHelper {

  static reisadvies(params) {
    console.log(params);
    return new Promise(function (resolve, reject) {
      ns.reisadvies(params, function (err, data) {
        if (err !== null) return reject(err);

        const now = moment().utcOffset(UTC_OFFSET);
        const resultItems = [];
        for (let i = 0; i < data.length; i++) {
          const item = wrapReisadviesItem(data[i]);
          const departureTime = moment(item.vertrekTijd).utcOffset(UTC_OFFSET);
          if (departureTime.diff(now, 'minutes') > 0) {
            resultItems.push(item);
          }
        }
        resolve(resultItems);
      });
    });

  }

  static vertrektijden(params) {
    return new Promise(function (resolve, reject) {
      ns.vertrektijden(params.fromStation, function (err, data) {
        if (err !== null) return reject(err);

        resolve(data);
        // const now = moment().utcOffset(UTC_OFFSET);
        // const resultItems = [];
        // for (let i = 0; i < data.length; i++) {
        //   const item = wrapReisadviesItem(data[i]);
        //   const departureTime = moment(item.vertrekTijd).utcOffset(UTC_OFFSET);
        //   if (departureTime.diff(now, 'minutes') > 0) {
        //     resultItems.push(item);
        //   }
        // }
        // resolve(resultItems);
      });
    });

  }

  static stations() {
    return new Promise(function (resolve, reject) {
      ns.stations(function (err, data) {
        if (err !== null) return reject(err);

        const resultItems = [];
        for (let i = 0; i < data.length; i++) {
          resultItems.push(data[i]);
        }
        resolve(data);
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
  // console.log(data);
  return obj;
}

module.exports = NsHelper;
