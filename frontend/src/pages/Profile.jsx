import React from 'react'
import { useSelector } from 'react-redux'
import { FiEdit, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  // Getting user data from Redux state
  const user = useSelector((state) => state.auth.user)
  const jobProfiles = useSelector((state) => state.auth.jobProfiles)
  const navigate = useNavigate()
  return (
    <div className="profile-container px-24 py-8">
      <div className={`flex items-center justify-between`}>
        <h1 className="text-4xl font-bold">Profile</h1>
        {/*<button onClick={() => navigate("/edit")}*/}
        {/*        className={`flex p-1 items-center justify-between w-max py-2 px-4 rounded-md text-white font-semibold gap-3 bg-[#3249D7] hover:bg-[#5B6DDF]`}>*/}
        {/*    <FiEdit /> Edit Profile*/}
        {/*</button>*/}
      </div>
      {/* Displaying user avatar */}
      <div className="avatar mt-4 flex items-center space-x-4">
        {/*<img*/}
        {/*    // src={user?.avatar}*/}
        {/*    alt="User Avatar"*/}
        {/*    className="w-24 h-24 rounded-full object-cover"*/}
        {/*/>*/}
        <FiUser size={50} />
        <div>
          <h2 className="text-2xl font-semibold">{user?.employeeName}</h2>
          <p className="text-lg text-gray-500">{user?.employeeQualification}</p>
        </div>
      </div>

      <div className="user-details mt-8 space-y-4">
        <div>
          <strong>Id (Only for developers use):</strong>{' '}
          <span>{user?.employeeId}</span>
          {/* or if you want to fetch only id use this line
                const employeeId = useSelector((state) => state.auth.user?.employeeId);
                */}
        </div>
        <div>
          <strong>Email:</strong> <span>{user?.employeeEmail}</span>
        </div>
        <div>
          <strong>Phone:</strong> <span>{user?.employeePhone}</span>
        </div>
        <div>
          <strong>Job Profiles:</strong>
          <ul>
            {jobProfiles?.map((profile, index) => (
              <li className={'mb-3'} key={index}>
                <strong>Designation:</strong> {profile.designationName} <br />
                <strong>Department:</strong> {profile.departmentName} <br />
                <strong>Manager:</strong> {profile.managerName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Profile
