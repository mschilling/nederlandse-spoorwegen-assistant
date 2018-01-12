// import * as functions from 'firebase-functions';
process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const moment = require('moment');

const nsApi = require('./helpers/ns-helper');

const Actions = require('./assistant-actions');
const BasicCard = require('./helpers/basic-card');

exports.assistant = functions.https.onRequest((request, response) => {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const assistant = new Assistant({ request: request, response: response });

  const actionMap = new Map();
  actionMap.set(Actions.ACTION_PLAN_TRIP, planTrip);
  assistant.handleRequest(actionMap);
});

function planTrip(assistant) {
  let fromCity = assistant.getArgument('from-city');
  let toCity = assistant.getArgument('to-city');
  let fromStation = assistant.getArgument('from-station');
  let toStation = assistant.getArgument('to-station');


  let departureTime;
  let arrivalTime;
  let duration;

  const params = {
    fromStation: fromStation || fromCity,
    toStation: toStation || toCity
  };

  return nsApi.reisadvies(params)
    .then((result) => {
      const now = moment().utcOffset(1);
      if(result.length > 0) {
        const item = result[0];
        departureTime = moment(item.vertrekTijd).utcOffset(1);
        arrivalTime = moment(item.aankomstTijd).utcOffset(1);
        duration = arrivalTime.diff(departureTime, 'minutes');
        fromCity = item.vertrekVan;
        toCity = item.vertrekNaar;

        const responseText = {
          displayText: `The next Train from ${fromCity} to ${toCity} will leave at ${departureTime.format('HH:mm')}`,
          speech: `The train from ${fromCity} to ${toCity} will leave ${departureTime.fromNow()}`
        }

        let response = assistant.buildRichResponse().addSimpleResponse(responseText);

        // const card = <any>{};
        // card.title = `${departureTime.format('HH:mm')} - ${arrivalTime.format('HH:mm')} (${duration} minutes)`;
        // card.description = responseText.displayText;
        // card.imageUrl = 'https://lh3.googleusercontent.com/ZmvfZYkLd_hcas4uqPK9dZH945yMvvQg3o1wyABLl378vuaM1VHJ3kqjM6DwFNK1LzXao68_Oa8l5eyayjmzy4AxLmNjlU90lRUgdNyoItic7RAX6GAJJr22gYTWfN3-GA68xXMWQT6sminU2nzqsELJRy8kUW1-GS5bM7y93d-3ZOjXEAjAdj84vWiHub5noTHnzk15_RiN6nhvhc-qg2BO3_WOo3T2jrt8Ai_rxU9WderwgIG6gJhPDP7iQj3eefon4E4_FyRVDSN9bQfJc3QnKXRr9-fh-iNTKZHw9Db1wdPX9yZVc4-PgCITcgt3Z76SMYI56A89SVuFP7Q8YaSOvsRKBIsg1qFA2xs6kxy7vavw4lt6S6ebnJe8m2sMFOmvD1PRS8patw4bEpx80VTHYPQzi5wjhoy8tIu5RAvhpIQYxxtWDd_wNAEiLcbrDCIUBXq7o1y_HRqsHHzyx2RkfHsM5vLJo8eaRTFMpKA3tRH-Pi3XhkFU6pj-WOr151lns7c45gf3nifimrVl3Gz6kNBzdKSL_3BMRTpaKEZvmglHmmYVZtBgp3WZfaz8rA--r7nxUmQ4S8X4Orq_s4qL7xs4o1ZkMb0SU7Eo=w1920-h1080-no';
        // card.subtitle = `from ${fromCity}`;
        // card.buttonText = 'Go';
        // card.buttonUrl = 'http://youtube.com'

        let basicCard = BasicCard.fromReisplan(item)

        /*
        // Basic Card
        let basicCard = assistant.buildBasicCard(card.description)
          .setTitle(card.title)
          // .addButton(card.buttonText, card.buttonUrl)
          .setImage(card.imageUrl, card.title)
          .setImageDisplay('CROPPED');

          if (card.subtitle) {
            basicCard = basicCard.setSubtitle(card.subtitle);
          }
          */

          response = response.addBasicCard(basicCard.asBasicCard(assistant));

        return assistant.tell(response);
      } else {
        assistant.tell(`Sorry, couldn't find any train schedule from ${fromCity} to ${toCity} just now`);
      }

    })
    .catch( (error) => {
      console.log('error', error);
      assistant.tell(`Sorry, couldn't find any train schedule from ${fromCity} to ${toCity} just now`);
    });

}
