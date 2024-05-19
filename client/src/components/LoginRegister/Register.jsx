import './loginRegister.css';


export const Register = () => {

  return (
    <div className="container__form container--signup">
      <form action="#" className="form" id="form1">
        <h2 className="form__title">Регистрация</h2>
        <input type="number" placeholder="Телефонен номер +359.." className="input" />
        <input type="password" placeholder="Парола" className="input" />
        <input type="password" placeholder="Повтори парола" className="input" />
        <p className="error">Грешка</p>
        <button className="btn">Регистрация</button>
        <a href="#" className="link link-hidden">Вече имаш акаунт? <span>Вход</span></a>
      </form>
    </div>
  )

}

