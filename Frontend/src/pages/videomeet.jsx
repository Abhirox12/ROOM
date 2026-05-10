import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client"

let server_url = "http://localhost:3000/"
var connections = {}
const peerConfigConnections = {
  "iceServers": [{
    "urls": "stun:stun.l.google.com:19302"
  }]
}

export default function VideoMeet() {
  const socketRef = useRef()
  const socketIdRef = useRef()
  const localVideoRef = useRef()

  const [videoAvailable, setVideoAvailable] = useState(true)
  const [audioAvailable, setAudioAvailable] = useState(true)
  const [screenAvailable, setScreenAvailable] = useState(false)
  const [video, setVideo] = useState(false)
  const [audio, setAudio] = useState(false)
  const [screen, setScreen] = useState(false)
  const [modal, setModal] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState(0)
  const [askForUsername, setAskForUsername] = useState(true)
  const [username, setUsername] = useState("")   

  const videoRef = useRef([])
  const [videos, setVideos] = useState([])

  useEffect(() => {
    getPermissions()
  }, [])

  useEffect(() => {
    if (video !== undefined && audio !== undefined && socketRef.current) {
      getUserMedia()
    }
  }, [audio, video])

  // ─── Permissions ───────────────────────────────────────────────────────────

  const getPermissions = async () => {
    try {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setVideoAvailable(true)
      } catch {
        setVideoAvailable(false)
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioAvailable(true)
      } catch {
        setAudioAvailable(false)
      }

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia)

      // Show preview before joining
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable
      })
      window.localStream = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("getPermissions error:", err)
    }
  }

  // ─── Get user media then connect ───────────────────────────────────────────

  const getMedia = async () => {
    setVideo(videoAvailable)
    setAudio(audioAvailable)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable
      })
      window.localStream = stream
      localVideoRef.current.srcObject = stream
      connectToSocketServer()
    } catch (err) {
      console.error("getMedia error:", err)
    }
  }

  // ─── Toggle tracks (mic / camera) ──────────────────────────────────────────

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ audio, video })
        .then(getUserMediaSuccess)
        .catch(console.error)
    } else {
      try {
        const tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) {
        console.error(e)
      }
    }
  }

  const getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop())
      }
    } catch (e) {
      console.error(e)
    }

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) continue
      
      stream.getTracks().forEach(track => {
        const senders = connections[id].getSenders()  
        const sender = senders.find(s => s.track && s.track.kind === track.kind)
        if (sender) {
          sender.replaceTrack(track)
        } else {
          connections[id].addTrack(track, stream)    
        }
      })

      connections[id]
        .createOffer()
        .then(description => connections[id].setLocalDescription(description))
        .then(() => {
          socketRef.current.emit('signal', id, JSON.stringify({
            sdp: connections[id].localDescription
          }))
        })
        .catch(console.error)
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        setScreen(false)
        try {
          localVideoRef.current.srcObject.getTracks().forEach(t => t.stop())
        } catch (e) {
          console.error(e)
        }
      }
    })
  }

  // ─── Socket + WebRTC ───────────────────────────────────────────────────────

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on('signal', getMessageFromServer)

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href)
      socketIdRef.current = socketRef.current.id

      // ✅ FIX 6: chat listener was commented out — restored
      socketRef.current.on('chat-message', addMessage)

      socketRef.current.on('user-left', (id) => {
        // Clean up the peer connection
        if (connections[id]) {
          connections[id].close()
          delete connections[id]
        }
        setVideos(prev => prev.filter(v => v.socketId !== id))
      })
    })

    socketRef.current.on('user-joined', (id, clients) => {
      clients.forEach(socketListId => {
        if (socketListId === socketIdRef.current) return
        if (connections[socketListId]) return

        // Create a new symmetric peer connection for every peer
        connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

        // ICE candidates — symmetric for both sides
        connections[socketListId].onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit('signal', socketListId,
              JSON.stringify({ ice: event.candidate }))
          }
        }

        connections[socketListId].ontrack = (event) => {
          const stream = event.streams[0]
          if (!stream) return

          const videoExists = videoRef.current.find(v => v.socketId === socketListId)

          if (videoExists) {
            setVideos(prev => {
              const updated = prev.map(v =>
                v.socketId === socketListId ? { ...v, stream } : v
              )
              videoRef.current = updated
              return updated
            })
          } else {
            const newVideo = { socketId: socketListId, stream, autoPlay: true, playsInline: true }
            setVideos(prev => {
              if (prev.find(v => v.socketId === socketListId)) return prev
              const updated = [...prev, newVideo]
              videoRef.current = updated
              return updated
            })
          }
        }

        // ✅ FIX 7: use addTrack() instead of deprecated addStream()
        if (window.localStream) {
          window.localStream.getTracks().forEach(track => {
            const senders = connections[socketListId].getSenders()
            const alreadyAdded = senders.find(s => s.track === track)
            if (!alreadyAdded) {
              connections[socketListId].addTrack(track, window.localStream)
            }
          })
        }

        // Only the newly-joined user creates offers to all existing peers
        if (id === socketIdRef.current) {
          connections[socketListId]
            .createOffer()
            .then(description => connections[socketListId].setLocalDescription(description))
            .then(() => {
              socketRef.current.emit('signal', socketListId,
                JSON.stringify({ sdp: connections[socketListId].localDescription }))
            })
            .catch(console.error)
        }
      })
    })
  }

  const getMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message)

    if (fromId === socketIdRef.current) return

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (
            signal.sdp.type === 'offer' &&
            connections[fromId].signalingState === 'have-remote-offer'
          ) {
            connections[fromId]
              .createAnswer()
              .then(description => connections[fromId].setLocalDescription(description))
              .then(() => {
                socketRef.current.emit('signal', fromId,
                  JSON.stringify({ sdp: connections[fromId].localDescription }))
              })
              .catch(console.error)
          }
        })
        .catch(console.error)
    }

  
    if (signal.ice && connections[fromId] && connections[fromId].remoteDescription) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch(console.error)
    }
  }

  // ─── Chat ──────────────────────────────────────────────────────────────────

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }])
    if (socketIdSender !== socketIdRef.current) {
      setNewMessage(prev => prev + 1)
    }
  }

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit('chat-message', message, username)
      setMessage("")
    }
  }

  // ─── VideoPlayer sub-component ─────────────────────────────────────────────

  const VideoPlayer = ({ stream }) => {
    const ref = useRef()
    useEffect(() => {
      if (ref.current && stream) {
        ref.current.srcObject = stream
      }
    }, [stream])
    return <video ref={ref} autoPlay playsInline muted width="300" height="200" />
  }

  // ─── Connect handler ───────────────────────────────────────────────────────

  const connect = () => {
    setAskForUsername(false)
    getMedia()
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {askForUsername ? (
        <div>
          <h1>Enter Lobby</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button onClick={connect}>Enter</button>
          <br />
          <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
        </div>
      ) : (
        <div>
          <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {videos.map(v => (
              <div key={v.socketId}>
                <VideoPlayer stream={v.stream} />
              </div>
            ))}
          </div>

         
          <div>
            <div>
              {messages.map((m, i) => (
                <p key={i}><strong>{m.sender}:</strong> {m.data}</p>
              ))}
            </div>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}