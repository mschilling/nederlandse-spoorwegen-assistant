import { Constants } from './../constants';
import { NsHelper } from '../helpers/ns-helper';
require('dotenv').config({ silent: true });

const moment = require('moment');

// Travel parameters
const params = {
  fromStation: 'Utrecht',
  toStation: 'Zwolle',
  departure: false,
};

(async () => {
  const data = await NsHelper.getSchedule(params);
  console.log(data);

  const now = moment().utcOffset(Constants.UTC_OFFSET);
  const first = data.filter(p=>moment(p.aankomstTijd).utcOffset(Constants.UTC_OFFSET).diff(now, 'minutes') > 0)[0];

  console.log('First choice');
  printSchedule(first);

  console.log('Other options');
  for (const item of data) {
    printSchedule(item);
  }
})().catch();

function printSchedule(item) {
  console.log(
    `Rit ${item.ritNr} van '${item.vertrekVan}' naar '${item.vertrekNaar}': ${
      item.vertrekTijd
    } - ${item.aankomstTijd} - ${item.optimaal}`
  );
}
