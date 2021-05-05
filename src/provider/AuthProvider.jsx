import React, {useState} from 'react';
import firebase from '../firebase/firebaseIndex'
import {authMethods} from '../firebase/authmethod'
import {withRouter} from 'react-router-dom' 


export const firebaseAuth = React.createContext()

const AuthProvider = (props) => {
  const initstate = {
    email: '',
    password: '',
  }
  const [user, setUser] = useState(initstate)
  const [errors, setErrors] = useState([])
  const [token, setToken] = useState(null)

  console.log('errors',errors)

  const handleErrors = (arg) => {
    const filterErrors = new Set([...errors, arg])
    const backToArray = [...filterErrors]
    setErrors(backToArray)
    
  }
  

  const handleSignup = async () => {
    await authMethods.signUp(user.email, user.password, setToken, handleErrors)
      props.history.push('/')
}

  const handleSignin = async () =>  {
    await authMethods.signIn(user.email, user.password, setToken, handleErrors)
      props.history.push('/')
  }

  const handleSignOut = () => {
    authMethods.logout(setToken, handleErrors)
  }





  
  
  return (
    <firebaseAuth.Provider value={{
      setToken,
      errors,
      setErrors,
      user,
      setUser,
      handleSignup,
      handleSignin,
      authMethods,
      handleSignOut,
      
    }}>
      {props.children}
    </firebaseAuth.Provider>
  );
};

export default withRouter(AuthProvider);