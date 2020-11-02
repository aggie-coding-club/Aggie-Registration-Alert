import React, { Component } from "react";

class SectionDisplay extends Component {
    render() {
        return (
            <div className="course">
                <h6>{this.props.courseName}</h6>
                <h6>{this.props.department} {this.props.courseNumber}-{this.props.courseSection}</h6>
        <p>Current Seat Availability: {this.props.maxEnrollment - this.props.currentEnrollment}/{this.props.maxEnrollment}</p>
            </div>
        )
    }
}

export default SectionDisplay