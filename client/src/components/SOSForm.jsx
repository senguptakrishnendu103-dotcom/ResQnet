import React, { useState, useRef } from 'react';
import { Camera, Upload, Mic, Trash2, MapPin, Loader2, AlertTriangle } from 'lucide-react';

export default function SOSForm({ form, setForm, onSubmit, isAnalyzing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCam, setShowCam] = useState(false);

  const handleCameraOpen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setShowCam(true);
    } catch {
      alert('Camera access denied');
    }
  };

  const handleCapture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    setForm({ ...form, media: canvasRef.current.toDataURL('image/jpeg') });
    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setShowCam(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, media: reader.result });
    reader.readAsDataURL(file);
  };

  const [isRecording, setIsRecording] = useState(false);

  const handleVoice = () => {
    try {
      const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      setIsRecording(true);
      rec.onresult = (ev) => {
        setForm({ ...form, description: ev.results[0][0].transcript });
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch {
      alert('Speech recognition not supported');
      setIsRecording(false);
    }
  };

  return (
    <>
      <div className="sos-form-card animate-slide-up">
        <div className="sos-form-header">
          <AlertTriangle size={28} className="sos-header-icon" />
          <div>
            <h2 className="sos-form-title">Initiate SOS</h2>
            <p className="sos-form-subtitle">Report an emergency situation</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="sos-form">
          {/* Location */}
          <div className="sos-input-group">
            <MapPin size={18} className="sos-input-icon" />
            <input
              required
              className="sos-input"
              placeholder="Exact Location / Landmark"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            {form.coords && (
              <span className="sos-coords-badge">
                GPS Active
              </span>
            )}
          </div>

          {/* Media tools */}
          <div className="sos-tools">
            <button type="button" onClick={handleCameraOpen} className="sos-tool-btn camera">
              <Camera size={22} />
              <span>Camera</span>
            </button>
            <label className="sos-tool-btn upload">
              <Upload size={22} />
              <span>Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button type="button" onClick={handleVoice} className={`sos-tool-btn voice ${isRecording ? 'recording' : ''}`}>
              <Mic size={22} style={isRecording ? {color: '#ef4444'} : {}} />
              <span style={isRecording ? {color: '#ef4444', fontWeight: 'bold'} : {}}>{isRecording ? 'Listening...' : 'Voice SOS'}</span>
            </button>
          </div>

          {/* Camera overlay */}
          {showCam && (
            <div className="camera-overlay">
              <video ref={videoRef} autoPlay className="camera-preview" />
              <button type="button" onClick={handleCapture} className="camera-capture-btn">
                Capture Image
              </button>
              <button
                type="button"
                onClick={() => {
                  videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
                  setShowCam(false);
                }}
                className="camera-cancel-btn"
              >
                Cancel
              </button>
            </div>
          )}
          <canvas ref={canvasRef} width="640" height="480" className="hidden" />

          {/* Description */}
          <textarea
            rows="3"
            className="sos-textarea"
            placeholder="Describe the crisis situation in any language..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          {/* Media preview */}
          {form.media && (
            <div className="sos-media-preview animate-fade-in">
              <img src={form.media} alt="Attached" className="sos-media-img" />
              <button
                type="button"
                onClick={() => setForm({ ...form, media: null })}
                className="sos-media-remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isAnalyzing} className="sos-submit-btn">
            {isAnalyzing ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>AI Analyzing Crisis...</span>
              </>
            ) : (
              <>
                <AlertTriangle size={24} />
                <span>DISPATCH SOS</span>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
