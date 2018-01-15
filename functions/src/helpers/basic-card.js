'use strict';

const moment = require('moment');

module.exports = class BasicCard {

  constructor(){};

  static fromReisplan(item) {

    // Save Reisplan object
    this.reisplan = item;

    const departureTime = moment(item.vertrekTijd).utcOffset(1);
    const arrivalTime = moment(item.aankomstTijd).utcOffset(1);
    const duration = arrivalTime.diff(departureTime, 'minutes');
    const fromCity = item.vertrekVan;
    const toCity = item.vertrekNaar;

    const displayText = `The next train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`;

    const obj = new BasicCard();

    obj.title = `${departureTime.format('HH:mm')} - ${arrivalTime.format('HH:mm')} (${duration} minutes)`;
    obj.description = displayText;
    obj.imageUrl = 'https://arkid-ns.firebaseapp.com/assets/card-header-ns.jpg';
    obj.subtitle = `from ${fromCity}`;
    // obj.buttonText = 'Go';
    // obj.buttonUrl = 'http://youtube.com'

    return obj;
  }

  static fromAvt(item) {

    // Save Avt object
    this.avt = item;

    const departureTime = moment(item.VertrekTijd).utcOffset(1).format('HH:mm')

    let title = departureTime + ' ' + item.EindBestemming;
    if(item.VertrekVertragingTekst) {
      title += ` (${item.VertrekVertragingTekst})`;
    }

    let info = [];
    if(item.RouteTekst) {
      info.push(item.RouteTekst);
    }
    info.push(`${item.Vervoerder} ${item.TreinSoort} from Track ${item.VertrekSpoor}`);

    let description = info.join('\r\n');

    const obj = new BasicCard();
    obj.title = title;
    obj.description = description;
    obj.imageUrl = 'https://arkid-ns.firebaseapp.com/assets/clock.png';
    return obj;
  }

  asBasicCard(assistant) {
    let basicCard = assistant.buildBasicCard(this.description).setTitle(this.title);

    if (this.subtitle) {
      basicCard = basicCard.setSubtitle(this.subtitle);
    }

    if (this.buttonText) {
      basicCard = basicCard.addButton(this.buttonText, this.buttonUrl)
    }

    if (this.imageUrl) {
      basicCard = basicCard.setImage(this.imageUrl, this.imageAltText || this.title);
      basicCard = basicCard.setImageDisplay('CROPPED');
    }

    return basicCard;
  }

  asCarouselOption(assistant) {
    const option = assistant.buildOptionItem(this.title, [this.title + '_alias'])
      .setTitle(this.title)
      .setDescription(this.description)
      .setImage(this.imageUrl, this.imageAltText || this.title)
      ;
      return option;
  }

  asListOption(assistant) {

    let imageUrl = this.imageUrl;
    if(this.reisplan) {
      this.imageUrl = 'https://arkid-ns.firebaseapp.com/assets/clock.png';
    }

    const option = assistant.buildOptionItem(this.title, [this.title + '_alias'])
      .setTitle(this.title)
      .setDescription(this.description)
      .setImage(imageUrl, this.imageAltText || this.title)
      ;
      return option;
  }

}
