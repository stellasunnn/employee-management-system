import {fetchApplicationData} from '@/store/slices/onboardingSlice';
import { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import { AppDispatch } from '@/store/store';

const StatusTracker: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(()=>{
        const interval = setInterval(() => {
            dispatch(fetchApplicationData());
        }, 5000); 
        
        return () => clearInterval(interval);
    }, [dispatch]);
    return null;
};

export default StatusTracker;
