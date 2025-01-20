import { useContext } from "react";
import { Stack } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { useState } from "react";

function getCalendarFormat(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.getHours()}:${date.getMinutes()}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.getHours()}:${date.getMinutes()}`;
    }
    
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

const ChatBox = () => {
    const {user} = useContext(AuthContext);
    const {currentChat, messages, isMessagesLoading, sendTextMessage} = useContext(ChatContext);
    const {recipientUser} = useFetchRecipientUser(currentChat, user);
    const [textMessage, setTextMessage] = useState("");
    
    if(!recipientUser)
        return(
            <p style={{textAlign: "center", width: "100%"}}>
                No conversation selected yet
            </p>
        );
    
    if(isMessagesLoading)
        return(
            <p style={{textAlign: "center", width: "100%"}}>
                Loading Chat
            </p>
        );

    return ( <>
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>{recipientUser?.name}</strong>
            </div>
        
            <Stack gap={3} className="messages">
                {messages && messages.map((messages, index) => 
                    <Stack key={index} className={`${messages?.senderId === user?._id ? "message self align-self-end flex-grow-0" : "message align-self-start flex-grow-0"}`}>
                        <span>{messages.text}</span>
                        <span className="message-footer">{getCalendarFormat(messages.createdAt)}</span>
                    </Stack>
                )}
            </Stack>

            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
            <input 
                type="text" 
                value={textMessage} 
                onChange={(e) => setTextMessage(e.target.value)} 
                style={{
                    fontFamily: 'nunito', 
                    borderColor: 'rgba(72,112,223,0.2)',
                    padding: '8px 12px',  
                    borderRadius: '10px',  
                    outline: 'none',      
                    width: '100%' 
                }} />

                <button className="send-btn" onClick={() => sendTextMessage(textMessage, user, currentChat._id,setTextMessage)}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    className="bi bi-send-fill" 
                    viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                    </svg>
                </button>
            </Stack>

        </Stack>
    </> );
};
 
export default ChatBox;
