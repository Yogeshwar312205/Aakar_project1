import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {FiArrowLeftCircle, FiEdit} from "react-icons/fi";
import {useDispatch, useSelector} from "react-redux";
import '../employee/EmployeeDashboard.css';


function DesignationProfile() {
    const {id} = useParams();
    const { designations } = useSelector((state) => state.designation);

    console.log(designations);

    function getDesignationById(designationId) {
        return designations.find(designation => designation.designationId === parseInt(designationId));
    }

    const designation = getDesignationById(id)

    const navigate = useNavigate()

    return (
        <div>
            <div className="add-employee-dashboard">
                <section className="add-employee-head flex justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <FiArrowLeftCircle size={28} className="text-[#0061A1]" onClick={() => window.history.back()}/>
                        <div className="text-[17px]">
                            <span>Dashboard / </span>
                            <span className="font-semibold">Designation Details</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="flex justify-center items-center gap bg-[#0061A1] text-white py-1.5 px-2 rounded"
                            onClick={() => navigate(`/designation/${id}/edit`)}
                        >
                            <FiEdit size={20} className="save-icon"/>
                            <span>Edit details</span>
                        </button>
                        {/*<button*/}
                        {/*    className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"*/}
                        {/*>*/}
                        {/*    <MdAutoDelete size={20} className="delete-icon"/>*/}
                        {/*    <span>Delete Department</span>*/}
                        {/*</button>*/}
                    </div>
                </section>

                <section className="add-employee-body bg-white px-10 py-7 rounded">
                    <h3 style={{fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold"}}>
                        Department details
                    </h3>
                    <div
                        className="border-[#C3C3C3] border-2 flex flex-row items-center justify-between p-6 rounded-xl mb-10">
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">Name</span>
                            <span className="text-black text-lg font-semibold">{designation.designationName}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DesignationProfile;
