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
  actionMap.set(Actions.ACTION_AVT, avt);
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

        let basicCard = BasicCard.fromReisplan(item).asBasicCard(assistant);
        response = response.addBasicCard(basicCard);

        /*
        let options = assistant.buildCarousel();
        for( let i=1; i < result.length; i++) {
          const carouselOption = BasicCard.fromReisplan(result[i]).asCarouselOption(assistant);
          options = options.addItems(carouselOption);
        }
        return assistant.askWithCarousel(response, options);
        */

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

function avt(assistant) {
  let fromCity = assistant.getArgument('from-city');
  let fromStation = assistant.getArgument('from-station');

  let departureTime;
  let arrivalTime;
  let duration;

  const params = {
    fromStation: fromStation || fromCity
  };

  return nsApi.vertrektijden(params)
    .then((result) => {
      const now = moment().utcOffset(1);
      if(result.length > 0) {
        const item = result[0];
        // departureTime = moment(item.vertrekTijd).utcOffset(1);
        // arrivalTime = moment(item.aankomstTijd).utcOffset(1);
        // duration = arrivalTime.diff(departureTime, 'minutes');
        // fromCity = item.vertrekVan;
        // toCity = item.vertrekNaar;

        const responseText = {
          displayText: `Here are some results`,
          speech: `Here are some actual departures.`
        }

        let response = assistant.buildRichResponse().addSimpleResponse(responseText);

        // let basicCard = BasicCard.fromReisplan(item).asBasicCard(assistant);
        // response = response.addBasicCard(basicCard);
        // return assistant.tell(response);

        let options = assistant.buildList(`Actual Departures`);
        for( let i=1; i < result.length; i++) {
          const option = BasicCard.fromAvt(result[i]).asListOption(assistant);
          options = options.addItems(option);
        }
        return assistant.askWithList(response, options);

      } else {
        assistant.tell(`Sorry, couldn't find any train schedule just now`);
      }

    })
    .catch( (error) => {
      console.log('error', error);
      assistant.tell(`Sorry, couldn't find any train schedule just now`);
    });

}
