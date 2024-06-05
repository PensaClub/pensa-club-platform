import './profile.css'
import { Link } from 'react-router-dom'

export const ProfileData = () => {
  
    return (
        <section className="profile-section-edit">
            <form className="profile-form">
            <h3>Лични данни</h3>
                <div className="avatar">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <Link to="#" className="change-avatar-link">Смени снимка</Link>
                </div>
                <div className="user-data">
                    <div>
                        <label htmlFor="username">Потребителско име: <span>*</span></label>
                        <input type="text" id="username" name="username" />
                    </div>
                    <div>
                        <label htmlFor="firstName">Име:</label>
                        <input type="text" id="firstName" name="firstName" />
                    </div>
                    <div>
                        <label htmlFor="lastName">Фамилия:</label>
                        <input type="text" id="lastName" name="lastName" />
                    </div>
                    <div className="gender">
                    <label>Пол:</label>
                    <div>
                        <label>
                            Мъж
                            <input
                                type="radio"
                            // value="male"
                            // checked={selectedGender === 'male'}
                            // onChange={handleGenderChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Жена
                            <input
                                type="radio"
                            // value="female"
                            // checked={selectedGender === 'female'}
                            // onChange={handleGenderChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Друго
                            <input
                                type="radio"
                            // value="other"
                            // checked={selectedGender === 'other'}
                            // onChange={handleGenderChange}
                            />
                        </label>
                    </div>
                </div>
                    <div>
                        <label htmlFor="email">Имейл: <span>*</span></label>
                        <input type="email" id="email" name="email" />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber">Телефон: <span>*</span></label>
                        <input type="text" id="phoneNumber" name="phoneNumber" />
                    </div>
                    <div className="date">
                    <label>Възраст</label>
                    <div>
                        <label>
                          
                            <select 
                            // value={selectedDate} 
                            // onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                <option value=""
                                >Ден</option>
                                {/* {generateNumberOptions(1, 31)} */}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                        
                            <select 
                            // value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">Месец</option>
                                {/* {generateNumberOptions(1, 12)} */}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                      
                            <select 
                            // value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="">Година</option>
                                {/* {generateNumberOptions(1900, new Date().getFullYear())} */}
                            </select>
                        </label>
                    </div>
                </div>
                    <span className="required-fields">Полетата с * са задължителни!</span>
                </div>
                <div className="btn-inline">
                    <button type="submit" className="btn-general btn-green">Запази</button>
                    <button type="submit" className="btn-general btn-red">Затвори</button>
                </div>
            </form>
        </section>
    )
}
