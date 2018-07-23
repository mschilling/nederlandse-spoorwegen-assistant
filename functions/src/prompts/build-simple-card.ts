import { BasicCard, Image, Button } from 'actions-on-google';

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
