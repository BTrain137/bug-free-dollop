import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

import StorePage from './pages/StorePage';
import ZipcodePage from './pages/ZipcodePage';
import SurpriseAndDelight from './pages/SurpriseAndDelight';
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Fitlife App</p>
        <Nav>
          <Nav.Item>
            <Nav.Link href="/store">Store</Nav.Link>
            <Nav.Link href="/zipcodes">Zipcode</Nav.Link>
            <Nav.Link href="/s-and-d">Surprise And Delight</Nav.Link>
          </Nav.Item>
        </Nav>
      </header>
      <main>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/store" component={StorePage} />
            <Route exact path="/zipcodes" component={ZipcodePage} />
            <Route exact path="/s-and-d" component={SurpriseAndDelight} />
          </Switch>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
