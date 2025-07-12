import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useUser } from '../context/UserContext';
import apiService from '../services/api';

interface FubConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

const FubConnection: React.FC<FubConnectionProps> = ({ onConnectionChange }) => {
  const { user, setUser } = useUser();
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Follow Up Boss API key');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.connectFub(apiKey);
      
      if (response.success) {
        setSuccess('Successfully connected to Follow Up Boss!');
        setApiKey('');
        setShowApiKeyDialog(false);
        
        // Update user profile to reflect FUB connection
        if (user) {
          setUser({ ...user, fubConnected: true });
        }
        
        onConnectionChange?.(true);
      } else {
        setError(response.error || 'Failed to connect to Follow Up Boss');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect to Follow Up Boss');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.disconnectFub();
      
      if (response.success) {
        setSuccess('Successfully disconnected from Follow Up Boss');
        
        // Update user profile to reflect FUB disconnection
        if (user) {
          setUser({ ...user, fubConnected: false });
        }
        
        onConnectionChange?.(false);
      } else {
        setError(response.error || 'Failed to disconnect from Follow Up Boss');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect from Follow Up Boss');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.syncFubData();
      
      if (response.success) {
        setSuccess('Successfully synced data from Follow Up Boss!');
        setLastSyncTime(new Date());
      } else {
        setError(response.error || 'Failed to sync data from Follow Up Boss');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sync data from Follow Up Boss');
    } finally {
      setIsSyncing(false);
    }
  };

  const openApiKeyDialog = () => {
    setShowApiKeyDialog(true);
    setError(null);
    setSuccess(null);
  };

  const closeApiKeyDialog = () => {
    setShowApiKeyDialog(false);
    setApiKey('');
  };

  return (
    <Box>
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">
              Follow Up Boss Integration
            </Typography>
            <Chip
              label={user?.fubConnected ? 'Connected' : 'Not Connected'}
              color={user?.fubConnected ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your Follow Up Boss account to sync your contacts, deals, and activities.
            This will help personalize your daily challenges and improve your pipeline health scores.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Stack direction="row" spacing={2} alignItems="center">
            {user?.fubConnected ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleSync}
                  disabled={isSyncing}
                  startIcon={isSyncing ? <CircularProgress size={16} /> : null}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={openApiKeyDialog}
                disabled={isConnecting}
              >
                Connect Follow Up Boss
              </Button>
            )}
          </Stack>

          {lastSyncTime && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last synced: {lastSyncTime.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onClose={closeApiKeyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Connect Follow Up Boss</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your Follow Up Boss API key to connect your account. You can find your API key in your 
            Follow Up Boss account settings under "API Keys".
          </Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📋 How to get your API key:
            </Typography>
            <Typography variant="body2" component="div">
              1. Log into your Follow Up Boss account<br/>
              2. Go to Settings → API Keys<br/>
              3. Click "Create API Key"<br/>
              4. Copy the generated key and paste it below
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Follow Up Boss API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your FUB API key"
            margin="normal"
            helperText="Your API key will be securely stored and encrypted"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApiKeyDialog}>Cancel</Button>
          <Button
            onClick={handleConnect}
            variant="contained"
            disabled={isConnecting || !apiKey.trim()}
            startIcon={isConnecting ? <CircularProgress size={16} /> : null}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FubConnection; 