'use client'
import { AppShell, Stack, Text, Button } from '@mantine/core';
import {
  IconMenu2, IconEraser,
  IconArrowsSplit,
  IconWaveSine, IconKeyframes,
  IconScissors,
  IconPuzzle, IconMicrophone,
  IconDisc, IconHelp
} from '@tabler/icons-react';

import { GB } from 'country-flag-icons/react/3x2';

import React, { useState, useEffect, useRef, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

export default function AudioCutterLayout({ children }) {
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [playing, setPlaying] = useState(false);

  const [volume, setVolume] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [duration, setDuration] = useState(0);

  const [isAudioReady, setIsAudioReady] = useState(false);
  const waveformRef = useRef(null);
  const timelineRef = useRef(null);

  const regionsRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    return () => {
      if (waveSurfer) {
        waveSurfer.destroy();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (waveformRef.current && !waveSurfer) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#A8DBA8",
        progressColor: "#3B8686",
        cursorColor: "#FFBB00",
        responsive: true,
        backend: 'WebAudio',
        audioContext: audioContextRef.current,
      });

      const timeline = TimelinePlugin.create({
        container: timelineRef.current,
      });

      const regions = RegionsPlugin.create();

      ws.registerPlugin(timeline);
      ws.registerPlugin(regions);

      setWaveSurfer(ws);

      regionsRef.current = regions;

      ws.on("ready", () => {
        setDuration(ws.getDuration());
        setIsAudioReady(true);

        if (regionsRef.current) {
          regionsRef.current.addRegion({
            start: 1,
            end: 5,
            color: "rgba(0, 123, 255, 0.3)",
            drag: true,
            resize: true,
          });
        }

        setPlaying(true);
        ws.play();
      });

      ws.on("error", (error) => {
        console.error("WaveSurfer error:", error);
        setIsAudioReady(false);
      });
    }
  }, [waveSurfer]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file && waveSurfer) {
      setIsAudioReady(false);
      setAudioFile(file);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedData);
        
        const objectUrl = URL.createObjectURL(file);
        waveSurfer.load(objectUrl);
      } catch (error) {
        console.error("Error decoding audio data:", error);
      }
    }
  }, [waveSurfer]);

  const handlePlayPause = useCallback(() => {
    if (waveSurfer) {
      waveSurfer.playPause();
      setPlaying(!playing);
    }
  }, [waveSurfer, playing]);

  const handleReload = useCallback(() => {
    if (waveSurfer) {
      waveSurfer.stop();
      waveSurfer.play();
      setPlaying(true);
    }
  }, [waveSurfer]);

  useEffect(() => {
    if (waveSurfer) waveSurfer.setVolume(volume);
  }, [volume, waveSurfer]);

  useEffect(() => {
    if (waveSurfer && waveSurfer.isReady) waveSurfer.zoom(zoom);
  }, [zoom, waveSurfer]);

  const handleTrimAudio = useCallback(() => {
    if (!isAudioReady || !audioBuffer) {
      console.error("Audio is not ready for trimming.");
      return;
    }

    if (waveSurfer && regionsRef.current) {
      const regions = regionsRef.current.getRegions();

      if (regions.length === 0) {
        console.error("No regions available for trimming.");
        return;
      }

      const region = regions[0];
      if (region) {
        const start = region.start;
        const end = region.end;

        const newBuffer = audioContextRef.current.createBuffer(
          audioBuffer.numberOfChannels,
          Math.floor((end - start) * audioBuffer.sampleRate),
          audioBuffer.sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const startIndex = Math.floor(start * audioBuffer.sampleRate);
          const endIndex = Math.floor(end * audioBuffer.sampleRate);
          const trimmedData = channelData.slice(startIndex, endIndex);

          newBuffer.copyToChannel(trimmedData, channel);
        }

        const offlineAudioContext = new OfflineAudioContext(newBuffer.numberOfChannels, newBuffer.length, newBuffer.sampleRate);
        const source = offlineAudioContext.createBufferSource();
        source.buffer = newBuffer;
        source.connect(offlineAudioContext.destination);
        source.start();

        offlineAudioContext.startRendering().then((renderedBuffer) => {
          const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
          const blobUrl = URL.createObjectURL(wavBlob);

          waveSurfer.load(blobUrl);
          setAudioBuffer(newBuffer);
        }).catch((err) => {
          console.error('Rendering failed: ', err);
        });
      }
    }
  }, [isAudioReady, audioBuffer, waveSurfer]);

  function bufferToWave(abuffer, len) {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    // write WAVE header
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    // write interleaved data
    for (let i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  return (
    <AppShell
      navbar={{
        width: 60,
        breakpoint: 'sm',
        collapsed: { mobile: false, desktop: false },
      }}
    >
      <AppShell.Navbar p="xs">
        <Stack justify="space-between" h="100%">
          <Stack>
            <NavbarIcon icon={IconMenu2} />
            <NavbarIcon icon={IconEraser} />
            <NavbarIcon icon={IconArrowsSplit} />
            <NavbarIcon icon={IconWaveSine} />
            <NavbarIcon icon={IconKeyframes} />
            <NavbarIcon icon={IconScissors} />
            <NavbarIcon icon={IconPuzzle} />
            <NavbarIcon icon={IconMicrophone} />
            <NavbarIcon icon={IconDisc} />
          </Stack>
          <Stack>
            <NavbarIcon icon={IconHelp} />
            <GB style={{ width: '24px', height: '24px' }} />
          </Stack>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack align="center" justify="center" h="100vh" spacing="xl">
          <Text fz={48} fw={700}>Audio Cutter</Text>
          <Text fz={18} c="dimmed">Editor to trim audio</Text>

          <input type="file" accept="audio/*" onChange={handleFileChange} />
          <div ref={waveformRef} style={{ width: "100%", height: "200px", margin: "20px 0" }}></div>
          <div ref={timelineRef} style={{ width: "100%", height: "50px" }}></div>

          <div className="controls">
            <Button variant="filled" color="blue" onClick={handlePlayPause} disabled={!isAudioReady}>{playing ? "Pause" : "Play"}</Button>
            <Button variant="filled" color="blue" onClick={handleReload} disabled={!isAudioReady}>Reload</Button>
            <Button variant="filled" color="blue" onClick={handleTrimAudio} disabled={!isAudioReady}>Trim Audio</Button>
          </div>

          {isAudioReady && (
            <div className="sliders">
              <div>
                <label>Volume</label>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
              </div>
              <div>
                <label>Zoom</label>
                <input type="range" min="50" max="1000" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
              </div>
            </div>
          )}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}

function NavbarIcon({ icon: Icon }) {
  return <Icon size={24} style={{ cursor: 'pointer' }} />;
}