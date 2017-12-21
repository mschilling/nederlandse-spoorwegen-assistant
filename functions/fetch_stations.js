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

  obj.synonyms.push(data.Code);

  obj.synonyms.push(data.Namen.Kort);

  if(data.Namen.Middel !== data.Namen.Kort) {
    obj.synonyms.push(data.Namen.Middel)
  }

  if(data.Namen.Lang !== data.Namen.Kort) {
    obj.synonyms.push(data.Namen.Lang)
  }

  return obj;
}

