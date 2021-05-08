import React, { Component, useRef,useState } from 'react';
import {withRouter} from 'react-router-dom'
import { auth } from 'firebase';
import firebase from 'firebase';
import GooglePayButton from '@google-pay/button-react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import 'bootstrap/dist/css/bootstrap.css';

class BlackJack extends Component {
  constructor(props) {
      super(props);
      this.state = {
        deck: [],
        dealer: null,
        player: null,
        points: 0,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null,
        joke:'',
        background:'',
      };
      if(firebase.auth().currentUser!=null){
      localStorage.setItem('uid',firebase.auth().currentUser.uid);}
      this.uid=localStorage.getItem('uid')
  
      firebase.database().ref('users/' + this.uid).get().then((snapshot) => {
        this.setState({points:snapshot.child('points').val()});
        this.setState({background:snapshot.child('background').val()});
      });
  }
  generateDeck(){
      const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
      const suits = ['♦','♣','♥','♠'];
      const deck = [];
      for(let a =0;a<cards.length;a++){
          for(let b=0;b<suits.length;b++){
              deck.push({number:cards[a],suit:suits[b]})
          }
      }
      return deck;
  }
  getRandomCard(deck){
      const randomNumber=Math.floor(Math.random()*deck.length);
      const randomCard=deck[randomNumber];
      deck.slice(randomNumber,1);
      return ({randomCard: randomCard,updateDeck:deck});
  }
  getSum(hand){
      let ones=[]
      let sum=0;
      for(let a =0;a<hand.length;a++){
          if(hand[a].number=="A"){
              ones.push(hand[a].number);
          }
          else if(hand[a].number=="J"||hand[a].number=="Q"||hand[a].number=="K"){
              sum+=10;
          }
          else{
              sum+=hand[a].number;
          }
      }
      for(let b=0;b<ones.length;b++){
          if(sum+11<=21){
              sum=sum+11;
          }else{
              sum=sum+1;
          }
      }
      return sum;
  }

  generateStartHand(deck){
      const playerCard1=this.getRandomCard(deck);
      const dealerCard1=this.getRandomCard(playerCard1.updateDeck);
      const playerCard2=this.getRandomCard(dealerCard1.updateDeck);
      const playerStartHand=[playerCard1.randomCard,playerCard2.randomCard];
      const dealerStartHand=[dealerCard1.randomCard];
      const player={cards:playerStartHand,sum:this.getSum(playerStartHand)};
      const dealer={cards:dealerStartHand,sum:this.getSum(dealerStartHand)};
      return {updateDeck:playerCard2.updateDeck,player:player,dealer:dealer};
  }

  startNewGame(){
      if(this.state.points<0){
          this.setState({message:'Not enough points! Click to add 10000 points' });
      }else{
          const deck=this.generateDeck();
          const {updateDeck,player,dealer }=this.generateStartHand(deck);
          this.setState({
              deck:updateDeck,
              dealer:dealer,
              player:player,
              points:this.state.points,
              inputValue: '',
              currentBet: null,
              gameOver: false,
              message: null
          });
      }
  }

  dealerDraw(dealer,deck){
      const {randomCard,updateDeck}=this.getRandomCard(deck);
      dealer.cards.push(randomCard);
      console.log(randomCard+ " dealer cards")
      dealer.sum=this.getSum(dealer.cards);
      return {dealer,updateDeck};
  }

  hit(){
      if(this.state.gameOver!=true){
          if (this.state.currentBet!=null) {
              const { randomCard, updateDeck }=this.getRandomCard(this.state.deck);
              this.state.player.cards.push(randomCard);
              this.state.player.sum=this.getSum(this.state.player.cards);
              if (this.state.player.sum > 21) {
                this.setState({gameOver:true,message:'BUSTED! You lose' });
              } else {
                this.setState({deck:updateDeck});
              }
            } else {
              this.setState({ message:'Please place bet.'});
            }
      }else{
          this.setState({message:'Game over! Start a new one.'});
      }
  }
  stand(){
      if (this.state.gameOver!=true) {
        if (this.state.currentBet!=null) {
          const randomCard=this.getRandomCard(this.state.deck);
          let deck=randomCard.updateDeck;
          this.state.dealer.cards.push(randomCard.randomCard);
          this.state.dealer.sum=this.getSum(this.state.dealer.cards);
          while(this.state.dealer.sum< 17) {
            console.log(deck+ " deck1")
            const newDraw = this.dealerDraw(this.state.dealer,deck);
            this.state.dealer=newDraw.dealer;
            deck=newDraw.updateDeck;
          }
          if (this.state.dealer.sum>21) {
            this.setState({
              deck,
              points:this.state.points + this.state.currentBet * 2,
              gameOver:true,
              message:'Dealer busted! You win!'
            });
            this.writeUserData(this.state.points + this.state.currentBet * 2);
          } else {
            const winner = this.getWinner(this.state.dealer,this.state.player);
            let points= this.state.points;
            let message="";
            if (winner=='dealer') {
              message = 'Dealer wins';
            } else if (winner=='player') {
              points += this.state.currentBet * 2;
              message='You win!';
            } else {
              points += this.state.currentBet;
              message = 'Tie';
            } 
            this.setState({
              deck, 
              points,
              gameOver: true,
              message
            });
            this.writeUserData(points);
          } 
        }else {
          this.setState({ message:'Please place bet.'});
        }
      } else {
          this.setState({message:'Game over! Start a new one.' });
        }
  }

  getWinner(dealer,player){
      if(dealer.sum>player.sum){
          return "dealer"
      }else if(dealer.sum<player.sum){
          return "player"
      }else{
          return "tie"
      }
  }

  placePoints() {
      if (this.state.inputValue>this.state.points) {
        this.setState({message:'No enough points' });
      } else {
        const points = this.state.points - this.state.inputValue;
        this.setState({ points, inputValue: '', currentBet:this.state.inputValue});
        this.writeUserData(points);
      }
  }

  inputChange(e) {
      this.setState({inputValue:e.target.value});
  }

  handleKeyDown(e) {
      if (e.keyCode==13) {
        this.placePoints();
      }
    }
  componentWillMount() {
      this.startNewGame();
      const body = document.querySelector('body');
      body.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  writeUserData(p) {
      firebase.database().ref('users/' +this.uid).update({
        points: p,
      });
  }
  
  writeUserBackground() {
      firebase.database().ref('users/' +this.uid).update({
        background: this.state.background,
      });
  }
  getCuratedPhotos = async () => {
      const res = await fetch(
        `https://api.pexels.com/v1/curated`,
        {
          headers: {
            Authorization: '563492ad6f9170000100000136192ba9abb74806b058703428b5381d',
          },
        }
      );
      const responseJson = await res.json();
      //this.backgroundColor=responseJson.photos[Math.floor(Math.random() * 16)].src.large;
      let x=responseJson.photos[Math.floor(Math.random() * 12)].src.large;
      this.setState({background:x});
      return x;
  };
    
  generateJoke = async () => {
    {
      const res = await fetch("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      })
      const responseJson = await res.json();
        this.setState({joke:responseJson.joke});
    }
  }
  paymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"]
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example"
            }
          }
        }
      ],
      merchantInfo: {
        merchantId: "BCR2DN6TV735H73B",
        merchantName: "Demo Merchant"
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPriceLabel: "Total",
        totalPrice: "100.00",
        currencyCode: "USD",
        countryCode: "US"
      }
  };
  
  render() {   
      return (
        <div style={{
          backgroundImage: `url(${this.state.background})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          height: '100vh'
        }}>
        <div style={{
          backgroundColor:"white",
          height:"95%",
          width:"80%"
        }}  class="container">
          <div style={{display: 'flex',justifyContent:'center', alignItems:'center'}}>
            <h1>BlackJack</h1>
          </div>
          <div>
          <Button variant="outline-dark" onClick={() => {this.startNewGame()}}>New Game</Button>{' '}
            <Button variant="outline-dark" onClick={() => {this.setState({points:this.state.points+10000}); this.writeUserData(this.state.points+10000)}}>Click to add 10000 points</Button>{' '}
            <Button variant="outline-dark" onClick={() => {this.hit()}}>Hit</Button>{' '}
            <Button variant="outline-dark" onClick={() => {this.stand()}}>Stand</Button>{' '}
          <div style={{float: 'right'}}>
            <Button variant="outline-dark" onClick={() => {this.getCuratedPhotos()}}>Random background</Button>{' '}
            <Button variant="outline-dark"  onClick={() => {this.writeUserBackground()}}>Save background</Button>{' '}
            <Button variant="outline-dark"  onClick={() => {this.generateJoke()}}>Get a Joke</Button>{' '}
            <Button variant="outline-dark"  onClick={() => {firebase.auth().signOut().then( res => {
              localStorage.clear();
              window.location.reload();
            })}}>logout</Button>{' '}
          </div>
          </div>
          <Card border="secondary">
            <div class="card text-center">
            <p>{this.state.joke}</p>
            </div>
          </Card>
          <div class="mx-auto" style={{width: "200px",height: "400px"}}>
          <h3>Points: ${ this.state.points }</h3>
          {
            !this.state.currentBet ? 
            <div className="input-bet">            
              <form>
                <input type="text" name="bet" placeholder="" value={this.state.inputValue} onChange={this.inputChange.bind(this)}/>
              </form>
              <Button variant="outline-dark" onClick={() => {this.placePoints()}}>Place points</Button>
            </div>
            : null
          }
          <h3>Your Hand ({ this.state.player.sum })</h3>
          <container style={{display: 'flex', flexDirection: 'row', width:"500px"}}>
           { this.state.player.cards.map((card, i) => {
              return <Poker key={i} number={card.number} suit={card.suit}/>
            }) }
        </container>
          <h3>Dealer Hand ({ this.state.dealer.sum })</h3>
          <container style={{display: 'flex', flexDirection: 'row', width:"500px"}}>
           { this.state.dealer.cards.map((card, i) => {
              return <Poker key={i} number={card.number} suit={card.suit}/>
            }) }
        </container>
          <p>{ this.state.message }</p>
         </div>
          <div>
          <p>If you win, you get twice the bet points. If it is a tie,</p> 
          <p>you do not lose any points. If you lose, you lose the </p>
          <p>bet points.</p>
           <GooglePayButton paymentRequest={this.paymentRequest} onLoadPaymentData={paymentRequest => { console.log("load payment data", paymentRequest);}}/>
            <h3>Click to donate!</h3>
        </div>
        </div>
        </div>
      );
    }
  };
  const Poker = ({ number, suit }) => {
    var color = (suit == '♦' || suit == '♥') ? "text-danger" : "text-dark";
    var color1=color+" card-body align-items-center d-flex justify-content-center"
    return (
      <Card style={{width: "100px",height: "150px"}}>
      <Card.Title class={color}>{number}{suit}</Card.Title>
      <Card.Text class={color1}>{number}{suit}</Card.Text>
      </Card>
    );
  };
  export default withRouter(BlackJack);
  
  