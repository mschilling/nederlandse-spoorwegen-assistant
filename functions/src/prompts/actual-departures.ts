import * as i18n from 'i18n';
import moment from 'moment';

const nsApi = require('../helpers/ns-helper');
const BasicCard = require('../helpers/basic-card');

const utcOffset = 2;

export function avt(assistant) {
  let fromStation = assistant.getArgument('station');

  let departureTime;
  let arrivalTime;
  let duration;

  const params = {
    fromStation: fromStation
  };

  return nsApi.vertrektijden(params)
    .then((result) => {
      const now = moment().utcOffset(utcOffset);
      if (result.length > 0) {
        const item = result[0];
        // departureTime = moment(item.vertrekTijd).utcOffset(1);
        // arrivalTime = moment(item.aankomstTijd).utcOffset(1);
        // duration = arrivalTime.diff(departureTime, 'minutes');
        // fromCity = item.vertrekVan;
        // toCity = item.vertrekNaar;

        const responseText = {
          displayText: `Here are some results`,
          speech: i18n.__('SPEECH_RESPONSE_DEPARTURES')
        }

        let response = assistant.buildRichResponse().addSimpleResponse(responseText);

        response = response.addSuggestions([i18n.__('SUGGESTION_CHIP_DEPARTURES'), i18n.__('SUGGESTION_CHIP_PLAN_TRIP')]);

        let options = assistant.buildList(i18n.__('TITLE_ACTUAL_DEPARTURES'));
        for (let i = 1; i < result.length; i++) {
          const option = BasicCard.fromAvt(result[i]).asListOption(assistant);
          options = options.addItems(option);
        }
        return assistant.askWithList(response, options);
        // return assistant.tell(response);

      } else {
        assistant.tell(i18n.__("ERROR_400_DEPARTURES"));
      }

    })
    .catch((error) => {
      console.log('error', error);
      assistant.tell(i18n.__("ERROR_400_DEPARTURES"));
    });

}
