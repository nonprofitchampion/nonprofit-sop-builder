exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { formData, template, sopType } = JSON.parse(event.body);

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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
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
    console.error('Error:', error);
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