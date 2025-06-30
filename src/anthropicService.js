// Anthropic API service
export const generateSOPWithAnthropic = async (formData, template, sopType, apiKey) => {
  try {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
};