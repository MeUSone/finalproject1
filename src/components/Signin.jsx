import React, {useContext, useState} from 'react';
import {firebaseAuth} from '../provider/AuthProvider';
import {Link} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import { Button, Grid } from '@material-ui/core';
import { Input } from '@material-ui/core';


const Signin = props => {
    const {
            user, 
            setUser, 
            handleSignin, 
            setErrors, 
            errors
          } = useContext(firebaseAuth)

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    handleSignin()
    setUser({email: '', password: '',points:user.points})
    localStorage.setItem('points',user.points);
    localStorage.setItem('User',JSON.stringify(user));
  }
  const handleChange = (e) => {
    const {name, value} = e.target
      setUser(prev => ({...prev,[name]: value }))
        setErrors([])
  }
  return (

    <div>
      <Grid container spacing={0} direction="column" alignItems="center" style={{ minHeight: '100vh' }}>
      <h1>Welcome to blackJack game</h1>
      <br></br>
        <Grid onSubmit={handleSubmit}>
          <Input placeholder="email" onChange={handleChange} name='email' value={user.email}  />
          <br></br>
          <Input placeholder="password" onChange={handleChange} name='password' value={user.password}  />
          <br></br>
          <Button onClick={handleSubmit}>login</Button>
          {errors.length > 0 && errors.map(err => <p style={{color: 'red'}}>{err}</p>)}
          <br></br>
          <Link to='/signup'>Don't have an account?</Link>
        </Grid>
      </Grid>
    </div>
  );
};

export default withRouter(Signin);

