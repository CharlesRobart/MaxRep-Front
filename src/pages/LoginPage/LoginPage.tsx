import './LoginPage.scss'
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {

    //STATES
    const [userInfos, setUserInfos] = useState({
        email:'',
        password:'',
    });

    const navigate = useNavigate(); //Hook to navigate to another page
    const { login } = useAuth()!; //Hook to get login function from AuthContext, exclamation mark to tell TS that it's not null
    
    const [errorMessage, setErrorMessage] = useState<string>('');

    //UTILS
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        e.preventDefault();
        
        //Edit userInfos with new target value for changed input
        setUserInfos({
            ...userInfos,
            [e.target.name]: e.target.value
        });
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        setErrorMessage(''); //Init empty error messages
        
        //Push userInfos to backend
        try {
            const response = await axios.post('https://maxrep-back.onrender.com/api/login' , userInfos);
            console.log(response);

            if (response.status === 200) {
                const token = response.data;
                login(token); //Login user with token
                navigate(`/profile`);

                return response.data;

            } else {
                //Return error status & message
                setErrorMessage(response.data.error);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) { //== Case if axios error
                if (error.response) {
                    setErrorMessage(error.response.data.error);

                } else { //== Case if no response from server
                    setErrorMessage('Une erreur de réseau est survenue.');
                }

            } else { //== Case if not axios error
                setErrorMessage('Une erreur inattendue est survenue.');
            }
            console.log(error);
        }
    }

    return (
        <div className='login-page'>
            <Header />
            <main className='login-main'>
                <section className='login-form'>
                    <form className='form' method='post' onSubmit={handleFormSubmit}>
                        <div className="form__title">
                            <h3> Connexion </h3>
                        </div>
                        <div className="form__errors">
                            <p className='error-message'> {errorMessage} </p>
                        </div>
                        <div className="form__inputs">
                            <div className='input'> 
                                <i className="icon fa-solid fa-at"></i>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={userInfos.email}
                                    onChange={handleInputChange}
                                    placeholder='Entrez votre email' 
                                    required 
                                />
                            </div>
                            <div className='input'> 
                                <i className="icon fa-solid fa-unlock"></i>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={userInfos.password}
                                    onChange={handleInputChange}
                                    placeholder='Entrez votre mot de passe' 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form__buttons">
                            <button type='submit'> CONNEXION </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default LoginPage