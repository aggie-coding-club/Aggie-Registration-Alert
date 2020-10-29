import React, { Component } from "react";
import { Link } from "react-router-dom";

class Landing extends Component {
    render() {
        return (
            <div className="landingMain container valign-wrapper">
                <div className="row">
                    <div className="col s12 center-align">
                        <p className="blurb flow-text grey-text text-darken-1">
                            Use Aggie Registration Alert to be notified when filled classes become available!
                        </p>
                        <br />
                        <div className="col s6">
                            <Link
                                to="/register"
                                className="registerBtn btn btn-large waves-effect waves-light hoverable blue accent-3"
                            >
                                Register
                            </Link>
                        </div>
                        <div className="col s6">
                            <Link
                                to="/login"
                                className="lightBtn btn btn-large waves-effect waves-light hoverable  accent-3"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Landing;