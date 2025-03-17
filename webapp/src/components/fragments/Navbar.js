import * as React from "react"
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem } from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"
import Cookies from "js-cookie"

export const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [isMobile, setIsMobile] = React.useState(false)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
        const checkLoginStatus = () => {
            const userCookie = Cookies.get("user")
            setIsLoggedIn(!!userCookie)
        }

        checkLoginStatus()
        const intervalId = setInterval(checkLoginStatus, 1000)
        return () => clearInterval(intervalId)
    }, [])

    React.useEffect(() => {
        setIsMobile(window.innerWidth < 600)

        const handleResize = () => {
            setIsMobile(window.innerWidth < 600)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Add scroll event listener to detect when page is scrolled
    React.useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [scrolled])

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen)
    }

    const handleSignOut = () => {
        Cookies.remove("user")
        setIsLoggedIn(false)
        window.location.href = "/login"
    }

    const handleNavigation = (path) => {
        window.location.href = path
    }

    const navLinks = isLoggedIn
        ? [ { title: "Home", path: "/home" },
            { title: "Profile", path: "/profile" },
            { title: "New game", path: "/game" },
            { title: "Statistics", path: "/statistics" },
            { title: "Game modes", path: "/game-modes" },
            { title: "Sign Out", action: handleSignOut }]
        : [
            { title: "Login", path: "/login" },
            { title: "Sign up", path: "/signup" },
        ]

    const mobileDrawer = (
        <Box
            onClick={toggleDrawer}
            sx={{
                textAlign: "center",
                width: 200,
                p: 2,
                "& .MuiListItem-root": {
                    mb: 1,
                },
            }}
        >
            <List>
                {navLinks.map((item) => (
                    <ListItem key={item.title} sx={{ p: 0 }}>
                        <Button
                            onClick={item.action || (() => handleNavigation(item.path))}
                            fullWidth
                            sx={{
                                color: item.title === "Sign up" ? "#fff" : "#1976d2",
                                backgroundColor: item.title === "Sign up" ? "#1976d2" : "transparent",
                                textTransform: "none",
                                fontSize: "1rem",
                                px: 3,
                                py: 0.8,
                                border: item.title !== "Sign up" ? "1px solid #1976d2" : "none",
                                "&:hover": {
                                    backgroundColor: item.title === "Sign up" ? "#1565c0" : "rgba(25, 118, 210, 0.04)",
                                    border: item.title !== "Sign up" ? "1px solid #1565c0" : "none",
                                },
                            }}
                        >
                            {item.title}
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Box>
    )

    return (
        <>
            {/* Fixed position AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "white",
                    boxShadow: scrolled ? "0px 2px 4px -1px rgba(0,0,0,0.1)" : "none",
                    borderBottom: scrolled ? "none" : "1px solid #e0e0e0",
                    transition: "box-shadow 0.3s, border-bottom 0.3s",
                    zIndex: 1100,
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                            onClick={() => handleNavigation("/home")}
                            sx={{
                                color: "#000",
                                textTransform: "none",
                                fontSize: "1.2rem",
                                fontWeight: 500,
                                "&:hover": {
                                    backgroundColor: "transparent",
                                    color: "#1976d2",
                                },
                            }}
                        >
                            wichat_en1b
                        </Button>
                    </Box>

                    {isMobile ? (
                        <>
                            <IconButton edge="end" aria-label="menu" onClick={toggleDrawer} sx={{ color: "#1976d2" }}>
                                <MenuIcon />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={toggleDrawer}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: "white",
                                    },
                                }}
                            >
                                {mobileDrawer}
                            </Drawer>
                        </>
                    ) : (
                        <Box sx={{ display: "flex", gap: 2 }}>
                            {navLinks.map((item) => (
                                <Button
                                    key={item.title}
                                    onClick={item.action || (() => handleNavigation(item.path))}
                                    sx={{
                                        color: item.title === "Sign up" ? "#fff" : "#1976d2",
                                        backgroundColor: item.title === "Sign up" ? "#1976d2" : "transparent",
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        px: 3,
                                        py: 0.8,
                                        border: item.title !== "Sign up" ? "1px solid #1976d2" : "none",
                                        "&:hover": {
                                            backgroundColor: item.title === "Sign up" ? "#1565c0" : "rgba(25, 118, 210, 0.04)",
                                            border: item.title !== "Sign up" ? "1px solid #1565c0" : "none",
                                        },
                                    }}
                                >
                                    {item.title}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Toolbar placeholder to prevent content from hiding behind the fixed AppBar */}
            <Toolbar />
        </>
    )
}

