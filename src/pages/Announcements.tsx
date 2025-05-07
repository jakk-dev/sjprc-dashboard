// src/pages/Announcements.tsx

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase"; // adjust path to your Firebase setup

type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  postDate: any;
  isImportant: boolean;
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] =
    useState<Partial<Announcement> | null>(null);

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "post"), orderBy("postDate", "desc"));
    const snap = await getDocs(q);
    const data: Announcement[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Announcement, "id">),
    }));
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h4" mb={2}>
        Announcements
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
        gap={2}
      >
        <Button
          variant="contained"
          onClick={() => {
            setSelectedPost(null);
            setDialogOpen(true);
          }}
        >
          + Add Announcement
        </Button>

        <FormControlLabel
          control={
            <Switch
              checked={showImportantOnly}
              onChange={(e) => setShowImportantOnly(e.target.checked)}
              color="primary"
            />
          }
          label="Show Important Only"
        />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr",
        }}
        gap={2}
      >
        {announcements
          .filter((post) => (showImportantOnly ? post.isImportant : true))
          .map((post) => (
            <Box key={post.id}>
              <Card sx={{ height: "100%", position: "relative" }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                  gap={2}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedPost(post);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmDelete = confirm(`Delete "${post.title}"?`);
                      if (!confirmDelete) return;

                      await deleteDoc(doc(db, "post", post.id));
                      fetchAnnouncements(); // Refresh list after deletion
                    }}
                  >
                    Delete
                  </Button>
                </Box>
                <CardMedia
                  component="img"
                  height="180"
                  image={post.imageUrl}
                  alt="No Image"
                />
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    {post.isImportant && (
                      <Chip label="Important" color="error" size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {post.content.length > 120
                      ? `${post.content.slice(0, 120)}...`
                      : post.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Posted by {post.author} on{" "}
                    {post.postDate?.toDate?.().toLocaleDateString() ?? "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {selectedPost?.id ? "Edit Announcement" : "Add Announcement"}
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Title"
              fullWidth
              margin="dense"
              value={selectedPost?.title || ""}
              onChange={(e) =>
                setSelectedPost({ ...selectedPost, title: e.target.value })
              }
            />
            <TextField
              label="Content"
              fullWidth
              margin="dense"
              multiline
              minRows={4}
              value={selectedPost?.content || ""}
              onChange={(e) =>
                setSelectedPost({ ...selectedPost, content: e.target.value })
              }
            />
            <TextField
              label="Author"
              fullWidth
              margin="dense"
              value={selectedPost?.author || ""}
              onChange={(e) =>
                setSelectedPost({ ...selectedPost, author: e.target.value })
              }
            />
            <TextField
              label="Image URL"
              fullWidth
              margin="dense"
              value={selectedPost?.imageUrl || ""}
              onChange={(e) =>
                setSelectedPost({ ...selectedPost, imageUrl: e.target.value })
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPost?.isImportant || false}
                  onChange={(e) =>
                    setSelectedPost({
                      ...selectedPost,
                      isImportant: e.target.checked,
                    })
                  }
                />
              }
              label="Mark as Important"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (!selectedPost?.title || !selectedPost?.content) return;

                const postRef = collection(db, "post");
                const dataToSave = {
                  ...selectedPost,
                  postDate: selectedPost?.postDate ?? new Date(),
                };

                if (selectedPost.id) {
                  // Edit
                  const docRef = doc(db, "post", selectedPost.id);
                  await updateDoc(docRef, dataToSave);
                } else {
                  // Create
                  await addDoc(postRef, dataToSave);
                }

                setDialogOpen(false);
                fetchAnnouncements(); // reload list
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Announcements;
