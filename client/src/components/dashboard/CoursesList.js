import React, { Component } from "react";

class CoursesList extends Component {
    deleteCourseItem(course, index) {
        this.props.deleteCourse(course, index)
    }

    render() {
        return (
            <ul>
                {this.props.courses.map((course, index) => {
                    return <li className="course" onClick={() => { this.deleteCourseItem(course, index)}} key={index} >{course.substring(0, 8) + "-" + course.substring(9)} <span className="fa fa-trash"></span></li>
                })}
            </ul>
        )
    }
}

export default CoursesList