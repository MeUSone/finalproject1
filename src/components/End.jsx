import React, {useContext, useState} from 'react';
import {firebaseAuth} from '../provider/AuthProvider'
import {withRouter} from 'react-router-dom'
import { auth } from 'firebase';
import { Button } from '@material-ui/core';
import {Link} from 'react-router-dom'
import {Grid} from '@material-ui/core'
import firebase from 'firebase'

const End = (props) => {
  //const {user,setUser, } = useContext(firebaseAuth)
  //setUser({email: '', password: '',points:localStorage.getItem('points')});
  return (
    <div>
      <Grid container spacing={0} direction="column" alignItems="center" style={{ minHeight: '100vh' }}>
      <h1>Bye</h1>
      </Grid>
    </div>)
};




export default withRouter(End);