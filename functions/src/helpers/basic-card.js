'use strict';

const moment = require('moment');
const utcOffset = 2;

module.exports = class BasicCard {

  constructor(){};

  static fromReisplan(item) {

    const departureTime = moment(item.vertrekTijd).utcOffset(utcOffset);
    const arrivalTime = moment(item.aankomstTijd).utcOffset(utcOffset);
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

    // Save Reisplan object
    obj.reisplan = item;

    return obj;
  }

  static fromAvt(item) {

    const departureTime = moment(item.VertrekTijd).utcOffset(utcOffset).format('HH:mm')

    let title = departureTime + ' ' + item.EindBestemming;
    if(item.VertrekVertragingTekst) {
      title += ` (${item.VertrekVertragingTekst})`;
    }

    let info = [];
    if(item.RouteTekst) {
      info.push(item.RouteTekst);
    }
    info.push(`${item.Vervoerder} ${item.TreinSoort} from Track ${item.VertrekSpoor}`);

    if(item.Opmerkingen) {
      info.push(item.Opmerkingen.Opmerking);
    }

    let description = info.join('\r\n');

    const obj = new BasicCard();
    obj.title = title;
    obj.description = description;
    obj.imageUrl = 'https://arkid-ns.firebaseapp.com/assets/clock.png';


    // Save Avt object
    obj.avt = item;

    return obj;
  }

  asBasicCard(assistant) {
    this.assistant = assistant;

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
    this.assistant = assistant;

    const option = assistant.buildOptionItem(this.title, [this.title + '_alias'])
      .setTitle(this.title)
      .setDescription(this.description)
      .setImage(this.imageUrl, this.imageAltText || this.title)
      ;
      return option;
  }

  asListOption(assistant) {
    this.assistant = assistant;

    let title, description, imageUrl, imageAltText, subtitle, aliasList;
    title = this.title;
    aliasList = [title + '_alias'];
    description = this.description;
    imageUrl = this.imageUrl;
    imageAltText = this.imageAltText || title;

    if(this.avt) {
      const item = this.avt;
      if(item.status == 'NIET-MOGELIJK') {
        imageUrl = 'https://arkid-ns.firebaseapp.com/assets/warning.png';
      }

      if( item.Opmerkingen && item.Opmerkingen.Opmerking === 'Rijdt vandaag niet') {
        imageUrl = 'https://arkid-ns.firebaseapp.com/assets/warning.png';
      }
    }

    if(this.reisplan) {
      const item = this.reisplan;

      const departureTime = moment(item.vertrekTijd).utcOffset(utcOffset);
      const arrivalTime = moment(item.aankomstTijd).utcOffset(utcOffset);
      const duration = arrivalTime.diff(departureTime, 'minutes');
      const fromCity = item.vertrekVan;
      const toCity = item.vertrekNaar;

      title = departureTime.format('HH:mm') + ' ' + item.vertrekNaar;
      // if(item.VertrekVertragingTekst) {
      //   title += ` (${item.VertrekVertragingTekst})`;
      // }

      let info = [];
      // if(item.RouteTekst) {
      //   info.push(item.RouteTekst);
      // }
      info.push(`${item.vervoerder} ${item.vervoerType} from track ${item.spoor}`);

      description = info.join('\r\n');

      imageUrl = 'https://arkid-ns.firebaseapp.com/assets/clock.png';

    }

    return this.asOption(title, description, imageUrl, imageAltText, subtitle, aliasList);
  }

  asOption(title, description, imageUrl, imageAltText, subtitle, aliasList) {
    const option = this.assistant.buildOptionItem('Option' + title, aliasList)
      .setTitle(title)
      .setDescription(description)
      .setImage(imageUrl, imageAltText)
      ;
      return option;
  }
}
