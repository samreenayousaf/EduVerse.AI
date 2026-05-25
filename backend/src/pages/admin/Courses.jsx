import React, { useEffect, useState } from "react";
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, Chip, Typography, CircularProgress, Button,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  IconButton, Tooltip,
} from "@mui/material";
import {
  Search, Refresh, Add, PersonAdd, SwapHoriz, Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { adminAPI } from "../../services/api";
import { useThemeMode } from "../../context/ThemeContext";

// ── Empty form templates ───────────────────────────────────────────────
const EMPTY_COURSE = {
  title: "", description: "", category: "", level: "Beginner",
  duration: "", price: 0, instructorId: "", instructorName: "",
};
const EMPTY_INSTRUCTOR = { name: "", email: "", password: "" };

export default function AdminCourses() {
  const { mode } = useThemeMode();
  const isDark   = mode === "dark";
  const surface  = isDark ? "#1F2937" : "#fff";
  const border   = isDark ? "#374151" : "#E5E7EB";
  const txt      = isDark ? "#F9FAFB" : "#111827";
  const sub      = isDark ? "#9CA3AF" : "#6B7280";
  const hover    = isDark ? "#374151" : "#F3F4F6";

  // ── State ──────────────────────────────────────────────────────────
  const [courses,      setCourses]      = useState([]);
  const [instructors,  setInstructors]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingInst,  setLoadingInst]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("All");
  const [updating,     setUpdating]     = useState({});

  // Dialog: Create Course
  const [createOpen,   setCreateOpen]   = useState(false);
  const [courseForm,   setCourseForm]   = useState(EMPTY_COURSE);
  const [creating,     setCreating]     = useState(false);

  // Dialog: Assign Instructor to existing course
  const [assignOpen,   setAssignOpen]   = useState(false);
  const [assignCourse, setAssignCourse] = useState(null);   // the course being re-assigned
  const [assignInstId, setAssignInstId] = useState("");
  const [assigning,    setAssigning]    = useState(false);

  // Dialog: Create New Instructor (quick-add inside course dialog)
  const [newInstOpen,  setNewInstOpen]  = useState(false);
  const [instForm,     setInstForm]     = useState(EMPTY_INSTRUCTOR);
  const [creatingInst, setCreatingInst] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCourses();
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    setLoadingInst(true);
    try {
      const res = await adminAPI.getInstructors();
      setInstructors(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Could not load instructors list");
    } finally {
      setLoadingInst(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  // ── Status change ──────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await adminAPI.updateCourseStatus(id, { status });
      setCourses(prev => prev.map(c => (c._id || c.id) === id ? { ...c, status } : c));
      toast.success(`Course marked as "${status}"`);
    } catch {
      toast.error("Status update failed");
    } finally {
      setUpdating(p => ({ ...p, [id]: false }));
    }
  };

  // ── Create Course ──────────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!courseForm.title.trim())       return toast.error("Title is required");
    if (!courseForm.description.trim()) return toast.error("Description is required");
    if (!courseForm.category.trim())    return toast.error("Category is required");
    if (!courseForm.instructorId)       return toast.error("Please select an instructor");

    setCreating(true);
    try {
      const res = await adminAPI.createCourse(courseForm);
      setCourses(prev => [res.data, ...prev]);
      toast.success(`✅ Course "${courseForm.title}" created and assigned to ${courseForm.instructorName}!`);
      setCreateOpen(false);
      setCourseForm(EMPTY_COURSE);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleInstructorSelect = (instructorId) => {
    const inst = instructors.find(i => i.id === instructorId);
    setCourseForm(f => ({
      ...f,
      instructorId,
      instructorName: inst ? inst.name : "",
    }));
  };

  // ── Assign Instructor to existing course ───────────────────────────
  const openAssignDialog = (course) => {
    setAssignCourse(course);
    setAssignInstId(course.instructorId || "");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assignInstId) return toast.error("Please select an instructor");
    const inst = instructors.find(i => i.id === assignInstId);
    if (!inst) return toast.error("Instructor not found");

    const courseId = assignCourse._id || assignCourse.id;
    setAssigning(true);
    try {
      await adminAPI.assignInstructor(courseId, {
        instructorId:   inst.id,
        instructorName: inst.name,
      });
      setCourses(prev =>
        prev.map(c =>
          (c._id || c.id) === courseId
            ? { ...c, instructorId: inst.id, instructorName: inst.name }
            : c
        )
      );
      toast.success(`✅ "${assignCourse.title}" re-assigned to ${inst.name}!`);
      setAssignOpen(false);
      setAssignCourse(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // ── Quick-create instructor ────────────────────────────────────────
  const handleCreateInstructor = async () => {
    if (!instForm.name.trim())          return toast.error("Name is required");
    if (!instForm.email.trim())         return toast.error("Email is required");
    if (instForm.password.length < 6)   return toast.error("Password min 6 characters");

    setCreatingInst(true);
    try {
      await adminAPI.createInstructor(instForm);
      toast.success(`✅ Instructor "${instForm.name}" created!`);
      setNewInstOpen(false);
      setInstForm(EMPTY_INSTRUCTOR);
      // Refresh the instructor list so the new one appears in dropdowns
      await fetchInstructors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create instructor");
    } finally {
      setCreatingInst(false);
    }
  };

  // ── Filter / group ─────────────────────────────────────────────────
  const filtered = courses.filter(c =>
    (c.title?.toLowerCase().includes(search.toLowerCase()) ||
     c.instructorName?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "All" || c.status === filter)
  );

  const byInstructor = {};
  courses.forEach(c => {
    const n = c.instructorName || "Unknown";
    if (!byInstructor[n]) byInstructor[n] = [];
    byInstructor[n].push(c);
  });

  // ── Shared select styles ───────────────────────────────────────────
  const selectSx = {
    bgcolor: surface, color: txt,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: border },
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <Box>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: txt }}>All Courses</Typography>
          <Typography variant="body2" sx={{ color: sub }}>{courses.length} total courses</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchCourses} size="small"
            sx={{ borderColor: border, color: sub }}>
            Refresh
          </Button>
          {/* Quick-create instructor button */}
          <Button variant="outlined" startIcon={<PersonAdd />} onClick={() => setNewInstOpen(true)}
            size="small" sx={{ borderColor: border, color: sub }}>
            New Instructor
          </Button>
          {/* Create course + assign button */}
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}
            size="small" sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#374151" } }}>
            Create Course
          </Button>
        </Box>
      </Box>

      {/* ── Instructor summary cards ── */}
      {Object.keys(byInstructor).length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {Object.entries(byInstructor).map(([name, crs]) => (
            <Card key={name} sx={{
              p: 2, display: "flex", alignItems: "center", gap: 1.5, minWidth: 220,
              bgcolor: surface, border: `1px solid ${border}`, borderRadius: 2, boxShadow: "none",
            }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: hover, fontSize: 14, fontWeight: 700, color: txt, border: `1px solid ${border}` }}>
                {name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: txt }}>{name}</Typography>
                <Typography variant="caption" sx={{ color: sub }}>
                  {crs.length} course{crs.length !== 1 ? "s" : ""} •{" "}
                  {crs.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0)} students
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* ── Filters ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by title or instructor…" value={search}
          onChange={e => setSearch(e.target.value)} size="small"
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { bgcolor: surface, "& fieldset": { borderColor: border } } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: sub, fontSize: 18 }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: sub }}>Status</InputLabel>
          <Select value={filter} label="Status" onChange={e => setFilter(e.target.value)} sx={selectSx}>
            {["All", "published", "draft", "archived"].map(s => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Courses table ── */}
      <Card sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: 3, boxShadow: "none" }}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: sub }}>No courses found.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, color: sub, fontSize: "0.78rem", bgcolor: hover } }}>
                <TableCell>Course</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Change Status</TableCell>
                <TableCell align="center">Re-Assign</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(c => {
                const id = c._id || c.id;
                return (
                  <TableRow key={id} sx={{ "&:hover": { bgcolor: hover }, "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: txt }}>{c.title}</Typography>
                      <Typography variant="caption" sx={{ color: sub }}>{c.level} • {c.duration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: hover, fontSize: 11, fontWeight: 700, color: txt, border: `1px solid ${border}` }}>
                          {c.instructorName?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: txt }}>{c.instructorName || "—"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.category} size="small" variant="outlined" sx={{ fontSize: "0.68rem" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: txt }}>
                        {c.enrolledStudents?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small"
                        color={c.status === "published" ? "success" : c.status === "archived" ? "error" : "default"}
                        sx={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.68rem" }} />
                    </TableCell>
                    <TableCell>
                      <Select size="small" value={c.status || "draft"} disabled={updating[id]}
                        onChange={e => handleStatusChange(id, e.target.value)}
                        sx={{ fontSize: "0.75rem", minWidth: 130, ...selectSx }}>
                        <MenuItem value="published">✅ Published</MenuItem>
                        <MenuItem value="draft">📝 Draft</MenuItem>
                        <MenuItem value="archived">🗄️ Archived</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Re-assign Instructor">
                        <IconButton size="small" onClick={() => openAssignDialog(c)}
                          sx={{ color: sub, "&:hover": { color: txt } }}>
                          <SwapHoriz fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>


      {/* ════════════════════════════════════════════════════════════════
          DIALOG 1 — Create Course & Assign Instructor
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={createOpen} onClose={() => { setCreateOpen(false); setCourseForm(EMPTY_COURSE); }}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Create & Assign Course
          <IconButton size="small" onClick={() => { setCreateOpen(false); setCourseForm(EMPTY_COURSE); }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>

          <TextField label="Course Title *" value={courseForm.title} fullWidth autoFocus
            onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />

          <TextField label="Description *" value={courseForm.description} fullWidth multiline rows={3}
            onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Category *" value={courseForm.category} fullWidth
              placeholder="e.g. Programming, Design…"
              onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select value={courseForm.level} label="Level"
                onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))}>
                {["Beginner", "Intermediate", "Advanced"].map(l => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Duration" value={courseForm.duration} fullWidth
              placeholder="e.g. 8 weeks"
              onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))} />
            <TextField label="Price ($)" type="number" value={courseForm.price} fullWidth
              onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))} />
          </Box>

          {/* Instructor dropdown */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: sub, fontWeight: 600 }}>ASSIGN INSTRUCTOR *</Typography>
              <Button size="small" startIcon={<PersonAdd sx={{ fontSize: 14 }} />}
                onClick={() => setNewInstOpen(true)}
                sx={{ fontSize: "0.72rem", color: sub, textTransform: "none", p: "2px 8px" }}>
                Create new instructor
              </Button>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select Instructor</InputLabel>
              <Select value={courseForm.instructorId} label="Select Instructor"
                onChange={e => handleInstructorSelect(e.target.value)}>
                {loadingInst ? (
                  <MenuItem disabled>Loading instructors…</MenuItem>
                ) : instructors.length === 0 ? (
                  <MenuItem disabled>No instructors yet — create one above ↑</MenuItem>
                ) : (
                  instructors.map(inst => (
                    <MenuItem key={inst.id} value={inst.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "#374151", color: "#fff" }}>
                          {inst.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{inst.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{inst.email}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => { setCreateOpen(false); setCourseForm(EMPTY_COURSE); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateCourse} disabled={creating}
            sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#374151" } }}>
            {creating ? <CircularProgress size={18} color="inherit" /> : "Create & Assign"}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ════════════════════════════════════════════════════════════════
          DIALOG 2 — Re-Assign Instructor to existing course
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={assignOpen} onClose={() => { setAssignOpen(false); setAssignCourse(null); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Re-Assign Instructor
          <IconButton size="small" onClick={() => { setAssignOpen(false); setAssignCourse(null); }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: "20px !important" }}>
          {assignCourse && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: hover, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: txt }}>{assignCourse.title}</Typography>
              <Typography variant="caption" sx={{ color: sub }}>
                Currently: {assignCourse.instructorName || "Unassigned"}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>New Instructor</InputLabel>
            <Select value={assignInstId} label="New Instructor"
              onChange={e => setAssignInstId(e.target.value)}>
              {loadingInst ? (
                <MenuItem disabled>Loading…</MenuItem>
              ) : instructors.length === 0 ? (
                <MenuItem disabled>No instructors found</MenuItem>
              ) : (
                instructors.map(inst => (
                  <MenuItem key={inst.id} value={inst.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "#374151", color: "#fff" }}>
                        {inst.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{inst.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{inst.email}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => { setAssignOpen(false); setAssignCourse(null); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={assigning}
            sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#374151" } }}>
            {assigning ? <CircularProgress size={18} color="inherit" /> : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ════════════════════════════════════════════════════════════════
          DIALOG 3 — Quick-Create New Instructor
      ════════════════════════════════════════════════════════════════ */}
      <Dialog open={newInstOpen} onClose={() => { setNewInstOpen(false); setInstForm(EMPTY_INSTRUCTOR); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Create Instructor Account
          <IconButton size="small" onClick={() => { setNewInstOpen(false); setInstForm(EMPTY_INSTRUCTOR); }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "20px !important" }}>
          <TextField label="Full Name *" value={instForm.name} fullWidth autoFocus
            onChange={e => setInstForm(f => ({ ...f, name: e.target.value }))} />
          <TextField label="Email Address *" type="email" value={instForm.email} fullWidth
            onChange={e => setInstForm(f => ({ ...f, email: e.target.value }))} />
          <TextField label="Password *" type="password" value={instForm.password} fullWidth
            helperText="Minimum 6 characters"
            onChange={e => setInstForm(f => ({ ...f, password: e.target.value }))} />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => { setNewInstOpen(false); setInstForm(EMPTY_INSTRUCTOR); }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateInstructor} disabled={creatingInst}
            sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#374151" } }}>
            {creatingInst ? <CircularProgress size={18} color="inherit" /> : "Create Instructor"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}