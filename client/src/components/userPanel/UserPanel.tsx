import { AvatarUpload } from "./AvatarUpload";


const mokAvatar = {
    userId: 'dream',
    currentAvatarUrl: 'https://placeholder.com',
    onUploadSuccess: (url: String) => {
        console.log("🔥 Success! image link:", url);
    alert("Success!.");
    }
}

const UserPanel = () => {
    return (
        <div className="flex flex-col w-fit">
            <AvatarUpload {...mokAvatar}/>
        </div>
    );
}

export default UserPanel;
