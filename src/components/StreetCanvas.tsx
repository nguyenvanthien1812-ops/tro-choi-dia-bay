import React, { useEffect, useRef } from 'react';
import { Student, GamePhase } from '../types';
import { FUNNY_QUOTES, PANIC_QUOTES } from '../utils/sampleData';

interface Props {
  students: Student[];
  phase: GamePhase;
  targetCount: number;
  abductedCount: number;
  onStudentTargeted?: (name: string) => void;
  onStatusChange?: (statusText: string) => void;
  onAbductionComplete?: (student: Student) => void;
  onAllAbductionsComplete?: () => void;
}

interface AnchorPoint {
  id: string;
  type: 'lamp_post' | 'bus_stop' | 'scooter' | 'bollard' | 'phone_booth';
  poleX: number;
  poleTopY: number;
  poleBottomY: number;
}

interface RenderStudent {
  student: Student;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  gender: 'male' | 'female';
  skinColor: string;
  hairStyle: 'short' | 'fringe' | 'bob' | 'ponytail' | 'pigtails';
  hairColor: string;
  bagColor: string;
  bottomColor: string;
  hasGlasses: boolean;
  speed: number;
  facing: 1 | -1;
  wanderMinX: number;
  wanderMaxX: number;
  walkCycle: number;
  idlePose: 'walking' | 'chatting' | 'standing';
  
  // Clinging & Anti-gravity physics
  anchor: AnchorPoint;
  clingSide: 'left' | 'right';
  clingAngle: number;
  currentAngle: number;
  clingHeightRatio: number; // 0.2 -> 0.8 up the pole
  isTargeted: boolean;
  isBeingAbducted: boolean;
  abductionProgress: number; // 0 -> 1

  // Speech bubble
  speechText: string | null;
}

interface BeamParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

export const StreetCanvas: React.FC<Props> = ({
  students,
  phase,
  targetCount,
  abductedCount,
  onStudentTargeted,
  onStatusChange,
  onAbductionComplete,
  onAllAbductionsComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simulation Refs
  const renderStudentsRef = useRef<RenderStudent[]>([]);
  const ufoXRef = useRef<number>(600);
  const ufoYRef = useRef<number>(-160);
  const ufoTargetXRef = useRef<number>(600);
  const ufoTiltRef = useRef<number>(0);
  const saucerLightsAngleRef = useRef<number>(0);
  const nightFactorRef = useRef<number>(0);
  const suctionPowerRef = useRef<number>(0); // 0 (idle) -> 1 (full tractor beam suction)
  const targetSuctionRef = useRef<number>(0);
  const particlesRef = useRef<BeamParticle[]>([]);
  const activeSpeechIndexRef = useRef<number>(-1);
  const speechCooldownRef = useRef<number>(120);

  // Precise Sequencer: Loop 1 -> Abduct 1 -> Loop 2 -> Abduct 2 -> Complete!
  type AbductionSubStage = 'IDLE' | 'ENTRY_LOOP' | 'TRACK_TARGET' | 'SUCK_TARGET' | 'INTER_LOOP' | 'FINISHED';
  const abductionStageRef = useRef<AbductionSubStage>('IDLE');
  const stageTimerRef = useRef<number>(0);
  const initialTargetCountRef = useRef<number>(targetCount);

  const phaseRef = useRef<GamePhase>(phase);
  const targetCountRef = useRef<number>(targetCount);
  const abductedCountRef = useRef<number>(abductedCount);
  const abductionQueueRef = useRef<Student[]>([]);
  const currentTargetIdRef = useRef<string | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { targetCountRef.current = targetCount; }, [targetCount]);
  useEffect(() => { abductedCountRef.current = abductedCount; }, [abductedCount]);

  // Handle phase transitions (ONLY trigger once when entering SCANNING)
  const prevPhaseRef = useRef<GamePhase>(phase);
  useEffect(() => {
    if (phase === 'SCANNING' && prevPhaseRef.current !== 'SCANNING') {
      stageTimerRef.current = 0;
      abductionStageRef.current = 'ENTRY_LOOP'; // Starts with Loop 1!
      currentTargetIdRef.current = null;
      targetSuctionRef.current = 0; // NO SUCTION on entry loop!
      initialTargetCountRef.current = targetCountRef.current;

      if (onStatusChange) onStatusChange('Tàu UFO đang đến...');

      // Select targetCount uncalled students randomly
      const available = students.filter(s => s.isPresent && !s.isCalled);
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, Math.min(targetCountRef.current, shuffled.length));
      abductionQueueRef.current = chosen;
    } else if (phase === 'IDLE') {
      abductionStageRef.current = 'IDLE';
      targetSuctionRef.current = 0;
      abductionQueueRef.current = [];
      currentTargetIdRef.current = null;
      renderStudentsRef.current.forEach(s => {
        s.isTargeted = false;
        s.isBeingAbducted = false;
        s.abductionProgress = 0;
        s.speechText = null;
      });
    }
    prevPhaseRef.current = phase;
  }, [phase, students]);

  // Initialize Beam Particles
  useEffect(() => {
    const list: BeamParticle[] = [];
    for (let i = 0; i < 70; i++) {
      list.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.005 + Math.random() * 0.009,
        size: 1.5 + Math.random() * 2.8,
        alpha: 0.35 + Math.random() * 0.65
      });
    }
    particlesRef.current = list;
  }, []);

  // Initialize students into 2 MAIN CONCENTRATED CLUSTERS matching the video
  const prevStudentKeyRef = useRef<string>('');
  useEffect(() => {
    const activeStudents = students.filter(s => s.isPresent);
    const key = activeStudents.map(s => `${s.id}-${s.name}-${s.gender}`).join('|');
    if (prevStudentKeyRef.current === key && renderStudentsRef.current.length > 0) {
      renderStudentsRef.current.forEach(rs => {
        const found = students.find(s => s.id === rs.student.id);
        if (found) {
          rs.student = found;
        }
      });
      return;
    }
    prevStudentKeyRef.current = key;

    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;

    const sidewalkY = height * 0.65;
    const sidewalkHeight = height * 0.28;

    // 10 Physical Anchors distributed across the street (matching physical fixtures!)
    const anchors: AnchorPoint[] = [
      { id: 'bus_stop_left', type: 'bus_stop', poleX: width * 0.08 + 6, poleTopY: sidewalkY - 20, poleBottomY: sidewalkY + 45 },
      { id: 'bus_stop_right', type: 'bus_stop', poleX: width * 0.08 + 65, poleTopY: sidewalkY - 20, poleBottomY: sidewalkY + 45 },
      { id: 'lamp_left', type: 'lamp_post', poleX: width * 0.22, poleTopY: sidewalkY - 60, poleBottomY: sidewalkY + 20 },
      { id: 'scooter_red', type: 'scooter', poleX: width * 0.32, poleTopY: sidewalkY + 6, poleBottomY: sidewalkY + 24 },
      { id: 'bollard_1', type: 'bollard', poleX: width * 0.42, poleTopY: sidewalkY + 14, poleBottomY: sidewalkY + 34 },
      { id: 'scooter_center', type: 'scooter', poleX: width * 0.52, poleTopY: sidewalkY + 6, poleBottomY: sidewalkY + 24 },
      { id: 'bollard_2', type: 'bollard', poleX: width * 0.63, poleTopY: sidewalkY + 14, poleBottomY: sidewalkY + 34 },
      { id: 'lamp_right', type: 'lamp_post', poleX: width * 0.74, poleTopY: sidewalkY - 60, poleBottomY: sidewalkY + 20 },
      { id: 'scooter_right', type: 'scooter', poleX: width * 0.84, poleTopY: sidewalkY + 6, poleBottomY: sidewalkY + 24 },
      { id: 'phone_booth', type: 'phone_booth', poleX: width * 0.92 + 4, poleTopY: sidewalkY - 15, poleBottomY: sidewalkY + 35 },
    ];

    const skinTones = ['#ffe1cc', '#fcd3b6', '#f6c49c', '#e8b088', '#dba07a', '#f5cbb1'];
    const bagColors = ['#0d9488', '#ea580c', '#8b5cf6', '#ca8a04', '#0284c7', '#ec4899', '#10b981'];
    const hairColors = ['#171717', '#262626', '#3b2f2f', '#1f2937'];
    const bottomColors = ['#1e293b', '#0f172a', '#334155', '#1e3a8a', '#292524'];

    const femaleStyles: ('bob' | 'ponytail' | 'pigtails' | 'fringe')[] = ['bob', 'ponytail', 'pigtails', 'fringe'];
    const maleStyles: ('short' | 'fringe')[] = ['short', 'fringe'];

    const renderList: RenderStudent[] = activeStudents.map((st, idx) => {
      // Natural distribution across entire street width (from 7% to 93% width)
      const count = activeStudents.length;
      const normalizedSlot = (idx + 0.5) / count;
      const baseX = Math.min(Math.max(width * (0.07 + normalizedSlot * 0.86) + (Math.random() * 24 - 12), 40), width - 40);

      // Depth positioning across the sidewalk (Y):
      // 0: upper sidewalk (near curb/shops), 1: mid sidewalk, 2: foreground sidewalk
      const depthTier = idx % 3;
      const rowY = sidewalkY + 16 + depthTier * (sidewalkHeight * 0.30) + (Math.random() * 12 - 6);

      // Nearest anchor point for suction clinging
      const nearestAnchor = anchors.reduce((prev, curr) => 
        Math.abs(curr.poleX - baseX) < Math.abs(prev.poleX - baseX) ? curr : prev, 
        anchors[0]
      );

      const isFemale = st.gender === 'female' || (st.gender === undefined && idx % 2 === 1);
      // Alternate clinging on left vs right side of pole/object
      const clingSide = idx % 2 === 0 ? 'left' : 'right';
      // Stagger clinging height so multiple students on the same pole don't overlap!
      const heightStep = ((idx % 4) * 0.26);
      const clingHeightRatio = 0.12 + heightStep;

      // 60% walking, 30% chatting, 10% standing
      const poses: ('walking' | 'chatting' | 'standing')[] = [
        'walking', 'walking', 'chatting', 'walking', 'standing', 'walking', 'chatting', 'walking'
      ];
      const idlePose = poses[idx % poses.length];

      // Roaming bounds for walking around
      const wanderRange = 60 + (idx % 4) * 25;
      const wanderMinX = Math.max(baseX - wanderRange, width * 0.05);
      const wanderMaxX = Math.min(baseX + wanderRange, width * 0.95);

      return {
        student: st,
        x: baseX,
        y: rowY,
        baseX: baseX,
        baseY: rowY,
        gender: isFemale ? 'female' : 'male',
        skinColor: skinTones[idx % skinTones.length],
        hairStyle: isFemale ? femaleStyles[idx % femaleStyles.length] : maleStyles[idx % maleStyles.length],
        hairColor: hairColors[idx % hairColors.length],
        bagColor: bagColors[idx % bagColors.length],
        bottomColor: bottomColors[idx % bottomColors.length],
        hasGlasses: idx % 4 === 0,
        speed: 0.28 + (idx % 4) * 0.1,
        facing: idx % 2 === 0 ? 1 : -1,
        wanderMinX,
        wanderMaxX,
        walkCycle: Math.random() * Math.PI * 2,
        idlePose,
        anchor: nearestAnchor,
        clingSide,
        clingAngle: (clingSide === 'left' ? -1 : 1) * (1.18 + (idx % 4) * 0.08), // ~68° - 82° tilt
        currentAngle: 0,
        clingHeightRatio: 0.18 + (idx % 5) * 0.14,
        isTargeted: false,
        isBeingAbducted: false,
        abductionProgress: 0,
        speechText: null
      };
    });

    renderStudentsRef.current = renderList;
  }, [students]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;
      saucerLightsAngleRef.current += 0.08;

      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const isUfoActive = phaseRef.current !== 'IDLE' && phaseRef.current !== 'COMPLETED';

      // Day to night transition
      const targetNight = isUfoActive ? 1 : 0;
      nightFactorRef.current += (targetNight - nightFactorRef.current) * 0.06;
      const night = nightFactorRef.current;

      // Suction power smoothly follows targetSuctionRef (ONLY active during tractor suction!)
      suctionPowerRef.current += (targetSuctionRef.current - suctionPowerRef.current) * 0.08;
      const suction = suctionPowerRef.current;

      const horizonY = height * 0.26;
      const roadY = height * 0.50;
      const sidewalkY = height * 0.67;
      const sidewalkBottomY = height * 0.94;

      // 1. SKY GRADIENT
      drawSky(ctx, width, horizonY, night);

      // 2. SHOPHOUSES & OVERHEAD UTILITY WIRES
      drawShophouses(ctx, width, horizonY, roadY, night);
      drawUtilityWires(ctx, width, horizonY, roadY);

      // 3. ROADWAY & RETRO CARS
      drawRoad(ctx, width, roadY, sidewalkY, night);

      // 4. SIDEWALK TILES & STREET FIXTURES (Street lamps, bus stop, phone booth, vespas)
      drawSidewalk(ctx, width, sidewalkY, sidewalkBottomY, night);
      drawStreetFixtures(ctx, width, sidewalkY, night);

      // 5. FAST ABDUCTION LOGIC (Completes 2-3 students in 5-8 seconds!)
      updateFastAbductionLogic(width, height);

      // 6. DRAW STUDENTS (Idle walking on ground -> Clinging when suction ramps up)
      drawStudents(ctx, width, height, time, suction);

      // 7. DRAW FLYING SAUCER & TRACTOR BEAM ("Chiếc đĩa quay")
      drawUFO(ctx, width, height, time, isUfoActive, suction);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // FAST ABDUCTION SEQUENCER: 
  // 1. ENTRY_LOOP: UFO flies loop across sky (suction = 0, people walk normally)
  // 2. TRACK_TARGET & SUCK_TARGET: Full suction on target 1 (people cling to objects)
  // 3. INTER_LOOP: UFO flies another loop across sky ("bay 1 vòng nữa")
  // 4. TRACK_TARGET & SUCK_TARGET: Full suction on target 2
  // Total round ~5-8 seconds!
  const updateFastAbductionLogic = (width: number, height: number) => {
    const list = renderStudentsRef.current;
    const isScanning = phaseRef.current === 'SCANNING';

    // Single speech bubble rotation
    speechCooldownRef.current--;
    if (speechCooldownRef.current <= 0) {
      if (activeSpeechIndexRef.current >= 0 && activeSpeechIndexRef.current < list.length) {
        list[activeSpeechIndexRef.current].speechText = null;
      }
      const randomIdx = Math.floor(Math.random() * list.length);
      activeSpeechIndexRef.current = randomIdx;
      const speaker = list[randomIdx];
      if (speaker && !speaker.isBeingAbducted) {
        const quotes = isScanning ? PANIC_QUOTES : FUNNY_QUOTES;
        speaker.speechText = quotes[Math.floor(Math.random() * quotes.length)];
      }
      speechCooldownRef.current = 180;
    }

    if (isScanning) {
      stageTimerRef.current += 1;
      const timer = stageTimerRef.current;
      const stage = abductionStageRef.current;

      // STAGE 1: ENTRY_LOOP (~75 frames, ~1.25s)
      // UFO arrives and flies a swooping loop across the sky!
      // ZERO SUCTION! Students on the ground are walking normally!
      if (stage === 'ENTRY_LOOP') {
        targetSuctionRef.current = 0; // ZERO suction during loop!
        const p = Math.min(timer / 75, 1);

        // Sweeping arc loop across the upper sky
        const loopAngle = p * Math.PI * 1.5;
        ufoTargetXRef.current = width * 0.5 + Math.sin(loopAngle) * (width * 0.35);
        const targetUfoY = height * 0.14 + Math.cos(loopAngle * 2) * 22;
        ufoYRef.current += (targetUfoY - ufoYRef.current) * 0.08;

        if (timer === 1) {
          if (onStatusChange) onStatusChange('Tàu UFO đang đến và bay lượn trên bầu trời...');
        }

        if (timer >= 75) {
          abductionStageRef.current = 'TRACK_TARGET';
          stageTimerRef.current = 0;
        }
      }

      // STAGE 2: TRACK_TARGET (~30 frames, ~0.5s)
      // UFO aligns directly over the target student
      else if (stage === 'TRACK_TARGET') {
        if (!currentTargetIdRef.current) {
          if (abductionQueueRef.current.length > 0) {
            const nextStudent = abductionQueueRef.current[0];
            const candidate = list.find(s => s.student.id === nextStudent.id);
            if (candidate) {
              currentTargetIdRef.current = candidate.student.id;
              candidate.isTargeted = true;
              candidate.speechText = 'Thầy ơi cứu em!';
              if (onStudentTargeted) onStudentTargeted(candidate.student.name);
              if (onStatusChange) onStatusChange(`Tàu UFO đang nhắm vào bạn ${candidate.student.name}...`);
            }
          } else {
            abductionStageRef.current = 'FINISHED';
            stageTimerRef.current = 0;
            return;
          }
        }

        const target = list.find(s => s.student.id === currentTargetIdRef.current);
        if (target) {
          const targetX = target.anchor.poleX;
          ufoTargetXRef.current = targetX;
          const targetUfoY = height * 0.16;
          ufoYRef.current += (targetUfoY - ufoYRef.current) * 0.08;

          // Low tractor beam alignment pulse
          targetSuctionRef.current = 0.2;

          const dist = Math.abs(ufoXRef.current - targetX);
          if (dist < 40 || timer >= 35) {
            // Locked on! Switch to FULL SUCTION!
            abductionStageRef.current = 'SUCK_TARGET';
            stageTimerRef.current = 0;
            if (onStatusChange) onStatusChange(`Bắt đầu hút bạn ${target.student.name}! Giữ chặt vào!`);
          }
        } else {
          abductionQueueRef.current.shift();
          currentTargetIdRef.current = null;
        }
      }

      // STAGE 3: SUCK_TARGET (~45 frames, ~0.75s)
      // FULL SUCTION ACTIVATED! Students cling tightly to objects, target is lifted into UFO!
      else if (stage === 'SUCK_TARGET') {
        targetSuctionRef.current = 1.0; // FULL SUCTION!

        const target = list.find(s => s.student.id === currentTargetIdRef.current);
        if (target) {
          ufoTargetXRef.current = target.anchor.poleX;
          const targetUfoY = height * 0.16;
          ufoYRef.current += (targetUfoY - ufoYRef.current) * 0.08;

          target.isBeingAbducted = true;
          target.abductionProgress += 0.022; // ~45 frames = 0.75s

          if (target.abductionProgress >= 1.0) {
            target.student.isCalled = true;
            target.isBeingAbducted = false;
            target.isTargeted = false;

            if (onAbductionComplete) onAbductionComplete(target.student);

            abductionQueueRef.current.shift();
            currentTargetIdRef.current = null;

            // Check if another student needs to be abducted
            if (abductionQueueRef.current.length > 0) {
              // "bay 1 vòng nữa thì hút người thứ 2"!
              abductionStageRef.current = 'INTER_LOOP';
              stageTimerRef.current = 0;
              if (onStatusChange) onStatusChange('Tàu UFO tiếp tục lượn vòng tìm bạn tiếp theo...');
            } else {
              abductionStageRef.current = 'FINISHED';
              stageTimerRef.current = 0;
            }
          }
        }
      }

      // STAGE 4: INTER_LOOP (~75 frames, ~1.25s)
      // UFO flies a sweeping second loop across the sky before targeting student #2!
      else if (stage === 'INTER_LOOP') {
        targetSuctionRef.current = 0.15; // Low idle glow while swooping
        const p = Math.min(timer / 75, 1);

        // Sweeping figure-eight loop across the sky
        const loopAngle = p * Math.PI * 2;
        ufoTargetXRef.current = width * 0.5 + Math.cos(loopAngle) * (width * 0.32);
        const targetUfoY = height * 0.13 + Math.sin(loopAngle) * 20;
        ufoYRef.current += (targetUfoY - ufoYRef.current) * 0.08;

        if (timer >= 75) {
          abductionStageRef.current = 'TRACK_TARGET';
          stageTimerRef.current = 0;
        }
      }

      // STAGE 5: FINISHED (~30 frames, ~0.5s)
      else if (stage === 'FINISHED') {
        targetSuctionRef.current = 0;
        ufoTargetXRef.current = width * 0.5;
        ufoYRef.current += (-200 - ufoYRef.current) * 0.08;

        if (timer >= 30) {
          if (onAllAbductionsComplete) onAllAbductionsComplete();
          abductionStageRef.current = 'IDLE';
        }
      }
    } else {
      ufoTargetXRef.current = width * 0.5;
      ufoYRef.current += (-180 - ufoYRef.current) * 0.08;
      targetSuctionRef.current = 0;
    }

    // Snappy UFO movement
    const prevX = ufoXRef.current;
    ufoXRef.current += (ufoTargetXRef.current - ufoXRef.current) * 0.09;
    const velocityX = ufoXRef.current - prevX;
    ufoTiltRef.current = Math.max(Math.min(velocityX * 0.045, 0.28), -0.28);
  };

  // 1. SKY
  const drawSky = (ctx: CanvasRenderingContext2D, width: number, horizonY: number, night: number) => {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    const topR = Math.round(204 * (1 - night) + 12 * night);
    const topG = Math.round(228 * (1 - night) + 21 * night);
    const topB = Math.round(245 * (1 - night) + 36 * night);

    const botR = Math.round(243 * (1 - night) + 26 * night);
    const botG = Math.round(248 * (1 - night) + 45 * night);
    const botB = Math.round(252 * (1 - night) + 64 * night);

    skyGrad.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
    skyGrad.addColorStop(1, `rgb(${botR}, ${botG}, ${botB})`);

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    if (night > 0.35) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(night - 0.35) * 0.9})`;
      const starOffsets = [0.12, 0.25, 0.38, 0.52, 0.65, 0.78, 0.89];
      starOffsets.forEach((rx, idx) => {
        const sx = rx * width;
        const sy = 16 + ((idx * 31) % (horizonY * 0.5));
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  // 2. SHOPHOUSES
  const drawShophouses = (
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonY: number,
    roadY: number,
    night: number
  ) => {
    const shops = [
      { name: 'TIỆM BÁNH NGỌT NGÀO', awning: '#f97316', wallDay: '#fff7ed', wallNight: '#1e293b' },
      { name: 'NHÀ SÁCH TUỔI THƠ', awning: '#eab308', wallDay: '#fefce8', wallNight: '#242b35' },
      { name: 'BÚN BÒ HUẾ DÌ TƯ', awning: '#dc2626', wallDay: '#fef2f2', wallNight: '#2a2228' },
      { name: 'CÀ PHÊ MỜI BẠN', awning: '#059669', wallDay: '#ecfdf5', wallNight: '#1a2c26' },
      { name: 'BÁNH MÌ NÓNG GIÒN', awning: '#ca8a04', wallDay: '#fffbeb', wallNight: '#2d2922' }
    ];

    const shopW = width / shops.length;
    const houseH = roadY - horizonY;

    shops.forEach((shop, idx) => {
      const bx = idx * shopW;

      ctx.fillStyle = night > 0.5 ? shop.wallNight : shop.wallDay;
      ctx.fillRect(bx, horizonY, shopW + 1, houseH);

      ctx.strokeStyle = night > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, horizonY, shopW, houseH);

      // Windows
      const winW = Math.min(shopW * 0.28, 32);
      const winH = 38;
      const winY = horizonY + 18;

      [bx + shopW * 0.2, bx + shopW * 0.62].forEach(wx => {
        ctx.fillStyle = night > 0.5 ? '#0f172a' : '#475569';
        ctx.fillRect(wx - 2, winY - 2, winW + 4, winH + 4);

        if (night > 0.3) {
          const glowGrad = ctx.createRadialGradient(wx + winW/2, winY + winH/2, 2, wx + winW/2, winY + winH/2, winW);
          glowGrad.addColorStop(0, '#fef08a');
          glowGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = glowGrad;
        } else {
          ctx.fillStyle = '#bae6fd';
        }
        ctx.fillRect(wx, winY, winW, winH);

        ctx.strokeStyle = night > 0.5 ? '#334155' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + winW / 2, winY);
        ctx.lineTo(wx + winW / 2, winY + winH);
        ctx.moveTo(wx, winY + winH / 2);
        ctx.lineTo(wx + winW, winY + winH / 2);
        ctx.stroke();
      });

      // Striped Awning
      const awningY = horizonY + houseH * 0.62;
      const awningH = 24;
      ctx.fillStyle = shop.awning;
      ctx.beginPath();
      ctx.moveTo(bx, awningY);
      ctx.lineTo(bx + shopW, awningY);
      ctx.lineTo(bx + shopW + 5, awningY + awningH);
      ctx.lineTo(bx - 5, awningY + awningH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const stripeCount = 4;
      const stripeW = shopW / (stripeCount * 2);
      for (let s = 0; s < stripeCount; s++) {
        const sx = bx + s * stripeW * 2;
        ctx.fillRect(sx, awningY, stripeW, awningH);
      }

      // Shop Signboard
      const signY = awningY - 22;
      ctx.fillStyle = night > 0.5 ? '#1e293b' : '#334155';
      ctx.fillRect(bx + 4, signY, shopW - 8, 18);

      ctx.fillStyle = '#ffffff';
      const fontSize = Math.min(Math.max(shopW * 0.08, 7.5), 10.5);
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shop.name, bx + shopW / 2, signY + 9);
    });
  };

  // OVERHEAD UTILITY WIRES
  const drawUtilityWires = (ctx: CanvasRenderingContext2D, width: number, horizonY: number, roadY: number) => {
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.lineWidth = 1.1;

    const wireY1 = horizonY + 14;
    for (let i = 0; i < 3; i++) {
      const drop = 12 + i * 7;
      ctx.beginPath();
      ctx.moveTo(0, wireY1 + i * 5);
      ctx.quadraticCurveTo(width * 0.25, wireY1 + drop, width * 0.5, wireY1 + i * 4);
      ctx.quadraticCurveTo(width * 0.75, wireY1 + drop + 3, width, wireY1 + i * 5);
      ctx.stroke();
    }
  };

  // 3. ROADWAY
  const drawRoad = (ctx: CanvasRenderingContext2D, width: number, roadY: number, sidewalkY: number, night: number) => {
    const roadH = sidewalkY - roadY;
    ctx.fillStyle = night > 0.5 ? '#1e293b' : '#475569';
    ctx.fillRect(0, roadY, width, roadH);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([20, 16]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + roadH * 0.45);
    ctx.lineTo(width, roadY + roadH * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zebra crosswalk
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    const zebraX = width * 0.46;
    for (let z = 0; z < 5; z++) {
      ctx.fillRect(zebraX + z * 16, roadY + 4, 9, roadH - 8);
    }

    // Vintage Red Car
    drawVintageCar(ctx, width * 0.22, roadY + 8, '#ef4444', night);

    // White TAXI
    drawTaxi(ctx, width * 0.70, roadY + 8, night);
  };

  const drawVintageCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, night: number) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y + 10, 68, 20, [5, 5, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x + 12, y, 40, 13, [7, 7, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 16, y + 3, 15, 8);
    ctx.fillRect(x + 35, y + 3, 13, 8);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 15, y + 30, 6.5, 0, Math.PI * 2);
    ctx.arc(x + 53, y + 30, 6.5, 0, Math.PI * 2);
    ctx.fill();
    if (night > 0.4) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 68, y + 17, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawTaxi = (ctx: CanvasRenderingContext2D, x: number, y: number, night: number) => {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x, y + 10, 70, 20, [5, 5, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x, y + 17, 70, 3.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(x + 14, y, 42, 13, [7, 7, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 28, y - 5, 14, 5);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 17, y + 3, 16, 8);
    ctx.fillRect(x + 37, y + 3, 15, 8);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 15, y + 30, 6.5, 0, Math.PI * 2);
    ctx.arc(x + 55, y + 30, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 4. SIDEWALK (Diagonal Diamond Paving from Kromaphone Video)
  const drawSidewalk = (
    ctx: CanvasRenderingContext2D,
    width: number,
    sidewalkY: number,
    sidewalkBottomY: number,
    night: number
  ) => {
    const swH = sidewalkBottomY - sidewalkY;
    ctx.fillStyle = night > 0.5 ? '#334155' : '#ede8dc';
    ctx.fillRect(0, sidewalkY, width, swH);

    // Curb edge
    ctx.fillStyle = night > 0.5 ? '#1e293b' : '#d5cfc2';
    ctx.fillRect(0, sidewalkY - 3, width, 4);

    // Diagonal Diamond Paving Lines
    ctx.strokeStyle = night > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.055)';
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = -width; x < width * 2; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, sidewalkY);
      ctx.lineTo(x + swH * 0.85, sidewalkBottomY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, sidewalkY);
      ctx.lineTo(x - swH * 0.85, sidewalkBottomY);
      ctx.stroke();
    }
  };

  // 8 STREET FIXTURES & PHYSICAL ANCHORS (Exact match to Kromaphone video!)
  const drawStreetFixtures = (
    ctx: CanvasRenderingContext2D,
    width: number,
    sidewalkY: number,
    night: number
  ) => {
    // 1. Bus Stop Shelter (x ~ 10% width)
    const bsX = width * 0.08;
    const bsY = sidewalkY - 10;
    ctx.save();
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(bsX, bsY - 26, 75, 7, 3);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bsX + 6, bsY - 26, 3.5, 75);
    ctx.fillRect(bsX + 65, bsY - 26, 3.5, 75);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
    ctx.fillRect(bsX + 10, bsY - 19, 55, 48);
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 7.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('XE BUÝT', bsX + 37, bsY - 10);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(bsX + 16, bsY + 6);
    ctx.lineTo(bsX + 34, bsY + 16);
    ctx.lineTo(bsX + 58, bsY + 7);
    ctx.stroke();
    ctx.strokeStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(bsX + 18, bsY + 20);
    ctx.lineTo(bsX + 38, bsY + 4);
    ctx.lineTo(bsX + 55, bsY + 22);
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(bsX + 12, bsY + 32, 52, 4.5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bsX + 16, bsY + 36.5, 3.5, 12);
    ctx.fillRect(bsX + 56, bsY + 36.5, 3.5, 12);
    ctx.restore();

    // 2. Left Lamp Post (x ~ 22% width)
    drawStreetLamp(ctx, width * 0.22, sidewalkY + 22, night);

    // 3. Red Vespa Scooter (x ~ 32% width)
    drawScooter(ctx, width * 0.32, sidewalkY + 16, '#dc2626', night);

    // 4. Bollard Post 1 (x ~ 42% width)
    drawBollard(ctx, width * 0.42, sidewalkY + 35, night);

    // 5. Center Blue Vespa Scooter (x ~ 52% width)
    drawScooter(ctx, width * 0.52, sidewalkY + 16, '#0284c7', night);

    // 6. Bollard Post 2 (x ~ 63% width)
    drawBollard(ctx, width * 0.63, sidewalkY + 35, night);

    // 7. Right Lamp Post (x ~ 74% width)
    drawStreetLamp(ctx, width * 0.74, sidewalkY + 22, night);

    // 8. Right Turquoise Scooter (x ~ 84% width)
    drawScooter(ctx, width * 0.84, sidewalkY + 16, '#0d9488', night);

    // 9. Retro Phone Booth (x ~ 93% width)
    const pbX = width * 0.92;
    const pbY = sidewalkY - 8;
    ctx.save();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(pbX, pbY - 35, 32, 78, [5, 5, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(pbX + 4, pbY - 20, 24, 42);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pbX + 10, pbY - 8, 12, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 5.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ĐIỆN THOẠI', pbX + 16, pbY - 25);
    ctx.restore();
  };

  const drawBollard = (ctx: CanvasRenderingContext2D, x: number, y: number, night: number) => {
    ctx.save();
    ctx.fillStyle = night > 0.5 ? '#14532d' : '#225e3b';
    ctx.beginPath();
    ctx.roundRect(x - 3, y - 26, 6, 26, [3, 3, 0, 0]);
    ctx.fill();
    // White reflector ring
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3, y - 21, 6, 2.5);
    // Base ring
    ctx.fillStyle = night > 0.5 ? '#0f3a1e' : '#143d24';
    ctx.beginPath();
    ctx.ellipse(x, y, 4.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawStreetLamp = (ctx: CanvasRenderingContext2D, x: number, y: number, night: number) => {
    ctx.save();
    const lampHeight = 92;
    const topY = y - lampHeight;

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x + 4.5, y - 16);
    ctx.lineTo(x - 4.5, y - 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.fillRect(x - 2, topY + 14, 4, lampHeight - 30);

    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x, topY + 18);
    ctx.quadraticCurveTo(x, topY, x + 15, topY + 4);
    ctx.stroke();

    const lanX = x + 15;
    const lanY = topY + 7;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lanX - 6, lanY - 3.5, 12, 3.5);

    if (night > 0.1) {
      const glowGrad = ctx.createRadialGradient(lanX, lanY + 4, 2, lanX, lanY + 4, 45);
      glowGrad.addColorStop(0, `rgba(254, 240, 138, ${night * 0.95})`);
      glowGrad.addColorStop(0.5, `rgba(245, 158, 11, ${night * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lanX, lanY + 4, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(254, 240, 138, ${night * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(lanX - 5, lanY + 8);
      ctx.lineTo(lanX + 5, lanY + 8);
      ctx.lineTo(lanX + 42, y + 10);
      ctx.lineTo(lanX - 42, y + 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = night > 0.3 ? '#fef08a' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(lanX, lanY + 4, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawScooter = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, night: number) => {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x - 12, y + 12, 7, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(x - 12, y + 12, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - 16, y, 32, 11, 5);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(x - 12, y - 4, 18, 5, 2.5);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillRect(x + 8, y - 10, 5, 12);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x + 5, y - 10);
    ctx.lineTo(x + 16, y - 10);
    ctx.stroke();

    if (night > 0.3) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 13, y - 5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // 5. DRAW STUDENTS
  // When IDLE: Walk and chat normally on the ground!
  // ONLY WHEN SUCTION RAMPS UP: Cling to the pole!
  const drawStudents = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    suction: number
  ) => {
    const list = renderStudentsRef.current;
    const isScanning = phaseRef.current === 'SCANNING';

    // Sort by Y depth so students in front draw over students behind
    const sorted = [...list].sort((a, b) => a.y - b.y);

    sorted.forEach(st => {
      if (st.abductionProgress >= 1.0) return;

      ctx.save();

      // Resolve physical fixture grip coordinate
      const pole = st.anchor;
      let gripX = pole.poleX;
      let gripY = pole.poleBottomY - (pole.poleBottomY - pole.poleTopY) * st.clingHeightRatio;
      if (pole.type === 'scooter') {
        gripX = pole.poleX + (st.clingSide === 'left' ? -8 : 8);
        gripY = pole.poleTopY + 2;
      } else if (pole.type === 'bollard') {
        gripX = pole.poleX + (st.clingSide === 'left' ? -4 : 4);
        gripY = pole.poleTopY + 4;
      }

      // CASE A: ABDUCTION LIFT (Being sucked up into UFO!)
      if (st.isBeingAbducted) {
        const ufoX = ufoXRef.current;
        const ufoUnderbellyY = ufoYRef.current + 32;

        const p = st.abductionProgress;
        const currentX = gripX + (ufoX - gripX) * Math.min(p * 1.2, 1);
        const currentY = gripY - (gripY - ufoUnderbellyY) * p;

        const floatTilt = Math.sin(time * 8 + st.x) * 0.35 + (p * 0.4);

        ctx.translate(currentX, currentY);
        ctx.rotate(floatTilt);

        drawSlenderCharacter(ctx, st, 'abducted', time);
        ctx.restore();

        drawStudentBadge(ctx, st.student.name, currentX, currentY - 42, true, st.speechText);
        return;
      }

      // CASE B: CLINGING TO POLE / SCOOTER (When suction > 0.15)
      // Hands wrap DIRECTLY around the pole/fixture surface!
      // When suction is 0, they walk freely on the ground!
      if (suction > 0.15 && st.anchor) {
        // Frantic scramble: transition smoothly from sidewalk walking position to physical anchor grip
        const clingFactor = Math.min((suction - 0.15) / 0.35, 1);
        const renderGripX = st.x + (gripX - st.x) * clingFactor;
        const renderGripY = st.y + (gripY - st.y) * clingFactor;

        ctx.translate(renderGripX, renderGripY);
        drawClingingCharacter(ctx, st, time, suction);
        ctx.restore();

        const isLeft = st.clingSide === 'left';
        const badgeX = renderGripX + (isLeft ? -22 : 22);
        const badgeY = renderGripY - 36;

        drawStudentBadge(ctx, st.student.name, badgeX, badgeY, st.isTargeted, st.speechText);
        return;
      }

      // CASE C: NORMAL IDLE (Walking freely around the street!)
      st.currentAngle = 0;

      if (st.idlePose === 'walking') {
        st.x += st.speed * st.facing;
        st.walkCycle += 0.09;

        if (st.x > st.wanderMaxX) {
          st.facing = -1;
          st.x = st.wanderMaxX;
        } else if (st.x < st.wanderMinX) {
          st.facing = 1;
          st.x = st.wanderMinX;
        }
      } else if (st.idlePose === 'chatting') {
        st.walkCycle += 0.02;
      }

      ctx.translate(st.x, st.y);
      drawSlenderCharacter(ctx, st, 'idle', time);
      ctx.restore();

      drawStudentBadge(ctx, st.student.name, st.x, st.y - 42, st.isTargeted, st.speechText);
    });
  };

  // DEDICATED CLINGING CHARACTER (Origin (0,0) is EXACTLY the HANDS GRIPPING THE POLE!)
  // Hands are 100% physically clamped onto the pole/fixture surface!
  // Body extends horizontally/diagonally in tractor beam suction wind with kicking legs!
  const drawClingingCharacter = (
    ctx: CanvasRenderingContext2D,
    st: RenderStudent,
    time: number,
    suction: number
  ) => {
    ctx.save();
    const isLeft = st.clingSide === 'left';

    // If student is on the left of the pole, body extends to the left (-x).
    // If student is on the right of the pole, scale(-1, 1) flips body to extend to the right (+x).
    ctx.scale(isLeft ? 1 : -1, 1);

    // Suction tilt: tractor beam pulls body upwards towards sky (-0.2 rad to -0.45 rad)
    // plus violent wind flutter
    const suctionTilt = -0.20 - 0.25 * suction;
    const flutter = Math.sin(time * 16 + st.baseX) * (0.05 + 0.07 * suction);
    ctx.rotate(suctionTilt + flutter);

    const isFemale = st.gender === 'female';

    // 1. HANDS & ARMS:
    // Origin (0,0) is where the hands wrap around the vertical pole!
    // Fingers wrap around the front face of the pole at x = 0
    ctx.fillStyle = st.skinColor;
    // Top hand
    ctx.beginPath();
    ctx.roundRect(-2.5, -5.5, 6, 4.2, 2);
    ctx.fill();
    // Bottom hand
    ctx.beginPath();
    ctx.roundRect(-2.5, 1.5, 6, 4.2, 2);
    ctx.fill();

    // Finger grip joint wrap
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1.8, -5, 1.2, 3.2);
    ctx.fillRect(1.8, 2, 1.2, 3.2);

    // Forearms reaching from torso (x = -13) to hands (x = 0)
    ctx.fillStyle = st.skinColor;
    ctx.fillRect(-11, -4.5, 10, 3);
    ctx.fillRect(-11, 1.5, 10, 3);

    // White shirt short sleeves
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-15, -5.5, 4.5, 8.5);

    // 2. TORSO (White school shirt)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-27, -6, 13, 12, 2.5);
    ctx.fill();

    // School collar & tie
    ctx.fillStyle = isFemale ? '#0f766e' : '#1e3a8a';
    ctx.fillRect(-19, -2, 5.5, 4);

    // Backpack pulled by suction draft (upper edge)
    ctx.fillStyle = st.bagColor;
    ctx.beginPath();
    ctx.roundRect(-26, -10.5, 11, 5, 2);
    ctx.fill();

    // 3. PANICKED HEAD & FACE (Looking up towards UFO!)
    // Neck
    ctx.fillStyle = st.skinColor;
    ctx.fillRect(-19, -9.5, 3.5, 5);

    // Head base
    ctx.beginPath();
    ctx.ellipse(-17.5, -14.5, 5.8, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(-12.2, -14.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Wide panicked eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-14.5, -15.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-14.2, -15.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Screaming panic mouth ("O")
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(-13.5, -11.8, 2.4, 1.8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Flying panic sweat drop
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-22, -19, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Glasses (if worn)
    if (st.hasGlasses) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.85;
      ctx.strokeRect(-16, -17, 3.6, 3.2);
    }

    // 4. HAIR (Blown back violently by tractor beam wind!)
    ctx.fillStyle = st.hairColor;
    if (st.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(-18, -15.5, 5.8, Math.PI * 0.7, Math.PI * 2.2);
      ctx.fill();
      const ponyFlutter = Math.sin(time * 18 + st.baseX) * 3;
      ctx.beginPath();
      ctx.moveTo(-22, -17);
      ctx.quadraticCurveTo(-30, -23 + ponyFlutter, -38, -18);
      ctx.quadraticCurveTo(-30, -14, -23, -13);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(-22.5, -17, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (st.hairStyle === 'bob') {
      ctx.beginPath();
      ctx.arc(-18, -15.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-25, -15, 8, 8);
    } else if (st.hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(-18, -15.5, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-24, -19, 3.2, 0, Math.PI * 2);
      ctx.arc(-24, -10, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(-18, -15.5, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-23, -15, 6, 5);
    }

    // 5. LOWER BODY (Billowing in suction wind)
    if (isFemale) {
      ctx.fillStyle = st.bottomColor;
      ctx.beginPath();
      ctx.moveTo(-27, -6);
      ctx.lineTo(-27, 6);
      ctx.lineTo(-36, 9);
      ctx.lineTo(-36, -8);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = st.bottomColor;
      ctx.fillRect(-36, -5.5, 9, 11);
    }

    // 6. FRANTIC KICKING LEGS IN AIR
    const legKick1 = Math.sin(time * 20 + st.baseX) * 4;
    const legKick2 = -Math.sin(time * 20 + st.baseX) * 4;

    // Leg 1
    ctx.fillStyle = isFemale ? st.skinColor : st.bottomColor;
    ctx.fillRect(-49, -5 + legKick1 * 0.5, 14, 3.2);
    ctx.fillStyle = '#ffffff'; // White sock
    ctx.fillRect(-52, -5 + legKick1 * 0.5, 3.5, 3.2);
    ctx.fillStyle = '#1e293b'; // Shoe
    ctx.fillRect(-56, -5 + legKick1 * 0.5, 4.5, 3.5);

    // Leg 2
    ctx.fillStyle = isFemale ? st.skinColor : st.bottomColor;
    ctx.fillRect(-49, 1.8 + legKick2 * 0.5, 14, 3.2);
    ctx.fillStyle = '#ffffff'; // White sock
    ctx.fillRect(-52, 1.8 + legKick2 * 0.5, 3.5, 3.2);
    ctx.fillStyle = '#1e293b'; // Shoe
    ctx.fillRect(-56, 1.8 + legKick2 * 0.5, 4.5, 3.5);

    ctx.restore();
  };

  // ARTISTIC VECTOR CHARACTER ("Người thanh thoát" - Exact to Kromaphone Video!)
  const drawSlenderCharacter = (
    ctx: CanvasRenderingContext2D,
    st: RenderStudent,
    state: 'idle' | 'clinging' | 'abducted',
    time: number
  ) => {
    ctx.save();
    // Face in movement direction (+1: right, -1: left)
    ctx.scale(st.facing, 1);

    const isFemale = st.gender === 'female';
    const isWalking = state === 'idle' && st.idlePose === 'walking';
    
    // Smooth walk physics
    const walkSwing = isWalking ? Math.sin(st.walkCycle) * 3.6 : 0;
    const armSwing = isWalking ? -Math.sin(st.walkCycle) * 3.0 : 0;
    const bodyBounce = isWalking ? Math.abs(Math.sin(st.walkCycle)) * 1.5 : 0;

    const hipY = -18 - bodyBounce;
    const chestY = -30 - bodyBounce;
    const headY = -42 - bodyBounce;

    // 1. BACKPACK (Drawn on the back: x < 0 since facing is +1)
    ctx.fillStyle = st.bagColor;
    ctx.beginPath();
    ctx.roundRect(-8.5, chestY + 1.5, 5.5, 13.5, 2.5);
    ctx.fill();
    // Backpack pocket detail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.roundRect(-8, chestY + 6.5, 4.5, 6.5, 1.5);
    ctx.fill();

    // 2. LOWER BODY & LEGS
    if (state === 'clinging') {
      const legFlutter = Math.sin(time * 14 + st.baseX) * 3.2;
      if (isFemale) {
        // Skirt blown sideways
        ctx.fillStyle = st.bottomColor;
        ctx.beginPath();
        ctx.moveTo(-5, hipY);
        ctx.lineTo(4, hipY);
        ctx.lineTo(6, hipY + 8);
        ctx.lineTo(-8, hipY + 8);
        ctx.closePath();
        ctx.fill();

        // Bare legs streaming behind
        ctx.fillStyle = st.skinColor;
        ctx.fillRect(-6, hipY + 8, 2.8, 13);
        ctx.fillRect(-2 + legFlutter * 0.5, hipY + 9, 2.8, 13);
        // White socks
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6.5, hipY + 18, 3.8, 3);
        ctx.fillRect(-2.5 + legFlutter * 0.5, hipY + 19, 3.8, 3);
        // Shoes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-7.5, hipY + 20, 5.5, 3);
        ctx.fillRect(-3.5 + legFlutter * 0.5, hipY + 21, 5.5, 3);
      } else {
        // Pants flying behind
        ctx.fillStyle = st.bottomColor;
        ctx.fillRect(-6, hipY, 3.5, 17);
        ctx.fillRect(-1 + legFlutter * 0.5, hipY + 1, 3.5, 17);
        // Shoes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-7.5, hipY + 16, 6, 3.5);
        ctx.fillRect(-2.5 + legFlutter * 0.5, hipY + 17, 6, 3.5);
      }
    } else if (state === 'abducted') {
      ctx.fillStyle = st.bottomColor;
      if (isFemale) {
        ctx.beginPath();
        ctx.moveTo(-5, hipY);
        ctx.lineTo(5, hipY);
        ctx.lineTo(7, hipY + 8);
        ctx.lineTo(-7, hipY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = st.skinColor;
        ctx.fillRect(-4, hipY + 8, 2.8, 12);
        ctx.fillRect(1.5, hipY + 9, 2.8, 11);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4.5, hipY + 18, 4, 3);
        ctx.fillRect(1, hipY + 18, 4, 3);
      } else {
        ctx.fillRect(-4, hipY, 3, 16);
        ctx.fillRect(1.5, hipY + 1, 3, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, hipY + 15, 5, 3.5);
        ctx.fillRect(1, hipY + 16, 5, 3.5);
      }
    } else {
      // IDLE WALKING / STANDING
      if (isFemale) {
        // Pleated School Skirt
        ctx.fillStyle = st.bottomColor;
        ctx.beginPath();
        ctx.moveTo(-4.5, hipY);
        ctx.lineTo(4.5, hipY);
        ctx.lineTo(7, hipY + 9);
        ctx.lineTo(-7, hipY + 9);
        ctx.closePath();
        ctx.fill();

        // Skirt pleat lines
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-2, hipY); ctx.lineTo(-3, hipY + 9);
        ctx.moveTo(0, hipY); ctx.lineTo(0, hipY + 9);
        ctx.moveTo(2, hipY); ctx.lineTo(3, hipY + 9);
        ctx.stroke();

        // Slender legs stepping
        ctx.fillStyle = st.skinColor;
        ctx.fillRect(-3.5 + walkSwing, hipY + 9, 2.6, 12);
        ctx.fillRect(1 - walkSwing, hipY + 9, 2.6, 12);

        // White socks
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4 + walkSwing, hipY + 18, 3.6, 2.8);
        ctx.fillRect(0.5 - walkSwing, hipY + 18, 3.6, 2.8);

        // Shoes with white trim
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4.5 + walkSwing, hipY + 20, 5, 2.8);
        ctx.fillRect(0 - walkSwing, hipY + 20, 5, 2.8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4.5 + walkSwing, hipY + 22, 5, 0.8);
        ctx.fillRect(0 - walkSwing, hipY + 22, 5, 0.8);
      } else {
        // Boys: Tailored trousers with stepping animation
        ctx.fillStyle = st.bottomColor;
        ctx.fillRect(-3.5 + walkSwing, hipY, 3.2, 21);
        ctx.fillRect(1 - walkSwing, hipY, 3.2, 21);

        // Shoes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4.5 + walkSwing, hipY + 19, 5.5, 3.2);
        ctx.fillRect(0.5 - walkSwing, hipY + 19, 5.5, 3.2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4.5 + walkSwing, hipY + 19, 5.5, 1.6);
        ctx.fillRect(0.5 - walkSwing, hipY + 19, 5.5, 1.6);
      }
    }

    // 3. TORSO (White School Uniform Shirt)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-5, chestY, 10, 13, 2);
    ctx.fill();

    // Shirt collar & necktie
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-3, chestY);
    ctx.lineTo(0, chestY + 3.5);
    ctx.lineTo(3, chestY);
    ctx.fill();

    // Neck tie / ribbon
    ctx.fillStyle = isFemale ? '#0f766e' : '#1e3a8a';
    ctx.fillRect(-1, chestY + 2.5, 2, 5.5);

    // Backpack front straps
    ctx.fillStyle = st.bagColor;
    ctx.fillRect(-3.5, chestY + 1, 1.6, 11);
    ctx.fillRect(1.8, chestY + 1, 1.6, 11);

    // 4. ARMS & HANDS
    ctx.fillStyle = st.skinColor;
    if (state === 'clinging') {
      ctx.fillRect(1, chestY + 2, 10, 2.8);
      ctx.fillRect(1, chestY + 5.5, 9, 2.8);
      ctx.beginPath();
      ctx.arc(10.5, chestY + 3.4, 2.2, 0, Math.PI * 2);
      ctx.arc(9.5, chestY + 6.9, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (state === 'abducted') {
      ctx.fillRect(-7, chestY - 5, 2.6, 10);
      ctx.fillRect(4.5, chestY - 7, 2.6, 10);
    } else {
      // White shirt short-sleeve cuffs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5.5 + armSwing * 0.3, chestY + 1.5, 2.8, 3.5);
      ctx.fillRect(2.8 - armSwing * 0.3, chestY + 1.5, 2.8, 3.5);

      // Slender arms
      ctx.fillStyle = st.skinColor;
      if (st.idlePose === 'chatting') {
        // One hand holding strap / gesturing
        ctx.fillRect(-5.5, chestY + 4.5, 2.4, 6);
        ctx.fillRect(2.8, chestY + 3, 2.4, 7);
        ctx.beginPath();
        ctx.arc(4, chestY + 10, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Natural walking swing
        ctx.fillRect(-5.5 + armSwing * 0.3, chestY + 4.5, 2.2, 8.5);
        ctx.fillRect(3.2 - armSwing * 0.3, chestY + 4.5, 2.2, 8.5);
      }
    }

    // 5. SLENDER NECK & HEAD (Profile / 3/4)
    ctx.fillStyle = st.skinColor;
    ctx.fillRect(-1.5, headY + 6.5, 3, 4);

    // Head base
    ctx.beginPath();
    ctx.ellipse(0, headY, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute nose bump facing forward (x > 0)
    ctx.beginPath();
    ctx.arc(4.6, headY + 0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye (facing forward)
    ctx.fillStyle = '#0f172a';
    if (state === 'clinging' || state === 'abducted') {
      ctx.beginPath();
      ctx.arc(2.2, headY - 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Panic open mouth
      ctx.beginPath();
      ctx.arc(2.5, headY + 3, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Sweat drop
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(4.5, headY - 3.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Calm cute eye
      ctx.beginPath();
      ctx.arc(2.2, headY - 0.5, 1.1, 0, Math.PI * 2);
      ctx.fill();
      // Tiny white highlight in eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2.5, headY - 0.8, 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Gentle smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      if (st.idlePose === 'chatting' || st.speechText) {
        ctx.fillStyle = '#0f172a';
        ctx.arc(2.5, headY + 2.6, 1.2, 0, Math.PI);
        ctx.fill();
      } else {
        ctx.arc(2.2, headY + 2.2, 1.4, 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
    }

    // Glasses
    if (st.hasGlasses) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.85;
      ctx.strokeRect(0.5, headY - 2, 3.5, 3.2);
      ctx.beginPath();
      ctx.moveTo(-1, headY - 0.4);
      ctx.lineTo(0.5, headY - 0.4);
      ctx.stroke();
    }

    // 6. STYLIZED VECTOR HAIR (Exact to Kromaphone Video!)
    ctx.fillStyle = st.hairColor;
    if (st.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, headY - 1.8, 5.6, Math.PI * 0.7, Math.PI * 2.2);
      ctx.fill();
      // High perky ponytail sweeping back
      ctx.beginPath();
      ctx.moveTo(-3, headY - 3.5);
      ctx.quadraticCurveTo(-9, headY - 8 + (isWalking ? Math.sin(st.walkCycle) * 2 : 0), -12, headY - 2);
      ctx.quadraticCurveTo(-7, headY - 2, -2.5, headY - 1);
      ctx.fill();
      // Hair tie
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(-3.5, headY - 3.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Side bang
      ctx.fillStyle = st.hairColor;
      ctx.fillRect(1.5, headY - 2.5, 2, 4);
    } else if (st.hairStyle === 'bob') {
      ctx.beginPath();
      ctx.arc(0, headY - 1.8, 5.8, Math.PI * 0.6, Math.PI * 2.3);
      ctx.fill();
      ctx.fillRect(-5.5, headY - 1.5, 3.2, 7.5);
      ctx.fillRect(1, headY - 2, 2.5, 4.5);
    } else if (st.hairStyle === 'pigtails') {
      ctx.beginPath();
      ctx.arc(0, headY - 1.8, 5.6, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-6.5, headY + 1, 2.5, 0, Math.PI * 2);
      ctx.arc(6.5, headY + 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Boy crop with neat fringe
      ctx.beginPath();
      ctx.arc(0, headY - 1.8, 5.6, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(-5, headY - 1.5, 3.5, 4.5);
      ctx.fillRect(1, headY - 2.5, 3.2, 3.5);
    }

    ctx.restore();
  };

  // NAME BADGES & SPEECH BUBBLE HELPER (Exact to Kromaphone Video!)
  const drawStudentBadge = (
    ctx: CanvasRenderingContext2D,
    name: string,
    x: number,
    y: number,
    isTargeted: boolean,
    speechText: string | null
  ) => {
    ctx.save();
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(name).width;
    const badgeW = textWidth + 14;
    const badgeH = 18;
    const badgeX = x - badgeW / 2;
    const badgeY = y;

    // Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = isTargeted ? 10 : 3.5;
    ctx.shadowOffsetY = 1.5;

    // Background & Stroke
    if (isTargeted) {
      ctx.shadowColor = '#bef264';
      ctx.fillStyle = '#bef264';
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 1.8;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 0.8;
    }

    // Badge Pill
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
    ctx.fill();
    ctx.stroke();

    // Triangle Pointer Tail pointing down to the character's head! (Exact match to Kromaphone video!)
    ctx.beginPath();
    ctx.moveTo(x - 3.5, badgeY + badgeH - 0.5);
    ctx.lineTo(x, badgeY + badgeH + 3.8);
    ctx.lineTo(x + 3.5, badgeY + badgeH - 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Text inside Badge
    ctx.fillStyle = isTargeted ? '#14532d' : '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, badgeY + badgeH / 2);

    // Speech Bubble (if chatting or panic!)
    if (speechText) {
      ctx.font = '500 8.5px "Plus Jakarta Sans", sans-serif';
      const spWidth = ctx.measureText(speechText).width;
      const spW = spWidth + 16;
      const spH = 20;
      const spX = x - spW / 2;
      const spY = badgeY - spH - 6;

      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      // Authentic pastel green bubble from video
      ctx.fillStyle = '#e6f4ea';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(spX, spY, spW, spH, 10);
      ctx.fill();
      ctx.stroke();

      // Downward pointer to name tag
      ctx.beginPath();
      ctx.moveTo(x - 3, spY + spH - 0.5);
      ctx.lineTo(x, spY + spH + 3.5);
      ctx.lineTo(x + 3, spY + spH - 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#1b4332';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(speechText, x, spY + spH / 2);
    }

    ctx.restore();
  };

  // 7. DRAW FLYING SAUCER ("Chiếc đĩa quay")
  const drawUFO = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    isUfoActive: boolean,
    suction: number
  ) => {
    const ufoX = ufoXRef.current;
    const ufoY = ufoYRef.current;
    const tilt = ufoTiltRef.current;

    if (ufoY < -120) return;

    ctx.save();
    ctx.translate(ufoX, ufoY);
    ctx.rotate(tilt);

    // A. ULTRA-WIDE CINEMATIC TRACTOR BEAM (Vùng quét mở rộng bao trọn đường phố!)
    if (isUfoActive && suction > 0.05) {
      const beamHeight = height * 0.78;
      const topBeamW = 95 * suction;
      const botBeamW = 720 * suction; // Much wider beam scan area as requested!

      // 1. Atmospheric Outer Soft Glow
      const haloGrad = ctx.createLinearGradient(0, 18, 0, beamHeight);
      haloGrad.addColorStop(0, `rgba(56, 189, 248, ${0.22 * suction})`);
      haloGrad.addColorStop(0.4, `rgba(56, 189, 248, ${0.12 * suction})`);
      haloGrad.addColorStop(0.85, `rgba(56, 189, 248, ${0.04 * suction})`);
      haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.moveTo(-topBeamW * 0.75, 18);
      ctx.lineTo(topBeamW * 0.75, 18);
      ctx.lineTo(botBeamW * 0.58, beamHeight);
      ctx.lineTo(-botBeamW * 0.58, beamHeight);
      ctx.closePath();
      ctx.fill();

      // 2. Main Radiant Conical Tractor Beam
      const beamGrad = ctx.createLinearGradient(0, 18, 0, beamHeight);
      beamGrad.addColorStop(0, `rgba(167, 243, 208, ${0.52 * suction})`);
      beamGrad.addColorStop(0.3, `rgba(125, 211, 252, ${0.35 * suction})`);
      beamGrad.addColorStop(0.75, `rgba(56, 189, 248, ${0.16 * suction})`);
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-topBeamW / 2, 18);
      ctx.lineTo(topBeamW / 2, 18);
      ctx.lineTo(botBeamW / 2, beamHeight);
      ctx.lineTo(-botBeamW / 2, beamHeight);
      ctx.closePath();
      ctx.fill();

      // 3. Dense Inner Core Laser Column
      const coreGrad = ctx.createLinearGradient(0, 18, 0, beamHeight);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * suction})`);
      coreGrad.addColorStop(0.4, `rgba(167, 243, 208, ${0.32 * suction})`);
      coreGrad.addColorStop(0.9, `rgba(167, 243, 208, ${0.08 * suction})`);
      coreGrad.addColorStop(1, 'rgba(167, 243, 208, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(-topBeamW * 0.28, 18);
      ctx.lineTo(topBeamW * 0.28, 18);
      ctx.lineTo(-botBeamW * 0.24, beamHeight);
      ctx.lineTo(botBeamW * 0.24, beamHeight);
      ctx.closePath();
      ctx.fill();

      // 4. Ground Lighting Oval (Vùng quét chiếu sáng mặt đường)
      const groundGrad = ctx.createRadialGradient(0, beamHeight, 5, 0, beamHeight, botBeamW * 0.48);
      groundGrad.addColorStop(0, `rgba(167, 243, 208, ${0.6 * suction})`);
      groundGrad.addColorStop(0.35, `rgba(125, 211, 252, ${0.3 * suction})`);
      groundGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.12 * suction})`);
      groundGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = groundGrad;
      ctx.beginPath();
      ctx.ellipse(0, beamHeight, botBeamW * 0.48, 26 * suction, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Pulsating Ground Suction Ripples
      const ripplePhase1 = (time * 2.8) % 1;
      const rippleRadius1 = (botBeamW * 0.48) * ripplePhase1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - ripplePhase1) * 0.45 * suction})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, beamHeight, rippleRadius1, 24 * ripplePhase1 * suction, 0, 0, Math.PI * 2);
      ctx.stroke();

      const ripplePhase2 = (time * 2.8 + 0.5) % 1;
      const rippleRadius2 = (botBeamW * 0.48) * ripplePhase2;
      ctx.strokeStyle = `rgba(167, 243, 208, ${(1 - ripplePhase2) * 0.35 * suction})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, beamHeight, rippleRadius2, 24 * ripplePhase2 * suction, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Upward Swirling Particles
      particlesRef.current.forEach(p => {
        p.y += p.speed;
        if (p.y > 1) p.y = 0;

        const currentW = topBeamW + (botBeamW - topBeamW) * p.y;
        const px = (p.x - 0.5) * currentW * 0.9;
        const py = 18 + p.y * (beamHeight - 18);

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.85 * suction})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // B. UPPER COCKPIT DOME
    const domeGrad = ctx.createLinearGradient(0, -36, 0, 0);
    domeGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
    domeGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.7)');
    domeGrad.addColorStop(1, 'rgba(125, 211, 252, 0.4)');

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(0, -5, 40, 28, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-12, -16, 11, 4.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // C. SLEEK METALLIC SAUCER DISC
    const hullGrad = ctx.createLinearGradient(0, -16, 0, 16);
    hullGrad.addColorStop(0, '#f8fafc');
    hullGrad.addColorStop(0.4, '#e2e8f0');
    hullGrad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 115, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // D. ROTATING CARNIVAL RIM LIGHTS ("ĐĨA QUAY" EFFECT!)
    const lightColors = [
      '#f59e0b', '#06b6d4', '#f43f5e', '#84cc16', 
      '#8b5cf6', '#f97316', '#3b82f6', '#10b981',
      '#ec4899', '#eab308', '#0ea5e9', '#a855f7'
    ];
    const lightAngle = saucerLightsAngleRef.current;

    for (let i = 0; i < 12; i++) {
      const angle = lightAngle + (i / 12) * Math.PI * 2;
      const lx = Math.cos(angle) * 105;
      const ly = Math.sin(angle) * 18;

      if (Math.sin(angle) > -0.3) {
        const color = lightColors[i % lightColors.length];

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // E. UNDERBELLY EMITTER LENS
    const emitterGrad = ctx.createRadialGradient(0, 7, 2, 0, 7, 22);
    emitterGrad.addColorStop(0, '#ffffff');
    emitterGrad.addColorStop(0.4, '#38bdf8');
    emitterGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = emitterGrad;
    ctx.beginPath();
    ctx.ellipse(0, 7, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
