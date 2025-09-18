const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function getGeminiResponse(context, userQuery) {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    const prompt = `Context: ${context}\nUser: ${userQuery}`;
    try {
        const res = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );
        return res.data.candidates[0].content.parts[0].text;
    } catch (error) {
        if (error.response) {
            console.error('Gemini API error:', error.response.status, error.response.statusText);
            console.error('Gemini API response data:', JSON.stringify(error.response.data, null, 2));
            throw new Error(`Gemini API error: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error('Gemini API error:', error.message);
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
}

module.exports = {
    getGeminiResponse
};
