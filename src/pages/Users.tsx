import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

type User = {
  uid: string;
  sid: string;
  fullname: string;
  email: string;
  isAdmitted: boolean;
  user_type: String;
  user_access: string;
  phone: number;
  endSubs: String;
  sessionId: String;
};

const Users = () => {
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [batchFilter, setBatchFilter] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [admittedFilter, setAdmittedFilter] = useState<
    "all" | "admitted" | "notAdmitted"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };
  const { currentUser } = useAuth();
  const handleSaveChanges = async () => {
    if (!selectedUser || !selectedUser.uid) return;

    try {
      await updateDoc(doc(db, "users", selectedUser.uid), {
        user_access: selectedUser.user_access,
        sessionId: selectedUser.sessionId,
        end_subs: selectedUser.endSubs,
        isAdmitted: selectedUser.isAdmitted,
        updatedBy: currentUser?.name ?? "Admin",
        updatedAt: serverTimestamp(),
      });

      // Update user in local list
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === selectedUser.uid ? ({ ...u, ...selectedUser } as User) : u
        )
      );

      handleCloseEdit();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("user_type", "==", "Student")
        );
        const querySnapshot = await getDocs(q);

        const userList: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            sid: data.sid || "N/A",
            fullname: data.fullname || "N/A",
            email: data.email || "N/A",
            isAdmitted: data.isAdmitted ?? false,
            user_type: data.user_type || "N/A",
            user_access: data.user_access || "N/A",
            phone: parseInt(data.phone ?? "0", 10),
            endSubs: data.end_subs || "N/A",
            sessionId: data.sessionId || "",
          });
        });

        setUsers(userList);
      } catch (err: any) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const filteredUsers = users.filter((user) => {
    const matchesText = Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAdmitted =
      admittedFilter === "all" ||
      (admittedFilter === "admitted" && user.isAdmitted) ||
      (admittedFilter === "notAdmitted" && !user.isAdmitted);

    const batch = user.user_access?.split("-")[0]?.trim().toLowerCase(); // e.g., "Batch 1"
    const matchesBatch =
      batchFilter.trim() === "" || batch?.includes(batchFilter.toLowerCase());

    return matchesText && matchesAdmitted && matchesBatch;
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        All Users
      </Typography>
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          label="Search users"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiInputLabel-root": {
              color: "#ccc", // Unfocused label color
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#ffb300", // Focused label color
            },
            "& .MuiOutlinedInput-root": {
              color: "#fff", // Input text color
              "& fieldset": {
                borderColor: "#ccc", // Default border
              },
              "&:hover fieldset": {
                borderColor: "#ffb300", // Hover border
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffb300", // Focused border
              },
            },
          }}
        />
        <TextField
          label="Batch"
          variant="outlined"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          sx={{
            "& .MuiInputLabel-root": {
              color: "#ccc", // Unfocused label color
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#ffb300", // Focused label color
            },
            "& .MuiOutlinedInput-root": {
              color: "#fff", // Input text color
              "& fieldset": {
                borderColor: "#ccc", // Default border
              },
              "&:hover fieldset": {
                borderColor: "#ffb300", // Hover border
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffb300", // Focused border
              },
            },
          }}
        />

        <FormControl
          sx={{
            width: 200,
            "& .MuiInputLabel-root": {
              color: "#ccc", // Unfocused label color
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#ffb300", // Focused label color
            },
            "& .MuiOutlinedInput-root": {
              color: "#fff", // Input text color
              "& fieldset": {
                borderColor: "#ccc", // Default border
              },
              "&:hover fieldset": {
                borderColor: "#ffb300", // Hover border
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffb300", // Focused border
              },
            },
          }}
        >
          <InputLabel>Admitted Status</InputLabel>
          <Select
            label="Admitted Status"
            value={admittedFilter}
            onChange={(e) => setAdmittedFilter(e.target.value as any)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admitted">Admitted</MenuItem>
            <MenuItem value="notAdmitted">Not Admitted</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <Table
          sx={{
            tableLayout: "fixed",
            width: "100%", // 👈 Set your fixed table width here
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>SID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admitted</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Access</TableCell>
              <TableCell>Access Until</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>UID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell
                  sx={{
                    width: "10",
                  }}
                >
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell
                  sx={{
                    width: "20",
                  }}
                >
                  {user.sid}
                </TableCell>
                <Tooltip title={user.fullname}>
                  <TableCell
                    sx={{
                      minWidth: 200,
                      maxWidth: 300,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.fullname}
                  </TableCell>
                </Tooltip>
                <Tooltip title={user.email}>
                  <TableCell
                    sx={{
                      minWidth: 150,
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.email}
                  </TableCell>
                </Tooltip>
                <TableCell
                  sx={{
                    minWidth: 30,
                    maxWidth: 30,
                  }}
                >
                  {user.isAdmitted ? "Yes" : "No"}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 80,
                    maxWidth: 80,
                  }}
                >
                  {user.user_type}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 80,
                    maxWidth: 80,
                  }}
                >
                  {user.user_access}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 80,
                    maxWidth: 80,
                  }}
                >
                  {user.endSubs}
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <Tooltip title={user.uid}>
                  <TableCell
                    sx={{
                      maxWidth: 80,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.uid}
                  </TableCell>
                </Tooltip>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog
          open={editOpen}
          onClose={handleCloseEdit}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent dividers>
            {selectedUser && (
              <>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Full Name"
                  value={selectedUser.fullname}
                  disabled
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Email"
                  value={selectedUser.email}
                  disabled
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Access Type"
                  value={selectedUser.user_access || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      user_access: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Session ID"
                  value={selectedUser.sessionId || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      sessionId: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Access Util"
                  value={selectedUser.endSubs || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      endSubs: e.target.value,
                    })
                  }
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Admitted Status</InputLabel>
                  <Select
                    value={selectedUser.isAdmitted ? "true" : "false"}
                    label="Admitted Status"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        isAdmitted: e.target.value === "true",
                      })
                    }
                  >
                    <MenuItem value="true">Admitted</MenuItem>
                    <MenuItem value="false">Not Admitted</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            ,
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default Users;
