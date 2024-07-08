
import { Component } from "react";
import { Navigate } from "react-router-dom";
export default class ErrorBoundary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
         
            error: null,
            errorInfo: null
        }
    }

    componentDidCatch(error, errorInfo) {

        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        });
    }
 
    render() {
        if (this.state.hasError) {
            const errorDesc = this.state.errorInfo ? this.state.errorInfo.componentStack.split('\n')[1].trim() : "No additional information available.";
            return (
                <Navigate 
                    to="/errors/*" 
                    replace={true} 
                    state={{ 
                        error: this.state.error.toString(), 
                        errorInfo: errorDesc
                    }} 
                />
            );
        }
        return this.props.children
    }

}