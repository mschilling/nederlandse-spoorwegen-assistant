'use strict';

process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const moment = require('moment');

const nsApi = require('./helpers/ns-helper');

const Actions = require('./assistant-actions');

exports.assistant = functions.https.onRequest((request, response) => {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));
  console.log('current date time', new Date(), moment().format(), moment().utcOffset(2).format());

  const assistant = new Assistant({ request: request, response: response });

  const actionMap = new Map();
  actionMap.set(Actions.ACTION_PLAN_TRIP, planTrip);

  assistant.handleRequest(actionMap);
});

function planTrip(assistant) {

  let fromCity = assistant.getArgument('from-city');
  let toCity = assistant.getArgument('to-city');
  let departureTime;

  const params = {
    fromStation: fromCity,
    toStation: toCity
  };

  return nsApi.reisadvies(params)
    .then((result) => {
      // console.log('log result from NS API', result);

      const now = moment().utcOffset(1);

      for (let i = 0; i < result.length; i++) {
        let item = result[i];
        departureTime = moment(item.vertrekTijd).utcOffset(1);

          if (departureTime.diff(now, 'minutes') > 0) {
            fromCity = item.vertrekVan;
            toCity = item.vertrekNaar;
          break;
        }
      }

      const responseText = {
        displayText: `The next train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`,
        speech: `The train from ${fromCity} to ${toCity} will leave ${departureTime.fromNow()}`
      }

      const response = assistant.buildRichResponse().addSimpleResponse(responseText);
      assistant.tell(response);

    })
    .catch( (error) => {

      console.log('error', error);

      const responseText = {
        displayText: `The next train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`,
        speech: `The train from ${fromCity} to ${toCity} will leave ${departureTime.fromNow()}`
      }

      const response = assistant.buildRichResponse().addSimpleResponse(responseText);
      assistant.tell(response);
    });

}
