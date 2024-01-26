import './RankingPage.scss'
import Header from '../../components/Header/Header';
import NavMenu from '../../components/NavMenu/NavMenu';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { countryNames } from '../../data/countriesList';

interface ErrorProps {
    status:number,
    message:string
}

 interface RankingProps {
    id: number,
    country: string,
    firstname: string,
    lastname: string,
    best_score: number,
    date: string
    user: UserProps;
}

interface UserProps {
    city: string | null;
    country: string | null;
    firstname: string;
    lastname: string;
}

interface QueryParamsProps {
    sportId: number,
    gender: string,
    country: string,
    weightMin: number | '',
    weightMax: number | ''
}

const RankingPage = () => {

    const [error, setError] = useState<ErrorProps | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ranking, setRanking] = useState<RankingProps[]>([]);
    const [queryParams, setQueryParams] = useState<QueryParamsProps>({
        sportId: 4,
        gender: '',
        country: '',
        weightMin: '',
        weightMax: ''
    })

    useEffect(() => {
        console.log('queryParms : ' ,queryParams)
    }, [queryParams])

    const navigate = useNavigate();
    const { isAuthenticated, token, userId } = useAuth()!;

    const getBestScores =  useCallback (async (queryParams: QueryParamsProps) => {

        try{
            setIsLoading(true);
            setError(null);

            // Récupérer les données de la table ranking en fonction du sport de l'utilisateur
            const response = await axios.get(`https://maxrep-back.onrender.com/api/ranking?sportId=${queryParams.sportId}&gender=${queryParams.gender}&country=${queryParams.country}&weightMin=${queryParams.weightMin}&weightMax=${queryParams.weightMax}` , {
                headers: {
                    'Authorization': `Bearer ${token}` //Send token to backend to verify user
                }
            });

            console.log('bestScores :' , response.data);
            // sort by best_score and organize rank id by order
            const rank = response.data.sort((a: RankingProps, b: RankingProps) => (a.best_score > b.best_score) ? -1 : 1)
            
            setRanking(rank);
        }

        catch(error) {
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
    }, [token]);

    const getUserInfos = async () => {

        if (!userId) {
            setError({status:401, message:'Unauthorized / Non autorisé'});
        }

        try{
            setIsLoading(true);
            setError(null);

            // Récupérer les données de la table ranking en fonction du sport de l'utilisateur
            const response = await axios.get(`https://maxrep-back.onrender.com/api/profile/${userId}` , {
                headers: {
                    'Authorization': `Bearer ${token}` //Send token to backend to verify user
                }
            });
            
            console.log('userInfos :' , response.data);
            setQueryParams({
                ...queryParams,
                sportId: response.data.sports[0].id,
                gender: response.data.gender
            })
            getBestScores({
                ...queryParams,
                sportId: response.data.sports[0].id,
                gender: response.data.gender
            })
        }

        catch(error) {
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
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');

        } else {
            // getUserInfos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isAuthenticated, navigate, token, userId]);

    useEffect(() => {
        getUserInfos();
    }, [])

    // useEffect(() => {
    //     getBestScores(queryParams);
    // }, [])
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
    
        setQueryParams(prevParams => ({
            ...prevParams,
            [name]: (name === "sportId" || name === "weightMin" || name === "weightMax") ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (queryParams.weightMin > queryParams.weightMax) {
            //! Afficher un message d'erreur sur le front
            console.log('Erreur !') 
            return setError({status:0, message:'Le poids maximum doit etre supérieur au poids minimum !'}) 
        }

        queryParams.weightMin = queryParams.weightMin === 0 ? '' : queryParams.weightMin;
        queryParams.weightMax = queryParams.weightMax === 0 ? '' : queryParams.weightMax;

        getBestScores(queryParams)
    }

    return (
        <>
            <Header />
            <NavMenu />
            <div className="ranking-page">

                <header className="ranking-header">
                    <h1> RankingPage </h1>
                </header>
                
                <main className='ranking-main'>
                    <form action="" onSubmit={handleSubmit}>
                        <select name="sportId" id="" value={queryParams.sportId} onChange={handleChange}>
                            <option value={1}> Marathon </option>
                            <option value={3}> BackSquat </option>
                            <option value={4}> Deadlift </option>
                        </select>
                        <select name="country" id="" value={queryParams.country} onChange={handleChange}>
                            {Object.entries(countryNames).map(([key, value]) => (
                                <option key={key} value={value}>{value}</option>
                            ))}
                        </select>
                        <label htmlFor="">Poids min</label>
                        <input name='weightMin'type='number' value={queryParams.weightMin} onChange={handleChange}></input>
                        <label htmlFor="">Poids max</label>
                        <input name='weightMax' type='number' value={queryParams.weightMax} onChange={handleChange}></input>
                        <button type='submit'> Valider </button>
                    </form>
                    <table className='board'>
                        <thead>
                            <tr>
                                <th>Rang</th>
                                <th>Pays</th>
                                <th>Nom Prénom</th>
                                <th>Best Score</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                        {ranking.length > 0 ? (
                            ranking.map((item: RankingProps, index) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>{item.user.country}</td>
                                    <td>{item.user.firstname} {item.user.lastname}</td>
                                    <td>{item.best_score}</td>
                                    <td>{item.date}</td>
                                </tr>
                            ))) : null}
                        </tbody>
                    </table>
                </main>
            </div>
            
        </>
    )
}

export default RankingPage