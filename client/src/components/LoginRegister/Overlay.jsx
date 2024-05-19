import './loginRegister.css';

export const Overlay = ({ handleSignInClick, handleSignUpClick }) => (
    
    <div className="container__overlay">
      <div className="overlay">
        <div className="overlay__panel overlay--left">
          <button className="btn" id="signIn" onClick={handleSignInClick}>Вход</button>
        </div>
        <div className="overlay__panel overlay--right">
          <button className="btn" id="signUp" onClick={handleSignUpClick}>Регистрация</button>
        </div>
      </div>
    </div>
    
  );