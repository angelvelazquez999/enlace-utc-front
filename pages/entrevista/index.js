"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";

const Avatar = dynamic(() => import("../components/Avatar"), { ssr: false });

export default function Home() {
    const audioRef = useRef(null);
    const [audioAnalyzer, setAudioAnalyzer] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        async function initMic() {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ctx = new AudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            setAudioAnalyzer(analyser);
        }
        initMic();

        // Cargar voces del navegador
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    const speak = async () => {
        const hardcodedText = "Hola, soy tu entrevistador virtual...";
        const resp = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: hardcodedText })
        });

        if (!resp.ok) {
            const err = await resp.json();
            console.error("TTS fetch failed:", err);
            alert("Error al generar audio: " + err.error);
            return;
        }

        // Verificar si la respuesta es JSON (fallback del navegador) o audio
        const contentType = resp.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            // Usar Web Speech API del navegador
            const data = await resp.json();
            if (data.useClientSide) {
                console.log("Using browser's Web Speech API");
                const utterance = new SpeechSynthesisUtterance(data.text);
                utterance.lang = 'es-ES';
                utterance.rate = 0.95;
                utterance.pitch = 1.1; // Pitch más alto para voz femenina
                utterance.volume = 1.0;
                
                // Intentar encontrar una voz femenina en español
                const voices = window.speechSynthesis.getVoices();
                console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
                
                // Buscar voces femeninas en español (preferir España o México)
                const spanishFemaleVoice = voices.find(voice => 
                    voice.lang.startsWith('es') && 
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('mujer') ||
                     voice.name.toLowerCase().includes('woman') ||
                     voice.name.toLowerCase().includes('paulina') ||
                     voice.name.toLowerCase().includes('monica') ||
                     voice.name.toLowerCase().includes('helena'))
                );
                
                // Si no encuentra específicamente femenina, buscar cualquier voz en español
                const spanishVoice = spanishFemaleVoice || voices.find(voice => voice.lang.startsWith('es'));
                
                if (spanishVoice) {
                    utterance.voice = spanishVoice;
                    console.log("Using voice:", spanishVoice.name);
                } else {
                    console.log("No Spanish voice found, using default");
                }
                
                // Eventos para controlar el estado de habla
                utterance.onstart = () => {
                    console.log("Speech started - setting isSpeaking to true");
                    setIsSpeaking(true);
                };
                
                utterance.onend = () => {
                    console.log("Speech ended - setting isSpeaking to false");
                    setIsSpeaking(false);
                };
                
                utterance.onerror = (e) => {
                    console.error("Speech error:", e);
                    setIsSpeaking(false);
                };
                
                console.log("About to speak with Web Speech API");
                window.speechSynthesis.speak(utterance);
                return;
            }
        }

        // Si es audio binario, procesar como antes
        const arrayBuffer = await resp.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
            console.error("Audio buffer is empty");
            alert("Audio vacío");
            return;
        }

        const blob = new Blob([arrayBuffer], { type: contentType || "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        setAudioAnalyzer(analyser);

        try {
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
        } catch (playError) {
            console.error("audio.play() failed:", playError);
            alert("Error al reproducir audio: " + playError.message);
            setIsSpeaking(false);
        }
    };


    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
            <button 
                onClick={speak} 
                style={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: 20, 
                    zIndex: 10,
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Hablar
            </button>
            <Canvas camera={{ position: [0, 0, 2], fov: 50 }} style={{ width: '100%', height: '100%' }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Avatar 
                    url="https://models.readyplayer.me/690c35d7d9d72e80a579e569.glb" 
                    audioAnalyser={audioAnalyzer} 
                    isSpeaking={isSpeaking}
                />
            </Canvas>
        </div>
    );
}
