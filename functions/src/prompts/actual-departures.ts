import * as i18n from 'i18n';
import { Suggestions, SimpleResponse } from 'actions-on-google';
import { buidList } from './build-list';

const nsApi = require('../helpers/ns-helper');

export async function avt(conv, _params) {
  const params = {
    fromStation: _params['station'],
  };

  console.log('Actuele vertrektijden', params);

  try {
    const data = await nsApi.vertrektijden(params);

    if (data.length === 0) {
      conv.close(i18n.__('ERROR_400_DEPARTURES'));
      return;
    }

    const firstResult = data[0];

    const responseText = {
      text: `Here are some results`,
      speech: i18n.__('SPEECH_RESPONSE_DEPARTURES'),
    };

    conv.ask(new SimpleResponse(responseText));
    conv.ask(buidList(i18n.__('TITLE_ACTUAL_DEPARTURES'), firstResult));
    conv.ask(
      new Suggestions([
        i18n.__('SUGGESTION_CHIP_DEPARTURES'),
        i18n.__('SUGGESTION_CHIP_PLAN_TRIP'),
      ])
    );
  } catch (e) {
    console.log('error', e);
    conv.close(i18n.__('ERROR_400_DEPARTURES'));
  }
}
