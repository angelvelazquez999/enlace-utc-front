// pages/api/tts.js
export default async function handler(req, res) {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "Missing text in body" });
      return;
    }

    // Intentar usar ElevenLabs si está configurado
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - voz femenina amigable y natural
    // Otras opciones:
    // "EXAVITQu4vr4xnSDxMaL" - Sarah - voz suave y profesional
    // "MF3mGyEYCl7XYWbV9V6O" - Elli - voz joven y energética
    // "ThT5KcBeYPX3keUQqHPh" - Dorothy - voz cálida y maternal
    
    if (ELEVENLABS_API_KEY) {
      // Si tenemos ElevenLabs, usar esa API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5", // Modelo más nuevo y gratuito
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("ElevenLabs API error:", response.status, errText);
        // Si falla ElevenLabs, usar fallback del navegador
        console.log("Falling back to browser speech synthesis");
        return res.status(200).json({ 
          useClientSide: true, 
          text: text,
          message: "ElevenLabs failed, using browser's speechSynthesis API"
        });
      }

      const audioBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
      return;
    }

    // Fallback: indicar al cliente que use Web Speech API del navegador
    console.log("No external TTS API configured, returning text for client-side synthesis");
    res.status(200).json({ 
      useClientSide: true, 
      text: text,
      message: "Use browser's speechSynthesis API"
    });

  } catch (e) {
    console.error("TTS handler error:", e);
    res.status(500).json({ error: "Internal server error", details: e.message });
  }
}
