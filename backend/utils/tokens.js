import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            customEmployeeId: user.customEmployeeId,
            employeeEmail: user.employeeEmail,
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '8h' } // Extended to 8 hours for better UX
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            customEmployeeId: user.customEmployeeId,
            employeeEmail: user.employeeEmail,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
};