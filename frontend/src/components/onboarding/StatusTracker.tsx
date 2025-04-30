import {fetchApplicationData, fetchApplicationStatus} from '@/store/slices/onboardingSlice';
import { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import { AppDispatch } from '@/store/store';

const StatusTracker: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(()=>{
        const interval = setInterval(() => {
            dispatch(fetchApplicationData());
            dispatch(fetchApplicationStatus());
        }, 5000); 
        
        return () => clearInterval(interval);
    }, [dispatch]);
    return null;
};

export default StatusTracker;
