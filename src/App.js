import React, {useContext, useState} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom'
import {firebaseAuth} from './provider/AuthProvider';
import Home from './components/Home'
import Signup from './components/Signup'
import Signin from './components/Signin'
import BlackJack from './components/BlackJack';
import End from './components/End'


const App = props => {
  const {token} = useContext(firebaseAuth)
  console.log(localStorage.getItem('token'))

  
  return (
      <Switch>
        <Route exact path='/' 
          render={ rProps => localStorage.getItem('token') !== null 
            ?
              <Home /> 
            : 
              <Redirect to='/login' />} 
                />
        <Route path='/blackjack' 
          render={ rProps => localStorage.getItem('token') !== null 
            ?
              <BlackJack /> 
            : 
              <Redirect to='/End' />} 
                />
        <Route path='/login' 
          render={rProps => localStorage.getItem('token') === null 
          ?
            <Signin />
          :
          <Redirect to={{pathname: '/', state:{ User: localStorage.getItem('uid')}}} />
        } 
            />
        
        <Route exact path='/signup' 
          render={rProps => localStorage.getItem('token') === null 
          ?
            <Signup />
          :
          <Redirect to='/' />}
            />
        <Route exact path="/blackjack" component={BlackJack} />
        <Route exact path="/End" component={End} />
      </Switch>
  );
};
export default App;

