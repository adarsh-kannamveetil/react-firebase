import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyBhPygeR1pVMoCkuUEz6GCpStFMS783hHM",
    authDomain: "fun-food-friends-15d0f.firebaseapp.com",
    databaseURL: "https://fun-food-friends-15d0f.firebaseio.com",
    projectId: "fun-food-friends-15d0f",
    storageBucket: "",
    messagingSenderId: "849126407634"
};

firebase.initializeApp(config);

export const ref = firebase.database().ref()
export const provider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();
export const auth = firebase.auth();
export default firebase;
