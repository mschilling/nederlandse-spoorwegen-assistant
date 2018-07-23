import * as i18n from 'i18n';
import { SimpleResponse, } from 'actions-on-google';
import { NsHelper as nsApi } from '../helpers/ns-helper';
import { buildSimpleCard } from '../utils/responses';
import { buidList } from './build-list';
const moment = require('moment');
const ssml = require('ssml');
const BasicCardHelper = require('../helpers/basic-card');

const utcOffset = 2;

export async function planTrip(conv, _params) {
  const responseSpeech = new ssml();

  let fromLocation = _params['from-station'];
  let toLocation = _params['to-station'];
  let hasFirstLast = _params['first_last'];
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
    if (data.length > 0) {
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
        )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${
          item.aankomstSpoor
        }`,
        speech: `The train from ${fromLocation} to ${toLocation} will leave ${departureTime.fromNow()}. You will arrive at ${arrivalTime.format(
          'HH:mm'
        )} on track ${item.aankomstSpoor}.`,
      };

      responseSpeech
        .say(
          `The train from ${fromLocation} to ${toLocation} will leave ${departureTime.fromNow()}. You will arrive at `
        )
        .say({
          text: arrivalTime.format('HH:mm'),
          interpretAs: 'time',
          format: 'hms24',
        })
        .say(`on track ${item.aankomstSpoor}.`);

      // responseText.speech = responseSpeech.toString({ minimal: true });
      responseText.speech = i18n.__('SPEECH_NEXT_TRAIN_DEPARTURE', speechCtx);

      if (findFirstPlan) {
        responseText.text = `Tomorrow's first train to ${toLocation} will leave at ${departureTime.format(
          'HH:mm'
        )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${
          item.aankomstSpoor
        }`;
        responseText.speech = i18n.__('SPEECH_FIRST_TRAIN', speechCtx);
      }

      if (findLastPlan) {
        const lastPlan = data[data.length - 1];
        const lastPlanDepartureTime = moment(lastPlan.vertrekTijd).utcOffset(
          utcOffset
        );

        responseText.text = `Today's last train to ${toLocation} will leave at ${lastPlanDepartureTime.format(
          'HH:mm'
        )}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${
          item.aankomstSpoor
        }`;
        responseText.speech = i18n.__('SPEECH_LAST_TRAIN', speechCtx);
      }

      conv.ask(new SimpleResponse(responseText));

      if (findFirstPlan || findLastPlan) {
        conv.ask(buidList(i18n.__('TITLE_ACTUAL_DEPARTURES'), data, BasicCardHelper.fromReisplan));
        // conv.ask(buildList('More travel options', data, BasicCardHelper.fromReisplan));
      } else {
        const card = BasicCardHelper.fromReisplan(item);
        return conv.ask(buildSimpleCard(card));
      }
    } else {
      conv.close(i18n.__('ERROR_SCHEDULE_A_TO_B_NOT_FOUND', speechCtx));
    }
  } catch (e) {
    console.log('error', e);
    conv.close(i18n.__('ERROR_SCHEDULE_NOT_FOUND'));
  }
}
