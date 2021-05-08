import React, {useContext, useState} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom'
import {firebaseAuth} from './provider/AuthProvider';
import Home from './components/Home'
import Signup from './components/Signup'
import Signin from './components/Signin'
import BlackJack from './components/BlackJack';



const App = props => {
  const {token} = useContext(firebaseAuth)

  
  return (
      <Switch>
        <Route exact path='/' 
          render={ rProps => localStorage.getItem('token') !== null 
            ?
              <BlackJack /> 
            : 
              <Redirect to='/login' />} 
                />
        <Route path='/login' 
          render={rProps => localStorage.getItem('token') === null 
          ?
            <Signin />
          :
          <Redirect to='/' />
        } 
            />
        
        <Route exact path='/signup' 
          render={rProps => localStorage.getItem('token') === null 
          ?
            <Signup />
          :
          <Redirect to='/' />}
            />
        <Route exact path="/" component={BlackJack} />
      </Switch>
  );
};
export default App;

