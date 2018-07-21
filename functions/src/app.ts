import * as i18n from 'i18n';
import { dialogflow } from 'actions-on-google';
import { optionsFallbackHandler } from './prompts/options-fallback-handler';
import { avt } from './prompts/actual-departures';
import { planTrip } from './prompts/plan-trip';

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
  i18n.setLocale(conv.user.locale);
  moment.locale(conv.user.locale);
});

app.intent('options_handler_fallback', optionsFallbackHandler);
app.intent('plan_trip', planTrip);
app.intent('actual_departures', avt);

export { app };
