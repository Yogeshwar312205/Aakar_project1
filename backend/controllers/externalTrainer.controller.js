import asyncHandler from "../utils/asyncHandler.js";
import { connection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  auth: {
    user: process.env.EMAIL_USER || "rushikeshghodke7455@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "wvhc nsgh iomn grcj",
  },
});

/**
 * Generate random password for external trainer
 */
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Send email with login credentials to external trainer
 */
const sendCredentialsEmail = async (trainerData, password) => {
  try {
    // Read email template
    const templatePath = path.join(__dirname, '../email/passwordtemplate.html');
    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    emailTemplate = emailTemplate
      .replace(/{{employeeName}}/g, trainerData.employeeName)
      .replace(/{{employeeEmail}}/g, trainerData.employeeEmail)
      .replace(/{{employeePassword}}/g, password)
      .replace(/{{customEmployeeId}}/g, trainerData.customEmployeeId);

    const mailOptions = {
      from: process.env.EMAIL_USER || "rushikeshghodke7455@gmail.com",
      to: trainerData.employeeEmail,
      subject: 'External Trainer Account - Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Welcome to Aakar ERP</h1>
            <h2 style="color: #64748b;">External Trainer Account</h2>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #334155;">Dear <strong>${trainerData.employeeName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Your external trainer account has been created successfully. You can now access the Training Status section of the Aakar ERP system.
            </p>
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #475569;"><strong>Trainer ID:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${trainerData.customEmployeeId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #475569;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${trainerData.employeeEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #475569;"><strong>Password:</strong></td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace; background-color: #fff; padding: 5px 10px; border-radius: 4px;">${password}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">Access Period</h3>
            <p style="font-size: 14px; color: #78350f; margin: 5px 0;">
              <strong>Start Date:</strong> ${new Date(trainerData.accessStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style="font-size: 14px; color: #78350f; margin: 5px 0;">
              <strong>End Date:</strong> ${new Date(trainerData.accessEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style="font-size: 12px; color: #92400e; margin-top: 10px;">
              ⚠️ You can login only during this period.
            </p>
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #075985; margin-top: 0;">Important Notes</h3>
            <ul style="color: #0c4a6e; font-size: 14px; line-height: 1.8;">
              <li>You have access <strong>only to the Training Status section</strong></li>
              <li>Please change your password after your first login</li>
              <li>Keep your credentials secure and do not share them</li>
              <li>If you face any issues, contact the HR department</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
            <p style="font-size: 12px; color: #94a3b8;">
              This is an automated email. Please do not reply to this message.
            </p>
            <p style="font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} Aakar ERP. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Credentials email sent to:', trainerData.employeeEmail);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw new ApiError(500, 'Failed to send credentials email: ' + error.message);
  }
};

/**
 * Add new external trainer
 * POST /api/externalTrainer/addExternalTrainer
 */
export const addExternalTrainer = asyncHandler(async (req, res) => {
  const {
    customEmployeeId,
    employeeName,
    employeeEmail,
    employeePhone,
    accessStartDate,
    accessEndDate,
    companyName,
    password,  // New: optional password from user
    skills     // New: array of skill IDs
  } = req.body;

  console.log('[Add External Trainer] Request received:', {
    customEmployeeId,
    employeeName,
    employeeEmail,
    accessStartDate,
    accessEndDate,
    skills
  });

  // Validation
  if (!customEmployeeId || !employeeName || !employeeEmail || !accessStartDate || !accessEndDate) {
    throw new ApiError(400, 'Required fields: customEmployeeId, employeeName, employeeEmail, accessStartDate, accessEndDate');
  }

  // Validate skills array
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, 'At least one skill must be selected');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(employeeEmail)) {
    throw new ApiError(400, 'Invalid email format');
  }

  // Validate date logic
  const start = new Date(accessStartDate);
  const end = new Date(accessEndDate);
  const today = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }
  
  if (end <= start) {
    throw new ApiError(400, 'Access end date must be after start date');
  }

  // Check if customEmployeeId exists
  const [existingId] = await connection.promise().query(
    'SELECT employeeId FROM employee WHERE customEmployeeId = ?',
    [customEmployeeId]
  );
  if (existingId.length > 0) {
    throw new ApiError(400, 'Trainer ID already exists. Please use a unique ID.');
  }

  // Check if email exists
  const [existingEmail] = await connection.promise().query(
    'SELECT employeeId FROM employee WHERE employeeEmail = ?',
    [employeeEmail]
  );
  if (existingEmail.length > 0) {
    throw new ApiError(400, 'Email already exists. Please use a different email.');
  }

  // Generate random password or use provided one
  const generatedPassword = password || generatePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  console.log('[Add External Trainer] Password source:', password ? 'User provided' : 'Auto-generated');

  // Create external trainer access string
  // For now, giving minimal access - only training status
  // This should match your employeeAccess bit structure
  const trainingOnlyAccess = '0'.repeat(200); // Adjust based on your access structure

  // Insert external trainer
  const insertQuery = `
    INSERT INTO employee 
    (customEmployeeId, employeeName, companyName, employeeEmail, employeePhone, 
     employeePassword, employeeAccess, userType, accessStartDate, accessEndDate, 
     employeeGender, employeeJoinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'external_trainer', ?, ?, 'Male', CURDATE())
  `;

  const [result] = await connection.promise().query(insertQuery, [
    customEmployeeId,
    employeeName,
    companyName || 'External Trainer',
    employeeEmail,
    employeePhone || null,
    hashedPassword,
    trainingOnlyAccess,
    accessStartDate,
    accessEndDate
  ]);

  const newTrainerId = result.insertId;
  console.log('[Add External Trainer] ✅ Trainer created with ID:', newTrainerId);

  // Insert skills for the external trainer
  if (skills && skills.length > 0) {
    const skillInsertQuery = 'INSERT INTO externalTrainerSkills (employeeId, skillId) VALUES (?, ?)';
    for (const skillId of skills) {
      try {
        await connection.promise().query(skillInsertQuery, [newTrainerId, skillId]);
      } catch (error) {
        console.error(`Failed to insert skill ${skillId}:`, error.message);
      }
    }
    console.log(`[Add External Trainer] ✅ Assigned ${skills.length} skill(s)`);
  }

  // Prepare trainer data for email
  const trainerData = {
    customEmployeeId,
    employeeName,
    employeeEmail,
    accessStartDate,
    accessEndDate
  };

  // Send email with credentials
  try {
    await sendCredentialsEmail(trainerData, generatedPassword);
  } catch (emailError) {
    // Even if email fails, trainer is created
    console.warn('[Add External Trainer] ⚠️ Trainer created but email failed');
  }

  res.status(201).json(
    new ApiResponse(201, {
      employeeId: newTrainerId,
      customEmployeeId,
      employeeName,
      employeeEmail,
      accessStartDate,
      accessEndDate,
      skillsAssigned: skills.length,
      emailSent: true
    }, 'External trainer added successfully. Login credentials sent via email.')
  );
});

/**
 * Get all external trainers
 * GET /api/externalTrainer/getAllExternalTrainers
 */
export const getAllExternalTrainers = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      e.employeeId,
      e.customEmployeeId,
      e.employeeName,
      e.companyName,
      e.employeeEmail,
      e.employeePhone,
      e.accessStartDate,
      e.accessEndDate,
      e.employeeJoinDate as createdAt,
      CASE 
        WHEN CURDATE() < e.accessStartDate THEN 'Not Started'
        WHEN CURDATE() > e.accessEndDate THEN 'Expired'
        ELSE 'Active'
      END as accessStatus
    FROM employee e
    WHERE e.userType = 'external_trainer'
    ORDER BY e.employeeJoinDate DESC
  `;

  const [trainers] = await connection.promise().query(query);

  // Fetch skills for each trainer
  for (const trainer of trainers) {
    const [skills] = await connection.promise().query(
      `SELECT s.skillId, s.skillName 
       FROM externalTrainerSkills ets
       JOIN skill s ON ets.skillId = s.skillId
       WHERE ets.employeeId = ?`,
      [trainer.employeeId]
    );
    trainer.skills = skills;
  }

  console.log('[Get External Trainers] Found:', trainers.length, 'trainers');

  res.status(200).json(
    new ApiResponse(200, trainers, 'External trainers fetched successfully')
  );
});

/**
 * Get external trainer by ID
 * GET /api/externalTrainer/getExternalTrainer/:id
 */
export const getExternalTrainerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [trainer] = await connection.promise().query(
    `SELECT 
      employeeId, customEmployeeId, employeeName, companyName, 
      employeeEmail, employeePhone, accessStartDate, accessEndDate, 
      employeeJoinDate as createdAt
    FROM employee 
    WHERE employeeId = ? AND userType = 'external_trainer'`,
    [id]
  );

  if (trainer.length === 0) {
    throw new ApiError(404, 'External trainer not found');
  }

  // Fetch skills for this trainer
  const [skills] = await connection.promise().query(
    `SELECT s.skillId, s.skillName 
     FROM externalTrainerSkills ets
     JOIN skill s ON ets.skillId = s.skillId
     WHERE ets.employeeId = ?`,
    [id]
  );

  trainer[0].skills = skills;

  res.status(200).json(
    new ApiResponse(200, trainer[0], 'External trainer fetched successfully')
  );
});

/**
 * Update external trainer
 * PUT /api/externalTrainer/updateExternalTrainer/:id
 */
export const updateExternalTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    employeeName, 
    employeeEmail, 
    employeePhone, 
    accessStartDate, 
    accessEndDate, 
    companyName,
    password,  // New: optional password update
    skills     // New: array of skill IDs
  } = req.body;

  console.log('[Update External Trainer] ID:', id, '| Data:', req.body);

  // Check if trainer exists
  const [existing] = await connection.promise().query(
    'SELECT employeeId FROM employee WHERE employeeId = ? AND userType = "external_trainer"',
    [id]
  );

  if (existing.length === 0) {
    throw new ApiError(404, 'External trainer not found');
  }

  // Validate dates if provided
  if (accessStartDate && accessEndDate) {
    const start = new Date(accessStartDate);
    const end = new Date(accessEndDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }
    
    if (end <= start) {
      throw new ApiError(400, 'Access end date must be after start date');
    }
  }

  // Validate email format if provided
  if (employeeEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeEmail)) {
      throw new ApiError(400, 'Invalid email format');
    }
  }

  // Validate skills array
  if (skills && (!Array.isArray(skills) || skills.length === 0)) {
    throw new ApiError(400, 'At least one skill must be selected');
  }

  // Build update query dynamically based on provided fields
  let updateFields = [];
  let updateValues = [];

  if (employeeName) {
    updateFields.push('employeeName = ?');
    updateValues.push(employeeName);
  }
  if (employeeEmail) {
    updateFields.push('employeeEmail = ?');
    updateValues.push(employeeEmail);
  }
  if (employeePhone !== undefined) {
    updateFields.push('employeePhone = ?');
    updateValues.push(employeePhone || null);
  }
  if (accessStartDate) {
    updateFields.push('accessStartDate = ?');
    updateValues.push(accessStartDate);
  }
  if (accessEndDate) {
    updateFields.push('accessEndDate = ?');
    updateValues.push(accessEndDate);
  }
  if (companyName) {
    updateFields.push('companyName = ?');
    updateValues.push(companyName);
  }
  
  // Handle password update if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push('employeePassword = ?');
    updateValues.push(hashedPassword);
    console.log('[Update External Trainer] Password updated');
  }

  // Execute update if there are fields to update
  if (updateFields.length > 0) {
    updateValues.push(id);
    const updateQuery = `
      UPDATE employee 
      SET ${updateFields.join(', ')}
      WHERE employeeId = ? AND userType = 'external_trainer'
    `;

    await connection.promise().query(updateQuery, updateValues);
  }

  // Update skills if provided
  if (skills && Array.isArray(skills)) {
    // Delete existing skills
    await connection.promise().query(
      'DELETE FROM externalTrainerSkills WHERE employeeId = ?',
      [id]
    );

    // Insert new skills
    if (skills.length > 0) {
      const skillInsertQuery = 'INSERT INTO externalTrainerSkills (employeeId, skillId) VALUES (?, ?)';
      for (const skillId of skills) {
        try {
          await connection.promise().query(skillInsertQuery, [id, skillId]);
        } catch (error) {
          console.error(`Failed to insert skill ${skillId}:`, error.message);
        }
      }
      console.log(`[Update External Trainer] ✅ Updated to ${skills.length} skill(s)`);
    }
  }

  console.log('[Update External Trainer] ✅ Updated successfully');

  res.status(200).json(
    new ApiResponse(200, {}, 'External trainer updated successfully')
  );
});

/**
 * Delete external trainer
 * DELETE /api/externalTrainer/deleteExternalTrainer/:id
 */
export const deleteExternalTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log('[Delete External Trainer] ID:', id);

  const [result] = await connection.promise().query(
    'DELETE FROM employee WHERE employeeId = ? AND userType = "external_trainer"',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, 'External trainer not found');
  }

  console.log('[Delete External Trainer] ✅ Deleted successfully');

  res.status(200).json(
    new ApiResponse(200, {}, 'External trainer deleted successfully')
  );
});

/**
 * Resend credentials email to external trainer
 * POST /api/externalTrainer/resendCredentials/:id
 */
export const resendCredentials = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get trainer details
  const [trainer] = await connection.promise().query(
    `SELECT customEmployeeId, employeeName, employeeEmail, accessStartDate, accessEndDate 
     FROM employee WHERE employeeId = ? AND userType = 'external_trainer'`,
    [id]
  );

  if (trainer.length === 0) {
    throw new ApiError(404, 'External trainer not found');
  }

  // Generate new password
  const newPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await connection.promise().query(
    'UPDATE employee SET employeePassword = ? WHERE employeeId = ?',
    [hashedPassword, id]
  );

  // Send email
  await sendCredentialsEmail(trainer[0], newPassword);

  res.status(200).json(
    new ApiResponse(200, {}, 'New credentials sent successfully via email')
  );
});
