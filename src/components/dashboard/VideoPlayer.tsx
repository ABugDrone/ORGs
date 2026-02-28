import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface VideoPlayerProps {
  src: string;
  type: "file" | "google-drive";
  onError?: (error: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        console.error("Play error:", err);
        handleError("Failed to play video");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
        toast.error("Failed to enter fullscreen mode");
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleError = (message: string) => {
    setError(message);
    onError?.(message);
    toast.error(message);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const mediaError = video.error;

    let message = "Failed to play video. ";

    if (mediaError) {
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message += "Playback was aborted.";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message += "Network error occurred. Please check your connection.";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message += "Video format not supported or file is corrupted.";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message += "Video source not found or format not supported.";
          break;
        default:
          message += "Unknown error occurred.";
      }
    }

    handleError(message);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // For Google Drive videos, use iframe
  if (type === "google-drive") {
    // Extract file ID from Google Drive URL
    const fileIdMatch = src.match(/\/d\/([^/]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;
    
    if (!fileId) {
      return (
        <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-muted-foreground">Invalid Google Drive URL</p>
          </div>
        </div>
      );
    }

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden border">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      </div>
    );
  }

  // For direct video files
  if (error) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
          <p className="text-sm font-medium text-foreground mb-1">Video Error</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative group">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video"
          onError={handleVideoError}
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress Bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="mb-3"
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              {/* Time */}
              <span className="text-xs text-white font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
