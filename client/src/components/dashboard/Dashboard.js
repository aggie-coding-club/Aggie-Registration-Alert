import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import DummySelection from "./DummySelection"


import ClassSearch from "./ClassSearch"

class Dashboard extends Component {
  constructor() {
      super()
      this.state = {
          search: ""
      }
  }

  updateSearch(event) {
    this.setState({search: event.target.value.substr(0, 20)})
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    const { user } = this.props.auth;

    return (
      <div className="container flex-no-shrink">
        <input type="text"
               value={this.state.search}
               onChange={this.updateSearch.bind(this)}
               placeholder="Search for a Course"
               style={{width: "20%"}}
               />

        <div className="row flex-section">
          <div className="searchBar landing-copy col s4 flex-col-scroll" id="left">
              <ClassSearch search={this.state.search} />
          </div>

          <div className="sectionSelection landing-copy col s4 center-align flex-col-scroll" id="middle">

              <ul>
                  <DummySelection />
              </ul>
          </div>

          <div className="landing-copy col s4 center-align flex-col-scroll" id="right">
            <h6>
              <b>Hey there,</b> {user.name.split(" ")[0]}
            </h6>
            <button
              style={{
                width: "150px",
                borderRadius: "3px",
                letterSpacing: "1.5px",
                marginTop: "1rem"
              }}
              onClick={this.onLogoutClick}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard);
