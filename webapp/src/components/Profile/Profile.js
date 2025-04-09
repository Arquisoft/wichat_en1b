// src/components/Profile/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography, Box, Container, Paper, Button, Grid
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";
import RecordRetrieverProfile from "./RecordRetrieverProfile";
import UserProfileSettings from "./UserProfileSettings";
import { theme } from "./theme";
import ProfileHeader from "./components/ProfileHeader";
import StatisticsSummary from "./components/StatisticsSummary";
import AnswerDistribution from "./components/AnswerDistribution";
import AdditionalInsights from "./components/AdditionalInsights";
import AccountSettingsDialog from "./components/AccountSettingsDialog";
import VisitorsSection from "./components/VisitorsSection";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";

const REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const retriever = new RecordRetrieverProfile();
const userProfileSettings = new UserProfileSettings();

export const Profile = () => {

    const navigate = useNavigate();
    const { username: profileUsername } = useParams(); // Get username from URL params
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
        if (!isProfileOwner) return; // Additional safety check

        try {
            setUploadError(null);
            setDefaultImageError(null);
            await userProfileSettings.changeCustomProfileImage(username, Cookies.get('user'), event.target.files[0]);
            setProfileImage(`${REACT_APP_API_ENDPOINT}/users/${username}/image?timestamp=${Date.now()}`);
        } catch (error) {
            setUploadError(error.message);
        }
    };

    const handleDefaultProfileImageChange = async (image) => {
        if (!isProfileOwner) return; // Additional safety check

        try {
            setUploadError(null);
            setDefaultImageError(null);
            await userProfileSettings.changeDefaultProfileImage(username, Cookies.get('user'), image.split('/').pop());
            setProfileImage(`${REACT_APP_API_ENDPOINT}/users/${username}/image?timestamp=${Date.now()}`);
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
        loadUserData();
    };

    const loadUserData = async () => {
        try {
            const { statsData, profileUsername } = await retriever.getRecords(profileUsername);

            setStatistics(statsData);
            
            // Determine which profile to load
            setIsProfileOwner(statsData.isProfileOwner);

            setCurrentUsername(profileUsername);
            
            // Set registration date if available
            if (statsData && statsData.registrationDate) {
                setRegistrationDate(new Date(statsData.registrationDate));
            }

            // Set recent visitors if available (only provided if user is profile owner)
            if (statsData && statsData.recentVisitors) {
                setRecentVisitors(statsData.recentVisitors);
            }

            const initialImageUrl = `${REACT_APP_API_ENDPOINT}/users/${targetUsername}/image?timestamp=${Date.now()}`;
            setProfileImage(initialImageUrl);
            setLoading(false);
        } catch (error) {
            setError(error.message || "Failed to retrieve statistics");
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, [profileUsername]); // Reload when URL parameter changes

    useEffect(() => {
        const fetchDefaultImages = async () => {
            try {
                const images = [];
                for (let i = 1; i <= 16; i++) {
                    images.push(`${REACT_APP_API_ENDPOINT}/default-images/image_${i}.png`);
                }
                setDefaultImages(images);
            } catch (error) { }
        };

        fetchDefaultImages();
    }, []);

    // Calculate derived statistics
    const getSuccessRate = () => {
        if (!statistics) return 0;
        const total = statistics.correctAnswers + statistics.incorrectAnswers;
        return total > 0 ? (statistics.correctAnswers / total) * 100 : 0;
    };

    const getAverageQuestionsPerGame = () => {
        if (!statistics || statistics.gamesPlayed === 0) return 0;
        return statistics.questionsAnswered / statistics.gamesPlayed;
    };

    const getMembershipDuration = () => {
        if (!registrationDate) return "N/A";
        const now = new Date();
        const diffTime = Math.abs(now - registrationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Prepare chart data
    const getPieChartData = () => {
        if (!statistics) return [];
        return [
            { name: 'Correct', value: statistics.correctAnswers },
            { name: 'Incorrect', value: statistics.incorrectAnswers }
        ];
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
                            username={profileUsername || currentUsername}
                            profileImage={profileImage}
                            registrationDate={registrationDate}
                            getMembershipDuration={getMembershipDuration}
                            onOpenSettings={isOwnProfile ? handleOpenSettings : null} // Only show settings button for own profile
                            isOwnProfile={isOwnProfile}
                        />

                        {/* Account settings dialog only for own profile */}
                        {isOwnProfile && (
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

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <StatisticsSummary
                                    statistics={statistics}
                                    successRate={getSuccessRate()}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <AnswerDistribution chartData={getPieChartData()} />
                            </Grid>
                        </Grid>

                        <AdditionalInsights
                            avgQuestionsPerGame={getAverageQuestionsPerGame()}
                            successRate={getSuccessRate()}
                            membershipDuration={getMembershipDuration()}
                        />

                        {/* Only show visitors section if this is own profile */}
                        {isOwnProfile && recentVisitors.length > 0 && (
                            <VisitorsSection visitors={recentVisitors} totalVisits={statistics.totalVisits} />
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