import { Suggestions, SimpleResponse } from 'actions-on-google';
import { Parameters } from '../dialogflow-constants';

export function trainArrivalIntent(conv, params) {

  const fromStation = params[Parameters.FROM_STATION];
  const toStation = params[Parameters.TO_STATION];

  conv.ask(
    new SimpleResponse({
      text: 'Arrival times coming soon',
      speech: "Sorry, I don't know how to check the arrival schedule yet",
    })
  );
  // conv.ask(
  //   new Suggestions('From Utrecht To Zwolle', 'Plan my Trip', 'Departures')
  // );
}
