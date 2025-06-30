import React, { useState } from 'react';
import { FileText, Users, Calendar, ArrowRight, Home } from 'lucide-react';
import { generateSOPWithAnthropic } from './anthropicService';

const App = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [sopType, setSopType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({});
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [generatedSOP, setGeneratedSOP] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);

  // Template data - UPDATED
  const templates = {
    department: [
      {
        id: 'general-team-doc',
        title: 'General Team Documentation',
        description: 'Document how your team operates and manages programs'
      }
    ],
    event: [
      {
        id: 'event-procedures',
        title: 'Event Procedures',
        description: 'Complete guide for planning and managing all types of events'
      }
    ]
  };

  // NEW Form templates with updated questions
  const formTemplates = {
    'general-team-doc': {
      title: 'General Team Documentation',
      steps: [
        {
          title: 'Section 1: Basic Information',
          questions: [
            { 
              id: 'teamName', 
              type: 'text', 
              label: '1. Team Name', 
              required: true, 
              placeholder: 'Enter your team name' 
            },
            { 
              id: 'mainPurpose', 
              type: 'textarea', 
              label: '2. What is the main purpose of this team?', 
              required: true, 
              placeholder: 'Describe the team\'s main purpose and objectives...' 
            },
            { 
              id: 'teamTerm', 
              type: 'select', 
              label: '3. How long is the team\'s term?', 
              required: true, 
              options: ['2 years', '3 years'] 
            },
            { 
              id: 'programGoals', 
              type: 'textarea', 
              label: '4. What goals must be met when planning and running programs? List all criteria.', 
              required: true, 
              placeholder: 'For example: A program/activity must have clear target audience. A program/activity must create a welcoming atmosphere.' 
            },
            { 
              id: 'teamLeader', 
              type: 'text', 
              label: '5. Team Leader', 
              required: true, 
              placeholder: 'Name and title of team leader' 
            },
            { 
              id: 'teamMembers', 
              type: 'textarea', 
              label: '6. Team Members and their roles with brief descriptions as well as approval chain (as applicable).', 
              required: true, 
              placeholder: 'List team members, their roles, brief descriptions, and approval chain...' 
            },
            { 
              id: 'yearlyPrograms', 
              type: 'textarea', 
              label: '7. List all programs that the team generally runs every year. Add a brief description of what the main goal or concept of the activity/program.', 
              required: true, 
              placeholder: 'For example: This program is aimed to give seniors the opportunity to learn more about how to maintain their health.' 
            }
          ]
        },
        {
          title: 'Section 2: Procedural',
          questions: [
            { 
              id: 'meetingFrequency', 
              type: 'select', 
              label: '1. How often does the team meet?', 
              required: true, 
              options: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As needed'] 
            },
            { 
              id: 'programDetermination', 
              type: 'textarea', 
              label: '2. How does the team determine what program to run every year?', 
              required: true, 
              placeholder: 'Describe the process for determining annual programs...' 
            },
            { 
              id: 'planningTimeline', 
              type: 'textarea', 
              label: '3. When does the team need to come up with a plan for the year ahead?', 
              required: true, 
              placeholder: 'Specify timing and deadlines for annual planning...' 
            },
            { 
              id: 'personInCharge', 
              type: 'textarea', 
              label: '4. How does the team decide on the Person in Charge for an event?', 
              required: true, 
              placeholder: 'Describe the process for selecting event leaders...' 
            },
            { 
              id: 'programApproval', 
              type: 'textarea', 
              label: '5. Who need to approve the planned programs?', 
              required: true, 
              placeholder: 'List who needs to approve programs...' 
            },
            { 
              id: 'specialRequirements', 
              type: 'textarea', 
              label: '6. For any special requirements (e.g., funding from UKI or venue rental), who needs to be involved in those circumstances?', 
              required: true, 
              placeholder: 'Describe who to contact for special requirements like funding, venue rental, etc...' 
            }
          ]
        }
      ]
    },
    'event-procedures': {
      title: 'Event Procedures',
      steps: [
        {
          title: 'Event Overview',
          questions: [
            { 
              id: 'eventType', 
              type: 'select', 
              label: 'What type of events is this SOP for?', 
              required: true, 
              options: ['Social', 'Outreach', 'Religious', 'Fundraising', 'Workshop', 'Internal'] 
            },
            { 
              id: 'whichTeam', 
              type: 'text', 
              label: 'Which team does this event fall under?', 
              required: true, 
              placeholder: 'e.g., Community Outreach Team, Social Committee, etc.' 
            },
            { 
              id: 'frequency', 
              type: 'select', 
              label: 'How often do these events happen?', 
              required: true, 
              options: ['One-time', 'Annual', 'Quarterly', 'Monthly', 'Multiple times per year', 'Weekly', 'Bi-weekly'] 
            },
            { 
              id: 'eventSize', 
              type: 'select', 
              label: 'Typical event size', 
              required: true, 
              options: ['Small (under 25 people)', 'Medium (25-75 people)', 'Large (75-200 people)', 'Very Large (200+ people)'] 
            },
            { 
              id: 'eventPurpose', 
              type: 'textarea', 
              label: 'What is the main purpose and goals of this event/program/activity?', 
              required: true, 
              placeholder: 'Describe the primary objectives and expected outcomes...' 
            }
          ]
        },
        {
          title: 'Team Structure & Volunteers',
          questions: [
            { 
              id: 'eventCoordinator', 
              type: 'text', 
              label: 'Who is the PIC (Person in Charge) or main coordinator for this event?', 
              required: true, 
              placeholder: 'Name and title of the main coordinator' 
            },
            { 
              id: 'volunteerRoles', 
              type: 'textarea', 
              label: 'How many volunteers are usually needed? List the roles that will be required and their descriptions.', 
              required: true, 
              placeholder: 'e.g.:\n• Registration Coordinator (2 people) - Manage check-in process\n• Setup Crew (4 people) - Arrange tables, chairs, decorations\n• Kitchen Helper (3 people) - Assist with food preparation and serving...' 
            },
            { 
              id: 'timeCommitment', 
              type: 'textarea', 
              label: 'What is the expected time commitment for volunteers?', 
              required: true, 
              placeholder: 'e.g., 3 hours on event day, 1 planning meeting (2 hours), 1 hour setup before event...' 
            },
            { 
              id: 'volunteerRecruitment', 
              type: 'textarea', 
              label: 'How and when do you recruit volunteers for this event?', 
              required: true, 
              placeholder: 'Describe the process: when to start recruiting, which channels to use, how to communicate requirements...' 
            },
            { 
              id: 'volunteerProcedure', 
              type: 'textarea', 
              label: 'Detail the procedure of getting volunteers for this program or event.', 
              required: true, 
              placeholder: 'Step-by-step process: announcements, sign-up sheets, follow-up communications, training requirements...' 
            }
          ]
        },
        {
          title: 'Planning & Logistics',
          questions: [
            { 
              id: 'planningTimeline', 
              type: 'textarea', 
              label: 'What is the planning timeline for this event?', 
              required: true, 
              placeholder: 'e.g., 8 weeks before: Book venue\n6 weeks before: Send invitations\n4 weeks before: Confirm catering\n2 weeks before: Final headcount...' 
            },
            { 
              id: 'venueRequirements', 
              type: 'textarea', 
              label: 'Venue requirements and preferred locations', 
              required: true, 
              placeholder: 'e.g., Must accommodate 100 people, accessible parking, A/V equipment, kitchen facilities, wheelchair accessible...' 
            },
            { 
              id: 'budgetRange', 
              type: 'text', 
              label: 'Typical budget range for this event', 
              placeholder: 'e.g., $2,000 - $5,000' 
            },
            { 
              id: 'materialsSupplies', 
              type: 'textarea', 
              label: 'What materials and supplies are typically needed?', 
              required: true, 
              placeholder: 'e.g., Registration table, name tags, welcome packets, signage, decorations, audio equipment...' 
            },
            { 
              id: 'approvalProcess', 
              type: 'textarea', 
              label: 'What approvals are needed and from whom?', 
              required: true, 
              placeholder: 'List who needs to approve the event, budget, venue, etc.' 
            },
            { 
              id: 'specialRequirements', 
              type: 'textarea', 
              label: 'Any special requirements or considerations for this type of event?', 
              placeholder: 'e.g., permits, insurance, catering restrictions, cultural considerations...' 
            }
          ]
        }
      ]
    }
  };

  // UPDATED generateSOP function with Anthropic API
  const generateSOP = async () => {
  try {
    const template = formTemplates[selectedTemplate];
    const sopText = await generateSOPWithAnthropic(formData, template, sopType);
    setGeneratedSOP(sopText);
    setIsGenerating(false);
    setCurrentStep('preview');
  } catch (error) {
    console.error('Error generating SOP:', error);
    setGeneratedSOP('Error generating SOP. Please try again.');
    setIsGenerating(false);
    setCurrentStep('preview');
  }
};

  const downloadPDF = () => {
    // Create a new window with the SOP content for printing/PDF
    const printWindow = window.open('', '_blank');
    const template = formTemplates[selectedTemplate];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${template.title} - SOP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #374151;
            margin-top: 30px;
          }
          h3 {
            color: #4b5563;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .content {
            white-space: pre-wrap;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">${generatedSOP.replace(/\n/g, '<br>')}</div>
        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print/Save as PDF</button>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };


  // Welcome Page
  if (currentStep === 'welcome') {
    return (
      <div>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-4xl w-full text-center">
            <div className="mb-12">
              <div className="bg-blue-600 rounded-2xl p-6 w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-800 mb-6 tracking-tight">
                SOP Builder
              </h1>
              <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Create clear, professional Standard Operating Procedures for your non-profit organization. 
                Our step-by-step guide makes it simple to document your processes.
              </p>
            </div>
            
            <div className="mb-12 p-8 bg-gray-50 rounded-2xl">
              <h2 className="text-3xl font-semibold text-gray-800 mb-8">How it works:</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center text-left">
                  <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-6 flex-shrink-0">1</span>
                  <span className="text-xl text-gray-700">Choose your SOP type</span>
                </div>
                <div className="flex items-center text-left">
                  <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-6 flex-shrink-0">2</span>
                  <span className="text-xl text-gray-700">Select a template</span>
                </div>
                <div className="flex items-center text-left">
                  <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-6 flex-shrink-0">3</span>
                  <span className="text-xl text-gray-700">Fill out the form</span>
                </div>
                <div className="flex items-center text-left">
                  <span className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-6 flex-shrink-0">4</span>
                  <span className="text-xl text-gray-700">Download your SOP</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('type-selection')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-6 px-16 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center mx-auto"
            >
              Create New SOP
              <ArrowRight className="ml-4 h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Type Selection Page
  if (currentStep === 'type-selection') {
    return (
      <div>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Choose Your SOP Type</h1>
                <p className="text-2xl text-gray-600">What type of procedure do you want to create?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <button
                  onClick={() => {
                    setSopType('department');
                    setCurrentStep('template-selection');
                  }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-10 transition-all duration-300 hover:scale-105 border border-gray-100 group"
                >
                  <div className="bg-blue-600 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Department Procedures</h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Create SOPs for how your department operates, manages meetings, handles approvals, and assigns responsibilities.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setSopType('event');
                    setCurrentStep('template-selection');
                  }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-10 transition-all duration-300 hover:scale-105 border border-gray-100 group"
                >
                  <div className="bg-green-600 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Event Procedures</h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Document how to plan events, assemble teams, manage venues, coordinate volunteers, and handle logistics.
                  </p>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('welcome')}
                  className="text-gray-500 hover:text-gray-700 text-xl font-medium flex items-center mx-auto transition-colors"
                >
                  <Home className="mr-3 h-6 w-6" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template Selection Page
  if (currentStep === 'template-selection') {
    const currentTemplates = templates[sopType] || [];
    const colorClass = sopType === 'department' ? 'bg-blue-600' : 'bg-green-600';
    
    return (
      <div>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                  Choose Your {sopType === 'department' ? 'Department' : 'Event'} Template
                </h1>
                <p className="text-2xl text-gray-600">Select the template that best matches your needs</p>
              </div>

              <div className="space-y-6 mb-12">
                {currentTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setFormData({});
                      setCurrentFormStep(0);
                      setCurrentStep('form-completion');
                    }}
                    className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:scale-102 border border-gray-100 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">{template.title}</h3>
                        <p className="text-xl text-gray-600 leading-relaxed">{template.description}</p>
                      </div>
                      <div className={`${colorClass} rounded-2xl p-4 ml-6 group-hover:scale-110 transition-transform`}>
                        <ArrowRight className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('type-selection')}
                  className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors"
                >
                  ← Back to SOP Type Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Page
  if (currentStep === 'generating') {
    const template = formTemplates[selectedTemplate];
    
    return (
      <div>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-3xl w-full text-center">
            <div className="mb-12">
              <div className="mx-auto mb-8 w-32 h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-24 w-24 border-8 border-gray-200 border-t-blue-600 border-r-blue-500 border-b-blue-400"></div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-6">
                Creating Your SOP
              </h1>
              <p className="text-2xl text-gray-600 leading-relaxed mb-8">
                Our AI is analyzing your responses and generating a professional Standard Operating Procedure document...
              </p>
              
              <div className="space-y-4 text-lg text-gray-600">
                <div className="flex items-center justify-center">
                  <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span>Form responses collected</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-4 animate-pulse">
                    <div className="bg-white rounded-full w-2 h-2"></div>
                  </div>
                  <span>AI processing your {template?.title}...</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center mr-4">
                    <span className="text-gray-500 text-sm">○</span>
                  </div>
                  <span className="text-gray-400">Formatting professional document</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-2xl p-6">
              <p className="text-lg text-gray-700">
                <strong>Estimated time:</strong> 30-60 seconds
              </p>
              <p className="text-base text-gray-600 mt-2">
                Please wait while we create your customized SOP document
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Completion Page
  if (currentStep === 'form-completion') {
    const template = formTemplates[selectedTemplate];
    if (!template) return <div>Template not found</div>;

    const currentStepData = template.steps[currentFormStep];
    const progress = ((currentFormStep + 1) / template.steps.length) * 100;

    const canProceed = () => {
      return currentStepData.questions
        .filter(q => q.required)
        .every(q => formData[q.id] && formData[q.id].trim() !== '');
    };

    const nextStep = async () => {
      if (currentFormStep < template.steps.length - 1) {
        setCurrentFormStep(prev => prev + 1);
      } else {
        setIsGenerating(true);
        setCurrentStep('generating');
        await generateSOP();
      }
    };

    const prevStep = () => {
      if (currentFormStep > 0) {
        setCurrentFormStep(prev => prev - 1);
      }
    };

    return (
      <div>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{template.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{currentStepData.title}</p>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-lg text-gray-500">Step {currentFormStep + 1} of {template.steps.length}</p>
              </div>

              <div className="space-y-8 mb-12">
                {currentStepData.questions.map((question) => (
                  <div key={question.id} className="bg-gray-50 rounded-2xl p-6">
                    <label className="block text-xl font-semibold text-gray-800 mb-4">
                      {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {question.type === 'text' && (
                      <input
                        type="text"
                        value={formData[question.id] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                        placeholder={question.placeholder}
                        className="w-full text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    )}
                    
                    {question.type === 'textarea' && (
                      <textarea
                        value={formData[question.id] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                        placeholder={question.placeholder}
                        rows={4}
                        className="w-full text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      />
                    )}
                    
                    {question.type === 'select' && (
                      <select
                        value={formData[question.id] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="w-full text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="">Choose an option...</option>
                        {question.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={currentFormStep === 0 ? () => setCurrentStep('template-selection') : prevStep}
                  className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors flex items-center"
                >
                  ← {currentFormStep === 0 ? 'Back to Templates' : 'Previous Step'}
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 ${
                    canProceed() 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentFormStep === template.steps.length - 1 ? 'Generate SOP' : 'Next Step'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview Page
  if (currentStep === 'preview') {
    const template = formTemplates[selectedTemplate];
    
    return (
      <div>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Your SOP is Ready!</h1>
                <p className="text-xl text-gray-600">Review your answers and the generated SOP document</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Panel - User Answers */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Answers</h2>
                    <button
                      onClick={() => setIsEditingAnswers(!isEditingAnswers)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      {isEditingAnswers ? 'Save Changes' : 'Edit Answers'}
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {template && template.steps.flatMap(step => step.questions).map((question) => (
                      <div key={question.id} className="bg-white rounded-xl p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          {question.label}
                        </h3>
                        
                        {isEditingAnswers ? (
                          <>
                            {question.type === 'text' && (
                              <input
                                type="text"
                                value={formData[question.id] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder={question.placeholder}
                              />
                            )}
                            
                            {question.type === 'textarea' && (
                              <textarea
                                value={formData[question.id] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                                rows={3}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                                placeholder={question.placeholder}
                              />
                            )}
                            
                            {question.type === 'select' && (
                              <select
                                value={formData[question.id] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">Choose an option...</option>
                                {question.options?.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-600">{formData[question.id] || 'Not answered'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Generated SOP */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Generated SOP</h2>
                    <button
                      onClick={async () => {
                        setIsGenerating(true);
                        setIsEditingAnswers(false);
                        await generateSOP();
                      }}
                      disabled={isGenerating}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Regenerating...' : 'Regenerate SOP'}
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 max-h-96 overflow-y-auto">
                    {isGenerating ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating your SOP...</p>
                      </div>
                    ) : (
                      <textarea
                        value={generatedSOP}
                        onChange={(e) => setGeneratedSOP(e.target.value)}
                        className="w-full h-80 text-sm p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                        placeholder="Your SOP will appear here..."
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep('form-completion')}
                  className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors"
                >
                  ← Back to Form
                </button>
                
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setCurrentStep('welcome');
                      setFormData({});
                      setSelectedTemplate('');
                      setSopType('');
                      setCurrentFormStep(0);
                      setGeneratedSOP('');
                      setIsEditingAnswers(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300"
                  >
                    Start New SOP
                  </button>
                  
                  <button
                    onClick={downloadPDF}
                    disabled={!generatedSOP || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;