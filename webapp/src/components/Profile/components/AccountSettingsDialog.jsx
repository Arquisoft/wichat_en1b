import { 
    Typography, Box, Button, Avatar, 
    Dialog, DialogTitle, DialogContent, DialogActions 
  } from "@mui/material";
  
  const AccountSettingsDialog = ({ 
    open, 
    onClose, 
    defaultImages, 
    onCustomImageChange, 
    onDefaultImageChange,
    uploadError,
    defaultImageError
  }) => {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Account Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Manage your account settings below:
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2 }}
          >
            Upload Profile Picture
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={onCustomImageChange}
            />
          </Button>
          {uploadError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {uploadError}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>Or select a default image:</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))", gap: 2 }}>
            {defaultImages.map((image, index) => (
              <Avatar
                key={index}
                src={image}
                alt={`Default avatar ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  cursor: "pointer",
                }}
                onClick={() => onDefaultImageChange(image)}
              />
            ))}
          </Box>
          {defaultImageError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {defaultImageError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default AccountSettingsDialog;