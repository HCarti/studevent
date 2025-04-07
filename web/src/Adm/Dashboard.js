import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, CircularProgress } from '@mui/material';
import { Icon } from '@iconify/react';
import fileDocumentIcon from '@iconify/icons-mdi/file-document';
import bankIcon from '@iconify/icons-mdi/bank';
import cashIcon from '@iconify/icons-mdi/cash';
import messageText from '@iconify/icons-mdi/message-text';
import accountGroup from '@iconify/icons-mdi/account-group';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    proposals: 0,
    liquidations: 0,
    transactions: 0,
    feedbacks: 0
  });

  // Fetch feedback data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [feedbackRes] = await Promise.all([
          fetch('https://studevent-server.vercel.app/api/feedback/latest', {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }),
          // fetch('https://studevent-server.vercel.app/api/stats', {
          //   headers: {
          //     "Authorization": `Bearer ${token}`,
          //   },
          // })
        ]);
  
        if (!feedbackRes.ok) throw new Error('Failed to fetch feedback');
        // if (!statsRes.ok) throw new Error('Failed to fetch stats');
  
        const feedbackData = await feedbackRes.json();
        // const statsData = await statsRes.json();
  
        if (feedbackData.success) {
          setFeedbacks(feedbackData.data);
        }
  
        // if (statsData.success) {
        //   setStats({
        //     proposals: statsData.proposals,
        //     liquidations: statsData.liquidations,
        //     transactions: statsData.transactions,
        //     feedbacks: statsData.feedbacks
        //   });
        // }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
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

  const handleProposalClick = () => {
    navigate('/adminproposal');
  };

  const handleAdminLiquidationClick = () => {
    navigate('/adminliquidation');
  };

  const handleFeedbackClick = () => {
    navigate('/adminfeedback');
  };

  // Function to generate avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6c757d', '#17a2b8', '#343a40'];
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
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
              User Feedback & System Overview
            </Typography>
          </Box>
        </Grid>

        {/* Top Stats Section */}
        <Grid container spacing={3} className="top-stats">
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0} onClick={handleProposalClick}>
              <Icon icon={fileDocumentIcon} className="stat-icon" />
              <Typography className="stat-number">{stats.proposals}</Typography>
              <Typography className="stat-text">Proposals</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0} onClick={handleAdminLiquidationClick}>
              <Icon icon={bankIcon} className="stat-icon" />
              <Typography className="stat-number">{stats.liquidations}</Typography>
              <Typography className="stat-text">Liquidations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0}>
              <Icon icon={cashIcon} className="stat-icon" />
              <Typography className="stat-number">{stats.transactions}</Typography>
              <Typography className="stat-text">Transactions</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0} onClick={handleFeedbackClick}>
              <Icon icon={messageText} className="stat-icon" />
              <Typography className="stat-number">{stats.feedbacks}</Typography>
              <Typography className="stat-text">Feedbacks</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Feedback Section */}
        <Grid item xs={12} md={8}>
          <Paper className="main-content-box">
            <Box className="section-header">
              <Icon icon={messageText} className="section-icon" />
              <Typography variant="h6" className="section-heading">
                Recent User Feedback
              </Typography>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : feedbacks.length > 0 ? (
              <List className="feedback-list">
                {feedbacks.map((feedback, index) => (
                  <React.Fragment key={feedback._id}>
                    <ListItem className="feedback-item">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getAvatarColor(feedback.userName || feedback.organizationName) }}>
                          {(feedback.userName || feedback.organizationName).charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box className="feedback-header">
                            <Typography component="span" className="feedback-name">
                              {feedback.userName || feedback.organizationName}
                            </Typography>
                            {feedback.organizationName && (
                              <Typography component="span" className="feedback-org">
                                {feedback.organizationName}
                              </Typography>
                            )}
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
                              {new Date(feedback.createdAt).toLocaleDateString()}
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
        <Grid item xs={12} md={4}>
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
    </Box>
  );
};

export default Dashboard;