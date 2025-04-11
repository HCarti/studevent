import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Divider, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import { Icon } from '@iconify/react';
import fileDocumentIcon from '@iconify/icons-mdi/file-document';
import messageText from '@iconify/icons-mdi/message-text';
import accountGroup from '@iconify/icons-mdi/account-group';
import downloadIcon from '@iconify/icons-mdi/download';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [liquidations, setLiquidations] = useState([]);
  const [loading, setLoading] = useState({
    feedbacks: true,
    liquidations: true
  });
  const [stats, setStats] = useState({
    proposals: 0,
    liquidations: 0,
    feedbacks: 0
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [feedbackRes, liquidationRes] = await Promise.all([
          fetch('https://studevent-server.vercel.app/api/feedback/latest', {
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch('https://studevent-server.vercel.app/api/liquidation', {
            headers: { "Authorization": `Bearer ${token}` },
          })
        ]);

        if (!feedbackRes.ok || !liquidationRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [feedbackData, liquidationData] = await Promise.all([
          feedbackRes.json(),
          liquidationRes.json()
        ]);

        setFeedbacks(feedbackData.data || []);
        setLiquidations(liquidationData.data || []);
        setStats({
          proposals: stats.proposals,
          liquidations: liquidationData.count || 0,
          feedbacks: feedbackData.count || 0
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setNotification({
          open: true,
          message: 'Failed to load dashboard data',
          severity: 'error'
        });
      } finally {
        setLoading({ feedbacks: false, liquidations: false });
      }
    };

    fetchData();
  }, []);

  // Organization distribution data
  const orgDistribution = [
    { name: 'COCO', count: 47, color: '#007bff' },
    { name: 'JPCS', count: 35, color: '#28a745' },
    { name: 'FNL', count: 41, color: '#dc3545' },
    { name: 'NUHO', count: 23, color: '#ffc107' },
    { name: 'MTSC', count: 29, color: '#6c757d' },
  ];

  const handleDownload = (fileUrl, fileName) => {
    try {
      // Direct download from Vercel Blob URL
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName || 'liquidation.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: 'Download started',
        severity: 'success'
      });
    } catch (error) {
      console.error('Download failed:', error);
      setNotification({
        open: true,
        message: 'Download failed',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getAvatarColor = (name) => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6c757d'];
    const charSum = name?.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) || 0;
    return colors[charSum % colors.length];
  };

  return (
    <Box className="dashboard-wrapper">
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Box className="dashboard-header">
            <Typography variant="h4" className="dashboard-heading">
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" className="dashboard-subheading">
              System Overview & Submissions
            </Typography>
          </Box>
        </Grid>

        {/* Top Stats Section */}
        <Grid container spacing={3} className="top-stats" style={{ justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0}>
              <Icon icon={fileDocumentIcon} className="stat-icon" />
              <Typography className="stat-number">{stats.proposals}</Typography>
              <Typography className="stat-text">Proposals</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0}>
              <Icon icon={fileDocumentIcon} className="stat-icon" />
              <Typography className="stat-number">{stats.liquidations}</Typography>
              <Typography className="stat-text">Liquidations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0}>
              <Icon icon={messageText} className="stat-icon" />
              <Typography className="stat-number">{stats.feedbacks}</Typography>
              <Typography className="stat-text">Feedbacks</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Liquidations Section */}
        <Grid item xs={12} md={6}>
          <Paper className="main-content-box">
            <Box className="section-header">
              <Icon icon={fileDocumentIcon} className="section-icon" />
              <Typography variant="h6" className="section-heading">
                Recent Liquidations
              </Typography>
            </Box>
            {loading.liquidations ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : liquidations.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liquidations.slice(0, 5).map((liquidation) => (
                      <TableRow key={liquidation._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                bgcolor: getAvatarColor(liquidation.organization),
                                width: 24, 
                                height: 24,
                                mr: 1,
                                fontSize: '0.75rem'
                              }}
                            >
                              {liquidation.organization?.charAt(0) || '?'}
                            </Avatar>
                            {liquidation.organization || 'Unknown'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={liquidation.fileName}>
                            <Typography noWrap style={{ maxWidth: 150 }}>
                              {liquidation.fileName}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {liquidation.submittedAt ? 
                            new Date(liquidation.submittedAt).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Download">
                            <IconButton 
                              onClick={() => handleDownload(liquidation.fileUrl, liquidation.fileName)}
                              size="small"
                            >
                              <Icon icon={downloadIcon} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography p={3} color="textSecondary">
                No liquidation files submitted yet
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Feedback Section */}
        <Grid item xs={12} md={6}>
          <Paper className="main-content-box">
            <Box className="section-header">
              <Icon icon={messageText} className="section-icon" />
              <Typography variant="h6" className="section-heading">
                Recent User Feedback
              </Typography>
            </Box>
            {loading.feedbacks ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : feedbacks.length > 0 ? (
              <List className="feedback-list">
                {feedbacks.map((feedback, index) => (
                  <React.Fragment key={feedback._id || index}>
                    <ListItem className="feedback-item">
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: getAvatarColor(feedback.userName || feedback.organizationName) 
                        }}>
                          {(feedback.userName || feedback.organizationName)?.charAt(0) || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box className="feedback-header">
                            <Typography component="span" className="feedback-name">
                              {feedback.userName || feedback.organizationName || 'Anonymous'}
                            </Typography>
                            {feedback.rating && (
                              <Typography component="span" className="feedback-rating">
                                {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="p" className="feedback-comment">
                              {feedback.feedback}
                            </Typography>
                            <Typography component="p" className="feedback-date">
                              {feedback.createdAt ? 
                                new Date(feedback.createdAt).toLocaleDateString() : 
                                'N/A'}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < feedbacks.length - 1 && <Divider light />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography p={3} color="textSecondary">
                No feedback available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Organization Distribution */}
        <Grid item xs={12}>
          <Paper className="side-box">
            <Box className="section-header">
              <Icon icon={accountGroup} className="section-icon" />
              <Typography variant="h6" className="section-heading">
                Organization Distribution
              </Typography>
            </Box>
            <Box className="org-distribution">
              {orgDistribution.map((org) => (
                <Box key={org.name} className="org-item">
                  <Box className="org-info">
                    <Box 
                      className="org-color" 
                      sx={{ backgroundColor: org.color }}
                    />
                    <Typography className="org-name">{org.name}</Typography>
                  </Box>
                  <Typography className="org-count">{org.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;