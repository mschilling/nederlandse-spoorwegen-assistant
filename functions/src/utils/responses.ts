import { Image, Carousel, BasicCard, Button, BrowseCarouselItem, BrowseCarousel } from "actions-on-google";

export function buildSimpleCard(item: any) {

  return new BasicCard({
    title: item.title,
    text: item.description,
    buttons: new Button({ // TODO: make Button optional
      url: item.buttonUrl,
      title: item.buttonTitle
    }),
    image: new Image({
      url: item.imageUrl,
      alt: item.imageAlt
    })
  });
}

export function buildList(items: any[]) {
  if (items === null) {
    console.log("items is null");
    return null;
  }

  let countOptions = 0;
  let options = {};
  for (const item of items) {
    if (item.imageUrl) {
      countOptions++;
      const option = buildListOption(item);
      options = { ...options, ...option };

      if (countOptions >= 10) {
        break;
      }
    }
  }
  return new Carousel({ items: options });
}

/*
export function buildCarousel(items: any[]) {
  if (items === null) {
    console.log("items is null");
    return null;
  }

  let countOptions = 0;
  let options = {};
  for (const item of items) {
    if (item.imageUrl) {
      countOptions++;
      const option = buildCarouselOption(item);
      options = { ...options, ...option };

      if (countOptions >= 10) {
        break;
      }
    }
  }
  return new Carousel({ items: options });
}
*/

export function buildBrowseCarousel(items: any[]) {
  if (items === null) {
    console.log("items is null");
    return null;
  }

  const options = buildBrowseCarouselOptions(items);
  return new BrowseCarousel({ items: options });
}

function buildListOption(card: any) {
  return {
    [card.key]: {
      synonyms: [card.title],
      title: card.title,
      description: card.description,
      image: new Image({
        url: card.imageUrl,
        alt: card.imageAlt
      })
    }
  };
}

/*
function buildCarouselOption(card: any) {
  const dfo = new DialogflowOption(card._optionType, card._optionValue, null);
  return {
    [dfo.toString()]: {
      synonyms: [card.title],
      title: card.title,
      description: card.description,
      image: new Image({
        url: card.imageUrl,
        alt: card.imageAlt
      })
    }
  };
}
*/

function buildBrowseCarouselOptions(cards: any[]) {

  console.log('browse carousel items', cards);

  const browseCarouselItems: BrowseCarouselItem[] = [];

  for (const card of cards) {

    const newOption = new BrowseCarouselItem({
      title: card.title,
      url: card.buttonUrl,
      description: card.description,
      image: new Image({
        url: card.imageUrl,
        alt: card.imageAlt
      })
    });

    browseCarouselItems.push(newOption)
  }
  return browseCarouselItems;
}
