import React, {useContext, useState} from 'react';
import {firebaseAuth} from '../provider/AuthProvider';
import {Link} from 'react-router-dom'
import { Button } from '@material-ui/core';
import { Input } from '@material-ui/core';
import { Container } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import firebase from 'firebase';

const Signup = props => {
  
    const {
      handleSignup,
      user,
      setUser,
      setErrors, 
      errors
            } = useContext(firebaseAuth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    handleSignup()
    setUser({email: '', password: '',points:user.points})
    localStorage.setItem('User',JSON.stringify(user));
    var starCountRef = firebase.database().ref('posts/' + user.uid + '/starCount');
    starCountRef.get('value', (snapshot) => {
      localStorage.setItem('points',snapshot.child('points'));
  });
  }
  const handleChange = (e) => {
    const {name, value} = e.target
    setUser(prev => ({...prev,[name]: value }))
    setErrors([])
  }
  return (
    <Grid container spacing={0} direction="column" alignItems="center" style={{ minHeight: '100vh' }}>
      <h1>Welcome to blackJack game</h1>
      <br></br>
        <Grid item xs={3} onSubmit={handleSubmit}>
              <Input placeholder="email" onChange={handleChange} name='email' value={user.email}  />
              <br></br>
              <Input placeholder="password" onChange={handleChange} name='password' value={user.password}  />
              <br></br>
              <Button onClick={handleSubmit}>Sign Up</Button>
              {errors.length > 0 && errors.map(err => <p style={{color: 'red'}}>{err} </p>)}
              <br></br>
              <Link to='/login'>Already have an account?</Link>
        </Grid>
    </Grid>
  );
};

export default Signup;

