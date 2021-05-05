import firebaseconfig from './firebaseIndex'
import firebase from 'firebase'


export const authMethods = {

  signUp: (email,password, setToken, handleErrors) => {
    firebase.auth().createUserWithEmailAndPassword(email,password).then( (userCredential) => {
          var user = userCredential.user;
          const token = user.getIdToken();
          localStorage.setItem('token', token)
          setToken(window.localStorage.token)
      })
        .catch(err => {
          console.log(err.message)
          handleErrors(err.message)
        })
  },

  signIn: (email,password, setToken, handleErrors) => {
    firebase.auth().signInWithEmailAndPassword(email,password)
        .then((userCredential) => {
          var user = userCredential.user;
          const token = user.getIdToken();
          localStorage.setItem('token', token)
          setToken(window.localStorage.token)         
    })
    .catch(err => {
      console.error(err.message)
        handleErrors(err.message)
    })
  },

  logout: (setToken,handleErrors) => {
    firebase.auth().signOut().then( res => {
      localStorage.clear()
        setToken(null)
    })
    .catch(err => {
      console.error(err.message)
      handleErrors(err.message)
    })
  }

  
}