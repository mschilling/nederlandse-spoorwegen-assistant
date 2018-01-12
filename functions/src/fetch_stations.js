'use strict';

const nsApi = require('./helpers/ns-helper');
const dialogFlow = require('./helpers/dialogflow-helper');

const stations = [];

nsApi.stations()
  .then( data => {

    for( let item in data) {
      if(data[item].Land === 'NL') {
        let obj = wrap(data[item]);
        if(obj) {
          stations.push(obj)
        }
      }
    }
  })
  .then( () => {
    console.log(JSON.stringify(stations, null, '\t'));
  })
  .catch( error => {
    console.log(error);
  })


function wrap(data) {

  const obj = {
    value: data.Code,
    synonyms: []
  }

  let items = [];
  items.push(data.Code);
  items.push(data.Namen.Kort);
  items.push(data.Namen.Middel)
  items.push(data.Namen.Lang)
  items.push(data.Namen.Lang.replace(' Centraal', ' Central'))
  items.push(data.Namen.Lang.replace(' Centraal', ''))
  items.push(data.Namen.Lang.replace(' Centrum', ' Centre'))
  items.push(data.Namen.Lang.replace(' Centrum', ''))

  for (let i=0; i<items.length; i++) {
    if(obj.synonyms.indexOf(items[i]) === -1) {
      obj.synonyms.push(items[i]);
    }
  }
  return obj;
}

