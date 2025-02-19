import { registerRootComponent } from 'expo';

import App from './Main'; //This is to run the whole app
//import App from './testing/quizTesting'; //This is to run the quiz portion
//import App from './tabs/Profile'; //This is to run the profile portion
//import App from './testing/appTesting'; //This is to run the quiz home page
//import App from './tabs/Leaderboard'; //This is to run the leaderboard portion
//import App from './testing/resetPassword'; //This is to run the leaderboard portion

registerRootComponent(App);