exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Request body:', event.body);
    
    // Parse the request body
    const { formData, template, sopType } = JSON.parse(event.body);
    console.log('Parsed data:', { formData, template, sopType });

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      throw new Error('API key not configured');
    }
    
    console.log('API key found, length:', process.env.ANTHROPIC_API_KEY.length);
    console.log('API key starts with:', process.env.ANTHROPIC_API_KEY.substring(0, 10));

    // Create the prompt
    const prompt = `You are an expert in creating Standard Operating Procedures (SOPs) for non-profit organizations. 

Please transform the following user responses into a professional, well-structured SOP document.

Template Type: ${template.title}
SOP Category: ${sopType.charAt(0).toUpperCase() + sopType.slice(1)}

User Responses:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Create a comprehensive SOP document with:
1. Clear title and purpose statement
2. Well-organized sections with proper headings
3. Professional language appropriate for non-profit staff
4. Specific procedures and step-by-step instructions where applicable
5. Proper formatting with bullet points and numbered lists where helpful
6. Contact information and roles clearly defined
7. Any necessary timelines or deadlines

Format the output as a clean, professional document that can be easily read and followed by non-profit staff and volunteers. Use clear headings, proper paragraph structure, and organized sections.

Respond with ONLY the formatted SOP document, no additional commentary.`;

    console.log('Making API call to Anthropic...');

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      console.error('Request headers sent:', {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...',
        'anthropic-version': '2023-06-01'
      });
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response received, content length:', data.content[0].text.length);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        sopText: data.content[0].text 
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate SOP',
        details: error.message 
      })
    };
  }
};