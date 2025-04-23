import { useEffect, useState } from "react"
import { AppBar, Toolbar, Button, IconButton, Box, Drawer, List, ListItem, Select, MenuItem } from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"
import Cookies from "js-cookie"
import { useTranslation } from "react-i18next"

export const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { t, i18n } = useTranslation()

    const langs = {
        en: { nativeName: "🇬🇧 English" },
        es: { nativeName: "🇪🇸 Español" }
    }

    useEffect(() => {
        const checkLoginStatus = () => {
            const userCookie = Cookies.get("user")
            setIsLoggedIn(!!userCookie)
        }

        checkLoginStatus()
        const intervalId = setInterval(checkLoginStatus, 1000)
        return () => clearInterval(intervalId)
    }, [])

    useEffect(() => {
        setIsMobile(window.innerWidth < 600)

        const handleResize = () => {
            setIsMobile(window.innerWidth < 600)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Add scroll event listener to detect when page is scrolled
    useEffect(() => {
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

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value)
    }

    const userCookie = Cookies.get('user');
    let username = '';
    if (userCookie) {
        try {
            const parsedUser = JSON.parse(userCookie);
            username = parsedUser.username || '';
        } catch (e) {
            console.error('Error parsing user cookie', e);
        }
    }

    const navLinks = isLoggedIn
        ? [ { title: t("navBar.home"), path: "/home" },
            { title: t("navBar.profile"), path: `/profile/${username}` },
            { title: t("navBar.classicalGame"), path: "/game" },
            { title: t("navBar.statistics"), path: "/statistics" },
            { title: t("navBar.gameModes"), path: "/game-modes" },
            { title: t("navBar.signOut"), action: handleSignOut }]
        : [
            { title: t("navBar.logIn"), path: "/login" },
            { title: t("navBar.signUp"), path: "/signup" },
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
                                color: item.title === t("navBar.signUp") ? "#fff" : "#1976d2",
                                backgroundColor: item.title === t("navBar.signUp") ? "#1976d2" : "transparent",
                                textTransform: "none",
                                fontSize: "1rem",
                                px: 3,
                                py: 0.8,
                                border: item.title !== t("navBar.signUp") ? "1px solid #1976d2" : "none",
                                "&:hover": {
                                    backgroundColor: item.title === t("navBar.signUp") ? "#1565c0" : "rgba(25, 118, 210, 0.04)",
                                    border: item.title !== t("navBar.signUp") ? "1px solid #1565c0" : "none",
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
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <Select
                                value={i18n.resolvedLanguage}
                                onChange={handleLanguageChange}
                                sx={{
                                    fontSize: "1rem",
                                    color: "#1976d2",
                                    "& .MuiSelect-select": {
                                        padding: "0.5rem 1rem",
                                    },
                                }}
                            >
                                { Object.keys(langs).map(lang => (
                                    <MenuItem key={lang} value={lang}>
                                        {langs[lang].nativeName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {navLinks.map((item) => (
                                <Button
                                    key={item.title}
                                    onClick={item.action || (() => handleNavigation(item.path))}
                                    sx={{
                                        color: item.title === t("navBar.signUp") ? "#fff" : "#1976d2",
                                        backgroundColor: item.title === t("navBar.signUp") ? "#1976d2" : "transparent",
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        px: 3,
                                        py: 0.8,
                                        border: item.title !== t("navBar.signUp") ? "1px solid #1976d2" : "none",
                                        "&:hover": {
                                            backgroundColor: item.title === t("navBar.signUp") ? "#1565c0" : "rgba(25, 118, 210, 0.04)",
                                            border: item.title !== t("navBar.signUp") ? "1px solid #1565c0" : "none",
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

