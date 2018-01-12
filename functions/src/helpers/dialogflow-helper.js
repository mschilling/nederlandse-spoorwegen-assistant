'use strict';

require('dotenv').config({silent: true});

const axios = require('axios');

const BASE_URL = 'https://api.dialogflow.com/v1/';
const ACCESS_TOKEN = process.env.DF_API_TOKEN;

const client = axios.create({
  baseURL: BASE_URL,
  // timeout: 1000,
  headers: {'Authorization': 'Bearer ' + ACCESS_TOKEN}
});


class DialogFlowManager {

  static getEntities(id) {
    return client.get('/entities?v=20170712&lang=en')
      .then((response) => {
        return response.data;
      });
  }

  static getEntity(entityId) {
    return client.get(`/entities/${entityId}?v=20170712&lang=en`)
      .then((response) => {
        return response.data;
      });
  }

  static updateEntityEntries(entityId, data) {

    return client.put(`/entities/${entityId}/entries?v=20170712&lang=en`, data)
      .then((response) => {
        const items = response.data || [];
        // console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

}

module.exports = DialogFlowManager;
