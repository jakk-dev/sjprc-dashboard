import React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItemButton,
} from "@mui/material";
import { Dashboard, People, MenuBook, Campaign } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { text: "Users", icon: <People />, path: "/users" },
  { text: "Courses", icon: <MenuBook />, path: "/courses" },
  { text: "Announcements", icon: <Campaign />, path: "/announcements" },
];

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "rgba(47, 47, 47, 0.1)",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" noWrap color="rgb(255, 179, 0)">
            Admin Panel
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    span: {
                      color:
                        location.pathname === item.path
                          ? "rgb(255, 179, 0)"
                          : "rgb(148, 148, 148)",
                      fontWeight:
                        location.pathname === item.path ? "bold" : "normal",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Header drawerWidth={drawerWidth} />
        <Box sx={{ p: 3 }}>
          <Toolbar /> {/* Optional: Keeps spacing below fixed header */}
          {children}
        </Box>
      </Box>
    </Box>
  );
};
