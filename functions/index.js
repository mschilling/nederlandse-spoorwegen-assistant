'use strict';

process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const moment = require('moment');

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

  const fromCity = assistant.getArgument('from-city');
  const toCity = assistant.getArgument('to-city');

  const randomDeparture = moment().add(Math.round(12 + Math.random() * 3), 'minutes');

  const responseText = {
    displayText: `The next train from ${fromCity} to ${toCity} will leave at ${randomDeparture.format('HH:mm')}`,
    speech: `The train from ${fromCity} to ${toCity} will leave ${randomDeparture.fromNow()}`
  }

  const response = assistant.buildRichResponse().addSimpleResponse(responseText);
  assistant.tell(response);
}
