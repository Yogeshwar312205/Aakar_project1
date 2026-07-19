import { useNavigate } from 'react-router-dom';
import { useAccessSync } from '../hooks/useAccessSync';

/**
 * Wrapper component to enable access synchronization
 * Must be used inside Router context
 */
const AccessSyncWrapper = () => {
    const navigate = useNavigate();
    useAccessSync(navigate);
    return null;
};

export default AccessSyncWrapper;
