import React, { useState } from 'react';
import { Box, Typography, Paper, MenuItem, Select, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GameModes = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const QUESTION_TYPES = [t("gameModes.categories.random"), t("gameModes.categories.flags"), t("gameModes.categories.animals"), t("gameModes.categories.monuments"), t("gameModes.categories.foods")];
    const NAVIGATION_MAP = { /* TODO */ }
    const [topic, setTopic] = useState(localStorage.getItem('topic') || QUESTION_TYPES[0]);
    const [customSettings, setCustomSettings] = useState(localStorage.getItem('customSettings') ? JSON.parse(localStorage.getItem('customSettings')) : {
        rounds: 5,
        timePerQuestion: 30,
        aiAttempts: 3,
    });

    const handleCategoryChange = (event) => {
        localStorage.setItem('topic', event.target.value);
        setTopic(event.target.value);
    };

    const handleCustomChange = (event) => {
        const { name, value } = event.target;
        setCustomSettings((prev) => {
            const updatedSettings = { ...prev, [name]: value };
            localStorage.setItem('customSettings', JSON.stringify(updatedSettings));
            return updatedSettings;
        });
    };

    const handleGameModeClick = (mode) => {
        if (mode === 'custom') {
            console.log('Custom settings:', customSettings);
        }
        navigate(`/game/${mode}`);
    };

    const capitalizaFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    const gameModes = [
        { name: t("gameModes.classical.title"), description: t("gameModes.classical.description") },
        { name: t("gameModes.suddenDeath.title"), description: t("gameModes.suddenDeath.description") },
        { name: t("gameModes.timeTrial.title"), description: t("gameModes.timeTrial.description") },
        { name: t("gameModes.QOD.title"), description: t("gameModes.QOD.description") },
        { name: t("gameModes.custom.title"), description: t("gameModes.custom.description") },
    ];

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                {t("gameModes.selectGameMode")}
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
                <Typography variant="subtitle1">{t("gameModes.categories.title")}</Typography>
                <Select value={topic} onChange={handleCategoryChange} fullWidth>
                    {QUESTION_TYPES.map((questionType) => (
                        <MenuItem key={questionType} value={questionType}>
                            {capitalizaFirstLetter(questionType)}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                {gameModes.map((mode) => (
                    <Paper
                        key={mode.name}
                        sx={{
                            padding: 2,
                            flex: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                                boxShadow: 3,
                                scale: 1.02,
                            },
                        }}
                    >
                        <Box>
                            <Typography variant="h6">{mode.name}</Typography>
                            <Typography variant="body2" sx={{ marginBottom: 1 }}>
                                {mode.description}
                            </Typography>
                            {mode.name === t("gameModes.custom.title") && (
                                <Box>
                                    <TextField
                                        label={t("gameModes.custom.settings.rounds")}
                                        type="number"
                                        name="rounds"
                                        value={customSettings.rounds}
                                        onChange={(e) => handleCustomChange({
                                            target: {
                                                name: e.target.name,
                                                value: Math.max(1, e.target.value),
                                            },
                                        })}
                                        fullWidth
                                        sx={{ marginBottom: 1 }}
                                    />
                                    <TextField
                                        label={t("gameModes.custom.settings.time")}
                                        type="number"
                                        name="timePerQuestion"
                                        value={customSettings.timePerQuestion}
                                        onChange={(e) => handleCustomChange({
                                            target: {
                                                name: e.target.name,
                                                value: Math.max(1, e.target.value),
                                            },
                                        })}
                                        fullWidth
                                        sx={{ marginBottom: 1 }}
                                    />
                                    <TextField
                                        label={t("gameModes.custom.settings.aiAttempts")}
                                        type="number"
                                        name="aiAttempts"
                                        value={customSettings.aiAttempts}
                                        onChange={(e) => handleCustomChange({
                                            target: {
                                                name: e.target.name,
                                                value: Math.max(0, e.target.value),
                                            },
                                        })}
                                        fullWidth
                                        sx={{ marginBottom: 1 }}
                                    />
                                </Box>
                            )}
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleGameModeClick(mode.name.toLowerCase())}
                            sx={{ marginTop: 'auto' }}
                        >
                            {t("gameModes.startGame")}
                        </Button>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default GameModes;