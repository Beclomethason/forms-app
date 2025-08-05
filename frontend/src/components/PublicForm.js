import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  LinearProgress, Alert, Chip, Divider
} from '@mui/material';
import { formsAPI, responsesAPI } from '../services/api';

const PublicForm = ({ formId }) => {
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Loading form...</Typography>
        </Box>
      </Container>
    );
  }

  if (error && !form) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Form Not Found
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            🎉 Thank You!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your feedback has been submitted successfully.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We appreciate you taking the time to share your thoughts with us.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2, backgroundColor: '#4f46e5' }}
          >
            Submit Another Response
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{ 
          backgroundColor: '#4f46e5', 
          color: 'white', 
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom>
            {form.title}
          </Typography>
          {form.description && (
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {form.description}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${questions.length} Questions`} 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <Box key={question.id} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {index + 1}. {question.text}
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
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
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
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {index < questions.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ 
                  backgroundColor: '#22c55e',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Powered by Feedback Platform
        </Typography>
      </Box>
    </Container>
  );
};

export default PublicForm;
