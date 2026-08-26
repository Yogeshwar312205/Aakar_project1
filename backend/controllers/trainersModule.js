import { connection } from "../db/index.js";
import express from "express";

const router = express.Router();

// ============================================================
// TRAINERS CRUD
// ============================================================

// POST /api/trainers — Add new trainer
router.post("/api/trainers", (req, res) => {
  const {
    trainer_type,
    employee_id,
    full_name,
    email,
    phone,
    organization,
    specialization,
    password,
    expiry_date,
  } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ message: "full_name and email are required." });
  }

  if (trainer_type === "INTERNAL" && !employee_id) {
    return res.status(400).json({ message: "employee_id is required for Internal trainers." });
  }

  const query = `
    INSERT INTO trainers (trainer_type, employee_id, full_name, email, phone, organization, specialization, password, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    trainer_type || "INTERNAL",
    trainer_type === "INTERNAL" ? employee_id : null,
    full_name,
    email,
    phone || null,
    trainer_type === "EXTERNAL" ? organization : null,
    specialization || null,
    trainer_type === "EXTERNAL" ? password : null,
    trainer_type === "EXTERNAL" && expiry_date ? expiry_date : null,
  ];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding trainer:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "A trainer with this email already exists." });
      }
      return res.status(500).json({ message: "Failed to add trainer.", error: err.message });
    }
    res.status(201).json({
      message: "Trainer added successfully.",
      id: result.insertId,
      full_name,
      email,
      trainer_type: trainer_type || "INTERNAL",
    });
  });
});

// GET /api/trainers — Fetch all trainers
router.get("/api/trainers", (req, res) => {
  const query = `
    SELECT
      t.id,
      t.trainer_type,
      t.employee_id,
      t.full_name,
      t.email,
      t.phone,
      t.organization,
      t.specialization,
      t.expiry_date,
      t.is_active,
      t.created_at,
      CASE
        WHEN t.trainer_type = 'EXTERNAL' AND t.expiry_date IS NOT NULL AND t.expiry_date < CURDATE() THEN 'Expired'
        WHEN t.is_active = 1 THEN 'Active'
        ELSE 'Inactive'
      END AS status_label
    FROM trainers t
    ORDER BY t.created_at DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching trainers:", err);
      return res.status(500).json({ message: "Failed to fetch trainers.", error: err.message });
    }

    // Auto-deactivate expired external trainers
    const expiredIds = results
      .filter(
        (r) =>
          r.trainer_type === "EXTERNAL" &&
          r.expiry_date &&
          new Date(r.expiry_date) < new Date() &&
          r.is_active === 1
      )
      .map((r) => r.id);

    if (expiredIds.length > 0) {
      connection.query(
        "UPDATE trainers SET is_active = 0 WHERE id IN (?)",
        [expiredIds],
        (updateErr) => {
          if (updateErr) console.error("Error auto-deactivating expired trainers:", updateErr);
        }
      );
      // Update the results in-place for the current response
      results.forEach((r) => {
        if (expiredIds.includes(r.id)) {
          r.is_active = 0;
          r.status_label = "Expired";
        }
      });
    }

    res.json(results);
  });
});

// PUT /api/trainers/:id — Update trainer details
router.put("/api/trainers/:id", (req, res) => {
  const { id } = req.params;
  const {
    trainer_type,
    employee_id,
    full_name,
    email,
    phone,
    organization,
    specialization,
    password,
    expiry_date,
  } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ message: "full_name and email are required." });
  }

  const query = `
    UPDATE trainers
    SET trainer_type = ?, employee_id = ?, full_name = ?, email = ?, phone = ?,
        organization = ?, specialization = ?, 
        ${password ? "password = ?," : ""}
        expiry_date = ?
    WHERE id = ?
  `;

  const values = [
    trainer_type || "INTERNAL",
    trainer_type === "INTERNAL" ? employee_id : null,
    full_name,
    email,
    phone || null,
    trainer_type === "EXTERNAL" ? organization : null,
    specialization || null,
  ];

  if (password) values.push(password);
  values.push(trainer_type === "EXTERNAL" && expiry_date ? expiry_date : null);
  values.push(id);

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating trainer:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "A trainer with this email already exists." });
      }
      return res.status(500).json({ message: "Failed to update trainer.", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trainer not found." });
    }
    res.json({ message: "Trainer updated successfully.", id });
  });
});

// PUT /api/trainers/:id/toggle-status — Toggle is_active
router.put("/api/trainers/:id/toggle-status", (req, res) => {
  const { id } = req.params;

  const query = "UPDATE trainers SET is_active = NOT is_active WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error toggling trainer status:", err);
      return res.status(500).json({ message: "Failed to toggle status.", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trainer not found." });
    }
    res.json({ message: "Trainer status toggled successfully.", id });
  });
});

// DELETE /api/trainers/:id — Delete trainer
router.delete("/api/trainers/:id", (req, res) => {
  const { id } = req.params;

  // Check if trainer has any training programs
  connection.query(
    "SELECT COUNT(*) AS cnt FROM training_programs WHERE trainer_id = ?",
    [id],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking trainer programs:", checkErr);
        return res.status(500).json({ message: "Failed to delete trainer.", error: checkErr.message });
      }

      if (checkResult[0].cnt > 0) {
        // Soft delete — deactivate instead
        connection.query("UPDATE trainers SET is_active = 0 WHERE id = ?", [id], (updateErr) => {
          if (updateErr) {
            console.error("Error deactivating trainer:", updateErr);
            return res.status(500).json({ message: "Failed to deactivate trainer.", error: updateErr.message });
          }
          return res.json({
            message: "Trainer has associated programs and was deactivated instead of deleted.",
            id,
          });
        });
      } else {
        connection.query("DELETE FROM trainers WHERE id = ?", [id], (delErr, result) => {
          if (delErr) {
            console.error("Error deleting trainer:", delErr);
            return res.status(500).json({ message: "Failed to delete trainer.", error: delErr.message });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Trainer not found." });
          }
          res.json({ message: "Trainer deleted successfully.", id });
        });
      }
    }
  );
});

// POST /api/trainers/login — External trainer login
router.post("/api/trainers/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const query = "SELECT * FROM trainers WHERE email = ? AND trainer_type = 'EXTERNAL'";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error during trainer login:", err);
      return res.status(500).json({ message: "Login failed.", error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    const trainer = results[0];

    // Auto-deactivate if expired
    if (trainer.expiry_date && new Date(trainer.expiry_date) < new Date()) {
      if (trainer.is_active === 1) {
        connection.query("UPDATE trainers SET is_active = 0 WHERE id = ?", [trainer.id]);
      }
      return res.status(403).json({ message: "Account expired. Please contact the administrator." });
    }

    if (!trainer.is_active) {
      return res.status(403).json({ message: "Account is deactivated. Please contact the administrator." });
    }

    // Simple password check (plain text as per schema — no bcrypt in existing codebase)
    if (trainer.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.json({
      message: "Login successful.",
      trainer: {
        id: trainer.id,
        full_name: trainer.full_name,
        email: trainer.email,
        organization: trainer.organization,
        specialization: trainer.specialization,
      },
    });
  });
});

// ============================================================
// TRAINING PROGRAMS / SESSIONS
// ============================================================

// POST /api/training/sessions — Create training session + bulk-insert attendees
router.post("/api/training/sessions", (req, res) => {
  const { title, description, trainer_id, start_date, end_date, employee_ids } = req.body;

  if (!title || !trainer_id || !start_date || !end_date) {
    return res.status(400).json({ message: "title, trainer_id, start_date, and end_date are required." });
  }

  const insertProgram = `
    INSERT INTO training_programs (title, description, trainer_id, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    insertProgram,
    [title, description || null, trainer_id, start_date, end_date],
    (err, result) => {
      if (err) {
        console.error("Error creating training session:", err);
        return res.status(500).json({ message: "Failed to create training session.", error: err.message });
      }

      const trainingId = result.insertId;

      if (employee_ids && Array.isArray(employee_ids) && employee_ids.length > 0) {
        const attendeeValues = employee_ids.map((empId) => [trainingId, empId]);
        const insertAttendees = "INSERT INTO training_attendees (training_id, employee_id) VALUES ?";

        connection.query(insertAttendees, [attendeeValues], (attErr) => {
          if (attErr) {
            console.error("Error inserting attendees:", attErr);
            return res.status(500).json({
              message: "Training session created but failed to add attendees.",
              trainingId,
              error: attErr.message,
            });
          }

          res.status(201).json({
            message: "Training session created with attendees.",
            trainingId,
            attendeeCount: employee_ids.length,
          });
        });
      } else {
        res.status(201).json({
          message: "Training session created (no attendees added).",
          trainingId,
        });
      }
    }
  );
});

// GET /api/training/records — Fetch complete training logs
router.get("/api/training/records", (req, res) => {
  const query = `
    SELECT
      tp.id AS program_id,
      tp.title,
      tp.description,
      tp.start_date,
      tp.end_date,
      tp.status,
      tp.created_at AS program_created_at,
      t.id AS trainer_id,
      t.full_name AS trainer_name,
      t.trainer_type,
      t.organization AS trainer_organization,
      t.email AS trainer_email,
      (SELECT COUNT(*) FROM training_attendees ta WHERE ta.training_id = tp.id) AS attendee_count
    FROM training_programs tp
    INNER JOIN trainers t ON tp.trainer_id = t.id
    ORDER BY tp.start_date DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching training records:", err);
      return res.status(500).json({ message: "Failed to fetch training records.", error: err.message });
    }
    res.json(results);
  });
});

// PUT /api/training/sessions/:id — Update training session
router.put("/api/training/sessions/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, trainer_id, start_date, end_date, status } = req.body;

  const query = `
    UPDATE training_programs
    SET title = ?, description = ?, trainer_id = ?, start_date = ?, end_date = ?, status = ?
    WHERE id = ?
  `;

  connection.query(
    query,
    [title, description || null, trainer_id, start_date, end_date, status || "SCHEDULED", id],
    (err, result) => {
      if (err) {
        console.error("Error updating training session:", err);
        return res.status(500).json({ message: "Failed to update training session.", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Training session not found." });
      }
      res.json({ message: "Training session updated successfully.", id });
    }
  );
});

// GET /api/training/sessions/:id/attendees — Get attendees for a session
router.get("/api/training/sessions/:id/attendees", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      ta.id AS attendee_id,
      ta.employee_id,
      ta.status,
      ta.feedback,
      e.employeeName,
      d.departmentName
    FROM training_attendees ta
    LEFT JOIN employee e ON ta.employee_id = e.employeeId
    LEFT JOIN employeeDesignation ed ON e.employeeId = ed.employeeId
    LEFT JOIN department d ON ed.departmentId = d.departmentId
    WHERE ta.training_id = ?
    ORDER BY e.employeeName ASC
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching attendees:", err);
      return res.status(500).json({ message: "Failed to fetch attendees.", error: err.message });
    }
    res.json(results);
  });
});

// PUT /api/training/attendees/:id — Update attendee status/feedback
router.put("/api/training/attendees/:id", (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  const query = "UPDATE training_attendees SET status = ?, feedback = ? WHERE id = ?";
  connection.query(query, [status, feedback || null, id], (err, result) => {
    if (err) {
      console.error("Error updating attendee:", err);
      return res.status(500).json({ message: "Failed to update attendee.", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Attendee record not found." });
    }
    res.json({ message: "Attendee updated successfully.", id });
  });
});

// Export the router
export default router;
