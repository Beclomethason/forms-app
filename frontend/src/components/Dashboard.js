import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, 
  Grid, Card, CardContent, Box, Chip, LinearProgress,
  Paper, Avatar, IconButton, Divider, Stack, useTheme, useMediaQuery,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Fab, Zoom,
  Menu, MenuItem, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

// Import ALL icons from @mui/icons-material (not @mui/material)
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  FileCopy as FileCopyIcon,
  MoreVert as MoreVertIcon,    // Import from @mui/icons-material
  Share as ShareIcon,          // Import from @mui/icons-material  
  ExpandMore as ExpandMoreIcon // Import from @mui/icons-material
} from '@mui/icons-material';

import { formsAPI, responsesAPI } from '../services/api';

const Dashboard = ({ user, onLogout, onCreateForm }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [copySuccess, setCopySuccess] = useState({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [formMenuAnchor, setFormMenuAnchor] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await formsAPI.getForms();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId) => {
    try {
      const data = await responsesAPI.getFormResponses(formId);
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleViewResponses = async (form) => {
    setSelectedForm(form);
    await fetchResponses(form.id);
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const getPublicFormUrl = (formId) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const handleCopyLink = async (formId) => {
    const url = getPublicFormUrl(formId);
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess({...copySuccess, [formId]: true});
      setTimeout(() => {
        setCopySuccess({...copySuccess, [formId]: false});
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleFormMenuClick = (event, formId) => {
    setFormMenuAnchor({...formMenuAnchor, [formId]: event.currentTarget});
  };

  const handleFormMenuClose = (formId) => {
    setFormMenuAnchor({...formMenuAnchor, [formId]: null});
  };

  const createSummary = () => {
    if (!selectedForm || responses.length === 0) return [];

    const summary = selectedForm.questions.map(question => {
      const questionAnswers = responses.flatMap(response => 
        response.answers.filter(answer => answer.question === question.id)
      );

      if (question.question_type === 'multiple_choice') {
        const voteCounts = {};
        questionAnswers.forEach(answer => {
          const option = answer.answer_text || 'No Answer';
          voteCounts[option] = (voteCounts[option] || 0) + 1;
        });

        return {
          question: question.text,
          type: 'multiple_choice',
          totalResponses: questionAnswers.length,
          options: Object.entries(voteCounts).map(([option, count]) => ({
            option,
            count,
            percentage: questionAnswers.length > 0 ? (count / questionAnswers.length * 100).toFixed(1) : 0
          }))
        };
      } else {
        return {
          question: question.text,
          type: 'text',
          totalResponses: questionAnswers.length,
          textResponses: questionAnswers.map(answer => answer.answer_text)
        };
      }
    });

    return summary;
  };

  const summaryData = createSummary();

  // Mobile drawer content for analytics
  const AnalyticsDrawer = () => (
    <Drawer
      anchor="bottom"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: {
          height: '90vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Analytics: {selectedForm?.title}
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {renderAnalyticsContent()}
      </Box>
    </Drawer>
  );

  const renderAnalyticsContent = () => (
    <>
      {responses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No responses yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share your form to start collecting feedback
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f7fafc', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
              {responses.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Responses Collected
            </Typography>
          </Box>
          
          {responses.length > 0 && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={async () => {
                try {
                  await responsesAPI.exportCSV(selectedForm.id);
                } catch (error) {
                  console.error('Export failed:', error);
                }
              }}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Export CSV
            </Button>
          )}
          
          {summaryData.map((questionSummary, index) => (
            <Accordion key={index} sx={{ mb: 2, borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Q{index + 1}: {questionSummary.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {questionSummary.type === 'multiple_choice' ? (
                  <Box>
                    {questionSummary.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {option.option}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              {option.count} votes
                            </Typography>
                            <Chip 
                              label={`${option.percentage}%`} 
                              size="small" 
                              sx={{ bgcolor: '#dbeafe', color: '#1e40af' }}
                            />
                          </Box>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(option.percentage)} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#3b82f6'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {questionSummary.textResponses.map((response, responseIndex) => (
                      <Box key={responseIndex} sx={{ mb: 1, p: 2, bgcolor: '#f9fafb', borderRadius: 1, borderLeft: '4px solid #3b82f6' }}>
                        <Typography variant="body2">
                          {response}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Mobile-Optimized Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ py: 1, px: isMobile ? 2 : 3 }}>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {isMobile ? "Dashboard" : "Feedback Dashboard"}
          </Typography>
          
          {!isMobile ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user.username}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Administrator
                </Typography>
              </Box>
              <IconButton color="inherit" onClick={onLogout}>
                <LogoutIcon />
              </IconButton>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton color="inherit" onClick={onLogout} size="small">
                <LogoutIcon />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
        {/* Mobile-Optimized Stats Cards */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              borderRadius: 2
            }}>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
                {forms.length}
              </Typography>
              <Typography variant="body2">Total Forms</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white',
              borderRadius: 2
            }}>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
                {responses.length}
              </Typography>
              <Typography variant="body2">Total Responses</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              color: 'white',
              borderRadius: 2
            }}>
              <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: 'bold' }}>
                {selectedForm ? (isMobile ? "Active" : selectedForm.title) : 'Select Form'}
              </Typography>
              <Typography variant="body2">Active Analysis</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Forms Section */}
          <Grid item xs={12} md={isMobile || !selectedForm ? 12 : 6}>
            <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600, color: '#2d3748' }}>
                  Your Forms
                </Typography>
                {!isMobile && (
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={onCreateForm}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Create New Form
                  </Button>
                )}
              </Box>

              {forms.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssessmentIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No forms yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first form to start collecting feedback
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {forms.map((form, index) => (
                    <Grid item xs={12} key={form.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          '&:hover': { 
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease',
                          borderRadius: 2
                        }}
                      >
                        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600, color: '#2d3748', flex: 1 }}>
                              {form.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={`${form.questions.length} Q`} 
                                size="small"
                                sx={{ bgcolor: '#e6fffa', color: '#065f46' }}
                              />
                              {isMobile && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleFormMenuClick(e, form.id)}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {form.description || 'No description provided'}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label={`Created: ${new Date(form.created_at).toLocaleDateString()}`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>

                          {!isMobile ? (
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewResponses(form)}
                                sx={{ borderRadius: 2 }}
                              >
                                View Responses
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<LinkIcon />}
                                onClick={() => window.open(`/form/${form.id}`, '_blank')}
                                sx={{ borderRadius: 2 }}
                              >
                                Preview
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<FileCopyIcon />}
                                onClick={() => handleCopyLink(form.id)}
                                sx={{ 
                                  bgcolor: copySuccess[form.id] ? '#10b981' : '#059669',
                                  '&:hover': { bgcolor: '#047857' },
                                  borderRadius: 2
                                }}
                              >
                                {copySuccess[form.id] ? 'Copied!' : 'Copy Link'}
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<BarChartIcon />}
                              onClick={() => handleViewResponses(form)}
                              sx={{ borderRadius: 2 }}
                            >
                              View Analytics
                            </Button>
                          )}

                          {/* Mobile Menu */}
                          <Menu
                            anchorEl={formMenuAnchor[form.id]}
                            open={Boolean(formMenuAnchor[form.id])}
                            onClose={() => handleFormMenuClose(form.id)}
                          >
                            <MenuItem onClick={() => {
                              window.open(`/form/${form.id}`, '_blank');
                              handleFormMenuClose(form.id);
                            }}>
                              <ListItemIcon><LinkIcon /></ListItemIcon>
                              <ListItemText>Preview Form</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => {
                              handleCopyLink(form.id);
                              handleFormMenuClose(form.id);
                            }}>
                              <ListItemIcon><ShareIcon /></ListItemIcon>
                              <ListItemText>Share Link</ListItemText>
                            </MenuItem>
                          </Menu>

                          <Divider sx={{ my: 2 }} />
                          <Typography variant="caption" sx={{ color: '#6b7280', wordBreak: 'break-all' }}>
                            {getPublicFormUrl(form.id)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Desktop Analytics Section */}
          {!isMobile && selectedForm && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
                    Analytics: {selectedForm.title}
                  </Typography>
                  {responses.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={async () => {
                        try {
                          await responsesAPI.exportCSV(selectedForm.id);
                        } catch (error) {
                          console.error('Export failed:', error);
                        }
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Export CSV
                    </Button>
                  )}
                </Box>
                {renderAnalyticsContent()}
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Mobile FAB */}
        {isMobile && (
          <Zoom in={true}>
            <Fab
              color="primary"
              onClick={onCreateForm}
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        )}

        {/* Mobile Analytics Drawer */}
        {isMobile && <AnalyticsDrawer />}
      </Container>
    </Box>
  );
};

export default Dashboard;
