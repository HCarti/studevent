// src/Dashboard.js
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Icon } from '@iconify/react';
import fileDocumentIcon from '@iconify/icons-mdi/file-document';
import cashIcon from '@iconify/icons-mdi/cash';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();

  const pieData = {
    labels: ['COCO', 'JPCS', 'NUHO', 'FNL', 'MTSC'],
    datasets: [
      {
        data: [26.7, 20, 13.3, 23.3, 16.7],
        backgroundColor: ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#6C757D'],
      },
    ],
  };

  const handleProposalClick = () => {
    navigate('/adminproposal');
  };

  const handleAdminLiquidationClick = () => {
    navigate('/adminliquidation');
  };

  return (
    <Box className="dashboard-wrapper">
      <Typography variant="h3" className="dashboard-heading">
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={2} className="widget-section">
        <Grid item xs={12} sm={4}>
          <Paper className="widget-box proposal-widget" elevation={3} onClick={handleProposalClick}>
            <Icon icon={fileDocumentIcon} className="widget-icon" />
            <Typography variant="h5" className="widget-number">3</Typography>
            <Typography variant="body1" className="widget-text">Proposals</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="widget-box liquidation-widget" elevation={3} onClick={handleAdminLiquidationClick}>
            <Icon icon={cashIcon} className="widget-icon" />
            <Typography variant="h5" className="widget-number">1</Typography>
            <Typography variant="body1" className="widget-text">Liquidations</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="widget-box pie-chart-widget" elevation={3}>
            <Pie data={pieData} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} className="details-wrapper">
        <Grid item xs={12} sm={6}>
          <Paper className="detail-box" elevation={3}>
            <Typography variant="h6" className="detail-heading">
              Top Organizations
            </Typography>
            <Typography variant="body2" className="detail-text">1. Couture Collective - 8 Events</Typography>
            <Typography variant="body2" className="detail-text">2. FNL - 7 Events</Typography>
            <Typography variant="body2" className="detail-text">3. JPCS - 6 Events</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className="detail-box" elevation={3}>
            <Typography variant="h6" className="detail-heading">
              Recent Events
            </Typography>
            <Typography variant="body2" className="detail-text">March 3, 2024 - Mobile Legends Tournament</Typography>
            <Typography variant="body2" className="detail-text">Leadership Seminar</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
