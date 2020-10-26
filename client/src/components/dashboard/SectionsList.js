import React, { Component } from "react";
import SectionDisplay from "./SectionDisplay"

class SectionsList extends Component {
    addCourseItem(course, index) {
        this.props.addCourse(course, index)
    }

    render() {
        return (
            <ul>
                {this.props.sections.map(section => (
                    section.map((val, index) => (
                        <div key={index} onClick={() => { this.addCourseItem(val[0] + " " + val[1] + " " + val[2], index)}}>
                                    <SectionDisplay department={val[0]}
                                                courseNumber={val[1]}
                                                courseSection={val[2]}
                                                courseName={val[3]}
                                                currentEnrollment={val[4]}
                                                maxEnrollment={val[5]}
                                                key={index}
                                                />
                        </div>
                    ))
                ))}
            </ul>
        )
    }
}

export default SectionsList