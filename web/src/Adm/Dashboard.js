// src/Dashboard.js
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Icon } from '@iconify/react';
import noteTextIcon from '@iconify/icons-mdi/note-text';
import checkBoxMarkedOutlineIcon from '@iconify/icons-mdi/checkbox-marked-outline';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();

  const pieData = {
    labels: ['COCO', 'JPCS', 'NUHO', 'FNL', 'MTSC'],
    datasets: [
      {
        data: [26.7, 20, 13.3, 23.3, 16.7],
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
      },
    ],
  };

  const handleProposalClick = () => {
    console.log("proposal clicked");
    navigate('/adminproposal');
  };

  const handleAdminLiquidationClick = () => {
    console.log("AdminLiquidation clicked");
    navigate('/adminliquidation');
  };


  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Dashboard</Typography>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F6F957' }} onClick={handleProposalClick}>
            <Typography variant="h4">3</Typography>
            <Typography>Proposals</Typography>
            <Icon icon={noteTextIcon} style={{ fontSize: '50px' }} />
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F6C3FC' }} onClick={handleAdminLiquidationClick}>
            <Typography variant="h4">1</Typography>
            <Typography>Liquidations</Typography>
            <Icon icon={checkBoxMarkedOutlineIcon} style={{ fontSize: '50px' }} />
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '300px', height: '300px', margin: 'auto' }}>
              <Pie data={pieData} />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Top Organizations 1st Term 2023-2024</Typography>
            <Typography>1. Couture Collective - 8 Events</Typography>
            <Typography>2. Federation of Nationalian Leaders - 7 Events</Typography>
            <Typography>3. Junior Philippine Computer Society - 6 Events</Typography>
            <Typography>4. Medical Technology Council - 5 Events</Typography>
            <Typography>5. Hyroid Olympians - 4 Events</Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h6">Recent Events</Typography>
            <Typography>March 3, 2024</Typography>
            <Typography>Mobile Legends Tournament</Typography>
            <Typography>Leadership Seminar</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard