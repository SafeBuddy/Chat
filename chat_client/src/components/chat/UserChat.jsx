import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import default_profile_pic from "../../assets/default_profile_pic.svg"
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

const UserChat = ({chat, user}) => {
    const {recipientUser} = useFetchRecipientUser(chat, user);
    const {onlineUsers} = useContext(ChatContext);

    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);
    
    return ( <>
        <Stack direction = "horizontal" gap={3} className = "user-card align-items-center p-2 justify-content-between" role="button">
            <div className="d-flex">
                <div className="me-2">
                    <img src={default_profile_pic} height="35px" />
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">TextMessage</div>
                </div>
            </div>

            <div className="d-flex flex-column align-items-end">
                <div className="date">
                    12/12/2022
                </div> 
                <div className="this-user-notifications">2</div>
                <div className={isOnline ? "user-online" : ""}></div>
            </div>
        </Stack>
    </> );
};
 
export default UserChat;
