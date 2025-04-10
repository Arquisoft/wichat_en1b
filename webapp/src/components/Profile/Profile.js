import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Typography, Box, Container, Paper, Button
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";
import RecordRetrieverProfile from "./RecordRetrieverProfile";
import UserProfileSettings from "./UserProfileSettings";
import { theme } from "./theme";
import ProfileHeader from "./components/ProfileHeader";
import AccountSettingsDialog from "./components/AccountSettingsDialog";
import VisitorsSection from "./components/VisitorsSection";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import { Insights } from "./components/Insights";

const retriever = new RecordRetrieverProfile();
const userProfileSettings = new UserProfileSettings();

export const Profile = () => {

    const navigate = useNavigate();
    const { username: profileUsernameParam } = useParams(); // Get username from URL params
    const [hasValidUsername, setHasValidUsername] = useState(true);

    useEffect(() => {
        if (!profileUsernameParam) {
            console.log("No username available");
            setHasValidUsername(false);
            navigate('/home');
        }
    }, [profileUsernameParam, navigate]);

    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUsername, setCurrentUsername] = useState("");
    const [isProfileOwner, setIsProfileOwner] = useState(false);  // This is determined by backend
    const [registrationDate, setRegistrationDate] = useState(null);
    const [profileImage, setProfileImage] = useState("");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [recentVisitors, setRecentVisitors] = useState([]);
    const [DEFAULT_IMAGES, setDefaultImages] = useState([]);
    const [uploadError, setUploadError] = useState(null);
    const [defaultImageError, setDefaultImageError] = useState(null);

    const handleLogout = () => {
        Cookies.remove('user', { path: '/' });
        navigate('/login');
    };

    const handleCustomProfileImageChange = async (event) => {
        if (!isProfileOwner) return;

        try {
            setUploadError(null);
            setDefaultImageError(null);
    
            await userProfileSettings.changeCustomProfileImage(profileUsernameParam, Cookies.get('user'), event.target.files[0]);
            setProfileImage(userProfileSettings.getProfileImageUrl(profileUsernameParam));
        } catch (error) {
            setUploadError(error.message);
        }
    };
    
    const handleDefaultProfileImageChange = async (image) => {
        if (!isProfileOwner) return;
    
        try {
            setUploadError(null);
            setDefaultImageError(null);
    
            await userProfileSettings.changeDefaultProfileImage(profileUsernameParam, Cookies.get('user'), image.split('/').pop());
            setProfileImage(userProfileSettings.getProfileImageUrl(profileUsernameParam));
        } catch (error) {
            setDefaultImageError(error.message);
        }
    };

    const handleOpenSettings = () => {
        if (!isProfileOwner) return; // Additional safety check
        setSettingsOpen(true);
    }

    const handleCloseSettings = () => setSettingsOpen(false);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
    };

    useEffect(() => {
        if (hasValidUsername) {
            const loadUserData = async () => {
                try {
                    const { statsData, username: fetchedUsername } = await retriever.getRecords(profileUsernameParam);

                    setStatistics(statsData);
                    console.log("Statistics data:", statsData);
                    
                    // Determine which profile to load
                    setIsProfileOwner(statsData.isProfileOwner);

                    setCurrentUsername(fetchedUsername);
                    
                    // Set registration date if available
                    if (statsData && statsData.registrationDate) {
                        setRegistrationDate(new Date(statsData.registrationDate));
                    }

                    // Set recent visitors if available (only provided if user is profile owner)
                    if (statsData && statsData.recentVisitors) {
                        setRecentVisitors(statsData.recentVisitors);
                    }

                    setProfileImage(userProfileSettings.getProfileImageUrl(profileUsernameParam));
                    setLoading(false);
                } catch (error) {
                    setError(error.message || "Failed to retrieve statistics");
                    setLoading(false);
                }
            };
            loadUserData();
        }
    }, [hasValidUsername, profileUsernameParam, userProfileSettings, retriever]);

    useEffect(() => {
        setDefaultImages(userProfileSettings.getDefaultImages());
    }, []);


    const getMembershipDuration = () => {
        if (!registrationDate) return "N/A";
        const now = new Date();
        const diffTime = Math.abs(now - registrationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {loading ? (
                    <LoadingState message="Loading profile statistics..." />
                ) : error ? (
                    <ErrorState
                        error={error}
                        onRetry={handleRetry}
                        onLogout={handleLogout}
                    />
                ) : statistics ? (
                    <>
                        <ProfileHeader
                            username={profileUsernameParam || currentUsername}
                            profileImage={profileImage}
                            registrationDate={registrationDate}
                            getMembershipDuration={getMembershipDuration}
                            onOpenSettings={isProfileOwner ? handleOpenSettings : null} // Only show settings button for own profile
                            isProfileOwner={isProfileOwner}
                        />

                        {/* Account settings dialog only for own profile */}
                        {isProfileOwner && (
                            <AccountSettingsDialog
                                open={settingsOpen}
                                onClose={handleCloseSettings}
                                defaultImages={DEFAULT_IMAGES}
                                onCustomImageChange={handleCustomProfileImageChange}
                                onDefaultImageChange={handleDefaultProfileImageChange}
                                uploadError={uploadError}
                                defaultImageError={defaultImageError}
                            />
                        )}

                        <Insights statistics={statistics.globalStatistics} registrationDate={registrationDate} />
                        <Insights statistics={statistics.classicalStatistics} registrationDate={registrationDate} />
                        <Insights statistics={statistics.suddenDeathStatistics} registrationDate={registrationDate} />
                        <Insights statistics={statistics.timeTrialStatistics} registrationDate={registrationDate} />
                        <Insights statistics={statistics.customStatistics} registrationDate={registrationDate} />

                        {/* Only show visitors section if this is own profile */}
                        {isProfileOwner && recentVisitors.length > 0 && (
                            <VisitorsSection
                            visitors={recentVisitors}
                            totalVisits={statistics.totalVisits}
                            getImageUrl={userProfileSettings.getStaticProfileImageUrl.bind(userProfileSettings)}
                        />
                        )}

                        {/* Actions */}
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/')}
                                sx={{ mr: 2 }}
                            >
                                Back to menu
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="h6">No statistics available.</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/')}
                        >
                            Back to menu
                        </Button>
                    </Paper>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Profile;
