import { Suggestions, SimpleResponse } from 'actions-on-google';

export function welcome(conv) {
  if (!conv.user.last.seen) {
    conv.ask(
      new SimpleResponse({
        text: "Hi, I'm your personal planner for the Nederlandse Spoorwegen",
        speech: "Hi, I'm your personal planner for the Nederlandse Spoorwegen",
      })
    );
  } else {
    conv.ask(
      new SimpleResponse({
        text: "Hi, I'm your personal planner for the Nederlandse Spoorwegen",
        speech: "Hi, I'm your personal planner for the Nederlandse Spoorwegen",
      })
    );
  }
  conv.ask(
    new Suggestions('From Utrecht To Zwolle', 'Plan my Trip', 'Departures')
  );
}
