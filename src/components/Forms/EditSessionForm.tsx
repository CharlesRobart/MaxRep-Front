import './Form.scss'
import axiosInstance from '../../services/axiosInstance';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button/Button';
import Loader from '../Loader/Loader';

interface EditSessionFormProps { 
    session:SessionProps,
    onProfileUpdate: () => void,
    onClose: () => void,
    userSports: UserSportsProps[],
}

interface SessionProps { 
    id:number,
    description:string,
    score:number,
    date:string,
    sport_id:number,
    sport:{
        name:string,
        unit:string
    }
}

interface UpdatedSessionProps {
    user_id:number | null,
    id:number,
    description:string,
    score:number,
    date:string,
    sport_id:number,
    unit:string,
}

interface UserSportsProps {
    id: number,
    name: string,
}

const EditSessionForm = ({session, userSports, onProfileUpdate, onClose}: EditSessionFormProps) => { 

    const {token, userId } = useAuth()!; //Hook to get token and userId from AuthContext

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [updatedSession, setUpdatedSession] = useState<UpdatedSessionProps>({
        user_id: userId,
        id: session.id,
        description: session.description,
        score: session.score,
        date: session.date,
        sport_id: session.sport_id,
        unit: session.sport.unit
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
        e.preventDefault();
        console.log(e.target.value)

        setUpdatedSession({
            ...updatedSession,
            [e.target.name]: e.target.value
        })
    }

    const editSession = async (e: { preventDefault: () => void; }) => { 
        e.preventDefault();

        try {
            setIsLoading(true);
            const response = await axiosInstance.patch(`/sessions/${updatedSession.id}` , updatedSession, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                onProfileUpdate();
                onClose();
            }

        } catch (error) {
            //! Gestion d'erreur (==> a factoriser ?)
            console.error(error);

        } finally {
            setIsLoading(false);
        }
    }

    const deleteSession = async () => { 

        try {
            setIsLoading(true);
            const response = await axiosInstance.delete(`/sessions/${updatedSession.id}` , {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 204) {
                onProfileUpdate();
                onClose();
            }

        } catch (error) {
            //! Gestion d'erreur (==> a factoriser ?)
            console.error(error);

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading && <Loader />}
            {!isLoading && (
                <form className='form editSessionForm' method='post' onSubmit={editSession}>
                    <div className="form__fields">
                        <div className="field">
                            <label htmlFor="date"> Date </label>
                            <input type="date" name='date' value={updatedSession.date} onChange={handleChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="sport_id"> Activité </label>
                            <select name="sport_id" value={updatedSession.sport_id}  onChange={handleChange} >
                                {userSports.map((sport: UserSportsProps) => (
                                    <option key={sport.id} value={sport.id}> {sport.name} </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="description"> Description </label>
                            <textarea name='description' value={updatedSession.description}  onChange={handleChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="score"> Score </label>
                            <input type="number" name='score' value={updatedSession.score} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form__buttons">
                        <Button text='Editer' color='black' type='submit' />
                        <Button text='Supprimer' color='red' type='button' onClick={deleteSession} />
                    </div>
                </form>
            )}
            
        </>
    )
}

export default EditSessionForm;  