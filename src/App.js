import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import Navigator from "./components/Navigator";
import Home from './views/Home'

export default class R extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
          <Router>
            <Navigator />
            <Route component={Home} />
          </Router>
        );
    }
}
