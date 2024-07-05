import { useLocation } from "react-router-dom";
import { ErrorPageBase } from "./ErrorPageBase/ErrorPageBase";

const ErrorPageBoundary = () => {
    const location = useLocation();
    const { error, errorInfo } = location.state || { error: "Unknown error", errorInfo: "No additional information" };

    return (
        <ErrorPageBase
            errorCode={error}
            errorDesc={errorInfo}
        />
    );
};

export default ErrorPageBoundary;