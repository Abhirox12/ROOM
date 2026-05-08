import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client"


let server_url = "http://localhost:3000/"
var connections = {}
const peerConfigConnections = {
  "iceServers": [{
    "urls": "stun:stun.l.google.com:19302"
  }]
}
export default function videomeet() {
  var socketRef = useRef()
  let socketIdRef = useRef()
  let localVideoRef = useRef()


  let [videoAvailable, setVideoAvailable] = useState(true)
  let [audioAvailable, setAudioAvailable] = useState(true)
  let [screenAvailable, setScreenAvailable] = useState()
  let [video, setVideo] = useState(false)
  let [audio, setAudio] = useState(false)
  let [screen, setScreen] = useState()
  let [modal, setModal] = useState();
  let [message, setMessage] = useState("");
  let [messages, setMessages] = useState([]);
  let [newMessage, setNewMessage] = useState(0)
  let [askForUsername, setAskforUsername] = useState("")
  let [username, setUsername] = ("")
  const videoRef = useRef([])
  let [videos, setVideos] = useState([])


  useEffect(() => {
    console.log("hello")
    getpermissions()
  }, [])
  useEffect(() => {
    if ((video !== undefined) && (audio !== undefined)) {
      getUserMedia()
      console.log(`setstate has ${video} and ${audio}`)
    }
  }, [audio, video])
  // let getMedia = () => {
  //   setVideo(videoAvailable);
  //   setAudio(audioAvailable);
  //   connectToSocketServer()
  // }

  let getMedia = async () => {

    setVideo(videoAvailable)
    setAudio(audioAvailable)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoAvailable,
      audio: audioAvailable
    })

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    connectToSocketServer()
  }

  let connectToSocketServer = () => {
    console.log("CONNECT SOCKET RUNNING")
    socketRef.current = io.connect(server_url, { secure: false })
    socketRef.current.on("signal", getMessagefromServer)


    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href)
      console.log("joined call")
      socketIdRef.current = socketRef.current.id
      // socketRef.current.on  ("chat-message", addMessage)
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })
    })
    socketRef.current.on('user-joined', (id, clients) => {
      console.log("joined call")
      console.log("JOINED ID:", id)
      console.log("MY ID:", socketIdRef.current)
      console.log(clients)
      clients.forEach((socketListId) => {
        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
        connections[socketListId].onicecandidate = (event) => {
          if (event.candidate !== null) {
            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
          }
        }
    connections[socketListId].ontrack = (event) => {

  console.log("TRACK EVENT:", event)

  const stream = event.streams[0]

  if (!stream) return

  let videoExist = videoRef.current.find(
    video => video.socketId === socketListId
  )

  if (videoExist) {

    setVideos(videos => {
      const updatedVideos = videos.map(video =>
        video.socketId === socketListId
          ? { ...video, stream }
          : video
      )

      videoRef.current = updatedVideos
      return updatedVideos
    })

  } else {

    let newVideo = {
      socketId: socketListId,
      stream,
      autoPlay: true,
      playsInline: true
    }

    setVideos(videos => {

      const alreadyExists = videos.find(
        video => video.socketId === socketListId
      )

      if (alreadyExists) return videos

      const updatedVideos = [...videos, newVideo]

      videoRef.current = updatedVideos

      return updatedVideos
    })
  }
}



        if ((window.localStream !== null) && (window.localStream !== undefined)) {
          console.log(
            "ADDING STREAM TO:",
            socketListId,
            connections[socketListId].getLocalStreams().length
          )
          if (
            connections[socketListId].getLocalStreams().length === 0
          ) {
            connections[socketListId].addStream(window.localStream);
          }
        }
        // else {
        //   let blackSilence = (...args) => { [black(...args), silence()] }
        //   window.localStream = blackSilence()
        //   connections[socketListId].addStream(window.localStream)
        // }


        if (id === socketIdRef.current) {

          connections[socketListId]
            .createOffer()
            .then((description) => {

              connections[socketListId]
                .setLocalDescription(description)
                .then(() => {

                  socketRef.current.emit(
                    'signal',
                    socketListId,
                    JSON.stringify({
                      sdp: connections[socketListId].localDescription
                    })
                  )

                })

            })
            .catch(e => console.log(e))
        }




      })
    })
  }

  let getMessagefromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {

        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer' && connections[fromId].signalingState === "have-remote-offer"
          ) {
            console.log(connections[fromId].signalingState)
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() =>
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
              ).catch((e) => console.log(e))
            }).catch((e) => console.log(e))
          }
        }).catch((e) => console.log(e))

      }
    }
    if (
      signal.ice &&
      connections[fromId] &&
      connections[fromId].remoteDescription
    ) {

      connections[fromId]
        .addIceCandidate(
          new RTCIceCandidate(signal.ice)
        )
        .catch((e) => console.log(e))
    }

  }



  let getUserMedia = () => {
    console.log(video, audio)
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ audio: audio, video: video })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e))
    }
    else {
      try {
        let tracks = localVideoRef.current.refObject.getTracks()
        tracks.forEach(track => track.stop())
      }
      catch (e) { }
    }
  }

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(Track => Track.stop())
    } catch (e) { console.log(e) }


    window.localStream = stream
    localVideoRef.current.srcObject = stream

    // for (let id in connections) {
    //   if (id === socketIdRef.current) continue
    //   // connections[id].addStream(window.localStream)
    //   connections[id].createOffer().then((description) => {
    //     console.log(description)
    //     connections[id].setLocalDescription(description)
    //       .then(() => {
    //         socketRef.current.emit('signal', id, JSON.stringify({ "sdp": connections[id].localDescription }))
    //       }).catch((e) => console.log(e))
    //   })
    // }


    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false)
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())

      } catch (error) {
        console.log(error)
      }
    })
    // let blackSilence = (...args) => new MediaStream([black(...args), silence()])
    // window.localStream = blackSilence
    // localVideoRef.current.srcObject = blackSilence
    // getUserMedia()
  }








  let getpermissions = async () => {
    try {

      let videoPermission = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoPermission) {
        setVideoAvailable(true)
        console.log("video access available")
      } else {
        setVideoAvailable(false)
        console.log("video access not available")
      }
      let audiopermission = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (audiopermission) {
        setAudioAvailable(true)
        console.log("audio access available")
      } else {
        setAudioAvailable(false)
        console.log("audio access not available")
      }


      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false)
      }


      if (videoAvailable || audioAvailable) {
        let userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err)
    }



  }

  let connect = () => {
    getMedia()
  }

  return (
    <div>
      <h1>
        enter lobby
      </h1>
      <div>
        <input type="text" name="" id="" />
        <button onClick={connect}>enter</button>
        <br />
        <video ref={localVideoRef} autoPlay muted></video>
        <p>ONE</p>
      </div>

      <div>
        {videos.map((video) => {
          console.log("VIDEOS STATE:", videos)
          return (

            <div className="video" key={video.socketId}>
              <video

                data-socket={video.socketId}
                ref={ref => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
              ></video>
            </div>
          )
        })}
        <p>two</p>



      </div>

    </div>
  )

}
