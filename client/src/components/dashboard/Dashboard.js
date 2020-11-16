import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import axios from 'axios'


import ClassSearch from "./ClassSearch"
import CoursesList from "./CoursesList"
import SectionsList from "./SectionsList";

class Dashboard extends Component {
    constructor() {
        super()
        this.state = {
            search: "",
            courses: [],
            sections: [],
            loading: false
        }
    }

    componentDidMount = () => {
        this.getCourses()
    }

    updateSearch(event) {
        this.setState({search: event.target.value.substr(0, 20)})
    }

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    getCourses = () => {
        axios.get('/api/users/' + this.props.auth.user.id)
            .then((response) => {
                this.setState({ courses: response.data.courses })
            })
            .catch((error) => {
                console.log(error)
            })
    }

    getSections = (course) => {
        this.setState( {loading: true })
        const courseObject = { "course": course }
        axios.post('/api/users/get_section', courseObject)
            .then((response) => {
                //console.log(response.data)
                if (response.data.length === 0)
                    this.setState( {sections: [], loading: false} )
                else {
                    let sections = response.data.replace(/'/g, '"')
                    let array_sections = JSON.parse("[" + sections + "]")
                    this.setState( {sections: array_sections, loading: false} )
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    addCourse = (course, index) => {
        const courseObject = { "course": course }
        console.log(courseObject)
        axios.post('/api/users/add/' + this.props.auth.user.id, courseObject)
            .then((response) => {
                let courses = this.state.courses.slice()
                courses.push(course)
                this.setState( {courses} )
                console.log(response)
            })
            .catch(err => {
                console.log(err)
            })
    }

    deleteCourse = (course, index) => {
        const courseObject = { "course": course }
        axios.post('/api/users/remove/' + this.props.auth.user.id, courseObject)
            .then((response) => {
                let courses = this.state.courses.slice()
                courses.splice(index, 1)
                this.setState( {courses} )
                console.log(response)
            })
            .catch(err => {
                console.log(err)
            })
    }

    render() {
        const { user } = this.props.auth;

        return (
            <div className="container flex-no-shrink">
            <div>
            <input type="text"
        value={this.state.search}
        onChange={this.updateSearch.bind(this)}
        placeholder="Search for a Course"
        className="searchBar"
            />
            <h4 className='sectionTitle'>Sections</h4>
            </div>
            <div className="row flex-section">
            <div className="classList landing-copy col s4 flex-col-scroll" id="left">
            <ClassSearch getSections={this.getSections} search={this.state.search} />
        </div>

        <div className="sectionSelection landing-copy col s4 center-align flex-col-scroll" id="middle">
            {this.state.loading ? <h5>Loading...</h5>
              : this.state.sections.length === 0 ? <h5>No Sections Found</h5>
              : <SectionsList addCourse={this.addCourse} sections={this.state.sections}/>}
    </div>

        <div className="sectionSelection landing-copy col s4 center-align flex-col-scroll" id="right">
            <h6>
            <b>Hey there,</b> {user.name.split(" ")[0]}!
        </h6>
        <button
        onClick={this.onLogoutClick}
        className="lightBtn logoutBtn btn btn-large waves-effect waves-light hoverable  accent-3"
            >
            Logout
            </button>
            <div>
            <CoursesList courses={this.state.courses} deleteCourse={this.deleteCourse}/>
        </div>
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
