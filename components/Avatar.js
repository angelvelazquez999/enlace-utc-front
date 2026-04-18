import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Avatar({ url, audioAnalyser, isSpeaking }) {
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, scene);
  const groupRef = useRef();
  const headBoneRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftShoulderRef = useRef();
  const rightShoulderRef = useRef();
  const blinkTimeRef = useRef(0);
  const headMovementRef = useRef({ time: 0, offsetX: 0, offsetY: 0 });
  const expressionTimerRef = useRef(0);
  const [currentExpression, setCurrentExpression] = useState('neutral');

  // Expresiones faciales predefinidas - Actualizadas con morphTargets reales del modelo
  const expressions = {
    neutral: { Fcl_ALL_Neutral: 0.7, Fcl_ALL_Joy: 0, Fcl_ALL_Fun: 0 },
    happy: { Fcl_ALL_Joy: 1, Fcl_ALL_Neutral: 0.1, Fcl_ALL_Fun: 0.3 },
    excited: { Fcl_ALL_Joy: 0.9, Fcl_ALL_Fun: 0.8, Fcl_ALL_Neutral: 0 },
    thinking: { Fcl_ALL_Neutral: 0.9, Fcl_ALL_Joy: 0.2, Fcl_ALL_Fun: 0.1 },
    friendly: { Fcl_ALL_Joy: 0.8, Fcl_ALL_Fun: 0.4, Fcl_ALL_Neutral: 0.2 },
    surprised: { Fcl_ALL_Fun: 0.9, Fcl_ALL_Joy: 0.5, Fcl_ALL_Neutral: 0 },
  };

  useEffect(() => {
    console.log("Available animations:", animations.map(a => a.name));
    console.log("Available actions:", Object.keys(actions));
    
    // Buscar huesos clave para animación
    const allBones = [];
    scene.traverse((child) => {
      if (child.isBone) {
        allBones.push(child.name);
        
        // Brazos - usando nombres exactos del modelo
        if (child.name === 'J_Bip_L_UpperArm') {
          leftArmRef.current = child;
          console.log("✓ Found left upper arm:", child.name);
        } else if (child.name === 'J_Bip_R_UpperArm') {
          rightArmRef.current = child;
          console.log("✓ Found right upper arm:", child.name);
        } else if (child.name === 'J_Bip_L_Shoulder') {
          leftShoulderRef.current = child;
          console.log("✓ Found left shoulder:", child.name);
        } else if (child.name === 'J_Bip_R_Shoulder') {
          rightShoulderRef.current = child;
          console.log("✓ Found right shoulder:", child.name);
        }
        
        // Cabeza
        if (child.name === 'J_Bip_C_Head') {
          headBoneRef.current = child;
          console.log("✓ Found head bone:", child.name);
        }
      }
      
      if (child.isMesh && child.morphTargetInfluences) {
        console.log("Found mesh with morphTargets:", child.name, child.morphTargetDictionary);
      }
    });
    
    console.log("=== ALL AVAILABLE BONES ===");
    console.log(allBones.join(", "));
    console.log("===========================");
  }, [scene, animations, actions]);

  // Función para cambiar expresiones
  const applyExpression = (expressionName, intensity = 1) => {
    const expression = expressions[expressionName];
    if (!expression) return;

    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        const dict = child.morphTargetDictionary;
        
        Object.keys(expression).forEach(morphName => {
          if (dict && dict[morphName] !== undefined) {
            const targetValue = expression[morphName] * intensity;
            // Interpolación suave
            const currentValue = child.morphTargetInfluences[dict[morphName]];
            child.morphTargetInfluences[dict[morphName]] = 
              currentValue + (targetValue - currentValue) * 0.1;
          }
        });
      }
    });
  };

  // Animación continua (parpadeo, respiración, movimientos sutiles, expresiones, brazos)
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Movimiento sutil de la cabeza (siempre activo)
    if (groupRef.current) {
      // Respiración suave
      const breathe = Math.sin(time * 0.5) * 0.01;
      groupRef.current.position.y = -4.8 + breathe;
      
      // Movimiento sutil de cabeza cuando NO está hablando
      if (!isSpeaking) {
        const idleMovementX = Math.sin(time * 0.3) * 0.03;
        const idleMovementY = Math.cos(time * 0.2) * 0.02;
        groupRef.current.rotation.y = idleMovementX;
        groupRef.current.rotation.x = idleMovementY;
        groupRef.current.rotation.z = Math.sin(time * 0.25) * 0.01; // Leve inclinación
      } else {
        // Movimiento más animado cuando habla
        const ref = headMovementRef.current;
        ref.time += delta;
        
        if (ref.time > 0.3) { // Cambiar dirección más frecuentemente
          ref.time = 0;
          ref.offsetX = (Math.random() - 0.5) * 0.12;
          ref.offsetY = (Math.random() - 0.5) * 0.08;
        }
        
        // Interpolación suave hacia el nuevo objetivo
        groupRef.current.rotation.y += (ref.offsetX - groupRef.current.rotation.y) * 0.08;
        groupRef.current.rotation.x += (ref.offsetY - groupRef.current.rotation.x) * 0.08;
        groupRef.current.rotation.z += (Math.sin(time * 2) * 0.02 - groupRef.current.rotation.z) * 0.05;
      }
    }

    // Animación de brazos cuando habla - GESTOS MUY SUTILES Y RELAJADOS, BRAZOS BAJOS
    if (isSpeaking) {
      // Brazo izquierdo - apenas se mueve
      if (leftShoulderRef.current) {
        const leftGesture = Math.sin(time * 1) * 0.08; // Muy muy sutil
        leftShoulderRef.current.rotation.z = -0.55 + leftGesture;
        leftShoulderRef.current.rotation.x = Math.cos(time * 0.8) * 0.05;
      }
      
      if (leftArmRef.current) {
        const leftArmGesture = Math.sin(time * 1.2 + 0.5) * 0.06;
        leftArmRef.current.rotation.z = -0.42 + leftArmGesture;
        leftArmRef.current.rotation.x = Math.sin(time * 0.9) * 0.08;
      }
      
      // Brazo derecho - espejo del izquierdo con desfase
      if (rightShoulderRef.current) {
        const rightGesture = Math.sin(time * 1 + Math.PI) * 0.08; // Muy muy sutil
        rightShoulderRef.current.rotation.z = 0.55 + rightGesture;
        rightShoulderRef.current.rotation.x = Math.cos(time * 0.8 + 1) * 0.05;
      }
      
      if (rightArmRef.current) {
        const rightArmGesture = Math.sin(time * 1.2 + 0.5 + Math.PI) * 0.06;
        rightArmRef.current.rotation.z = 0.42 + rightArmGesture;
        rightArmRef.current.rotation.x = Math.sin(time * 0.9 + 1) * 0.08;
      }
    } else {
      // Posición neutral de descanso cuando NO habla - BRAZOS CAÍDOS NATURALES
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.z = -0.6 + Math.cos(time * 0.3) * 0.05; // Posición natural
        leftShoulderRef.current.rotation.x = 0;
        leftShoulderRef.current.rotation.y = 0;
      }
      
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = -0.45; // Posición natural
        leftArmRef.current.rotation.x = 0.1;
        leftArmRef.current.rotation.y = 0;
      }
      
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.z = 0.6 + Math.cos(time * 0.3 + 0.5) * 0.05; // Posición natural
        rightShoulderRef.current.rotation.x = 0;
        rightShoulderRef.current.rotation.y = 0;
      }
      
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = 0.45; // Posición natural
        rightArmRef.current.rotation.x = 0.1;
        rightArmRef.current.rotation.y = 0;
      }
    }

    // Cambiar expresiones aleatoriamente cuando habla
    if (isSpeaking) {
      expressionTimerRef.current += delta;
      
      if (expressionTimerRef.current > 3.5) { // Cada 3.5 segundos
        const expressionsList = ['friendly', 'happy', 'excited'];
        const randomExpression = expressionsList[Math.floor(Math.random() * expressionsList.length)];
        setCurrentExpression(randomExpression);
        expressionTimerRef.current = 0;
      }
      
      applyExpression(currentExpression, 1); // Intensidad máxima
    } else {
      applyExpression('neutral', 0.5); // Menos intenso en reposo
    }

    // Parpadeo natural - SOLO EN REPOSO (NO MIENTRAS HABLA)
    blinkTimeRef.current += delta;
    
    // Solo permitir parpadeo cuando NO está hablando
    let shouldBlink = false;
    if (!isSpeaking) {
      const blinkCycle = Math.sin(blinkTimeRef.current * 0.25); // Parpadeo muy muy lento
      shouldBlink = blinkCycle > 0.99 || (Math.random() > 0.9999); // Cada 5-6 segundos o menos
    }
    
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences) {
        const dict = child.morphTargetDictionary;
        
        // Parpadeo suave (solo en reposo)
        const blinkTargets = ['eyesClosed', 'eyeBlinkLeft', 'eyeBlinkRight'];
        blinkTargets.forEach(targetName => {
          if (dict && dict[targetName] !== undefined) {
            const targetBlink = shouldBlink ? 0.8 : 0; // Más suave
            child.morphTargetInfluences[dict[targetName]] += 
              (targetBlink - child.morphTargetInfluences[dict[targetName]]) * 0.2; // Interpolación más lenta
          }
        });
      }
    });
  });

  // Animación basada en audioAnalyser (cuando hay audio real)
  useEffect(() => {
    if (!audioAnalyser) return;
    let raf;
    let smoothedEnergy = 0;
    let prevEnergy = 0;

    const tick = () => {
      const data = new Uint8Array(audioAnalyser.frequencyBinCount);
      audioAnalyser.getByteFrequencyData(data);
      
      // Calcular energía del audio
      const energy = data.reduce((s, v) => s + v, 0) / data.length / 255;
      
      // Suavizar con dos niveles para más naturalidad
      smoothedEnergy = smoothedEnergy * 0.5 + energy * 0.5;
      const deltaEnergy = Math.abs(smoothedEnergy - prevEnergy);
      prevEnergy = smoothedEnergy;
      
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          
          // Boca abierta con variación basada en cambio de energía
          if (dict && dict['mouthOpen'] !== undefined) {
            const mouthOpen = Math.min(0.9, smoothedEnergy * 4 + deltaEnergy * 3);
            child.morphTargetInfluences[dict['mouthOpen']] += 
              (mouthOpen - child.morphTargetInfluences[dict['mouthOpen']]) * 0.5;
          }
          
          // Diferentes formas de boca según la energía
          if (dict && dict['mouthFunnel'] !== undefined) {
            const funnel = smoothedEnergy > 0.3 ? smoothedEnergy * 0.3 : 0;
            child.morphTargetInfluences[dict['mouthFunnel']] += 
              (funnel - child.morphTargetInfluences[dict['mouthFunnel']]) * 0.2;
          }
          
          if (dict && dict['mouthPucker'] !== undefined && smoothedEnergy > 0.5) {
            const pucker = (smoothedEnergy - 0.5) * 0.4;
            child.morphTargetInfluences[dict['mouthPucker']] += 
              (pucker - child.morphTargetInfluences[dict['mouthPucker']]) * 0.2;
          }
        }
      });
      
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [audioAnalyser, scene]);

  // Animación procedural cuando se usa Web Speech API
  useEffect(() => {
    if (!isSpeaking) return;
    
    let raf;
    let time = 0;
    let phase = 0;
    let syllableTime = 0;

    const tick = () => {
      time += 0.016; // ~60fps
      syllableTime += 0.016;
      
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          
          // Animación de boca con los morphTargets reales del modelo
          // Usar Fcl_ALL_* que son los disponibles
          
          // Fun = boca abierta con sonrisa
          if (dict && dict['Fcl_ALL_Fun'] !== undefined) {
            const funMouth = Math.sin(time * 4) * 0.4 + 0.4; // Boca abierta oscilante
            child.morphTargetInfluences[dict['Fcl_ALL_Fun']] = Math.max(0, Math.min(1, funMouth));
          }
          
          // Joy = sonrisa grande
          if (dict && dict['Fcl_ALL_Joy'] !== undefined) {
            const joySmile = Math.sin(time * 3 + 1) * 0.35 + 0.45; // Sonrisa
            child.morphTargetInfluences[dict['Fcl_ALL_Joy']] = Math.max(0, Math.min(1, joySmile));
          }
          
          // Neutral de fondo
          if (dict && dict['Fcl_ALL_Neutral'] !== undefined) {
            const neutral = Math.max(0, 0.4 - Math.sin(time * 4) * 0.2);
            child.morphTargetInfluences[dict['Fcl_ALL_Neutral']] = neutral;
          }
        }
      });
      
      raf = requestAnimationFrame(tick);
    };

    console.log("Starting expressive procedural animation");
    tick();
    
    return () => {
      cancelAnimationFrame(raf);
      // Volver a neutral cuando termine
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          const targets = ['mouthOpen', 'mouthFunnel', 'mouthPucker'];
          targets.forEach(target => {
            if (dict && dict[target] !== undefined) {
              child.morphTargetInfluences[dict[target]] = 0;
            }
          });
        }
      });
    };
  }, [isSpeaking, scene]);

  return (
    <group ref={groupRef} position={[0, 8.5, -2]}>
      <primitive 
        object={scene} 
        scale={3}
      />
    </group>
  );
}
