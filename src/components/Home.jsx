import React, {useContext} from 'react';
import {firebaseAuth} from '../provider/AuthProvider'
import {withRouter} from 'react-router-dom'
import { auth } from 'firebase';
import { Button } from '@material-ui/core';
import {Link} from 'react-router-dom'
import {Grid} from '@material-ui/core'
import firebase from 'firebase'

const Home = (props) => {
  const {authMethods, setToken, errors, handleErrors,user} = useContext(firebaseAuth);
  return (
    <div>
      <Grid container spacing={0} direction="column" alignItems="center" style={{ minHeight: '100vh' }}>
      <h1>Welcome</h1>
      <h2>You now have {localStorage.getItem('points')}points</h2>
      <Link to={{pathname:"/blackjack",state: { uid: user.uid }}}>Click here to play blackjack!</Link>
      <br></br>
      <Button onClick={() => authMethods.logout(setToken, handleErrors)}>logout</Button>
      </Grid>
    </div>)
};

window.onload = function() {
  if(! window. location. hash) {
  window. location = window. location + '#loaded';
  window. location. reload();
  }
}  



export default withRouter(Home);