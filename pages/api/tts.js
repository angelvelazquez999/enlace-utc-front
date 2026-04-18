// pages/api/tts.js
export default async function handler(req, res) {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "Missing text in body" });
      return;
    }

    // Intentar usar Murf API (voz femenina en español)
    const MURF_API_KEY = process.env.MURF_API_KEY;
    
    if (MURF_API_KEY) {
      try {
        console.log("🎤 Intentando usar Murf API con la voz Valeria");
        
        const MURF_VOICE_ID = "Valeria"; // Voz femenina disponible en Murf
        
        const murf_response = await fetch("https://api.murf.ai/v1/speech/generate", {
          method: "POST",
          headers: {
            "Accept": "*/*",
            "Content-Type": "application/json",
            "api-key": MURF_API_KEY
          },
          body: JSON.stringify({
            text: text,
            voiceId: MURF_VOICE_ID,
            rate: 1.0,
            pitch: 1.0
          })
        });

        if (murf_response.ok) {
          const responseData = await murf_response.json();
          console.log("📦 Murf response:", JSON.stringify(responseData).substring(0, 100));
          
          // Murf retorna JSON con URL, no audio directo
          if (responseData.audioFile) {
            console.log("🔗 Fetching audio from URL:", responseData.audioFile);
            const audioResponse = await fetch(responseData.audioFile);
            
            if (audioResponse.ok) {
              const audioBuffer = await audioResponse.arrayBuffer();
              console.log("✅ Audio descargado. Buffer size:", audioBuffer.byteLength, "bytes");
              
              // Validar formato MP3/audio
              const view = new Uint8Array(audioBuffer);
              const firstByte = view[0];
              const secondByte = view[1];
              console.log("📊 Primeros 2 bytes:", `0x${firstByte.toString(16).padStart(2, '0')} 0x${secondByte.toString(16).padStart(2, '0')}`);
              
              res.setHeader("Content-Type", "audio/mpeg");
              res.send(Buffer.from(audioBuffer));
              return;
            } else {
              console.error("❌ Error descargando audio:", audioResponse.status);
            }
          } else {
            console.error("❌ Murf response sin audioFile:", responseData);
          }
        } else {
          const errText = await murf_response.text();
          console.error("❌ Error Murf [Status", murf_response.status, "]:", errText.substring(0, 200));
        }
      } catch (murf_err) {
        console.error("❌ Murf API error:", murf_err.message);
      }
    } else {
      console.log("⚠️ MURF_API_KEY no está configurada en .env");
    }

    // Fallback: usar Web Speech API del navegador
    console.log("📱 Usando Web Speech API del navegador");
    res.status(200).json({ 
      useClientSide: true, 
      text: text,
      message: "Using browser's speechSynthesis API"
    });

  } catch (e) {
    console.error("❌ TTS handler error:", e);
    res.status(500).json({ error: "Internal server error", details: e.message });
  }
}
