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
      const now = moment().utcOffset(1);
      if(result.length > 0) {
        const item = result[0];
        departureTime = moment(item.vertrekTijd).utcOffset(1);
        fromCity = item.vertrekVan;
        toCity = item.vertrekNaar;

        const responseText = {
          displayText: `The next Train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`,
          speech: `The train from ${fromCity} to ${toCity} will leave ${departureTime.fromNow()}`
        }

        const response = assistant.buildRichResponse().addSimpleResponse(responseText);
        return assistant.tell(response);
      } else {
        assistant.tell(`Sorry, couldn't find any train schedule from ${fromCity} to ${toCity} just now`);
      }

    })
    .catch( (error) => {
      console.log('error', error);
      const response = assistant.buildRichResponse().addSimpleResponse(responseText);
      assistant.tell(`Sorry, couldn't find any train schedule from ${fromCity} to ${toCity} just now`);
    });

}
