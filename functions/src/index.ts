import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import nlData from './locales/nl-NL.json'; // include languages
import enData from './locales/en-US.json'; // include languages

process.env.DEBUG = 'actions-on-google:*';

import { app } from './app';

exports.assistant = functions.https.onRequest(app);
