import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  LinearProgress, Alert, Chip, Divider, Card, CardContent,
  useTheme, useMediaQuery, Stepper, Step, StepLabel, StepContent,
  Fade, Zoom, Avatar, Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { formsAPI, responsesAPI } from '../services/api';

const PublicForm = ({ formId }) => {
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const fetchFormData = async () => {
    try {
      const [formData, questionsData] = await Promise.all([
        formsAPI.getForm(formId),
        formsAPI.getFormQuestions(formId)
      ]);
      
      setForm(formData);
      setQuestions(questionsData);
      
      // Initialize responses object
      const initialResponses = {};
      questionsData.forEach(question => {
        initialResponses[question.id] = '';
      });
      setResponses(initialResponses);
      
    } catch (error) {
      setError('Form not found or no longer available.');
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate required fields
      const requiredQuestions = questions.filter(q => q.is_required);
      const missingResponses = requiredQuestions.filter(q => !responses[q.id] || responses[q.id].trim() === '');
      
      if (missingResponses.length > 0) {
        setError('Please fill in all required fields.');
        setSubmitting(false);
        return;
      }

      // Format responses for submission
      const formattedAnswers = questions.map(question => ({
        question: question.id,
        answer_text: responses[question.id] || ''
      }));

      const submissionData = {
        form: formId,
        answers: formattedAnswers
      };

      await responsesAPI.submitResponse(formId, submissionData);
      setSubmitted(true);
      
    } catch (error) {
      setError('Failed to submit response. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => responses[q.id] && responses[q.id].trim() !== '').length;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Paper 
          elevation={24}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Avatar sx={{ 
            width: 64, 
            height: 64, 
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <AssignmentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <LinearProgress 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              height: 8,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }
            }} 
          />
          <Typography variant="h6" sx={{ color: '#2d3748' }}>
            Loading your form...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error && !form) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Paper 
          elevation={24}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxWidth: 500
          }}
        >
          <Avatar sx={{ 
            width: 64, 
            height: 64, 
            margin: '0 auto 16px',
            bgcolor: '#ef4444'
          }}>
            <AssignmentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: '#ef4444' }}>
            Form Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Zoom in={submitted} timeout={800}>
          <Paper 
            elevation={24}
            sx={{ 
              p: isMobile ? 3 : 5, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              maxWidth: 500
            }}
          >
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
              <CheckCircleIcon sx={{ fontSize: 48 }} />
            </Avatar>
            
            <Typography variant={isMobile ? "h4" : "h3"} sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎉 Thank You!
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#2d3748' }}>
              Your feedback has been submitted successfully
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We appreciate you taking the time to share your thoughts with us. Your input helps us improve!
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} sx={{ color: '#fbbf24', fontSize: 24 }} />
              ))}
            </Stack>
            
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
              sx={{ 
                mt: 2, 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Submit Another Response
            </Button>
          </Paper>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: isMobile ? 2 : 4
    }}>
      <Container maxWidth="md">
        <Fade in={!loading} timeout={600}>
          <Paper elevation={24} sx={{ 
            overflow: 'hidden',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Enhanced Header Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              p: isMobile ? 3 : 5,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ 
                  width: isMobile ? 60 : 80, 
                  height: isMobile ? 60 : 80, 
                  margin: '0 auto 16px',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <AssignmentIcon sx={{ fontSize: isMobile ? 28 : 40 }} />
                </Avatar>

                <Typography variant={isMobile ? "h4" : "h3"} sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {form.title}
                </Typography>
                
                {form.description && (
                  <Typography variant={isMobile ? "body1" : "h6"} sx={{ 
                    opacity: 0.9, 
                    mb: 3,
                    maxWidth: 600,
                    margin: '0 auto 24px'
                  }}>
                    {form.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                  <Chip 
                    label={`${questions.length} Questions`} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Chip 
                    label={`${getCompletionPercentage()}% Complete`} 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </Stack>

                {/* Progress Bar */}
                <LinearProgress 
                  variant="determinate" 
                  value={getCompletionPercentage()} 
                  sx={{ 
                    borderRadius: 2,
                    height: 8,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'rgba(255,255,255,0.8)',
                      borderRadius: 2
                    }
                  }} 
                />
              </Box>
            </Box>

            {/* Enhanced Form Content */}
            <Box sx={{ p: isMobile ? 3 : 4 }}>
              <form onSubmit={handleSubmit}>
                {isMobile ? (
                  // Mobile: Stepper Layout
                  <Stepper activeStep={currentStep} orientation="vertical">
                    {questions.map((question, index) => (
                      <Step key={question.id}>
                        <StepLabel>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Question {index + 1}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                              {question.text}
                              {question.is_required && (
                                <Typography component="span" color="error" sx={{ ml: 1 }}>
                                  *
                                </Typography>
                              )}
                            </Typography>

                            {question.question_type === 'text' ? (
                              <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                value={responses[question.id] || ''}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                required={question.is_required}
                                placeholder="Enter your response..."
                                variant="outlined"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    '&:hover fieldset': { borderColor: '#667eea' },
                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                  }
                                }}
                              />
                            ) : (
                              <FormControl component="fieldset">
                                <RadioGroup
                                  value={responses[question.id] || ''}
                                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                >
                                  {question.options && question.options.map((option, optionIndex) => (
                                    <FormControlLabel
                                      key={optionIndex}
                                      value={option}
                                      control={<Radio required={question.is_required} />}
                                      label={option}
                                      sx={{ 
                                        mb: 1,
                                        '& .MuiFormControlLabel-label': {
                                          fontSize: '1rem'
                                        }
                                      }}
                                    />
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                              {index < questions.length - 1 && (
                                <Button
                                  onClick={() => setCurrentStep(index + 1)}
                                  endIcon={<ArrowForwardIcon />}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Next Question
                                </Button>
                              )}
                            </Box>
                          </Card>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                ) : (
                  // Desktop: Card Layout
                  <Stack spacing={4}>
                    {questions.map((question, index) => (
                      <Card key={question.id} variant="outlined" sx={{ 
                        borderRadius: 2,
                        '&:hover': { 
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '1rem',
                              fontWeight: 600
                            }}>
                              {index + 1}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: '#2d3748',
                                mb: 1
                              }}>
                                {question.text}
                                {question.is_required && (
                                  <Chip 
                                    label="Required" 
                                    size="small" 
                                    color="error" 
                                    sx={{ ml: 2 }}
                                  />
                                )}
                              </Typography>

                              {question.question_type === 'text' ? (
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={3}
                                  value={responses[question.id] || ''}
                                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                  required={question.is_required}
                                  placeholder="Enter your response..."
                                  variant="outlined"
                                  sx={{ 
                                    mt: 2,
                                    '& .MuiOutlinedInput-root': { 
                                      borderRadius: 2,
                                      '&:hover fieldset': { borderColor: '#667eea' },
                                      '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                    }
                                  }}
                                />
                              ) : (
                                <FormControl component="fieldset" sx={{ mt: 2 }}>
                                  <RadioGroup
                                    value={responses[question.id] || ''}
                                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                  >
                                    {question.options && question.options.map((option, optionIndex) => (
                                      <FormControlLabel
                                        key={optionIndex}
                                        value={option}
                                        control={<Radio required={question.is_required} />}
                                        label={option}
                                        sx={{ 
                                          mb: 1,
                                          '& .MuiFormControlLabel-label': {
                                            fontSize: '1rem'
                                          }
                                        }}
                                      />
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 3, 
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={<SendIcon />}
                    sx={{ 
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Your response will be submitted securely and anonymously
                  </Typography>
                </Box>
              </form>
            </Box>
          </Paper>
        </Fade>

        {/* Enhanced Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🔒 Powered by Feedback Platform - Your privacy is protected
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicForm;
