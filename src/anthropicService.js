// Updated Anthropic API service - now calls Netlify function
export const generateSOPWithAnthropic = async (formData, template, sopType) => {
  try {
    const response = await fetch('/.netlify/functions/generate-sop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData,
        template,
        sopType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sopText;
  } catch (error) {
    console.error('Error calling Netlify function:', error);
    throw error;
  }
};