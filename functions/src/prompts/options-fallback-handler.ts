import * as i18n from 'i18n';

export function optionsFallbackHandler(conv, params, option) {
  const optionData = option;
  console.info('handleOption', optionData);
  conv.close(i18n.__('SPEECH_OPTION_RESPONSE'));
}
