import React, { Component, useRef,useState } from 'react';
import {withRouter} from 'react-router-dom'
import { auth } from 'firebase';
import firebase from 'firebase';
import GooglePayButton from '@google-pay/button-react';



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

  generateDeck() {
    const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    const suits = ['♦','♣','♥','♠'];
    const deck = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        deck.push({number: cards[i], suit: suits[j]});
      }
    }
    return deck;
  }
  
  dealCards(deck) {
    const playerCard1 = this.getRandomCard(deck);
    const dealerCard1 = this.getRandomCard(playerCard1.updatedDeck);
    const playerCard2 = this.getRandomCard(dealerCard1.updatedDeck);    
    const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
    const dealerStartingHand = [dealerCard1.randomCard, {}];
    
    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand)
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand)
    };
    
    return {updatedDeck: playerCard2.updatedDeck, player, dealer};
  }

  startNewGame(type) {
    if (type === 'continue') {
      if (this.state.points > 0) {
        const deck = (this.state.deck.length < 10) ? this.generateDeck() : this.state.deck;
        const { updatedDeck, player, dealer } = this.dealCards(deck);

        this.setState({
          deck: updatedDeck,
          dealer,
          player,
          currentBet: null,
          gameOver: false,
          message: null
        });
      } else {
        this.setState({ message: 'Game over! Click to add 10000 points' });
      }
    } else {
      const deck = this.generateDeck();
      const { updatedDeck, player, dealer } = this.dealCards(deck);

      this.setState({
        deck: updatedDeck,
        dealer,
        player,
        points:this.state.points,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null
      });
    }
  }
       
  getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = Math.floor(Math.random() * updatedDeck.length);
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return { randomCard, updatedDeck };
  }
  
  placepoints() {
    const currentBet = this.state.inputValue;

    if (currentBet > this.state.points) {
      this.setState({ message: 'Not enough points' });
    } else {
      const points = this.state.points - currentBet;
      this.setState({ points, inputValue: '', currentBet });
      this.writeUserData(points);
    }
  }
  
  hit() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        const { randomCard, updatedDeck } = this.getRandomCard(this.state.deck);
        const player = this.state.player;
        player.cards.push(randomCard);
        player.count = this.getCount(player.cards);

        if (player.count > 21) {
          this.setState({ player, gameOver: true, message: 'BUST!' });
        } else {
          this.setState({ deck: updatedDeck, player });
        }
      } else {
        this.setState({ message: 'Please place bet.' });
      }
    } else {
      this.setState({ message: 'Game over! Start a new game.' });
    }
  }
  
  dealerDraw(dealer, deck) {
    const { randomCard, updatedDeck } = this.getRandomCard(deck);
    dealer.cards.push(randomCard);
    dealer.count = this.getCount(dealer.cards);
    return { dealer, updatedDeck };
  }
  
  getCount(cards) {
    const rearranged = [];
    cards.forEach(card => {
      if (card.number === 'A') {
        rearranged.push(card);
      } else if (card.number) {
        rearranged.unshift(card);
      }
      
      
    });
    
    return rearranged.reduce((total, card) => {
      if (card.number === 'J' || card.number === 'Q' || card.number === 'K') {
        return total + 10;
      } else if (card.number === 'A') {
        return (total + 11 <= 21) ? total + 11 : total + 1;
      } else {
        return total + card.number;
      }
    }, 0);
  }
  
  stand() {
    if (!this.state.gameOver) {
      // Show dealer's 2nd card
      const randomCard = this.getRandomCard(this.state.deck);
      let deck = randomCard.updatedDeck;
      let dealer = this.state.dealer;
      dealer.cards.pop();
      dealer.cards.push(randomCard.randomCard);
      dealer.count = this.getCount(dealer.cards);

      // Keep drawing cards until count is 17 or more
      while(dealer.count < 17) {
        const draw = this.dealerDraw(dealer, deck);
        dealer = draw.dealer;
        deck = draw.updatedDeck;
      }

      if (dealer.count > 21) {
        this.setState({
          deck,
          dealer,
          points: this.state.points + this.state.currentBet * 2,
          gameOver: true,
          message: 'Dealer bust! You win!'
        });
        this.writeUserData(this.state.points + this.state.currentBet * 2);
      } else {
        const winner = this.getWinner(dealer, this.state.player);
        let points= this.state.points;
        let message;
        
        if (winner === 'dealer') {
          message = 'Dealer wins...';
        } else if (winner === 'player') {
          points += this.state.currentBet * 2;
          message = 'You win!';
        } else {
          points += this.state.currentBet;
          message = 'Push.';
        }
        
        this.setState({
          deck, 
          dealer,
          points,
          gameOver: true,
          message
        });
        this.writeUserData(points);
      } 
    } else {
      this.setState({ message: 'Game over! Please start a new game.' });
    }
  }
  
  getWinner(dealer, player) {
    if (dealer.count > player.count) {
      return 'dealer';
    } else if (dealer.count < player.count) {
      return 'player';
    } else {
      return 'push';
    }
  }
  
  inputChange(e) {
    const inputValue = +e.target.value;
    this.setState({inputValue});
  }
  
  handleKeyDown(e) {
    const enter = 13;
    console.log(e.keyCode);
    
    if (e.keyCode === enter) {
      this.placepoints();
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
    console.log(this.state.background);
    return x;
  };
  
generateJoke = async () => {
  {
    fetch("https://icanhazdadjoke.com/", {
      method: "GET",
      headers: {
        Accept: "application/json" // Get JSON data
      }
    })
      .then(response => response.json())
      .then(json => {
        this.setState({joke:json.joke});
      });
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
    
    let dealerCount;
    const card1 = this.state.dealer.cards[0].number;
    const card2 = this.state.dealer.cards[1].number;
    if (card2) {
      dealerCount = this.state.dealer.count;
    } else {
      if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        dealerCount = 10;
      } else if (card1 === 'A') {
        dealerCount = 11;
      } else {
        dealerCount = card1;
      }
    }
  
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
      }}>
        <div className="buttons">
          <button onClick={() => {this.startNewGame()}}>New Game</button>
          <button onClick={() => {this.hit()}}>Hit</button>
          <button onClick={() => {this.stand()}}>Stand</button>
          <button onClick={() => {firebase.auth().signOut().then( res => {
            localStorage.clear();
            window.location.reload();
          })}}>logout</button>
          <button onClick={() => {this.getCuratedPhotos()}}>Change random background</button>
          <button onClick={() => {this.writeUserBackground()}}>Save background</button>
          <button onClick={() => {this.generateJoke()}}>Joke</button>
        </div>
          <p>{this.state.joke}</p>
        <p>Points: ${ this.state.points }</p>
        {
          !this.state.currentBet ? 
          <div className="input-bet">            
            <form>
              <input type="text" name="bet" placeholder="" value={this.state.inputValue} onChange={this.inputChange.bind(this)}/>
            </form>
            <button onClick={() => {this.placepoints()}}>Place points</button>
          </div>
          : null
        }
        {
          this.state.gameOver ?
          <div className="buttons">
            <button onClick={() => {this.startNewGame('continue')}}>Continue</button>
          </div>
          : <div className="buttons">
          <button onClick={() => {this.setState({points:this.state.points+10000}); this.writeUserData(this.state.points+10000)}}>Click to add 10000 points</button>
        </div>
        }
        <p>Your Hand ({ this.state.player.count })</p>
        <table className="cards">
          <tr>
            { this.state.player.cards.map((card, i) => {
              return <Card key={i} number={card.number} suit={card.suit}/>
            }) }
          </tr>
        </table>
        
        <p>Dealer's Hand ({ this.state.dealer.count })</p>
        <table className="cards">
          <tr>
            { this.state.dealer.cards.map((card, i) => {
              return <Card key={i} number={card.number} suit={card.suit}/>;
            }) }
          </tr>
        </table>
        
        <p>{ this.state.message }</p>
        <div>
         <GooglePayButton paymentRequest={this.paymentRequest} onLoadPaymentData={paymentRequest => { console.log("load payment data", paymentRequest);}}/>
          <h1>Click to donate!</h1>
      </div>
      </div>
      </div>
    );
  }
};

const Card = ({ number, suit }) => {
  const combo = (number) ? `${number}${suit}` : null;
  const color = (suit === '♦' || suit === '♥') ? 'card-red' : 'card';
  
  return (
    <td>
      <div className={color}>
        { combo }
      </div>
    </td>
  );
};
export default withRouter(BlackJack);

