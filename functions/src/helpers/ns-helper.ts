require('dotenv').config({ silent: true });

import * as functions from 'firebase-functions';
const moment = require('moment');

const API_USERNAME =
  process.env.NS_API_USERNAME || functions.config().ns_api.username;
const API_PASSWORD =
  process.env.NS_API_PASSWORD || functions.config().ns_api.password;

const UTC_OFFSET = 1;

const ns = require('ns-api')({
  username: API_USERNAME,
  password: API_PASSWORD,
});

export class NsHelper {
  static reisadvies(params): Promise<any[]> {
    console.log(params);
    return new Promise(function(resolve, reject) {
      ns.reisadvies(params, function(err, data) {
        if (err !== null) return reject(err);

        const now = moment().utcOffset(UTC_OFFSET);
        const resultItems = [];
        for (const _item of data) {
          const item = wrapReisadviesItem(_item);
          const departureTime = moment(item.vertrekTijd).utcOffset(UTC_OFFSET);
          if (departureTime.diff(now, 'minutes') > 0) {
            resultItems.push(item);
          }
        }
        resolve(resultItems);
      });
    });
  }

  static vertrektijden(params): Promise<any[]> {
    return new Promise(function(resolve, reject) {
      ns.vertrektijden(params.fromStation, function(err, data) {
        if (err !== null) return reject(err);

        resolve(data);
      });
    });
  }

  static stations(): Promise<any[]> {
    return new Promise(function(resolve, reject) {
      ns.stations(function(err, data) {
        if (err !== null) return reject(err);

        const resultItems = [];
        for (const item of data) {
          resultItems.push(item);
        }
        resolve(data);
      });
    });
  }
}

function wrapReisadviesItem(data) {
  const obj: any = {
    vertrekTijd: data.ActueleVertrekTijd,
    vertrekVan: data.ReisDeel[0].ReisStop[0].Naam,
    vertrekNaar:
      data.ReisDeel[data.ReisDeel.length - 1].ReisStop[
        data.ReisDeel[data.ReisDeel.length - 1].ReisStop.length - 1
      ].Naam,
    vervoerType: data.ReisDeel[0].VervoerType,
    aankomstTijd: data.ActueleAankomstTijd,
    aankomstSpoor:
      data.ReisDeel[data.ReisDeel.length - 1].ReisStop[
        data.ReisDeel[data.ReisDeel.length - 1].ReisStop.length - 1
      ].Spoor,
    spoor: data.ReisDeel[0].ReisStop[0].Spoor,
    vervoerder: data.ReisDeel[0].Vervoerder,
    ritNr: data.ReisDeel[0].RitNummer,
    status: data.Status,
    optimaal: data.Optimaal === 'true',
  };
  if (data.Melding) {
    obj.melding = data.Melding;
  }

  console.dir(data, {
    depth: null,
    colors: true,
  });
  return obj;
}
