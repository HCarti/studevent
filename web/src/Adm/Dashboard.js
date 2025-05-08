  import React, { useState, useEffect } from 'react';
  import { 
    Box, Typography, Grid, Paper, Avatar, List, ListItem, 
    ListItemAvatar, ListItemText, Divider, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, IconButton, Tooltip, Snackbar, Alert, Card, CardContent,
    useTheme, useMediaQuery, alpha, LinearProgress, Badge, Chip,
    Modal, Dialog, DialogTitle, DialogContent, DialogActions, Button, keyframes,
    TextField
  } from '@mui/material';
  import { Icon } from '@iconify/react';
  import fileDocumentIcon from '@iconify/icons-mdi/file-document';
  import messageText from '@iconify/icons-mdi/message-text';
  import downloadIcon from '@iconify/icons-mdi/download';
  import trendingUpIcon from '@iconify/icons-mdi/trending-up';
  import closeIcon from '@iconify/icons-mdi/close';
  import './Dashboard.css';

  const fadeIn = keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  const Dashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [mounted, setMounted] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [liquidations, setLiquidations] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key
    const [remarks, setRemarks] = useState('');
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
    const [selectedLiquidation, setSelectedLiquidation] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
      setMounted(true);
    }, []);

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

    
// Fetch liquidations with useEffect
      useEffect(() => {
        const fetchLiquidations = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch('https://studevent-server.vercel.app/api/liquidation', {
              headers: { "Authorization": `Bearer ${token}` },
            });
            
            const data = await response.json();
            if (response.ok) {
              setLiquidations(data.data || []);
            }
          } catch (error) {
            console.error("Error fetching liquidations:", error);
          }
        };

        fetchLiquidations();
      }, [refreshKey]); // Add refreshKey as dependency

      // Create a function to force refresh
      const refreshLiquidations = () => {
        setRefreshKey(prev => prev + 1);
      };

    const handleStatusUpdate = async (status) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`https://studevent-server.vercel.app/api/liquidation/${selectedLiquidation._id}/status`, {
          method: 'PATCH',
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status, remarks })
        });
    
        if (!response.ok) {
          throw new Error('Failed to update status');
        }
    
        const updatedData = await response.json();
        
        // Update the liquidations state
        setLiquidations(prev => prev.map(liq => 
          liq._id === selectedLiquidation._id ? { ...liq, status } : liq
        ));

        refreshLiquidations();
        
        setNotification({
          open: true,
          message: `Liquidation ${status.toLowerCase()} successfully`,
          severity: 'success'
        });
        
        handleCloseModal();
      } catch (error) {
        console.error("Error updating liquidation status:", error);
        setNotification({
          open: true,
          message: 'Failed to update liquidation status',
          severity: 'error'
        });
      }
    };

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

    const handleLiquidationClick = (liquidation) => {
      setSelectedLiquidation(liquidation);
    };

    const handleFeedbackClick = (feedback) => {
      setSelectedFeedback(feedback);
    };

    const handleCloseModal = () => {
      setSelectedLiquidation(null);
      setSelectedFeedback(null);
    };

    return (
      <Box 
        className="dashboard-wrapper" 
        sx={{ 
          p: { xs: 2, md: 3 },
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          minHeight: '100vh',
          position: 'relative',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
            zIndex: 0
          }
        }}
      >
        {/* Header Section */}
        <Box 
          sx={{ 
            mb: 4,
            position: 'relative',
            zIndex: 1,
            animation: mounted ? `${fadeIn} 0.8s ease-out` : 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '100%',
              height: '2px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
              borderRadius: 1
            }
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 8s linear infinite',
              mb: 1,
              letterSpacing: '-0.5px',
              '@keyframes gradient': {
                '0%': {
                  backgroundPosition: '0% 50%'
                },
                '50%': {
                  backgroundPosition: '100% 50%'
                },
                '100%': {
                  backgroundPosition: '0% 50%'
                }
              }
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Icon icon={trendingUpIcon} style={{ color: theme.palette.success.main }} />
            System Overview & Submissions
          </Typography>
        </Box>

        {/* Stats Cards Section */}
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 4,
            '& > *': {
              animation: mounted ? `${fadeIn} 0.8s ease-out` : 'none',
              animationDelay: '0.2s',
              animationFillMode: 'both'
            }
          }}
        >
          {[
            { icon: fileDocumentIcon, value: stats.proposals, label: 'Total Proposals', color: 'primary' },
            { icon: fileDocumentIcon, value: stats.liquidations, label: 'Total Liquidations', color: 'success' },
            { icon: messageText, value: stats.feedbacks, label: 'Total Feedbacks', color: 'info' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette[stat.color].main, 0.1)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(45deg, ${alpha(theme.palette[stat.color].main, 0.1)}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    '&::before': {
                      opacity: 1
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                        p: 2,
                        borderRadius: 2,
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon 
                        icon={stat.icon} 
                        style={{ 
                          fontSize: 28, 
                          color: theme.palette[stat.color].main 
                        }} 
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: theme.palette[stat.color].main
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Section */}
        <Grid 
          container 
          spacing={3}
          sx={{
            '& > *': {
              animation: mounted ? `${fadeIn} 0.8s ease-out` : 'none',
              animationDelay: '0.4s',
              animationFillMode: 'both'
            }
          }}
        >
          {/* Recent Liquidations Section */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '100%',
                      height: '1px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                      opacity: 0.2
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon 
                      icon={fileDocumentIcon} 
                      style={{ 
                        fontSize: 24, 
                        color: theme.palette.primary.main 
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Recent Liquidations
                  </Typography>
                </Box>
                
                {loading.liquidations ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : liquidations.length > 0 ? (
                  <TableContainer>
                    <Table size={isMobile ? "small" : "medium"}>
                      {/* Recent Liquidations Section - Updated Table Head */}
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>File</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {liquidations.slice(0, 5).map((liquidation) => (
                    <TableRow 
                      key={liquidation._id}
                      onClick={() => handleLiquidationClick(liquidation)}
                      sx={{ 
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'scale(1.01)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(liquidation.organization),
                              width: 32, 
                              height: 32,
                              mr: 1.5,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}
                          >
                            {liquidation.organization?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {liquidation.organization || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={liquidation.fileName}>
                          <Typography 
                            variant="body2" 
                            noWrap 
                            sx={{ 
                              maxWidth: isMobile ? 100 : 150,
                              fontWeight: 500
                            }}
                          >
                            {liquidation.fileName}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          {liquidation.createdAt ? 
                            new Date(liquidation.createdAt).toLocaleDateString() : 
                            'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={liquidation.status || 'Pending'} 
                          size="small"
                          color={
                            liquidation.status === 'Approved' ? 'success' : 
                            liquidation.status === 'Declined' ? 'error' : 'default'
                          }
                          sx={{ 
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(liquidation.fileUrl, liquidation.fileName);
                            }}
                            size="small"
                            sx={{ 
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                transform: 'scale(1.1)'
                              }
                            }}
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
                  <Box 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body1">
                      No liquidation files submitted yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Feedback Section */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={0}
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '100%',
                      height: '1px',
                      background: `linear-gradient(90deg, ${theme.palette.info.main}, transparent)`,
                      opacity: 0.2
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      p: 1.5,
                      borderRadius: 2,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon 
                      icon={messageText} 
                      style={{ 
                        fontSize: 24, 
                        color: theme.palette.info.main 
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Recent User Feedback
                  </Typography>
                </Box>

                {loading.feedbacks ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : feedbacks.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {feedbacks.map((feedback, index) => (
                      <React.Fragment key={feedback._id || index}>
                        <ListItem 
                          onClick={() => handleFeedbackClick(feedback)}
                          sx={{ 
                            p: 2,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.info.main, 0.05),
                              transform: 'scale(1.01)',
                              borderRadius: 2
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: getAvatarColor(feedback.userName || feedback.organizationName),
                                width: 40,
                                height: 40,
                                fontWeight: 600,
                                border: `2px solid ${alpha(theme.palette.info.main, 0.1)}`
                              }}
                            >
                              {(feedback.userName || feedback.organizationName)?.charAt(0) || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 600,
                                    mr: 1
                                  }}
                                >
                                  {feedback.userName || feedback.organizationName || 'Anonymous'}
                                </Typography>
                                {feedback.rating && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'warning.main',
                                      ml: 'auto',
                                      fontWeight: 600
                                    }}
                                  >
                                    {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                                  </Typography>
                                )}
                              </Box>
                            }
                            secondary={
                              <React.Fragment>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'text.secondary',
                                    mb: 1,
                                    fontWeight: 500
                                  }}
                                >
                                  {feedback.feedback}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'text.disabled',
                                    display: 'block',
                                    fontWeight: 500
                                  }}
                                >
                                  {feedback.createdAt ? 
                                    new Date(feedback.createdAt).toLocaleDateString() : 
                                    'N/A'}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        {index < feedbacks.length - 1 && (
                          <Divider 
                            sx={{ 
                              mx: 2,
                              opacity: 0.1,
                              borderColor: theme.palette.divider
                            }} 
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body1">
                      No feedback available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liquidation Modal */}
       {/* Liquidation Modal */}
<Dialog
  open={!!selectedLiquidation}
  onClose={handleCloseModal}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      bgcolor: 'background.paper',
      p: 2,
      background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
      boxShadow: theme.shadows[10],
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
    }
  }}
>
  {selectedLiquidation && (
    <>
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 24,
          right: 24,
          height: '1px',
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
          opacity: 0.5
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: getAvatarColor(selectedLiquidation.organization),
              width: 40,
              height: 40,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: theme.shadows[2]
            }}
          >
            {selectedLiquidation.organization?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedLiquidation.organization || 'Unknown Organization'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Liquidation Details
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleCloseModal} 
          size="small"
          sx={{
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <Icon icon={closeIcon} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  File Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedLiquidation.fileName}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  label={selectedLiquidation.status || 'Pending'} 
                  size="small"
                  color={
                    selectedLiquidation.status === 'Approved' ? 'success' : 
                    selectedLiquidation.status === 'Declined' ? 'error' : 'default'
                  }
                  sx={{ 
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    px: 1,
                    py: 0.5
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Submission Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedLiquidation.createdAt ? 
                new Date(selectedLiquidation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 
                'N/A'}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Add New Remarks
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks here..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: alpha(theme.palette.divider, 0.3)
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        pt: 0,
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => handleStatusUpdate('Approved')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600
            }}
          >
            Approve
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => handleStatusUpdate('Declined')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600
            }}
          >
            Decline
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseModal}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(selectedLiquidation.fileUrl, selectedLiquidation.fileName);
            }}
            startIcon={<Icon icon={downloadIcon} />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
              bgcolor: 'primary.dark',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            Download
          </Button>
        </Box>
      </DialogActions>
    </>
  )}
</Dialog>

        {/* Feedback Modal */}
        <Dialog
          open={!!selectedFeedback}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              p: 2
            }
          }}
        >
          {selectedFeedback && (
            <>
              <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(selectedFeedback.userName || selectedFeedback.organizationName),
                      width: 40,
                      height: 40,
                      border: `2px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    {(selectedFeedback.userName || selectedFeedback.organizationName)?.charAt(0) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedFeedback.userName || selectedFeedback.organizationName || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Feedback Details
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleCloseModal} size="small">
                  <Icon icon={closeIcon} />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  {selectedFeedback.rating && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Rating
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'warning.main',
                          fontWeight: 600
                        }}
                      >
                        {'★'.repeat(selectedFeedback.rating)}{'☆'.repeat(5 - selectedFeedback.rating)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Feedback
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedFeedback.feedback}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Submission Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedFeedback.createdAt ? 
                        new Date(selectedFeedback.createdAt).toLocaleDateString() : 
                        'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCloseModal}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

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
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  };

  export default Dashboard;