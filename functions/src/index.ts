import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

process.env.DEBUG = 'actions-on-google:*';

import { app } from './app';

exports.assistant = functions.region('europe-west1').https.onRequest(app);
