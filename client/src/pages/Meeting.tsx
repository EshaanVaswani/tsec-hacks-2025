import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon as ArrowClockwise, Camera, CameraOff } from 'lucide-react';
import Peer from 'peerjs';

const PRE = "Stream";
const SUF = "Works";

export default function StreamWorks() {
  const [showMeetArea, setShowMeetArea] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [screenSharing, setScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const currentPeerRef = useRef<Peer.MediaConnection | null>(null);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const createRoom = () => {
    if (roomNumber.trim() === '') {
      setNotification({ message: 'Please enter room number', type: 'error' });
      return;
    }
    const roomId = PRE + roomNumber + SUF;
    peerRef.current = new Peer(roomId);

    peerRef.current.on('open', (id) => {
      setShowMeetArea(true);
      getUserMedia();
      setNotification({ message: 'Waiting for peer to join.', type: 'warning' });
    });

    peerRef.current.on('call', (call) => {
      call.answer(localStreamRef.current!);
      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });
      currentPeerRef.current = call;
    });
  };

  const joinRoom = () => {
    if (roomNumber.trim() === '') {
      setNotification({ message: 'Please enter room number', type: 'error' });
      return;
    }
    const roomId = PRE + roomNumber + SUF;
    setShowMeetArea(true);
    peerRef.current = new Peer();

    peerRef.current.on('open', (id) => {
      getUserMedia(() => {
        setNotification({ message: 'Joining peer', type: 'success' });
        const call = peerRef.current!.call(roomId, localStreamRef.current!);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
        currentPeerRef.current = call;
      });
    });
  };

  const getUserMedia = (callback?: () => void) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        if (callback) callback();
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err);
      });
  };

  const setRemoteStream = (stream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play();
    }
  };

  const startScreenShare = () => {
    if (screenSharing) {
      stopScreenSharing();
      return;
    }
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
          stopScreenSharing();
        };
        if (currentPeerRef.current) {
          const sender = currentPeerRef.current.peerConnection.getSenders().find(s => s.track?.kind === videoTrack.kind);
          sender?.replaceTrack(videoTrack);
          setScreenSharing(true);
        }
      })
      .catch((err) => {
        console.error('Error sharing screen', err);
      });
  };

  const stopScreenSharing = () => {
    if (!screenSharing) return;
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (currentPeerRef.current && videoTrack) {
      const sender = currentPeerRef.current.peerConnection.getSenders().find(s => s.track?.kind === videoTrack.kind);
      sender?.replaceTrack(videoTrack);
    }
    setScreenSharing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow-md sticky top-0">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-indigo-600">StreamWorks</h1>
        </div>
      </nav>

      {notification.message && (
        <div className={`container mx-auto mt-4 p-4 rounded-md ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' :
          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {!showMeetArea ? (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-4xl font-bold text-white mb-4">Create or Join Meeting</h2>
                <ul className="text-white text-lg list-disc list-inside">
                  <li>No authentication required</li>
                  <li>Peer to peer in Real Time</li>
                  <li>Screen Sharing is available</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <label htmlFor="room-input" className="block text-sm font-medium text-gray-700 mb-1">
                      Room ID
                    </label>
                    <input
                      id="room-input"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter Room ID"
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 mb-3"
                    onClick={createRoom}
                  >
                    Create Room
                  </button>
                  <button
                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition duration-300"
                    onClick={joinRoom}
                  >
                    Join a room
                  </button>
                  <hr className="my-4" />
                  <p className="text-sm text-gray-500">
                    By clicking Sign up, you agree to the <a href="terms.html" className="text-indigo-600 hover:underline">terms of use</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Room Number {roomNumber}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-lg font-semibold mb-2">Remote Video</p>
                <video ref={remoteVideoRef} className="w-full bg-gray-200 rounded-lg" playsInline></video>
              </div>
              <div>
                <p className="text-lg font-semibold mb-2">Local Video</p>
                <video ref={localVideoRef} className="w-full bg-gray-200 rounded-lg" playsInline muted></video>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 flex items-center"
                onClick={() => window.location.reload()}
              >
                <ArrowClockwise className="mr-2" /> Reload
              </button>
              <button 
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center"
                onClick={startScreenShare}
              >
                <Camera className="mr-2" /> {screenSharing ? 'Stop' : 'Start'} Screen Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
