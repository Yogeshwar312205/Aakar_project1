import React from "react";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import dayjs from "dayjs";

const AddEmployeeForm = ({ employeeInputValues, setEmployeeInputValues, handleFormSubmit }) => {

    // Handle changes in input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployeeInputValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    // Calculate employee age based on date of birth
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Handle date changes for DOB and joining date
    const handleDateChange = (date, fieldName) => {
        if (date) {
            setEmployeeInputValues((prevValues) => ({
                ...prevValues, [fieldName]: date,
            }));

            if (fieldName === 'employeeDOB') {
                const formattedDate = date.format('YYYY-MM-DD');
                const age = calculateAge(formattedDate);
                setEmployeeInputValues((prevValues) => ({
                    ...prevValues, employeeAge: age,
                }));
            }
        } else {
            setEmployeeInputValues((prevValues) => ({
                ...prevValues, [fieldName]: null, employeeAge: 0,
            }));
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (handleFormSubmit) {
                    handleFormSubmit();
                }
            }}
        >
            {/* Personal Details Section */}
            <div className="add-employee-details my-4 bg-white rounded">
                <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>Personal details</h3>
                <div className="employee-details flex gap-10">

                    {/* Employee Id */}
                    <TextField
                        label="Custom Employee Id"
                        variant="outlined"
                        autoComplete="off"
                        value={employeeInputValues.customEmployeeId}
                        onChange={handleChange}
                        name="customEmployeeId"
                        type="text"
                        sx={{ width: "300px" }}
                    />


                    {/* Employee Name */}
                    <TextField
                        label="Employee name"
                        variant="outlined"
                        value={employeeInputValues.employeeName}
                        onChange={handleChange}
                        name={'employeeName'}
                        sx={{ width: "300px" }}
                    />

                    {/* Employee DOB */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Employee DOB"
                            format={"DD/MM/YYYY"}
                            onChange={(date) => handleDateChange(date, 'employeeDOB')}
                            value={employeeInputValues.employeeDOB ? dayjs(employeeInputValues.employeeDOB) : null}
                            textField={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>

                    {/* Employee Age */}
                    <TextField
                        label="Age"
                        variant="outlined"
                        type="number"
                        name={'employeeAge'}
                        value={employeeInputValues.employeeAge}
                        onChange={handleChange}
                        sx={{
                            width: "100px",
                            borderRadius: "1px solid #7D7D7D",
                            '& .MuiOutlinedInput-root': {
                                height: '50px',
                            },
                        }}
                    />

                    {/* Gender */}
                    <FormControl>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            sx={{ width: '200px' }}
                            labelId="gender-label"
                            name={'employeeGender'}
                            id="gender"
                            label="Gender"
                            value={employeeInputValues.employeeGender}
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value={"Male"}>Male</MenuItem>
                            <MenuItem value={"Female"}>Female</MenuItem>
                            <MenuItem value={"Other"}>Other</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            {/* Contact Details Section */}
            <div className="add-employee-details my-4 bg-white rounded">
                <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>Contact details</h3>
                <div className="employee-details flex gap-10">
                    <TextField
                        label="Phone Number"
                        name={'employeePhone'}
                        variant="outlined"
                        type={"number"}
                        value={employeeInputValues.employeePhone}
                        onChange={handleChange}
                        sx={{
                            minWidth: "300px",
                            width: "300px",
                            borderRadius: "1px solid #7D7D7D",
                        }}
                    />

                    <TextField
                        label="Email"
                        variant="outlined"
                        name={'employeeEmail'}
                        value={employeeInputValues.employeeEmail}
                        onChange={handleChange}
                        type={"email"}
                        sx={{
                            width: "300px",
                            borderRadius: "1px solid #7D7D7D",
                        }}
                    />
                </div>
            </div>

            {/* Employment Details Section */}
            <div className="add-employee-details my-4 bg-white rounded">
                <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>Employment details</h3>
                <div className="employee-details flex gap-10">
                    <TextField
                        label="Company Name"
                        name={'companyName'}
                        variant="outlined"
                        value={employeeInputValues.companyName}
                        onChange={handleChange}
                        sx={{
                            minWidth: "300px",
                            width: "300px",
                            borderRadius: "1px solid #7D7D7D",
                        }}
                    />

                    {/* Employee Qualification */}
                    <FormControl>
                        <InputLabel id="employeeQualificationLabel">Employee Qualification</InputLabel>
                        <Select
                            sx={{ width: '250px' }}
                            name={'employeeQualification'}
                            id="employeeQualification"
                            label="Employee Qualification"
                            value={employeeInputValues.employeeQualification}
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value={"10th"}>10th</MenuItem>
                            <MenuItem value={"12th"}>12th</MenuItem>
                            <MenuItem value={"ITI"}>ITI</MenuItem>
                            <MenuItem value={"Diploma"}>Diploma</MenuItem>
                            <MenuItem value={"Graduate"}>Graduate</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Experience */}
                    <TextField
                        label="Experience (in yrs)"
                        name={'experienceInYears'}
                        variant="outlined"
                        type={"number"}
                        value={employeeInputValues.experienceInYears}
                        onChange={handleChange}
                        sx={{
                            minWidth: "300px",
                            width: "300px",
                            borderRadius: "1px solid #7D7D7D",
                        }}
                    />

                    {/* Joining Date */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            format={"DD/MM/YYYY"}
                            label="Joining date"
                            name={'employeeJoinDate'}
                            onChange={(date) => handleDateChange(date, 'employeeJoinDate')}
                            value={employeeInputValues.employeeJoinDate ? dayjs(employeeInputValues.employeeJoinDate) : null}
                            textField={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </div>
            </div>

            {/* Security Details Section */}
            <div className="add-employee-details bg-white rounded">
                <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>Security details</h3>
                <div className="employee-details">
                    <TextField
                        label="Password"
                        name={'employeePassword'}
                        variant="outlined"
                        type={"password"}
                        value={employeeInputValues.employeePassword}
                        onChange={handleChange}
                        sx={{
                            minWidth: "300px",
                            width: "300px",
                            borderRadius: "1px solid #7D7D7D",
                        }}
                    />
                </div>
            </div>
        </form>
    );
};

export default AddEmployeeForm;