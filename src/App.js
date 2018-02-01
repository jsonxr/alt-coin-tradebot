import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as GTT from 'gdax-trading-toolkit';


const logger = GTT.utils.ConsoleLoggerFactory();

const products = ['BTC-USD', 'ETH-USD', 'LTC-USD'];
GTT.Factories.GDAX.FeedFactory(logger, products).then((feed) => {
  feed.on('data', (msg) => {
    console.log(msg);
  });
});

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
