import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, IconButton, Card, CardContent,
  Divider, Stack, Chip, Alert, Fab, Zoom, useTheme, useMediaQuery,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  DragHandle as DragHandleIcon,
  TextFields as TextFieldsIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { formsAPI } from '../services/api';

const CreateForm = ({ onFormCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [
      { text: '', question_type: 'text', options: [], is_required: true, order: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    const newIndex = formData.questions.length;
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { 
          text: '', 
          question_type: 'text', 
          options: [], 
          is_required: true, 
          order: newIndex 
        }
      ]
    });
    setExpandedQuestion(newIndex); // Auto-expand new question
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        questions: updatedQuestions
      });
      // Adjust expanded question if needed
      if (expandedQuestion >= updatedQuestions.length) {
        setExpandedQuestion(Math.max(0, updatedQuestions.length - 1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await formsAPI.createForm(formData);
      onFormCreated(response);
    } catch (error) {
      setError('Failed to create form. Please try again.');
      console.error('Form creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (questionIndex) => (event, isExpanded) => {
    setExpandedQuestion(isExpanded ? questionIndex : false);
  };

  return (
    <Box sx={{ 
      backgroundColor: '#f5f7fa', 
      minHeight: '100vh', 
      py: isMobile ? 2 : 4,
      position: 'relative'
    }}>
      <Container maxWidth="md">
        {/* Mobile-Optimized Header */}
        <Paper 
          sx={{ 
            p: isMobile ? 2 : 3, 
            mb: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Stack 
            direction={isMobile ? "column" : "row"} 
            alignItems={isMobile ? "flex-start" : "center"} 
            justifyContent="space-between"
            spacing={isMobile ? 2 : 0}
          >
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 600, mb: 1 }}>
                ✨ Create New Form
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Design your feedback form with custom questions
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                alignSelf: isMobile ? 'flex-start' : 'center',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Back
            </Button>
          </Stack>
        </Paper>

        <form onSubmit={handleSubmit}>
          {/* Form Details Section */}
          <Paper sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
              📋 Form Details
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Form Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                variant="outlined"
                placeholder="Enter a descriptive title for your form"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Form Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={isMobile ? 2 : 3}
                variant="outlined"
                placeholder="Describe what this form is for (optional)"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  }
                }}
              />
            </Stack>
          </Paper>

          {/* Questions Section */}
          <Paper sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Stack 
              direction={isMobile ? "column" : "row"} 
              justifyContent="space-between" 
              alignItems={isMobile ? "flex-start" : "center"} 
              sx={{ mb: 3 }}
              spacing={isMobile ? 2 : 0}
            >
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600, color: '#2d3748' }}>
                ❓ Questions ({formData.questions.length})
              </Typography>
              
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4ff 100%)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Add Question
                </Button>
              )}
            </Stack>

            {/* Mobile-Optimized Questions List */}
            <Stack spacing={2}>
              {formData.questions.map((question, index) => (
                <Accordion
                  key={index}
                  expanded={expandedQuestion === index}
                  onChange={handleAccordionChange(index)}
                  sx={{
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&.Mui-expanded': {
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-expanded': {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 1 }}>
                      <Chip 
                        label={`Q${index + 1}`} 
                        size="small"
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2',
                          fontWeight: 600,
                          minWidth: '45px'
                        }} 
                      />
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {question.text || 'New Question'}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip 
                            icon={question.question_type === 'text' ? <TextFieldsIcon /> : <CheckCircleIcon />}
                            label={question.question_type === 'text' ? 'Text' : 'Multiple Choice'}
                            size="small"
                            variant="outlined"
                          />
                          {question.is_required && (
                            <Chip label="Required" size="small" color="warning" variant="outlined" />
                          )}
                        </Stack>
                      </Box>

                      {formData.questions.length > 1 && (
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(index);
                          }}
                          size="small"
                          sx={{ 
                            color: '#ef4444',
                            '&:hover': { bgcolor: '#fee2e2' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Enter your question here"
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#667eea' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          }
                        }}
                      />

                      <FormControl fullWidth>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={question.question_type}
                          label="Question Type"
                          onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                          sx={{ 
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' }
                          }}
                        >
                          <MenuItem value="text">📝 Text Answer</MenuItem>
                          <MenuItem value="multiple_choice">☑️ Multiple Choice</MenuItem>
                        </Select>
                      </FormControl>

                      {question.question_type === 'multiple_choice' && (
                        <Box>
                          <TextField
                            fullWidth
                            label="Options (separate with commas)"
                            value={question.options && question.options.length > 0 ? question.options.join(', ') : ''}
                            onChange={(e) => {
                              const optionsString = e.target.value;
                              const updatedQuestions = [...formData.questions];
                              if (!optionsString.trim()) {
                                updatedQuestions[index].options = [];
                              } else {
                                const optionsArray = optionsString.split(',').map(opt => opt.trim());
                                updatedQuestions[index].options = optionsArray;
                              }
                              setFormData({
                                ...formData,
                                questions: updatedQuestions
                              });
                            }}
                            placeholder="Yes, No, Maybe"
                            variant="outlined"
                            helperText="Type options separated by commas"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#667eea' },
                                '&.Mui-focused fieldset': { borderColor: '#667eea' }
                              }
                            }}
                          />
                          
                          {/* Preview */}
                          {question.options && question.options.filter(opt => opt.trim()).length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Options Preview:
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {question.options.filter(opt => opt.trim()).map((option, optionIndex) => (
                                  <Chip 
                                    key={optionIndex}
                                    label={option}
                                    variant="outlined"
                                    size="small"
                                    sx={{ bgcolor: '#f0f9ff', borderColor: '#0ea5e9' }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      )}

                      <FormControlLabel
                        control={
                          <Switch
                            checked={question.is_required}
                            onChange={(e) => handleQuestionChange(index, 'is_required', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Required Question"
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Stack 
              direction={isMobile ? "column" : "row"} 
              justifyContent="center" 
              spacing={2}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                fullWidth={isMobile}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#374151',
                    color: '#374151'
                  }
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<SaveIcon />}
                fullWidth={isMobile}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Form'}
              </Button>
            </Stack>
          </Paper>
        </form>

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <Zoom in={true}>
            <Fab
              color="primary"
              onClick={addQuestion}
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4ff 100%)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        )}
      </Container>
    </Box>
  );
};

export default CreateForm;
