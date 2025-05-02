import { 
    Typography, Box, Button, Avatar, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, FormControlLabel, Checkbox
  } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
  
const AccountSettingsDialog = ({ 
  open, 
  onClose, 
  defaultImages, 
  onChangeUsernameAndPassword,
  onCustomImageChange, 
  onDefaultImageChange,
  uploadError,
  updateError,
  defaultImageError
}) => {
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isPasswordChecked, setIsPasswordChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: "#f5f5f5", textAlign: "center", py: 1 }}>
        <Typography fontWeight="bold" fontSize="1rem">{t("profile.settings.updateProfile")}</Typography>
        <Typography variant="body2" color="textSecondary" fontSize="0.875rem">
          {t("profile.settings.manageSettings")}.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: "bold", fontSize: "1rem" }}>{t("profile.settings.accountInfo")}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
            {t("profile.settings.newValuesInfo")}.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  data-testid="username-checkbox"
                  checked={isUsernameChecked} 
                  onChange={(e) => setIsUsernameChecked(e.target.checked)} 
                />
              }
              sx={{ mr: 2 }}
            />
            <TextField 
              id="username-textfield"
              label={t("profile.settings.newUsername")} 
              variant="outlined" 
              fullWidth 
              size="small" 
              disabled={!isUsernameChecked} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  data-testid="password-checkbox"
                  checked={isPasswordChecked} 
                  onChange={(e) => setIsPasswordChecked(e.target.checked)} 
                />
              }
              sx={{ mr: 2 }}
            />
            <TextField 
              label={t("profile.settings.newPassword")} 
              type="password" 
              variant="outlined" 
              fullWidth 
              size="small" 
              disabled={!isPasswordChecked} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isPasswordChecked} 
                  disabled
                />
              }
              sx={{ mr: 2 }}
            />
            <TextField 
              label={t("profile.settings.repeatPassword")} 
              type="password" 
              variant="outlined" 
              fullWidth 
              size="small" 
              disabled={!isPasswordChecked} 
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ py: 0.75, fontSize: "0.875rem" }} 
            disabled={!isUsernameChecked && !isPasswordChecked}
            onClick={() => onChangeUsernameAndPassword(username, password, repeatPassword)}
          >
            {t("profile.settings.saveChanges")}
          </Button>
          {updateError && (
            <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: "center", fontSize: "0.75rem" }}>
              {t(updateError)}
            </Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{ mb: 1, fontWeight: "bold", fontSize: "1rem" }}>{t("profile.settings.profilePicture")}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
            {t("profile.settings.uploadPictureInfo")}.
          </Typography>
          <Button variant="outlined" component="label" fullWidth sx={{ mb: 1.5, py: 0.75, fontSize: "0.875rem" }}>
          {t("profile.settings.uploadPicture")}
            <input type="file" accept="image/*" hidden onChange={onCustomImageChange} />
          </Button>
          {uploadError && (
            <Typography variant="body2" color="error" sx={{ textAlign: "center", fontSize: "0.75rem" }}>
              {t(uploadError)}
            </Typography>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: 1,
              mt: 1.5
            }}
          >
            {defaultImages.map((image, index) => (
              <Avatar
                key={index}
                src={image}
                alt={`Default avatar ${index + 1}`}
                sx={{
                  width: 48,
                  height: 48,
                  cursor: "pointer",
                  border: "2px solid transparent",
                  "&:hover": { borderColor: "#1976d2" }
                }}
                onClick={() => onDefaultImageChange(image)}
              />
            ))}
          </Box>
          {defaultImageError && (
            <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: "center", fontSize: "0.75rem" }}>
              {t(defaultImageError)}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", py: 1 }}>
        <Button onClick={onClose} color="primary" variant="outlined" sx={{ px: 2, fontSize: "0.875rem" }}>
          {t("profile.settings.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountSettingsDialog;