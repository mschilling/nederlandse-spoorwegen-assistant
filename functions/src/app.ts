import * as i18n from 'i18n';
import { dialogflow } from 'actions-on-google';
import { optionsFallbackHandler } from './prompts/options-fallback-handler';
import { avt } from './prompts/actual-departures';
import { planTrip } from './prompts/plan-trip';
import { welcome } from './prompts/welcome-intent';

import nlData from './locales/nl-NL.json'; // include languages
import enData from './locales/en-US.json'; // include languages
import { trainArrivalIntent } from './prompts/train-arrival-intent';

const moment = require('moment');

i18n.configure({
  locales: ['en-US', 'nl-NL'],
  directory: __dirname + '/locales',
  defaultLocale: 'en-US',
});

const app = dialogflow({
  debug: true,
  init: () => ({
    data: {
      fallbackCount: 0,
      noInputCount: 0,
      noInputResponses: [],
      fallbackResponses: [],
      currentItems: [],
      nextItems: [],
      sessionType: null,
      sessionShown: null,
      sessionsTag: null,
      tagId: null,
    },
  }),
});

app.middleware(conv => {
  if (conv.user && conv.user.locale) {
    console.log(`[MIDDLEWARE] [user local=${JSON.stringify(conv.user.locale)}]`);
    i18n.setLocale(conv.user.locale);
    moment.locale(conv.user.locale);
  }

  // Log matched intent to console
  console.log(`Intent ${conv.intent} matched with params ${JSON.stringify(conv.parameters)}`);
});

app.intent('Default Welcome Intent', welcome);
app.intent('options_handler_fallback', optionsFallbackHandler);
app.intent('plan_trip', planTrip);
app.intent('actual_departures', avt);
app.intent('train_arrival_intent', trainArrivalIntent);

export { app };
