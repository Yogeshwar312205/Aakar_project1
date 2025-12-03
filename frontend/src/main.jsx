import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux';
import store from './store/store';
import { UserProvider } from './ticketComponents/context/UserContext';



createRoot(document.getElementById('root')).render(
        <Provider store={store}>
        <UserProvider>
                <App/>
            </UserProvider>
        </Provider>
)
