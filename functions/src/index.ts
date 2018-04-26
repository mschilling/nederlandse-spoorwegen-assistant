// import * as functions from 'firebase-functions';
process.env.DEBUG = 'actions-on-google:*';

const functions = require('firebase-functions');

const i18n = require('i18n');
const ssml = require('ssml');
const Assistant = require('actions-on-google').DialogflowApp;
const moment = require('moment');

const nsApi = require('./helpers/ns-helper');
const Actions = require('./assistant-actions');
const BasicCard = require('./helpers/basic-card');

const utcOffset = 2;

exports.assistant = functions.https.onRequest((request, response) => {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  i18n.configure({
    locales: ['en-US', 'nl-NL'],
    directory: __dirname + '/locales',
    defaultLocale: 'en-US'
  });

  const assistant = new Assistant({ request: request, response: response });
  const userLocale = assistant.getUserLocale() || 'en-US';
  i18n.setLocale(userLocale);
  moment.locale(userLocale);

  const actionMap = new Map();
  actionMap.set(Actions.ACTION_OPTION_SELECT, handleOption);
  actionMap.set(Actions.ACTION_PLAN_TRIP, planTrip);
  actionMap.set(Actions.ACTION_AVT, avt);
  assistant.handleRequest(actionMap);
});

function handleOption(assistant) {
  const optionData = assistant.getSelectedOption();
  console.info('handleOption', optionData);
  assistant.tell(i18n.__('SPEECH_OPTION_RESPONSE'));
}

function planTrip(assistant) {

  const responseSpeech = new ssml();

  let fromLocation = assistant.getArgument('from-station');
  let toLocation = assistant.getArgument('to-station');
  let hasFirstLast = assistant.getArgument('first_last');
  let findFirstPlan = false;
  let findLastPlan = false;

  let departureTime;
  let arrivalTime;
  let duration;

  const params = <any>{
    fromStation: fromLocation,
    toStation: toLocation
  };

  let speechCtx: any = {};
  speechCtx.fromStation = fromLocation;
  speechCtx.oStation = toLocation;

  if (hasFirstLast) {
    const startTime = moment().utcOffset(utcOffset).startOf('day').add(1, 'day').add(5, 'hour');
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

  return nsApi.reisadvies(params)
    .then((result) => {
      const now = moment().utcOffset(utcOffset);
      if (result.length > 0) {
        const item = result[0];
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
          track: item.aankomstSpoor
         };

        const responseText = {
          displayText: `The next Train from ${fromLocation} to ${toLocation} will leave at ${departureTime.format('HH:mm')}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`,
          speech: `The train from ${fromLocation} to ${toLocation} will leave ${departureTime.fromNow()}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}.`
        }

        responseSpeech
          .say(`The train from ${fromLocation} to ${toLocation} will leave ${departureTime.fromNow()}. You will arrive at `)
          .say({
            text: arrivalTime.format('HH:mm'),
            interpretAs: 'time',
            format: 'hms24'
          })
          .say(`on track ${item.aankomstSpoor}.`);

        // responseText.speech = responseSpeech.toString({ minimal: true });
        responseText.speech = i18n.__('SPEECH_NEXT_TRAIN_DEPARTURE', speechCtx);

        if (findFirstPlan) {
          responseText.displayText = `Tomorrow's first train to ${toLocation} will leave at ${departureTime.format('HH:mm')}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`;
          responseText.speech = i18n.__("SPEECH_FIRST_TRAIN", speechCtx);
        }

        if (findLastPlan) {
          const lastPlan = result[result.length-1];
          const lastPlanDepartureTime = moment(lastPlan.vertrekTijd).utcOffset(utcOffset);

          responseText.displayText = `Today's last train to ${toLocation} will leave at ${lastPlanDepartureTime.format('HH:mm')}. You will arrive at ${arrivalTime.format('HH:mm')} on track ${item.aankomstSpoor}`;
          responseText.speech = i18n.__("SPEECH_LAST_TRAIN", speechCtx);

        }

        let response = assistant.buildRichResponse().addSimpleResponse(responseText);

        if (findFirstPlan || findLastPlan) {
          // let options = assistant.buildCarousel();
          // for (let i = 1; i < result.length; i++) {
          //   const carouselOption = BasicCard.fromReisplan(result[i]).asCarouselOption(assistant);
          //   options = options.addItems(carouselOption);
          // }
          // return assistant.askWithCarousel(response, options);

          let options = assistant.buildCarousel();
          for (let i = 0; i < result.length; i++) {
            const option = BasicCard.fromReisplan(result[i]).asListOption(assistant);
            options = options.addItems(option);
          }
          return assistant.askWithList(response, options);

        } else {
          let basicCard = BasicCard.fromReisplan(item).asBasicCard(assistant);
          response = response.addBasicCard(basicCard);
          // return assistant.ask(response);
          return assistant.tell(response);
      }

      } else {
        assistant.tell( i18n.__("ERROR_SCHEDULE_A_TO_B_NOT_FOUND", speechCtx));
      }

    })
    .catch((error) => {
      console.log('error', error);
      assistant.tell(i18n.__('ERROR_SCHEDULE_NOT_FOUND'));
    });

}

function avt(assistant) {
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
