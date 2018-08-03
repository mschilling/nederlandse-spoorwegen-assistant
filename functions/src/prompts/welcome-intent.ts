import * as i18n from 'i18n';
import { Suggestions, SimpleResponse } from 'actions-on-google';

export function welcome(conv) {
  const suggestions: string[] = [];
  if (!conv.user.last.seen) {
    conv.ask(
      new SimpleResponse({
        text: i18n.__('welcome_message'),
        speech: i18n.__('welcome_message_ssml'),
      })
    );
  } else {
    conv.ask(
      new SimpleResponse({
        text: i18n.__('welcome_back_message'),
        speech: i18n.__('welcome_back_message_ssml'),
      })
    );

    // suggestions.push(i18n.__('label_birthdays'));
  }
  conv.ask(
    new Suggestions(
      ...suggestions,
      i18n.__('label_plan_trip'),
      i18n.__('label_departures'),
      i18n.__('label_from_a_to_b')
    )
  );
}
