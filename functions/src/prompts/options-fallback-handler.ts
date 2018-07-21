import * as i18n from 'i18n';

export function optionsFallbackHandler(assistant) {
  const optionData = assistant.getSelectedOption();
  console.info('handleOption', optionData);
  assistant.tell(i18n.__('SPEECH_OPTION_RESPONSE'));
}
