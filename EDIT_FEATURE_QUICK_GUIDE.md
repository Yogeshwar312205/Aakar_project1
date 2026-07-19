# Quick Guide: Edit Stages & Substages

## 🎯 What Was Added

Added **Edit** buttons for both Stages and Substages in the project management section, allowing users to update details with proper history tracking.

---

## 📍 Where to Find

### Edit Stage
**Location:** My Project page (`/myProject/:id`)
- Blue "Edit" button in **top-right corner** of each stage card
- Only visible to authorized users

### Edit Substage
**Location:** My Stage page (`/myProject/:pNo/myStage/:sNo`)
- Blue edit icon (✏️) in each substage row
- Located between substage details and action buttons
- Only visible to authorized users

---

## 🔐 Permissions

**Who Can Edit?**
- Users with `employeeAccess[7]`, `[9]`, or `[11]` = '1'
- Typically: Managers, HODs, Admins

**Who Cannot Edit?**
- Regular employees without edit permissions
- Edit buttons are **hidden** (not just disabled)

---

## 📝 How to Use

### Edit a Stage
1. Navigate to **My Project** page
2. Find the stage you want to edit
3. Click the **"Edit"** button (top-right of stage card)
4. Modal opens with all stage details
5. Update any fields:
   - Stage Name
   - Owner (dropdown)
   - Start Date / End Date
   - Machine
   - Duration (days)
6. **Enter Update Reason** (required!)
7. Click **"Save Changes"**
8. Success! ✅ Stage updated & history saved

### Edit a Substage
1. Navigate to **My Stage** page (click on any stage)
2. Find the substage you want to edit
3. Click the **edit icon** (✏️) in the substage row
4. Modal opens with all substage details
5. Update any fields:
   - Substage Name
   - Owner (dropdown)
   - Start Date / End Date
   - Machine
   - Duration (days)
6. **Enter Update Reason** (required!)
7. Click **"Save Changes"**
8. Success! ✅ Substage updated & history saved

---

## ✅ Features

### ✔️ What Gets Updated
- Stage/Substage Name
- Owner assignment
- Planned dates (Start & End)
- Machine allocation
- Duration

### ✔️ What's Preserved
- Progress percentage
- Completion status
- Executed dates (if already completed)
- Sequence order
- Parent-child relationships (for substages)

### ✔️ Automatic Updates After Edit
- **Stage Progress:** Remains unchanged
- **Project Progress:** Recalculated automatically (for substages)
- **History:** Original data saved with timestamp
- **UI Refresh:** All views updated immediately

---

## 🔍 Field Details

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| **Name** | ✅ Yes | Text | Stage/Substage identifier |
| **Owner** | ✅ Yes | Dropdown | Must be valid employee |
| **Start Date** | ⬜ No | Date | Planned start date |
| **End Date** | ⬜ No | Date | Planned end date |
| **Machine** | ⬜ No | Text | Machine/equipment name |
| **Duration** | ⬜ No | Number | Duration in days |
| **Update Reason** | ✅ Yes | Text | Why this edit was made |

---

## 📊 History Tracking

### What Gets Saved
- **Original Data:** Complete snapshot before edit
- **Update Reason:** Your explanation for the change
- **Timestamp:** Exact date & time of edit
- **Who Edited:** Your employee ID (automatic)
- **Version Link:** Links to original record

### How to View History
1. Go to My Project page
2. Click **"History"** tab
3. View all past versions of stages
4. Each version shows the update reason

---

## 🚫 Validation

### Edit Will Fail If:
- ❌ Stage/Substage name is empty
- ❌ Owner is not selected
- ❌ Update reason is empty
- ❌ Owner doesn't exist in system

### Success Indicators:
- ✅ Green toast notification: "Stage/Substage updated successfully!"
- ✅ Modal closes automatically
- ✅ Data refreshes immediately
- ✅ Changes visible in UI

### Error Indicators:
- ❌ Red toast notification with error message
- ❌ Modal stays open
- ❌ Form highlights invalid fields

---

## 🎨 UI Elements

### Stage Edit Button
```
┌─────────────────────────────────┐
│ Stage Card              [Edit]  │ ← Blue button, top-right
│ Stage Name: Assembly            │
│ Owner: John Doe                 │
│ Progress: 45%                   │
└─────────────────────────────────┘
```

### Substage Edit Button
```
☐ ▶ Substage Name                    45%  ✓ Done  [✏️] [+] [🗑️]
     Owner: Jane • Machine: M1                     ↑ Edit icon
```

### Edit Modal
```
╔═══════════════════════════════════════════╗
║ Edit Stage: Assembly                       ║
╠═══════════════════════════════════════════╣
║                                            ║
║  Stage Name*    [Assembly              ]  ║
║  Owner*         [John Doe (EMP001)    ▼]  ║
║  Start Date     [01-01-2024]              ║
║  End Date       [31-01-2024]              ║
║  Machine        [Machine 1            ]   ║
║  Duration       [30                   ]   ║
║  Update Reason* [Changed timeline     ]   ║
║                 [                     ]   ║
║                                            ║
╠═══════════════════════════════════════════╣
║              [Cancel]  [Save Changes]     ║
╚═══════════════════════════════════════════╝
```

---

## 💡 Tips & Tricks

### Best Practices
1. **Always provide meaningful update reasons**
   - ❌ Bad: "updated"
   - ✅ Good: "Extended timeline due to material delay"

2. **Update multiple related items together**
   - Edit stage, then related substages
   - Keeps timeline consistent

3. **Check dependencies before editing**
   - Ensure child substages align with stage dates
   - Consider impact on project timeline

4. **Use history to track changes**
   - Review past edits before making new ones
   - Learn from previous adjustments

### Keyboard Shortcuts (in modal)
- **Enter:** Save changes (when not in textarea)
- **Escape:** Close modal without saving
- **Tab:** Navigate between fields

---

## ⚙️ Technical Notes

### Data Format
- **Dates:** DD-MM-YYYY (display) → YYYY-MM-DD (API)
- **Owner:** "Name(EmployeeId)" format
- **Duration:** Numeric, in days

### API Calls
- **Stage:** `PUT /api/stages/:id`
- **Substage:** `PUT /api/subStages/:id`
- **Response:** Updates database + creates history entry

### State Updates
- Redux actions triggered automatically
- UI refreshes without page reload
- All related views updated (project, stage, substage)

---

## 🐛 Troubleshooting

### Problem: Edit button not showing
**Solution:**
- Check your user permissions
- Verify employeeAccess array in profile
- Contact admin if needed

### Problem: Owner dropdown empty
**Solution:**
- Wait for employees to load
- Refresh page
- Check internet connection

### Problem: Save button disabled
**Solution:**
- Fill all required fields (marked with *)
- Provide update reason
- Ensure valid data in all fields

### Problem: Changes not saving
**Solution:**
- Check console for errors (F12)
- Verify API is accessible
- Try again after a moment
- Contact support if persists

### Problem: Modal won't close
**Solution:**
- Click "Cancel" button
- Press Escape key
- Refresh page if stuck

---

## 📞 Need Help?

### Common Questions

**Q: Can I edit completed stages?**
A: Yes! Progress and completion status are preserved.

**Q: Will editing affect progress?**
A: No for manual edits. Progress is only recalculated when substages complete.

**Q: Can I undo an edit?**
A: Not directly, but history is saved. Contact admin to revert.

**Q: Who can see my edit history?**
A: Anyone with access to the project history tab.

**Q: Is there a limit to how many times I can edit?**
A: No limit. All versions are tracked.

---

## 🚀 Quick Reference

### Edit Stage
```
1. Go to My Project page
2. Click "Edit" on stage card
3. Update fields + add reason
4. Click "Save Changes"
```

### Edit Substage
```
1. Go to My Stage page
2. Click edit icon (✏️) on substage
3. Update fields + add reason
4. Click "Save Changes"
```

### Required Fields
```
✅ Name
✅ Owner  
✅ Update Reason
```

### Optional Fields
```
⬜ Start Date
⬜ End Date
⬜ Machine
⬜ Duration
```

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024  
**Version:** 1.0
