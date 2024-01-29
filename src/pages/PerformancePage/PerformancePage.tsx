import './PerformancePage.scss'
import Header from '../../components/Header/Header';
import MenuMobile from '../../components/MenuMobile/MenuMobile';
import NoPerfMessage from '../../components/NoPerfMessage/NoPerfMessage';
import ErrorPage from '../ErrorPage/ErrorPage';
import Loader from '../../components/Loader/Loader';
import ChartMobile from '../../components/ChartMobile/ChartMobile';
import ChartDesktop from '../../components/ChartDesktop/ChartDesktop';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

interface ErrorProps {
    status:number,
    message:string
}

interface SportProps {
    id:number,
    name:string,
    unit:string,
    sessions:SessionProps[]
}

interface SessionProps { 
    id:number,
    date:string,
    description:string,
    score:number,
    sport_id:number,
}

const PerformancePage = () => {

    const navigate = useNavigate(); //Hook to navigate to another page
    const { isAuthenticated, token, userId } = useAuth()!; //Hook to get token and userId from AuthContext if user is authenticated

    const [userPerformances, setUserPerformances] = useState<SportProps[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<ErrorProps | null>(null);
    const [selectedSport, setSelectedSport] = useState<SportProps>({id:0, name:'', unit:'', sessions:[]});
    const [selectedSportIndex, setSelectedSportIndex] = useState<number>(0); //To know if a sport is clicked to display chart

    //Media query to get if device is mobile or desktop
    const isMobile = useMediaQuery({
        query: '(max-width: 992px)'
      }) 

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/');

        } else {
            getUserPerformances();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isAuthenticated, navigate, token, userId]);

    const getUserPerformances = async () => {

        if (!userId) {
            setError({status:401, message:'Unauthorized / Non autorisé'});
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(`https://maxrep-back.onrender.com/api/performances/${userId}` , {
                headers: {
                    'Authorization': `Bearer ${token}` //Send token to backend to verify user
                }
            });
            
            console.log(response.data);
            
            //== Case response is ok
            if (response.status === 200) {
                setUserPerformances(response.data.sports);
                if (response.data.sports.length > 0) {
                    setSelectedSport(response.data.sports[0]);  
                }

            } else {
                setError({status:500, message:'Internal Server Error / Erreur interne du serveur'})
            }

        } catch (error) {
            setIsLoading(false);
            
            if (axios.isAxiosError(error)) { //== Case if axios error
                if (error.response) {
                    setError({status:error.response.status, message:error.response.data.error});

                } else { //== Case if no response from server
                    setError({status:500, message:'Internal Server Error / Erreur interne du serveur'})
                }

            } else { //== Case if not axios error
                setError({status:500, message:'Internal Server Error / Erreur interne du serveur'})
                console.error(error);
            }                 

        } finally {
            setIsLoading(false);
        }
    }

    const handleSportClick = (sport:SportProps, index: number) => { 
        setSelectedSport(sport);
        setSelectedSportIndex(index);
    }

    //Handle 3 cases => error, loading and userInfos received
    if (error) {
        return <ErrorPage status={error.status} message={error.message} />
    }

    return (
        <>
            <Header />
            <MenuMobile />
            <div className="performance-page">
                {isLoading && <Loader /> ? (
                    <Loader isPage />
                ) : (
                    <>
                        <header className="performance-header">
                            <h2> Performance </h2>
                        </header>
                        {isMobile ? (
                            <main className='main-mobile'>
                                {userPerformances.length === 0 ? 
                                    <NoPerfMessage /> : (
                                    <div className="sports-list">
                                        {userPerformances && userPerformances.map((sport: SportProps) => (
                                            <ChartMobile key={sport.id} sport={sport} />
                                        ))}
                                    </div>
                                )}  
                            </main>
                        ) : (
                            <main className='main-desktop'>
                                {userPerformances.length === 0 ? 
                                    <NoPerfMessage /> : (
                                    <>
                                        <div className="sports-list">
                                            {userPerformances && userPerformances.map((sport: SportProps, index) => (
                                                <article key={sport.id} className={`sport ${index === selectedSportIndex ? 'clicked' : ''}`}  onClick={() => handleSportClick(sport, index)}>
                                                    <div className="sport__header" >
                                                        <h3> {sport.name} </h3>
                                                    </div>
                                                    <div className={`sport__content`}>
                                                    </div>
                                                </article>
                                            ))}                                            
                                        </div>
                                        <div className="sports-chart">
                                            <ChartDesktop sport={selectedSport} />
                                        </div>
                                    </>
                                )} 
                            </main>
                        )}
                        
                    </>
                )}
                
            </div>
        </>
    )
}

export default PerformancePage