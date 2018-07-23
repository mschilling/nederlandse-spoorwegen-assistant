import { Image, List } from 'actions-on-google';

const BasicCard = require('../helpers/basic-card');

export function buidList(listTitle: string, items: any[]) {
  if (items === null) {
    console.log('items is null');
    return null;
  }

  let countOptions = 0;
  let options = {};
  for (const item of items) {
    const card = BasicCard.fromAvt(item);

    countOptions++;
    const option = buildListOption(card);
    options = { ...options, ...option };

    if (countOptions >= 10) {
      break;
    }
  }

  return new List({
    title: listTitle,
    items: options,
  });
}

function buildListOption(card: any) {
  return {
    [card.title]: {
      synonyms: [card.title],
      title: card.title,
      description: card.description,
      image: new Image({
        url: card.imageUrl,
        alt: card.imageAlt || card.title,
      }),
    },
  };
}
