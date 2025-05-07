import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { query } from "firebase/firestore";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type Lecture = {
  id: string;
  title: string;
  lecturer: string;
  date_posted: any; // Firestore Timestamp
  access_by: string[];
  urls: string;
};

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Partial<Course> | null>(
    null
  );
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [lecturesByCourse, setLecturesByCourse] = useState<
    Record<string, Lecture[]>
  >({});
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] =
    useState<Partial<Lecture> | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null);
  const [lectureAccessFilter, setLectureAccessFilter] = useState<
    "all" | "Online" | "Onsite"
  >("all");

  const fetchCourses = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "courses"));
    const result: Course[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Course, "id">),
    }));
    setCourses(result);
    setLoading(false);
  };

  const loadLectures = async (courseId: string) => {
    const lecturesRef = collection(db, "courses", courseId, "lectures");
    const snap = await getDocs(query(lecturesRef));
    const lectures: Lecture[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Lecture, "id">),
    }));

    setLecturesByCourse((prev) => ({ ...prev, [courseId]: lectures }));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSave = async () => {
    if (!selectedCourse?.title) return alert("Title is required");

    const courseData = {
      title: selectedCourse.title,
      description: selectedCourse.description || "",
      category: selectedCourse.category || "",
      createdAt: Timestamp.now(),
    };

    if (selectedCourse.id) {
      await updateDoc(doc(db, "courses", selectedCourse.id), courseData);
    } else {
      await addDoc(collection(db, "courses"), courseData);
    }

    setOpenDialog(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("Delete this course?")) {
      await deleteDoc(doc(db, "courses", courseId));
      fetchCourses();
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Courses</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedCourse(null);
            setOpenDialog(true);
          }}
        >
          Add Course
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          {courses.map((course) => (
            <Accordion
              key={course.id}
              expanded={expandedCourseId === course.id}
              onChange={(_, isExpanded) => {
                setExpandedCourseId(isExpanded ? course.id : null);
                if (isExpanded && !lecturesByCourse[course.id]) {
                  loadLectures(course.id);
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  flexGrow={1}
                  sx={{
                    height: "20px",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography variant="subtitle1">{course.title}</Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                    {course.category} — {course.description}
                  </Typography> */}
                </Box>
                <Box
                  ml="auto"
                  sx={{
                    display: "flex", // ✅ Puts items in one row
                    alignItems: "center", // ✅ Aligns icons vertically (optional)
                    gap: 1, // ✅ Adds spacing between icons (optional)
                  }}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                      setOpenDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                  gap={2} // 👈 adds consistent spacing between items
                >
                  <FormControl sx={{ width: 180 }}>
                    <InputLabel>Filter Access</InputLabel>
                    <Select
                      value={lectureAccessFilter}
                      size="small" // ✅ cleaner, compact preset
                      sx={{
                        height: 40, // total height of the select component
                        "& .MuiSelect-select": {
                          paddingTop: 1,
                          paddingBottom: 1,
                        },
                      }}
                      onChange={(e) =>
                        setLectureAccessFilter(
                          e.target.value as "all" | "Online" | "Onsite"
                        )
                      }
                      label="Filter Access"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Online">Online</MenuItem>
                      <MenuItem value="Onsite">Onsite</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedLecture(null);
                      setTargetCourseId(course.id);
                      setLectureDialogOpen(true);
                    }}
                  >
                    + Add Lecture
                  </Button>
                </Box>

                {lecturesByCourse[course.id]?.length ? (
                  <Table
                    sx={{
                      tableLayout: "fixed",
                      width: "100%", // 👈 Set your fixed table width here
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Actions</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Lecturer</TableCell>
                        <TableCell>Date Posted</TableCell>
                        <TableCell>Access by</TableCell>
                        <TableCell>Video</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lecturesByCourse[course.id]
                        .filter((lecture) =>
                          lectureAccessFilter === "all"
                            ? true
                            : lecture.access_by?.includes(lectureAccessFilter)
                        )
                        .map((lecture) => (
                          <TableRow key={lecture.id}>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedLecture(lecture);
                                  setTargetCourseId(course.id);
                                  setLectureDialogOpen(true);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      `Delete lecture "${lecture.title}"?`
                                    )
                                  )
                                    return;
                                  await deleteDoc(
                                    doc(
                                      db,
                                      "courses",
                                      course.id,
                                      "lectures",
                                      lecture.id
                                    )
                                  );
                                  loadLectures(course.id);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>

                            <TableCell
                              sx={{
                                minWidth: 200,
                                maxWidth: 400,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {lecture.title}
                            </TableCell>
                            <TableCell
                            // sx={{
                            //   minWidth: 150,
                            //   maxWidth: 250,
                            //   whiteSpace: "nowrap",
                            //   overflow: "hidden",
                            //   textOverflow: "ellipsis",
                            // }}
                            >
                              {lecture.lecturer}
                            </TableCell>
                            <TableCell>
                              {lecture.date_posted
                                ?.toDate?.()
                                .toLocaleDateString() ?? "N/A"}
                            </TableCell>
                            <TableCell
                              sx={{
                                minWidth: 150,
                                maxWidth: 150,
                                textOverflow: "clip",
                              }}
                            >
                              {lecture.access_by?.join(", ")}
                            </TableCell>
                            <TableCell>
                              <a
                                href={lecture.urls}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Watch
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No lectures found.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedCourse?.id ? "Edit" : "Add"} Course</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={selectedCourse?.title || ""}
            onChange={(e) =>
              setSelectedCourse({ ...selectedCourse, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={selectedCourse?.description || ""}
            onChange={(e) =>
              setSelectedCourse({
                ...selectedCourse,
                description: e.target.value,
              })
            }
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={selectedCourse?.category || ""}
            onChange={(e) =>
              setSelectedCourse({ ...selectedCourse, category: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={lectureDialogOpen}
        onClose={() => setLectureDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedLecture?.id ? "Edit" : "Add"} Lecture
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="dense"
            label="Title"
            value={selectedLecture?.title || ""}
            onChange={(e) =>
              setSelectedLecture({ ...selectedLecture, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Lecturer"
            value={selectedLecture?.lecturer || ""}
            onChange={(e) =>
              setSelectedLecture({
                ...selectedLecture,
                lecturer: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Video URL"
            value={selectedLecture?.urls || ""}
            onChange={(e) =>
              setSelectedLecture({ ...selectedLecture, urls: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="dense"
            label="Access By (comma separated: Online, Onsite)"
            value={selectedLecture?.access_by?.join(", ") || ""}
            onChange={(e) =>
              setSelectedLecture({
                ...selectedLecture,
                access_by: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLectureDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!targetCourseId || !selectedLecture?.title) return;
              const ref = collection(db, "courses", targetCourseId, "lectures");

              if (selectedLecture.id) {
                await updateDoc(doc(ref, selectedLecture.id), {
                  ...selectedLecture,
                });
              } else {
                await addDoc(ref, {
                  ...selectedLecture,
                  date_posted: Timestamp.now(),
                });
              }

              setLectureDialogOpen(false);
              loadLectures(targetCourseId);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses;
