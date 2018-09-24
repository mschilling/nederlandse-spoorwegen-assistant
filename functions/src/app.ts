import { dialogflow } from 'actions-on-google';
import { optionsFallbackHandler } from './prompts/options-fallback-handler';
import { avt } from './prompts/actual-departures';
import { planTrip } from './prompts/plan-trip';
import { welcome } from './prompts/welcome-intent';

import { trainArrivalIntent } from './prompts/train-arrival-intent';

const moment = require('moment');
const i18n = require('i18n');

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

    console.log('locales:' + JSON.stringify(i18n.getLocales()));
    console.log('locale:' + JSON.stringify(i18n.getLocale()));
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
