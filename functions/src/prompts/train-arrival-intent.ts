const i18n = require('i18n');
const moment = require('moment');

import { Suggestions, SimpleResponse } from 'actions-on-google';
import { Parameters } from '../dialogflow-constants';
import { NsHelper } from '../helpers/ns-helper';
import { buildList } from '../utils/responses';
import { Constants } from '../constants';

const BasicCard = require('../helpers/basic-card');

export async function trainArrivalIntent(conv, _params) {
  const fromStation = _params[Parameters.FROM_STATION];
  const toStation = _params[Parameters.TO_STATION];

  if (!fromStation || !toStation) {
    conv.ask(i18n.__('ERROR_400_DEPARTURES'));
  }

  const params = {
    fromStation: fromStation,
    toStation: toStation,
    departure: false,
  };

  const data = await NsHelper.getSchedule(params);
  console.log(`[trainArrivalIntent] [data=${JSON.stringify(data)}]`);

  const now = moment().utcOffset(Constants.UTC_OFFSET);
  const filteredData = data.filter(p=>moment(p.aankomstTijd).utcOffset(Constants.UTC_OFFSET).diff(now, 'minutes') > 0);

  conv.ask(
    new SimpleResponse({
      text: i18n.__('train_arrival_message'),
      speech: i18n.__('train_arrival_message_ssml'),
    })
  );

  conv.ask(buildList(i18n.__('train_arrival_title'), filteredData, BasicCard.fromReisplan));
  conv.ask(
    new Suggestions([i18n.__('SUGGESTION_CHIP_DEPARTURES'), i18n.__('SUGGESTION_CHIP_PLAN_TRIP')])
  );
}
