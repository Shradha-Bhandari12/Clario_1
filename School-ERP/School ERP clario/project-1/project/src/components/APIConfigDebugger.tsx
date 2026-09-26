import { useEffect, useState } from 'react';

export function APIConfigDebugger() {
  const [groqStatus, setGroqStatus] = useState<'configured' | 'missing'>('missing');
  const [elevenLabsStatus, setElevenLabsStatus] = useState<'configured' | 'missing' | 'error'>('missing');

  useEffect(() => {
    // Check Groq
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey) {
      setGroqStatus('configured');
      console.log('✓ Groq API Key configured');
    } else {
      console.warn('✗ Groq API Key missing');
    }

    // Check ElevenLabs
    const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (elevenLabsKey) {
      setElevenLabsStatus('configured');
      console.log('✓ ElevenLabs API Key configured (length: ' + elevenLabsKey.length + ')');

      // Test ElevenLabs API
      testElevenLabsAPI(elevenLabsKey);
    } else {
      console.warn('✗ ElevenLabs API Key missing');
    }
  }, []);

  const testElevenLabsAPI = async (apiKey: string) => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      });

      if (response.status === 200) {
        setElevenLabsStatus('configured');
        console.log('✓ ElevenLabs API Key is VALID');
      } else if (response.status === 401) {
        setElevenLabsStatus('error');
        console.error('✗ ElevenLabs API Key is INVALID (401 Unauthorized)');
      } else {
        setElevenLabsStatus('error');
        console.error('✗ ElevenLabs API Error:', response.status);
      }
    } catch (error) {
      setElevenLabsStatus('error');
      console.error('✗ ElevenLabs API Connection Error:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm font-mono">
      <h3 className="font-bold mb-2">API Configuration Status</h3>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={groqStatus === 'configured' ? '✓' : '✗'}>
            Groq API:
          </span>
          <span
            className={
              groqStatus === 'configured'
                ? 'text-green-600'
                : 'text-red-600'
            }
          >
            {groqStatus === 'configured' ? 'Configured' : 'Missing'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={elevenLabsStatus === 'configured' ? '✓' : '✗'}>
            ElevenLabs API:
          </span>
          <span
            className={
              elevenLabsStatus === 'configured'
                ? 'text-green-600'
                : elevenLabsStatus === 'error'
                ? 'text-red-600'
                : 'text-yellow-600'
            }
          >
            {elevenLabsStatus === 'configured'
              ? 'Valid & Working'
              : elevenLabsStatus === 'error'
              ? 'Invalid Key / Error'
              : 'Missing'}
          </span>
        </div>
      </div>
    </div>
  );
}
