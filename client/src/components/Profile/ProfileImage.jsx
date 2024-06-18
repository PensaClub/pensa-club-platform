import './profile.css'
import { Link } from "react-router-dom";


export const ProfileImage =() => {
    return ( 
        <>
      <section className="profile-data">
                        <div className="avatar">
                            <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                        </div>
                        <div className="user-data">
                            <Link to="#"><h3>Смени снимка</h3></Link>
                            
                        </div>
                    </section>
        </>
    )
}