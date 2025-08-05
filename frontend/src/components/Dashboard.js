import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, 
  Grid, Card, CardContent, Box, Chip, LinearProgress,
  Paper, Avatar, IconButton, Divider, Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { formsAPI, responsesAPI } from '../services/api';

const Dashboard = ({ user, onLogout, onCreateForm }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [copySuccess, setCopySuccess] = useState({});

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
  //const option=answer.answer_text || 'No Answer';
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
      {/* Enhanced Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Feedback Dashboard
          </Typography>
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
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {forms.length}
              </Typography>
              <Typography variant="body1">Total Forms</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {responses.length}
              </Typography>
              <Typography variant="body1">Total Responses</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {selectedForm ? selectedForm.title : 'Select Form'}
              </Typography>
              <Typography variant="body1">Active Analysis</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Forms Section */}
          <Grid item xs={12} md={selectedForm ? 6 : 12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
                  Your Forms
                </Typography>
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
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                              {form.title}
                            </Typography>
                            <Chip 
                              label={`${form.questions.length} Questions`} 
                              size="small"
                              sx={{ bgcolor: '#e6fffa', color: '#065f46' }}
                            />
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
                              startIcon={<LinkIcon />}
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

          {/* Enhanced Summary Section */}
          {selectedForm && (
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
                    
                    {summaryData.map((questionSummary, index) => (
                      <Box key={index} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                          {index + 1}. {questionSummary.question}
                        </Typography>
                        
                        {questionSummary.type === 'multiple_choice' ? (
                          <Box sx={{ pl: 2 }}>
                            {questionSummary.options.map((option, optionIndex) => (
                              <Box key={optionIndex} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {option.option}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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
                                    height: 8, 
                                    borderRadius: 4,
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
                          <Box sx={{ pl: 2, maxHeight: 200, overflowY: 'auto' }}>
                            {questionSummary.textResponses.map((response, responseIndex) => (
                              <Box key={responseIndex} sx={{ mb: 1, p: 2, bgcolor: '#f9fafb', borderRadius: 1, borderLeft: '4px solid #3b82f6' }}>
                                <Typography variant="body2">
                                  {response}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
