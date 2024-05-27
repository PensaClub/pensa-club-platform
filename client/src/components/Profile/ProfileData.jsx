import './profile.css'

export const ProfileData = () => {
    return (
        <section className="profile-section-edit">
            <form className="profile-form">
                <div className="avatar">
                    <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                    <p className="change-avatar-link">Смени снимка</p>
                </div>
                <div className="user-data">
                    <div>
                        <label htmlFor="firstName">Име:</label>
                        <input type="text" id="firstName" name="firstName" />
                    </div>
                    <div>
                        <label htmlFor="lastName">Фамилия:</label>
                        <input type="text" id="lastName" name="lastName" />
                    </div>
                    <div>
                        <label htmlFor="email">Имейл:</label>
                        <input type="email" id="email" name="email" />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber">Телефон:</label>
                        <input type="text" id="phoneNumber" name="phoneNumber" />
                    </div>
                </div>
                <div className="btn-inline">
                    <button type="submit" className="btn-general btn-green">Запази</button>
                    <button type="submit" className="btn-general btn-red">Затвори</button>
                </div>
            </form>
        </section>
    )
}
