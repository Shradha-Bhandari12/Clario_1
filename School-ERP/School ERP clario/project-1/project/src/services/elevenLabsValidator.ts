/**
 * ElevenLabs API Key Validator
 * Run this in browser console to test your API key
 */

export async function validateElevenLabsKey(apiKey: string) {
  console.log('Validating ElevenLabs API Key...');
  console.log('API Key length:', apiKey.length);
  console.log('API Key format check:', apiKey.startsWith('sk_') ? 'Valid format ✓' : 'Invalid format ✗');

  try {
    // Test the API key by fetching voices
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    console.log('Response Status:', response.status);

    if (response.status === 200) {
      const data = await response.json();
      console.log('✓ API Key is VALID!');
      console.log('Available voices:', data.voices?.length || 0);
      return { valid: true, data };
    } else if (response.status === 401) {
      console.error('✗ API Key is INVALID - 401 Unauthorized');
      console.error('Possible causes:');
      console.error('1. API key is expired');
      console.error('2. API key is revoked');
      console.error('3. API key is from a different tier/subscription');
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', errorData);
      return { valid: false, status: 401, error: errorData };
    } else if (response.status === 403) {
      console.error('✗ API Key is FORBIDDEN - 403');
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', errorData);
      return { valid: false, status: 403, error: errorData };
    } else {
      const errorData = await response.text();
      console.error('✗ Unexpected status:', response.status);
      console.error('Error details:', errorData);
      return { valid: false, status: response.status, error: errorData };
    }
  } catch (error) {
    console.error('✗ Network error:', error);
    return { valid: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Export for use in browser console
(window as any).validateElevenLabsKey = validateElevenLabsKey;
