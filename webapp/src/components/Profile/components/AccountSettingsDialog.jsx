import { 
    Typography, Box, Button, Avatar, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, FormControlLabel, Checkbox
  } from "@mui/material";
import { useState } from "react";
  
  const AccountSettingsDialog = ({ 
    open, 
    onClose, 
    defaultImages, 
    onCustomImageChange, 
    onDefaultImageChange,
    uploadError,
    defaultImageError
  }) => {
    const [isUsernameChecked, setIsUsernameChecked] = useState(false);
    const [isPasswordChecked, setIsPasswordChecked] = useState(false);

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#f5f5f5", textAlign: "center", py: 1 }}>
          <Typography variant="h6" fontWeight="bold" fontSize="1rem">Update Your Profile</Typography>
          <Typography variant="body2" color="textSecondary" fontSize="0.875rem">
            Manage your account and profile picture below.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", fontSize: "1rem" }}>Account Information</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
              Select what you want to update and provide the new values below.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isUsernameChecked} 
                    onChange={(e) => setIsUsernameChecked(e.target.checked)} 
                  />
                }
                sx={{ mr: 2 }}
              />
              <TextField 
                label="New username" 
                variant="outlined" 
                fullWidth 
                size="small" 
                disabled={!isUsernameChecked} 
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isPasswordChecked} 
                    onChange={(e) => setIsPasswordChecked(e.target.checked)} 
                  />
                }
                sx={{ mr: 2 }}
              />
              <TextField 
                label="New password" 
                type="password" 
                variant="outlined" 
                fullWidth 
                size="small" 
                disabled={!isPasswordChecked} 
              />
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ py: 0.75, fontSize: "0.875rem" }} 
              disabled={!isUsernameChecked && !isPasswordChecked} // Disable if both are unchecked
            >
              Save Changes
            </Button>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", fontSize: "1rem" }}>Profile Picture</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
              Upload an image or select a default option.
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1.5, py: 0.75, fontSize: "0.875rem" }}>
              Upload Picture
              <input type="file" accept="image/*" hidden onChange={onCustomImageChange} />
            </Button>
            {uploadError && (
              <Typography variant="body2" color="error" sx={{ textAlign: "center", fontSize: "0.75rem" }}>
                {uploadError}
              </Typography>
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)", // Ensure 8 columns
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
                    width: 48, // Increased avatar size
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
                {defaultImageError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", py: 1 }}>
          <Button onClick={onClose} color="primary" variant="outlined" sx={{ px: 2, fontSize: "0.875rem" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default AccountSettingsDialog;