const i18n = require('i18n');

import { SimpleResponse } from 'actions-on-google';
import { NsHelper as nsApi } from '../helpers/ns-helper';
import { buildList, buildSimpleCard } from '../utils/responses';
// import { buildSimpleCard } from '../utils/responses';
const moment = require('moment');
const BasicCardHelper = require('../helpers/basic-card');

const utcOffset = 2;

export async function planTrip(conv, _params) {
  let fromLocation = _params['from-station'];
  let toLocation = _params['to-station'];
  const hasFirstLast = _params['first_last'];
  let findFirstPlan = false;
  let findLastPlan = false;

  let departureTime;
  let arrivalTime;
  let duration;

  const params = <any>{
    fromStation: fromLocation,
    toStation: toLocation,
  };

  let speechCtx: any = {};
  speechCtx.fromStation = fromLocation;
  speechCtx.toStation = toLocation;

  if (hasFirstLast) {
    const startTime = moment()
      .utcOffset(utcOffset)
      .startOf('day')
      .add(1, 'day')
      .add(5, 'hour');
    params.dateTime = startTime.format('YYYY-MM-DDTHH:mm');

    if (hasFirstLast === 'first') {
      findFirstPlan = true;
      params.previousAdvices = 0;
    } else {
      findLastPlan = true;
      params.previousAdvices = 3;
      params.nextAdvices = 0;
    }
  }

  try {
    const data = await nsApi.reisadvies(params);
    if (data.length === 0) {
      conv.close(i18n.__('ERROR_SCHEDULE_A_TO_B_NOT_FOUND', speechCtx));
      return;
    }

    const item = data[0];
    departureTime = moment(item.vertrekTijd).utcOffset(utcOffset);
    arrivalTime = moment(item.aankomstTijd).utcOffset(utcOffset);
    duration = arrivalTime.diff(departureTime, 'minutes');
    fromLocation = item.vertrekVan;
    toLocation = item.vertrekNaar;

    speechCtx = {
      fromStation: fromLocation,
      toStation: toLocation,
      departure: departureTime.fromNow(),
      arrival: arrivalTime.format('HH:mm'),
      track: item.aankomstSpoor,
    };

    const responseText = {
      text: `The next Train from ${fromLocation} to ${toLocation} will leave at ${departureTime.format(
        'HH:mm'
      )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`,
      speech: i18n.__('SPEECH_NEXT_TRAIN_DEPARTURE', speechCtx),
    };

    if (findFirstPlan) {
      responseText.text = `Tomorrow's first train to ${toLocation} will leave at ${departureTime.format(
        'HH:mm'
      )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`;
      responseText.speech = i18n.__('SPEECH_FIRST_TRAIN', speechCtx);
    }

    if (findLastPlan) {
      const lastPlan = data[data.length - 1];
      const lastPlanDepartureTime = moment(lastPlan.vertrekTijd).utcOffset(utcOffset);

      responseText.text = `Today's last train to ${toLocation} will leave at ${lastPlanDepartureTime.format(
        'HH:mm'
      )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`;
      responseText.speech = i18n.__('SPEECH_LAST_TRAIN', speechCtx);
    }

    conv.ask(new SimpleResponse(responseText));

    if (findFirstPlan || findLastPlan) {
      conv.ask(buildList(i18n.__('TITLE_SCHEDULES_LIST'), data, BasicCardHelper.fromReisplan));
    } else {
      const card = BasicCardHelper.fromReisplan(item);
      return conv.ask(buildSimpleCard(card));
    }
  } catch (e) {
    console.log('error', e);
    conv.close(i18n.__('ERROR_SCHEDULE_NOT_FOUND'));
  }
}
