# Admin Panel Debugging Guide

## Enhanced Error Handling

All database operations (Edit, Delete, Add Student, Publish Notice) now include enhanced error handling with detailed error messages and console logging.

## How to Debug Database Operations

### 1. **Check Browser Console for Errors**
When Edit/Delete/Add operations fail, open the browser's Developer Console:
- **Windows/Linux:** Press `F12` or `Ctrl+Shift+I`
- **Mac:** Press `Cmd+Option+I`

### 2. **Look for Error Messages**
You will see one of these error types:

#### RLS Policy Errors
```
Supabase error updating student: {
  message: "new row violates row-level security policy",
  code: "42501"
}
```
**Solution:** The database has Row Level Security (RLS) policies that are blocking anonymous writes. You need to disable RLS or create proper RLS policies in Supabase.

#### Authentication Errors
```
Supabase error updating student: {
  message: "Invalid API key",
  code: "401"
}
```
**Solution:** Check your Supabase API credentials in `src/lib/supabase.ts`

#### Column Not Found
```
Supabase error updating student: {
  message: "column "unknown_field" does not exist",
  code: "42703"
}
```
**Solution:** A field doesn't exist in the database schema

### 3. **Enable Supabase RLS for Public Access**

To fix RLS blocking issues:

1. Go to [Supabase Console](https://supabase.com)
2. Select your project
3. Go to **Authentication > Policies**
4. For each table (students, applications, notices):
   - Click the table name
   - Go to **RLS** tab
   - Create new policies:
     ```sql
     -- For SELECT (read)
     CREATE POLICY "Allow public select" ON students 
     FOR SELECT USING (true);
     
     -- For INSERT (add)
     CREATE POLICY "Allow public insert" ON students 
     FOR INSERT WITH CHECK (true);
     
     -- For UPDATE (edit)
     CREATE POLICY "Allow public update" ON students 
     FOR UPDATE USING (true) WITH CHECK (true);
     
     -- For DELETE
     CREATE POLICY "Allow public delete" ON students 
     FOR DELETE USING (true);
     ```

### 4. **Check Console Logs**

Successful operations will show:
```
Student updated successfully: [{ registration_no: "2024001", ... }]
Student deleted successfully: [{ registration_no: "2024001", ... }]
Notice published successfully: [{ id: "123", ... }]
```

### 5. **Test the Operations**

1. **Edit Student:**
   - Click the Edit button on a student
   - Change a field (like Fees Paid)
   - Click "Save Changes"
   - Check console for success/error message

2. **Delete Student:**
   - Click the Delete button
   - Confirm the dialog
   - Check console for success/error message

3. **Add Student:**
   - Click "Add Student" button
   - Fill in all required fields (*)
   - Click "Add Student"
   - Check console for success/error message

4. **Edit Application Status:**
   - Go to Applications tab
   - Click Approve or Reject
   - Check console for success/error message

### 6. **What Success Looks Like**

- Operation completes without errors
- Success alert appears
- Console shows the operation details
- Data refreshes in the UI
- Changes persist after page refresh

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No response to edit/delete | RLS policies blocking writes | Disable RLS or create public policies |
| "42501" error in console | Row Level Security violation | Update RLS policies |
| Changes don't save | Operation succeeded but UI didn't refresh | Page reload shows data was saved |
| Alert shows error message | Database rejected the operation | Check console for detailed error |

## Files Modified

- `src/components/AdminDashboard.tsx` - Enhanced all CRUD operations with error handling
  - `saveStudentChanges()` - Edit student
  - `deleteStudent()` - Delete student
  - `updateApplicationStatus()` - Approve/reject application
  - `publishNotice()` - Add notice
  - `deleteNotice()` - Delete notice
  - Form submit for adding student

All operations now:
✅ Capture the Supabase error response
✅ Log detailed error messages to console
✅ Display user-friendly error alerts
✅ Return early on error (don't proceed with loadData)
