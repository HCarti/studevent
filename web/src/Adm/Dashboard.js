// src/Dashboard.js
import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
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

  // Sample user feedback data
  const feedbacks = [
    {
      id: 1,
      name: 'Sarah Johnson',
      org: 'COCO',
      comment: 'The proposal submission process was smooth and intuitive. Great job!',
      rating: 5,
      date: '2024-03-15',
      avatarColor: '#007bff'
    },
    {
      id: 2,
      name: 'Michael Chen',
      org: 'JPCS',
      comment: 'Had some issues with file uploads, but support was responsive.',
      rating: 4,
      date: '2024-03-10',
      avatarColor: '#28a745'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      org: 'FNL',
      comment: 'Would love to see more reporting features in the dashboard.',
      rating: 3,
      date: '2024-03-05',
      avatarColor: '#dc3545'
    },
  ];

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
              <Typography className="stat-number">178</Typography>
              <Typography className="stat-text">Proposals</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0} onClick={handleAdminLiquidationClick}>
              <Icon icon={bankIcon} className="stat-icon" />
              <Typography className="stat-number">20</Typography>
              <Typography className="stat-text">Liquidations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0}>
              <Icon icon={cashIcon} className="stat-icon" />
              <Typography className="stat-number">190</Typography>
              <Typography className="stat-text">Transactions</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className="stat-box" elevation={0} onClick={handleFeedbackClick}>
              <Icon icon={messageText} className="stat-icon" />
              <Typography className="stat-number">42</Typography>
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
            <List className="feedback-list">
              {feedbacks.map((feedback, index) => (
                <React.Fragment key={feedback.id}>
                  <ListItem className="feedback-item">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: feedback.avatarColor }}>
                        {feedback.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="feedback-header">
                          <Typography component="span" className="feedback-name">
                            {feedback.name}
                          </Typography>
                          <Typography component="span" className="feedback-org">
                            {feedback.org}
                          </Typography>
                          <Typography component="span" className="feedback-rating">
                            {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="p" className="feedback-comment">
                            {feedback.comment}
                          </Typography>
                          <Typography component="p" className="feedback-date">
                            {feedback.date}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < feedbacks.length - 1 && <Divider light />}
                </React.Fragment>
              ))}
            </List>
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