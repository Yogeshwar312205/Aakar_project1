import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import TableComponent from '../../components/Table/TableComponent.jsx'
import { MdAutoDelete } from 'react-icons/md'
import '../employee/EmployeeDashboard.css'
import { deleteDepartment } from '../..//features/departmentSlice.js'
import { notify } from '../../components/Toast/SuccessNotify.js'
import moment from 'moment'
import Modal from 'react-modal'
import {
  deleteMultipleEmployees,
  moveEmployee,
} from '../..//features/employeeSlice.js'

function DepartmentProfile() {
  const { id } = useParams()
  const dispatch = useDispatch() // Use dispatch hook to dispatch actions
  const { employees, loading, error } = useSelector((state) => state.employee)
  const allDepartmentData = useSelector((state) => state.department) // Fetch employees from Redux store
  const departmentData = allDepartmentData.departments
  const workingDepartments = departmentData.working
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [showSecondModal, setShowSecondModal] = useState(false)
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] =
    useState(false)

  if (!workingDepartments || workingDepartments.length === 0) {
    return <div>Loading...</div>
  }

  function getDepartmentById(departmentId) {
    return workingDepartments.find(
      (department) => department.departmentId === departmentId
    )
  }

  const department = getDepartmentById(parseInt(id))
  console.log(department)

  if (!department) {
    return <div>Department not found.</div>
  }

  const filteredDepartments = workingDepartments.filter(
    (dept) => dept.departmentId !== department.departmentId
  )

  const filteredEmployees = employees.filter((employeeData) =>
    employeeData.jobProfiles.some(
      (jobProfile) => jobProfile.departmentName === department.departmentName
    )
  )

  const openModal = () => {
    filteredEmployees.length === 0
      ? setShowDeleteDepartmentModal(true)
      : setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prev) => {
      console.log('Previous State:', prev)

      if (prev.includes(employeeId)) {
        const updated = prev.filter((id) => id !== employeeId) // Remove the employee ID
        console.log('Deselected. Updated State:', updated)
        return updated
      } else {
        const updated = [...prev, employeeId]
        console.log('Selected. Updated State:', updated)
        return updated
      }
    })
  }

  useEffect(() => {
    console.log('Selected Employees Updated:', selectedEmployees)
  }, [selectedEmployees])

  // Show the second modal for department selection
  const handleMoveEmployees = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee!')
      return
    }
    closeModal() // Close the first modal
    setShowSecondModal(true) // Open the second modal
  }

  function handleDeleteEmployees() {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee!')
      return
    }

    closeModal()
    setShowDeleteEmployeeModal(true)
  }

  function confirmDepartmentDelete() {
    console.log('Deleting Department:', department)
    handleDelete()
  }

  function confirmEmployeeDelete() {
    console.log('Deleting Employees:', selectedEmployees)

    // TODO: Implement the logic for dispatching the delete operation
    // dispatch(moveEmployee({employeeIds: selectedEmployees, toDepartmentId: selectedDepartment}))
    dispatch(deleteMultipleEmployees({ employeeIds: selectedEmployees }))

    // Reset states and close modal
    setSelectedEmployees([])
    setSelectedDepartment(null)
    setShowDeleteEmployeeModal(false)
    notify('Employees have been deleted successfully!') // Notify success
  }

  // Handle Delete Employee
  const handleDelete = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this department?'
    )
    if (confirmDelete) {
      if (filteredEmployees.length > 0) {
        alert('Please move or delete employees to another department first!')
        return false
      }
      dispatch(deleteDepartment(department.departmentId)) // Dispatch delete action
      navigate('/departments')
      notify('Department deleted successfully!')
      return true
    }
    return false
  }

  // Handle department selection
  const handleDepartmentSelect = (departmentId) => {
    if (!selectedEmployees) {
      alert('Please select a employee!')
      return
    }
    setSelectedDepartment(departmentId)
  }

  // Move employees to the selected department
  const confirmMove = () => {
    console.log('Button clicked!')
    if (!selectedDepartment) {
      alert('Please select a department!')
      return
    }

    if (!selectedEmployees) {
      alert('Please select a employee!')
      return
    }

    dispatch(
      moveEmployee({
        employeeIds: selectedEmployees,
        toDepartmentId: selectedDepartment,
      })
    )
    setSelectedEmployees([])
    setSelectedDepartment(null)
    setShowSecondModal(false)
    notify('Employees have been moved successfully!')
  }

  const processedRows = filteredEmployees.map((data, index) => {
    const { employee, jobProfiles } = data

    // Extract and join department-related roles only
    const roles = jobProfiles
      .filter((profile) => profile.departmentName === department.departmentName)
      .map((profile) => profile.designationName || 'N/A')
      .join(', ')

    return {
      id: index + 1, // Row ID
      empId: employee?.customEmployeeId,
      empName: employee?.employeeName,
      empEmail: employee?.employeeEmail,
      empJobTitle: roles || 'N/A', // Only department-related
      createdAt: employee?.createdAt,
    }
  })

  console.log('Processed Employees:', processedRows)

  const navigate = useNavigate()

  const columns = [
    { id: 'empId', label: 'Employee ID', align: 'left' },
    { id: 'empName', label: 'Name', align: 'left' },
    { id: 'empEmail', label: 'Email ID', align: 'left' },
    { id: 'empJobTitle', label: 'Role', align: 'left' },
  ]

  const projectColumns = [
    { id: 'projectName', label: 'Project Name', align: 'center' },
    { id: 'projectNumber', label: 'Project Number', align: 'center' },
    { id: 'startDate', label: 'Start Date', align: 'center' },
    { id: 'endDate', label: 'End Date', align: 'center' },
    { id: 'duration', label: 'Duration', align: 'center' },
  ]

  return (
    <div>
      <div className="add-employee-dashboard">
        <section className="add-employee-head flex justify-between mb-3">
          <div className="flex items-center gap-3">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1]"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Dashboard / </span>
              <span className="font-semibold">Department Details</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
              onClick={() => navigate(`/department/${id}/edit`)}
            >
              <FiEdit size={20} className="save-icon" />
              <span>Edit details</span>
            </button>
            <button
              className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
              onClick={openModal}
            >
              <MdAutoDelete size={20} className="delete-icon" />
              <span>Delete Department</span>
            </button>
            {/* Modal Popup */}
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Delete Department Options"
              className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <h2 className="text-xl font-semibold mb-4">
                What to do with current employees?
              </h2>

              <div className="employee-list space-y-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.employee.customEmployeeId}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      id={employee.employee.customEmployeeId}
                      onChange={() =>
                        handleCheckboxChange(employee?.employee?.employeeId)
                      }
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor={employee.employee.customEmployeeId}
                      className="text-gray-800"
                    >
                      {employee.employee.employeeName}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleDeleteEmployees}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Delete
                </button>
                <button
                  onClick={handleMoveEmployees}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Move
                </button>
                <button
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </Modal>

            {/* Second Modal - Select Department */}
            <Modal
              isOpen={showSecondModal}
              onRequestClose={() => setShowSecondModal(false)}
              contentLabel="Select Department"
              className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <h2 className="text-xl font-semibold mb-4">
                Select a Department
              </h2>

              <div className="space-y-2">
                {filteredDepartments.map((dept) => (
                  <div
                    key={dept.departmentId}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      id={`dept-${dept.departmentId}`}
                      name="department"
                      value={dept.departmentId}
                      onChange={() => handleDepartmentSelect(dept.departmentId)}
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor={`dept-${dept.departmentId}`}
                      className="text-gray-800"
                    >
                      {dept.departmentName}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => confirmMove()}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirm Move
                </button>
                <button
                  onClick={() => setShowSecondModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </Modal>

            {/* Third Modal - Delete Employee Yes/No */}
            <Modal
              isOpen={showDeleteEmployeeModal}
              onRequestClose={() => setShowDeleteEmployeeModal(false)}
              contentLabel="Are you sure you want to delete this employees?"
              className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <h2 className="font-normal mb-4">
                Are you sure you want to delete this employees?
              </h2>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => confirmEmployeeDelete()}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteEmployeeModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </Modal>

            {/* Fourth Modal - Delete Department Yes/No */}
            <Modal
              isOpen={showDeleteDepartmentModal}
              onRequestClose={() => setShowDeleteEmployeeModal(false)}
              contentLabel="Are you sure you want to delete this department?"
              className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <h2 className="font-normal mb-4">
                Are you sure you want to delete this department?
              </h2>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => confirmDepartmentDelete()}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteDepartmentModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </Modal>
          </div>
        </section>

        <section className="add-employee-body bg-white px-10 py-7 rounded">
          <h3
            style={{
              fontSize: '18px',
              marginBottom: '10px',
              color: '#7D7D7D',
              fontWeight: 'bold',
            }}
          >
            Department details
          </h3>
          <div className="border-[#C3C3C3] border-2 flex flex-row items-center justify-between p-6 rounded-xl mb-10">
            <div className="flex flex-col w-max">
              <span className="text-[#585858] text-[16px]">Name</span>
              <span className="text-black text-lg font-semibold">
                {department.departmentName}
              </span>
            </div>
            <div className="flex flex-col w-max">
              <span className="text-[#585858] text-[16px]">Start Date</span>
              <span className="text-black text-lg font-semibold">
                {department.departmentStartDate
                  ? moment(department.departmentStartDate).format('DD/MM/YYYY')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col w-max">
              <span className="text-[#585858] text-[16px]">End Date</span>
              <span className="text-black text-lg font-semibold">
                {department.departmentEndDate
                  ? moment(department.departmentEndDate).format('DD/MM/YYYY')
                  : 'Working'}
              </span>
            </div>
            <div className="flex flex-col w-max">
              <span className="text-[#585858] text-[16px]">
                Total Employees
              </span>
              <span className="text-black text-lg font-semibold">
                {processedRows.length}
              </span>
            </div>
          </div>
        </section>

        <section className="add-employee-body bg-white px-10 py-1 rounded">
          <h3
            style={{
              fontSize: '18px',
              marginBottom: '10px',
              color: '#7D7D7D',
              fontWeight: 'bold',
            }}
          >
            Employees of the Department
          </h3>
          <TableComponent
            rows={processedRows}
            columns={columns}
            linkBasePath="/employee"
            defaultSortOrder={'oldest'}
            itemKey="empId"
            itemLabel="empName"
            navigateTo="/employee"
            searchLabel="Search by Employee Name"
          />
        </section>

        {/*<section className="add-employee-body bg-white px-10 py-10 rounded">*/}
        {/*    <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>*/}
        {/*        Projects*/}
        {/*    </h3>*/}
        {/*    /!*<TableComponent columns={columns} rows={[]} />*!/*/}
        {/*</section>*/}
      </div>
    </div>
  )
}

export default DepartmentProfile
