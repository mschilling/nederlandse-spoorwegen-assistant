'use strict';

const moment = require('moment');

module.exports = class BasicCard {

  constructor(){};

  static fromReisplan(item) {

    const departureTime = moment(item.vertrekTijd).utcOffset(1);
    const arrivalTime = moment(item.aankomstTijd).utcOffset(1);
    const duration = arrivalTime.diff(departureTime, 'minutes');
    const fromCity = item.vertrekVan;
    const toCity = item.vertrekNaar;

    const displayText = `The next train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`;

    const obj = new BasicCard();

    obj.title = `${departureTime.format('HH:mm')} - ${arrivalTime.format('HH:mm')} (${duration} minutes)`;
    obj.description = displayText;
    obj.imageUrl = 'https://lh3.googleusercontent.com/ZmvfZYkLd_hcas4uqPK9dZH945yMvvQg3o1wyABLl378vuaM1VHJ3kqjM6DwFNK1LzXao68_Oa8l5eyayjmzy4AxLmNjlU90lRUgdNyoItic7RAX6GAJJr22gYTWfN3-GA68xXMWQT6sminU2nzqsELJRy8kUW1-GS5bM7y93d-3ZOjXEAjAdj84vWiHub5noTHnzk15_RiN6nhvhc-qg2BO3_WOo3T2jrt8Ai_rxU9WderwgIG6gJhPDP7iQj3eefon4E4_FyRVDSN9bQfJc3QnKXRr9-fh-iNTKZHw9Db1wdPX9yZVc4-PgCITcgt3Z76SMYI56A89SVuFP7Q8YaSOvsRKBIsg1qFA2xs6kxy7vavw4lt6S6ebnJe8m2sMFOmvD1PRS8patw4bEpx80VTHYPQzi5wjhoy8tIu5RAvhpIQYxxtWDd_wNAEiLcbrDCIUBXq7o1y_HRqsHHzyx2RkfHsM5vLJo8eaRTFMpKA3tRH-Pi3XhkFU6pj-WOr151lns7c45gf3nifimrVl3Gz6kNBzdKSL_3BMRTpaKEZvmglHmmYVZtBgp3WZfaz8rA--r7nxUmQ4S8X4Orq_s4qL7xs4o1ZkMb0SU7Eo=w1920-h1080-no';
    obj.subtitle = `from ${fromCity}`;
    // obj.buttonText = 'Go';
    // obj.buttonUrl = 'http://youtube.com'

    return obj;
  }

  static fromAvt(item) {

    const departureTime = moment(item.VertrekTijd).utcOffset(1).format('HH:mm')

    const obj = new BasicCard();
    obj.title = item.EindBestemming;
    obj.description = (item.RouteTekst || item.EindBestemming);
    // obj.imageUrl = 'https://lh3.googleusercontent.com/ZmvfZYkLd_hcas4uqPK9dZH945yMvvQg3o1wyABLl378vuaM1VHJ3kqjM6DwFNK1LzXao68_Oa8l5eyayjmzy4AxLmNjlU90lRUgdNyoItic7RAX6GAJJr22gYTWfN3-GA68xXMWQT6sminU2nzqsELJRy8kUW1-GS5bM7y93d-3ZOjXEAjAdj84vWiHub5noTHnzk15_RiN6nhvhc-qg2BO3_WOo3T2jrt8Ai_rxU9WderwgIG6gJhPDP7iQj3eefon4E4_FyRVDSN9bQfJc3QnKXRr9-fh-iNTKZHw9Db1wdPX9yZVc4-PgCITcgt3Z76SMYI56A89SVuFP7Q8YaSOvsRKBIsg1qFA2xs6kxy7vavw4lt6S6ebnJe8m2sMFOmvD1PRS8patw4bEpx80VTHYPQzi5wjhoy8tIu5RAvhpIQYxxtWDd_wNAEiLcbrDCIUBXq7o1y_HRqsHHzyx2RkfHsM5vLJo8eaRTFMpKA3tRH-Pi3XhkFU6pj-WOr151lns7c45gf3nifimrVl3Gz6kNBzdKSL_3BMRTpaKEZvmglHmmYVZtBgp3WZfaz8rA--r7nxUmQ4S8X4Orq_s4qL7xs4o1ZkMb0SU7Eo=w1920-h1080-no';
    obj.subtitle = `${departureTime} ${item.Vervoerder} ${item.TreinSoort}`;
    // obj.buttonText = 'Go';
    // obj.buttonUrl = 'http://youtube.com'

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
    const option = assistant.buildOptionItem(this.title, [this.title + '_alias'])
      .setTitle(this.title)
      .setDescription(this.subtitle + ', \r\n' + this.description)
      .setImage(this.imageUrl, this.imageAltText || this.title)
      ;
      return option;
  }

}
