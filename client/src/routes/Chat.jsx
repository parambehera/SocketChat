import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Send,
  MessageCircle,
  Moon,
  Sun,
  Copy,
  Check,
  Users,
  Menu as MenuIcon,
} from "lucide-react";
import { Menu } from "@headlessui/react";

const Chat = () => {
  const { userPhone, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [chat, setChat] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const _socket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(_socket);

    _socket.on("connect", () => {
      setConnectionStatus("Connected");
      _socket.emit("register-phone", userPhone);
    });

    _socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    _socket.on("receive-message", ({ from, msg, timestamp }) => {
      setChat((prev) => [...prev, { from, msg, timestamp }]);
    });

    return () => {
      _socket.disconnect();
    };
  }, [userPhone]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const sendMessage = () => {
    if(!recipientPhone){
 toast.error("Please enter a recipient phone number.");
      return;
    }
    if (message.trim() && recipientPhone.trim() && socket) {
      socket.emit("private-message", {
        from: userPhone,
        to: recipientPhone,
        msg: message,
      });
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        darkMode ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h1 className="font-bold text-base text-gray-800 dark:text-white">Socket Chat</h1>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-300">Phone: {userPhone}</span>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Copy Phone"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === "Connected" ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-500 dark:text-gray-300">{connectionStatus}</span>
          </div>
          <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
          <button onClick={handleLogout} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md">Logout</button>
        </div>

        <Menu as="div" className="sm:hidden relative">
          <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none">
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-2 space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-300 px-2">Phone: {userPhone}</div>
              <Menu.Item>
                {() => (
                  <button onClick={copyToClipboard} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copy Phone
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {() => (
                  <button onClick={toggleDarkMode} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />} Toggle Theme
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {() => (
                  <button onClick={handleLogout} className="w-full px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Logout</button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </header>

      {/* Recipient Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Enter recipient phone number"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {chat.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start a conversation!</p>
            <p className="text-xs mt-2">Your phone: {userPhone}</p>
          </div>
        ) : (
          chat.map((data, i) => (
            <div key={i} className={`flex ${data.from === userPhone ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${data.from === userPhone ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"}`}>
                <div className="text-xs mb-1 opacity-75">
                  {data.from === userPhone ? "You" : data.from}
                  {data.timestamp && <span className="ml-2">{data.timestamp}</span>}
                </div>
                <div className="break-words">{data.msg}</div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !recipientPhone.trim() || !socket}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg shadow transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
