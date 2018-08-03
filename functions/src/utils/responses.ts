import { Image, BasicCard, Button, List } from 'actions-on-google';

export function buildSimpleCard(item: any) {
  const bc: any = new BasicCard({
    title: item.title,
    text: item.description,
    image: new Image({
      url: item.imageUrl,
      alt: item.imageAlt || item.title,
    }),
  });

  if (item.buttonTitle && item.buttonUrl) {
    bc.buttons = new Button({
      url: item.buttonUrl,
      title: item.buttonText,
    });
  }

  return bc;
}

export function buildList(
  listTitle: string,
  items: any[],
  basicCardWrapperCallback
) {
  if (items === null) {
    console.log('items is null');
    return null;
  }

  let countOptions = 0;
  let options = {};
  for (const item of items) {
    const card = basicCardWrapperCallback(item);

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
