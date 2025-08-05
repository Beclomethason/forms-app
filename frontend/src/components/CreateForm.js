import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, IconButton, Card, CardContent,
  Divider, Stack, Chip, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon
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
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { 
          text: '', 
          question_type: 'text', 
          options: [], 
          is_required: true, 
          order: formData.questions.length 
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        questions: updatedQuestions
      });
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

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                ✨ Create New Form
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Design your feedback form with custom questions
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
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
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#2d3748' }}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                label="Form Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          </Paper>

          {/* Questions Section */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
                ❓ Questions ({formData.questions.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}
              >
                Add Question
              </Button>
            </Stack>

            <Stack spacing={3}>
              {formData.questions.map((question, index) => (
                <Card 
                  key={index} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    '&:hover': { boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip 
                        label={`Question ${index + 1}`} 
                        sx={{ 
                          bgcolor: '#e3f2fd', 
                          color: '#1976d2',
                          fontWeight: 600
                        }} 
                      />
                      {formData.questions.length > 1 && (
                        <IconButton 
                          onClick={() => removeQuestion(index)}
                          sx={{ 
                            color: '#ef4444',
                            '&:hover': { bgcolor: '#fee2e2' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                        required
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />

                      <FormControl fullWidth>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={question.question_type}
                          label="Question Type"
                          onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                          sx={{ borderRadius: 2 }}
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
                              // Handle empty string
                              if (!optionsString.trim()) {
                                updatedQuestions[index].options = [];
                              } else {
                                // Split by comma and clean up
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                  </CardContent>
                </Card>
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
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: '#6b7280',
                  color: '#6b7280'
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<SaveIcon />}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                {loading ? 'Creating...' : 'Create Form'}
              </Button>
            </Stack>
          </Paper>
        </form>
      </Container>
    </Box>
  );
};

export default CreateForm;
