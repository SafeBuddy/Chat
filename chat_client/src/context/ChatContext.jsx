import { createContext, useState, useEffect } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { useCallback } from "react";
import { io } from "socket.io-client";




const validateMsg = async (participants, messages) => {
    const names = [
        await getRequest(`${baseUrl}/users/find/${participants[0]}`).then(({name }) => name ),
        await getRequest(`${baseUrl}/users/find/${participants?.[1]}`).then(({name }) => name )
    ]    

    const messages_to_LLM = messages.map(({ senderId, text}) => {
        if (senderId == participants[0]) return `${names[0]}: ${text}`
        return `${names[1]}: ${text}`
    }).join(',')

        console.log(names)
        try{
            const response = await fetch('http://localhost:7000/check_for_predator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participants: names, messages: messages_to_LLM }),
                mode: "cors",
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const responseData = await response.json();
            console.log("LLM Response:", responseData);
        }catch(error){
            console.log("error sending post request to LLM")
        }
}



export const ChatContext = createContext();
export const ChatContextProvider = ({children, user}) =>{
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessangeError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() =>{
        if(socket === null)
            return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlinUser", (res)=>{
            setOnlineUsers(res);
        });

        return() => {
            socket.off("getOnlineUsers");
        };
    },[socket]);

    useEffect(() =>{
        if(socket === null)
            return;

        const recipientId = currentChat?.members.find((id) => id !== user?._id);
        socket.emit("sendMessage", {...newMessage,recipientId});        
    },[newMessage]);


    useEffect(() =>{
        if(socket === null)
            return;

        socket.on("getMessage", res => {
            if(currentChat?._id !== res.chatId)
                return;
            setMessages((prev) => [...prev,res]);
        });

        return () =>{
            socket.off("getMessage");
        };
    },[socket, currentChat]);

    useEffect(() => {

        const getUsers = async() => {
            const response = await getRequest(`${baseUrl}/users`);

            if(response.error)
                return console.log("Error fetching users", response);

            const pChats = response.filter((u) =>{ 
                let isChatCreated = false;
                if(user?._id === u._id)
                    return false;

                if(userChats){
                    isChatCreated = userChats?.some((chat) =>{
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    }); 
                }

                return !isChatCreated;
            });

            setPotentialChats(pChats);    
        };

        getUsers();
    },[userChats]);

    useEffect(() => {
        const getUserChats = async() => {
            
            if(user?._id){
                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user._id}`);
                setIsUserChatsLoading(false);

                if(response.error){
                    return setUserChatsError(response);
                }

                setUserChats(response);
            }
        }

        getUserChats();
    }, [user]);


    useEffect(() => {
        const getMessages = async() => {
            
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat._id}`);
            setIsMessagesLoading(false);

            if(response.error){
                return setMessagesError(response);
            }

            setMessages(response);
        }

        getMessages();
    }, [currentChat]); 


    useEffect(() => {
        console.log(currentChat);
        
        const participants = currentChat?.members
        validateMsg(participants, messages);
    }, [messages]);

    const sendTextMessage = useCallback(async(textMessage, sender, currentChatId, setTextMessage) => {
        if(!textMessage)
            return console.log("You must type something");
        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId:currentChatId,
            senderId: sender,
            text: textMessage
        }));

        if(response.error){
            return setSendTextMessangeError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev,response]);
        setTextMessage("");

    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    },[]);

    const createChat = useCallback(async(firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId,
            secondId,
        }));

        if(response.error){
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => [...prev,response]);
       
    },[]);

    return (
        <ChatContext.Provider value = {{
            userChats,
            isUserChatsLoading,
            userChatsError,
            potentialChats,
            createChat,
            updateCurrentChat,
            currentChat,
            messages,
            isMessagesLoading,
            messagesError,
            sendTextMessage,
            onlineUsers,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

