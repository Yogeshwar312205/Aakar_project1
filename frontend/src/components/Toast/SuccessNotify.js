import {Bounce, toast} from "react-toastify";

export const notify = (msg) =>
    toast.success(msg || 'Employee Added Successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
    });
