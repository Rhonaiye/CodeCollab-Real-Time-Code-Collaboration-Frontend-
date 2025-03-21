import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

// Create socket connection outside component
const socket = io("http://localhost:2000");

const CodeCollab = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  const messagesEndRef = useRef(null);
  const outputRef = useRef(null);


  // Socket event handlers
  useEffect(() => {
    // Code events
    socket.on("loadCode", setCode);
    socket.on("codeChange", setCode);
    
    // User events
    socket.on("updateUsers", setUsers);
    socket.on("userTyping", (username) => {
      setTypingUser(`${username} is typing...`);
      const timer = setTimeout(() => setTypingUser(""), 2000);
      return () => clearTimeout(timer);
    });
    
    // Chat events
    socket.on("receiveGroupMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    
    // Room events
    socket.on("roomCreated", (createdRoomId) => {
      setRoomId(createdRoomId);
      socket.emit("joinRoom", { roomId: createdRoomId, username });
      setInRoom(true);
    });
    
    socket.on("roomError", (message) => {
      alert(message);
      setInRoom(false);
    });
    
    // Code execution events
    socket.on("CodeResult", (result) => {
      setCodeOutput(result.logs);
      setIsExecuting(false);
      setShowOutput(true);
    });

    return () => {
      socket.off("loadCode");
      socket.off("codeChange");
      socket.off("updateUsers");
      socket.off("userTyping");
      socket.off("receiveGroupMessage");
      socket.off("roomCreated");
      socket.off("roomError");
      socket.off("codeExecutionResult");
    };
  }, [username]);

  // Auto-scroll functions
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    outputRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [codeOutput]);

  // Helper functions
  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit("setUsername", username);
      setIsLoggedIn(true);
    }
  };

  const createRoom = () => socket.emit("createRoom");
  
  const joinRoom = () => {
    if (roomId.trim()) {
      socket.emit("joinRoom", { roomId, username });
      setInRoom(true);
    }
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue);
    socket.emit("editCode", { roomId, newCode: newValue });
    socket.emit("typing", username);
  };

  const sendMessage = (e) => {
    e?.preventDefault();
    if (newMessage.trim()) {
      const messageData = { 
        message: newMessage, 
        sender: username, 
        roomId,
      };
      
      setMessages(prev => [...prev, messageData]);
      socket.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId, username });
    setInRoom(false);
    setMessages([]);
    setRoomId("");
    setCodeOutput("");
    setShowOutput(false);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleOutput = () => setShowOutput(!showOutput);
  const executeCode = () => {
    setIsExecuting(true);
    socket.emit("runCode", { roomId });
  };
  const clearOutput = () => setCodeOutput("");

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center p-4">
        <div className="p-8 bg-gray-800 text-white rounded-2xl shadow-xl text-center w-full max-w-md">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-600">CodeCollab</h2>
          <p className="text-gray-300 mt-2">Real-time collaborative coding</p>
          
          <form onSubmit={handleSetUsername} className="space-y-5 mt-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-left mb-2 text-gray-300">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <button type="submit" className="w-full p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Room selection screen
  if (!inRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center p-4">
        <div className="p-8 bg-gray-800 text-white rounded-2xl shadow-xl text-center w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Join or Create a Room</h2>
          
          <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-800 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium">{username}</span>
          </div>
          
          <button onClick={createRoom} className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 mb-4">
            Create New Room
          </button>
          
          <div className="relative py-2 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-800 text-gray-300 text-sm">Or join existing room</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-grow p-3 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-violet-500"
            />
            <button 
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main collaboration screen
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">CodeCollab</h1>
            {/* Mobile-optimized room ID display with horizontal scroll */}
            <div className="max-sm:ml-[10%]  ml-6 px-3 py-1 max-sm:w-[26vh] bg-gray-700 rounded-lg justify-self-end flex items-center overflow-auto md:overflow-visible hide-scrollbar">
              <span className="text-sm mr-2 whitespace-nowrap overflow-x-auto">Room: {roomId}</span>
              <button onClick={copyRoomId} className="text-xs p-1 hover:bg-gray-600 rounded whitespace-nowrap">
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={toggleChat} className="p-2 bg-gray-700 rounded-lg text-sm">
              {isChatOpen ? "Hide Chat" : "Show Chat"}
            </button>
            <button onClick={leaveRoom} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
              Leave
            </button>
          </div>
        </div>
      </div>
      
      {/* Active Users */}
      <div className="container mx-auto px-4 pt-4 pb-1">
        <div className="bg-gray-800 rounded-lg shadow-md px-3 py-2 inline-flex items-center max-w-full overflow-hidden">
          <span className="font-medium text-sm mr-2 whitespace-nowrap">Active users:</span>
          <div className="flex flex-wrap gap-1 overflow-x-auto hide-scrollbar">
            {users.length > 0 ? users.map((user, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 bg-violet-900 text-violet-200 rounded-full text-xs whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                {user}
              </span>
            )) : (
              <span className="text-gray-500 text-xs italic">No users connected</span>
            )}
          </div>
        </div>
      </div>
        
      {/* Main content */}
      <div className="container mx-auto px-4 pt-2 pb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Code editor */}
          <div className={`${isChatOpen ? 'md:w-2/3' : 'w-full'} transition-all duration-300 w-full`}>
            <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-medium whitespace-nowrap">Code Editor</span>
                  {typingUser && <span className="text-sm text-gray-300 italic truncate">{typingUser}</span>}
                </div>
                <button
                  onClick={executeCode}
                  disabled={isExecuting || !code.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  {isExecuting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Run
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run Code
                    </>
                  )}
                </button>
              </div>
              <Editor
                height="50vh"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 14,
                }}
              />
            </div>
            
            {/* Code execution output */}
            {showOutput && (
              <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden mt-4">
                <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center border-b border-gray-700">
                  <span className="font-medium">Output</span>
                  <div className="flex gap-2">
                    <button onClick={clearOutput} className="text-sm hover:bg-gray-700 p-1 rounded">Clear</button>
                    <button onClick={toggleOutput} className="text-sm hover:bg-gray-700 p-1 rounded">Hide</button>
                  </div>
                </div>
                <div className="p-4 bg-black text-white font-mono text-sm max-h-64 overflow-y-auto hide-scrollbar rounded-b-xl">
                  {codeOutput ? (
                    <pre className="whitespace-pre-wrap break-words">{codeOutput}</pre>
                  ) : (
                    <div className="text-gray-500 italic">No output yet. Run your code to see results.</div>
                  )}
                  <div ref={outputRef} />
                </div>
              </div>
            )}
            
            {/* Toggle output button (when output is hidden) */}
            {!showOutput && codeOutput && (
              <button 
                onClick={toggleOutput} 
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg self-start flex items-center gap-2 mt-4"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show Output
              </button>
            )}
          </div>
          
          {/* Chat panel - Fixed to prevent overflow issues */}
          {isChatOpen && (
            <div className="md:w-1/3 w-full">
              <div className="bg-gray-800 rounded-xl shadow-md flex flex-col h-full">
                <div className="px-4 py-3 bg-gray-800 text-white font-medium flex justify-between items-center border-b border-gray-700">
                  <div className="flex items-center">
                    <span>Chat</span>
                    <span className="ml-2 bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {messages.length}
                    </span>
                  </div>
                  <button onClick={toggleChat} className="text-sm hover:bg-gray-700 p-1 rounded">
                    Hide
                  </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-64 bg-gray-800 hide-scrollbar">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`${msg.sender === username ? 
                          'ml-auto bg-violet-900 text-white' : 
                          'mr-auto bg-gray-700 text-white'}
                          rounded-xl p-3 shadow-sm max-w-xs md:max-w-sm`}
                      >
                        <div className="font-medium text-xs mb-1">{msg.sender}</div>
                        <div className="break-words">{msg.message}</div>
                        {/* Removed the timestamp display that was here */}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={sendMessage} className="p-4 flex gap-2 border-t border-gray-700">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow p-3 bg-gray-700 text-white rounded-xl focus:ring-2 focus:ring-violet-500"
                  />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl">
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeCollab;