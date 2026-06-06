import React, { useEffect, useRef, useState, useContext } from 'react'
import io from "socket.io-client"
import styles from "../Css files/videomeet.module.css"
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { Badge, colors, IconButton, Modal, TextField } from '@mui/material';
import { Button } from '@mui/material';
import { AuthContext } from '../../context/authcontext'
import { useParams, useSearchParams } from 'react-router-dom'
import { jwtDecode } from "jwt-decode"


let server_url = "https://192.168.1.5:3000/"
var connections = {}
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:your-turn-server.com:3478",
      username: "user",
      credential: "pass"
    }
  ]
}

let silence = () => {
  let ctx = new AudioContext()
  let oscillator = ctx.createOscillator()
  let dst = oscillator.connect(ctx.createMediaStreamDestination())
  oscillator.start()
  ctx.resume()
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

export default function VideoMeet() {
  const socketRef = useRef()
  const socketIdRef = useRef()
  const localVideoRef = useRef()
  const roomIdRef = useRef()
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
  const [tokenValue, setTokenValue] = useState(true)
  const token = localStorage.getItem('token')
  const currentVideoTrackRef = useRef(null)
  const blackCanvasRef = useRef(null)
  const blackIntervalRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const videoRef = useRef([])
  const [videos, setVideos] = useState([])
  const { handleCreateMeeting } = useContext(AuthContext)
  const { meetingCode } = useParams()
  const [searchParams] = useSearchParams()
  const isCreating = searchParams.get('type') === 'create';
  const gridRef = useRef(null)

  useEffect(() => {
    const roomId = window.location.pathname.split('/')[1]

    if (roomId) {

      getPermissions()
    }
  }, [])

  useEffect(() => {
    if (token === null) {
      setTokenValue(false);
    }
  }, [token])




  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    return async() => {
      console.log("Video call page unmounted");

      if (window.localStream) {
        window.localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      window.localStream = null;
      for (let id in connections) {
        connections[id]?.close();
        delete connections[id];
      }

      socketRef.current?.disconnect();
    };
  }, []);
  useEffect(()=>{
    return ()=>{
      handleCallEnd
    }
  },[])
  let black = ({ width = window.innerWidth, height = window.innerHeight } = {}) => {
    if (blackIntervalRef.current) {
      clearInterval(blackIntervalRef.current)
    }
    const canvas = document.createElement("canvas")
    canvas.width = width,
      canvas.height = height
    let ctx = canvas.getContext("2d")

    const draw = () => {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, width, height)
    }
    draw()
    blackIntervalRef.current = setInterval(draw, 1000 / 30)
    blackCanvasRef.current = canvas
    let stream = canvas.captureStream(30)

    return canvas.captureStream(30).getVideoTracks()[0]
  }
  // ─── Permissions ───────────────────────────────────────────────────────────

  const getPermissions = async () => {
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
    }
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

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
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
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable
      })
      setVideo(videoAvailable)
      setAudio(audioAvailable)
      currentVideoTrackRef.current = stream.getVideoTracks()[0]

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
        .getUserMedia({
          audio: audio && audioAvailable,
          video: video && videoAvailable
        })
        .then(getUserMediaSuccess)
        .catch(console.error)
    } else {
      try {
        if (window.localStream) {
          window.localStream.getTracks().forEach(track => track.stop())
        }

        const blackSilence = () => new MediaStream([black(), silence()])
        const stream = blackSilence()

        window.localStream = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        for (let id in connections) {
          if (id === socketIdRef.current) continue

          stream.getTracks().forEach(track => {
            const sender = connections[id]
              .getSenders()
              .find(s => s.track && s.track.kind === track.kind)

            if (sender) {
              sender.replaceTrack(track)
            } else {
              connections[id].addTrack(track, stream)
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
  const replaceTrackForAllPeers = async (newTrack) => {
    for (let id in connections) {
      if (id === socketIdRef.current) continue

      const sender = connections[id]
        .getSenders()
        .find(s => s.track && s.track.kind === newTrack.kind)

      if (sender) {
        await sender.replaceTrack(newTrack)
      } else if (window.localStream) {
        connections[id].addTrack(newTrack, window.localStream)
      }
    }
  }
  const updateLocalVideoTrack = async (newTrack) => {
    const oldVideoTrack = currentVideoTrackRef.current

    const audioTracks = window.localStream
      ? window.localStream.getAudioTracks()
      : []

    window.localStream = new MediaStream([...audioTracks, newTrack])
    currentVideoTrackRef.current = newTrack

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
      localVideoRef.current.srcObject = window.localStream
      await localVideoRef.current.play().catch(() => { })
    }

    if (oldVideoTrack && oldVideoTrack !== newTrack) {
      oldVideoTrack.stop()
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
        let blackSilence = () => new MediaStream([black(), silence()])
        window.localStream = blackSilence()
        localVideoRef.current.srcObject = window.localStream
      }
    })
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia()
    }
  }, [screen])

  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: video, audio: audio })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch((err) => console.log(err))
      }
    }
  }


  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(tracks => tracks.stop())

    } catch (e) {
      console.log(e)
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;


    for (let id in connections) {
      if (id === socketIdRef.current) continue

      stream.getTracks().forEach(track => {
        const senders = connections[id].getSenders();
        const sender = senders.find(s => s.track && s.track.kind === track.kind)
        if (sender) {
          sender.replaceTrack(track)
        } else {
          connections[id].addTrack(track, stream)
        }



        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description).then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }))
          })
        }).catch(console.error)
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false)
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (err) { console.log(err) }
    })
  }

  // ─── Socket + WebRTC ───────────────────────────────────────────────────────

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url)

    socketRef.current.on('signal', getMessageFromServer)

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', meetingCode)
      roomIdRef.current = meetingCode
      socketIdRef.current = socketRef.current.id

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
    socketRef.current.on('chat-history', (chatHistory) => {
      setMessages(chatHistory.map(m => ({
        sender: m.sender,
        data: m.data
      })))
    })

    socketRef.current.on('user-joined', (id, clients) => {
      clients.forEach(socketListId => {
        if (socketListId === socketIdRef.current) return
        if (connections[socketListId]) return

        // Create a new symmetric peer connection for every peer
        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

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


        if (window.localStream) {
          window.localStream.getTracks().forEach(track => {
            const senders = connections[socketListId].getSenders()
            const alreadyAdded = senders.find(s => s.track === track)
            if (!alreadyAdded) {
              connections[socketListId].addTrack(track, window.localStream)
            }
          })
        }

        if (!window.localStream) {
          let blackSilence = () => new MediaStream([black(), silence()])
          window.localStream = blackSilence()
          localVideoRef.current.srcObject = window.localStream

          window.localStream.getTracks().forEach(track => {
            connections[socketListId].addTrack(track, window.localStream)
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
    console.log(data, sender)
    setMessages(prev => [...prev, { sender, data }])
    if (socketIdSender !== socketIdRef.current) {
      setNewMessage(prev => prev + 1)
    }
  }

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit('chat-message', message, username, roomIdRef.current)
      console.log(message, username, roomIdRef.current)
      setMessages(prev => [...prev, { sender: username, data: message }])
      setMessage("")
    }
  }
  const handleVideo = async () => {
    if (video) {
      const blackTrack = black()

      await replaceTrackForAllPeers(blackTrack)
      await updateLocalVideoTrack(blackTrack)

      setVideo(false)
      return
    }

    if (blackIntervalRef.current) {
      clearInterval(blackIntervalRef.current)
      blackIntervalRef.current = null
    }

    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })

    const cameraTrack = cameraStream.getVideoTracks()[0]

    await replaceTrackForAllPeers(cameraTrack)
    await updateLocalVideoTrack(cameraTrack)

    setVideo(true)
  }
  const handleAudio = () => {
    if (audio) {
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach(tracks => { tracks.enabled = false })
        setAudio(false)
      }
    } else {
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach(tracks => { tracks.enabled = true })
        setAudio(true)
      }
    }
  }
  const handleScreen = () => {
    setScreen(!screen)
  }
  const handleModal = () => {
    setModal(!modal)
    setNewMessage(0)  // ← reset badge count when opening

  }
  const handleCallEnd = () => {
    document.querySelectorAll('video').forEach(element => {
      if (element.srcObject) {
        element.srcObject.getTracks().forEach(tracks => tracks.stop())
        window.localStream = null
      }
    })
    if (window.localStream) {
      window.localStream.getTracks().forEach(tracks => tracks.stop())
      window.localStream = null
    }
    for (let id in connections) {
      connections[id].close()
      delete connections[id]
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    window.location.href = "/"

  }
  let responsive = {
    maxWidth: "768px"
  }
  let containerWidth = gridRef.current?.offsetWidth ?? 0
  const isMobile = containerWidth <= 576
  const videoGridConfig = () => {
    let totalVideos = videos.length + 1;
    if (isMobile) {
      // ✅ mobile — max 2 columns
      const rows = totalVideos === 1 ? 1 : 2
      const cols = Math.ceil(totalVideos / rows)
      return {
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`
      }
    }
    if (totalVideos <= 3) {
      return {
        gridTemplateColumns: `repeat(${totalVideos},1fr)`,
        gridTemplateRows: '1fr'
      }
    } else if (3 < totalVideos && totalVideos <= 6) {
      let cols = Math.ceil(totalVideos / 2)
      return {
        gridTemplateColumns: `repeat(${cols},1fr)`,
        gridTemplateRows: '1fr 1fr'
      }
    }
    else {
      let cols = Math.ceil(totalVideos / 3)
      return {
        gridTemplateColumns: `repeat(${cols},1fr)`,
        gridTemplateRows: '1fr 1fr 1fr'
      }
    }
  }
  const videoModel = {
    if(isMobile = false) {

      width: modal ? "70%" : "100%"
    }
  }
  const chatModel = {
    display: modal ? "flex" : "none"
  }

  // ─── VideoPlayer sub-component ─────────────────────────────────────────────

  const VideoPlayer = ({ stream }) => {
    const ref = useRef()
    useEffect(() => {
      if (ref.current && stream) {
        ref.current.srcObject = stream
      }
    }, [stream])
    return <video ref={ref} autoPlay playsInline />
  }

  // ─── Connect handler ───────────────────────────────────────────────────────

  const connect = async () => {
    setAskForUsername(false)
    getMedia()
    if (token) {
      const decoded = jwtDecode(token)
      setUsername(decoded.name)

      if (isCreating) {
        await handleCreateMeeting(meetingCode)
      }

    }
  }


  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {askForUsername ? (
        tokenValue ?
          <div>
            <video ref={localVideoRef} muted autoPlay style={{ width: 300 }} />
            <br />
            <button onClick={connect}>Enter</button>
          </div>
          :
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
        <div className={styles.mainContainer}>
          <div className={styles.videosContainer}>
            <div className={styles.conferenceView} ref={gridRef} style={{ ...videoModel, ...videoGridConfig() }}>
              {videos.map(v => (
                <div className={styles.otherVideos} key={v.socketId}>
                  <VideoPlayer stream={v.stream} />
                </div>
              ))}
              <div className={styles.userVideoContainer}>
                <video ref={localVideoRef} className={styles.userVideo} muted autoPlay />
              </div>
            </div>

            <div className={styles.messagebox} style={chatModel}>
              <h2>Message Box</h2>
              <div className={styles.messages}>
                {messages.map((m, i) => (
                  <React.Fragment key={i}>
                    <span style={{
                      alignSelf: m.sender === username
                        ? 'flex-end'
                        : 'flex-start',
                      borderRadius: m.sender === username ?
                        "20px 20px 2px 20px"
                        : "20px 20px 20px 2px"
                    }}
                    ><strong>{m.sender}</strong><br /> {m.data}</span>
                    <br />
                  </React.Fragment>

                ))}
              </div>
              <div className={styles.sendingMessages}>
                <input type="text" value={message} onChange={(e) => { setMessage(e.target.value) }} />
                <button onClick={sendMessage}>Send</button>
              </div>

            </div>

          </div>
          <div className={styles.videoCallbuttons}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable ?
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton> : <></>
            }
            <IconButton onClick={handleCallEnd} style={{ color: "red" }}>
              {<CallEndIcon />}
            </IconButton>
            <Badge badgeContent={newMessage} max={999} color='secondary'>
              <IconButton onClick={handleModal} style={{ color: "white" }}>
                {<ChatIcon />}
              </IconButton>
            </Badge>
          </div>

        </div>
      )}
    </div>
  )
}
