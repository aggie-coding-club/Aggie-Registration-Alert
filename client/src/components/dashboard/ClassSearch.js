
import React, { Component } from "react";
import courses from "../../data/courses.json"
// const courses = ["ACCT 121", "CSCE 121", "CSCE 221", "MATH 251"]

class ClassSearch extends Component {
    constructor() {
        super()
        this.state = {
            search: ""
        }
    }

    updateSearch(event) {
        this.setState({search: this.props.search.substr(0, 20)})
    }

    render() {
        let filteredCourses = courses.filter(
            (course) => {
                return course.toLowerCase().indexOf(this.props.search.toLowerCase()) !== -1
            }
        )

        return (
            <div>
                <ul>
                    {filteredCourses.map((course) => {
                        return <li>{course}</li>
                    })}
                </ul>
            </div>
        )
    }
}

export default ClassSearch