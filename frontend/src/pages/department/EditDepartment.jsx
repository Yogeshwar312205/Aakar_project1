import React, {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {FiArrowLeftCircle, FiSave} from "react-icons/fi";
import TextField from "@mui/material/TextField";
import {notify} from "../../components/Toast/SuccessNotify.js";
import {fetchAllWorkingDepartments, updateDepartment} from "../../features/departmentSlice.js";

const EditDesignation = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {id} = useParams();

    console.log(id)

    useEffect(() => {
        dispatch(fetchAllWorkingDepartments());
    }, [dispatch]);

    const { departments } = useSelector((state) => state.department);

    console.log(departments.working)

    const department = useMemo(() => {
        return departments.working.find((department) => department.departmentId === parseInt(id));
    }, [departments, id]);

    const [departmentName, setDepartmentName] = useState(department.departmentName);

    const handleChange = (e) => {
        setDepartmentName(e.target.value);
    };


    const handleSave = () => {
        dispatch(updateDepartment({ departmentId: department.departmentId, departmentName }))
            .unwrap()
            .then(() => {
                notify("Department successfully updated");
                navigate('/departments');
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div>
            <section className="add-employee-head flex justify-between mb-3">
                <div className="flex items-center gap-3">
                    <FiArrowLeftCircle size={28} className="text-[#0061A1]" onClick={() => window.history.back()}/>
                    <div className="text-[17px]">
                        <span>Dashboard / </span>
                        <span className="font-semibold">Edit department</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex justify-center items-center gap bg-[#0061A1] text-white py-1.5 px-2 rounded"
                        onClick={handleSave}
                    >
                        <FiSave size={20} className="save-icon"/>
                        <span>Save details</span>
                    </button>
                    {/*<button*/}
                    {/*    className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"*/}
                    {/*>*/}
                    {/*    <MdAutoDelete size={20} className="delete-icon"/>*/}
                    {/*    <span>Delete Department</span>*/}
                    {/*</button>*/}
                </div>
            </section>

            <section className="edit-employee-body bg-white px-10 py-7 flex flex-col gap-5">
                <div className="add-employee-details my-4 bg-white rounded">
                    <h3 style={{fontSize: "18px", marginBottom: "15px", color: "#7D7D7D", fontWeight: "bold"}}>Personal
                        details</h3>
                    <div className="employee-details flex gap-10">

                        <TextField
                            label="Department Name"
                            variant="outlined"
                            autoComplete="off"
                            value={departmentName}
                            onChange={handleChange}
                            name="departmentName"
                            type="text"
                            sx={{width: "300px"}}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
export default EditDesignation
