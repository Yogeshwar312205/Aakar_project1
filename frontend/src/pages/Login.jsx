import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {login} from '../features/authSlice.js'; // Adjust the path as necessary
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {FiLock, FiUser} from 'react-icons/fi';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(login({
            email,
            password,
        }));
        // try {
        //     // Make login request with email and password
        //     const response = await axios.post('http://localhost:3000/api/v1/employee/loginEmployee',
        //         {employeeEmail: email, employeePassword: password},
        //         {withCredentials: true}
        //     );
        //
        //     console.log(response.data.data);
        //
        //     // Destructure tokens and accessString from response
        //     const {accessToken, refreshToken, accessString} = response.data;
        //
        //     // Dispatch loginSuccess action to store the tokens and access string
        //
        //     // Redirect to the home page or dashboard
        //     navigate('/');
        // } catch (err) {
        //     // Handle error if login fails
        //     setError('Invalid email or password. Please try again.');
        // }
    };

    return (
        <section className={`w-[100%] h-[550px] flex justify-center items-center`}>
            <div
                className={`p-10 w-[500px] flex flex-col gap-4 justify-center items-center rounded-[20px] border-2 border-[#DAD7D7] bg-white shadow-[0px_488px_137px_0px_rgba(201,201,201,0),0px_312px_125px_0px_rgba(201,201,201,0.01),0px_176px_105px_0px_rgba(201,201,201,0.05),0px_78px_78px_0px_rgba(201,201,201,0.09),0px_20px_43px_0px_rgba(201,201,201,0.10)]`}>
                <h1 className={`text-[#0061A1] text-3xl font-bold`}>Login</h1>
                <div className={`border-[1px] w-[85%] border-[#DAD7D7]`}></div>
                <form onSubmit={handleSubmit} className={`w-3/4 flex flex-col gap-6`}>
                    <div>
                        <label
                            className={`text-[#7D7D7D] flex items-center gap-2 text-sm mb-2`}><FiUser/>Username</label>
                        <div>
                            <input
                                className={`w-full p-1 border-2 border-[#DAD7D7] rounded-[5px] text-[16px]`}
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            className={`text-[#7D7D7D] flex items-center gap-2 text-sm mb-2 `}><FiLock/>Password</label>
                        <input
                            className={`w-full p-1 border-2 border-[#DAD7D7] rounded-[5px] text-[16px]`}
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="text-red-500">{error}</div>} {/* Show error message if exists */}
                    <div>
                        <button className={`w-full bg-[#0061A1] text-white font-medium text-lg p-1 rounded-lg mt-4`}
                                disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </section>


    );
};

export default Login;
