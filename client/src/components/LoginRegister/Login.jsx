import './loginRegister.css';

export const Login = () => {

  return(
    <div className="container__form container--signin">
    <form action="#" className="form" id="form2">
      <h2 className="form__title">Вход</h2>
      <label htmlFor="phoneNumber">Телефонен номер</label>
      <input type="text" placeholder="Телефонен номер +359..." className="input" />
      <label htmlFor="password">Парола</label>
      <input type="password" placeholder="Парола" className="input" />
      <p className="error">Error</p>
      <a href="#" className="link">Забравена парола?</a>
      <button className="btn">Вход</button>
      <a href="#" className="link link-hidden">Нямаш акаунт? <span>Регистрация</span></a>
    </form>
  </div>
  )
}

