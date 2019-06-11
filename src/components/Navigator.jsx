import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export default class Navigator extends Component {
    constructor() {
        super();
        this.state = {};
    }

    async componentDidMount() {
        await this.geta();
    }

    geta = async () => {
        const a = new Set([1, 1, 3, 4]);
        console.log("TCL: Navigator -> geta -> a", a);
        await 1;
    };

    render() {
        return (
          <div>
            <NavLink to="/">Home</NavLink>
          </div>
        );
    }
}
