import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Typography, Box, Container, Paper, Button, Tabs, Tab
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
import { useTranslation } from 'react-i18next'; 

const retriever = new RecordRetrieverProfile();
const userProfileSettings = new UserProfileSettings();

export const Profile = () => {

    const navigate = useNavigate();
    const { username: profileUsernameParam } = useParams();
    const [hasValidUsername, setHasValidUsername] = useState(true);

    useEffect(() => {
        if (!profileUsernameParam) {
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
    const [updateError, setUpdateError] = useState(null); // New state for update error
    const { t } = useTranslation();

    const handleLogout = () => {
        Cookies.remove('user', { path: '/' });
        navigate('/login');
    }

    const handleModifyAccoutInformation = async (newUsername, newPassword, newPasswordRepeat) => {
        try {
            setUpdateError(null);
            const response = await userProfileSettings.changeUsernameAndPassword(Cookies.get('user'), newUsername, newPassword, newPasswordRepeat);
            if (response.token) {
                Cookies.set('user', JSON.stringify({ username: response.username, token: response.token }), { expires: new Date().getTime() + (1 * 60 * 60 * 1000) });
            }

            setCurrentUsername(response.username);
            navigate(`/profile/${response.username}`);
            handleCloseSettings();
        } catch (error) {
            setUpdateError(error.message);
        }
    }

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
    }
    
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
    }

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

                    setStatistics((prevStatistics) => {
                        if (JSON.stringify(prevStatistics) !== JSON.stringify(statsData)) {
                            return statsData;
                        }
                        return prevStatistics;
                    });

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
                    setError(error.message || "profile.errors.failedToRetrieveStatistics");
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
                    <LoadingState message={t("profile.loadingStatistics")} />
                ) : error ? (
                    <ErrorState
                        error={t(error)}
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
                        {isProfileOwner && (
                            <AccountSettingsDialog
                                open={settingsOpen}
                                onClose={handleCloseSettings}
                                defaultImages={DEFAULT_IMAGES}
                                onChangeUsernameAndPassword={handleModifyAccoutInformation}
                                onCustomImageChange={handleCustomProfileImageChange}
                                onDefaultImageChange={handleDefaultProfileImageChange}
                                uploadError={uploadError}
                                updateError={updateError}
                                defaultImageError={defaultImageError}
                            />
                        )}

                        <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={statistics.selectedTab}
                                    onChange={(event, newValue) => setStatistics({ ...statistics, selectedTab: newValue })}
                                    aria-label="Profile statistics tabs"
                                >
                                    <Tab label={t("profile.statisticTypes.labels.global")} />
                                    <Tab label={t("profile.statisticTypes.labels.classical")} />
                                    <Tab label={t("profile.statisticTypes.labels.suddenDeath")} />
                                    <Tab label={t("profile.statisticTypes.labels.timeTrial")} />
                                    <Tab label={t("profile.statisticTypes.labels.custom")} />
                                    <Tab label={t("profile.statisticTypes.labels.QOD")} />
                                </Tabs>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                {statistics.selectedTab === 0 && (
                                    <Insights statistics={statistics.globalStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.global")} />
                                )}
                                {statistics.selectedTab === 1 && (
                                    <Insights statistics={statistics.classicalStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.classical")} />
                                )}
                                {statistics.selectedTab === 2 && (
                                    <Insights statistics={statistics.suddenDeathStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.suddenDeath")} />
                                )}
                                {statistics.selectedTab === 3 && (
                                    <Insights statistics={statistics.timeTrialStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.timeTrial")} />
                                )}
                                {statistics.selectedTab === 4 && (
                                    <Insights statistics={statistics.customStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.custom")} />
                                )}
                                {statistics.selectedTab === 5 && (
                                    <Insights statistics={statistics.qodStatistics} registrationDate={registrationDate} title={t("profile.statisticTypes.insights.QOD")} />
                                )}
                            </Box>
                        </Paper>
                        {/* Add spacing between the two papers */}
                        <Box sx={{ mt: 3 }} />

                        {/* Ensure Global statistics is selected by default */}
                        {statistics.selectedTab === undefined && setStatistics({ ...statistics, selectedTab: 0 })}
                        {/* Only show visitors section if this is own profile */}
                        {isProfileOwner && recentVisitors.length > 0 && (
                            <VisitorsSection
                            visitors={recentVisitors}
                            totalVisits={statistics.totalVisits}
                            getImageUrl={userProfileSettings.getStaticProfileImageUrl.bind(userProfileSettings)}
                        />
                        )}
                        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/')}
                                sx={{ mr: 2 }}
                            >
                                {t("profile.backToMenu")}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="h6">{t("profile.noStatistics")}.</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/')}
                        >
                            {t("profile.backToMenu")}
                        </Button>
                    </Paper>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Profile;
