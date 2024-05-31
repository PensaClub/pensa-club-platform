import './loader.css'


export const Loader = () => {
    return (
        <div className="loader-overlay">
        <div className="global-loader">
            <div className="circle"></div>
            <div className="circle-small"></div>
            <div className="circle-big"></div>
            <div className="circle-inner-inner"></div>
            <div className="circle-inner"></div>
            <h3>Loading...</h3>
        </div>
    </div>
    )
   
}