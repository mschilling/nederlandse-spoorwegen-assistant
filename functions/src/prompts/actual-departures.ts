import * as i18n from 'i18n';
import { Suggestions, SimpleResponse, List, Image } from 'actions-on-google';

const moment = require('moment');

const nsApi = require('../helpers/ns-helper');
const BasicCard = require('../helpers/basic-card');

const utcOffset = 2;

export async function avt(conv, _params) {
  let fromStation = _params['station'];

  let departureTime;
  let arrivalTime;
  let duration;

  const params = {
    fromStation: fromStation,
  };

  console.log('Actuele vertrektijden', params);

  return nsApi
    .vertrektijden(params)
    .then(result => {
      const now = moment().utcOffset(utcOffset);
      if (result.length > 0) {
        const item = result[0];
        // departureTime = moment(item.vertrekTijd).utcOffset(1);
        // arrivalTime = moment(item.aankomstTijd).utcOffset(1);
        // duration = arrivalTime.diff(departureTime, 'minutes');
        // fromCity = item.vertrekVan;
        // toCity = item.vertrekNaar;

        const responseText = {
          text: `Here are some results`,
          speech: i18n.__('SPEECH_RESPONSE_DEPARTURES'),
        };

        conv.ask(new SimpleResponse(responseText));
        conv.ask(
          new Suggestions([
            i18n.__('SUGGESTION_CHIP_DEPARTURES'),
            i18n.__('SUGGESTION_CHIP_PLAN_TRIP'),
          ])
        );

        conv.ask(getList(i18n.__('TITLE_ACTUAL_DEPARTURES'), result));
      } else {
        conv.close(i18n.__('ERROR_400_DEPARTURES'));
      }
    })
    .catch(error => {
      console.log('error', error);
      conv.close(i18n.__('ERROR_400_DEPARTURES'));
    });
}

function getList(listTitle: string, items: any[]) {
  if (items === null) {
    console.log('items is null');
    return null;
  }

  let countOptions = 0;
  let options = {};
  for (const item of items) {
    const card = BasicCard.fromAvt(item);

    countOptions++;
    const option = buildListOption(card);
    options = { ...options, ...option };

    if (countOptions >= 10) {
      break;
    }
  }

  return new List({
    title: listTitle,
    items: options,
  });
}

function buildListOption(card: any) {
  return {
    [card.title]: {
      synonyms: [card.title],
      title: card.title,
      description: card.description,
      image: new Image({
        url: card.imageUrl,
        alt: card.imageAlt || card.title,
      }),
    },
  };
}
