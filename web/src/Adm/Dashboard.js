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
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, LinearScale, CategoryScale);

const Dashboard = () => {
  const navigate = useNavigate();

  // Pie chart data (Organization representation)
  const pieData = {
    labels: ['COCO', 'JPCS', 'NUHO', 'FNL', 'MTSC'],
    datasets: [
      {
        data: [26.7, 20, 13.3, 23.3, 16.7],
        backgroundColor: [
          'rgba(0, 123, 255, 0.7)',
          'rgba(40, 167, 69, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(220, 53, 69, 0.7)',
          'rgba(108, 117, 125, 0.7)',
        ],
        hoverBackgroundColor: [
          'rgba(0, 123, 255, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(108, 117, 125, 1)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
        cutout: '60%', 
      },
    ],
  };

  const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Proposals',
        data: [12, 15, 8, 20, 18, 25],
        borderColor: '#007BFF',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.4,
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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" className="dashboard-heading">
            Admin Dashboard
          </Typography>
        </Grid>

        {/* Top Stats Section */}
        <Grid container spacing={3} className="top-stats">
          <Grid item xs={12} sm={4}>
            <Paper className="stat-box" elevation={3} onClick={handleProposalClick}>
              <Icon icon={fileDocumentIcon} className="stat-icon" />
              <Typography className="stat-number">Proposals</Typography>
              <Typography className="stat-text">Submitted: 178+</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className="stat-box" elevation={3} onClick={handleAdminLiquidationClick}>
              <Icon icon={cashIcon} className="stat-icon" />
              <Typography className="stat-number">Liquidations</Typography>
              <Typography className="stat-text">Completed: 20+</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className="stat-box" elevation={3}>
              <Icon icon={cashIcon} className="stat-icon" />
              <Typography className="stat-number">Transactions</Typography>
              <Typography className="stat-text">Processed: 190+</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Reports (Line Chart) Section */}
        <Grid item xs={12} md={6}>
          <Paper className="chart-box">
            <Typography variant="h6" className="chart-heading">
              Proposals Over Time
            </Typography>
            <Line data={lineData} />
          </Paper>
        </Grid>

        {/* Pie Chart Section */}
        <Grid item xs={12} md={6}>
          <Paper className="chart-box">
            <Typography variant="h6" className="chart-heading">
              Organization Representation
            </Typography>
            <Pie data={pieData} />
          </Paper>
        </Grid>

        {/* Top Organizations Section */}
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

        {/* Recent Events Section */}
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
